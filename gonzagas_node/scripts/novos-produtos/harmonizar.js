#!/usr/bin/env node
/**
 * Harmoniza as fotografias de um lote segundo docs/marca/05-fotografia.md.
 *
 * O que faz — e só isto:
 *   1. **Enquadramento 1:1 no ficheiro.** O documento é explícito: a proporção
 *      corta-se no ficheiro, não no CSS. As fotos vêm 3:4 e a peça ocupa um
 *      terço do enquadramento; ficam quadradas com a peça a ~74 % (a regra pede
 *      70–80 %) e margem mínima de 10 %.
 *   2. **Balanço de brancos.** A cartolina é a mesma em todas as fotos, mas a
 *      luz não: umas puxam ao lilás, outras ao verde. Mede-se a cartolina à
 *      volta da peça e neutraliza-se, o que torna a cor da peça MAIS verdadeira,
 *      não menos.
 *   3. **Exposição igualada.** A cartolina fica com a mesma claridade em todas,
 *      para que um anel a seguir a outro pareça a mesma sessão.
 *
 * O que NÃO faz, por ordem expressa do documento: filtros, viragem de cor,
 * recorte a caneta, fundo substituído. "A prata é acinzentada e o latão é
 * amarelado — é o que são."
 *
 *   node scripts/novos-produtos/harmonizar.js --simular
 *   node scripts/novos-produtos/harmonizar.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { processProductImage } = require('../../utils/productImageProcessor');

const ROOT = path.join(__dirname, '..', '..');
const ORIGEM = '/home/ggedeveloper/gartnshine-3/temporario-novo-stocks/2026-07-FIA-Stocks';
const DESTINO = path.join(ROOT, 'public', 'media', 'products');
const SIMULAR = process.argv.includes('--simular');

const OCUPACAO = 0.74;   // fracção do lado que a peça deve ocupar
const LADO = 1600;       // lado do quadrado final
const CARTOLINA = 226;   // claridade alvo da cartolina (cinzento neutro claro)

/** Caixa da peça: onde há relevo, há peça. */
async function caixaDaPeca(file) {
  const L = 200;
  const { data, info } = await sharp(file).rotate().greyscale()
    .resize(L, L, { fit: 'inside' }).blur(1.4).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const mag = new Float32Array(W * H);
  let max = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const p = y * W + x;
    const m = Math.abs(data[p + 1] - data[p - 1]) + Math.abs(data[p + W] - data[p - W]);
    mag[p] = m; if (m > max) max = m;
  }
  const lim = Math.max(10, max * 0.16);
  let x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (mag[y * W + x] < lim) continue;
    n++;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (n < 30 || x1 <= x0 || y1 <= y0) return null;
  return { x0: x0 / W, y0: y0 / H, x1: x1 / W, y1: y1 / H };
}

/** Cor da cartolina: mediana de um anel de pixéis à volta da peça. */
async function corDaCartolina(file, caixa) {
  const L = 200;
  const { data, info } = await sharp(file).rotate().resize(L, L, { fit: 'inside' })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = { r: [], g: [], b: [] };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fx = x / W, fy = y / H;
    const dentro = fx > caixa.x0 - 0.03 && fx < caixa.x1 + 0.03 && fy > caixa.y0 - 0.03 && fy < caixa.y1 + 0.03;
    if (dentro) continue;
    const i = (y * W + x) * 3;
    px.r.push(data[i]); px.g.push(data[i + 1]); px.b.push(data[i + 2]);
  }
  const med = a => { a.sort((p, q) => p - q); return a[a.length >> 1] || 1; };
  return [med(px.r), med(px.g), med(px.b)];
}

async function harmonizar(origem, destino) {
  const caixa = await caixaDaPeca(origem);
  if (!caixa) throw new Error('não encontrei a peça no enquadramento');
  const meta = await sharp(origem).rotate().metadata();
  const W = meta.width, H = meta.height;

  // Quadrado centrado na peça, com a peça a OCUPACAO do lado.
  const pw = (caixa.x1 - caixa.x0) * W, ph = (caixa.y1 - caixa.y0) * H;
  let lado = Math.round(Math.max(pw, ph) / OCUPACAO);
  lado = Math.min(lado, Math.min(W, H));            // não sair da fotografia
  const cx = Math.round((caixa.x0 + caixa.x1) / 2 * W);
  const cy = Math.round((caixa.y0 + caixa.y1) / 2 * H);
  const left = Math.max(0, Math.min(W - lado, cx - Math.round(lado / 2)));
  const top = Math.max(0, Math.min(H - lado, cy - Math.round(lado / 2)));

  // Balanço de brancos + exposição, a partir da cartolina.
  const bg = await corDaCartolina(origem, caixa);
  const media = (bg[0] + bg[1] + bg[2]) / 3;
  const ganhos = bg.map(c => Math.max(0.75, Math.min(1.35, media / c)));   // neutraliza a dominante
  const exposicao = Math.max(0.85, Math.min(1.25, CARTOLINA / media));     // iguala a claridade

  return sharp(origem).rotate()
    .extract({ left, top, width: lado, height: lado })
    .resize(LADO, LADO, { fit: 'cover' })
    // linear() por canal: é isto o balanço de brancos. Sem curvas, sem
    // saturação, sem viragem — a peça mantém a cor que tem.
    .linear(ganhos.map(g => g * exposicao), [0, 0, 0])
    .jpeg({ quality: 92 })
    .toFile(destino);
}

(async () => {
  const criados = JSON.parse(fs.readFileSync(path.join(__dirname, 'criados.json'), 'utf8'));
  const lote = JSON.parse(fs.readFileSync(path.join(__dirname, 'lote-2026-07.json'), 'utf8'));
  const fotosDe = {};
  lote.pecas.forEach(p => { fotosDe[p.nome] = p.fotos; });

  let feitas = 0, falhas = [];
  for (const c of criados) {
    const fotos = fotosDe[c.nome] || [];
    for (let i = 0; i < c.fotos.length; i++) {
      const origem = path.join(ORIGEM, `IMG_${fotos[i]}.jpg`);
      const destino = path.join(DESTINO, c.fotos[i]);
      if (!fs.existsSync(origem)) { falhas.push(`${c.ref}: falta ${origem}`); continue; }
      if (SIMULAR) { feitas++; continue; }
      try {
        await harmonizar(origem, destino + '.tmp');
        fs.renameSync(destino + '.tmp', destino);
        await processProductImage(c.fotos[i]);
        feitas++;
      } catch (e) { falhas.push(`${c.ref} (${c.fotos[i]}): ${e.message}`); }
    }
  }
  console.log(`${feitas} fotografias harmonizadas${SIMULAR ? ' (simulação)' : ''}`);
  if (falhas.length) { console.log('\nfalhas:'); falhas.forEach(f => console.log('  ' + f)); }
})().catch(e => { console.error(e); process.exit(1); });
