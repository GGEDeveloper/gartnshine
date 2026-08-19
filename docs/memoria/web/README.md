# A memória vista de fora

    docs/memoria/bin/mem.py servir        # http://127.0.0.1:7373

Página local e **só-leitura**: nenhum endpoint escreve, nenhum chama um LLM
para responder. A busca semântica usa os embeddings locais do ollama, e mais
nada. Liga a `127.0.0.1` de propósito — isto vive em dev e nunca vai a
produção.

## O que tem

| | |
|---|---|
| **nota** | ficha completa: vigência, domínio, tipo, proveniência, quem cita e quem é citado. Os `[[wikilinks]]` são navegáveis. |
| **grafo** | as notas como nós e cada `[[wikilink]]` como aresta. Cor por domínio, tamanho por grau, anel vermelho = expirada, tracejado = ninguém a cita. Passar o rato isola a vizinhança e mostra a direcção das citações. |
| **auditoria** | o «sonho»: sinais determinísticos do que há a consolidar — ligações mortas, órfãs, duplicados prováveis, notas grandes demais, estados vencidos. Cada frente traz a instrução, e **em nenhuma a instrução é apagar**. |
| **percursos** | a gaveta no grafo lista as últimas buscas. Escolher uma reproduz o caminho por cima do grafo: tracejado = a busca encontrou, numerado = foi lido, e por que ordem. |
| **busca** | híbrida, com as marcas `L`/`S` a dizer se o resultado veio do BM25, do vectorial, ou dos dois. Filtra por domínio, tipo, e por **«como estava a»** — a data que responde *o que era verdade nesse dia*. |

## Como está feito

Sem `pnpm`, sem `Vite`, sem `Tailwind`, sem TypeScript, sem passo de build: os
ficheiros que estão aqui são os que o browser recebe. A única dependência é o
`d3-force` (e as três dele), vendorizada em `vendor/` — 17 KB de ESM.

- `app.js` — estado, navegação por `#hash`, árvore e busca
- `grafo.js` — simulação de forças e desenho em canvas
- `marcacao.js` — markdown mínimo, só o que as notas usam; o que interessa
  mesmo são os `[[wikilinks]]`, que viram ligações
- `estilo.css` — claro e escuro pelo `prefers-color-scheme`

O servidor é `bin/servir.py`: `http.server` da biblioteca padrão, uma
ligação SQLite por pedido, e os estáticos em caixa de areia dentro de `web/`.
Serve também o **MCP** em `/mcp`, o mesmo que o `bin/mcp.py` dá por stdio.

## Porque não se forkou o understory

O [understory](https://github.com/thecodacus/understory) (Apache 2.0) foi a
inspiração — grafo, replay de percursos, lint, dreaming. Mas as 1 294 linhas
de React dele assumem um modelo de memória **sem tempo**, e não têm sítio para
vigência, supersessão nem o cursor de «como estava a». Enxertar dava mais
trabalho do que escrever. Ver `notas/memoria-understory-e-ui.md`.
