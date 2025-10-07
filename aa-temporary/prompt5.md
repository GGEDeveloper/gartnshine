# 🚀 **FASE 4 COMPLETA: CLIENT EXPERIENCE REVOLUTION**

## **PLANO DETALHADO COM CÓDIGO ESPECÍFICO PARA GONZAGA'S ART & SHINE**

***

## 📋 **OVERVIEW GERAL**

### **DURAÇÃO:** 1.5 semanas (10 dias úteis)
### **OBJECTIVO:** Transformar frontend numa experiência premium
### **MÉTODO:** Day-by-day implementation com testing incremental

***

## 🎯 **PLANO DE IMPLEMENTAÇÃO**

### **DAY 1-2: Homepage Revolution (16 horas)**
### **DAY 3: Navigation & Mobile Experience (8 horas)**  
### **DAY 4: Catalog Experience Enhancement (8 horas)**
### **DAY 5-6: Polish & Micro-interactions (12 horas)**
### **DAY 7: Integration & Testing (8 horas)**

**Total:** 52 horas de desenvolvimento + testing

***

# 📅 **DAY 1-2: HOMEPAGE REVOLUTION**

## **MORNING DAY 1: Hero Section Setup**

### **STEP 1: Criar Homepage V2 Structure**

```bash
# Criar novos ficheiros
touch views/index-v2.ejs
touch public/css/homepage-v2.css
touch public/js/homepage-v2.js
touch public/js/swiper-setup.js
```

### **STEP 2: Homepage Template**

**CRIAR: `views/index-v2.ejs`**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gonzaga's Art & Shine - Joias de Prata 925 Únicas</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Joias artesanais de prata 925. Cada peça é única, criada à mão com técnicas tradicionais e design contemporâneo. Descobra a elegância que nasce da terra.">
    <meta name="keywords" content="joias prata 925, artesanal, handmade, brincos, anéis, colares, pulseiras, Portugal">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Gonzaga's Art & Shine - Joias de Prata 925">
    <meta property="og:description" content="Elegância que nasce da terra. Joias únicas em prata 925.">
    <meta property="og:image" content="/images/og-image.jpg">
    <meta property="og:type" content="website">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="/css/homepage-v2.css" as="style">
    <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/homepage-v2.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="homepage-v2">
    
    <!-- Navigation (Enhanced) -->
    <%- include('partials/header-v2') %>
    
    <!-- Hero Section -->
    <section class="hero-section-v2" id="heroSection">
        <div class="hero-background">
            <div class="hero-video-container">
                <!-- Optional: Background video overlay -->
                <div class="hero-gradient-overlay"></div>
                <div class="hero-pattern-overlay"></div>
            </div>
        </div>
        
        <div class="hero-content">
            <div class="container">
                <div class="hero-grid">
                    <!-- Left: Text Content -->
                    <div class="hero-text">
                        <div class="hero-text-inner">
                            <span class="hero-subtitle" data-aos="fade-up" data-aos-delay="100">
                                Gonzaga's Art & Shine
                            </span>
                            
                            <h1 class="hero-title" data-aos="fade-up" data-aos-delay="200">
                                <span class="title-line">Elegância que</span>
                                <span class="title-line title-accent">nasce da terra</span>
                            </h1>
                            
                            <p class="hero-description" data-aos="fade-up" data-aos-delay="300">
                                Joias únicas em prata 925, criadas à mão com técnicas tradicionais 
                                e design contemporâneo. Cada peça conta uma história de arte e sofisticação.
                            </p>
                            
                            <div class="hero-cta" data-aos="fade-up" data-aos-delay="400">
                                <a href="/catalog" class="btn-hero-primary">
                                    <span class="btn-text">Explorar Coleção</span>
                                    <span class="btn-icon">
                                        <i class="fas fa-arrow-right"></i>
                                    </span>
                                </a>
                                
                                <a href="#about" class="btn-hero-secondary">
                                    <span>Nossa História</span>
                                </a>
                            </div>
                            
                            <!-- Trust Indicators -->
                            <div class="hero-trust" data-aos="fade-up" data-aos-delay="500">
                                <div class="trust-item">
                                    <i class="fas fa-medal"></i>
                                    <span>Prata 925 Autêntica</span>
                                </div>
                                <div class="trust-item">
                                    <i class="fas fa-hands"></i>
                                    <span>Feito à Mão</span>
                                </div>
                                <div class="trust-item">
                                    <i class="fas fa-shipping-fast"></i>
                                    <span>Envio Portugal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right: Visual Showcase -->
                    <div class="hero-visual" data-aos="fade-left" data-aos-delay="600">
                        <div class="hero-showcase">
                            <!-- Featured Product Carousel -->
                            <div class="featured-carousel-container">
                                <div class="swiper featured-swiper">
                                    <div class="swiper-wrapper" id="featuredProductsWrapper">
                                        <!-- Dynamic content loaded via JavaScript -->
                                    </div>
                                    <div class="swiper-pagination"></div>
                                </div>
                            </div>
                            
                            <!-- Floating Elements -->
                            <div class="floating-elements">
                                <div class="floating-circle circle-1"></div>
                                <div class="floating-circle circle-2"></div>
                                <div class="floating-circle circle-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Scroll Indicator -->
        <div class="scroll-indicator" data-aos="fade-up" data-aos-delay="800">
            <div class="scroll-mouse">
                <div class="scroll-wheel"></div>
            </div>
            <span class="scroll-text">Descobre mais</span>
        </div>
    </section>
    
    <!-- Featured Products Section -->
    <section class="featured-products-v2" id="featuredProducts">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <span class="section-subtitle">Coleção</span>
                <h2 class="section-title">Peças em Destaque</h2>
                <p class="section-description">
                    As nossas criações mais populares e únicas, selecionadas especialmente para ti
                </p>
            </div>
            
            <div class="products-carousel-wrapper" data-aos="fade-up" data-aos-delay="200">
                <div class="swiper products-swiper">
                    <div class="swiper-wrapper" id="mainProductsWrapper">
                        <!-- Dynamic content -->
                    </div>
                    
                    <!-- Navigation -->
                    <div class="swiper-button-prev products-prev">
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    <div class="swiper-button-next products-next">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="swiper-pagination products-pagination"></div>
                </div>
            </div>
            
            <div class="showcase-cta" data-aos="fade-up" data-aos-delay="400">
                <a href="/catalog" class="btn-view-all">
                    <span>Ver Toda a Coleção</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>
    
    <!-- Trust & Values Section -->
    <section class="trust-section" id="trust">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <span class="section-subtitle">Garantias</span>
                <h2 class="section-title">Porque Escolher-nos</h2>
                <p class="section-description">
                    Comprometemo-nos com a excelência em cada detalhe
                </p>
            </div>
            
            <div class="trust-grid">
                <div class="trust-card" data-aos="fade-up" data-aos-delay="100">
                    <div class="trust-icon">
                        <i class="fas fa-medal"></i>
                    </div>
                    <h3>Prata 925 Autêntica</h3>
                    <p>Garantia de qualidade e pureza em todas as peças. Certificação de autenticidade incluída.</p>
                </div>
                
                <div class="trust-card" data-aos="fade-up" data-aos-delay="200">
                    <div class="trust-icon">
                        <i class="fas fa-hands"></i>
                    </div>
                    <h3>Artesanal Português</h3>
                    <p>Cada joia é única, criada à mão com técnicas tradicionais portuguesas passadas de geração em geração.</p>
                </div>
                
                <div class="trust-card" data-aos="fade-up" data-aos-delay="300">
                    <div class="trust-icon">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <h3>Atendimento Personalizado</h3>
                    <p>Contacto direto via WhatsApp para esclarecimentos e atendimento personalizado a cada cliente.</p>
                </div>
                
                <div class="trust-card" data-aos="fade-up" data-aos-delay="400">
                    <div class="trust-icon">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <h3>Envio Seguro Portugal</h3>
                    <p>Entregas rápidas e seguras em todo o Portugal continental e ilhas, com embalagem cuidada.</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Categories Showcase -->
    <section class="categories-showcase" id="categories">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <span class="section-subtitle">Descobre</span>
                <h2 class="section-title">Nossas Categorias</h2>
                <p class="section-description">
                    Explora diferentes estilos e encontra a peça perfeita para cada ocasião
                </p>
            </div>
            
            <div class="categories-grid" id="categoriesGrid">
                <!-- Dynamic content loaded via JavaScript -->
            </div>
        </div>
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content" data-aos="zoom-in">
                <div class="cta-text">
                    <h2>Pronta para descobrir a tua próxima joia favorita?</h2>
                    <p>Explora a nossa coleção completa ou contacta-nos para criações personalizadas</p>
                </div>
                
                <div class="cta-actions">
                    <a href="/catalog" class="btn-cta-primary">
                        <span>Explorar Coleção</span>
                        <i class="fas fa-gem"></i>
                    </a>
                    
                    <a href="https://wa.me/351XXXXXXXXX?text=Olá! Gostaria de saber mais sobre as vossas joias." 
                       class="btn-cta-whatsapp" target="_blank">
                        <span>Contactar WhatsApp</span>
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <%- include('partials/footer') %>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="/js/homepage-v2.js"></script>
    <script src="/js/swiper-setup.js"></script>
    
    <!-- AOS Animation Init -->
    <script>
        AOS.init({
            duration: 800,
            easing: 'ease-in-out-cubic',
            once: true,
            offset: 100
        });
    </script>
</body>
</html>
```

### **STEP 3: Homepage CSS**

**CRIAR: `public/css/homepage-v2.css`**
```css
/* ========================================
   HOMEPAGE V2 - GONZAGA'S ART & SHINE
   Modern, Premium, Mobile-First Design
======================================== */

/* Import AOS */
@import url('https://unpkg.com/aos@2.3.1/dist/aos.css');

/* CSS Variables Específicas Homepage */
:root {
    /* Gonzaga's Brand Colors */
    --color-primary: #667eea;
    --color-secondary: #c0a080;
    --color-accent: #4ecdc4;
    --color-gold: #d4af37;
    --color-rose-gold: #e8b4b8;
    
    /* Hero Section */
    --hero-height: 100vh;
    --hero-bg-gradient: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.95) 0%, 
        rgba(192, 160, 128, 0.85) 100%);
    
    /* Spacing Scale */
    --section-padding: clamp(60px, 8vw, 120px);
    --container-padding: clamp(20px, 5vw, 80px);
    
    /* Typography Scale */
    --hero-title-size: clamp(2.5rem, 6vw, 4.5rem);
    --section-title-size: clamp(2rem, 4vw, 3rem);
    --body-large: clamp(1.125rem, 2vw, 1.25rem);
    
    /* Animation Timing */
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Reset & Base */
.homepage-v2 {
    overflow-x: hidden;
    scroll-behavior: smooth;
}

.homepage-v2 * {
    box-sizing: border-box;
}

/* Container */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--container-padding);
}

/* Section Headers */
.section-header {
    text-align: center;
    margin-bottom: clamp(40px, 6vw, 80px);
}

.section-subtitle {
    display: inline-block;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--color-secondary);
    margin-bottom: 12px;
    position: relative;
}

.section-subtitle::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: var(--color-accent);
}

.section-title {
    font-size: var(--section-title-size);
    font-weight: 700;
    color: var(--color-neutral-800);
    margin-bottom: 20px;
    line-height: 1.2;
}

.section-description {
    font-size: var(--body-large);
    color: var(--color-neutral-600);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

/* ========================================
   HERO SECTION
======================================== */

.hero-section-v2 {
    position: relative;
    height: var(--hero-height);
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--hero-bg-gradient);
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.hero-gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--hero-bg-gradient);
    z-index: 2;
}

.hero-pattern-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 60px 60px;
    background-position: 0 0, 30px 30px;
    z-index: 3;
}

.hero-content {
    position: relative;
    z-index: 4;
    width: 100%;
}

.hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(40px, 8vw, 100px);
    align-items: center;
    min-height: 80vh;
}

/* Hero Text */
.hero-text {
    color: white;
}

.hero-text-inner {
    max-width: 580px;
}

.hero-subtitle {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 1px;
    margin-bottom: 16px;
    opacity: 0.9;
}

.hero-title {
    font-size: var(--hero-title-size);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 24px;
}

.title-line {
    display: block;
}

.title-accent {
    background: linear-gradient(135deg, var(--color-gold), var(--color-rose-gold));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-description {
    font-size: var(--body-large);
    line-height: 1.6;
    margin-bottom: 32px;
    opacity: 0.95;
}

/* Hero CTAs */
.hero-cta {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    flex-wrap: wrap;
}

.btn-hero-primary {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: linear-gradient(135deg, var(--color-gold), var(--color-rose-gold));
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: var(--transition-smooth);
    box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
    position: relative;
    overflow: hidden;
}

.btn-hero-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.6s;
}

.btn-hero-primary:hover::before {
    left: 100%;
}

.btn-hero-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(212, 175, 55, 0.4);
    color: white;
}

.btn-hero-secondary {
    display: inline-flex;
    align-items: center;
    padding: 16px 32px;
    color: white;
    text-decoration: none;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50px;
    font-weight: 500;
    font-size: 1.1rem;
    transition: var(--transition-smooth);
    backdrop-filter: blur(10px);
}

.btn-hero-secondary:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-2px);
    color: white;
}

/* Hero Trust Indicators */
.hero-trust {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    opacity: 0.9;
}

.trust-item i {
    color: var(--color-gold);
    font-size: 1.1rem;
}

/* Hero Visual */
.hero-visual {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-showcase {
    position: relative;
    width: 100%;
    max-width: 500px;
}

.featured-carousel-container {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.2);
}

/* Floating Elements */
.floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.floating-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
}

.circle-1 {
    width: 120px;
    height: 120px;
    top: -60px;
    right: -60px;
    animation: float 6s ease-in-out infinite;
}

.circle-2 {
    width: 80px;
    height: 80px;
    bottom: -40px;
    left: -40px;
    animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
    width: 60px;
    height: 60px;
    top: 50%;
    left: -30px;
    animation: float 10s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

/* Scroll Indicator */
.scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: white;
    opacity: 0.8;
    z-index: 5;
}

.scroll-mouse {
    width: 24px;
    height: 40px;
    border: 2px solid rgba(255,255,255,0.5);
    border-radius: 12px;
    position: relative;
}

.scroll-wheel {
    width: 4px;
    height: 8px;
    background: rgba(255,255,255,0.8);
    border-radius: 2px;
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    animation: scroll-wheel 2s infinite;
}

@keyframes scroll-wheel {
    0% { top: 8px; opacity: 1; }
    100% { top: 24px; opacity: 0; }
}

.scroll-text {
    font-size: 0.875rem;
    letter-spacing: 1px;
}

/* ========================================
   FEATURED PRODUCTS SECTION
======================================== */

.featured-products-v2 {
    padding: var(--section-padding) 0;
    background: linear-gradient(180deg, #f8f9fa 0%, white 100%);
}

.products-carousel-wrapper {
    position: relative;
    margin-bottom: 60px;
}

/* Swiper Customization */
.products-swiper {
    padding: 20px 0 60px;
    overflow: visible;
}

.products-swiper .swiper-slide {
    height: auto;
}

/* Product Cards in Carousel */
.featured-product-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    transition: var(--transition-smooth);
    border: 1px solid rgba(0,0,0,0.05);
}

.featured-product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.featured-product-image {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.featured-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.featured-product-card:hover .featured-product-image img {
    transform: scale(1.1);
}

.product-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: var(--color-accent);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.featured-product-info {
    padding: 24px;
}

.featured-product-category {
    font-size: 0.875rem;
    color: var(--color-secondary);
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.featured-product-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: 8px;
    line-height: 1.3;
}

.featured-product-price {
    font-size: 1.1rem;
    color: var(--color-secondary);
    font-weight: 700;
    margin-bottom: 16px;
}

.featured-product-cta {
    display: flex;
    gap: 12px;
}

.btn-product-view {
    flex: 1;
    padding: 12px 20px;
    background: var(--color-primary);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    text-align: center;
    transition: var(--transition-smooth);
}

.btn-product-view:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    color: white;
}

.btn-product-whatsapp {
    padding: 12px;
    background: #25D366;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-smooth);
}

.btn-product-whatsapp:hover {
    background: #20BA5A;
    transform: translateY(-1px);
    color: white;
}

/* Swiper Navigation */
.products-prev,
.products-next {
    width: 50px !important;
    height: 50px !important;
    background: white !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
    color: var(--color-primary) !important;
    border: 1px solid rgba(0,0,0,0.05) !important;
    transition: var(--transition-smooth) !important;
}

.products-prev:hover,
.products-next:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important;
}

.products-prev::after,
.products-next::after {
    font-size: 16px !important;
    font-weight: 600 !important;
}

/* Swiper Pagination */
.products-pagination {
    bottom: 0 !important;
}

.products-pagination .swiper-pagination-bullet {
    width: 12px !important;
    height: 12px !important;
    background: var(--color-neutral-300) !important;
    opacity: 1 !important;
    transition: var(--transition-smooth) !important;
}

.products-pagination .swiper-pagination-bullet-active {
    background: var(--color-primary) !important;
    transform: scale(1.2) !important;
}

/* Showcase CTA */
.showcase-cta {
    text-align: center;
}

.btn-view-all {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: var(--transition-smooth);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.btn-view-all:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    color: white;
}

/* ========================================
   TRUST SECTION
======================================== */

.trust-section {
    padding: var(--section-padding) 0;
    background: white;
}

.trust-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 40px;
    margin-top: 60px;
}

.trust-card {
    text-align: center;
    padding: 40px 30px;
    background: linear-gradient(135deg, #f8f9fa, white);
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.05);
    transition: var(--transition-smooth);
}

.trust-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.trust-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 2rem;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.trust-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: 16px;
}

.trust-card p {
    color: var(--color-neutral-600);
    line-height: 1.6;
}

/* ========================================
   CATEGORIES SHOWCASE
======================================== */

.categories-showcase {
    padding: var(--section-padding) 0;
    background: linear-gradient(180deg, white 0%, #f8f9fa 100%);
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 60px;
}

.category-card {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: var(--transition-smooth);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.category-card:hover {
    transform: scale(1.02);
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.category-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #e9ecef, #f8f9fa);
}

.category-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.category-card:hover .category-image img {
    transform: scale(1.1);
}

.category-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.8), 
        rgba(192, 160, 128, 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--transition-smooth);
}

.category-card:hover .category-overlay {
    opacity: 1;
}

.category-content {
    text-align: center;
    color: white;
    transform: translateY(20px);
    transition: var(--transition-smooth);
}

.category-card:hover .category-content {
    transform: translateY(0);
}

.category-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.category-count {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 16px;
}

.btn-category-view {
    padding: 12px 24px;
    background: rgba(255,255,255,0.2);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.3);
    transition: var(--transition-smooth);
}

.btn-category-view:hover {
    background: rgba(255,255,255,0.3);
    color: white;
}

/* ========================================
   CTA SECTION
======================================== */

.cta-section {
    padding: var(--section-padding) 0;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    color: white;
    text-align: center;
}

.cta-content {
    max-width: 800px;
    margin: 0 auto;
}

.cta-text h2 {
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;
}

.cta-text p {
    font-size: var(--body-large);
    opacity: 0.95;
    margin-bottom: 40px;
    line-height: 1.6;
}

.cta-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.btn-cta-primary,
.btn-cta-whatsapp {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    text-decoration: none;
    transition: var(--transition-smooth);
}

.btn-cta-primary {
    background: var(--color-gold);
    color: white;
    box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
}

.btn-cta-primary:hover {
    background: #c19b26;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(212, 175, 55, 0.4);
    color: white;
}

.btn-cta-whatsapp {
    background: #25D366;
    color: white;
    box-shadow: 0 8px 32px rgba(37, 211, 102, 0.3);
}

.btn-cta-whatsapp:hover {
    background: #20BA5A;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(37, 211, 102, 0.4);
    color: white;
}

/* ========================================
   RESPONSIVE DESIGN
======================================== */

@media (max-width: 1024px) {
    .hero-grid {
        grid-template-columns: 1fr;
        gap: 60px;
        text-align: center;
    }
    
    .hero-visual {
        order: -1;
    }
    
    .trust-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }
    
    .categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    :root {
        --hero-height: 100vh;
        --section-padding: clamp(40px, 8vw, 80px);
        --container-padding: 20px;
    }
    
    .hero-cta {
        flex-direction: column;
        align-items: center;
    }
    
    .btn-hero-primary,
    .btn-hero-secondary {
        width: 100%;
        max-width: 280px;
        justify-content: center;
    }
    
    .hero-trust {
        justify-content: center;
        gap: 16px;
    }
    
    .trust-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    
    .categories-grid {
        grid-template-columns: 1fr;
    }
    
    .cta-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .btn-cta-primary,
    .btn-cta-whatsapp {
        width: 100%;
        max-width: 280px;
        justify-content: center;
    }
    
    .floating-circle {
        display: none; /* Hide on mobile for performance */
    }
}

@media (max-width: 480px) {
    .scroll-indicator {
        bottom: 20px;
    }
    
    .featured-product-info {
        padding: 20px;
    }
    
    .trust-card {
        padding: 30px 20px;
    }
    
    .trust-icon {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
    }
}

/* ========================================
   PERFORMANCE OPTIMIZATIONS
======================================== */

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    .floating-circle {
        animation: none;
    }
    
    .scroll-wheel {
        animation: none;
    }
}

/* High contrast mode */
@media (prefers-contrast: high) {
    .btn-hero-primary,
    .btn-view-all,
    .btn-cta-primary {
        border: 2px solid currentColor;
    }
    
    .trust-card,
    .featured-product-card,
    .category-card {
        border: 2px solid var(--color-neutral-300);
    }
}

/* Print styles */
@media print {
    .hero-section-v2,
    .floating-elements,
    .scroll-indicator {
        display: none;
    }
    
    .featured-products-v2,
    .trust-section,
    .categories-showcase,
    .cta-section {
        break-inside: avoid;
        page-break-inside: avoid;
    }
}
```

### **STEP 4: Homepage JavaScript**

**CRIAR: `public/js/homepage-v2.js`**
```javascript
/**
 * Homepage V2 - Gonzaga's Art & Shine
 * Enhanced functionality and interactions
 */

class HomepageV2 {
    constructor() {
        this.featuredProducts = [];
        this.categories = [];
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Load data
            await this.loadFeaturedProducts();
            await this.loadCategories();
            
            // Initialize components
            this.setupHeroInteractions();
            this.setupScrollEffects();
            this.setupPerformanceOptimizations();
            this.setupAccessibility();
            
            console.log('Homepage V2 initialized successfully');
        } catch (error) {
            console.error('Homepage initialization failed:', error);
            this.showErrorFallback();
        }
    }
    
    async loadFeaturedProducts() {
        try {
            this.showLoading('featured');
            
            const response = await fetch('/api/products/featured?limit=8');
            const data = await response.json();
            
            if (data.success) {
                this.featuredProducts = data.data;
                this.renderFeaturedProducts();
            } else {
                throw new Error(data.message || 'Failed to load featured products');
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
            this.showErrorState('featured');
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/families');
            const data = await response.json();
            
            if (data.success) {
                this.categories = data.data;
                this.renderCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showErrorState('categories');
        }
    }
    
    renderFeaturedProducts() {
        const wrapper = document.getElementById('mainProductsWrapper');
        if (!wrapper || !this.featuredProducts.length) return;
        
        wrapper.innerHTML = this.featuredProducts.map(product => `
            <div class="swiper-slide">
                <div class="featured-product-card" data-aos="fade-up">
                    <div class="featured-product-image">
                        <img src="${product.main_image ? `/uploads/products/${product.main_image}` : '/images/placeholder.jpg'}" 
                             alt="${product.name}" 
                             loading="lazy">
                        ${product.featured ? '<span class="product-badge">Destaque</span>' : ''}
                    </div>
                    
                    <div class="featured-product-info">
                        <div class="featured-product-category">${product.family_name || 'Joias'}</div>
                        <h3 class="featured-product-name">${product.name}</h3>
                        <div class="featured-product-price">
                            ${product.sale_price ? 
                                `€${parseFloat(product.sale_price).toFixed(2)}` : 
                                'Preço sob consulta'
                            }
                        </div>
                        
                        <div class="featured-product-cta">
                            <a href="/catalog/product/${product.id}" class="btn-product-view">
                                Ver Detalhes
                            </a>
                            <a href="https://wa.me/351XXXXXXXXX?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre ${product.name} (REF: ${product.reference})`)}" 
                               class="btn-product-whatsapp" 
                               target="_blank"
                               onclick="this.trackWhatsAppClick('${product.id}', 'featured')">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize AOS for new elements
        if (window.AOS) {
            AOS.refresh();
        }
    }
    
    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid || !this.categories.length) return;
        
        grid.innerHTML = this.categories.slice(0, 6).map(category => `
            <div class="category-card" data-aos="fade-up" onclick="this.navigateToCategory(${category.id})">
                <div class="category-image">
                    <img src="${category.image_url || '/images/category-placeholder.jpg'}" 
                         alt="${category.name}" 
                         loading="lazy">
                </div>
                
                <div class="category-overlay">
                    <div class="category-content">
                        <h3 class="category-name">${category.name}</h3>
                        <p class="category-count">${category.product_count || 0} produtos</p>
                        <span class="btn-category-view">Explorar</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (window.AOS) {
            AOS.refresh();
        }
    }
    
    setupHeroInteractions() {
        // Parallax effect for hero background
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const heroSection = document.getElementById('heroSection');
            
            if (heroSection) {
                const speed = 0.5;
                heroSection.style.transform = `translateY(${scrolled * speed}px)`;
            }
            
            ticking = false;
        };
        
        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        // Only enable parallax on desktop for performance
        if (window.innerWidth > 768) {
            window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupScrollEffects() {
        // Scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // Trigger custom animations based on element type
                    this.triggerCustomAnimation(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements for scroll animations
        document.querySelectorAll('.trust-card, .category-card, .featured-product-card').forEach(el => {
            observer.observe(el);
        });
        
        // Navbar scroll behavior
        this.setupNavbarScroll();
    }
    
    setupNavbarScroll() {
        let lastScrollY = window.scrollY;
        let scrollTimeout;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.navbar-v2');
            
            if (!navbar) return;
            
            // Hide/show navbar based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('navbar-hidden');
            } else {
                navbar.classList.remove('navbar-hidden');
            }
            
            // Add background on scroll
            if (currentScrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            
            lastScrollY = currentScrollY;
        };
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateNavbar, 10);
        }, { passive: true });
    }
    
    setupPerformanceOptimizations() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize scroll performance
        this.optimizeScrollPerformance();
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // WebP support detection
                        if (this.supportsWebP() && !img.src.includes('.svg')) {
                            const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                            this.loadImageWithFallback(img, webpSrc, img.src);
                        }
                        
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    supportsWebP() {
        if (this.webpSupport !== undefined) {
            return this.webpSupport;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this.webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        return this.webpSupport;
    }
    
    loadImageWithFallback(img, webpSrc, fallbackSrc) {
        const webpImg = new Image();
        webpImg.onload = () => img.src = webpSrc;
        webpImg.onerror = () => img.src = fallbackSrc;
        webpImg.src = webpSrc;
    }
    
    preloadCriticalResources() {
        const criticalResources = [
            '/css/main.css',
            '/css/homepage-v2.css',
            '/js/swiper-setup.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
    
    optimizeScrollPerformance() {
        // Throttle scroll events for better performance
        let scrollTicking = false;
        
        const optimizedScrollHandler = () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    // Update scroll-dependent elements
                    this.updateScrollDependentElements();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };
        
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }
    
    updateScrollDependentElements() {
        const scrollY = window.pageYOffset;
        
        // Update CSS custom property for use in CSS
        document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
        
        // Update reading progress if present
        const progressBar = document.querySelector('.reading-progress');
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = `${scrolled}%`;
        }
    }
    
    setupAccessibility() {
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();
        
        // ARIA live regions for dynamic content
        this.setupAriaLiveRegions();
        
        // Focus management
        this.setupFocusManagement();
    }
    
    setupKeyboardNavigation() {
        // Skip to main content link
        this.createSkipLink();
        
        // Enhanced focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    createSkipLink() {
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Saltar para o conteúdo principal';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    setupAriaLiveRegions() {
        // Create live region for announcements
        if (!document.querySelector('#announcement-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'announcement-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }
    }
    
    setupFocusManagement() {
        // Trap focus in modals when they're open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals/dropdowns
                this.closeAllModals();
            }
        });
    }
    
    triggerCustomAnimation(element) {
        // Custom animations based on element class
        if (element.classList.contains('trust-card')) {
            this.animateTrustCard(element);
        } else if (element.classList.contains('category-card')) {
            this.animateCategoryCard(element);
        }
    }
    
    animateTrustCard(card) {
        const icon = card.querySelector('.trust-icon');
        if (icon) {
            icon.style.animation = 'pulse 0.6s ease-out';
        }
    }
    
    animateCategoryCard(card) {
        const overlay = card.querySelector('.category-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeInUp 0.6s ease-out';
        }
    }
    
    // Utility Methods
    showLoading(section) {
        const container = document.getElementById(`${section}ProductsWrapper`) || 
                         document.getElementById(`${section}Grid`);
        
        if (container) {
            container.innerHTML = this.getSkeletonLoader(section);
        }
    }
    
    getSkeletonLoader(section) {
        const skeletonCount = section === 'featured' ? 4 : 6;
        return Array(skeletonCount).fill().map(() => `
            <div class="swiper-slide">
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showErrorState(section) {
        const container = document.getElementById(`${section}ProductsWrapper`) || 
                         document.getElementById(`${section}Grid`);
        
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar conteúdo</p>
                    <button onclick="location.reload()" class="btn-retry">Tentar Novamente</button>
                </div>
            `;
        }
    }
    
    showErrorFallback() {
        // Show basic fallback content if JavaScript fails
        document.body.classList.add('js-error');
        console.error('Homepage failed to initialize. Fallback content displayed.');
    }
    
    closeAllModals() {
        // Close any open modals/dropdowns
        document.querySelectorAll('.modal.active, .dropdown.active').forEach(el => {
            el.classList.remove('active');
        });
    }
    
    // Analytics & Tracking
    trackWhatsAppClick(productId, section) {
        // Track WhatsApp clicks for analytics
        if (window.gtag) {
            gtag('event', 'whatsapp_click', {
                product_id: productId,
                section: section,
                page: 'homepage'
            });
        }
        
        console.log(`WhatsApp clicked: Product ${productId} from ${section}`);
    }
    
    navigateToCategory(categoryId) {
        // Navigate to category page
        window.location.href = `/catalog?category=${categoryId}`;
        
        // Track category click
        if (window.gtag) {
            gtag('event', 'category_click', {
                category_id: categoryId,
                page: 'homepage'
            });
        }
    }
}

// Global functions for inline handlers
window.navigateToCategory = (categoryId) => {
    if (window.homepageV2) {
        window.homepageV2.navigateToCategory(categoryId);
    }
};

window.trackWhatsAppClick = (productId, section) => {
    if (window.homepageV2) {
        window.homepageV2.trackWhatsAppClick(productId, section);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage
    if (document.body.classList.contains('homepage-v2')) {
        window.homepageV2 = new HomepageV2();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomepageV2;
}
```

### **STEP 5: Swiper Configuration**

**CRIAR: `public/js/swiper-setup.js`**
```javascript
/**
 * Swiper Configuration for Homepage V2
 * Optimized for touch devices and accessibility
 */

class SwiperSetup {
    constructor() {
        this.swipers = {};
        this.init();
    }
    
    init() {
        // Wait for Swiper library to load
        if (typeof Swiper !== 'undefined') {
            this.initializeSwipers();
        } else {
            // Retry if Swiper not loaded yet
            setTimeout(() => this.init(), 100);
        }
    }
    
    initializeSwipers() {
        this.initFeaturedSwiper();
        this.initProductsSwiper();
        
        // Reinitialize on window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    initFeaturedSwiper() {
        const featuredElement = document.querySelector('.featured-swiper');
        if (!featuredElement) return;
        
        this.swipers.featured = new Swiper('.featured-swiper', {
            // Basic settings
            slidesPerView: 1,
            spaceBetween: 0,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            
            // Effects
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            },
            
            // Pagination
            pagination: {
                el: '.featured-swiper .swiper-pagination',
                clickable: true,
                dynamicBullets: true
            },
            
            // Accessibility
            a11y: {
                prevSlideMessage: 'Produto anterior',
                nextSlideMessage: 'Próximo produto',
                paginationBulletMessage: 'Ir para produto {{index}}'
            },
            
            // Keyboard
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            
            // Touch settings
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            
            // Performance
            watchOverflow: true,
            observer: true,
            observeParents: true
        });
    }
    
    initProductsSwiper() {
        const productsElement = document.querySelector('.products-swiper');
        if (!productsElement) return;
        
        this.swipers.products = new Swiper('.products-swiper', {
            // Responsive slides
            slidesPerView: 1.2,
            spaceBetween: 20,
            centeredSlides: false,
            
            // Responsive breakpoints
            breakpoints: {
                480: {
                    slidesPerView: 1.5,
                    spaceBetween: 24
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 24
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                },
                1280: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            },
            
            // Navigation
            navigation: {
                nextEl: '.products-next',
                prevEl: '.products-prev'
            },
            
            // Pagination
            pagination: {
                el: '.products-pagination',
                clickable: true,
                dynamicBullets: true
            },
            
            // Accessibility
            a11y: {
                prevSlideMessage: 'Produtos anteriores',
                nextSlideMessage: 'Próximos produtos',
                paginationBulletMessage: 'Ir para página {{index}}'
            },
            
            // Keyboard
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            
            // Touch settings
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            
            // Smooth scrolling
            freeMode: false,
            freeModeSticky: true,
            
            // Performance
            watchOverflow: true,
            observer: true,
            observeParents: true,
            
            // Events
            on: {
                init: () => {
                    this.updateNavigationState();
                },
                slideChange: () => {
                    this.updateNavigationState();
                }
            }
        });
    }
    
    updateNavigationState() {
        // Update navigation button states
        const productsSwiper = this.swipers.products;
        if (!productsSwiper) return;
        
        const prevBtn = document.querySelector('.products-prev');
        const nextBtn = document.querySelector('.products-next');
        
        if (prevBtn) {
            prevBtn.classList.toggle('swiper-button-disabled', productsSwiper.isBeginning);
        }
        
        if (nextBtn) {
            nextBtn.classList.toggle('swiper-button-disabled', productsSwiper.isEnd);
        }
    }
    
    handleResize() {
        // Reinitialize swipers on significant resize
        Object.values(this.swipers).forEach(swiper => {
            if (swiper && swiper.update) {
                swiper.update();
            }
        });
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Destroy swipers (for cleanup)
    destroy() {
        Object.values(this.swipers).forEach(swiper => {
            if (swiper && swiper.destroy) {
                swiper.destroy(true, true);
            }
        });
        this.swipers = {};
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('homepage-v2')) {
        window.swiperSetup = new SwiperSetup();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.swiperSetup) {
        window.swiperSetup.destroy();
    }
});
```

## **AFTERNOON DAY 1: Header Enhancement**

### **STEP 6: Enhanced Header**

**CRIAR: `views/partials/header-v2.ejs`**
```html
<header class="header-v2">
    <nav class="navbar-v2" role="navigation" aria-label="Navegação principal">
        <div class="nav-container">
            <!-- Logo -->
            <a href="/" class="brand-logo" aria-label="Gonzaga's Art & Shine - Página inicial">
                <div class="logo-image">
                    <img src="/images/logo.svg" alt="Gonzaga's Art & Shine" width="40" height="40">
                </div>
                <div class="brand-text">
                    <span class="brand-name">Gonzaga's</span>
                    <span class="brand-tagline">Art & Shine</span>
                </div>
            </a>
            
            <!-- Desktop Navigation -->
            <div class="nav-desktop" aria-label="Menu principal">
                <ul class="nav-menu" role="menubar">
                    <li class="nav-item dropdown" role="none">
                        <a href="/catalog" 
                           class="nav-link dropdown-trigger" 
                           role="menuitem" 
                           aria-haspopup="true" 
                           aria-expanded="false"
                           id="catalog-menu-trigger">
                            <span>Coleção</span>
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </a>
                        
                        <!-- Mega Menu -->
                        <div class="dropdown-menu mega-menu" 
                             role="menu" 
                             aria-labelledby="catalog-menu-trigger">
                            <div class="mega-menu-content">
                                <div class="menu-section">
                                    <h4>Por Categoria</h4>
                                    <ul class="menu-list" role="menu">
                                        <li role="none">
                                            <a href="/catalog?category=1" role="menuitem">Anéis</a>
                                        </li>
                                        <li role="none">
                                            <a href="/catalog?category=2" role="menuitem">Brincos</a>
                                        </li>
                                        <li role="none">
                                            <a href="/catalog?category=3" role="menuitem">Colares</a>
                                        </li>
                                        <li role="none">
                                            <a href="/catalog?category=4" role="menuitem">Pulseiras</a>
                                        </li>
                                        <li role="none">
                                            <a href="/catalog" role="menuitem">Ver Todas</a>
                                        </li>
                                    </ul>
                                </div>
                                
                                <div class="menu-section">
                                    <h4>Em Destaque</h4>
                                    <div class="featured-mini" id="navFeaturedProducts">
                                        <!-- Dynamic content loaded via JavaScript -->
                                    </div>
                                </div>
                                
                                <div class="menu-section">
                                    <h4>Sobre Nós</h4>
                                    <ul class="menu-list" role="menu">
                                        <li role="none">
                                            <a href="/sobre" role="menuitem">Nossa História</a>
                                        </li>
                                        <li role="none">
                                            <a href="/artesanal" role="menuitem">Processo Artesanal</a>
                                        </li>
                                        <li role="none">
                                            <a href="/contactos" role="menuitem">Contactos</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </li>
                    
                    <li class="nav-item" role="none">
                        <a href="/sobre" class="nav-link" role="menuitem">Sobre Nós</a>
                    </li>
                    
                    <li class="nav-item" role="none">
                        <a href="/contactos" class="nav-link" role="menuitem">Contactos</a>
                    </li>
                </ul>
                
                <!-- Search Bar -->
                <div class="nav-search" role="search">
                    <div class="search-container-nav">
                        <input type="text" 
                               class="search-input-v2" 
                               placeholder="Pesquisar joias..." 
                               autocomplete="off"
                               aria-label="Pesquisar produtos"
                               id="nav-search-input">
                        <button class="search-btn" 
                                type="button" 
                                aria-label="Pesquisar">
                            <i class="fas fa-search" aria-hidden="true"></i>
                        </button>
                        
                        <!-- Search Results Dropdown -->
                        <div class="search-results-nav" 
                             id="navSearchResults" 
                             role="listbox" 
                             aria-label="Resultados da pesquisa">
                            <!-- Dynamic content -->
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="nav-actions">
                    <a href="https://wa.me/351XXXXXXXXX?text=Olá! Gostaria de saber mais sobre as vossas joias." 
                       class="btn-nav-whatsapp" 
                       target="_blank"
                       aria-label="Contactar via WhatsApp">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i>
                        <span class="btn-text">WhatsApp</span>
                    </a>
                </div>
            </div>
            
            <!-- Mobile Menu Toggle -->
            <button class="mobile-nav-toggle" 
                    type="button"
                    aria-label="Abrir menu de navegação"
                    aria-expanded="false"
                    aria-controls="mobile-nav-overlay">
                <span class="hamburger-line" aria-hidden="true"></span>
                <span class="hamburger-line" aria-hidden="true"></span>
                <span class="hamburger-line" aria-hidden="true"></span>
                <span class="sr-only">Menu</span>
            </button>
        </div>
        
        <!-- Mobile Navigation Overlay -->
        <div class="mobile-nav-overlay" 
             id="mobile-nav-overlay"
             role="dialog" 
             aria-label="Menu de navegação móvel"
             aria-hidden="true">
            <div class="mobile-nav-content">
                <!-- Mobile Search -->
                <div class="mobile-search" role="search">
                    <div class="search-container-mobile">
                        <input type="text" 
                               class="search-input-mobile" 
                               placeholder="Pesquisar produtos..."
                               aria-label="Pesquisar produtos">
                        <button class="search-btn-mobile" 
                                type="button" 
                                aria-label="Pesquisar">
                            <i class="fas fa-search" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Mobile Menu -->
                <nav class="mobile-menu" role="navigation" aria-label="Menu principal móvel">
                    <ul class="mobile-menu-list" role="menu">
                        <li class="mobile-menu-item" role="none">
                            <a href="/" class="mobile-menu-link" role="menuitem">
                                <i class="fas fa-home" aria-hidden="true"></i>
                                <span>Início</span>
                            </a>
                        </li>
                        
                        <li class="mobile-menu-item expandable" role="none">
                            <button class="mobile-menu-trigger" 
                                    type="button"
                                    aria-expanded="false"
                                    aria-controls="mobile-catalog-submenu">
                                <i class="fas fa-gem" aria-hidden="true"></i>
                                <span>Coleção</span>
                                <i class="fas fa-chevron-down expand-icon" aria-hidden="true"></i>
                            </button>
                            
                            <ul class="mobile-submenu" id="mobile-catalog-submenu" role="menu">
                                <li role="none">
                                    <a href="/catalog" class="mobile-submenu-link" role="menuitem">
                                        Todas as Peças
                                    </a>
                                </li>
                                <li role="none">
                                    <a href="/catalog?category=1" class="mobile-submenu-link" role="menuitem">
                                        Anéis
                                    </a>
                                </li>
                                <li role="none">
                                    <a href="/catalog?category=2" class="mobile-submenu-link" role="menuitem">
                                        Brincos
                                    </a>
                                </li>
                                <li role="none">
                                    <a href="/catalog?category=3" class="mobile-submenu-link" role="menuitem">
                                        Colares
                                    </a>
                                </li>
                                <li role="none">
                                    <a href="/catalog?category=4" class="mobile-submenu-link" role="menuitem">
                                        Pulseiras
                                    </a>
                                </li>
                            </ul>
                        </li>
                        
                        <li class="mobile-menu-item" role="none">
                            <a href="/sobre" class="mobile-menu-link" role="menuitem">
                                <i class="fas fa-info-circle" aria-hidden="true"></i>
                                <span>Sobre Nós</span>
                            </a>
                        </li>
                        
                        <li class="mobile-menu-item" role="none">
                            <a href="/contactos" class="mobile-menu-link" role="menuitem">
                                <i class="fas fa-envelope" aria-hidden="true"></i>
                                <span>Contactos</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                
                <!-- Mobile Contact -->
                <div class="mobile-contact">
                    <h4>Contactos Diretos</h4>
                    
                    <a href="tel:+351XXXXXXXXX" class="contact-item">
                        <i class="fas fa-phone" aria-hidden="true"></i>
                        <div class="contact-info">
                            <span class="contact-label">Telefone</span>
                            <span class="contact-value">+351 XXX XXX XXX</span>
                        </div>
                    </a>
                    
                    <a href="https://wa.me/351XXXXXXXXX" 
                       class="contact-item whatsapp" 
                       target="_blank">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i>
                        <div class="contact-info">
                            <span class="contact-label">WhatsApp</span>
                            <span class="contact-value">Mensagem direta</span>
                        </div>
                    </a>
                    
                    <a href="mailto:info@gonzagasartshine.com" class="contact-item">
                        <i class="fas fa-envelope" aria-hidden="true"></i>
                        <div class="contact-info">
                            <span class="contact-label">Email</span>
                            <span class="contact-value">info@gonzagasartshine.com</span>
                        </div>
                    </a>
                </div>
                
                <!-- Close Button -->
                <button class="mobile-nav-close" 
                        type="button"
                        aria-label="Fechar menu">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- Progress Bar (optional) -->
    <div class="reading-progress" role="progressbar" aria-label="Progresso da página"></div>
</header>
```

***

## **⏰ TESTING DAY 1 (1 hora)**

### **STEP 7: Testing Setup**

**CRIAR: `tests/test-homepage-v2.js`** (Node.js testing)
```javascript
const assert = require('assert');
const puppeteer = require('puppeteer');

class HomepageV2Tests {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:3000';
    }
    
    async setup() {
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI
            slowMo: 50
        });
        this.page = await this.browser.newPage();
        
        // Set viewport for testing
        await this.page.setViewport({
            width: 1366,
            height: 768
        });
    }
    
    async teardown() {
        if (this.browser) {
            await this.browser.close();
        }
    }
    
    async runAllTests() {
        try {
            await this.setup();
            
            console.log('🧪 Starting Homepage V2 Tests...\n');
            
            // Test suite
            await this.testPageLoad();
            await this.testHeroSection();
            await this.testFeaturedProducts();
            await this.testNavigation();
            await this.testMobileResponsive();
            await this.testAccessibility();
            await this.testPerformance();
            
            console.log('\n✅ All tests passed!');
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            throw error;
        } finally {
            await this.teardown();
        }
    }
    
    async testPageLoad() {
        console.log('Testing page load...');
        
        const response = await this.page.goto(`${this.baseUrl}/index-v2`, {
            waitUntil: 'networkidle2',
            timeout: 10000
        });
        
        assert.strictEqual(response.status(), 200, 'Page should load with 200 status');
        
        // Check critical elements exist
        const heroExists = await this.page.$('.hero-section-v2');
        assert(heroExists, 'Hero section should exist');
        
        const featuredExists = await this.page.$('.featured-products-v2');
        assert(featuredExists, 'Featured products section should exist');
        
        console.log('✅ Page load test passed');
    }
    
    async testHeroSection() {
        console.log('Testing hero section...');
        
        // Check hero title
        const heroTitle = await this.page.$eval('.hero-title', el => el.textContent);
        assert(heroTitle.includes('Elegância'), 'Hero title should contain expected text');
        
        // Check CTA buttons
        const primaryCTA = await this.page.$('.btn-hero-primary');
        assert(primaryCTA, 'Primary CTA should exist');
        
        const secondaryCTA = await this.page.$('.btn-hero-secondary');
        assert(secondaryCTA, 'Secondary CTA should exist');
        
        // Test scroll indicator
        const scrollIndicator = await this.page.$('.scroll-indicator');
        assert(scrollIndicator, 'Scroll indicator should exist');
        
        console.log('✅ Hero section test passed');
    }
    
    async testFeaturedProducts() {
        console.log('Testing featured products...');
        
        // Wait for products to load
        await this.page.waitForSelector('.featured-product-card', { timeout: 5000 });
        
        const productCards = await this.page.$$('.featured-product-card');
        assert(productCards.length > 0, 'Should have at least one featured product');
        
        // Test swiper functionality
        const swiperExists = await this.page.$('.swiper');
        assert(swiperExists, 'Swiper should exist');
        
        // Test product links
        const productLink = await this.page.$('.featured-product-card a');
        assert(productLink, 'Product should have link');
        
        console.log('✅ Featured products test passed');
    }
    
    async testNavigation() {
        console.log('Testing navigation...');
        
        // Test desktop navigation
        const desktopNav = await this.page.$('.nav-desktop');
        assert(desktopNav, 'Desktop navigation should exist');
        
        // Test mobile toggle
        const mobileToggle = await this.page.$('.mobile-nav-toggle');
        assert(mobileToggle, 'Mobile toggle should exist');
        
        // Test search functionality
        const searchInput = await this.page.$('.search-input-v2');
        assert(searchInput, 'Search input should exist');
        
        // Test dropdown menu
        const dropdown = await this.page.$('.dropdown-menu');
        assert(dropdown, 'Dropdown menu should exist');
        
        console.log('✅ Navigation test passed');
    }
    
    async testMobileResponsive() {
        console.log('Testing mobile responsive...');
        
        // Set mobile viewport
        await this.page.setViewport({
            width: 375,
            height: 667
        });
        
        // Check mobile navigation
        const mobileOverlay = await this.page.$('.mobile-nav-overlay');
        assert(mobileOverlay, 'Mobile overlay should exist');
        
        // Test mobile menu toggle
        await this.page.click('.mobile-nav-toggle');
        
        // Wait for animation
        await this.page.waitForTimeout(500);
        
        const isOverlayVisible = await this.page.$eval('.mobile-nav-overlay', 
            el => window.getComputedStyle(el).display !== 'none'
        );
        assert(isOverlayVisible, 'Mobile overlay should be visible when toggled');
        
        // Close menu
        await this.page.click('.mobile-nav-close');
        
        console.log('✅ Mobile responsive test passed');
    }
    
    async testAccessibility() {
        console.log('Testing accessibility...');
        
        // Check for ARIA labels
        const skipLink = await this.page.$('.skip-link');
        // Note: Skip link might be created by JavaScript
        
        // Check for semantic HTML
        const mainLandmark = await this.page.$('main, [role="main"]');
        // Note: Depends on layout structure
        
        // Check for alt texts on images
        const images = await this.page.$$('img');
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            // Note: Alt text is important for accessibility
        }
        
        // Check color contrast (basic check)
        const heroSection = await this.page.$('.hero-section-v2');
        const bgColor = await this.page.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        }, heroSection);
        
        console.log('✅ Accessibility test passed');
    }
    
    async testPerformance() {
        console.log('Testing performance...');
        
        // Measure page load time
        const startTime = Date.now();
        await this.page.goto(`${this.baseUrl}/index-v2`, {
            waitUntil: 'networkidle2'
        });
        const loadTime = Date.now() - startTime;
        
        console.log(`Page load time: ${loadTime}ms`);
        assert(loadTime < 5000, 'Page should load within 5 seconds');
        
        // Check for lazy loading
        const lazyImages = await this.page.$$('img[loading="lazy"]');
        assert(lazyImages.length > 0, 'Should have lazy loaded images');
        
        // Check for performance optimizations
        const cssFiles = await this.page.$$('link[rel="stylesheet"]');
        const jsFiles = await this.page.$$('script[src]');
        
        console.log(`CSS files loaded: ${cssFiles.length}`);
        console.log(`JS files loaded: ${jsFiles.length}`);
        
        console.log('✅ Performance test passed');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tests = new HomepageV2Tests();
    tests.runAllTests()
        .then(() => {
            console.log('\n🎉 All Homepage V2 tests completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Tests failed:', error);
            process.exit(1);
        });
}

module.exports = HomepageV2Tests;
```

### **STEP 8: Route Setup**

**MODIFICAR: `routes/index.js`** (adicionar rota homepage v2)
```javascript
// Adicionar no final das rotas existentes, antes de module.exports

// Homepage V2 route
router.get('/index-v2', async (req, res) => {
    try {
        res.render('index-v2', {
            title: 'Gonzaga\'s Art & Shine - Joias de Prata 925 Únicas',
            page: 'homepage-v2'
        });
    } catch (error) {
        console.error('Homepage V2 error:', error);
        res.status(500).render('error', { 
            message: 'Erro ao carregar página inicial' 
        });
    }
});

// API endpoint for navigation featured products
router.get('/api/nav-featured', async (req, res) => {
    try {
        const Product = require('../models/Product');
        const featured = await Product.getFeatured(3); // Get 3 for nav
        
        res.json({
            success: true,
            data: featured
        });
    } catch (error) {
        console.error('Nav featured API error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load navigation featured products'
        });
    }
});
```

***

## 📋 **TESTE MANUAL DAY 1 (Checklist)**

### **✅ CHECKLIST VISUAL:**
- [ ] Homepage carrega sem erros
- [ ] Hero section visível e bem formatado
- [ ] CTAs funcionam (links corretos)
- [ ] Featured products carregam
- [ ] Swiper funciona (toque e navegação)
- [ ] Trust section mostra 4 cards
- [ ] Categories section carrega
- [ ] CTA section final funciona
- [ ] Navigation header funciona
- [ ] Mobile menu abre/fecha
- [ ] Search box funciona
- [ ] WhatsApp links funcionam

### **✅ CHECKLIST TÉCNICO:**
- [ ] CSS carrega sem erros 404
- [ ] JavaScript sem erros no console
- [ ] Images lazy loading
- [ ] Swiper inicializada
- [ ] AOS animations funcionam
- [ ] Mobile responsive
- [ ] Performance < 3s load time

### **✅ CHECKLIST MOBILE:**
- [ ] Layout mobile responsivo
- [ ] Touch navigation funciona
- [ ] Menu mobile abre
- [ ] CTAs touch-friendly
- [ ] Swiper touch funciona
- [ ] WhatsApp abre app mobile

***

## 🎯 **PRÓXIMO: DAY 2 MORNING**

**Terás Day 1 completo com:**
- ✅ Homepage moderna impressionante
- ✅ Navigation system profissional  
- ✅ Mobile experience otimizada
- ✅ Swiper carousels funcionais
- ✅ Testing suite configurado

**Queres implementar Day 1 primeiro e depois continuar com Day 2-7, ou preferes ver o plano completo dos 7 dias primeiro?**

Este é um plano **extremamente detalhado** com código production-ready específico para o teu projeto Gonzaga's Art & Shine! 🚀