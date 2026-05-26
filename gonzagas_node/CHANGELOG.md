# Changelog - Gonzaga's Art & Shine

## [2026-05-26] - E-commerce Modular (core)

### 🛒 **Loja online modular**

#### **Arquitectura**
- Novo módulo `modules/ecommerce/` com submódulos: cart, checkout, orders, settings, shipping, fulfillment, admin, accounts, notifications, analytics, jobs
- Novo módulo `modules/payments/` com provider Stripe (`disabled` / `test` / `live`)
- Registo em `config/modules.js`; inicialização via `initializeModules(app)` em `app.js`

#### **Base de dados**
- Schema unificado INT em `modules/ecommerce/sql/migrations/006_ecommerce_unified.sql`
- Migração de upgrade para instalações existentes: `007_ecommerce_alter_existing.sql`
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

#### **Validado localmente (2026-05-26)**
- Carrinho API + página
- Checkout com carrinho preenchido
- Submissão de pedido com `payment_mode=disabled`
- Rotas admin protegidas (302 sem sessão)

#### **Pendente antes de go-live**
- Teste Stripe em modo `test` + webhook
- Emails SMTP de confirmação
- Estilização visual do carrinho/checkout (branch de styling)
- Executar `npm run db:ecommerce` em produção/staging

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