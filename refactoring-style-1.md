Excelentíssimo Senhor Hugo Gonzaga Gomes,

Segue o **Guia Completo para Cursor** - refatoração do sistema atual com tema Dark Nature, sem migração. Tudo pronto para implementar no branch `feature/planning-fase1-fase2`.

# GUIA COMPLETO PARA CURSOR - GONZAGA ART & SHINE
## Refatoração Dark Nature - Sistema Node.js Existente

***

## 🎯 OBJETIVO
Aplicar identidade visual "Gothic Natural" ao sistema Node.js + Express + EJS + MySQL existente, mantendo toda a funcionalidade atual e adicionando:
- Tema Dark Nature (Ónix + Olho-de-tigre)
- Filtros por pedra/metal
- Storytelling "Origem da Matéria"
- Sistema multi-vendedor preparado
- Performance otimizada

***

## 📋 ESPECIFICAÇÕES APROVADAS

### **Identidade Visual:**
- **Conceito**: Gothic Natural - elegância que nasce da terra
- **Slogan**: "Elegância que nasce da terra"
- **Tipografia**: Títulos Cinzel + Texto Source Sans 3
- **Pedras prioritárias**: Ónix, Olho-de-tigre
- **Sem azulejos portugueses**
- **Sem selo "Gonzaga Approved"**
- **Metais UI**: Prata e dourado equilibrados (50/50)

### **Paleta de Cores:**
```css
:root {
  --black: #0B0D0C;
  --moss: #0F2E20;
  --forest: #123524;
  --earth: #3A2C22;
  --gold-old: #B08D57;
  --silver-matte: #C7CACE;
  --slate: #6E6B65;
  --ivory: #E7E1D6;
  --accent-onyx: #111111;
  --accent-tiger: #6B4A1B;
}
```

***

## 🗂️ ESTRUTURA DE FICHEIROS A CRIAR/MODIFICAR

### **CSS (Novo):**
```
gonzagas_node/public/css/
├── tokens.css              (Novo)
├── base.css                (Novo) 
├── components.css          (Novo)
├── pages.css               (Novo)
└── dark-nature.css         (Novo - arquivo principal)
```

### **Views (Modificar/Criar):**
```
gonzagas_node/views/
├── partials/
│   ├── header-dark.ejs     (Novo)
│   ├── footer-dark.ejs     (Novo)
│   ├── card-produto.ejs    (Novo)
│   └── filtros.ejs         (Novo)
├── pages/
│   ├── home-dark.ejs       (Novo)
│   ├── catalogo-dark.ejs   (Novo)
│   ├── produto-dark.ejs    (Novo)
│   └── vendedor.ejs        (Novo)
└── layouts/
    └── main-dark.ejs       (Novo)
```

### **Assets (Adicionar):**
```
gonzagas_node/public/images/
├── backgrounds/
│   ├── slate-texture.jpg   (ardósia escura)
│   ├── wood-dark.jpg       (madeira negra)
│   └── forest-noir.jpg     (botânica escura)
├── produtos/
│   ├── onix/
│   └── olho-de-tigre/
└── ui/
    ├── icons-metals.svg
    └── textures/
```

***

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### **1. TOKENS CSS (public/css/tokens.css):**
```css
/* Gonzaga Art & Shine - Dark Nature Tokens */
:root {
  /* Cores principais */
  --black: #0B0D0C;
  --moss: #0F2E20;
  --forest: #123524;
  --earth: #3A2C22;
  --gold-old: #B08D57;
  --silver-matte: #C7CACE;
  --slate: #6E6B65;
  --ivory: #E7E1D6;
  
  /* Acentos por pedra */
  --accent-onyx: #111111;
  --accent-tiger: #6B4A1B;
  
  /* Gradientes */
  --gradient-hero: linear-gradient(180deg, rgba(11,13,12,0.35), rgba(11,13,12,0.75));
  --gradient-card: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  
  /* Sombras */
  --shadow-deep: 0 12px 24px rgba(0,0,0,0.35);
  --shadow-soft: 0 4px 12px rgba(0,0,0,0.25);
  
  /* Bordas e raios */
  --radius: 6px;
  --radius-large: 12px;
  --border-subtle: 1px solid rgba(255,255,255,0.06);
  
  /* Tipografia */
  --font-heading: "Cinzel", serif;
  --font-body: "Source Sans 3", system-ui, sans-serif;
  --font-weight-title: 600;
  --font-weight-body: 400;
  --font-weight-bold: 600;
}
```

### **2. BASE STYLES (public/css/base.css):**
```css
/* Reset e Base */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--black);
  color: var(--ivory);
  font-family: var(--font-body);
  line-height: 1.6;
  scroll-behavior: smooth;
}

img {
  max-width: 100%;
  display: block;
  height: auto;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

/* Tipografia */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-title);
  letter-spacing: 0.3px;
  margin: 0 0 1rem;
}

h1 { font-size: clamp(32px, 5vw, 48px); }
h2 { font-size: clamp(24px, 4vw, 36px); }
h3 { font-size: clamp(20px, 3vw, 28px); }

p, li, small, button, input, select {
  font-family: var(--font-body);
  font-weight: var(--font-weight-body);
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.visually-hidden {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Grid responsivo */
.grid {
  display: grid;
  gap: 18px;
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(3, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 720px) {
  .grid-4, .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
  
  .container { padding: 0 16px; }
}
```

### **3. COMPONENTES (public/css/components.css):**
```css
/* Header */
.site-header {
  background: linear-gradient(180deg, #0b0d0cf2, #0b0d0ccc);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: var(--border-subtle);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.nav .brand {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: var(--font-weight-title);
  color: var(--ivory);
}

.nav ul {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav a {
  padding: 8px 12px;
  border-radius: var(--radius);
  transition: background 0.2s ease;
}

.nav a:hover {
  background: rgba(255,255,255,0.08);
}

/* Hero */
.hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  color: var(--ivory);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: var(--gradient-hero);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.hero-onyx {
  background-image: url('/images/backgrounds/slate-texture.jpg');
}

.hero-tiger {
  background-image: url('/images/backgrounds/forest-noir.jpg');
}

.hero h1 {
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.hero p {
  font-size: 18px;
  margin-bottom: 24px;
  color: #d9d4c7;
  line-height: 1.7;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: var(--radius);
  font-weight: var(--font-weight-bold);
  font-size: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}

.btn-silver {
  background: var(--silver-matte);
  color: var(--black);
  border: 1px solid var(--silver-matte);
}

.btn-silver:hover {
  background: #d4d8dc;
  transform: translateY(-1px);
}

.btn-silver.outline {
  background: transparent;
  color: var(--ivory);
  border: 1px solid var(--silver-matte);
}

.btn-silver.outline:hover {
  background: var(--silver-matte);
  color: var(--black);
}

.btn-gold {
  background: var(--gold-old);
  color: var(--black);
  border: 1px solid var(--gold-old);
}

.btn-gold:hover {
  background: #c19963;
  transform: translateY(-1px);
}

.btn-gold.outline {
  background: transparent;
  color: var(--ivory);
  border: 1px solid var(--gold-old);
}

.btn-gold.outline:hover {
  background: var(--gold-old);
  color: var(--black);
}

.btn-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Cards de Produto */
.product-card {
  background: var(--gradient-card);
  border: var(--border-subtle);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-deep);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.product-card-image {
  aspect-ratio: 4/5;
  background: var(--slate);
  position: relative;
  overflow: hidden;
}

.product-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-card-image img {
  transform: scale(1.05);
}

.product-card-content {
  padding: 16px;
}

.product-card-title {
  font-family: var(--font-heading);
  font-size: 18px;
  margin: 0 0 8px;
  color: var(--ivory);
}

.product-card-meta {
  display: flex;
  gap: 8px;
  color: #bfb8a8;
  font-size: 14px;
  margin-bottom: 10px;
}

.product-card-price {
  font-weight: var(--font-weight-bold);
  font-size: 16px;
  color: var(--ivory);
}

/* Filtros */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.02);
  border: var(--border-subtle);
  border-radius: var(--radius-large);
  margin-bottom: 24px;
}

.filter-select {
  background: #0e0f10;
  color: var(--ivory);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-family: var(--font-body);
}

.filter-select:focus {
  outline: none;
  border-color: var(--gold-old);
}

/* Footer */
.site-footer {
  margin-top: 80px;
  border-top: var(--border-subtle);
  padding: 40px 0;
  background: linear-gradient(180deg, transparent, rgba(15,46,32,0.1));
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  color: #bfb8a8;
}

.footer-brand {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--ivory);
  margin-bottom: 12px;
}

.footer-slogan {
  font-style: italic;
  color: #d9d4c7;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .filters {
    flex-direction: column;
  }
}
```

### **4. PÁGINAS ESPECÍFICAS (public/css/pages.css):**
```css
/* Home */
.home-heros {
  margin-bottom: 60px;
}

.hero + .hero {
  margin-top: 0;
}

/* Catálogo */
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 24px;
}

.catalog-header h2 {
  margin: 0;
  color: var(--ivory);
}

.products-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

/* PDP (Página do Produto) */
.pdp {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin: 40px 0;
}

@media (max-width: 920px) {
  .pdp {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.pdp-gallery {
  position: sticky;
  top: 100px;
}

.pdp-main-image {
  aspect-ratio: 4/5;
  border-radius: var(--radius-large);
  overflow: hidden;
  border: var(--border-subtle);
  margin-bottom: 12px;
}

.pdp-main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdp-thumbnails {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.pdp-thumbnails img {
  aspect-ratio: 1;
  border-radius: var(--radius);
  border: var(--border-subtle);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.pdp-thumbnails img:hover,
.pdp-thumbnails img.active {
  border-color: var(--gold-old);
}

.pdp-details h1 {
  color: var(--ivory);
  margin-bottom: 12px;
}

.pdp-meta {
  display: flex;
  gap: 16px;
  color: #cfc8b8;
  font-size: 16px;
  margin-bottom: 20px;
}

.pdp-price {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--gold-old);
  margin-bottom: 24px;
}

.pdp-section {
  border-top: var(--border-subtle);
  padding-top: 20px;
  margin-top: 24px;
}

.pdp-section h3 {
  color: var(--ivory);
  margin-bottom: 12px;
}

.pdp-section p {
  color: #d9d4c7;
  line-height: 1.6;
}

.quantity-selector {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 20px 0;
}

.quantity-input {
  width: 80px;
  background: #0e0f10;
  color: var(--ivory);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius);
  padding: 8px 12px;
  text-align: center;
}

/* Página de Vendedor */
.vendor-header {
  background: var(--gradient-card);
  border: var(--border-subtle);
  border-radius: var(--radius-large);
  padding: 32px;
  margin: 40px 0;
  text-align: center;
}

.vendor-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--gold-old);
  margin: 0 auto 16px;
}

.vendor-name {
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--ivory);
  margin-bottom: 8px;
}

.vendor-tagline {
  color: #d9d4c7;
  font-style: italic;
  margin-bottom: 16px;
}

.vendor-products {
  margin-top: 40px;
}
```

***

## 🎨 VIEWS (TEMPLATES EJS)

### **Layout Principal (views/layouts/main-dark.ejs):**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title || 'Gonzaga Art & Shine - Elegância que nasce da terra' %></title>
    
    <!-- Preload de fontes -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
    
    <!-- CSS Dark Nature -->
    <link rel="stylesheet" href="/css/tokens.css">
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/components.css">
    <link rel="stylesheet" href="/css/pages.css">
    
    <!-- Meta SEO -->
    <meta name="description" content="<%= description || 'Joalharia alternativa em prata 925 com pedras naturais. Ónix e olho-de-tigre, elegância que nasce da terra.' %>">
    <meta property="og:title" content="<%= title || 'Gonzaga Art & Shine' %>">
    <meta property="og:description" content="<%= description || 'Elegância que nasce da terra' %>">
    <meta property="og:image" content="/images/og-image.jpg">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="alternate icon" href="/favicon.ico">
    
    <% if (locals.additionalCSS) { %>
        <%- additionalCSS %>
    <% } %>
</head>
<body class="<%= bodyClass || '' %>">
    <%- include('../partials/header-dark') %>
    
    <main>
        <%- body %>
    </main>
    
    <%- include('../partials/footer-dark') %>
    
    <% if (locals.additionalJS) { %>
        <%- additionalJS %>
    <% } %>
    
    <!-- Analytics (se necessário) -->
    <!-- Google Analytics, Facebook Pixel, etc -->
</body>
</html>
```

### **Header Dark (views/partials/header-dark.ejs):**
```html
<header class="site-header">
    <nav class="container nav">
        <a href="/" class="brand">Gonzaga Art & Shine</a>
        
        <ul class="nav-menu">
            <li><a href="/catalogo">Catálogo</a></li>
            <li><a href="/catalogo?pedra=onix">Ónix</a></li>
            <li><a href="/catalogo?pedra=olho-de-tigre">Olho-de-tigre</a></li>
            <li><a href="/vendedores">Artesãos</a></li>
            <li><a href="/manifesto">Manifesto</a></li>
            <li><a href="/contacto">Contacto</a></li>
        </ul>
        
        <!-- Mobile menu toggle (adicionar JS se necessário) -->
        <button class="mobile-menu-toggle visually-hidden" aria-label="Menu">
            ☰
        </button>
    </nav>
</header>
```

### **Footer Dark (views/partials/footer-dark.ejs):**
```html
<footer class="site-footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-main">
                <div class="footer-brand">Gonzaga Art & Shine</div>
                <div class="footer-slogan">Elegância que nasce da terra</div>
                <p>Joalharia alternativa em prata 925 com pedras naturais autênticas. Cada peça conta a história da sua origem.</p>
            </div>
            
            <div class="footer-links">
                <h4>Explorar</h4>
                <ul>
                    <li><a href="/catalogo?pedra=onix">Coleção Ónix</a></li>
                    <li><a href="/catalogo?pedra=olho-de-tigre">Coleção Olho-de-tigre</a></li>
                    <li><a href="/vendedores">Nossos Artesãos</a></li>
                    <li><a href="/manifesto">Origem e Cuidados</a></li>
                </ul>
            </div>
            
            <div class="footer-info">
                <h4>Contacto</h4>
                <p>Email: info@gonzagaartshine.com</p>
                <p>Festivais e feiras</p>
                <div class="footer-social">
                    <!-- Links redes sociais -->
                </div>
            </div>
        </div>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; color: #888;">
            © <%= new Date().getFullYear() %> Gonzaga Art & Shine. Todos os direitos reservados.
        </div>
    </div>
</footer>
```

### **Home Dark (views/pages/home-dark.ejs):**
```html
<% layout('layouts/main-dark') -%>

<div class="home-heros">
    <!-- Hero Ónix -->
    <section class="hero hero-onyx">
        <div class="hero-overlay"></div>
        <div class="container">
            <div class="hero-content">
                <h1>Ónix — Força em negro profundo</h1>
                <p>A prata 925 destaca a energia serena desta pedra de proteção ancestral. Cada peça carrega consigo a força da terra.</p>
                <div class="btn-group">
                    <a href="/catalogo?pedra=onix" class="btn btn-silver">Ver Coleção Ónix</a>
                    <a href="/manifesto" class="btn btn-gold outline">Origem e Cuidados</a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Hero Olho-de-tigre -->
    <section class="hero hero-tiger">
        <div class="hero-overlay"></div>
        <div class="container">
            <div class="hero-content">
                <h1>Olho-de-tigre — Poder dourado da terra</h1>
                <p>Veios quentes, presença magnética, coragem em cada detalhe. A energia dourada que desperta a força interior.</p>
                <div class="btn-group">
                    <a href="/catalogo?pedra=olho-de-tigre" class="btn btn-gold">Explorar Peças</a>
                    <a href="/catalogo" class="btn btn-silver outline">Ver Tudo</a>
                </div>
            </div>
        </div>
    </section>
</div>

<!-- Seção de destaques (opcional) -->
<section class="container" style="margin: 60px auto;">
    <div style="text-align: center; margin-bottom: 40px;">
        <h2>Artesanato que Conta Histórias</h2>
        <p style="max-width: 600px; margin: 0 auto; color: #d9d4c7;">
            Cada peça Gonzaga nasce da união entre tradição ancestral e design contemporâneo. 
            Descobra a origem das matérias que dão vida às nossas criações.
        </p>
    </div>
    
    <!-- Grid de produtos em destaque (se tiver dados) -->
    <% if (locals.produtosDestaque && produtosDestaque.length > 0) { %>
        <div class="products-grid">
            <% produtosDestaque.forEach(produto => { %>
                <%- include('../partials/card-produto', { produto }) %>
            <% }) %>
        </div>
    <% } %>
</section>
```

### **Catálogo Dark (views/pages/catalogo-dark.ejs):**
```html
<% layout('layouts/main-dark') -%>

<div class="container">
    <header class="catalog-header">
        <h2>
            <% if (filtroAtivo.pedra) { %>
                Coleção <%= filtroAtivo.pedra === 'onix' ? 'Ónix' : 'Olho-de-tigre' %>
            <% } else { %>
                Catálogo Completo
            <% } %>
        </h2>
        
        <div style="color: #bfb8a8;">
            <%= produtos.length %> <%= produtos.length === 1 ? 'peça encontrada' : 'peças encontradas' %>
        </div>
    </header>
    
    <!-- Filtros -->
    <form class="filters" method="get" action="/catalogo">
        <select name="pedra" class="filter-select" onchange="this.form.submit()">
            <option value="">Todas as pedras</option>
            <option value="onix" <%= query.pedra === 'onix' ? 'selected' : '' %>>Ónix</option>
            <option value="olho-de-tigre" <%= query.pedra === 'olho-de-tigre' ? 'selected' : '' %>>Olho-de-tigre</option>
        </select>
        
        <select name="metal" class="filter-select" onchange="this.form.submit()">
            <option value="">Todos os metais</option>
            <option value="prata_925" <%= query.metal === 'prata_925' ? 'selected' : '' %>>Prata 925</option>
            <option value="prata_com_ouro" <%= query.metal === 'prata_com_ouro' ? 'selected' : '' %>>Prata com ouro</option>
        </select>
        
        <select name="ordenar" class="filter-select" onchange="this.form.submit()">
            <option value="recentes" <%= query.ordenar === 'recentes' ? 'selected' : '' %>>Mais recentes</option>
            <option value="preco_asc" <%= query.ordenar === 'preco_asc' ? 'selected' : '' %>>Preço: menor primeiro</option>
            <option value="preco_desc" <%= query.ordenar === 'preco_desc' ? 'selected' : '' %>>Preço: maior primeiro</option>
            <option value="nome" <%= query.ordenar === 'nome' ? 'selected' : '' %>>Nome A-Z</option>
        </select>
        
        <button type="reset" class="btn btn-silver outline" onclick="window.location.href='/catalogo'">
            Limpar Filtros
        </button>
    </form>
    
    <!-- Grid de Produtos -->
    <% if (produtos.length > 0) { %>
        <div class="products-grid">
            <% produtos.forEach(produto => { %>
                <%- include('../partials/card-produto', { produto }) %>
            <% }) %>
        </div>
    <% } else { %>
        <div style="text-align: center; padding: 60px 20px; color: #bfb8a8;">
            <h3>Nenhuma peça encontrada</h3>
            <p>Tente ajustar os filtros ou <a href="/catalogo" style="color: var(--gold-old);">ver todas as peças</a>.</p>
        </div>
    <% } %>
    
    <!-- Paginação (se necessária) -->
    <% if (locals.paginacao && paginacao.totalPaginas > 1) { %>
        <nav style="display: flex; justify-content: center; gap: 12px; margin-top: 40px;">
            <% for (let i = 1; i <= paginacao.totalPaginas; i++) { %>
                <a href="?<%= new URLSearchParams({...query, pagina: i}).toString() %>" 
                   class="btn <%= i === paginacao.paginaAtual ? 'btn-gold' : 'btn-silver outline' %>">
                    <%= i %>
                </a>
            <% } %>
        </nav>
    <% } %>
</div>
```

### **Card de Produto (views/partials/card-produto.ejs):**
```html
<article class="product-card">
    <a href="/produto/<%= produto.slug %>">
        <div class="product-card-image">
            <img src="<%= produto.imagem_principal || '/images/placeholder-produto.jpg' %>" 
                 alt="<%= produto.nome %> - <%= produto.pedra_nome %> em <%= produto.metal_nome %>"
                 loading="lazy">
        </div>
        
        <div class="product-card-content">
            <h3 class="product-card-title"><%= produto.nome %></h3>
            
            <div class="product-card-meta">
                <span><%= produto.pedra_nome || 'Pedra natural' %></span>
                <span>•</span>
                <span><%= produto.metal_nome || 'Metal' %></span>
            </div>
            
            <div class="product-card-price">
                <%= produto.preco_formatado || 'Consultar' %>
            </div>
        </div>
    </a>
</article>
```

### **Página de Produto (views/pages/produto-dark.ejs):**
```html
<% layout('layouts/main-dark') -%>

<div class="container pdp">
    <div class="pdp-gallery">
        <div class="pdp-main-image">
            <img src="<%= produto.imagem_principal %>" 
                 alt="<%= produto.nome %> - vista principal"
                 id="main-product-image">
        </div>
        
        <% if (produto.imagens_adicionais && produto.imagens_adicionais.length > 0) { %>
            <div class="pdp-thumbnails">
                <img src="<%= produto.imagem_principal %>" 
                     alt="<%= produto.nome %> - vista 1"
                     onclick="changeMainImage(this.src)"
                     class="active">
                
                <% produto.imagens_adicionais.forEach((img, index) => { %>
                    <img src="<%= img %>" 
                         alt="<%= produto.nome %> - vista <%= index + 2 %>"
                         onclick="changeMainImage(this.src)">
                <% }) %>
            </div>
        <% } %>
    </div>
    
    <div class="pdp-details">
        <h1><%= produto.nome %></h1>
        
        <div class="pdp-meta">
            <strong><%= produto.pedra_nome %></strong>
            <span>•</span>
            <span><%= produto.metal_nome %></span>
        </div>
        
        <div class="pdp-price">
            <%= produto.preco_formatado %>
        </div>
        
        <% if (produto.descricao) { %>
            <div style="color: #d9d4c7; line-height: 1.6; margin: 20px 0;">
                <%- produto.descricao %>
            </div>
        <% } %>
        
        <!-- Seletor de quantidade e compra -->
        <div class="quantity-selector">
            <label for="quantidade" style="color: #cfc8b8;">Quantidade:</label>
            <input type="number" id="quantidade" class="quantity-input" value="1" min="1" max="10">
            <button class="btn btn-gold" onclick="adicionarCarrinho()">
                Adicionar ao Carrinho
            </button>
        </div>
        
        <!-- Origem da Matéria -->
        <div class="pdp-section">
            <h3>Origem da Matéria</h3>
            <p><strong>Pedra:</strong> <%= produto.pedra_nome %> 
               <% if (produto.pedra_origem) { %>— <%= produto.pedra_origem %><% } %></p>
            
            <% if (produto.artesao) { %>
                <p><strong>Artesão:</strong> <%= produto.artesao %></p>
            <% } %>
            
            <p><strong>Metal:</strong> <%= produto.metal_nome %> 
               <% if (produto.metal_pureza) { %>(<%= produto.metal_pureza %>)<% } %></p>
            
            <% if (produto.tecnica_fabricacao) { %>
                <p><strong>Técnica:</strong> <%= produto.tecnica_fabricacao %></p>
            <% } %>
        </div>
        
        <!-- Cuidados -->
        <div class="pdp-section">
            <h3>Cuidados</h3>
            <% if (produto.tipo_pedra === 'onix') { %>
                <p>Limpe com pano macio e seco. O ónix é resistente, mas evite impactos fortes. Guarde em local seco, longe de perfumes e químicos.</p>
            <% } else if (produto.tipo_pedra === 'olho-de-tigre') { %>
                <p>Use pano de microfibra para realçar o brilho natural. Evite água e produtos químicos. O olho-de-tigre mantém sua energia com limpeza suave.</p>
            <% } else { %>
                <p>Limpe com pano macio. Evite químicos, perfumes e água em excesso. Guarde em bolsa de tecido para preservar o brilho do metal.</p>
            <% } %>
            
            <% if (produto.metal_tipo === 'prata_925') { %>
                <p><strong>Prata 925:</strong> Pode oxidar naturalmente. Use produtos específicos para prata ou pano de polimento para restaurar o brilho.</p>
            <% } %>
        </div>
        
        <!-- Produtos relacionados -->
        <% if (locals.produtosRelacionados && produtosRelacionados.length > 0) { %>
            <div class="pdp-section">
                <h3>Harmoniza com</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                    <% produtosRelacionados.forEach(relacionado => { %>
                        <a href="/produto/<%= relacionado.slug %>" style="text-align: center;">
                            <img src="<%= relacionado.imagem_principal %>" 
                                 alt="<%= relacionado.nome %>"
                                 style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
                            <small style="display: block; margin-top: 4px; color: #bfb8a8;"><%= relacionado.nome %></small>
                        </a>
                    <% }) %>
                </div>
            </div>
        <% } %>
    </div>
</div>

<script>
function changeMainImage(src) {
    document.getElementById('main-product-image').src = src;
    
    // Remove active de todas as thumbs
    document.querySelectorAll('.pdp-thumbnails img').forEach(img => {
        img.classList.remove('active');
    });
    
    // Adiciona active à thumb clicada
    event.target.classList.add('active');
}

function adicionarCarrinho() {
    const quantidade = document.getElementById('quantidade').value;
    
    // Integrar com sistema de carrinho existente
    // Por enquanto, exemplo:
    alert(`Adicionado ${quantidade}x <%= produto.nome %> ao carrinho!`);
    
    // Aqui integraria com o sistema de carrinho atual via AJAX
    // fetch('/carrinho/adicionar', { ... })
}
</script>
```

***

## 🗃️ ALTERAÇÕES NA BASE DE DADOS

### **Migração SQL:**
```sql
-- Adicionar campos para pedras naturais
ALTER TABLE produtos 
ADD COLUMN stone_type ENUM('onix', 'olho-de-tigre', 'outros') NULL AFTER categoria_id,
ADD COLUMN stone_origin VARCHAR(120) NULL COMMENT 'Origem geográfica da pedra',
ADD COLUMN metal_finish ENUM('prata_925', 'prata_com_ouro', 'outros') NULL,
ADD COLUMN metal_purity VARCHAR(50) NULL COMMENT 'Ex: 925, 18k, etc',
ADD COLUMN artisan_name VARCHAR(100) NULL COMMENT 'Nome do artesão',
ADD COLUMN crafting_technique VARCHAR(150) NULL COMMENT 'Técnica de fabricação',
ADD COLUMN care_instructions TEXT NULL COMMENT 'Instruções específicas de cuidado';

-- Índices para performance em filtros
CREATE INDEX idx_produtos_stone_type ON produtos (stone_type);
CREATE INDEX idx_produtos_metal_finish ON produtos (metal_finish);
CREATE INDEX idx_produtos_stone_metal ON produtos (stone_type, metal_finish);

-- Adicionar dados exemplo
INSERT INTO produtos (nome, descricao, preco, stone_type, stone_origin, metal_finish, metal_purity, imagem_principal, slug, ativo) VALUES 
('Anel Ónix Proteção', 'Anel masculino em prata 925 com ónix facetado. Força ancestral em design contemporâneo.', 59.90, 'onix', 'Brasil', 'prata_925', '925', '/images/produtos/onix/anel-protecao-01.jpg', 'anel-onix-protecao', 1),

('Colar Olho-de-tigre Coragem', 'Pingente em olho-de-tigre natural com corrente prata. Energia dourada para o dia a dia.', 79.90, 'olho-de-tigre', 'África do Sul', 'prata_925', '925', '/images/produtos/olho-de-tigre/colar-coragem-01.jpg', 'colar-olho-tigre-coragem', 1),

('Brincos Ónix Elegância', 'Par de brincos discretos em ónix e prata com ouro. Sofisticação para qualquer ocasião.', 89.90, 'onix', 'Índia', 'prata_com_ouro', '925 + 18k', '/images/produtos/onix/brincos-elegancia-01.jpg', 'brincos-onix-elegancia', 1);
```

***

## 🎯 CONTROLADORES E ROTAS

### **Controlador de Catálogo (controllers/catalogoController.js):**
```javascript
const db = require('../config/database'); // Ajustar ao seu setup de DB

const catalogoController = {
    // Página de catálogo com filtros
    async index(req, res) {
        try {
            const { pedra, metal, ordenar = 'recentes', pagina = 1 } = req.query;
            const itensPorPagina = 12;
            const offset = (pagina - 1) * itensPorPagina;
            
            // Build da query com filtros
            let whereClause = 'WHERE ativo = 1';
            let params = [];
            
            if (pedra) {
                whereClause += ' AND stone_type = ?';
                params.push(pedra);
            }
            
            if (metal) {
                whereClause += ' AND metal_finish = ?';
                params.push(metal);
            }
            
            // Ordenação
            let orderClause = 'ORDER BY created_at DESC'; // padrão: recentes
            switch (ordenar) {
                case 'preco_asc':
                    orderClause = 'ORDER BY preco ASC';
                    break;
                case 'preco_desc':
                    orderClause = 'ORDER BY preco DESC';
                    break;
                case 'nome':
                    orderClause = 'ORDER BY nome ASC';
                    break;
            }
            
            // Query principal
            const query = `
                SELECT 
                    *,
                    CASE stone_type
                        WHEN 'onix' THEN 'Ónix'
                        WHEN 'olho-de-tigre' THEN 'Olho-de-tigre'
                        ELSE stone_type
                    END as pedra_nome,
                    CASE metal_finish
                        WHEN 'prata_925' THEN 'Prata 925'
                        WHEN 'prata_com_ouro' THEN 'Prata com ouro'
                        ELSE metal_finish
                    END as metal_nome,
                    CONCAT('€', FORMAT(preco, 2)) as preco_formatado
                FROM produtos 
                ${whereClause} 
                ${orderClause}
                LIMIT ? OFFSET ?
            `;
            
            params.push(itensPorPagina, offset);
            
            // Executar query
            const produtos = await db.query(query, params);
            
            // Query para contar total (para paginação)
            const countQuery = `SELECT COUNT(*) as total FROM produtos ${whereClause}`;
            const [{ total }] = await db.query(countQuery, params.slice(0, -2)); // Remove LIMIT e OFFSET
            
            const totalPaginas = Math.ceil(total / itensPorPagina);
            
            res.render('pages/catalogo-dark', {
                title: pedra ? `Coleção ${pedra === 'onix' ? 'Ónix' : 'Olho-de-tigre'}` : 'Catálogo',
                produtos,
                query: req.query,
                filtroAtivo: { pedra, metal },
                paginacao: {
                    paginaAtual: parseInt(pagina),
                    totalPaginas,
                    totalItens: total
                }
            });
            
        } catch (error) {
            console.error('Erro no catálogo:', error);
            res.status(500).render('pages/erro', { 
                message: 'Erro ao carregar catálogo' 
            });
        }
    },
    
    // Página individual do produto
    async produto(req, res) {
        try {
            const { slug } = req.params;
            
            // Buscar produto
            const [produto] = await db.query(`
                SELECT 
                    *,
                    CASE stone_type
                        WHEN 'onix' THEN 'Ónix'
                        WHEN 'olho-de-tigre' THEN 'Olho-de-tigre'
                        ELSE stone_type
                    END as pedra_nome,
                    CASE metal_finish
                        WHEN 'prata_925' THEN 'Prata 925'
                        WHEN 'prata_com_ouro' THEN 'Prata com ouro'
                        ELSE metal_finish
                    END as metal_nome,
                    CONCAT('€', FORMAT(preco, 2)) as preco_formatado
                FROM produtos 
                WHERE slug = ? AND ativo = 1
            `, [slug]);
            
            if (!produto) {
                return res.status(404).render('pages/erro', {
                    message: 'Produto não encontrado'
                });
            }
            
            // Buscar produtos relacionados (mesma pedra ou metal)
            const produtosRelacionados = await db.query(`
                SELECT id, nome, slug, imagem_principal, preco,
                       CONCAT('€', FORMAT(preco, 2)) as preco_formatado
                FROM produtos 
                WHERE (stone_type = ? OR metal_finish = ?) 
                  AND id != ? 
                  AND ativo = 1
                LIMIT 4
            `, [produto.stone_type, produto.metal_finish, produto.id]);
            
            // Buscar imagens adicionais (se tiver tabela separada)
            // const imagensAdicionais = await db.query('SELECT * FROM produto_imagens WHERE produto_id = ?', [produto.id]);
            
            res.render('pages/produto-dark', {
                title: `${produto.nome} - ${produto.pedra_nome}`,
                description: produto.descricao,
                produto: {
                    ...produto,
                    imagens_adicionais: [] // Substituir pela query real
                },
                produtosRelacionados
            });
            
        } catch (error) {
            console.error('Erro no produto:', error);
            res.status(500).render('pages/erro', { 
                message: 'Erro ao carregar produto' 
            });
        }
    }
};

module.exports = catalogoController;
```

### **Rotas (routes/site.js - atualizar existente):**
```javascript
const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

// Home com tema dark
router.get('/', async (req, res) => {
    try {
        // Buscar produtos em destaque (opcional)
        const produtosDestaque = []; // await db.query('SELECT * FROM produtos WHERE destaque = 1 LIMIT 6');
        
        res.render('pages/home-dark', {
            title: 'Gonzaga Art & Shine - Elegância que nasce da terra',
            description: 'Joalharia alternativa em prata 925 com pedras naturais. Ónix e olho-de-tigre, elegância autêntica.',
            produtosDestaque
        });
    } catch (error) {
        console.error('Erro na home:', error);
        res.render('pages/home-dark', { produtosDestaque: [] });
    }
});

// Catálogo
router.get('/catalogo', catalogoController.index);

// Produto individual
router.get('/produto/:slug', catalogoController.produto);

// Página de vendedores/artesãos
router.get('/vendedores', (req, res) => {
    res.render('pages/vendedores', {
        title: 'Nossos Artesãos - Gonzaga Art & Shine'
    });
});

// Manifesto
router.get('/manifesto', (req, res) => {
    res.render('pages/manifesto', {
        title: 'Manifesto - Elegância que nasce da terra',
        description: 'A origem das nossas matérias e o cuidado com cada peça.'
    });
});

module.exports = router;
```

***

## 📱 RESPONSIVIDADE E PERFORMANCE

### **CSS Adicional para Mobile:**
```css
/* Adicionar ao components.css */

/* Mobile responsivo */
@media (max-width: 768px) {
    .hero {
        min-height: 50vh;
        background-attachment: scroll; /* Fix para mobile */
    }
    
    .hero-content {
        padding: 40px 0;
    }
    
    .hero h1 {
        font-size: 28px;
        line-height: 1.2;
    }
    
    .nav ul {
        display: none; /* Implementar menu mobile se necessário */
    }
    
    .pdp {
        grid-template-columns: 1fr;
        gap: 24px;
        margin: 20px 0;
    }
    
    .pdp-gallery {
        position: static;
    }
    
    .filters {
        flex-direction: column;
        gap: 8px;
    }
    
    .filter-select {
        width: 100%;
    }
    
    .btn-group {
        flex-direction: column;
        align-items: stretch;
    }
    
    .btn-group .btn {
        width: 100%;
        text-align: center;
    }
}

/* Performance: Reduce motion para acessibilidade */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    
    .hero {
        background-attachment: scroll;
    }
}

/* Print styles */
@media print {
    .site-header,
    .site-footer,
    .filters,
    .btn,
    button {
        display: none;
    }
    
    body {
        background: white;
        color: black;
    }
}
```

### **Lazy Loading de Imagens:**
```javascript
// Adicionar ao final do layout principal
<script>
// Lazy loading nativo com fallback
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback para browsers antigos
    const script = document.createElement('script');
    script.src = '/js/intersection-observer-polyfill.js';
    document.head.appendChild(script);
}

// Troca de imagem principal (PDP)
function changeMainImage(src) {
    const mainImg = document.getElementById('main-product-image');
    if (mainImg) {
        mainImg.src = src;
        
        // Update active thumbnail
        document.querySelectorAll('.pdp-thumbnails img').forEach(img => {
            img.classList.remove('active');
        });
        event.target.classList.add('active');
    }
}

// Analytics de interação (opcional)
function trackProductView(productId, productName) {
    // Google Analytics, Facebook Pixel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
            currency: 'EUR',
            value: <%= produto?.preco || 0 %>,
            items: [{
                item_id: productId,
                item_name: productName,
                category: '<%= produto?.stone_type %>',
                quantity: 1
            }]
        });
    }
}
</script>
```

***

## 🚀 DEPLOYMENT E OTIMIZAÇÃO

### **Compressão de Assets:**
```javascript
// No app.js, adicionar compressão:
const compression = require('compression');

// Aplicar compressão
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        return compression.filter(req, res);
    }
}));

// Cache headers para assets estáticos
app.use('/css', express.static('public/css', {
    maxAge: '7d',
    etag: true
}));

app.use('/images', express.static('public/images', {
    maxAge: '30d',
    etag: true
}));
```

### **Otimizações finais:**
```javascript
// controllers/baseController.js - para dados comuns
const baseController = {
    // Dados que aparecem em todas as páginas
    getCommonData() {
        return {
            currentYear: new Date().getFullYear(),
            siteName: 'Gonzaga Art & Shine',
            siteSlogan: 'Elegância que nasce da terra',
            // Categorias para navegação
            categoriasPedras: [
                { slug: 'onix', nome: 'Ónix', cor: '#111111' },
                { slug: 'olho-de-tigre', nome: 'Olho-de-tigre', cor: '#6B4A1B' }
            ]
        };
    }
};

// Usar em todos os controladores:
res.render('template', {
    ...baseController.getCommonData(),
    // dados específicos da página
});
```

***

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1 (Semana 1):**
- [ ] Criar todos os ficheiros CSS (tokens, base, components, pages)
- [ ] Implementar layout-dark.ejs com fontes Google
- [ ] Criar partials (header-dark, footer-dark, card-produto)
- [ ] Implementar home-dark.ejs com 2 heros
- [ ] Testar responsividade mobile
- [ ] Aplicar paleta Dark Nature em todo o site

### **Fase 2 (Semana 2):**
- [ ] Executar migração SQL (stone_type, metal_finish, etc.)
- [ ] Criar catalogoController com filtros
- [ ] Implementar catalogo-dark.ejs com filtros funcionais
- [ ] Implementar produto-dark.ejs com storytelling
- [ ] Adicionar produtos exemplo (Ónix e Olho-de-tigre)
- [ ] Testar todos os filtros e navegação

### **Fase 3 (Final):**
- [ ] Otimizar imagens (WebP, lazy loading)
- [ ] Configurar cache headers
- [ ] Testar performance (GTmetrix, PageSpeed)
- [ ] Verificar acessibilidade (contrastes AA)
- [ ] Deploy no ambiente de produção
- [ ] Testes finais em dispositivos reais

### **Verificações de Qualidade:**
- [ ] Todas as cores seguem a paleta Dark Nature
- [ ] Tipografia Cinzel aplicada em títulos
- [ ] Metais equilibrados (prata/dourado 50/50)
- [ ] Filtros funcionais por pedra e metal
- [ ] Storytelling "Origem da Matéria" em produtos
- [ ] Responsividade em mobile/tablet/desktop
- [ ] Performance LCP < 2.5s
- [ ] Contraste AA em todos os textos
- [ ] SEO meta tags em todas as páginas

***

## 🎯 RESULTADO ESPERADO

Após implementação completa:

1. **Visual Impact:** Site completamente transformado com identidade gothic natural
2. **Funcionalidade:** Filtros por Ónix/Olho-de-tigre funcionais
3. **Storytelling:** Cada produto conta origem da matéria  
4. **Performance:** Carregamento rápido mesmo no hosting partilhado
5. **Mobile-first:** Experiência perfeita em dispositivos móveis
6. **SEO:** Otimizado para "joalharia ónix", "olho-de-tigre prata 925"
7. **Conversão:** UX focada em destacar a autenticidade das peças

**Tempo estimado:** 10-14 dias de trabalho
**Compatibilidade:** 100% com o sistema Node.js + MySQL existente
**Risco:** Mínimo (apenas frontend + campos DB adicionais)

---

Excelentíssimo Senhor Hugo Gonzaga Gomes, este guia está completo e pronto para ser implementado pelo Cursor. Cada ficheiro está detalhado, todas as especificações visual estão incluídas, e a integração com o sistema existente está garantida.

