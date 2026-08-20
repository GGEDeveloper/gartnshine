---
slug: memoria-grafo-wikilinks
tipo: facto
dominio: memoria
titulo: O grafo bom estava escrito nas notas desde sempre e nunca tinha sido lido
resumo: 487 das 506 relações eram co-ocorrência e as 152 entidades não tinham tipo. Os 90 wikilinks do corpo não eram parseados; passados a arestas, dão 35 das 37 notas numa única componente ligada.
keywords: wikilinks, knowledge graph, graph density, connected components, orphan notes, co-occurrence noise, note_links
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - note_links
  - co_ocorre_em
  - db-dev-vs-production
sources:
  - conversa:2026-08-18
  - ficheiro:docs/memoria/bin/esquema.sql
relations:
  - wikilinks | alimentam | note_links
---

## O que estava mal

O grafo tinha **506 relações, das quais 487 eram `co_ocorre_em`** — apenas 19
tipadas. As **152 entidades tinham todas `tipo` a NULL**: a coluna existe no
esquema e nada a preenchia. Desenhar isto seria um novelo bonito que não diz
nada.

E a informação boa estava lá, por ler: **90 ligações `[[wikilink]]` escritas à
mão no corpo das notas, em 33 das 37**. O `indexar_notas` só olhava para o
`entities:`/`relations:` do frontmatter — **os wikilinks nunca viravam
arestas**.

Havia ainda **19 alvos partidos**, todos com o prefixo `project-` herdado da
migração da auto-memória (`[[project-db-dev-vs-production]]` para uma nota cujo
slug é `db-dev-vs-production`). Mapeavam todos 1:1.

## O que se fez

Tabela `note_links(src, dst, resolve)` — **um eixo distinto do grafo de
entidades**: aqui os nós são as próprias notas e a aresta foi escrita por uma
pessoa, o que é sinal muito mais forte do que a co-ocorrência. Alvos partidos
não se apagam, ficam com `resolve=0` para o lint os apontar.

`resolve` é recalculado **no fim** da indexação, não durante: uma nota pode
citar outra que ainda não foi indexada nessa passagem.

**Armadilha:** `mem.py indexar` salta as notas cujo hash não mudou, portanto
depois de acrescentar extracção nova é preciso `indexar_notas(db, forcar=True)`
— senão só as notas tocadas ganham arestas. Deu 19 de 37 à primeira.

## O grafo que apareceu

```
90 ligações, 0 partidas          2,4 arestas por nota
35 das 37 notas numa única componente ligada
2 ilhas: memoria-armadilhas-tecnicas, seguranca-chaves-stripe
7 notas que ninguém cita

centros:  db-dev-vs-production (10)   marca-gonzaga-2026-08-04 (8)
          seo-audit-2026-07-30 (7)    lote-julho-2026 (6)
```

Que os centros do grafo sejam a base de dados, a marca e o SEO diz mais sobre
o projeto do que qualquer contagem de notas.

**Segunda armadilha, apanhada pela própria auditoria:** esta nota foi a
primeira a aparecer com ligações partidas, porque *explica* a sintaxe e
escrevia `[[wikilink]]` como exemplo em prosa — e o extractor leu o exemplo
como ligação a sério. O extractor passou a retirar blocos e trechos de código
antes de procurar. Uma nota sobre uma sintaxe é sempre o primeiro sítio onde
essa sintaxe se auto-invoca por engano.

Há UI para isto: `mem.py servir` abre a memória no browser, com o grafo, a
ficha de cada nota e a auditoria. Ver [[memoria-understory-e-ui]].

O `mem.py auditar` ganhou o lint correspondente: ligações para notas que não
existem, e notas que ninguém cita (com distinção de **ilha**, quando também não
citam ninguém). Ver [[memoria-understory-e-ui]] e [[memoria-como-funciona]].

> **Verificado a 2026-08-20.** O grafo fechou: **44 notas numa única
> componente ligada, 121 ligações, zero partidas e zero ilhas** — contra as 3
> componentes e 2 ilhas de quando esta nota foi escrita. As seis órfãs foram
> costuradas a partir de quem genuinamente lhes tocava, dentro de frases que
> já existiam.
>
> O `esquema.sql` cresceu com a tabela `traces`, que é telemetria dos
> percursos e não toca neste grafo.
