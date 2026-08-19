---
slug: fork-memoria-permanente
tipo: decisao
dominio: infra
titulo: O ramo `memoria` é permanente e nunca vai à main — o fluxo é de sentido único
resumo: Ramo que vive para sempre ao lado da main e se actualiza a partir dela; merge e não rebase, porque está publicado. E as pastas `temporario-*` ficam fora do git.
keywords: long-lived branch, permanent fork, one-way sync, merge vs rebase, published branch, gitignore, binary assets in git, repository size
valid_from: 2026-08-19
valid_to:
ingested_at: 2026-08-19T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - sincronizar-com-main.sh
  - temporario-nova-media
  - temporario-novo-stocks
sources:
  - conversa:2026-08-19
  - ficheiro:docs/memoria/projeto/sincronizar-com-main.sh
  - ficheiro:.gitignore
relations:
  - memoria | deriva-de | main
---

## A decisão

O sistema de memória vive no ramo **`memoria`**, que é permanente. Não é uma
feature branch à espera de integração: **nunca vai à main.**

```
main  ──────>  memoria      sim, sempre que a main andar
memoria  ──X──>  main       nunca
```

Trazer o que se desenvolveu na main faz-se com
`docs/memoria/projeto/sincronizar-com-main.sh`, que recusa correr fora do ramo
e recusa integrar com a árvore suja — misturar trabalho por guardar com o que
vem da main faz com que depois não se saiba de quem é cada linha do conflito.

**Merge e não rebase.** O ramo está publicado em `origin/memoria`; reescrever
o histórico obrigava a um push forçado, que estraga qualquer cópia já clonada.
É o mesmo género de armadilha de [[git-divergence-2026-06-23]].

Ao resolver conflitos: o que vem da main ganha no código da aplicação; o que
está no ramo ganha em `docs/memoria/`, que a main não conhece.

## O que ficou fora do git, e porquê

Estavam 2,86 GB por versionar. Entraram os **262 MB** que o site serve —
1035 fotografias de produto, 45 da galeria, duas capas — porque `public/media`
já tinha 3986 ficheiros versionados e porque isso fecha em parte a lacuna de
[[media-local-vs-producao]], onde o local estava incompleto e a produção
servia por HTTP o que faltava.

**Ficaram fora os 2,59 GB de `temporario-nova-media/` e
`temporario-novo-stocks/`**, agora no `.gitignore`. São a bancada da
fotografia e não entregáveis: das 580 catalogadas em Agosto de 2026 foram
escolhidas 45 (ver [[media-nova-2026-08]]), e o resto são originais em bruto e
vídeo. O git guarda **todas as versões para sempre**, e cada clone passaria a
arrastar 2,6 GB — o `.git` já pesa 1,3 GB. O que é escolhido passa a
`public/media/`, esse sim versionado.

Verificado antes de commitar: nenhuma chave da Stripe, AWS, token ou chave
privada nos ficheiros de texto pendentes. Ver [[seguranca-chaves-stripe]].
