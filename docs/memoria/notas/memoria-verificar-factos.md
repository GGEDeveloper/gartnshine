---
slug: memoria-verificar-factos
tipo: procedimento
dominio: memoria
titulo: Como manter as notas verdadeiras — verificar contra a realidade, não contra a memória
resumo: O processo de auditoria factual: que afirmações verificar, como distinguir facto histórico de estado obsoleto, e os erros de contagem que já enganaram este projecto.
keywords: fact checking, note maintenance, stale data, verification, counting errors, file extensions, superseded facts
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - gallery_items
  - product_images
  - monitor.py
sources:
  - conversa:2026-08-18
relations:
  - monitor.py | verifica | notas
---

Uma biblioteca com números velhos é pior do que não ter biblioteca: dá
confiança a quem lê. Este é o processo que se seguiu na auditoria de
2026-08-18, e que se deve repetir.

## O que se verifica

Qualquer afirmação **contável**: número de produtos, de fotografias, de
ficheiros; se uma pendência foi resolvida; se um serviço está configurado.
Não se verificam juízos («as montagens compostas foram reprovadas») nem
decisões — esses não têm valor de verdade que envelheça.

## Como decidir o que fazer com um facto que mudou

| Situação | Acção |
|---|---|
| A nota descreve **o que se fez** numa data | Fica `facto`. Acrescenta-se bloco `> Verificado a <data>` com os números novos. |
| A nota afirma **estado presente** que mudou | Corrigir o corpo **e o título/resumo** — o título aparece na busca. |
| O **problema** que a nota descrevia desapareceu | Se o princípio se mantém, actualizar e deixar aberta. Se caducou, fechar com `valid_to` e `superseded_by`. |
| A nota é **retrospectiva** | `facto`, nunca `estado` — ver [[memoria-como-funciona]]. |

**O título e o resumo são o que a busca mostra.** Uma nota cujo corpo foi
corrigido mas cujo título ainda mente continua a enganar.

## Erros de contagem já cometidos aqui

- **Contar uma só extensão.** A galeria foi dada como tendo 72 imagens porque
  se contou `*.jpg`. Tem **88**: 72 `.jpg` mais 16 `.jpeg`, e ainda um `.mp4`.
  Contar sempre o conjunto de extensões, não a que se espera.
- **Contar ficheiros em vez de frentes.** `git status --porcelain` lista cada
  ficheiro; 45 fotografias soltas são **um** trabalho, não 45. Agregar por
  pasta.
- **Confiar no `mtime`.** A data de um documento é a do primeiro commit que o
  introduziu (`git log --diff-filter=A`); o `mtime` muda ao tocar no ficheiro.
- **Contar worktrees.** `.claude/worktrees/` duplica os markdown do
  repositório: uma contagem ingénua deu 3099 ficheiros quando os reais são
  cerca de 60.

## O que a auditoria de 2026-08-18 corrigiu

- `lote-julho-2026` — o título afirmava «PPU0072–0078 sem foto»; **têm foto**
  desde 2026-08-11, carregadas manualmente pelo admin. `PAN0075` na família
  errada continua por corrigir.
- `seo-naming-2026-07` — 328 produtos passaram a **511**; zero por nomear;
  `LTCU0016` tem nome mas continua sem imagem.
- `media-local-vs-producao` — a lacuna concreta desapareceu: **544 registos,
  zero sem ficheiro local**. O princípio ficou.
- `fotografia-ambiente-2026-08` — 43 fotografias passaram a **88**.
- `conta-obrigatoria-checkout` — SMTP **continua** por configurar, confirmado.
- `estado-2026-07-30` — fechado, com o invariante extraído para
  [[brand-config-fonte-unica]].

## Automatizar o que se pode

O que é contável e importa deve entrar no `monitor.py`, em vez de viver só
numa nota que envelhece. Foi assim que nasceram as verificações de peso
implausível e de registos de galeria sem ficheiro. Ver
[[catalogo-monitorizar]].

Regra: **se um número numa nota puder ser medido por um comando, esse comando
pertence ao monitor** — a nota fica com o porquê, o monitor com o quanto.
