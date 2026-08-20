---
slug: memoria-como-funciona
tipo: procedimento
dominio: memoria
titulo: Como funciona esta biblioteca, e as medições que decidiram o desenho
resumo: A fonte de verdade são os markdown; o SQLite é índice descartável. Porquê híbrido, porquê português, porquê nada de RunPod.
keywords: agent memory, hybrid retrieval, BM25, vector search, RRF, bi-temporal, knowledge graph, embeddinggemma, sqlite-vec
valid_from: 2026-08-17
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - embeddinggemma
  - sqlite-vec
  - FTS5
  - Ollama
sources:
  - conversa:2026-08-17
  - ficheiro:docs/memoria/bin/mem.py
relations:
  - mem.py | indexa | notas
  - embeddinggemma | produz | vetores
---

## A regra que não se quebra

**A fonte de verdade são os ficheiros markdown em `docs/memoria/notas/`.**
O SQLite em `estado/indice.db` é índice **derivado e descartável**: se
corromper ou ficar estranho, apaga-se e corre-se `reconstruir`. Nunca escrever
conhecimento só na base de dados.

```
docs/memoria/.venv/bin/python docs/memoria/bin/mem.py buscar "pergunta"
docs/memoria/.venv/bin/python docs/memoria/bin/mem.py indexar     # o que mudou
docs/memoria/.venv/bin/python docs/memoria/bin/mem.py reconstruir # do zero
docs/memoria/.venv/bin/python docs/memoria/bin/mem.py auditar     # contradições
```

O ambiente é o `.venv` próprio da memória — o Python do sistema recusa
instalar pacotes (PEP 668).

## Porquê híbrido, e não só vetores

Medido com notas reais deste projecto, não em abstracto:

- «porque é que a prata fica **acastanhada**» encontra a nota que diz
  «lê-se **castanha**» — o grep falharia, a flexão portuguesa mata a busca
  lexical.
- «**rembg**» é um identificador exacto: o vector quase erra (0,393 contra
  0,390 para um distractor), o BM25 acerta em cheio.

Nenhum dos dois chega sozinho. Os dois rankings fundem-se por **Reciprocal
Rank Fusion**, que não precisa de calibrar escalas entre eles. Na saída,
`[LS]` diz que ambos os canais contribuíram — é sinal de resultado forte;
`[·S]` é só semântico e costuma ser mais fraco.

## Porquê português, e não inglês traduzido

Testado com a mesma nota nas duas línguas, medindo a margem sobre distractores:

| | pergunta PT | pergunta EN | média |
|---|---|---|---|
| nota em PT | **+0,2755** | +0,2089 | 0,2422 |
| nota em EN | +0,1724 | **+0,2865** | 0,2295 |
| PT + keywords EN | +0,2551 | +0,2638 | **0,2595** |

O inglês ganha no seu próprio par, mas só por +0,011 — ruído. Traduzir e
perguntar em português custa **40% da margem**. A expansão bilingue ganha em
média e nunca colapsa. Por isso: **corpo em PT-PT, campo `keywords` com os
termos EN**, que entra no BM25 e no vector.

Isto também guarda os termos de ofício — *cepo*, *argolas lavradas*,
*clarão cinza* — que uma tradução degradaria.

## Detalhes que mudam resultados

- **Os prefixos do EmbeddingGemma não são opcionais.** Documentos vão como
  `title: … | text: …` e perguntas como `task: search result | query: …`.
  Aplicá-los subiu a similaridade no alvo de ~0,50 para ~0,73.
- **O FTS5 usa `remove_diacritics 2`** e trata `-` e `_` como parte da
  palavra, para «memoria» achar «memória» e `cat-4-hero-1920` sobreviver
  inteiro.
- **A data de um documento vem do primeiro commit que o introduziu**, não do
  `mtime` — tocar num ficheiro reescreve o `mtime` e mente sobre a idade.

## Bi-temporalidade

Cada nota tem `valid_from`/`valid_to` (quando foi verdade no mundo) e
`ingested_at` (quando o sistema soube). Um facto corrigido **não se apaga**:
fecha-se com `valid_to` e aponta-se `superseded_by` ao sucessor. Assim
`buscar --as-of 2025-11-15` devolve o que era verdade nessa data, e
`--incluir-expirado` alcança o histórico.

## Hardware, e o que não é preciso

GTX 1050 Ti com 4 GB. O `embeddinggemma` (308M) ocupa 1,36 GB e faz **0,649 no
MTEB-BR — 13.º de 93 modelos, a 0,033 do líder**, que é uma API fechada.
Chega e sobra.

**RunPod não é preciso.** Os 391 MB de transcripts em disco contêm apenas
**1,0 MB de texto conversacional**; o resto é saída de ferramentas. Alugar GPU
para processar 1 MB seria desproporcionado. Guardar essa opção para uma
re-extracção completa com um modelo grande, se alguma vez fizer falta.

## Ontologia

Sete tipos — `decisao`, `facto`, `estado`, `procedimento`, `entidade`,
`preferencia`, `referencia` — cruzados com um eixo ortogonal de domínio:
`memoria`, `loja`, `catalogo`, `fotografia`, `marca`, `infra`, `bd`, `seo`,
`admin`, `negocio`, `geral`. O domínio `memoria` é este segmento meta.

Um `facto` é invariante; um `estado` expira e há-de ser fechado; uma `decisao`
guarda o porquê e as alternativas recusadas; um `procedimento` diz como se faz.

### Retrospectiva é `facto`, não `estado`

Erro cometido e corrigido na travessia de 2026-08-17: as notas de fase
(«o que aconteceu em Fevereiro de 2026») foram escritas como `estado`, e a
auditoria sinalizou-as todas como vencidas sem sucessor.

A auditoria tinha razão pela regra e estava errada no fundo, porque a
classificação é que estava mal. **Uma retrospectiva descreve um período
fechado, mas a afirmação sobre esse período não expira** — que em Fevereiro
de 2026 se trocou o azul por prata é verdade para sempre.

Regra prática: se a nota tiver de ser **reescrita** quando o mundo mudar, é
`estado`. Se só puder ser **acrescentada**, é `facto`. `trabalho-em-curso` é
estado; `fase-4-fevereiro-2026` é facto.

### Auditar antes de dar por concluído

Foi a auditoria automática que apanhou este erro, não a revisão à mão. Correr
`auditar` depois de escrever em lote — apanha estados por fechar, notas sem
proveniência e pares acima de 0,88 de semelhança.

> **Verificado a 2026-08-19.** Tudo acima continua verdade. O sistema cresceu
> por baixo desta nota, e isto é o que ela ainda não dizia.

## O que se acrescentou em 2026-08-18/19

**O grafo passou a ser das notas, e não das entidades.** Os `[[wikilinks]]`
do corpo viram arestas na tabela `note_links` — uma ligação escrita à mão vale
muito mais do que a co-ocorrência de entidades, que era ruído. Ver
[[memoria-grafo-wikilinks]].

**Há uma UI.** `mem.py servir` abre a memória em `127.0.0.1:7373`: ficha de
cada nota, grafo, percursos e o sonho. Sem passo de build. Ver
[[memoria-understory-e-ui]] para o porquê de não se ter forkado o understory.

**Percursos.** Cada busca regista o que devolveu, e as leituras seguintes
penduram-se nela dentro de 30 minutos. Serve para ver, sobre o grafo, o
caminho que uma pergunta percorreu. É telemetria e não memória: vive só no
índice, e poda-se aos 400.

**`mem.py sonhar`** mede o que há a consolidar sem perguntar nada a um modelo
generativo. Dez frentes, das quais três medem a biblioteca **contra o
repositório** e não contra si própria: proveniência que aponta a ficheiros que
já não existem, notas cujo ficheiro de origem mudou depois de elas terem sido
conferidas, e notas que afirmam coisas sobre o mundo sem verificação há mais
de quatro meses. Foi este sinal que apanhou esta nota.

**`capturar.py propor`** faz a pergunta inversa: dado o que mudou no
repositório, que notas já são donas desse território? É de aí que sai a
decisão entre **enriquecer, suceder e criar** — sem ela, a biblioteca enche-se
de notas quase iguais sobre o mesmo ficheiro.

**Servidor MCP** (`bin/mcp.py`), JSON-RPC à mão, sem dependências. Cinco
ferramentas, por stdio e em `/mcp`. O `initialize` devolve um retrato da
biblioteca, e a descrição da ferramenta de procura repete-o — um cliente que
só veja nomes de ferramentas nunca ganha o instinto de consultar a memória.

**Duas raízes, e não uma.** `MEM_BIBLIOTECA` (onde a memória vive) e
`MEM_PROJETO` (o repositório documentado) deixaram de ser o mesmo caminho
soldado. O `monitor.py` saiu de `bin/` para `projeto/`: `bin/` é motor e
viaja, `projeto/` sabe de preços e stock e fica.

**O índice põe-se em dia sozinho.** O `conectar()` compara um hash do
`esquema.sql` com o que está no `meta`; quando o esquema cresce, aplica-o.
Antes, a primeira busca depois de uma tabela nova rebentava com
*no such table*.

As armadilhas de ferramenta — o `ugrep` que exige `--`, o hook que precisa
do stdin guardado — estão à parte em [[memoria-armadilhas-tecnicas]], e o
que a bateria mede e porquê está em [[memoria-qualidade-medida]].

### Duas armadilhas novas, pagas

**Vectores órfãos.** Apagar uma nota levava os fragmentos mas deixava os
vectores: `chunks_vec` é tabela virtual e não tem cascata. O sintoma não é um
erro — é **recall que se perde em silêncio**, porque cada órfão ocupa lugar no
`k=60` da busca vectorial e é depois descartado sem ninguém dar por isso.

**O ollama descarrega o modelo.** Com a injecção automática em cada pergunta,
o arranque a frio (2,1 s contra 240 ms) passaria a ser a experiência normal.
Resolve-se com `keep_alive` no pedido de embedding.

> **Verificado a 2026-08-20.** O que está acima mantém-se. Entraram desde
> ontem três coisas que a nota ainda não dizia:
>
> - **`bin/okf.py`** exporta a biblioteca como bundle Open Knowledge Format
>   v0.2 — derivado e descartável, como o índice. Exportar em vez de adoptar
>   evita duplicar campos dentro das notas.
> - **Tipagem de entidades**, com a fronteira no sítio certo: o motor
>   reconhece ficheiros e símbolos, que valem em qualquer projecto, e o que é
>   um `PPU0080` vive em `projeto/entidades.json`. O que não se prova fica por
>   tipar — um tipo errado afirmado com confiança mente mais do que nenhum.
> - **O desconto ao segmento meta passou a ser condicional.** Ver
>   [[memoria-qualidade-medida]].
