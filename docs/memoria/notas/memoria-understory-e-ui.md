---
slug: memoria-understory-e-ui
tipo: decisao
dominio: memoria
titulo: Não migrar para o understory — puxar-lhe as ideias para o nosso motor, e separar motor de biblioteca
resumo: Avaliado o understory do thecodacus. Migrar deitava fora bi-temporalidade e busca híbrida; adoptam-se UI, grafo, percursos, lint e dreaming por cima do nosso. Motor e biblioteca separam-se agora, para haver centros de memória depois.
keywords: understory, OKF, Open Knowledge Format, knowledge graph UI, force-directed graph, d3-force, MCP server, dreaming, memory consolidation, orphan lint, wikilinks, bi-temporal
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - understory
  - thecodacus
  - d3-force
  - note_links
  - monitor.py
  - MEM_BIBLIOTECA
sources:
  - conversa:2026-08-18
  - url:https://github.com/thecodacus/understory
  - ficheiro:docs/memoria/bin/mem.py
relations:
  - understory | inspira | web da memoria
  - note_links | substitui | co_ocorre_em como grafo principal
---

## A decisão

Avaliado o [understory](https://github.com/thecodacus/understory) (Apache 2.0,
~5 700 linhas de TypeScript). **Não migramos.** Também não corremos os dois em
paralelo — duas fontes de verdade divergem numa semana. Fica o nosso motor, e
puxa-se de lá tudo o que for melhoria.

## Porque não migrar: os dois sistemas discordam sobre o que é uma memória

No understory, uma memória é um **conceito**: um ficheiro = um nó, as arestas
são links markdown entre ficheiros, e o frontmatter só exige `type`. **Não há
tempo** — um facto corrigido é reescrito por cima ("superseded in place").

No nosso, uma memória é uma **afirmação datada**: `valid_from`/`valid_to`/
`superseded_by` deixam perguntar *o que era verdade a 30 de julho*. O
understory não consegue essa pergunta por construção.

O que se perdia ao migrar, e que não é negociável:

- **Bi-temporalidade** — ver acima.
- **Busca.** A deles é `body.includes(termo)` sobre minúsculas, sem stemming
  nem diacríticos: em português, «memória» não encontraria «memoria». A nossa
  é FTS5 com `remove_diacritics 2` + 768 dims + RRF.
- **Cobertura.** 1 912 dos nossos 2 027 fragmentos vêm de transcrições, docs e
  commits. O understory só conhece os próprios ficheiros — perdiam-se 94% do
  que é pesquisável.
- **Custo.** Cada `memory_query` deles corre um agente LLM. A nossa busca é
  determinística. (Justiça seja feita: a *navegação* deles é determinística e
  gratuita — o custo é só nas consultas e mutações.)

## O que se adopta de lá

1. **UI web** com árvore, nota, log e badge de conformidade.
2. **Grafo force-directed** estilo Obsidian (`d3-force`), cor por tipo,
   tamanho por ligações, órfãs assinaladas.
3. **Replay do percurso** — a melhor ideia deles: cada corrida grava a
   travessia e o grafo desenha-a como saltos numerados. **Adaptação
   necessária:** o trace deles grava o agente LLM interno deles; nós não temos
   agente interno — quem consulta é o subagente `bibliotecario` por Bash.
   Portanto o percurso tem de ser gravado pelo próprio `mem.py`.
4. **Lint determinístico de grafo** (órfãs, links partidos) — metade do
   `memory_maintain` deles; a outra metade (duplicados) já tínhamos, e o nosso
   detector é melhor: cosseno sobre o corpo em vez de título e descrição.
5. **Dreaming** — o valor está no **gatilho determinístico** (sem sinais, não
   corre e não gasta nada), não no agente.
6. **Servidor MCP** — é o que tira a memória deste repo.

**Não se adopta a busca deles.**

> **Verificado a 2026-08-20.** A conformidade **OKF**, que aqui ficava «para
> mais tarde», está feita — e por outro caminho. Em vez de acrescentar campos
> às notas, `bin/okf.py` **exporta** um bundle derivado e descartável, como o
> índice: assim não se duplicam campos dentro das notas, que era o caminho
> certo para os dois lados divergirem. Fui buscar a especificação à fonte e
> ainda bem, porque o understory tem a **v0.1** e a **v0.2** acomoda muito
> mais do que eu esperava: `verified` recebe a nossa convenção
> `> Verificado a <data>`, `status: deprecated` recebe o `valid_to` fechado, e
> `stale_after` deixa declarada a política dos quatro meses que o `sonhar`
> calculava em silêncio. O que o OKF não modela — `valid_from`,
> `superseded_by` — sobrevive com prefixo `x_`, porque o §4.1 manda os
> consumidores preservar chaves de produtor.

## A divergência que não se pode copiar à letra

O dreaming deles **funde e apaga** ("deletion IS authorized for true
duplicates after merging"). O nosso modelo **não apaga**: fecha `valid_to` e
aponta `superseded_by`. Quando escrevermos o dreaming, é a mesma ideia com o
comportamento oposto na escrita. Ver [[memoria-como-funciona]].

## A separação que torna possível haver centros de memória

Dentro de `docs/memoria/` viviam quatro coisas com tempos de vida diferentes,
misturadas. Passam a estar separadas:

| | o que é | viaja para outro centro? |
|---|---|---|
| `bin/` | **motor** (`mem.py`, esquema, ingestão) | sim, sempre |
| `projeto/` | `monitor.py` — sabe de preços, stock, imagens | **não**, é deste projeto |
| `notas/` | **biblioteca** deste projeto | é o que se migra |
| `estado/` | índice derivado | não, reconstrói-se |

O `monitor.py` estar em `bin/` era a armadilha: ao levar o motor para outro
projeto, ia atrás e levava regras de joalharia consigo.

**São duas raízes, não uma**, e ambas estavam coladas a `parents[3]`:

- **a biblioteca** (`notas/` + `estado/`) — onde a memória vive;
- **o projeto documentado** — o que o `ingerir.py` varre em busca de docs e
  commits, e o que o `monitor.py` inspeciona.

Numa migração para outro projeto, as duas deixam de coincidir. Parametrizar
custou minutos antes de existir web; depois de a web ter caminhos soldados
custaria um dia.

## O que ficou feito, e onde divergiu

Tudo o que estava na lista foi puxado, e três coisas mudaram de forma pelo
caminho:

**Percursos.** O trace do understory grava a travessia do agente LLM interno
dele. Nós não temos agente interno, portanto quem grava é o próprio `mem.py`:
cada busca abre um percurso com o que devolveu, e as leituras seguintes
penduram-se nele dentro de uma janela de 30 minutos. Uma leitura solta **não**
inventa um percurso — senão o registo enchia-se de percursos de um passo que
nada explicam. É telemetria e não memória: vive só no índice descartável, e
poda-se aos 400.

**Sonhar** (`bin/sonhar.py`). O que vale no dreaming deles é o **gatilho
determinístico**: sem sinais não corre e não custa nada. Copiou-se isso e
mudaram-se duas coisas de fundo. Primeira: **não escreve** — produz uma ordem
de trabalho para quem revê, porque neste sistema o código mede e aponta, nunca
inventa conteúdo. Segunda: **não apaga**. Onde o deles diz «deletion IS
authorized for true duplicates after merging», o nosso manda fechar `valid_to`
e apontar `superseded_by`. Há um teste que falha se alguma instrução passar a
mandar apagar. O nosso detector de duplicados continua a ser melhor: cosseno
sobre o corpo, e não semelhança de título e descrição.

**MCP** (`bin/mcp.py`). JSON-RPC 2.0 escrito à mão, ~230 linhas, zero
dependências — o que mantém a promessa de o motor viajar sozinho. Cinco
ferramentas: procurar, ler, estado, vizinhança, consolidar. Por stdio e também
em `/mcp` do servidor local. A **semente** é ideia deles e das melhores: o
`initialize` devolve um retrato da biblioteca em `instructions`, e a descrição
da ferramenta de procura repete-o, porque é o canal que todos os clientes
carregam. Um cliente que só veja cinco nomes de ferramenta nunca ganha o
instinto de consultar a memória.

**O que não se puxou:** a busca deles, e a escrita por MCP. Escrever notas
continua a passar pela revisão.

## A web vive isolada

`docs/memoria/web/`, servida por `mem.py servir`, a ligar a `127.0.0.1`, sem
`pnpm`/`Vite`/`Tailwind`/TypeScript — HTML e JS simples com `d3-force`
vendorizado. Nunca entra em nenhum compose de produção. Não se forkou o React
deles porque as 1 294 linhas de TSX assumem um modelo sem tempo: não há sítio
para vigência, domínio, cadeia de supersessão nem cursor de as-of, e é isso
que temos de melhor. Enxertar dava mais trabalho do que escrever.
