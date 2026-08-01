/**
 * Recorte e geração das imagens de categoria.
 *
 * Uma categoria usa a mesma fotografia em dois sítios com proporções
 * diferentes — a faixa da página (16:9) e o cartão da loja (4:5). Antes o
 * admin só conseguia apontar para um ficheiro e o browser cortava-o com
 * `object-fit: cover`, ou seja, sempre pelo centro: uma peça fotografada em
 * cima ou ao canto ficava fora do enquadramento nos dois sítios.
 *
 * Aqui o recorte é decidido no admin e aplicado ao ficheiro. Vantagens sobre
 * cortar no browser:
 *   - o enquadramento é o que se escolheu, não o centro geométrico;
 *   - o ficheiro servido tem o tamanho certo (uma hero de 6000px deixa de ser
 *     descarregada para aparecer a 1600);
 *   - gera-se WebP ao lado do JPEG.
 *
 * O ORIGINAL nunca é modificado — só lido.
 */

const fs = require('fs').promises;
const path = require('path');
const { Jimp } = require('jimp');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  // O alojamento pode não ter binários nativos; o Jimp é puro JS.
  sharp = null;
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CATEGORIES_DIR = path.join(PUBLIC_DIR, 'media', 'categories');

/**
 * Saídas por tipo de imagem.
 * `ratio` tem de acompanhar --ratio-hero / --ratio-tile em design-system.css:
 * se divergirem, o browser volta a cortar por cima do nosso recorte.
 */
const TIPOS = {
  hero: {
    ratio: 16 / 9,
    larguras: [1920, 1280, 800],
    quality: 82,
    // A hero é fundo atrás de texto: nunca precisa de ser nítida ao pixel.
    label: 'faixa da página (16:9)'
  },
  card: {
    ratio: 4 / 5,
    larguras: [800, 400],
    quality: 85,
    label: 'cartão da loja (4:5)'
  }
};

async function garantirPasta() {
  await fs.mkdir(CATEGORIES_DIR, { recursive: true });
}

/** Caminho absoluto no disco a partir de um caminho público (/media/...). */
function absolutoDePublico(caminhoPublico) {
  const limpo = String(caminhoPublico || '').split('?')[0].replace(/^\/+/, '');
  const abs = path.join(PUBLIC_DIR, limpo);
  // Impede que um valor manipulado saia de public/ (path traversal).
  if (!abs.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error('Caminho de imagem fora de public/.');
  }
  return abs;
}

/** Dimensões do original, para validar o rectângulo de recorte. */
async function dimensoes(absPath) {
  if (sharp) {
    try {
      const meta = await sharp(absPath, { failOnError: false }).metadata();
      if (meta.width && meta.height) return { width: meta.width, height: meta.height };
    } catch (e) {
      // cai para o Jimp
    }
  }
  const img = await Jimp.read(absPath);
  return { width: img.bitmap.width, height: img.bitmap.height };
}

/**
 * Normaliza o rectângulo vindo do editor: inteiros, dentro da imagem e
 * nunca de área nula. Um recorte inválido faz `sharp.extract()` atirar, o que
 * aqui apareceria como "falha ao gravar" sem explicação nenhuma.
 */
function normalizarRecorte(crop, orig) {
  if (!crop) return null;
  let x = Math.round(Number(crop.x));
  let y = Math.round(Number(crop.y));
  let w = Math.round(Number(crop.w));
  let h = Math.round(Number(crop.h));
  if (![x, y, w, h].every(Number.isFinite)) return null;

  x = Math.max(0, Math.min(x, orig.width - 1));
  y = Math.max(0, Math.min(y, orig.height - 1));
  w = Math.max(1, Math.min(w, orig.width - x));
  h = Math.max(1, Math.min(h, orig.height - y));
  return { x, y, w, h };
}

/** Recorte centrado com a proporção pedida — usado quando não há escolha do admin. */
function recorteCentrado(orig, ratio) {
  let w = orig.width;
  let h = Math.round(w / ratio);
  if (h > orig.height) {
    h = orig.height;
    w = Math.round(h * ratio);
  }
  return {
    x: Math.round((orig.width - w) / 2),
    y: Math.round((orig.height - h) / 2),
    w,
    h
  };
}

async function gerarComSharp(absOrigem, recorte, largura, altura, quality, destinoBase) {
  const gerados = [];
  const base = () => sharp(absOrigem, { failOnError: false })
    .rotate() // respeita a orientação EXIF antes de recortar
    .extract({ left: recorte.x, top: recorte.y, width: recorte.w, height: recorte.h })
    .resize(largura, altura, { fit: 'cover', withoutEnlargement: false });

  const jpg = await base().jpeg({ quality, mozjpeg: true }).toBuffer();
  await fs.writeFile(`${destinoBase}.jpg`, jpg);
  gerados.push(`${path.basename(destinoBase)}.jpg`);

  const webp = await base().webp({ quality }).toBuffer();
  await fs.writeFile(`${destinoBase}.webp`, webp);
  gerados.push(`${path.basename(destinoBase)}.webp`);

  return gerados;
}

async function gerarComJimp(absOrigem, recorte, largura, altura, quality, destinoBase) {
  const img = await Jimp.read(absOrigem);
  img.crop({ x: recorte.x, y: recorte.y, w: recorte.w, h: recorte.h });
  img.resize({ w: largura, h: altura });
  const buf = await img.getBuffer('image/jpeg', { quality });
  await fs.writeFile(`${destinoBase}.jpg`, buf);
  // Sem WebP: não há encoder fiável em puro JS.
  return [`${path.basename(destinoBase)}.jpg`];
}

/**
 * Gera as variantes de uma imagem de categoria.
 *
 * @param {object} opts
 * @param {'hero'|'card'} opts.tipo
 * @param {string} opts.origemPublica  caminho público do original (/media/...)
 * @param {{x,y,w,h}|null} opts.crop   rectângulo em pixeis do original; null = centrado
 * @param {number|string} opts.familyId
 * @returns {Promise<{caminhoPublico: string, crop: object, gerados: string[]}>}
 */
async function processarImagemCategoria({ tipo, origemPublica, crop, familyId }) {
  const conf = TIPOS[tipo];
  if (!conf) throw new Error(`Tipo de imagem desconhecido: ${tipo}`);

  const absOrigem = absolutoDePublico(origemPublica);
  await fs.access(absOrigem);
  await garantirPasta();

  const orig = await dimensoes(absOrigem);
  const recorte = normalizarRecorte(crop, orig) || recorteCentrado(orig, conf.ratio);

  // O sufixo de tempo evita que o browser (e a Cloudflare) sirvam a versão
  // anterior depois de um reenquadramento — sem ele, mudar o recorte não se
  // via até alguém limpar a cache.
  const carimbo = Date.now();
  const gerados = [];
  let principal = null;

  for (const largura of conf.larguras) {
    const altura = Math.round(largura / conf.ratio);
    const nome = `cat-${familyId}-${tipo}-${largura}-${carimbo}`;
    const destinoBase = path.join(CATEGORIES_DIR, nome);

    let feitos;
    if (sharp) {
      try {
        feitos = await gerarComSharp(absOrigem, recorte, largura, altura, conf.quality, destinoBase);
      } catch (err) {
        console.warn('Sharp falhou no recorte de categoria, a usar Jimp:', err.message);
        feitos = await gerarComJimp(absOrigem, recorte, largura, altura, conf.quality, destinoBase);
      }
    } else {
      feitos = await gerarComJimp(absOrigem, recorte, largura, altura, conf.quality, destinoBase);
    }

    gerados.push(...feitos);
    // A maior é a que fica guardada na base de dados.
    if (!principal) principal = `/media/categories/${nome}.jpg`;
  }

  return { caminhoPublico: principal, crop: recorte, gerados };
}

/**
 * Apaga as variantes de um tipo para uma categoria. Tolerante a ficheiros
 * inexistentes — é usado antes de regerar e ao remover a imagem.
 */
async function limparVariantes(familyId, tipo) {
  try {
    const ficheiros = await fs.readdir(CATEGORIES_DIR);
    const prefixo = `cat-${familyId}-${tipo}-`;
    await Promise.all(
      ficheiros
        .filter((f) => f.startsWith(prefixo))
        .map((f) => fs.unlink(path.join(CATEGORIES_DIR, f)).catch(() => {}))
    );
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('Não foi possível limpar variantes da categoria:', err.message);
    }
  }
}

module.exports = {
  processarImagemCategoria,
  limparVariantes,
  dimensoes,
  absolutoDePublico,
  TIPOS
};
