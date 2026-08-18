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
