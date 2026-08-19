// Renderizador de markdown mínimo, só o que as notas usam de facto.
// Não é uma implementação da norma — é o suficiente para ler, e cabe na
// cabeça. O que interessa mesmo aqui são os [[wikilinks]], que passam a
// ligações navegáveis: é a costura que faz a memória parecer um grafo.

const escapar = (s) => s.replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function linha(t, slugs) {
  const codigos = [];
  // O código inline sai de cena primeiro, para o resto não lhe tocar.
  t = t.replace(/`([^`]+)`/g, (_, c) => `@@COD${codigos.push(c) - 1}@@`);
  t = escapar(t);
  t = t.replace(/\[\[([^\]|#]+?)(?:[|#][^\]]*)?\]\]/g, (_, alvo) => {
    const s = alvo.trim();
    return slugs.has(s)
      ? `<a class="wl" href="#/nota/${encodeURIComponent(s)}">${s}</a>`
      : `<span class="wl morta" title="não existe nota com este slug">${s}</span>`;
  });
  t = t.replace(/!?\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) =>
    `<a href="${url}"${url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${txt}</a>`);
  t = t.replace(/(^|[^*])\*\*([^*]+)\*\*/g, "$1<strong>$2</strong>");
  t = t.replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  t = t.replace(/(^|\s)(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  return t.replace(/@@COD(\d+)@@/g, (_, i) => `<code>${escapar(codigos[+i])}</code>`);
}

export function marcacao(md, slugs = new Set()) {
  const out = [];
  const linhas = md.split("\n");
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];

    if (l.startsWith("```")) {                                   // bloco de código
      const lang = l.slice(3).trim();
      const buf = [];
      for (i++; i < linhas.length && !linhas[i].startsWith("```"); i++) buf.push(linhas[i]);
      i++;
      out.push(`<pre><code data-lang="${escapar(lang)}">${escapar(buf.join("\n"))}</code></pre>`);
      continue;
    }

    const h = l.match(/^(#{1,4})\s+(.*)/);                       // títulos
    if (h) {
      const n = Math.min(h[1].length + 1, 4);
      out.push(`<h${n}>${linha(h[2], slugs)}</h${n}>`);
      i++;
      continue;
    }

    // tabela: cabeçalho + linha de separação
    if (/^\s*\|.*\|\s*$/.test(l) && /^\s*\|[\s:|-]+\|\s*$/.test(linhas[i + 1] || "")) {
      const celulas = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const cab = celulas(l);
      i += 2;
      const corpo = [];
      while (i < linhas.length && /^\s*\|.*\|\s*$/.test(linhas[i])) corpo.push(celulas(linhas[i++]));
      out.push(
        `<table><thead><tr>${cab.map((c) => `<th>${linha(c, slugs)}</th>`).join("")}</tr></thead>` +
        `<tbody>${corpo.map((r) => `<tr>${r.map((c) => `<td>${linha(c, slugs)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }

    const li = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);             // listas
    if (li) {
      const ordenada = /\d/.test(li[2]);
      const itens = [];
      while (i < linhas.length) {
        const m = linhas[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
        if (!m) {
          // Continuação indentada pertence ao item anterior.
          if (itens.length && /^\s+\S/.test(linhas[i])) {
            itens[itens.length - 1] += " " + linhas[i].trim();
            i++;
            continue;
          }
          break;
        }
        itens.push(m[3]);
        i++;
      }
      const t = ordenada ? "ol" : "ul";
      out.push(`<${t}>${itens.map((x) => `<li>${linha(x, slugs)}</li>`).join("")}</${t}>`);
      continue;
    }

    if (l.startsWith(">")) {                                     // citação
      const buf = [];
      while (i < linhas.length && linhas[i].startsWith(">")) buf.push(linhas[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${marcacao(buf.join("\n"), slugs)}</blockquote>`);
      continue;
    }

    if (!l.trim()) { i++; continue; }

    const buf = [];                                              // parágrafo
    while (i < linhas.length && linhas[i].trim() &&
           !/^(#{1,4}\s|```|\s*[-*]\s|\s*\d+\.\s|>|\s*\|)/.test(linhas[i])) buf.push(linhas[i++]);
    if (buf.length) out.push(`<p>${linha(buf.join(" "), slugs)}</p>`);
    else i++;
  }
  return out.join("\n");
}
