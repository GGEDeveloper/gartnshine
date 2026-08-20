---
slug: memoria-qualidade-medida
tipo: facto
dominio: memoria
titulo: Qualidade do retrieval medida — e as duas coisas que a estragavam
resumo: 71 testes, precisão@3 de 100%. Chegou lá depois de dar precedência às notas sobre os documentos-fonte e de pôr ponte bilingue numa nota escrita em inglês.
keywords: retrieval evaluation, precision at k, test suite, source weighting, note precedence, bilingual bridge, RAG quality
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - testar.py
  - PESO_FONTE
  - waphix-production-infra
sources:
  - ficheiro:docs/memoria/bin/testar.py
  - conversa:2026-08-18
relations:
  - testar.py | avalia | mem.py
---

`docs/memoria/bin/testar.py` — **71 testes, 30 segundos**, código de saída 1 se
algum falhar. Correr depois de mexer no `mem.py`.

```
docs/memoria/.venv/bin/python docs/memoria/bin/testar.py
docs/memoria/.venv/bin/python docs/memoria/bin/testar.py --so retrieval -v
```

Grupos: retrieval (22 perguntas com alvo conhecido), valor do híbrido,
bi-temporalidade, integridade índice↔ficheiros, robustez, embeddings,
scripts auxiliares e reconstrutibilidade.

## Resultado

| | Valor |
|---|---|
| precisão@1 | **86%** (19/22) |
| precisão@3 | **100%** (22/22) |
| busca mais lenta | < 3 s |
| bateria completa | 30,3 s |

## Descoberta 1: os documentos-fonte afogavam as notas

Quando a ingestão completa entrou (109 → 2024 fragmentos), a **precisão@3 caiu
de 100% para 77%**. A causa: um documento original repete o termo procurado
muito mais vezes do que a nota curada, por isso ganha no BM25.

- «rembg» devolvia `scripts/category-headers/README.md`, não a nota.
- «público-alvo e cores proibidas» devolvia o próprio
  `brand_bible_profissional.md`.
- «prata acastanhada» devolvia um DEPLOY, um transcript e o `git-log` — **nenhuma
  nota no top-3**.

A correcção está em `PESO_FONTE`, aplicado ao RRF antes de ordenar:

```python
PESO_FONTE = {"nota": 1.6, "doc": 1.0, "transcript": 0.9, "commit": 0.8}
```

**Uma nota é conhecimento destilado e verificado; um doc ou um transcript é
matéria-prima.** Ambos devem estar no índice — só não devem valer o mesmo.
Precisão@3 subiu de 77% para 95%.

## Descoberta 2: uma nota em inglês não responde a perguntas em português

O caso que sobrava era o `waphix-production-infra`: título, resumo e corpo
**todos em inglês**, herdados da migração. «a produção corre em docker num
servidor próprio» não a alcançava.

É a confirmação prática da medição que decidiu o desenho da biblioteca (ver
[[memoria-como-funciona]]): perguntar numa língua a uma nota escrita noutra
custa cerca de 40% da margem.

Não se traduziu o corpo — é técnico e a tradução degradaria os termos. Pôs-se
**título e resumo em português e keywords bilingues**, que é a ponte prevista.
Precisão@3 passou de 95% para **100%**.

**Regra:** qualquer nota cujo corpo esteja numa língua precisa de título e
`keywords` na outra. A ponte é obrigatória, a tradução não.

## O que os testes garantem

- Injecção de SQL na pergunta não toca na base; `notes` fica intacta.
- Pergunta vazia, só espaços, só acentos, emoji, operadores FTS soltos e 500
  caracteres não rebentam.
- Cada fragmento tem vector e entrada no FTS — índice sincronizado.
- `superseded_by` aponta sempre a notas existentes.
- Nenhuma entidade inválida entra no índice.
- `reconstruir` recupera todas as notas e a busca continua a funcionar — a
  promessa de o índice ser descartável está verificada, não assumida.

Nota sobre o teste de reconstrutibilidade: ele corre `reconstruir` **sem**
`--completo`, o que deixaria o índice só com notas. Por isso faz cópia antes e
repõe-na no fim. Se for interrompido a meio, correr
`mem.py reconstruir --completo` para repor os 2024 fragmentos.

> **Verificado a 2026-08-19.** As duas descobertas acima mantêm-se. A bateria
> passou de 71 para 222 testes, e a precisão@3 continua em 100% com 23 casos.
> Apareceu uma terceira coisa a estragar o retrieval, e era minha.

## Descoberta 3: o desconto meta trocava um erro por outro

O `DESCONTO_META` existia para um problema real: as notas de `dominio=memoria`
citam termos dos outros domínios como **exemplos** («o rembg devolvia o
README…»), e por isso apareciam no topo de perguntas que nada tinham a ver com
elas. Descontá-las a 0,7 resolvia isso.

Só que descontava **sempre** — inclusive quando a pergunta era mesmo sobre o
sistema de memória. Medido a 2026-08-19, com a biblioteca já em 44 notas:

| | com desconto | sem desconto |
|---|---|---|
| «rembg» | `fotografia-ambiente` ✓ | `memoria-como-funciona` ✗ |
| «como funciona a busca desta memória» | `fork-memoria-permanente` ✗ | `memoria-como-funciona` ✓ |

Um desconto plano só troca um erro pelo outro. **A pergunta sobre a memória
passou a ser respondida com uma nota sobre ramos de git**, que é pior do que o
problema original.

### O discriminador, e porque é mensurável

Quando a pergunta é genuinamente sobre o sistema, as notas meta ocupam o
resultado **inteiro**; quando entram por um exemplo que citam, são minoria
entre resultados de outros domínios. Medido já com o peso por fonte aplicado:

|  | top3 | top5 | top8 |
|---|---|---|---|
| «rembg» | 67% | 60% | **50%** |
| «como funciona a busca desta memória» | 100% | 100% | **100%** |
| «prata acastanhada» | 0% | 20% | 12% |
| «peças a zero euros» | 0% | 0% | 0% |

A **top8** a margem é a mais larga — 50% contra 100% — e uma janela maior é
menos sensível a uma nota mudar de lugar. Daí `AMOSTRA_META = 8` e
`FRACAO_META = 0.8`: o desconto só se aplica quando as notas meta são menos de
80% dos oito primeiros candidatos.

**A ordem das passagens importa e enganou-me duas vezes.** A fracção tem de
ser medida **depois** de aplicar o `PESO_FONTE`: antes disso os documentos e
transcrições ainda cá estão em força e falseiam a proporção. Adivinhei o
limiar duas vezes antes de o medir, e nas duas errei.

### O que isto custou noutro sítio

A precisão@1 desceu de 86% para 82% ao longo desta sessão, enquanto a
biblioteca crescia de 37 para 44 notas — mais notas competem pelo primeiro
lugar. Os casos que ainda perdem o @1 são de **identificador exacto**
(`PPU0036`, «prata acastanhada»), em que um documento que repete muitas vezes
o termo bate a nota, mesmo com o `PESO_FONTE` de 1,6 a favor das notas. Fica
por resolver, e a bateria afere pelo @3, que se mantém em 100%.
