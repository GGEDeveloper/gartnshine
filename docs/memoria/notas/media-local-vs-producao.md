---
slug: media-local-vs-producao
tipo: decisao
dominio: infra
titulo: artnshine.pt — public/media/products local é um espelho incompleto; as fotos que faltam servem-se de https://artnshine.p
resumo: artnshine.pt — public/media/products local é um espelho incompleto; as fotos que faltam servem-se de https://artnshine.pt sem autenticação
valid_from: 2026-08-09
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
sources:
  - migracao:project_media_local_vs_producao.md
---

`gonzagas_node/public/media/products/` no WSL é um espelho **incompleto** de produção. Em 2026-08-09, de 18 famílias com imagens em BD, `Gargantilhas - Latão` (18 ficheiros) e metade de `Cuffs - Latão` (20 ficheiros) não existiam no disco local, e `Pulseiras Pé - Prata` tinha 6 produtos sem qualquer linha em `product_images` localmente — mas com fotos em produção. A divergência é do mesmo tipo que a de schema descrita em [[project-db-dev-vs-production]]: a BD local também está atrasada em relação a produção.

> **Verificado a 2026-08-18 — a lacuna concreta desapareceu.** Os **544**
> registos de `product_images` têm hoje **todos** ficheiro local: zero em
> falta. As três famílias citadas acima estão completas — `Gargantilhas -
> Latão` com 20 imagens, `Cuffs - Latão` com 33 e `Pulseiras Pé - Prata` com
> 6. Há 4903 ficheiros em `public/media/products/` (contando as variantes
> `-medium`, `-thumb` e `.webp`).
>
> **O princípio mantém-se e a nota fica aberta:** o disco local é um espelho e
> pode voltar a atrasar-se, e a base local continua a ter menos produtos do
> que produção ([[db-dev-vs-production]]). O que deixou de ser verdade é o
> sintoma de 2026-08-09, não a regra de confirmar em produção antes de
> declarar que falta uma fotografia.

Produção serve os ficheiros publicamente e sem autenticação:
`https://artnshine.pt/media/products/<image_filename>` (e as variantes `-full`, `-medium`, `-small`, `-thumb`, em `.jpg` e `.webp`) devolvem 200. A listagem de uma categoria em `https://artnshine.pt/categoria/<slug>` mostra os nomes de ficheiro reais quando a BD local não os tem.

**Why:** qualquer trabalho que percorra o catálogo por imagem (capas, SEO por fotografia, auditorias de ficheiros em falta) conclui erradamente que faltam produtos, quando o que falta é o ficheiro local.

**How to apply:** antes de dizer que uma família não tem fotos, confirmar em produção — por HTTP, não pelo disco local. Para trabalho de imagem, descarregar para uma pasta temporária em vez de escrever em `public/media/products/`, que é território de upload do admin.
