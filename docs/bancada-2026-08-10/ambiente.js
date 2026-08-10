// Prova de fotografia de ambiente: pega nas fotos REAIS que já existem na
// galeria — peças verdadeiras, em uso, ao ar livre — e leva-as para a
// atmosfera do site.
//
// Regra que sigo (docs/marca/05-fotografia.md): para ambiente o que manda é a
// "coerência de atmosfera", luz de fim de dia e sombra funda, porque o fundo do
// site é escuro. Azul fica fora do enquadramento — daí o corte do céu.
// O metal tem de continuar prata: o aquecimento é dosado para o verde da
// vegetação e não para a peça.
const sharp = require('/home/ggedeveloper/gartnshine-3/gonzagas_node/node_modules/sharp');
const path = require('path');
const S = __dirname;
const G = '/home/ggedeveloper/gartnshine-3/gonzagas_node/public/media/gallery';
const lista = require('./galeria-lista.json');

/** Vinheta + queda de luz em baixo, para a foto assentar no fundo escuro. */
const veu = (w, h) => Buffer.from(`<svg width="${w}" height="${h}">
  <defs>
    <radialGradient id="v" cx="50%" cy="45%" r="72%">
      <stop offset="45%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#12100E" stop-opacity="0.55"/>
    </radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="60%" stop-color="#12100E" stop-opacity="0"/>
      <stop offset="100%" stop-color="#12100E" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
</svg>`);

async function tratar(indice, saida, corte) {
  const origem = path.join(G, lista[indice]);
  const meta = await sharp(origem).rotate().metadata();
  let img = sharp(origem).rotate();
  if (corte) {
    img = img.extract({
      left: Math.round(corte.left * meta.width), top: Math.round(corte.top * meta.height),
      width: Math.round(corte.width * meta.width), height: Math.round(corte.height * meta.height),
    });
  }
  const buf = await img
    // O verde de sol a pino é o que mais destoa do site. Baixa-se a saturação
    // e leva-se o conjunto para o quente, sem chegar ao dourado.
    .modulate({ saturation: 0.62, brightness: 0.97 })
    .linear([1.06, 1.0, 0.92], [-6, -4, -2])
    .gamma(1.08)
    .toBuffer();

  // Redimensionar ANTES de compor: no sharp o resize corre sempre primeiro no
  // pipeline, e um véu do tamanho original ficaria maior do que a imagem já
  // reduzida — era o que rebentava.
  const reduzida = await sharp(buf).resize(1400, 1400, { fit: 'inside' }).toBuffer();
  const m2 = await sharp(reduzida).metadata();
  const veuPng = await sharp(veu(m2.width, m2.height))
    .resize(m2.width, m2.height, { fit: 'fill' }).png().toBuffer();
  return sharp(reduzida)
    .composite([{ input: veuPng }])
    .jpeg({ quality: 90 })
    .toFile(path.join(S, saida));
}

(async () => {
  // Cortes escolhidos a olho: tiram o céu azul (cor proibida) e as pessoas ao
  // fundo, e aproximam a peça.
  await tratar(41, 'amb-pulseira-1.jpg', { left: 0.00, top: 0.18, width: 0.72, height: 0.72 });
  await tratar(18, 'amb-pulseira-2.jpg', { left: 0.02, top: 0.28, width: 0.96, height: 0.62 });
  await tratar(10, 'amb-brincos-1.jpg', null);
  await tratar(0, 'amb-brincos-2.jpg', { left: 0.02, top: 0.42, width: 0.70, height: 0.56 });
  console.log('4 imagens de ambiente tratadas');
})();
