# Changelog - Gonzaga's Art & Shine

## [2026-05-26] - Mobile showcase + validação

### 📱 **Pass mobile completo (showcase + e-commerce)**

#### **CSS mobile**
- `frontend-mobile.css`: cores `#c0a080` → `var(--igp-gold)`; regras para IG strip, search, e-commerce, collection, privacy/terms, about, error; safe-area para cart/checkout
- `brand-showcase.css`: bloco `@media (max-width: 768px/480px)` para todas as páginas showcase (IG strip, collection, about, privacy/terms, search, product detail, btn-add-to-cart)
- `cart.css`: tabela → cards empilhados em mobile (`data-label` + `::before`); summary e CTA 100% largura
- `checkout.css`: inputs 16px (iOS), submit full-width, success/cancel empilhados, account pages
- `cart.ejs`: `data-label` em cada `<td>` para labels legíveis no layout card
- `mobile-header.ejs`: dropdown links/ícones com `var(--igp-gold)`

#### **Validado localmente (2026-05-26)**
- `npm run test:ecommerce` — **19/19** (cart API, checkout submit, success, account, admin orders/settings, add-to-cart no catálogo)
- `npm run validate:catalog` — OK (328 produtos, 18 famílias)
- Smoke HTTP: 18 rotas públicas + 4 assets CSS → **200**
- Estrutural: `data-theme="dark"`, `body.showcase-theme`, search sem HTML duplicado, privacy sem fundo claro
- **Nota:** não existe `npm run build` — app Node/Express; validação = `npm start` + scripts acima

---

## [2026-05-26] - Tema Showcase + E-commerce UI

### 🎨 **Alinhamento visual completo do site (showcase dark-gold)**

#### **Tema showcase (`brand-showcase.css` + `body.showcase-theme`)**
- Toda a paleta do site passa a usar dourado (#c9a84c) + cream (#f0ece4) sobre fundo escuro (#0a0a0a)
- `body.showcase-theme` redireciona variáveis legadas `--color-accent/highlight/text` para gold/cream — qualquer CSS que use `var(--color-*)` herda automaticamente
- `data-theme="dark"` corrigido (era `"[object Object]"` devido a `theme: {...}` passado como objecto nas rotas)
- CSS estático usa `no-cache` em desenvolvimento; `immutable` só em produção
- `app.version` dinâmico (`Date.now()`) em dev para cache busting automático

#### **Páginas corrigidas**
- **Privacy Policy + Terms of Service**: CSS inline com tema claro totalmente substituído por showcase dark
- **Search results**: Removida estrutura HTML duplicada (`<!DOCTYPE>/<html>/<body>` dentro do layout); estilos showcase aplicados
- **Collection page**: Estilos showcase para cabeçalho, divider geométrico dourado, controlos de sort, nav de coleções
- **Product detail**: Valores hardcoded `#C0C0C0/#A8A8A8/#B87333` migrados para `var(--color-*)` que herdam gold
- **About page**: `.about-connect`, `.social-links-large`, `h3` com gold/muted showcase
- **error.ejs**: Guards defensivos `title`/`message`; estilo refeito showcase dark; `title:` adicionado a 3 chamadas `render('error')` que faltavam

#### **E-commerce UI — showcase theme**
- `cart.css` reescrito: tabela dark com cabeçalho gold, qty input com focus ring dourado, cart-summary glass card, btn gold
- `checkout.css` reescrito: form inputs dark/gold focus, h2 secções gold, checkout-summary glass, submit btn gold, páginas success/cancel centradas com ícone ✦ dourado
- `brand-showcase.css`: `.btn-add-to-cart` outline → fill gold no hover; `.header-cart-badge` gold bg; Bootstrap `.form-control` global override para showcasetheme
- Account pages (`/account/login`, `/account/register`, `/account/orders`): h1 Georgia + underline gold, tabela showcase
- `checkout-success.ejs` / `checkout-cancel.ejs`: adicionado `<link>` para `checkout.css`

#### **Instagram strip na homepage**
- Secção "No Instagram" com 6 posts reais via Instagram Graph API
- Partial `partials/_ig-strip.ejs`; rota home com `instagramModule.fetchInstagramFeed(6)`
- Cache de 5 minutos em `mediaService.js`

---

## [2026-05-26] - E-commerce Modular (core)

### 🛒 **Loja online modular**

#### **Arquitectura**
- Novo módulo `modules/ecommerce/` com submódulos: cart, checkout, orders, settings, shipping, fulfillment, admin, accounts, notifications, analytics, jobs
- Novo módulo `modules/payments/` com provider Stripe (`disabled` / `test` / `live`)
- Registo em `config/modules.js`; inicialização via `initializeModules(app)` em `app.js`

#### **Base de dados**
- Schema unificado INT em `modules/ecommerce/sql/migrations/006_ecommerce_unified.sql`
- Migração de upgrade para instalações existentes: `007_ecommerce_alter_existing.sql`, `008_ecommerce_alter_customers.sql`
- Comando: `npm run db:ecommerce`
- Schema UUID em `database/migrations/sales/` marcado como **deprecated**

#### **Rotas públicas**
- `/cart`, `/checkout`, `/checkout/success`, `/checkout/cancel`
- API: `/api/cart/*`, `/api/checkout/prepare`, `/api/checkout/submit`
- Webhook: `POST /webhooks/stripe`

#### **Admin**
- `/admin/settings/ecommerce` — activar loja, IVA, Stripe, portes
- `/admin/orders`, `/admin/orders/:id` — gestão de pedidos
- Dashboard usa estatísticas reais de pedidos quando e-commerce activo

#### **Conta cliente (opcional)**
- `/account/login`, `/account/register`, `/account/orders`, `/account/logout`

#### **Correcções dev (2026-05-26, sessão 2)**
- `initializeModules()` movido **antes** dos routers em `app.js` — botão "Adicionar ao carrinho" no catálogo
- Migração `008_ecommerce_alter_customers.sql` — colunas conta cliente em tabela `customers` existente
- Carrinho limpo após checkout submit
- Script `npm run test:ecommerce` — validação automática (19 checks)

#### **Validado localmente (2026-05-26)**
- Carrinho API + página + PATCH/DELETE
- Checkout com carrinho preenchido
- Submissão de pedido com `payment_mode=disabled` + carrinho vazio após
- Conta cliente: registo + histórico pedidos
- Admin: login, lista/detalhe pedidos, settings e-commerce
- Catálogo: botão add-to-cart visível com loja activa

#### **Pendente antes de go-live**
- Teste Stripe em modo `test` + webhook
- Emails SMTP de confirmação (requer `SMTP_HOST`)
- Executar `npm run db:ecommerce` em produção/staging após deploy

#### **Documentação deploy/DB (2026-05-26)**
- `DATABASE.md`, `PRODUCTION_SETUP.md`, `DEPLOYMENT.md`, `docs/MODULAR_ARCHITECTURE.md`

#### **Correcção de migração**
- Script `run-migration.js` ignora comentários SQL por linha (evita saltar o primeiro `ALTER` em 007)

---

## [2025-03-04] - Header Search: Ícone Expandível (Mobile + Desktop)

### 🔍 **Pesquisa no Header - Padrão Unificado**

#### **Problema resolvido**
- No mobile: botão de navegação e barra de pesquisa "embrulhados" no topo direito
- No desktop: barra de pesquisa ocupava grande parte do ecrã

#### **Solução implementada (Opção B)**
- **Mobile e Desktop**: ícone de pesquisa (lupa) que expande ao clicar
- **Estado inicial**: Logo | Nav | 🔍 | ☰ (mobile) ou Logo | Nav | 🔍 (desktop)
- **Ao clicar na lupa**: barra de pesquisa expande com animação
- **Fechar**: botão ×, clique fora ou tecla Escape

#### **Ficheiros alterados**
- `views/partials/header.ejs` — estrutura HTML (wrapper, ícone, barra expandível, botão fechar)
- `public/css/frontend-mobile.css` — estilos mobile e desktop para o padrão expand-on-click
- `views/layouts/main.ejs` — Font Awesome para ícones (lupa, ×)

#### **Detalhes técnicos**
- Desktop: barra expandida com `max-width: 320px`, `min-width: 200px`
- Mobile: barra full-width quando expandida
- Compatível com `advanced-search.js` (sugestões e resultados)
- Acessibilidade: `aria-expanded`, `aria-label` nos botões

---

## [2025-07-18] - Arquitetura Modular & UI/UX Improvements

### 🏗️ **Arquitetura Modular Implementada**

#### **Sistema de Configuração Global**
- **Arquivo**: `public/js/config.js`
- **Funcionalidades**:
  - Detecção automática de ambiente (localhost = development)
  - Debug flags configuráveis
  - Feature toggles para funcionalidades
  - Controle de ordem de carregamento de módulos
  - Timeouts configuráveis

#### **Módulos JavaScript Organizados**
- **`public/js/modules/utils.js`**: Utilitários (debounce, throttle, manipulação DOM)
- **`public/js/modules/navigation.js`**: Sistema de navegação e scroll effects
- **`public/js/modules/ui.js`**: Componentes UI (loading, lightbox, back-to-top, video backgrounds)
- **`public/js/modules/carousel.js`**: Sistema de carrosséis reutilizável

#### **Module Manager**
- **Arquivo**: `public/js/main.js`
- **Funcionalidades**:
  - Inicialização segura e sequencial de módulos
  - Controle de dependências
  - Tratamento de erros
  - Sistema de logs para debugging

#### **CSS Componentizado**
- **Arquivo**: `public/css/components.css`
- **Componentes**:
  - Loading overlays reutilizáveis
  - Botões padronizados
  - Cards de produtos
  - Sistema de grids responsivo

### 📱 **Melhorias Mobile - Área Admin**

#### **CSS Mobile Específico**
- **Arquivo**: `public/css/admin-mobile.css`
- **Melhorias**:
  - Sidebar responsiva com toggle móvel
  - Menu hamburger funcional
  - Navegação otimizada para touch
  - Layout adaptativo para telas pequenas

#### **Tabelas Mobile-Friendly**
- **Arquivo**: `public/css/admin-tables-mobile.css`
- **Funcionalidades**:
  - Scroll horizontal em tabelas grandes
  - Cards responsivos para dados tabulares
  - Botões de ação otimizados para touch

#### **JavaScript Mobile**
- **Melhorias no**: `public/js/admin.js`
- **Funcionalidades**:
  - Toggle de sidebar móvel
  - Detecção de tamanho de tela
  - Eventos touch otimizados

### 🎨 **UI/UX da Galeria**

#### **Página Collections Otimizada**
- **Arquivo**: `views/collections.ejs`
- **Melhorias**:
  - Remoção do loading infinito
  - Interface limpa focada nas imagens
  - Remoção de elementos desnecessários:
    - Botões zoom não funcionais
    - Títulos e descrições redundantes
    - Overlays de informação
  - Mantido sistema lightbox funcional

#### **Performance Otimizada**
- **Loading progressivo** de imagens
- **Lazy loading** implementado
- **Transições suaves** mantidas
- **CSS otimizado** (remoção de estilos não utilizados)

### 🔧 **Correções Técnicas**

#### **Sistema Modular**
- ✅ Correção de dependências entre módulos
- ✅ Tratamento de erros melhorado
- ✅ Logs de debugging implementados
- ✅ Ordem de carregamento otimizada

#### **Interface Mobile**
- ✅ Sidebar inacessível corrigida
- ✅ Menu hamburger funcional
- ✅ Tabelas responsivas implementadas
- ✅ Touch navigation otimizada

#### **Galeria**
- ✅ Loading infinito eliminado
- ✅ Performance melhorada
- ✅ Interface limpa e minimalista
- ✅ Sistema lightbox mantido

### 📊 **Arquivos Modificados/Criados**

#### **Novos Arquivos**
```
public/js/config.js                 - Sistema de configuração global
public/js/modules/utils.js         - Módulo de utilitários
public/js/modules/navigation.js    - Módulo de navegação
public/js/modules/ui.js            - Módulo de componentes UI
public/js/modules/carousel.js      - Módulo de carrossel
public/css/components.css          - CSS componentizado
public/css/admin-mobile.css        - CSS mobile para admin
public/css/admin-tables-mobile.css - CSS para tabelas mobile
```

#### **Arquivos Atualizados**
```
public/js/main.js                  - Module Manager implementado
public/js/admin.js                 - Funcionalidades mobile adicionadas
views/collections.ejs              - Interface limpa implementada
views/admin/layouts/*.ejs          - CSS mobile incluído
```

### 🚀 **Benefícios Implementados**

1. **Modularidade**: Código organizado e reutilizável
2. **Manutenibilidade**: Fácil debugging e extensão
3. **Performance**: Loading otimizado e CSS limpo
4. **Responsividade**: Interface móvel completamente funcional
5. **UX**: Galeria limpa focada no conteúdo
6. **Escalabilidade**: Sistema preparado para futuras funcionalidades

### 📋 **Status dos Todos**
- ✅ Arquitetura modular implementada
- ✅ Interface admin mobile corrigida
- ✅ Galeria otimizada e limpa
- ✅ Sistema de loading corrigido
- ✅ Documentação atualizada

---

## Próximos Passos Sugeridos

1. **Testes de Integração**: Validar funcionamento em diferentes dispositivos
2. **Otimização de Imagens**: Implementar compressão automática
3. **SEO**: Adicionar meta tags otimizadas
4. **PWA**: Transformar em Progressive Web App
5. **Analytics**: Implementar tracking de uso

---

*Checkpoint criado em: 2025-07-18*
*Status: Sistema estável e funcional* 