// A memória vista de fora. Só leitura: esta página nunca escreve nada.
//
// O que aqui está e não estaria numa UI genérica de notas — porque é o que o
// nosso modelo tem de próprio: a vigência de cada facto, a cadeia de
// supersessão, o cursor "como estava a", e as marcas L/S que dizem porque é
// que um resultado apareceu (BM25, vector, ou ambos).

import { marcacao } from "./marcacao.js";
import { criarGrafo } from "./grafo.js";

const $ = (s) => document.querySelector(s);
const api = async (rota) => (await fetch("/api/" + rota)).json();
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let notas = [], slugs = new Set(), estado = null, grafo = null, grafoCarregado = false;
let slugActual = null, aba = "nota";

// ------------------------------------------------------------------ lado
function pintarArvore() {
  const porDominio = new Map();
  for (const n of notas) {
    if (!porDominio.has(n.dominio)) porDominio.set(n.dominio, []);
    porDominio.get(n.dominio).push(n);
  }
  const ordem = [...porDominio.entries()].sort((a, b) => b[1].length - a[1].length);
  $("#arvore").innerHTML = ordem.map(([dom, lista]) => `
    <div class="grupo">${esc(dom)} · ${lista.length}</div>
    ${lista.map((n) => `
      <a class="item ${n.slug === slugActual ? "activo" : ""} ${n.valid_to ? "expirada" : ""}"
         href="#/nota/${encodeURIComponent(n.slug)}">
        <span class="titulo">${esc(n.titulo)}</span>
        <span class="meta">${esc(n.tipo)}${n.citada_por ? ` · citada ${n.citada_por}×` : ""}${
          n.valid_to ? ` · expirou ${n.valid_to}` : ""}</span>
      </a>`).join("")}`).join("");
}

function pintarResultados(res, pergunta) {
  if (!res.length) {
    $("#arvore").innerHTML = `<p class="vazio" style="padding:1rem">nada para «${esc(pergunta)}»</p>`;
    return;
  }
  $("#arvore").innerHTML = `<div class="grupo">${res.length} resultados</div>` + res.map((r) => {
    // L = apareceu no BM25, S = apareceu no vectorial. Ambos = achado sólido.
    const marca = (r.lex ? "L" : "·") + (r.sem ? "S" : "·");
    const abrivel = r.fonte === "nota";
    const ref = r.fonte === "transcript" ? (r.titulo || r.ref).slice(0, 40) : r.ref;
    return `<div class="resultado" ${abrivel ? `data-slug="${esc(r.ref)}"` : ""}
                 title="${abrivel ? "abrir nota" : "fragmento de " + esc(r.fonte)}">
      <div class="cab">
        <span class="marca">${marca}</span>
        <span>${r.ponto.toFixed(3)}</span>
        <span>${esc(r.tipo || r.fonte)}${r.dominio && r.dominio !== "geral" ? "/" + esc(r.dominio) : ""}</span>
        ${r.valid_to ? `<span style="color:#b4442f">expirada ${r.valid_to}</span>` : ""}
      </div>
      <div class="titulo">${esc(r.titulo || ref)}</div>
      <div class="excerto">${esc(r.texto.replace(/\s+/g, " ").slice(0, 200))}</div>
    </div>`;
  }).join("");
}

// ------------------------------------------------------------------ nota
async function abrirNota(slug) {
  slugActual = slug;
  document.querySelectorAll(".item").forEach((el) =>
    el.classList.toggle("activo", el.getAttribute("href") === `#/nota/${encodeURIComponent(slug)}`));
  grafo?.seleccionar(slug);

  const n = await api("nota?slug=" + encodeURIComponent(slug));
  if (n.erro) { $("#painel-nota").innerHTML = `<p class="vazio">nota não encontrada</p>`; return; }

  const vigor = n.valid_to
    ? `<span class="selo expirada">expirou ${n.valid_to}</span>`
    : `<span class="selo vigor">em vigor desde ${n.valid_from || "?"}</span>`;
  const sucessora = n.superseded_by
    ? `<span class="selo">substituída por <a href="#/nota/${encodeURIComponent(n.superseded_by)}">${esc(n.superseded_by)}</a></span>`
    : "";

  const lista = (t, itens) => itens.length
    ? `<div><h4>${t}</h4><ul>${itens.join("")}</ul></div>` : "";

  $("#painel-nota").innerHTML = `<article class="ficha">
    <h2>${esc(n.titulo)}</h2>
    <div class="selos">
      <span class="selo">${esc(n.tipo)}</span>
      <span class="selo">${esc(n.dominio)}</span>
      ${vigor}${sucessora}
      ${n.confianca < 1 ? `<span class="selo">confiança ${n.confianca}</span>` : ""}
      <span class="selo">${n.fragmentos} fragmentos indexados</span>
    </div>
    ${n.resumo ? `<p class="resumo">${esc(n.resumo)}</p>` : ""}
    <div class="corpo">${marcacao(n.corpo, slugs)}</div>
    <div class="rodape">
      ${lista("cita", n.liga_a.map((l) => l.resolve
        ? `<li><a href="#/nota/${encodeURIComponent(l.slug)}">${esc(l.slug)}</a></li>`
        : `<li><span class="wl morta">${esc(l.slug)}</span> (não existe)</li>`))}
      ${lista("citada por", n.citada_por.map((l) =>
        `<li><a href="#/nota/${encodeURIComponent(l.slug)}">${esc(l.titulo)}</a></li>`))}
      ${lista("entidades", n.entidades.map((e) => `<li class="mono">${esc(e)}</li>`))}
      ${lista("proveniência", n.sources.map((s) => `<li class="mono">${esc(s.kind)}: ${esc(s.ref)}</li>`))}
      ${n.keywords ? `<div><h4>termos EN</h4><p class="mono">${esc(n.keywords)}</p></div>` : ""}
      <div><h4>ficheiro</h4><p class="mono">${esc(n.path)}</p></div>
    </div>
  </article>`;
  $("#painel-nota").scrollTop = 0;
}

// ------------------------------------------------------------- auditoria
// O "sonho": os sinais determinísticos que decidem se há consolidação a
// fazer. Cada frente traz a instrução do que fazer — e em nenhuma delas a
// instrução é apagar: o que deixou de ser verdade fecha-se e aponta sucessor.
const FRENTES = [
  // Os três primeiros medem a biblioteca contra o REPOSITÓRIO, e não contra
  // si própria: é o único eixo que apanha uma nota bem costurada e falsa.
  ["desactualizadas", "o ficheiro mudou depois de a nota ter sido conferida", true,
   (x) => `${lig(x.slug)} <span class="nota-ilha">conferida a ${x.conferida}</span>` +
     `<br><span class="nota-ilha">mudaram: ${x.ficheiros.slice(0, 3)
       .map((f) => `${esc(f.ref)} (${f.mudou})`).join(", ")}` +
     `${x.ficheiros.length > 3 ? ` +${x.ficheiros.length - 3}` : ""}</span>`],
  ["proveniencia_morta", "proveniência a apontar para ficheiro que já não existe", true,
   (x) => `${lig(x.slug)} → <span class="wl morta">${esc(x.ref)}</span>`],
  ["por_verificar", "estados que há muito ninguém confronta com a realidade", false,
   (x) => `${lig(x.slug)} <span class="nota-ilha">${
     x.alguma_vez ? "verificada" : "escrita, e nunca verificada"} a ${x.desde}</span>`],
  ["ligacoes_partidas", "ligações para notas que não existem", true,
   (x) => `${lig(x.src)} → <span class="wl morta">${esc(x.dst)}</span>`],
  ["por_fechar", "substituídas mas ainda em vigor", true,
   (x) => `${lig(x.slug)} → ${lig(x.superseded_by)} — falta fechar o valid_to`],
  ["estados_vencidos", "estados antigos ainda dados como em vigor", true,
   (x) => `${lig(x.slug)} <span class="nota-ilha">desde ${x.valid_from}</span>`],
  ["duplicados", "pares que talvez digam o mesmo", false,
   (x) => `${lig(x.a)} ~ ${lig(x.b)} <span class="nota-ilha">${x.semelhanca}</span>`],
  ["grandes", "notas que cresceram demais", false,
   (x) => `${lig(x.slug)} <span class="nota-ilha">${x.tamanho} caracteres</span>`],
  ["orfas", "notas que ninguém cita", false,
   (x) => `${lig(x.slug)}${x.ilha ? ' <span class="nota-ilha">ilha: também não cita ninguém</span>' : ""}`],
  ["resumo_redundante", "o resumo repete o título", false,
   (x) => `${lig(x.slug)} <span class="nota-ilha">${esc(x.titulo).slice(0, 70)}…</span>`],
  ["sem_proveniencia", "notas sem proveniência", false, (x) => lig(x)],
];
const lig = (s) => `<a href="#/nota/${encodeURIComponent(s)}">${esc(s)}</a>`;

// Os duplicados eram pedidos à parte por custarem uma passagem de embeddings.
// Desde que passaram a ler os vectores do índice custam décimas, portanto vêm
// de origem — um sinal atrás de um botão é um sinal que ninguém vê.
async function pintarAuditoria(comDuplicados = true) {
  $("#painel-auditoria").innerHTML = `<p class="vazio">a medir…</p>`;
  const a = await api("sonhar" + (comDuplicados ? "?duplicados=1" : ""));
  const total = FRENTES.reduce((n, [k]) => n + (a[k]?.length || 0), 0);

  const seccoes = FRENTES.filter(([k]) => a[k]?.length).map(([k, titulo, grave, render]) =>
    `<section><h3>${grave ? "! " : ""}${titulo} · ${a[k].length}</h3>
      <ul>${a[k].map((x) => `<li>${render(x)}</li>`).join("")}</ul></section>`).join("");

  $("#painel-auditoria").innerHTML = `<div class="lint">
    <p class="vazio">O que se mede sem perguntar nada a um modelo generativo. Mede e
    aponta — não corrige, e <strong>nunca apaga</strong>: o que deixou de ser verdade
    fecha-se com <code>valid_to</code> e aponta <code>superseded_by</code>.</p>
    ${total ? seccoes : `<p class="limpo">Memória sã: nada a consolidar.</p>`}
  </div>`;
}

// -------------------------------------------------------------- percursos
// Cada busca deixa registo do que devolveu, e cada nota aberta a seguir
// pendura-se nesse registo. Reproduzir um percurso desenha-o sobre o grafo:
// tracejado = a busca encontrou, numerado = foi lido, e por que ordem.
async function pintarPercursos() {
  const ps = await api("percursos?limite=30");
  $("#lista-percursos").innerHTML = ps.length ? ps.map((p) => {
    const f = JSON.parse(p.filtros || "{}");
    const filtros = Object.entries(f).map(([k, v]) => `${k}=${v}`).join(" ");
    return `<li data-id="${p.id}">
      <div class="pergunta">${esc(p.pergunta)}</div>
      <div class="detalhe">${p.ts.slice(0, 16).replace("T", " ")} · ${esc(p.origem)}
        · ${p.achados} achados · ${p.duracao_ms}ms ${esc(filtros)}</div>
      <div class="notacao">${esc(p.notacao || "")}</div>
    </li>`;
  }).join("") : `<li class="vazio">ainda não houve buscas</li>`;
}

async function reproduzir(id) {
  const t = await api("percurso?id=" + id);
  grafo.reproduzir(t);
  document.querySelectorAll("#lista-percursos li").forEach((el) =>
    el.classList.toggle("activo", el.dataset.id === String(id)));
  $("#limpar-percurso").hidden = false;
}

// -------------------------------------------------------------- navegação
function mostrarAba(nome) {
  aba = nome;
  for (const p of ["nota", "grafo", "auditoria"]) $(`#painel-${p}`).hidden = p !== nome;
  document.querySelectorAll("#abas a").forEach((el) =>
    el.classList.toggle("activo", el.dataset.aba === nome));
  if (nome === "grafo" && !grafoCarregado) {
    grafoCarregado = true;
    api("grafo").then((d) => grafo.carregar(d, slugActual));
  }
  if (nome === "grafo") pintarPercursos();
  if (nome === "auditoria") pintarAuditoria();
}

function rota() {
  const h = location.hash.slice(2) || "nota";
  const [nome, arg] = [h.split("/")[0], decodeURIComponent(h.split("/").slice(1).join("/") || "")];
  mostrarAba(["nota", "grafo", "auditoria"].includes(nome) ? nome : "nota");
  if (arg && arg !== slugActual) abrirNota(arg);
}

// ------------------------------------------------------------------ busca
let temporizador = null;
function buscar() {
  clearTimeout(temporizador);
  const q = $("#q").value.trim();
  if (!q) { pintarArvore(); return; }
  // Ritmo humano: espera-se pela pausa em vez de disparar por tecla — cada
  // busca corre um embedding local, e não vale a pena queimá-los a meio de
  // uma palavra.
  temporizador = setTimeout(async () => {
    const p = new URLSearchParams({ q, limite: "20" });
    if ($("#f-dominio").value) p.set("dominio", $("#f-dominio").value);
    if ($("#f-tipo").value) p.set("tipo", $("#f-tipo").value);
    if ($("#f-asof").value) p.set("as_of", $("#f-asof").value);
    if ($("#f-expirado").checked) p.set("incluir_expirado", "1");
    $("#arvore").innerHTML = `<p class="vazio" style="padding:1rem">a procurar…</p>`;
    pintarResultados(await api("buscar?" + p), q);
  }, 280);
}

// ------------------------------------------------------------------ arranque
(async function inicio() {
  [estado, notas] = await Promise.all([api("estado"), api("notas")]);
  slugs = new Set(notas.map((n) => n.slug));

  $("#resumo-estado").textContent =
    `${estado.notas} notas · ${estado.em_vigor} em vigor · ${estado.ligacoes} ligações\n` +
    `${estado.fragmentos} fragmentos · ${estado.entidades} entidades · ${estado.tamanho_mb} MB`;
  for (const d of estado.dominios) $("#f-dominio").add(new Option(d, d));
  for (const t of estado.tipos) $("#f-tipo").add(new Option(t, t));

  pintarArvore();
  grafo = criarGrafo($("#tela"), $("#grafo-info"), $("#grafo-legenda"),
                     (slug) => { location.hash = `#/nota/${encodeURIComponent(slug)}`; });

  $("#q").addEventListener("input", buscar);
  $("#form-busca").addEventListener("submit", (e) => { e.preventDefault(); buscar(); });
  ["#f-dominio", "#f-tipo", "#f-asof", "#f-expirado"].forEach((s) =>
    $(s).addEventListener("change", buscar));
  $("#arvore").addEventListener("click", (e) => {
    const r = e.target.closest(".resultado[data-slug]");
    if (r) location.hash = `#/nota/${encodeURIComponent(r.dataset.slug)}`;
  });
  $("#lista-percursos").addEventListener("click", (e) => {
    const li = e.target.closest("li[data-id]");
    if (li) reproduzir(li.dataset.id);
  });
  $("#reorganizar").addEventListener("click", () => {
    const b = $("#reorganizar");
    b.disabled = true;
    b.textContent = "a assentar…";
    grafo.reorganizar(() => { b.disabled = false; b.textContent = "reorganizar"; });
  });
  $("#limpar-percurso").addEventListener("click", () => {
    grafo.reproduzir(null);
    document.querySelectorAll("#lista-percursos li").forEach((el) => el.classList.remove("activo"));
    $("#limpar-percurso").hidden = true;
  });
  window.addEventListener("hashchange", rota);

  if (!location.hash) {
    // Abre na nota mais citada: é o centro do grafo, e a melhor porta de entrada.
    const centro = [...notas].sort((a, b) => b.citada_por - a.citada_por)[0];
    if (centro) location.hash = `#/nota/${encodeURIComponent(centro.slug)}`;
  }
  rota();
})();
