---
slug: conta-obrigatoria-checkout
tipo: estado
dominio: loja
titulo: "artnshine.pt — conta obrigatória para finalizar compra; decisões do utilizador, armadilhas do carrinho e o que ficou po
resumo: "artnshine.pt — conta obrigatória para finalizar compra; decisões do utilizador, armadilhas do carrinho e o que ficou por validar"
valid_from: 2026-08-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - docs/DEPLOY_CONTA_OBRIGATORIA.md
  - mysql
sources:
  - migracao:project_conta_obrigatoria_checkout.md
---

A 2026-08-01 a loja passou a exigir conta para **finalizar** a compra. Decisões do utilizador quando lhe apresentei o estado actual e as alternativas:

- **Barreira no checkout, não no carrinho** ("quero o padrão das lojas"). O carrinho continua aberto a anónimos; `/checkout` e `/api/checkout/*` é que exigem sessão.
- **Todas as formas de entrar** — Google *e* email+password. Foi isso que obrigou a construir a recuperação de password, que não existia de todo.
- **O carrinho anónimo passa a ser do cliente** ao entrar, juntando-se ao de sessões anteriores.
- Sem verificação de email antes de comprar (menos atrito).
- Sessões passaram de memória para a BD (`express-mysql-session`, tabela `sessions`) — sem isso, cada deploy interrompia compras a meio.

**Why (armadilhas que custaram tempo e voltam a morder):**

- O carrinho **não vive na sessão**: vive no cookie `cart_session_id` (30 dias) + tabela `cart_sessions`. Por isso sobrevive a logout e a reinícios. Quem assumir que "limpar a sessão limpa o carrinho" engana-se.
- **Não existe `orders.customer_id`.** A ligação encomenda↔cliente é só por email, e é por isso que o checkout força `customerEmail` ao email da sessão em vez de aceitar o do formulário.
- Dois bugs encontrados ao testar a junção de carrinhos, ambos só visíveis com ela activa: o `INSERT` do `addItem` não escrevia `customer_email` (itens adicionados depois do login ficavam órfãos), e a junção absorvia só as linhas marcadas mas apagava a sessão antiga **inteira** — perdia itens. Regra que ficou: o que se apaga tem de ser exactamente o que se leu.
- `enrichItems()` em `cartService` tem código morto que julga limpar itens esgotados: faz `rows[0]?.id` mas `getSessionItems` só selecciona `product_id` e `quantity`, portanto nunca corre. Não foi corrigido de propósito — "corrigi-lo" começaria a apagar linhas de carrinhos reais.

> **Reconfirmado a 2026-08-18:** o `.env` local não tem **nenhuma** variável
> `SMTP_*`. O `mailer.js` considera-se não configurado se faltar `SMTP_HOST`
> (`CONFIG_KEYS = ['SMTP_HOST']`) e nesse caso `enviar()` devolve `false` em
> vez de falhar. Continua tudo por fazer.

**How to apply:** o SMTP continua **por configurar** — o utilizador disse que arranja credenciais. Até lá a recuperação de password avisa e encaminha para WhatsApp, e o deploy não deve avançar sem elas (ver `docs/DEPLOY_CONTA_OBRIGATORIA.md`, Passo 2). Por validar em produção: envio real de email e login com Google. Ver também [[painel-clientes-carrinhos]] e [[db-dev-vs-production]].
