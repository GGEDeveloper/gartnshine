# Fase 4: Google Analytics 4 e Consentimento

## O Problema
1. O layout usava um sistema de tracking interno desatualizado (`analytics-tracking.js`).
2. Não havia implementação de Google Analytics 4 (GA4).
3. Mais grave: Qualquer script de analytics introduzido precisaria de respeitar rigorosamente a RGPD, ou seja, só executar se o utilizador desse consentimento explícito no banner de cookies.

## A Solução Implementada

### 1. Configuração de Variável de Ambiente
Adicionado ao `gonzagas_node/.env.example`:
```env
# Google Analytics 4 Measurement ID
GA_TRACKING_ID=G-XXXXXXXXXX
```

### 2. Bloco GA4 Condicional (`layouts/main.ejs`)
O script do GTM/GA4 foi injetado, mas envolto em lógica de validação dupla (Server-side e Client-side).

**Lógica Server-Side:**
Verifica as variáveis expostas pelo middleware existente `gonzagas_node/middleware/cookieConsent.js`.
O GA4 só é renderizado no HTML se:
- O utilizador ainda **não respondeu** ao banner (`cookieConsent === null` - abordagem híbrida/soft) OU
- O utilizador respondeu e **aceitou** cookies de analytics (`canUseAnalytics() === true`).

**Lógica Client-Side:**
Mesmo renderizado, o script GA4 só envia dados se o cookie `cookieConsent` contiver a flag `analytics:true`.

### 3. Rastreio de Eventos E-commerce
Adicionados eventos standard do GA4 para mapear a jornada de compra:

- **Página de Produto (`product-detail.ejs`)**: Dispara o evento `view_item` (com id, name, category, price).
- **Página de Resultados (`search-results.ejs`)**: Dispara o evento `search` (com o termo pesquisado).

### 4. Content Security Policy (CSP)
O ficheiro `app.js` possuía configurações restritas de segurança (Helmet). 
Foram adicionados os domínios da Google para permitir o carregamento e envio de dados do GA4 sem bloqueios do browser:

- `scriptSrc`: `'https://www.googletagmanager.com'`, `'https://www.google-analytics.com'`
- `connectSrc`: `'https://www.google-analytics.com'`, `'https://analytics.google.com'`, `'https://stats.g.doubleclick.net'`

## Ações Futuras (Produção)
1. Criar uma propriedade web no Google Analytics 4.
2. Obter o Measurement ID (`G-XXXXXXXXXX`).
3. Adicionar esse ID ao ficheiro `.env` no servidor de produção (`dominios.pt`).