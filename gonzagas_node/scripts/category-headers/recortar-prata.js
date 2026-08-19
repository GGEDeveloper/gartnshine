#!/usr/bin/env node
/**
 * Recorta peças do lote de Julho de 2026 para as capas de prata.
 *
 * Não serve para o catálogo todo, e é de propósito: só trata as fotografias
 * que passaram por `scripts/novos-produtos/harmonizar.js` — quadradas,
 * 1600 px, sobre a mesma cartolina, com o balanço de brancos já feito. É um
 * problema muito mais fácil do que o caso geral, e por isso dá para resolver
 * bem em vez de resolver mais ou menos.
 *
 * O `rembg`, que fez os recortes anteriores, falhava aqui de duas maneiras:
 *   1. com `alpha_matting` deixava uma **franja clara** agarrada ao contorno —
 *      o halo que se vê à volta das peças escuras numa capa escura;
 *   2. sem ele, **preenchia o vazio do meio** de uma pulseira e devolvia um
 *      disco em vez de um aro.
 *
 *   node scripts/category-headers/recortar-prata.js PAN0143 PPU0080 …
 *   node scripts/category-headers/recortar-prata.js --prova PAN0143
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const CUTOUTS = path.join(__dirname, 'cutouts');
const MEDIA = path.join(ROOT, 'public', 'media', 'products');

const LADO = 1400;         // lado de trabalho
const PASSO = 10;          // diferença por pixel que o alagamento aceita andar
/* 95 e não mais. Com a trela mais larga o alagamento desce a sombra de
 * contacto degrau a degrau e entra pela peça adentro — experimentado a 150,
 * e os anéis vinham com dentadas. Fica antes uma réstia de sombra por baixo
 * de algumas peças, que sobre fundo escuro se lê como sombra e não incomoda. */
const D_MAX = 95;          // distância à cartolina que o alagamento de fora não passa
const D_FUNDO = 14;        // abaixo disto é cartolina
const D_PECA = 36;         // acima disto é peça
const CELA = 16;           // cela onde se mede o campo de fundo
const MURO = 22;           // salto de luminância que marca o contorno da peça
const D_VAZIO = 100;       // corrida prudente do vazio do meio
const D_VAZIO_LARGO = 168; // corrida larga, que também come a sombra de contacto
const COMER_MAX = 0.25;    // tinta que a corrida larga pode perder e ainda valer

const lum = (b, p) => 0.2126 * b[p * 3] + 0.7152 * b[p * 3 + 1] + 0.0722 * b[p * 3 + 2];

/** Cor da cartolina: mediana de uma moldura de 4 % à volta da fotografia. */
function corDoFundo(px, W, H) {
  const m = Math.max(6, Math.round(Math.min(W, H) * 0.04));
  const c = [[], [], []];
  for (let y = 0; y < H; y++) {
    const naMoldura = y < m || y >= H - m;
    for (let x = 0; x < W; x++) {
      if (!naMoldura && x >= m && x < W - m) continue;
      const i = (y * W + x) * 3;
      c[0].push(px[i]); c[1].push(px[i + 1]); c[2].push(px[i + 2]);
    }
  }
  return c.map(a => { a.sort((p, q) => p - q); return a[a.length >> 1]; });
}

/* Campo de fundo: a cor da cartolina em cada ponto.
 *
 * Uma cor só não chega. A cartolina tem gradiente de luz — num canto está a
 * 232, no outro a 208 — e medir a distância contra a mediana deixa manchas
 * inteiras de fundo por tirar. Mede-se por celas, e **só com cartolina limpa**:
 * a sombra da peça também foi alagada como fundo, e se contasse para a média
 * as celas junto à peça vinham escuras, o campo propagado para dentro do aro
 * ficava mais escuro do que a cartolina que lá está, e o vazio passava a
 * parecer brilho de metal. */
function campoDeFundo(px, W, H, exterior, bg) {
  const cw = Math.ceil(W / CELA), ch = Math.ceil(H / CELA);
  const soma = new Float64Array(cw * ch * 3), n = new Int32Array(cw * ch);
  const limpo = (p) => {
    const i = p * 3, dr = px[i] - bg[0], dg = px[i + 1] - bg[1], db = px[i + 2] - bg[2];
    return dr * dr + dg * dg + db * db < 22 * 22;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (!exterior[p] || !limpo(p)) continue;
      const c = ((y / CELA) | 0) * cw + ((x / CELA) | 0), i = p * 3;
      soma[c * 3] += px[i]; soma[c * 3 + 1] += px[i + 1]; soma[c * 3 + 2] += px[i + 2];
      n[c]++;
    }
  }
  const campo = new Float32Array(cw * ch * 3);
  const sabido = new Uint8Array(cw * ch);
  for (let c = 0; c < cw * ch; c++) {
    if (n[c] < CELA * 2) continue;
    sabido[c] = 1;
    for (let k = 0; k < 3; k++) campo[c * 3 + k] = soma[c * 3 + k] / n[c];
  }
  for (let volta = 0; volta < cw + ch; volta++) {
    let mudou = false;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const c = y * cw + x;
        if (sabido[c]) continue;
        let k = 0; const acc = [0, 0, 0];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const vx = x + dx, vy = y + dy;
          if (vx < 0 || vy < 0 || vx >= cw || vy >= ch) continue;
          const v = vy * cw + vx;
          if (sabido[v] !== 1) continue;
          k++; for (let j = 0; j < 3; j++) acc[j] += campo[v * 3 + j];
        }
        if (!k) continue;
        for (let j = 0; j < 3; j++) campo[c * 3 + j] = acc[j] / k;
        sabido[c] = 2; mudou = true;
      }
    }
    for (let c = 0; c < cw * ch; c++) if (sabido[c] === 2) sabido[c] = 1;
    if (!mudou) break;
  }
  for (let c = 0; c < cw * ch; c++) if (!sabido[c]) for (let k = 0; k < 3; k++) campo[c * 3 + k] = bg[k];

  // Ler com interpolação, senão vê-se a grelha das celas no contorno.
  return (x, y) => {
    const fx = Math.min(cw - 1.001, Math.max(0, x / CELA - 0.5));
    const fy = Math.min(ch - 1.001, Math.max(0, y / CELA - 0.5));
    const x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0;
    const out = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      const a = campo[(y0 * cw + x0) * 3 + k], b = campo[(y0 * cw + x0 + 1) * 3 + k];
      const c = campo[((y0 + 1) * cw + x0) * 3 + k], d = campo[((y0 + 1) * cw + x0 + 1) * 3 + k];
      out[k] = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
    }
    return out;
  };
}

async function recortar(ref, { prova = false, forcarLargo = false } = {}) {
  const file = [`${ref}-full.jpg`, `${ref}.jpg`].map(f => path.join(MEDIA, f)).find(fs.existsSync);
  if (!file) throw new Error(`sem fotografia para ${ref}`);

  const meta = await sharp(file).rotate().metadata();
  const escala = Math.min(1, LADO / Math.max(meta.width, meta.height));
  const W = Math.round(meta.width * escala), H = Math.round(meta.height * escala);

  const { data: px } = await sharp(file).rotate().resize(W, H, { fit: 'fill' })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // Cópia suavizada só para **decidir** o que é fundo; a cor que vai para o
  // ficheiro é sempre a original.
  const { data: sx } = await sharp(file).rotate().resize(W, H, { fit: 'fill' })
    .median(3).blur(1.2).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  const bg = corDoFundo(sx, W, H);
  const dist = (p, cor) => {
    const i = p * 3, dr = sx[i] - cor[0], dg = sx[i + 1] - cor[1], db = sx[i + 2] - cor[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };
  const semelhante = (p, q) => {
    const a = p * 3, b = q * 3;
    return Math.abs(sx[a] - sx[b]) < PASSO && Math.abs(sx[a + 1] - sx[b + 1]) < PASSO &&
           Math.abs(sx[a + 2] - sx[b + 2]) < PASSO;
  };
  const vizinhos = (p, f) => {
    const x = p % W, y = (p / W) | 0;
    if (x > 0) f(p - 1);
    if (x < W - 1) f(p + 1);
    if (y > 0) f(p - W);
    if (y < H - 1) f(p + W);
  };

  /* Fundo de fora: alaga-se da borda para dentro enquanto a cor **quase não
   * muda**. É o critério certo para cartolina com gradiente de luz: o fundo
   * varia devagar, o contorno da peça é um salto. O `D_MAX` é a trela, para o
   * alagamento não entrar por uma sombra funda adentro e comer a peça. */
  const exterior = new Uint8Array(W * H);
  const fila = new Int32Array(W * H);
  let ini = 0, fim = 0;
  const semear = (p) => { if (!exterior[p] && dist(p, bg) < D_MAX) { exterior[p] = 1; fila[fim++] = p; } };
  for (let x = 0; x < W; x++) { semear(x); semear((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { semear(y * W); semear(y * W + W - 1); }
  while (ini < fim) {
    const p = fila[ini++];
    vizinhos(p, (q) => {
      if (exterior[q] || dist(q, bg) > D_MAX || !semelhante(p, q)) return;
      exterior[q] = 1; fila[fim++] = q;
    });
  }

  const fundoEm = campoDeFundo(sx, W, H, exterior, bg);

  // Onde a peça acaba: a sombra escurece devagar, o contorno é um degrau.
  const degrau = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const p = y * W + x;
      if (Math.abs(lum(sx, p + 1) - lum(sx, p - 1)) +
          Math.abs(lum(sx, p + W) - lum(sx, p - W)) > MURO) degrau[p] = 1;
    }
  }

  /* O vazio do meio. Uma pulseira fechada guarda cartolina lá dentro, e essa
   * cartolina não se alcança a partir da borda. Semeia-se de novo, medindo
   * contra a cor **da cartolina** e não contra o campo — dentro do aro o campo
   * é herdado de fora e vem sempre um pouco mais escuro.
   *
   * Quanto pode alastrar não tem valor único: a sombra de contacto chega a
   * estar a 150 da cartolina, e para a comer é preciso dar corda; mas com essa
   * corda um anel de prata polida e lisa é engolido inteiro. Por isso tenta-se
   * duas vezes, e a corrida larga só fica se **não** comer a peça. */
  const alagarVazio = (limite) => {
    const vazio = new Uint8Array(W * H);
    let a = 0, b = 0;
    for (let p = 0; p < W * H; p++) {
      if (!exterior[p] && dist(p, bg) < D_FUNDO * 1.3) { vazio[p] = 1; fila[b++] = p; }
    }
    while (a < b) {
      const p = fila[a++];
      vizinhos(p, (q) => {
        if (exterior[q] || vazio[q] || degrau[q] || !semelhante(p, q) || dist(q, bg) > limite) return;
        vazio[q] = 1; fila[b++] = q;
      });
    }
    return vazio;
  };
  const prudente = alagarVazio(D_VAZIO), largo = alagarVazio(D_VAZIO_LARGO);
  const conta = (v) => { let n = 0; for (let p = 0; p < W * H; p++) if (!exterior[p] && !v[p]) n++; return n; };
  const nP = conta(prudente), nL = conta(largo);
  // `--largo` força a corrida larga quando a escolha automática foi conservadora
  // de mais e ficou uma nódoa de sombra por baixo da peça.
  const vazio = forcarLargo || !(nP && (nP - nL) / nP > COMER_MAX) ? largo : prudente;

  /* Peneira por mancha, e é o que faltava.
   *
   * A semeadura do vazio aceita qualquer pixel que esteja à cor da cartolina.
   * Numa prata polida **a face espelhada devolve a cartolina** — é a mesma cor,
   * ponto por ponto — e o alagamento entra-lhe pela peça adentro. Foi isso que
   * comeu o leque do PAN0143 e as costas do PAN0148, e a guarda do COMER_MAX
   * não apanhava porque as duas corridas vinham igualmente contaminadas.
   *
   * O que separa as duas coisas **não é a planura** — experimentei, e o desvio
   * padrão da luminância dá 29 no vazio verdadeiro de uma pulseira (que também
   * tem o degradê da sombra de contacto) contra 21 na face comida de um anel:
   * troca as voltas em vez de as separar.
   *
   * O que separa é **quanto da mancha é mais escura do que a cartolina**. Um
   * vazio verdadeiro é cartolina: fica na luz do fundo ou perto dela, e só o
   * bordo em sombra desce — 26 % a 32 % da mancha. Uma face de metal apanhada
   * por engano fica sempre abaixo, porque o metal, mesmo polido, devolve menos
   * luz do que o papel — 93 % a 99 %. Entre um número e outro há um fosso, e é
   * lá que se põe a linha.
   */
  const lumBg = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
  const marca = new Int32Array(W * H).fill(-1);
  const manchas = [];
  for (let s = 0; s < W * H; s++) {
    if (!vazio[s] || marca[s] >= 0) continue;
    const id = manchas.length;
    let a = 0, b = 0;
    fila[b++] = s; marca[s] = id;
    const luzes = [];
    while (a < b) {
      const p = fila[a++];
      luzes.push(lum(sx, p));
      vizinhos(p, (q) => { if (vazio[q] && marca[q] < 0) { marca[q] = id; fila[b++] = q; } });
    }
    const media = luzes.reduce((x, y) => x + y, 0) / luzes.length;
    const dp = Math.sqrt(luzes.reduce((x, v) => x + (v - media) ** 2, 0) / luzes.length);
    const escuras = luzes.filter((v) => v < lumBg - 6).length / luzes.length;
    manchas.push({ id, area: luzes.length, dp, media, escuras });
  }
  const ESCURAS_MAX = 0.65; // acima disto a mancha é metal, não cartolina
  const MANCHA_MIN = 40;    // manchas de meia dúzia de pixéis são ruído do contorno
  const passa = manchas.map((m) => m.escuras <= ESCURAS_MAX || m.area < MANCHA_MIN);
  if (process.env.RECORTE_STATS) {
    for (const m of manchas.filter((m) => m.area >= MANCHA_MIN).sort((x, y) => y.area - x.area).slice(0, 8)) {
      console.log(`   mancha ${String(m.area).padStart(6)} px  escuras ${(m.escuras * 100).toFixed(0).padStart(3)}%  ${passa[m.id] ? 'cartolina — sai' : 'metal — fica'}`);
    }
  }
  for (let p = 0; p < W * H; p++) if (vazio[p] && passa[marca[p]]) exterior[p] = 1;

  /* A réstia de sombra. O alagamento de fora pára onde a sombra de contacto
   * fica funda de mais, e sobra uma nódoa cinzenta encostada à peça. Distingue-
   * -se do metal por três coisas ao mesmo tempo: é **lisa** (o metal tem
   * relevo), é **neutra** (não tem cor nenhuma) e é **mais escura** do que a
   * cartolina sem nunca chegar ao preto dos vazios. As três juntas, senão
   * apanhava a prata polida, que também é lisa e neutra. */
  const aspereza = new Float32Array(W * H);
  {
    const R = 4;
    for (let y = R; y < H - R; y++) {
      for (let x = R; x < W - R; x++) {
        let soma = 0, soma2 = 0, n = 0;
        for (let dy = -R; dy <= R; dy += 2) {
          for (let dx = -R; dx <= R; dx += 2) {
            const v = lum(px, (y + dy) * W + (x + dx));
            soma += v; soma2 += v * v; n++;
          }
        }
        const media = soma / n;
        aspereza[y * W + x] = Math.sqrt(Math.max(0, soma2 / n - media * media));
      }
    }
  }

  /* Só é sombra o que **encosta ao fundo**. Sem esta condição a mesma regra
   * abria buracos no meio das peças: a prata polida de um aro liso também é
   * lisa e neutra, e caía no mesmo teste. Alaga-se a partir do contorno do
   * fundo, e o que estiver rodeado de metal por todos os lados fica quieto. */
  const pareceSombra = (p) => {
    const i = p * 3;
    const cor = fundoEm(p % W, (p / W) | 0);
    const lumF = 0.2126 * cor[0] + 0.7152 * cor[1] + 0.0722 * cor[2];
    const l = lum(px, p);
    const mx = Math.max(px[i], px[i + 1], px[i + 2]);
    const mn = Math.min(px[i], px[i + 1], px[i + 2]);
    return aspereza[p] < 4.5 && mx - mn < 14 && l > lumF * 0.42 && l < lumF * 0.97;
  };
  const sombra = new Uint8Array(W * H);
  {
    let a = 0, b = 0;
    for (let p = 0; p < W * H; p++) {
      if (exterior[p] || !pareceSombra(p)) continue;
      let encosta = false;
      vizinhos(p, (q) => { if (exterior[q]) encosta = true; });
      if (encosta) { sombra[p] = 1; fila[b++] = p; }
    }
    while (a < b) {
      const p = fila[a++];
      vizinhos(p, (q) => {
        if (exterior[q] || sombra[q] || !pareceSombra(q)) return;
        sombra[q] = 1; fila[b++] = q;
      });
    }
  }

  /* Migalhas de cartolina agarradas à peça.
   *
   * O alagamento de fora anda enquanto a cor **quase não muda** (PASSO) e pára
   * onde o degrau do contorno o trava. Junto a uma peça com relevo ficam bocados
   * de cartolina encurralados entre o contorno e a sombra: o alagamento não lá
   * chega, e a regra da sombra também não os apanha, porque eles não são
   * escuros — são cartolina, à luz do campo. Sobre um cabeçalho preto lêem-se
   * como salpicos brancos, e foi isso que sujou o PAN0148 e o PAN0132.
   *
   * Aqui a trela é curta de propósito: só sai o que estiver **à cor do campo
   * local**, dentro de D_FUNDO. A prata polida, mesmo lisa, ou é mais clara do
   * que a cartolina ou traz-lhe uma dominante — não cabe nesta janela. */
  {
    let a = 0, b = 0;
    const cartolina = (p) => dist(p, fundoEm(p % W, (p / W) | 0)) < D_FUNDO;
    for (let p = 0; p < W * H; p++) {
      if (exterior[p] || sombra[p] || !cartolina(p)) continue;
      let encosta = false;
      vizinhos(p, (q) => { if (exterior[q] || sombra[q]) encosta = true; });
      if (encosta) { exterior[p] = 1; fila[b++] = p; }
    }
    while (a < b) {
      const p = fila[a++];
      vizinhos(p, (q) => {
        if (exterior[q] || sombra[q] || !cartolina(q)) return;
        exterior[q] = 1; fila[b++] = q;
      });
    }
  }

  /* Alfa. Fora: zero. Dentro: rampa pela distância ao campo de fundo — e é a
   * rampa que dá o contorno suave, sem desfocar nada. */
  const rgba = Buffer.alloc(W * H * 4);
  let tinta = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x, i = p * 3, o = p * 4;
      const cor = fundoEm(x, y);
      let al;
      if (exterior[p]) al = 0;
      else {
        const lumF = 0.2126 * cor[0] + 0.7152 * cor[1] + 0.0722 * cor[2];
        // Brilho especular: mais claro do que a cartolina só pode ser metal.
        al = lum(sx, p) > lumF + 8
          ? 1
          : Math.max(0, Math.min(1, (dist(p, cor) - D_FUNDO) / (D_PECA - D_FUNDO)));
      }
      if (al > 0 && sombra[p]) al = 0;
      if (al <= 0) continue;
      if (al > 0.02) tinta++;
      /* Desfazer a mistura com a cartolina. No contorno o pixel é
       *   c = a·peça + (1−a)·fundo   →   peça = (c − (1−a)·fundo) / a
       * Sem isto o contorno vem lavado de claro — é o halo do rembg. */
      for (let k = 0; k < 3; k++) {
        const v = al < 0.98 ? (px[i + k] - (1 - al) * cor[k]) / al : px[i + k];
        rgba[o + k] = Math.max(0, Math.min(255, Math.round(v)));
      }
      rgba[o + 3] = Math.round(al * 255);
    }
  }
  if (!tinta) throw new Error(`${ref}: não sobrou peça nenhuma`);

  const img = sharp(rgba, { raw: { width: W, height: H, channels: 4 } });
  if (prova) {
    await img.clone().flatten({ background: '#FF00FF' }).png()
      .toFile(path.join(__dirname, `prova-${ref}.png`));
  }
  const info = await img.trim({ threshold: 2 }).webp({ quality: 90, alphaQuality: 92 })
    .toFile(path.join(CUTOUTS, `${ref}.webp`));
  return { ref, tinta: tinta / (W * H), largura: info.width, altura: info.height, kb: Math.round(info.size / 1024) };
}

(async () => {
  const args = process.argv.slice(2);
  const prova = args.includes('--prova');
  const forcarLargo = args.includes('--largo');
  const refs = args.filter(a => !a.startsWith('--'));
  if (!refs.length) { console.error('dá-me referências'); process.exit(1); }
  for (const ref of refs) {
    try {
      const r = await recortar(ref, { prova, forcarLargo });
      console.log(`${r.ref.padEnd(9)} ${String(r.largura).padStart(4)}×${String(r.altura).padEnd(4)} ` +
                  `${String(r.kb).padStart(3)} kB  tinta ${(r.tinta * 100).toFixed(1)}%`);
    } catch (e) { console.error(`! ${ref}: ${e.message}`); }
  }
})().catch(e => { console.error(e); process.exit(1); });
