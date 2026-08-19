/**
 * Importa para a galeria pública a selecção de fotografia de ambiente escolhida
 * em `temporario-nova-media/GALERIA-SELECAO.json`.
 *
 * Faz três coisas, e é seguro correr outra vez:
 *   1. redimensiona cada original para largura de web (1600 px, JPEG 84) e
 *      grava-o em `public/media/gallery/` com um nome falado — o nome do
 *      ficheiro é texto indexável, por isso descreve a peça e o cenário;
 *   2. escreve a legenda no EXIF (`ImageDescription`) e a origem em
 *      `XPComment`, para a informação viajar com a imagem e não com um JSON;
 *   3. insere a linha em `gallery_items` com a legenda e a ordem.
 *
 * Idempotente: se o ficheiro já existe salta a conversão, e a linha só entra se
 * ainda não houver nenhuma com aquele nome. Nada é apagado.
 *
 * Uso:  node scripts/galeria/importar-selecao.js [--seco]
 *       --seco  mostra o que faria, sem escrever ficheiro nem base de dados.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { pool } = require('../../config/database');

const RAIZ_MEDIA = path.join(__dirname, '../../../temporario-nova-media');
const ORIGEM = path.join(RAIZ_MEDIA, 'Eventos');
const DESTINO = path.join(__dirname, '../../public/media/gallery');
const LISTA = path.join(RAIZ_MEDIA, 'GALERIA-SELECAO.json');

const LARGURA_MAX = 1600;
const QUALIDADE = 84;
const seco = process.argv.includes('--seco');

/** Nome de ficheiro falado, a partir da legenda. Sem acentos, sem espaços. */
function slug(texto) {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

async function main() {
  const sel = JSON.parse(fs.readFileSync(LISTA, 'utf8'));
  fs.mkdirSync(DESTINO, { recursive: true });

  const [[{ mx }]] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS mx FROM gallery_items');
  const [jaLa] = await pool.query('SELECT filename FROM gallery_items');
  const existentes = new Set(jaLa.map((r) => r.filename));

  let ordem = mx;
  const usados = new Set(fs.readdirSync(DESTINO));
  const feitos = [];

  for (const item of sel) {
    // nome único: se a legenda colidir, desempata pelo número de ordem
    let nome = `${slug(item.legenda)}.jpg`;
    if (usados.has(nome) && !nome.startsWith(String(item.ordem))) {
      nome = `${slug(item.legenda)}-${String(item.ordem).padStart(2, '0')}.jpg`;
    }
    usados.add(nome);

    const de = path.join(ORIGEM, item.origem.replace(/^Eventos\//, ''));
    const para = path.join(DESTINO, nome);

    if (!fs.existsSync(de)) {
      console.error(`  falta o original: ${item.origem}`);
      continue;
    }

    if (!fs.existsSync(para)) {
      if (!seco) {
        const buf = await sharp(de)
          .rotate() // aplica a orientação do EXIF antes de a deitar fora
          .resize({ width: LARGURA_MAX, height: LARGURA_MAX, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: QUALIDADE, mozjpeg: true })
          .withMetadata({
            exif: {
              IFD0: {
                ImageDescription: item.legenda,
                XPComment: `origem: ${item.origem}`,
                Copyright: "Gonzaga's Art & Shine",
              },
            },
          })
          .toBuffer();
        fs.writeFileSync(para, buf);
      }
      feitos.push({ nome, item, novo: true });
    } else {
      feitos.push({ nome, item, novo: false });
    }

    if (!existentes.has(nome)) {
      ordem += 1;
      if (!seco) {
        await pool.query(
          'INSERT INTO gallery_items (filename, caption, sort_order, is_active) VALUES (?, ?, ?, 1)',
          [nome, item.legenda, ordem]
        );
      }
      feitos[feitos.length - 1].inserido = ordem;
    }
  }

  const novos = feitos.filter((f) => f.novo).length;
  const inseridos = feitos.filter((f) => f.inserido).length;
  const mb = feitos.reduce((s, f) => s + (fs.existsSync(path.join(DESTINO, f.nome)) ? fs.statSync(path.join(DESTINO, f.nome)).size : 0), 0) / 1e6;

  for (const f of feitos) {
    console.log(`${f.inserido ? String(f.inserido).padStart(3) : '  ·'}  ${f.nome}`);
  }
  console.log(`\n${feitos.length} da lista · ${novos} ficheiros convertidos · ${inseridos} linhas novas · ${mb.toFixed(1)} MB na galeria`);
  if (seco) console.log('(passagem a seco — nada foi escrito)');

  // `config/database.js` mantém um health check com setInterval, que nunca deixa
  // um script terminar sozinho. Fecha-se a piscina e sai-se à mão — se deixarmos
  // o SIGTERM tratar disto, ele chama `pool.end()` uma segunda vez e rebenta.
  await pool.end();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
