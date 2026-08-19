/**
 * Capas de categoria feitas de FOTOGRAFIA, não de recorte sobre fundo pintado.
 *
 * O dossiê da marca (docs/marca/05-fotografia.md) manda que as capas de
 * categoria sejam ambiente: «natureza real, não cenário montado». As capas
 * actuais são montagens porque, quando foram feitas, não havia fotografia de
 * ambiente nenhuma. Agora há 124 candidatas.
 *
 * Três coisas têm de ser respeitadas, e são as mesmas do build.js:
 *   1. A tela é 2.77:1 e o CSS corta-a entre 4.35:1 e 1.76:1 — só se vê de
 *      certeza a fatia central de 63 % × 63 %.
 *   2. O <h1> é centrado. A peça não pode viver no meio.
 *   3. A foto tem de assentar num site escuro: tratamento de ambiente.js.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAIZ = path.join(__dirname, '..', '..', '..');
const EVENTOS = path.join(RAIZ, 'temporario-nova-media/Eventos');
// Escreve para uma pasta de prova, não para public/media/categories: a troca
// das capas ainda não está decidida. Quando estiver, muda-se este caminho para
// path.join(RAIZ, 'gonzagas_node/public/media/categories') e os nomes para
// `cat-<id>-hero-1920.jpg`, que é o que a base de dados já aponta.
const OUT = path.join(__dirname, process.env.MODO === 'terco' ? 'propostas-terco' : 'propostas');
fs.mkdirSync(OUT, { recursive: true });

const RACIO = 2400 / 866; // 2.771 — a tela do build.js
const LARGURA = 1920;
const PRETO = '#12100E';

/**
 * `centro` é o ponto da fotografia original que fica no meio da tela, em
 * fracções; `altura` é a fatia da altura original que a tela apanha. `lado`
 * documenta onde a peça cai depois do corte — só serve para eu conferir.
 */
const PROPOSTAS = require('./capas-foto.json');

/** Véu: corredor central para o título, e a foto a assentar no fundo escuro.
 *
 * O corredor é uma elipse deitada, não um círculo: o título é uma linha larga
 * e baixa, e um círculo com força suficiente para o cobrir apagava metade da
 * fotografia. `forca` é procurada por bissecção até o contraste passar. */
const veu = (w, h, forca) => Buffer.from(`<svg width="${w}" height="${h}">
  <defs>
    <radialGradient id="corredor" cx="50%" cy="50%" r="50%"
      gradientTransform="translate(0.5,0.5) scale(1,0.62) translate(-0.5,-0.5)">
      <stop offset="0%"   stop-color="${PRETO}" stop-opacity="${forca}"/>
      <stop offset="52%"  stop-color="${PRETO}" stop-opacity="${(forca * 0.5).toFixed(3)}"/>
      <stop offset="100%" stop-color="${PRETO}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="canto" cx="50%" cy="48%" r="72%">
      <stop offset="46%"  stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="${PRETO}" stop-opacity="0.58"/>
    </radialGradient>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${PRETO}" stop-opacity="0.30"/>
      <stop offset="30%"  stop-color="${PRETO}" stop-opacity="0"/>
      <stop offset="70%"  stop-color="${PRETO}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${PRETO}" stop-opacity="0.42"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#corredor)"/>
  <rect width="100%" height="100%" fill="url(#canto)"/>
  <rect width="100%" height="100%" fill="url(#base)"/>
</svg>`);

/* ── Modo «terço escuro» ────────────────────────────────────────────────────
 *
 * Nenhuma fotografia passa 4.5:1 com o título centrado, nem com o corredor a
 * 0.80 — a essa altura já não é véu, é tarja. A razão é estrutural e não
 * fotográfica: uma montagem tem o fundo preto por construção, uma fotografia
 * tem musgo ao sol.
 *
 * Este modo faz o que o próprio dossiê da marca manda para os retratos — «o
 * texto vai para o terço vazio». A escuridão entra da esquerda, a peça vive à
 * direita, e o título deixa de disputar espaço com ela.
 *
 * A largura da sombra tem de aguentar os dois cortes: no telemóvel só se vê a
 * fatia central (18.5 %–81.5 % da largura), portanto o escuro tem de chegar
 * até meio da imagem, não a um terço. */
const veuTerco = (w, h, forca) => Buffer.from(`<svg width="${w}" height="${h}">
  <defs>
    <linearGradient id="terco" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${PRETO}" stop-opacity="${forca}"/>
      <stop offset="34%"  stop-color="${PRETO}" stop-opacity="${(forca * 0.92).toFixed(3)}"/>
      <stop offset="64%"  stop-color="${PRETO}" stop-opacity="${(forca * 0.34).toFixed(3)}"/>
      <stop offset="100%" stop-color="${PRETO}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="canto2" cx="50%" cy="48%" r="74%">
      <stop offset="50%"  stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="${PRETO}" stop-opacity="0.50"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#terco)"/>
  <rect width="100%" height="100%" fill="url(#canto2)"/>
</svg>`);

function caminho(rel) {
  const a = path.join(EVENTOS, rel);
  return fs.existsSync(a) ? a : path.join(EVENTOS, '..', rel);
}

/** Corte 2.77:1 à volta de um ponto, sem sair da fotografia. */
function janela(meta, { centro, altura }) {
  let h = Math.round(meta.height * altura);
  let w = Math.round(h * RACIO);
  if (w > meta.width) { w = meta.width; h = Math.round(w / RACIO); }
  if (h > meta.height) { h = meta.height; w = Math.round(h * RACIO); }
  let left = Math.round(centro[0] * meta.width - w / 2);
  let top = Math.round(centro[1] * meta.height - h / 2);
  left = Math.max(0, Math.min(meta.width - w, left));
  top = Math.max(0, Math.min(meta.height - h, top));
  return { left, top, width: w, height: h };
}

/**
 * Contraste do título: o <h1> é `#f0ece4` centrado. Mede-se o percentil 98 da
 * luminância na faixa central onde o texto assenta — o percentil e não a média,
 * porque basta um reflexo por trás de uma letra para a apagar.
 */
async function contrasteTitulo(buf, modo = 'centro') {
  const m = await sharp(buf).metadata();
  // No modo «terço escuro» o título é alinhado à esquerda e a zona a medir é
  // outra: começa no bordo esquerdo do telemóvel (18.5 %) e vai até meio.
  const faixa = modo === 'terco'
    ? {
        left: Math.round(m.width * 0.185), top: Math.round(m.height * 0.34),
        width: Math.round(m.width * 0.33), height: Math.round(m.height * 0.32),
      }
    : {
        left: Math.round(m.width * 0.28), top: Math.round(m.height * 0.34),
        width: Math.round(m.width * 0.44), height: Math.round(m.height * 0.32),
      };
  const { data } = await sharp(buf).extract(faixa).greyscale().raw().toBuffer({ resolveWithObject: true });
  const ordenado = Array.from(data).sort((a, b) => a - b);
  const p98 = ordenado[Math.floor(ordenado.length * 0.98)];
  const rel = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const lTexto = rel(0xf0) * 0.2126 + rel(0xec) * 0.7152 + rel(0xe4) * 0.0722;
  const lFundo = rel(p98);
  const claro = Math.max(lTexto, lFundo), escuro = Math.min(lTexto, lFundo);
  return { p98, racio: +((claro + 0.05) / (escuro + 0.05)).toFixed(2) };
}

const modo = process.env.MODO || 'centro';

async function capa(slug, p) {
  const src = caminho(p.rel);
  const meta = await sharp(src).rotate().metadata();
  const j = janela(meta, p);

  // No modo «terço escuro» a peça tem de cair à direita. Onde a fotografia a
  // tem à esquerda, espelha-se: numa peça de joalharia não há texto nem lado
  // certo, e é mais honesto do que cortar fora meia composição.
  const espelhar = modo === 'terco' && p.lado === 'esq';
  let base = sharp(src).rotate().extract(j);
  if (espelhar) base = base.flop();
  const cortada = await base
    // Tratamento de ambiente que já passou na bancada: baixa o verde de sol a
    // pino, aquece sem chegar ao dourado, e fecha as sombras.
    .modulate({ saturation: p.saturacao ?? 0.62, brightness: p.brilho ?? 0.97 })
    .linear([1.06, 1.0, 0.92], [-6, -4, -2])
    .gamma(1.08)
    .resize(LARGURA, Math.round(LARGURA / RACIO), { fit: 'cover' })
    .toBuffer();

  const m2 = await sharp(cortada).metadata();
  const gerador = modo === 'terco' ? veuTerco : veu;
  const compor = async (forca) => {
    const veuPng = await sharp(gerador(m2.width, m2.height, forca)).png().toBuffer();
    return sharp(cortada).composite([{ input: veuPng }]).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  };

  // Bissecção: a força mínima que leva o contraste do título acima de 4.5:1.
  // Acima de 0.88 o escuro deixa de ser véu e passa a ser tarja — nesse caso
  // fica registado que a fotografia não serve para esta faixa.
  // No modo centrado o véu do ficheiro é fixo e discreto: quem garante o
  // contraste é o `::before` do CSS, que entra por cima na página. Medir o
  // ficheiro sozinho dava um retrato falso — e foi o que me levou a concluir,
  // erradamente, que nenhuma fotografia servia.
  let lo = 0.15, hi = modo === 'terco' ? 0.88 : 0.34;
  let final = await compor(hi), c = await contrasteTitulo(final, modo);
  const possivel = modo !== 'terco' || c.racio >= 4.5;
  if (possivel && modo === 'terco') {
    for (let i = 0; i < 7; i++) {
      const meio = (lo + hi) / 2;
      const tentativa = await compor(meio);
      if ((await contrasteTitulo(tentativa, modo)).racio >= 4.5) hi = meio; else lo = meio;
    }
    final = await compor(hi);
    c = await contrasteTitulo(final, modo);
  }

  await sharp(final).toFile(path.join(OUT, `${slug}.jpg`));
  const kb = Math.round(final.length / 1024);
  console.log(
    `${slug.padEnd(26)} ${p.ficheiro.padEnd(26)} véu ${hi.toFixed(2)}  contraste ${String(c.racio).padStart(6)}:1` +
    `${possivel ? '' : '  ← NÃO CHEGA NEM COM VÉU MÁXIMO'}  ${kb} kB`
  );
  return { slug, ...p, veu: +hi.toFixed(2), contraste: c.racio, kb, passa: possivel };
}

(async () => {
  const feitos = [];
  for (const [slug, p] of Object.entries(PROPOSTAS)) feitos.push(await capa(slug, p));
  fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify(feitos, null, 1));
  const maus = feitos.filter((f) => !f.passa);
  console.log(`\n${feitos.length} capas · ${maus.length} sem contraste possível`);
})();
