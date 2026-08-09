#!/usr/bin/env node
/**
 * Cabeçalhos das categorias.
 *
 * O cabeçalho de uma categoria tem de mostrar aquilo que a categoria vende:
 * "Aneis - Prata" abre com anéis de prata, e não com uma fotografia qualquer
 * do catálogo cortada ao meio. Este script monta cada cabeçalho a partir de
 * peças reais dessa categoria, recortadas do fundo e pousadas sobre a paleta
 * TERRA (docs/marca/03-cor.md).
 *
 * Entrada:  cutouts/<REF>.webp — a peça já sem fundo, com alfa.
 *           Ver README.md para o passo de recorte (rembg).
 * Saída:    public/media/categories/cat-<id>-hero-1920.jpg
 *
 *   node scripts/category-headers/build.js            # todas
 *   node scripts/category-headers/build.js aneis-prata
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const CUTOUTS = process.env.CUTOUTS_DIR || path.join(__dirname, 'cutouts');
const OUT = path.join(ROOT, 'public', 'media', 'categories');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

/* Há duas telas: a faixa do cabeçalho e o cartão. Toda a montagem trabalha em
 * fracções da tela em vigor, por isso `W`/`H` são fixados no início de cada
 * composição em vez de andarem por todas as assinaturas. */
let W = manifest.canvas.width;
let H = manifest.canvas.height;
const usarTela = (t) => { W = t.width; H = t.height; };

// Paleta TERRA.
const PRETO = '#12100E';
const VERDE = '#3A4038';
const CASTANHO = '#6B5844';

/* O cabeçalho é recortado com `background-size: cover` numa caixa que vai de
 * 4.35:1 no desktop a 1.76:1 no telemóvel. Com a tela a 2.77:1 os dois cortes
 * deixam ver a mesma fatia central — 63 % da largura, 63 % da altura. É aí que
 * a composição tem de viver; o resto é sangria para os ecrãs largos. */
const SAFE = 0.635;

// Cada arranjo é uma constelação de lugares: x e y são o centro em fracções da
// tela, h é a altura da peça em fracção da altura. A peça mais importante do
// manifesto fica com o maior h, não com o primeiro lugar da lista.
const ARRANJOS = {
  1: [{ x: 0.30, y: 0.52, h: 0.58 }],  // sozinha, sai do centro: lá está o título
  2: [{ x: 0.26, y: 0.52, h: 0.54 }, { x: 0.74, y: 0.44, h: 0.34 }],
  3: [{ x: 0.20, y: 0.52, h: 0.52 }, { x: 0.50, y: 0.27, h: 0.20 }, { x: 0.80, y: 0.53, h: 0.42 }],
  4: [{ x: 0.10, y: 0.42, h: 0.26 }, { x: 0.28, y: 0.53, h: 0.52 }, { x: 0.50, y: 0.27, h: 0.20 }, { x: 0.80, y: 0.52, h: 0.46 }],
  5: [{ x: 0.08, y: 0.41, h: 0.24 }, { x: 0.24, y: 0.53, h: 0.50 }, { x: 0.50, y: 0.26, h: 0.18 }, { x: 0.76, y: 0.53, h: 0.54 }, { x: 0.93, y: 0.43, h: 0.30 }],
};

const svg = (s) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`);

/** Fundo: preto terra com um clarão morno em baixo, como luz rasante. */
function fundo() {
  return sharp(svg(`
    <defs>
      <radialGradient id="chao" cx="50%" cy="74%" r="80%">
        <stop offset="0%"   stop-color="${VERDE}"    stop-opacity="0.95"/>
        <stop offset="50%"  stop-color="${VERDE}"    stop-opacity="0.40"/>
        <stop offset="100%" stop-color="${VERDE}"    stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="brasa" cx="50%" cy="66%" r="52%">
        <stop offset="0%"   stop-color="${CASTANHO}" stop-opacity="0.78"/>
        <stop offset="60%"  stop-color="${CASTANHO}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${CASTANHO}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="topo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#000" stop-opacity="0.42"/>
        <stop offset="38%"  stop-color="#000" stop-opacity="0"/>
        <stop offset="82%"  stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.50"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="${PRETO}"/>
    <rect width="100%" height="100%" fill="url(#chao)"/>
    <rect width="100%" height="100%" fill="url(#brasa)"/>
    <rect width="100%" height="100%" fill="url(#topo)"/>
  `)).png();
}

/** Véu central: garante o contraste do título sem apagar as peças. */
function veu() {
  return sharp(svg(`
    <defs>
      <radialGradient id="v" cx="50%" cy="47%" r="58%">
        <stop offset="0%"   stop-color="${PRETO}" stop-opacity="0.28"/>
        <stop offset="55%"  stop-color="${PRETO}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="${PRETO}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="canto" cx="50%" cy="50%" r="74%">
        <stop offset="60%"  stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.48"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
    <rect width="100%" height="100%" fill="url(#canto)"/>
  `)).png();
}

/** Grão: tira o aspecto de degradê de computador. */
async function grao() {
  const n = 4;
  const w = Math.ceil(W / n), h = Math.ceil(H / n);
  const buf = Buffer.alloc(w * h * 4);
  let seed = 20260809;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < w * h; i++) {
    const v = 118 + Math.round((rnd() - 0.5) * 46);
    buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = v;
    buf[i * 4 + 3] = 26;
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .resize(W, H, { kernel: 'nearest' }).png().toBuffer();
}

/** Uma peça: sombra pousada por baixo, e a peça por cima, um pouco contida. */
async function peca(ref, slot) {
  // WebP com alfa em vez de PNG: os mesmos 92 recortes passam de 21 MB para
  // 4 MB, sem diferença visível depois do véu e do grão.
  const src = [`${ref}.webp`, `${ref}.png`].map(f => path.join(CUTOUTS, f)).find(fs.existsSync);
  if (!src) throw new Error(`falta o recorte ${ref} (.webp ou .png) em ${CUTOUTS}`);

  // Um fio enrolado e um anel maciço com a mesma altura não pesam o mesmo: o
  // fio é quase todo vazio e desaparece. Quem manda no tamanho é a tinta que a
  // peça tem, não a caixa que ocupa.
  const { data: al, info: ai } = await sharp(src).extractChannel('alpha')
    .resize(120, 120, { fit: 'inside' }).raw().toBuffer({ resolveWithObject: true });
  let tinta = 0;
  for (let p = 0; p < ai.width * ai.height; p++) if (al[p * ai.channels] > 96) tinta++;
  const cobertura = tinta / (ai.width * ai.height);
  const reforco = Math.min(1.5, Math.max(1, Math.sqrt(0.38 / Math.max(cobertura, 0.06))));

  const alvoH = Math.min(Math.round(slot.h * H * reforco), Math.round(H * 0.76));
  // A largura trava em 34 % da tela: com mais do que isto uma pulseira aberta
  // atravessa o corredor central e vai parar por trás do título.
  const alvoW = Math.min(Math.round(alvoH * 2.2), Math.round(W * 0.34));

  // Exposição igual para todas as peças. As fotografias vêm de sessões
  // diferentes e uma prata polida chega cá com o dobro do brilho de um latão
  // escurecido; sem isto, o cabeçalho tem uma peça a gritar e as outras mudas.
  const base = sharp(src).resize(alvoW, alvoH, { fit: 'inside', withoutEnlargement: false });
  const { data: px, info: pi } = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const luzes = [];
  for (let p = 0; p < pi.width * pi.height; p++) {
    if (px[p * 4 + 3] < 200) continue;
    luzes.push(0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2]);
  }
  luzes.sort((a, b) => a - b);
  const alto = luzes.length ? luzes[Math.floor(luzes.length * 0.99)] : 200;
  const ganho = Math.min(1.3, Math.max(0.62, 178 / Math.max(alto, 1)));

  const arte = await base
    .modulate({ brightness: 1.12 * ganho, saturation: 0.98 })
    .linear(1.18, -14)
    .png()
    .toBuffer();
  const { width: pw, height: ph } = await sharp(arte).metadata();

  // A sombra é a silhueta desfocada. Tem de ir para o alfa: um PNG cinzento
  // composto com dest-in é opaco e o que sai é um rectângulo preto.
  const desfoque = Math.max(8, Math.round(ph * 0.06));
  const margem = Math.round(desfoque * 1.6);
  const sombraW = pw + margem * 2, sombraH = ph + margem * 2;
  const { data: sil, info: si } = await sharp(arte).extractChannel('alpha')
    .extend({ top: margem, bottom: margem, left: margem, right: margem, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(desfoque).linear(0.55, 0)
    .raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(si.width * si.height * 4);
  for (let p = 0; p < si.width * si.height; p++) {
    rgba[p * 4] = 5; rgba[p * 4 + 1] = 4; rgba[p * 4 + 2] = 3;
    rgba[p * 4 + 3] = sil[p * si.channels];
  }
  const sombra = await sharp(rgba, { raw: { width: si.width, height: si.height, channels: 4 } }).png().toBuffer();

  const cx = Math.round(slot.x * W), cy = Math.round(slot.y * H);
  return [
    await colar(sombra, sombraW, sombraH, cx - Math.round(sombraW / 2) + Math.round(ph * 0.03), cy - Math.round(sombraH / 2) + Math.round(ph * 0.09)),
    await colar(arte, pw, ph, cx - Math.round(pw / 2), cy - Math.round(ph / 2)),
  ].filter(Boolean);
}

/** Cola no sítio, cortando o que sai da tela — as peças das pontas sangram. */
async function colar(buf, w, h, left, top) {
  const x0 = Math.max(0, left), y0 = Math.max(0, top);
  const x1 = Math.min(W, left + w), y1 = Math.min(H, top + h);
  if (x1 <= x0 || y1 <= y0) return null;
  if (x0 === left && y0 === top && x1 === left + w && y1 === top + h) return { input: buf, left, top };
  const recorte = await sharp(buf)
    .extract({ left: x0 - left, top: y0 - top, width: x1 - x0, height: y1 - y0 })
    .png().toBuffer();
  return { input: recorte, left: x0, top: y0 };
}

async function capa(slug, refs) {
  usarTela(manifest.canvas);
  const n = Math.min(refs.length, 5);
  const arranjo = ARRANJOS[n];
  if (!arranjo) throw new Error(`sem arranjo para ${n} peças (${slug})`);

  // Espelhar em metade das categorias: os cabeçalhos seguidos não podem ser
  // todos a mesma composição.
  const soma = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const espelho = soma % 2 === 1;
  const desvio = ((soma % 5) - 2) * 0.012;

  // A peça mais importante fica com o maior lugar.
  const ordem = arranjo.map((s, i) => i).sort((a, b) => arranjo[b].h - arranjo[a].h);
  const postos = new Array(n);
  ordem.forEach((slotIdx, rank) => { postos[slotIdx] = refs[rank]; });

  const camadas = [];
  for (let i = 0; i < n; i++) {
    const s = arranjo[i];
    camadas.push({
      ref: postos[i],
      slot: { x: espelho ? 1 - s.x : s.x, y: s.y + desvio, h: s.h },
    });
  }
  // As maiores por cima: é a que manda que fica à frente.
  camadas.sort((a, b) => a.slot.h - b.slot.h);

  const partes = [];
  for (const c of camadas) partes.push(...await peca(c.ref, c.slot));

  const base = await fundo().composite(partes).png().toBuffer();
  return sharp(base)
    .composite([{ input: await veu().toBuffer() }, { input: await grao(), blend: 'overlay' }])
    .png().toBuffer();
}

/* Cartão da homepage e da loja. Nada a ver com a faixa: mede 269×280 na
 * homepage, 261×196 na loja e 558×280 no lugar largo — de 0.96 a 1.99 de
 * proporção. A 1.38 os cortes extremos ainda deixam ver 70 % da imagem.
 *
 * O nome e a contagem ficam em baixo à esquerda nas duas superfícies, e as
 * duas já têm um véu forte a subir do fundo. Por isso aqui a peça sobe: vive
 * na metade de cima e o baixo fica livre para o texto. */
const ARRANJOS_CARTAO = {
  1: [{ x: 0.52, y: 0.38, h: 0.50 }],
  2: [{ x: 0.35, y: 0.35, h: 0.44 }, { x: 0.69, y: 0.47, h: 0.32 }],
};

/** Véu do cartão: quase nada em baixo, que é onde o CSS já carrega. */
function veuCartao() {
  return sharp(svg(`
    <defs>
      <radialGradient id="c" cx="50%" cy="50%" r="76%">
        <stop offset="55%"  stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#c)"/>
  `)).png();
}

async function cartao(slug, refs) {
  usarTela(manifest.canvasCartao);
  const n = Math.min(refs.length, 2);
  const arranjo = ARRANJOS_CARTAO[n];
  if (!arranjo) throw new Error(`sem arranjo de cartão para ${n} peças (${slug})`);

  const camadas = arranjo.map((s, i) => ({ ref: refs[i], slot: s }));
  camadas.sort((a, b) => a.slot.h - b.slot.h);

  const partes = [];
  for (const c of camadas) partes.push(...await peca(c.ref, c.slot));

  const base = await fundo().composite(partes).png().toBuffer();
  return sharp(base)
    .composite([{ input: await veuCartao().toBuffer() }, { input: await grao(), blend: 'overlay' }])
    .png().toBuffer();
}

async function gravarCartao(nome, buf) {
  fs.mkdirSync(OUT, { recursive: true });
  const largura = 1200;
  await sharp(buf)
    .resize(largura, Math.round((largura * H) / W), { fit: 'cover' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, `${nome}-card-${largura}.jpg`));
  return `/media/categories/${nome}-card-${largura}.jpg`;
}

/* Um só ficheiro por categoria. O cabeçalho é um `background-image` posto em
 * linha a partir da base de dados, portanto só há um URL para dar — variantes
 * por tamanho ficariam no disco sem ninguém as pedir. A 1920 e escuro, o JPEG
 * fica em ~75 kB, que serve o telemóvel sem se notar. */
async function gravar(id, buf) {
  fs.mkdirSync(OUT, { recursive: true });
  const largura = 1920;
  await sharp(buf)
    .resize(largura, Math.round((largura * H) / W), { fit: 'cover' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, `cat-${id}-hero-${largura}.jpg`));
  return `/media/categories/cat-${id}-hero-${largura}.jpg`;
}

(async () => {
  const pedido = process.argv.slice(2);
  const familias = require('./familias.json'); // slug -> id
  const alvos = Object.keys(manifest.familias).filter(s => !pedido.length || pedido.includes(s));

  const feitos = {};
  for (const slug of alvos) {
    const id = familias[slug];
    if (!id) { console.warn(`! ${slug}: sem id de família`); continue; }
    const buf = await capa(slug, manifest.familias[slug]);
    feitos[slug] = await gravar(id, buf);
    console.log(`${String(id).padStart(3)}  ${slug.padEnd(26)} ${manifest.familias[slug].length} peças`);
  }
  const cartoes = {};
  for (const [slug, refs] of Object.entries(manifest.cartoes || {})) {
    if (pedido.length && !pedido.includes(slug)) continue;
    const buf = await cartao(slug, refs);
    // `_todos` não é família nenhuma: é o cartão "Ver todos" da loja.
    const nome = slug === '_todos' ? 'todos' : `cat-${familias[slug]}`;
    if (slug !== '_todos' && !familias[slug]) { console.warn(`! cartão ${slug}: sem id`); continue; }
    cartoes[slug] = await gravarCartao(nome, buf);
    console.log(`     cartão ${slug.padEnd(21)} ${refs.length} peça${refs.length === 1 ? '' : 's'}`);
  }

  fs.writeFileSync(path.join(__dirname, 'resultado.json'), JSON.stringify({ capas: feitos, cartoes }, null, 2));
  console.log(`\n${Object.keys(feitos).length} capas e ${Object.keys(cartoes).length} cartões em public/media/categories/`);
})().catch(e => { console.error(e.message); process.exit(1); });
