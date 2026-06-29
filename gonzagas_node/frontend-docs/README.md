# Documentação do Frontend - Gonzaga's Art & Shine

> Actualizado: Junho 2026

## 📁 Estrutura de Ficheiros CSS

```
public/css/
├── variables.css           # Tokens de design (CARREGAR PRIMEIRO)
├── main.css                # Base e tipografia
├── dark-luxe.css           # Overrides tema escuro global
├── brand-showcase.css      # Tema "showcase" dourado — TEMA ACTIVO (carregar por último no stack público)
├── homepage.css            # Layout e secções da homepage
├── catalog.css             # Catálogo base
├── catalog-enhanced.css    # Catálogo avançado (filtros, cards, galeria)
├── collections.css         # Página Gallery (/collections)
├── instagram-preview.css   # Página /instagram
├── home-ig-preview-bridge.css  # Bridge para IG preview na homepage
├── search-results.css      # Página /search (estilos base)
├── frontend-mobile.css     # Responsividade global (páginas, catálogo, hero)
├── header.css              # Header público — tipografia, ícones, gaveta mobile (ÚLTIMO no stack)
└── admin.css               # Painel administrativo (não usa showcase)

public/js/
├── header.js               # Pesquisa expansível (mobile) + dropdown admin
├── frontend-mobile-navigation-fix.js  # Gaveta mobile (overlay, swipe, hamburger)
└── modules/navigation.js   # Active nav por pathname + scroll no header

modules/ecommerce/public/css/
├── cart.css                # Carrinho (/cart) + header-cart-link/badge
└── checkout.css            # Checkout, success, cancel + account pages
```

## 🎨 Tema Showcase (tema activo)

O site usa exclusivamente o **tema showcase** (`body.showcase-theme`), activado globalmente em `app.js` via `res.locals.showcaseTheme = true` (excepto rotas `/admin`).

### Paleta showcase

```css
body.showcase-theme {
  --igp-bg:     #0a0a0a;                     /* fundo base */
  --igp-gold:   #c9a84c;                     /* dourado — cor principal */
  --igp-cream:  #f0ece4;                     /* texto principal */
  --igp-muted:  rgba(240, 236, 228, 0.55);   /* texto secundário */
  --igp-border: rgba(201, 168, 76, 0.18);    /* bordas */
  --igp-green-wash: rgba(107, 128, 104, 0.06); /* toque verde floresta */
}
```

As variáveis legadas `--color-accent`, `--color-highlight`, `--color-text` também são redirecionadas para gold/cream dentro de `body.showcase-theme`, garantindo que CSS antigo que use `var(--color-*)` herda automaticamente a nova paleta.

### Tipografia showcase
- **Títulos / headings**: Georgia, serif — peso 300, `letter-spacing: 0.12–0.18em`, UPPERCASE
- **Corpo**: Poppins, sans-serif
- **Estilo de cor nos títulos h1**: `var(--igp-cream)` com linha dourada `::after`
- **Subtítulos / labels**: `var(--igp-gold)`, letras em maiúsculas, `letter-spacing: 0.1em`

### Ordem de carregamento (layout principal `layouts/main.ejs`)
1. `variables.css`
2. `main.css`
3. CSS específico de página (homepage, catalog, `frontend-mobile.css`, etc.)
4. `dark-luxe.css`
5. `brand-showcase.css` (quando `showcaseTheme` activo)
6. **`header.css`** — sempre por último no stack público (sobrescreve header em showcase/mobile)

### Cache de CSS (desenvolvimento vs produção)
- **Desenvolvimento** (`NODE_ENV != production`): `Cache-Control: no-cache, no-store, must-revalidate` + `app.version = Date.now()` para cache busting automático
- **Produção**: `Cache-Control: max-age=604800, immutable` (1 semana)

---

## 🗺️ Mapa de páginas e CSS

| Página | Rota | Ficheiros CSS adicionais |
|--------|------|--------------------------|
| Homepage | `/` | `homepage.css`, `instagram-preview.css` (condicional), `home-ig-preview-bridge.css` |
| Gallery | `/collections` | `collections.css` |
| Instagram | `/instagram` | `instagram-preview.css` |
| Catálogo | `/catalog` | `catalog.css`, `catalog-enhanced.css` |
| Coleção | `/collection/:id` | — (usa brand-showcase.css) |
| Pesquisa | `/search` | `search-results.css` (base) + overrides em `brand-showcase.css` |
| Produto | `/catalog/product/:id` | `background-override.css` + estilos inline modernizados |
| About | `/about` | — |
| Privacy / Terms | `/privacy-policy`, `/terms-of-service` | estilos inline showcase (no template) |
| Error | `/error` (500/404) | estilos inline showcase (no template, standalone) |
| Carrinho | `/cart` | `ecommerce/css/cart.css` |
| Checkout | `/checkout` | `ecommerce/css/checkout.css` |
| Success/Cancel | `/checkout/success`, `/checkout/cancel` | `ecommerce/css/checkout.css` |
| Account | `/account/login`, `/account/register`, `/account/orders` | estilos inline showcase (no template) |

---

## 🛒 E-commerce UI

### Ativação
A loja é activada por `ecommerce_enabled = true` na base de dados (via `/admin/settings/ecommerce`). Quando activa:
- `res.locals.ecommerceEnabled = true` injectado globalmente
- Botão `.btn-add-to-cart` aparece nos product cards e detalhe
- Link carrinho + badge `.header-cart-badge` aparecem no header
- **Conta cliente:** `.header-account-nav` com **Entrar** + **Criar conta** (guest) ou link **Pedidos** (sessão activa); mesmo links no menu mobile e footer (`_customerAccountNav.ejs`)

### Classes semânticas principais
```
.ecommerce-cart-page       — página /cart
.ecommerce-checkout-page   — página /checkout
.ecommerce-success-page    — /checkout/success
.ecommerce-cancel-page     — /checkout/cancel
.cart-summary              — bloco de totais no carrinho
.checkout-summary          — bloco de resumo no checkout
.btn-add-to-cart           — botão "Adicionar ao carrinho" (cards + detalhe)
.header-cart-link          — ícone carrinho no header
.header-cart-badge         — badge contador no ícone
.header-account-nav        — bloco Entrar / Criar conta / Pedidos
.header-account-register-btn — botão Criar conta no header
.account-nav-banner        — CTA conta no cart/checkout
.account-nav-hint          — hint sessão activa / links secundários
```

### Estilo do botão "Adicionar ao carrinho"
- Estado normal: outline transparente com borda `--igp-border`
- Hover: fill dourado `--igp-gold`, texto escuro `#0a0a0a`
- Estado `.added`: outline dourado (injectado pelo `shopping-cart.js`)

---

## 🔧 Convenções de desenvolvimento

### Adicionar estilos a uma nova página
1. Usar sempre `body.showcase-theme .classe-nova { ... }` em `brand-showcase.css` para manter especificidade
2. Se os estilos são específicos a uma página e extensos, criar um ficheiro dedicado em `public/css/`
3. Páginas standalone (sem `main.ejs`): incluir estilos inline com as variáveis `--igp-*` hard-fallback

### Não fazer
- ❌ Passar `theme: { colorPrimary: ... }` (objecto) nas rotas — usar `theme: 'dark'` (string)
- ❌ Incluir `<!DOCTYPE>`, `<html>`, `<body>` em templates EJS que são renderizados dentro do layout principal
- ❌ Usar `#C0C0C0`, `#A8A8A8`, `#B87333` hardcoded — usar `var(--color-highlight/accent)` que herda gold no showcase
- ❌ CSS inline com `background: white` ou `color: #333` em páginas que usam o tema escuro

### Debug de CSS em desenvolvimento
```bash
# Verificar que o tema está activo
curl -s http://localhost:3000/ | grep 'showcase-theme'

# Verificar data-theme correcto
curl -s http://localhost:3000/ | grep 'data-theme'

# Verificar que brand-showcase.css é carregado com versão dinâmica
curl -s http://localhost:3000/ | grep 'brand-showcase'
```

---

## 📱 Responsividade (mobile-first)

### Ficheiros principais
| Ficheiro | Cobertura mobile |
|----------|------------------|
| `header.css` | Header: logo, nav, toolbar, ícones, gaveta mobile, pesquisa |
| `frontend-mobile.css` | Páginas: hero, catálogo (2-col grid), featured carousel, footer, product detail, safe-area |
| `brand-showcase.css` | Overrides showcase: IG strip, collection, about, privacy/terms, search, product detail, e-commerce btn |
| `cart.css` | Carrinho: tabela → cards; summary full-width |
| `checkout.css` | Checkout, success/cancel, account: inputs 16px, botões full-width |

### Breakpoints
| Breakpoint | Uso |
|------------|-----|
| `380px` | Phones muito estreitos — ícones e logo compactos |
| `480px` | Phones pequenos; search/related → 1 coluna |
| `520px` | IG grid → 2 colunas (homepage strip) |
| `768px` | Mobile / drawer nav; catálogo 2 colunas; pesquisa por ícone |
| `769–991px` | Tablet — nav desktop compacta, logo `Art&Shine`, pesquisa visível |
| `992px` | Desktop — logo completo, label "Conta" no header |
| `1200px` | Desktop largo — nav e pesquisa com mais espaço |

### Touch targets
- Mínimo **44px** para botões, links de nav, filtros e `.btn-add-to-cart` (`--touch-min` em `frontend-mobile.css`)
- Inputs de formulário: **16px** font-size em checkout/cart (evita zoom automático no iOS)

### Carrinho mobile
- Em `≤768px`, a tabela de `/cart` converte-se em **cards empilhados** (thead oculto)
- Cada `<td>` usa `data-label="..."` — o CSS mostra o label via `::before`

---

## ✅ Validação em desenvolvimento

Não existe passo de build (sem bundler). Com o servidor activo (`npm start` ou `npm run dev`):

```bash
cd gonzagas_node

# E-commerce end-to-end (29 checks — carrinho, checkout, conta cliente, admin)
npm run test:ecommerce

# Catálogo + BD
npm run validate:catalog

# Tema activo
curl -s http://localhost:3000/ | grep 'showcase-theme'
curl -s http://localhost:3000/ | grep 'data-theme'   # deve ser data-theme="dark"

# Search sem HTML duplicado (deve imprimir 1)
curl -s "http://localhost:3000/search?q=prata" | grep -c '<!DOCTYPE'

# Assets e-commerce servidos
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ecommerce/css/cart.css
```

Password do site em dev: `0009` (cookie `sitePassword` se necessário em scripts manuais).

---

## 🔍 Header

Ficheiro activo: `views/partials/header.ejs` (incluído em `layouts/main.ejs`).

### Estrutura
```
[ Logo ]  [ Nav desktop — centrada ]  [ header-toolbar: pesquisa | carrinho | conta | ☰ ]
```

### Navegação
- Links em **português**: Início → Coleções → Catálogo (condicional) → Sobre
- Estado activo via `currentPath` (não `title`)
- Admin: dropdown desktop (hover) + sub-links na gaveta mobile

### Tipografia
| Elemento | Fonte |
|----------|-------|
| Logo | Cinzel — `Art&Shine` (mobile/tablet) ou nome completo (desktop ≥992px) |
| Nav / pesquisa / conta | Source Sans 3, uppercase na nav desktop |

### Ícones (`.header-icon-btn`)
Pesquisa, carrinho, hambúrguer e fechar partilham tamanhos por breakpoint (42px mobile → 36px desktop).

### Pesquisa
- **Desktop/tablet:** barra sempre visível; autocomplete via `advanced-search.js`
- **Mobile:** ícone lupa → overlay no header; fechar com ×, clique fora ou Escape (`header.js`)

### E-commerce no header
- `.header-cart-link` + `.header-cart-badge`
- `.header-account-nav` (desktop ≥992px; oculto em mobile — links na gaveta via `_customerAccountNav.ejs`)

### Ficheiros
| Ficheiro | Função |
|----------|--------|
| `views/partials/header.ejs` | Markup EJS |
| `public/css/header.css` | Estilos e breakpoints do header |
| `public/js/header.js` | Pesquisa mobile + dropdown admin |
| `public/js/frontend-mobile-navigation-fix.js` | Gaveta mobile |
| `public/js/modules/navigation.js` | Highlight nav + scroll sticky |

> **Legado/arquivo:** `mobile-header.ejs`, `enhanced-nav.ejs`, `header-v2.ejs` — não usar.

---

## 📝 Próximos passos (técnicos)

- Migrar `dark-luxe.css` para scoped overrides e reduzir `!important` em `brand-showcase.css`
- Auditar `main.css` para remover regras globais que conflituam com showcase
- Implementar lazy loading de imagens com IntersectionObserver
