---
slug: seguranca-chaves-stripe
tipo: estado
dominio: infra
titulo: Chaves da Stripe em texto simples na base de dados — em aberto
resumo: A sk_live está sem cifragem em ecommerce_settings e nos dumps de docs/db/; o git já está protegido, a cifragem continua adiada.
keywords: Stripe secret key, sk_live, plaintext secrets, database settings, gitignore, credential exposure, encryption at rest
valid_from: 2026-08-17
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - stripe_secret_key
  - stripe_webhook_secret
  - ecommerce_settings
  - docs/db
sources:
  - conversa:2026-08-17
  - ficheiro:.gitignore
relations:
  - ecommerce_settings | guarda_sem_cifra | stripe_secret_key
---

Item que o utilizador adiou explicitamente em 2026-07-31 («fazemos isso agora
no fim de tudo»), registado aqui à parte porque estava enterrado num estado
que entretanto expirou, e porque a verificação de 2026-08-17 mostrou que é
mais grave do que parecia.

## O que está confirmado

Na tabela `ecommerce_settings` da base local:

| setting | comprimento | natureza |
|---|---|---|
| `stripe_publishable_key` | 107 | publicável (sem risco) |
| `stripe_secret_key` | 107 | **`sk_live` — produção, dinheiro real** |
| `stripe_webhook_secret` | 38 | preenchido |

**Sem cifragem** — não há `encrypt`/`decrypt` em nenhum caminho que leia estas
definições. Quem tiver leitura na base tem a chave de produção.

Nota: a chave é `sk_live`, não `sk_test`. Está numa base de
**desenvolvimento**, que é onde menos devia estar.

## O que já foi tratado

Os dois dumps `docs/db/*.sql.gz` de 2026-07-09 contêm-na. **Não estavam
ignorados pelo git**, e o repositório tem remoto em
`github.com/GGEDeveloper/gartnshine`. Um `git add docs/` — precisamente o que
é preciso fazer para versionar esta biblioteca de memória — apanhava-os.

Corrigido a 2026-08-17: `docs/db/` e `*.sql.gz` entraram no `.gitignore`.
Verificado depois: `git add docs/` apanha 36 ficheiros da memória e **zero
dumps**.

## O que foi verificado e está limpo

- **Nenhuma chave real no histórico do git.** Os dois commits que mencionam
  `sk_live` tocam apenas no `.env.example`, que tem placeholders
  (`sk_live_CHANGE_ME`, 17 caracteres).
- Os dumps antigos rastreados (`db_backups/`, `db-base-local/`,
  `aa-temporary/`) são anteriores à Stripe e não contêm chaves.
- O `.env` local **não** tem variáveis `STRIPE_*` e nunca foi rastreado.

## O que continua por fazer

1. **Rodar a chave.** Esteve em texto simples numa base de desenvolvimento e
   em dumps não protegidos durante mais de um mês. Rodar na Stripe é barato e
   fecha a exposição de vez.
2. **Cifrar em repouso** ou tirar as chaves da base e passá-las a variáveis de
   ambiente do contentor de produção, como já acontece com as credenciais da
   base de dados.
3. **Limpar a chave da base local** — desenvolvimento não precisa de `sk_live`;
   se precisar de testar pagamentos, usar `sk_test`.

Ordem sugerida: primeiro rodar, depois decidir a arquitectura. A rotação não
depende de nenhuma das outras decisões.
