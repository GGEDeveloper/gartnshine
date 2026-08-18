---
slug: memoria-armadilhas-tecnicas
tipo: procedimento
dominio: memoria
titulo: Armadilhas técnicas do sistema de memória — ugrep, hooks e o que sujou o grafo
resumo: O grep desta máquina é ugrep e exige `--`; o hook precisa do stdin guardado; a co-ocorrência é o que dá vida ao grafo.
keywords: ugrep, grep double dash, hook stdin, PostToolUse, co-occurrence graph, entity normalisation, async hook
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - hook-sessao.sh
  - ugrep
  - mem.py
sources:
  - conversa:2026-08-18
  - ficheiro:docs/memoria/bin/hook-sessao.sh
relations:
  - hook-sessao.sh | reindexa | notas
---

Coisas que custaram tempo a descobrir e não são óbvias.

## O `grep` desta máquina é o ugrep

`grep -qxF "$linha"` **falha** quando a linha começa por `-`: o ugrep lê-a como
opção e devolve `invalid option`. O sintoma é traiçoeiro — o comando não
rebenta, apenas devolve o código errado, e a desduplicação passa a escrever
sempre.

```bash
grep -qxF -- "$linha" "$ficheiro"   # o -- não é opcional
```

Diagnosticou-se comparando os bytes com `od -c`: eram idênticos dos dois
lados, o que excluiu problema de codificação e apontou ao parser de opções.

## O hook tem de guardar o stdin

O JSON do hook chega por stdin e **só se pode ler uma vez**. Um `cat
>/dev/null` para o drenar deita fora o caminho do ficheiro de que o modo
`reindexar` precisa. Guardar primeiro:

```bash
STDIN="$(timeout 5 cat 2>/dev/null || true)"
```

O `timeout` protege de um hook que fique pendurado à espera de stdin que nunca
fecha.

## Reindexação automática

`PostToolUse` com `matcher: "Write|Edit"` dispara em **todos** os ficheiros do
projecto, não só nas notas. O filtro tem de ser feito dentro do script:

```bash
case "$caminho" in
  *docs/memoria/notas/*.md) indexar ;;
esac
```

Medido: 0,03 s quando ignora, ~1–5 s quando reindexa. Corre com `async: true`,
por isso não bloqueia a resposta.

## Contar notas, não linhas de `git status`

Uma pasta ainda não versionada aparece como **uma** linha em `git status
--porcelain` — dava sempre «1 nota alterada» com 35 por versionar. É preciso
`--untracked-files=all` e contar os `.md`.

## O que deu vida ao grafo: co-ocorrência

Só as relações escritas à mão no front-matter davam **17 relações para 155
entidades — 91% sem qualquer ligação**. O grafo existia e não servia para nada.

A correcção foi ligar automaticamente todas as entidades citadas pela mesma
nota (`co_ocorre_em`): passou a **498 relações**. É sinal fraco mas útil —
`grafo PAN0075` mostra agora com que peças e ficheiros essa referência aparece,
em que notas.

Na apresentação, as relações declaradas vêm primeiro e as co-ocorrências
agrupam-se por nota, para não afogar as primeiras. `--so-explicitas` esconde-as.

## Entidades precisam de filtro

A extracção ingénua apanhou sufixos (`-medium.jpg`, `-hero-1920.jpg`),
caminhos soltos (`/dados.js`) e literais de cor (`#B9A06A`). O `mem.py` tem
agora `entidade_valida()` e `normalizar_entidade()`; caminhos com mais de uma
barra reduzem-se ao nome do ficheiro. Passou de 155 entidades sujas para 146
limpas.

## Um UUID não é um título

Os fragmentos de transcript tinham como referência o UUID da sessão. Passam a
mostrar `conversa <data>`, que é o que permite a alguém situar-se.
