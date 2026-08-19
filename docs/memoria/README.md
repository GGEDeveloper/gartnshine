# Biblioteca de memória

A fonte de verdade são os markdown em `notas/`. Tudo o resto é derivado e
descartável: apagar `estado/` e correr `mem.py reconstruir` regenera-o.

    bin/mem.py buscar "..."      procurar (BM25 + vectorial, fundidos por RRF)
    bin/mem.py servir            abrir no browser: grafo, fichas, percursos, sonho
    bin/mem.py sonhar            o que há a consolidar
    bin/mem.py percursos         como se chegou às últimas respostas
    bin/capturar.py propor       quem já é dono do que se mexeu, antes de escrever
    bin/okf.py                   exporta um bundle Open Knowledge Format v0.2
    bin/mem.py auditar           contradições, obsolescência, órfãs
    bin/mem.py estado            números do índice
    bin/mcp.py                   servidor MCP por stdio
    bin/testar.py                a bateria toda

## Quatro coisas com tempos de vida diferentes

| | o que é | viaja para outro centro de memória? |
|---|---|---|
| `bin/` | **motor** — genérico, não sabe nada de joalharia | sim, sempre |
| `notas/` | **biblioteca** deste projeto | é o que se migra |
| `projeto/` | `monitor.py` e `entidades.json` — sabem de preços, stock e do que é um «PPU0080» | **não**, ficam |
| `estado/` | índice derivado (SQLite) | não, reconstrói-se |

Manter esta divisão é o que permite levar o motor para outro sítio sem levar
regras deste negócio atrás.

## Duas raízes, e não uma

    MEM_BIBLIOTECA   onde a memória vive (notas + índice). Por omissão, esta pasta.
    MEM_PROJETO      o repositório documentado — o que o `ingerir` varre.
    MEM_TRANSCRIPTS  as conversas do Claude Code. Deriva do MEM_PROJETO.

Coincidem neste repositório e deixam de coincidir assim que a mesma biblioteca
servir outro projeto. Se mudares `MEM_BIBLIOTECA` sem dizer o projeto, o
projeto passa a ser a própria biblioteca — nunca a raiz do sistema de
ficheiros, que poria o `ingerir` a varrer o disco inteiro.

## O que é próprio deste sistema

- **Bi-temporal.** `valid_from`/`valid_to`/`superseded_by` respondem a *o que
  era verdade a 30 de julho*. **Nada se apaga**: fecha-se e aponta-se sucessor.
- **Busca híbrida.** FTS5 com `remove_diacritics 2` e `tokenchars '-_'` (para
  `PPU0080` e `cat-4-hero-1920` serem termos) + 768 dims do `embeddinggemma`
  local, fundidos por RRF. Zero custo de API.
- **Cobre mais do que as notas.** Documentos, transcrições e commits também
  são indexados, para se poder responder «isto já foi discutido?» antes de
  existir nota.
- **Grafo de ligações escritas à mão.** Os `[[wikilinks]]` do corpo são as
  arestas — sinal muito mais forte do que a co-ocorrência de entidades.
- **Determinístico.** Nenhum comando chama um modelo generativo. O código mede
  e aponta; escrever notas é sempre decisão de quem revê.
- **Mede-se contra o mundo, e não só contra si.** Um lint de grafo pode dar
  tudo verde com as notas todas mentira. O `sonhar` confronta a proveniência
  de cada nota com o repositório: ficheiros que desapareceram, ficheiros que
  mudaram depois de a nota ter sido conferida, e notas que afirmam coisas
  sobre o mundo sem verificação há meses. Confirmar uma nota é deixar-lhe um
  bloco `> Verificado a <data>`.
- **Antes de escrever, pergunta-se de quem é o território.** O
  `capturar.py propor` diz que notas já declaram vir dos ficheiros que
  mudaram, e daí sai enriquecer / suceder / criar. É o que impede a
  biblioteca de se encher de notas quase iguais.

## Interoperar sem adoptar

`bin/okf.py` exporta a biblioteca como um bundle **Open Knowledge Format
v0.2**, legível por qualquer ferramenta do formato. O bundle é **derivado e
descartável**, como o índice: regenera-se, nunca se edita à mão. Exportar em
vez de adoptar evita duplicar campos dentro das notas, que era o caminho certo
para os dois lados divergirem.

O OKF v0.2 acomoda mais do que se esperava:

| nosso | OKF |
|---|---|
| `tipo` / `titulo` / `resumo` | `type` / `title` / `description` |
| `> Verificado a <data>` | `verified: [{ by, at }]` |
| `valid_to` preenchido | `status: deprecated` |
| a política dos 4 meses do `sonhar` | `stale_after` — deixa de ser implícita |
| `[[wikilink]]` | ligação absoluta `](/dominio/slug.md)`, a forma recomendada |

O que ele não modela — `valid_from`, `superseded_by`, a cadeia de supersessão
— sobrevive com o prefixo `x_`: o §4.1 diz que produtores podem acrescentar
chaves e que os consumidores devem preservá-las.

## A fronteira entre motor e negócio

O motor sabe reconhecer **ficheiros** e **símbolos**, porque isso vale em
qualquer projecto. O que é um «produto», uma «categoria» ou uma «tabela» é
conhecimento deste negócio e vive em `projeto/entidades.json` — tipo para
lista de expressões regulares. Sem esse ficheiro, o motor tipa só o que é
universal e deixa o resto por tipar, que é a resposta honesta: **um tipo
errado afirmado com confiança mente mais do que a ausência de tipo.**

Isto não é só uma intenção: há um teste que constrói **uma segunda biblioteca
noutro projeto** — notas sobre Go, num repositório sem nada de joalharia — e
verifica que o motor a serve inteira, que `PPU0080` **não** é tipado como
produto por lá, e que nenhuma nota deste projeto foi arrastada. Enquanto isso
não corria, a portabilidade era uma afirmação.

Ver `notas/memoria-como-funciona.md`, `notas/memoria-understory-e-ui.md` e
`web/README.md`.
