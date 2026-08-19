// Grafo das ligações entre notas: d3-force para a disposição, canvas para
// desenhar. Os nós são notas, e cada aresta é um [[wikilink]] que alguém
// escreveu à mão — não é co-ocorrência, é uma ligação afirmada.
//
// Canvas e não SVG: o pan/zoom fica fluido sem tocar no DOM a cada quadro,
// e o custo é ter de fazer a detecção de rato à mão (é uma distância).

import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide }
  from "./vendor/d3-force.js";

// Cor por domínio, não por tipo: é o domínio que agrupa o que se lê junto.
const CORES = {
  memoria: "#8b7fd4", loja: "#4a9dd4", catalogo: "#3fa87d", fotografia: "#d99b3f",
  marca: "#c9683f", design: "#d05f8f", infra: "#5aa8a0", bd: "#7a8fd4",
  seo: "#a8a03f", admin: "#9b7f6b", negocio: "#c2564f", geral: "#8a8378",
};
const cor = (d) => CORES[d] || CORES.geral;
const raio = (n) => 4.5 + Math.sqrt(n.grau) * 3.2;

export function criarGrafo(tela, info, legenda, aoAbrir) {
  let nos = [], arestas = [], sim = null, porSlug = new Map();
  let vista = { x: 0, y: 0, k: 1 };
  let sobre = null, seleccionado = null, arrasto = null;
  // Percurso em reprodução: `achou` são as notas que a busca devolveu,
  // `abriu` são as que foram de facto lidas, por ordem.
  let percurso = null;
  const ctx = tela.getContext("2d");

  const paraTela = (n) => [n.x * vista.k + vista.x, n.y * vista.k + vista.y];
  const paraMundo = (px, py) => [(px - vista.x) / vista.k, (py - vista.y) / vista.k];

  function dimensionar() {
    const r = tela.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    tela.width = r.width * dpr;
    tela.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return r;
  }

  function desenhar() {
    const r = tela.getBoundingClientRect();
    const estilo = getComputedStyle(document.body);
    ctx.clearRect(0, 0, r.width, r.height);

    // Vizinhança do nó sob o rato, para o resto poder desvanecer.
    const foco = sobre;
    const vizinhos = new Set();
    if (foco) {
      vizinhos.add(foco.slug);
      for (const a of arestas) {
        if (a.source.slug === foco.slug) vizinhos.add(a.target.slug);
        if (a.target.slug === foco.slug) vizinhos.add(a.source.slug);
      }
    }

    for (const a of arestas) {
      const activa = !foco || (vizinhos.has(a.source.slug) && vizinhos.has(a.target.slug));
      const [x1, y1] = paraTela(a.source), [x2, y2] = paraTela(a.target);
      ctx.strokeStyle = estilo.getPropertyValue("--risco").trim();
      ctx.globalAlpha = activa ? (foco ? 0.9 : 0.55) : 0.08;
      ctx.lineWidth = activa && foco ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Seta só quando há foco: a direcção da citação importa então.
      if (activa && foco) {
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const rr = raio(a.target) * vista.k + 3;
        const ax = x2 - Math.cos(ang) * rr, ay = y2 - Math.sin(ang) * rr;
        ctx.fillStyle = estilo.getPropertyValue("--tenue").trim();
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(ang - 0.4) * 7, ay - Math.sin(ang - 0.4) * 7);
        ctx.lineTo(ax - Math.cos(ang + 0.4) * 7, ay - Math.sin(ang + 0.4) * 7);
        ctx.fill();
      }
    }

    // O percurso desenha-se por cima do grafo: saltos numerados entre as
    // notas que foram abertas, na ordem em que o foram.
    if (percurso) {
      const passo = percurso.abriu.map((r) => porSlug.get(r)).filter(Boolean);
      ctx.globalAlpha = 1;
      for (let i = 0; i < passo.length - 1; i++) {
        const [x1, y1] = paraTela(passo[i]), [x2, y2] = paraTela(passo[i + 1]);
        ctx.strokeStyle = "#c9683f";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        // Arco, para dois saltos entre os mesmos nós não se sobreporem.
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(mx - dy / d * 26, my + dx / d * 26, x2, y2);
        ctx.stroke();
      }
    }

    for (const n of nos) {
      const [x, y] = paraTela(n);
      const rr = raio(n) * Math.min(vista.k, 1.6);
      const activo = !foco || vizinhos.has(n.slug);
      ctx.globalAlpha = activo ? 1 : 0.15;

      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fillStyle = cor(n.dominio);
      ctx.fill();

      // Expirada: anel vermelho. Órfã: anel tracejado. São coisas diferentes.
      if (n.valid_to) {
        ctx.strokeStyle = "#b4442f"; ctx.lineWidth = 2;
        ctx.stroke();
      } else if (n.grau === 0) {
        ctx.strokeStyle = estilo.getPropertyValue("--tenue").trim();
        ctx.setLineDash([2, 2]); ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (percurso) {
        const i = percurso.abriu.indexOf(n.slug);
        if (i >= 0) {
          // Visitada: anel cheio e o número do salto.
          ctx.strokeStyle = "#c9683f"; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(x, y, rr + 4, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = "#c9683f";
          ctx.beginPath(); ctx.arc(x + rr + 6, y - rr - 4, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "600 10px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(i + 1), x + rr + 6, y - rr - 1);
        } else if (percurso.achou.has(n.slug)) {
          // Encontrada pela busca mas não aberta: anel tracejado.
          ctx.strokeStyle = "#c9683f"; ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(x, y, rr + 4, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      if (n === seleccionado) {
        ctx.strokeStyle = estilo.getPropertyValue("--realce").trim();
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, rr + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Etiquetas só quando cabem: a partir de certo afastamento, viram borrão.
      if (vista.k > 1.1 || n.grau >= 5 || n === foco || n === seleccionado) {
        ctx.globalAlpha = activo ? (n === foco ? 1 : 0.75) : 0.1;
        ctx.fillStyle = estilo.getPropertyValue("--texto").trim();
        ctx.font = `${n === foco ? 600 : 400} ${Math.min(12, 10 + vista.k)}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.fillText(n.slug, x, y + rr + 12);
      }
    }
    ctx.globalAlpha = 1;
  }

  function noEm(px, py) {
    const [mx, my] = paraMundo(px, py);
    let melhor = null, dist = Infinity;
    for (const n of nos) {
      const d = Math.hypot(n.x - mx, n.y - my);
      if (d < Math.max(raio(n) + 6 / vista.k, 10 / vista.k) && d < dist) { dist = d; melhor = n; }
    }
    return melhor;
  }

  function descrever(n) {
    if (!n) {
      info.innerHTML = `<b>${nos.length}</b> notas, <b>${arestas.length}</b> ligações · ` +
        `arrastar para mover, roda para ampliar, clicar para abrir · ` +
        `anel vermelho = expirada, tracejado = ninguém a cita`;
      return;
    }
    const entra = arestas.filter((a) => a.target.slug === n.slug).map((a) => a.source.slug);
    const sai = arestas.filter((a) => a.source.slug === n.slug).map((a) => a.target.slug);
    info.innerHTML = `<b>${n.slug}</b> · ${n.tipo}/${n.dominio}` +
      (n.valid_to ? ` · <span style="color:#b4442f">expirada em ${n.valid_to}</span>` : "") +
      `<br>${n.titulo}` +
      `<br>cita ${sai.length ? sai.join(", ") : "—"}` +
      `<br>citada por ${entra.length ? entra.join(", ") : "ninguém"}`;
  }

  // ------------------------------------------------------------- interacção
  tela.addEventListener("mousedown", (e) => {
    const n = noEm(e.offsetX, e.offsetY);
    arrasto = n ? { no: n } : { pan: true, x: e.offsetX, y: e.offsetY };
    if (n && sim) { sim.alphaTarget(0.25).restart(); n.fx = n.x; n.fy = n.y; }
    tela.classList.add("a-arrastar");
  });
  window.addEventListener("mouseup", () => {
    if (arrasto?.no && sim) { sim.alphaTarget(0); arrasto.no.fx = arrasto.no.fy = null; }
    arrasto = null;
    tela.classList.remove("a-arrastar");
  });
  tela.addEventListener("mousemove", (e) => {
    if (arrasto?.no) {
      const [mx, my] = paraMundo(e.offsetX, e.offsetY);
      arrasto.no.fx = mx; arrasto.no.fy = my;
      return;
    }
    if (arrasto?.pan) {
      vista.x += e.offsetX - arrasto.x;
      vista.y += e.offsetY - arrasto.y;
      arrasto.x = e.offsetX; arrasto.y = e.offsetY;
      desenhar();
      return;
    }
    const n = noEm(e.offsetX, e.offsetY);
    if (n !== sobre) { sobre = n; descrever(n || seleccionado); desenhar(); }
    tela.style.cursor = n ? "pointer" : "grab";
  });
  tela.addEventListener("wheel", (e) => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const k = Math.max(0.15, Math.min(5, vista.k * f));
    // Ampliar em torno do cursor, e não do canto.
    vista.x = e.offsetX - (e.offsetX - vista.x) * (k / vista.k);
    vista.y = e.offsetY - (e.offsetY - vista.y) * (k / vista.k);
    vista.k = k;
    desenhar();
  }, { passive: false });
  tela.addEventListener("click", (e) => {
    const n = noEm(e.offsetX, e.offsetY);
    if (n) { seleccionado = n; descrever(n); desenhar(); aoAbrir(n.slug); }
  });
  new ResizeObserver(() => { dimensionar(); desenhar(); }).observe(tela);

  function enquadrar() {
    if (!nos.length) return;
    const r = tela.getBoundingClientRect();
    const xs = nos.map((n) => n.x), ys = nos.map((n) => n.y);
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
    // Margem para as etiquetas, e a gaveta dos percursos à direita, que de
    // outro modo tapava os nós que calhassem debaixo dela.
    const m = 90;
    const gaveta = document.getElementById("percursos");
    const dir = m + (gaveta && !gaveta.hidden ? gaveta.offsetWidth + 16 : 0);
    const util = { w: r.width - m - dir, h: r.height - m * 2 };
    vista.k = Math.max(0.2, Math.min(1.6,
      Math.min(util.w / Math.max(x1 - x0, 1), util.h / Math.max(y1 - y0, 1))));
    vista.x = m + util.w / 2 - ((x0 + x1) / 2) * vista.k;
    vista.y = r.height / 2 - ((y0 + y1) / 2) * vista.k;
    desenhar();
  }

  return {
    enquadrar,
    carregar(dados, slugActual) {
      const antigos = new Map(nos.map((n) => [n.slug, n]));
      nos = dados.nos.map((n) => ({ ...n, ...(antigos.get(n.slug) || {}) }));
      porSlug = new Map(nos.map((n) => [n.slug, n]));
      arestas = dados.arestas
        .map((a) => ({ source: porSlug.get(a.de), target: porSlug.get(a.para) }))
        .filter((a) => a.source && a.target);

      const dom = [...new Set(nos.map((n) => n.dominio))].sort();
      legenda.innerHTML = dom.map((d) =>
        `<span><i style="background:${cor(d)}"></i>${d}</span>`).join("");

      const r = dimensionar();
      sim?.stop();
      sim = forceSimulation(nos)
        .force("link", forceLink(arestas).distance(70).strength(0.35))
        .force("carga", forceManyBody().strength(-260).distanceMax(420))
        .force("centro", forceCenter(r.width / 2, r.height / 2))
        .force("colisao", forceCollide().radius((n) => raio(n) + 12))
        .on("tick", desenhar)
        // Quando a simulação arrefece, o desenho está estável: é a altura
        // certa para enquadrar, e não antes.
        .on("end", enquadrar);
      vista = { x: 0, y: 0, k: 1 };
      seleccionado = porSlug.get(slugActual) || null;
      descrever(seleccionado);
    },
    reproduzir(t) {
      percurso = t && {
        achou: new Set(t.passos.filter((x) => x.acao === "achou" && x.fonte === "nota")
                        .map((x) => x.ref)),
        abriu: t.passos.filter((x) => x.acao === "abriu").map((x) => x.ref),
      };
      desenhar();
    },
    seleccionar(slug) {
      seleccionado = nos.find((n) => n.slug === slug) || null;
      descrever(seleccionado);
      desenhar();
    },
    redesenhar: desenhar,
  };
}
