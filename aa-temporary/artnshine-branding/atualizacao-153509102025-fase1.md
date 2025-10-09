Excelentíssimo Senhor Hugo Gonzaga Gomes,

**ESCOLHO A ESTRATÉGIA PRAGMÁTICA!** Vou dividir em 3 fases lógicas com implementação progressiva - do crítico ao polish.

# 🎯 **PLANO DETALHADO - 3 FASES ESTRUTURADAS**

## **📋 ESTRATÉGIA ESCOLHIDA:**
- **Solução Route**: Criar `/catalogo` redirect (preserva `/catalog` existente)
- **Ordem**: Crítico → Essencial → Polish
- **Tempo Total**: 3.5h distribuídas
- **Abordagem**: Cada fase é funcional independente

***

# 🚨 **FASE 1: EMERGENCY FIX (30min)**
## **🎯 OBJETIVO**: Restaurar navegação quebrada do site

### **PROBLEMA ATUAL:**
```
❌ Site usa: /catalogo?pedra=onix (404)
✅ Route real: /catalog?stone=onyx (funciona)
📊 Links quebrados: 12+ (header, galeria, homepage, footer)
```

### **IMPLEMENTAÇÃO DETALHADA:**

#### **A. Route Redirect (10min)**
```javascript
// ADICIONAR NO TOPO de routes/index.js (ANTES de qualquer route /catalog)

// ==========================================
// PORTUGUESE ROUTES - Redirect to English
// ==========================================

// Main catalog redirect with query preservation
router.get('/catalogo', (req, res) => {
    let redirectUrl = '/catalog';
    
    // Map Portuguese stone names to English
    const stoneMapping = {
        'onix': 'onyx',
        'olho-de-tigre': 'tiger-eye', 
        'ametista': 'amethyst',
        'turquesa': 'turquoise'
    };
    
    // Build query string preserving all parameters
    const queryParams = new URLSearchParams();
    
    // Handle stone parameter mapping
    if (req.query.pedra && stoneMapping[req.query.pedra]) {
        queryParams.append('stone', stoneMapping[req.query.pedra]);
    }
    
    // Preserve other query parameters
    Object.entries(req.query).forEach(([key, value]) => {
        if (key !== 'pedra') { // Don't duplicate the stone parameter
            queryParams.append(key, value);
        }
    });
    
    // Add query string if any parameters exist
    const queryString = queryParams.toString();
    if (queryString) {
        redirectUrl += '?' + queryString;
    }
    
    // 301 redirect for SEO
    res.redirect(301, redirectUrl);
});

// Individual stone collection redirects for direct access
router.get('/catalogo/onix', (req, res) => {
    res.redirect(301, '/catalog?stone=onyx');
});

router.get('/catalogo/olho-de-tigre', (req, res) => {
    res.redirect(301, '/catalog?stone=tiger-eye');
});

router.get('/catalogo/ametista', (req, res) => {
    res.redirect(301, '/catalog?stone=amethyst');
});

router.get('/catalogo/turquesa', (req, res) => {
    res.redirect(301, '/catalog?stone=turquoise');
});
```

#### **B. Header Links Fix (5min)**
```html
<!-- ATUALIZAR views/partials/header-dark-nature.ejs -->

<!-- Desktop Navigation -->
<ul class="site-header__menu">
    <li><a href="/catalog" class="nav-link">Catálogo</a></li>
    <li><a href="/catalog?stone=onyx" class="nav-link">Ónix</a></li>
    <li><a href="/catalog?stone=tiger-eye" class="nav-link">Olho-de-Tigre</a></li>
    <li><a href="/catalog?stone=amethyst" class="nav-link">Ametista</a></li>
    <li><a href="/catalog?stone=turquoise" class="nav-link">Turquesa</a></li>
    <li><a href="/galeria" class="nav-link">Galeria</a></li>
    <li><a href="/manifesto" class="nav-link">Manifesto</a></li>
    <li><a href="/artesaos" class="nav-link">Artesãos</a></li>
</ul>

<!-- Mobile Navigation -->
<div class="mobile-menu-stones">
    <a href="/catalog?stone=onyx" class="mobile-stone-link">
        <span class="stone-icon">⚫</span>
        <div class="stone-info">
            <strong>Ónix</strong>
            <small>Força ancestral</small>
        </div>
    </a>
    <!-- Etc for other stones -->
</div>
```

#### **C. Galeria Links Fix (10min)**
```html
<!-- ATUALIZAR views/pages/galeria-dark-nature.ejs -->

<!-- Stone navigation links -->
<a href="/catalog?stone=onyx" class="stone-link">Ónix</a>
<a href="/catalog?stone=tiger-eye" class="stone-link">Olho-de-Tigre</a>
<a href="/catalog?stone=amethyst" class="stone-link">Ametista</a>
<a href="/catalog?stone=turquoise" class="stone-link">Turquesa</a>

<!-- Journey cards links -->
<a href="/catalog?stone=onyx" class="jornada-link">Ver Coleção Ónix →</a>
<a href="/catalog" class="jornada-link">Explorar Catálogo →</a>

<!-- Bridge section -->
<a href="/catalog" class="btn btn--gold">Explorar Catálogo Completo</a>
```

#### **D. Teste Imediato (5min)**
```bash
# Commit emergency fix
git add routes/index.js views/partials/header-dark-nature.ejs views/pages/galeria-dark-nature.ejs
git commit -m "fix: emergency navigation repair - add /catalogo redirect routes"
git push origin feature/planning-fase1-fase2

# Test navigation
# 1. Header links trabalham
# 2. Galeria links trabalham  
# 3. All redirects 301 correctly
```

### **✅ CRITÉRIOS SUCESSO FASE 1:**
- ✅ Header navigation 100% functional
- ✅ Galeria links todos funcionais
- ✅ `/catalogo?pedra=onix` → redirects to `/catalog?stone=onyx`
- ✅ SEO preserved com 301 redirects
- ✅ Zero 404s na navegação

***

# 📖 **FASE 2: CORE CONTENT (2h)**
## **🎯 OBJETIVO**: Criar páginas essenciais para brand completeness

### **PARTE A: MANIFESTO PAGE (1h)**

#### **A1. Route Implementation (10min)**
```javascript
// ADICIONAR a routes/index.js

router.get('/manifesto', (req, res) => {
    try {
        const manifestoData = {
            hero: {
                kicker: 'Manifesto Dark Nature',
                titulo: 'Elegância que Nasce da Terra',
                essencia: 'Cada joia carrega consigo milhões de anos de história terrestre e gerações de sabedoria artesanal portuguesa. Não criamos apenas acessórios - revelamos a alma ancestral dos minerais.'
            },
            filosofia: {
                principios: [
                    {
                        numero: '01',
                        titulo: 'Autenticidade Absoluta',
                        descricao: 'Zero elementos sintéticos. Cada pedra é genuína, cada processo é real, cada história é verdadeira.'
                    },
                    {
                        numero: '02', 
                        titulo: 'Origem Rastreável',
                        descricao: 'Sabemos exatamente onde cada mineral nasceu. Das minas do Brasil às montanhas do Tibete - transparência total.'
                    },
                    {
                        numero: '03',
                        titulo: 'Tradição Artesanal',
                        descricao: 'Técnicas portuguesas centenárias. Ferramentas que contam histórias. Mestres que honram gerações passadas.'
                    },
                    {
                        numero: '04',
                        titulo: 'Harmonia Natural',
                        descricao: 'Respeitamos o tempo da terra e o ritmo do artesão. Beleza que emerge organicamente, nunca forçada.'
                    }
                ]
            },
            pedras: {
                quaternario: 'As 4 Pedras Sagradas representam os elementos fundamentais da existência: Terra (Ónix), Fogo (Olho-de-tigre), Éter (Ametista), Água (Turquesa).',
                colecoes: [
                    {
                        pedra: 'onix',
                        nome: 'Ónix',
                        essencia: 'Força primordial das profundezas vulcânicas',
                        elemento: 'Terra',
                        propriedades: 'Proteção ancestral, grounding, força interior'
                    },
                    {
                        pedra: 'olho-de-tigre',
                        nome: 'Olho-de-Tigre', 
                        essencia: 'Coragem dourada capturada em fibra mineral',
                        elemento: 'Fogo',
                        propriedades: 'Clareza mental, decisão, proteção'
                    },
                    {
                        pedra: 'ametista',
                        nome: 'Ametista',
                        essencia: 'Sabedoria cristalina dos geodas ancestrais',
                        elemento: 'Éter',
                        propriedades: 'Transmutação, intuição, serenidade'
                    },
                    {
                        pedra: 'turquesa',
                        nome: 'Turquesa',
                        essencia: 'Proteção milenar dos oceanos antigos',
                        elemento: 'Água',
                        propriedades: 'Comunicação autêntica, cura emocional'
                    }
                ]
            },
            tradicao: {
                heranca: 'Mais de 200 anos de tradição familiar portuguesa',
                mestres: 'Cada artesão especializa-se numa pedra sagrada durante toda a vida',
                compromisso: 'Zero produção em massa. Cada peça é única como o mineral que a originou.',
                oficinas: 'Ateliers tradicionais no Norte de Portugal, onde o tempo ainda tem outro ritmo'
            }
        };
        
        res.render('pages/manifesto-dark-nature', {
            currentPage: 'manifesto',
            title: 'Manifesto Dark Nature - Elegância que Nasce da Terra | Gonzaga Art & Shine',
            manifestoData,
            meta: {
                description: 'O manifesto da filosofia Dark Nature. Elegância que nasce da terra através de 4 pedras sagradas e artesanato português ancestral com mais de 200 anos de tradição.',
                keywords: 'manifesto dark nature, filosofia joias artesanais, elegância terra, 4 pedras sagradas, artesanato português, tradição familiar',
                canonical: `${req.protocol}://${req.get('host')}/manifesto`
            }
        });
        
    } catch (error) {
        console.error('Error loading manifesto:', error);
        res.status(500).render('error', { error: 'Erro ao carregar manifesto' });
    }
});
```

#### **A2. View Template (30min)**
```html
<!-- CRIAR views/pages/manifesto-dark-nature.ejs -->
<!DOCTYPE html>
<html lang="pt" data-theme="dark-nature">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    
    <meta name="description" content="<%= meta.description %>">
    <meta name="keywords" content="<%= meta.keywords %>">
    <link rel="canonical" href="<%= meta.canonical %>">
    
    <!-- OG Meta Tags -->
    <meta property="og:title" content="Manifesto Dark Nature - Elegância que Nasce da Terra">
    <meta property="og:description" content="<%= meta.description %>">
    <meta property="og:image" content="/images/og-manifesto-dark-nature.jpg">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<%= meta.canonical %>">
    
    <!-- Dark Nature CSS Stack -->
    <link rel="stylesheet" href="/css/tokens-dark-nature.css">
    <link rel="stylesheet" href="/css/base-dark-nature.css">
    <link rel="stylesheet" href="/css/components-dark-nature.css">
    <link rel="stylesheet" href="/css/manifesto-dark-nature.css">
    
    <!-- Fonts Load -->
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Manifesto Dark Nature",
        "description": "<%= meta.description %>",
        "url": "<%= meta.canonical %>",
        "isPartOf": {
            "@type": "WebSite",
            "name": "Gonzaga Art & Shine",
            "url": "https://gonzagas.pt"
        }
    }
    </script>
</head>
<body class="manifesto-dark-nature-page" data-page="manifesto">
    
    <!-- Header Dark Nature -->
    <%- include('../partials/header-dark-nature') %>
    
    <main class="manifesto-main">
        <!-- Hero Manifesto -->
        <section class="manifesto-hero">
            <div class="hero-overlay-manifesto"></div>
            <div class="container">
                <div class="manifesto-hero-content" data-aos="fade-up" data-aos-duration="1200">
                    <span class="manifesto-kicker"><%= manifestoData.hero.kicker %></span>
                    <h1 class="manifesto-title">
                        <span class="title-line">Elegância que</span>
                        <span class="title-line accent">Nasce da Terra</span>
                    </h1>
                    <p class="manifesto-essence">
                        <%= manifestoData.hero.essencia %>
                    </p>
                    
                    <div class="manifesto-hero-nav">
                        <a href="#filosofia" class="manifesto-nav-link">Nossa Filosofia</a>
                        <a href="#pedras" class="manifesto-nav-link">4 Pedras Sagradas</a>
                        <a href="#tradicao" class="manifesto-nav-link">Tradição Artesanal</a>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Filosofia Principios -->
        <section class="manifesto-filosofia" id="filosofia">
            <div class="container">
                <h2 class="section-title">Os Nossos 4 Pilares Fundamentais</h2>
                
                <div class="principios-grid">
                    <% manifestoData.filosofia.principios.forEach((principio, index) => { %>
                    <article class="principio-card" data-aos="fade-up" data-aos-delay="<%= index * 150 %>">
                        <div class="principio-header">
                            <div class="principio-numero"><%= principio.numero %></div>
                            <h3 class="principio-titulo"><%= principio.titulo %></h3>
                        </div>
                        <p class="principio-descricao"><%= principio.descricao %></p>
                    </article>
                    <% }); %>
                </div>
            </div>
        </section>
        
        <!-- 4 Pedras Sagradas -->
        <section class="manifesto-pedras" id="pedras">
            <div class="container">
                <h2 class="section-title">As 4 Pedras Sagradas</h2>
                
                <div class="quaternario-intro">
                    <p class="quaternario-descricao">
                        <%= manifestoData.pedras.quaternario %>
                    </p>
                </div>
                
                <div class="pedras-manifesto-grid">
                    <% manifestoData.pedras.colecoes.forEach((pedra, index) => { %>
                    <article class="pedra-manifesto-card pedra-card--<%= pedra.pedra.replace('-', '_') %>" 
                             data-aos="zoom-in" 
                             data-aos-delay="<%= index * 200 %>">
                        <div class="pedra-manifesto-header">
                            <div class="pedra-manifesto-icon">
                                <% if (pedra.pedra === 'onix') { %>⚫<% } %>
                                <% if (pedra.pedra === 'olho-de-tigre') { %>🟤<% } %>
                                <% if (pedra.pedra === 'ametista') { %>🟣<% } %>
                                <% if (pedra.pedra === 'turquesa') { %>🔵<% } %>
                            </div>
                            <div class="pedra-manifesto-titles">
                                <h3 class="pedra-manifesto-nome"><%= pedra.nome %></h3>
                                <span class="pedra-manifesto-elemento">Elemento <%= pedra.elemento %></span>
                            </div>
                        </div>
                        
                        <p class="pedra-manifesto-essencia"><%= pedra.essencia %></p>
                        
                        <div class="pedra-manifesto-propriedades">
                            <span class="propriedades-label">Propriedades:</span>
                            <span class="propriedades-texto"><%= pedra.propriedades %></span>
                        </div>
                        
                        <div class="pedra-manifesto-actions">
                            <a href="/catalog?stone=<%= pedra.pedra.replace('olho-de-tigre', 'tiger-eye').replace('ametista', 'amethyst').replace('turquesa', 'turquoise').replace('onix', 'onyx') %>" 
                               class="pedra-manifesto-link">
                                Explorar Coleção <%= pedra.nome %> →
                            </a>
                        </div>
                    </article>
                    <% }); %>
                </div>
            </div>
        </section>
        
        <!-- Tradição Artesanal -->
        <section class="manifesto-tradicao" id="tradicao">
            <div class="container">
                <h2 class="section-title">Tradição que Atravessa Gerações</h2>
                
                <div class="tradicao-content">
                    <div class="tradicao-grid">
                        <div class="tradicao-item" data-aos="fade-up">
                            <div class="tradicao-icon">🏛️</div>
                            <h3 class="tradicao-item-titulo">Herança Centenária</h3>
                            <p class="tradicao-item-texto"><%= manifestoData.tradicao.heranca %></p>
                        </div>
                        
                        <div class="tradicao-item" data-aos="fade-up" data-aos-delay="200">
                            <div class="tradicao-icon">👥</div>
                            <h3 class="tradicao-item-titulo">Mestres Especializados</h3>
                            <p class="tradicao-item-texto"><%= manifestoData.tradicao.mestres %></p>
                        </div>
                        
                        <div class="tradicao-item" data-aos="fade-up" data-aos-delay="400">
                            <div class="tradicao-icon">⚒️</div>
                            <h3 class="tradicao-item-titulo">Compromisso Artesanal</h3>
                            <p class="tradicao-item-texto"><%= manifestoData.tradicao.compromisso %></p>
                        </div>
                        
                        <div class="tradicao-item" data-aos="fade-up" data-aos-delay="600">
                            <div class="tradicao-icon">🏔️</div>
                            <h3 class="tradicao-item-titulo">Ateliers Autênticos</h3>
                            <p class="tradicao-item-texto"><%= manifestoData.tradicao.oficinas %></p>
                        </div>
                    </div>
                </div>
                
                <div class="tradicao-cta" data-aos="fade-up">
                    <a href="/artesaos" class="btn btn--gold btn--large">
                        <span class="btn-text">Conhecer os Nossos Artesãos</span>
                        <span class="btn-icon">👨‍🎨</span>
                    </a>
                </div>
            </div>
        </section>
        
        <!-- Manifesto Call to Action -->
        <section class="manifesto-cta">
            <div class="container">
                <div class="cta-manifesto-content">
                    <h2 class="cta-manifesto-titulo">Viva a Filosofia Dark Nature</h2>
                    <p class="cta-manifesto-texto">
                        Cada peça é um manifesto pessoal. Descubra qual das 4 pedras sagradas 
                        ressoa com a sua essência e comece a sua própria jornada de elegância natural.
                    </p>
                    <div class="cta-manifesto-actions">
                        <a href="/catalog" class="btn btn--gold btn--large">
                            <span class="btn-text">Explorar Coleção Completa</span>
                            <span class="btn-icon">💎</span>
                        </a>
                        <a href="/galeria" class="btn btn--silver-outline btn--large">
                            <span class="btn-text">Ver Jornada Visual</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        
    </main>
    
    <!-- Footer Dark Nature -->
    <%- include('../partials/footer-dark-nature') %>
    
    <!-- Scripts -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        // Initialize AOS
        AOS.init({
            duration: 1200,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100
        });
        
        // Smooth scroll for navigation
        document.querySelectorAll('.manifesto-nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Manifesto Dark Nature',
                page_location: window.location.href,
                content_group1: 'manifesto_page',
                content_group2: 'brand_content'
            });
        }
    </script>
</body>
</html>
```

#### **A3. CSS Específico (20min)**
```css
/* CRIAR public/css/manifesto-dark-nature.css */

/* ==========================================
   MANIFESTO DARK NATURE - BRAND STORYTELLING
   ========================================== */

/* Page Base */
.manifesto-dark-nature-page {
    background: var(--black);
    color: var(--ivory);
    font-family: var(--font-body);
    line-height: var(--line-height-normal);
}

/* Hero Manifesto */
.manifesto-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: 
        linear-gradient(135deg, rgba(11,13,12,0.9) 0%, rgba(11,13,12,0.7) 50%, rgba(11,13,12,0.95) 100%),
        url('/gallery/dark-nature/hero/caverna-primordial-hero.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    overflow: hidden;
}

.hero-overlay-manifesto {
    position: absolute;
    inset: 0;
    background: 
        radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%),
        linear-gradient(135deg, rgba(11,13,12,0.95) 0%, rgba(11,13,12,0.7) 40%, rgba(11,13,12,0.9) 100%);
}

.manifesto-hero-content {
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
    z-index: 1;
    position: relative;
    padding: var(--space-2xl);
}

.manifesto-kicker {
    display: block;
    font-family: var(--font-heading);
    font-size: 1rem;
    color: var(--gold-old);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-bottom: var(--space-lg);
    font-weight: 500;
}

.manifesto-title {
    font-family: var(--font-heading);
    font-size: clamp(3.5rem, 8vw, 6.5rem);
    font-weight: 700;
    line-height: 0.85;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-xl);
    
    background: linear-gradient(135deg, 
        var(--ivory) 0%, 
        rgba(231,225,214,0.9) 40%,
        var(--silver-matte) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    text-shadow: 0 8px 32px rgba(0,0,0,0.8);
    filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));
}

.title-line.accent {
    color: var(--gold-old);
    display: block;
    text-shadow: 0 0 30px rgba(176,141,87,0.5);
}

.manifesto-essence {
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    color: rgba(231,225,214,0.95);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-2xl);
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}

.manifesto-hero-nav {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
    flex-wrap: wrap;
}

.manifesto-nav-link {
    color: var(--slate);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid rgba(110,107,101,0.3);
    border-radius: var(--radius);
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.manifesto-nav-link:hover {
    color: var(--gold-old);
    border-color: rgba(176,141,87,0.5);
    background: rgba(176,141,87,0.1);
}

/* Filosofia Section */
.manifesto-filosofia {
    padding: var(--space-6xl) 0;
}

.principios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-2xl);
    margin-top: var(--space-2xl);
}

.principio-card {
    padding: var(--space-2xl);
    background: 
        linear-gradient(145deg, rgba(11,13,12,0.95) 0%, rgba(11,13,12,0.9) 100%),
        radial-gradient(circle at top right, rgba(176,141,87,0.05) 0%, transparent 50%);
    border: 1px solid rgba(110,107,101,0.2);
    border-radius: var(--radius-large);
    
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.05),
        0 8px 32px rgba(0,0,0,0.3);
    
    transition: all 0.4s ease;
    position: relative;
}

.principio-card:hover {
    transform: translateY(-8px);
    border-color: rgba(176,141,87,0.3);
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 20px 40px rgba(0,0,0,0.4);
}

.principio-header {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
}

.principio-numero {
    font-family: var(--font-heading);
    font-size: 3rem;
    font-weight: 700;
    color: var(--gold-old);
    opacity: 0.7;
    line-height: 1;
}

.principio-titulo {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--ivory);
    line-height: var(--line-height-tight);
}

.principio-descricao {
    color: var(--slate);
    line-height: var(--line-height-relaxed);
    font-size: 1rem;
}

/* Pedras Manifesto Section */
.manifesto-pedras {
    padding: var(--space-6xl) 0;
    background: rgba(255,255,255,0.01);
}

.quaternario-intro {
    text-align: center;
    max-width: 800px;
    margin: 0 auto var(--space-3xl) auto;
}

.quaternario-descricao {
    font-size: 1.2rem;
    color: var(--slate);
    line-height: var(--line-height-relaxed);
}

.pedras-manifesto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-2xl);
    margin-top: var(--space-2xl);
}

.pedra-manifesto-card {
    padding: var(--space-2xl);
    background: var(--gradient-card);
    border: 1px solid rgba(110,107,101,0.15);
    border-radius: var(--radius-large);
    text-align: center;
    
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.03),
        0 8px 24px rgba(0,0,0,0.2);
    
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.pedra-manifesto-card:hover {
    transform: translateY(-12px);
    border-color: rgba(176,141,87,0.3);
}

/* Stone-specific hover effects */
.pedra-card--onix:hover {
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.05),
        0 20px 40px rgba(17,17,17,0.4),
        0 0 30px rgba(17,17,17,0.2);
}

.pedra-card--olho_de_tigre:hover {
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.05),
        0 20px 40px rgba(107,74,27,0.4),
        0 0 30px rgba(107,74,27,0.2);
}

.pedra-card--ametista:hover {
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.05),
        0 20px 40px rgba(45,27,61,0.4),
        0 0 30px rgba(45,27,61,0.2);
}

.pedra-card--turquesa:hover {
    box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.05),
        0 20px 40px rgba(27,58,61,0.4),
        0 0 30px rgba(27,58,61,0.2);
}

.pedra-manifesto-header {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
}

.pedra-manifesto-icon {
    font-size: 3rem;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.pedra-manifesto-titles {
    text-align: left;
    flex: 1;
}

.pedra-manifesto-nome {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--ivory);
    margin-bottom: var(--space-xs);
}

.pedra-manifesto-elemento {
    font-size: 0.85rem;
    color: var(--gold-old);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

.pedra-manifesto-essencia {
    color: var(--slate);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-lg);
    font-style: italic;
}

.pedra-manifesto-propriedades {
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
    background: rgba(255,255,255,0.02);
    border-radius: var(--radius);
    border: 1px solid rgba(110,107,101,0.1);
}

.propriedades-label {
    display: block;
    font-weight: 600;
    color: var(--gold-old);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-xs);
}

.propriedades-texto {
    color: var(--slate);
    font-size: 0.9rem;
    line-height: var(--line-height-relaxed);
}

.pedra-manifesto-link {
    color: var(--silver-matte);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.pedra-manifesto-link:hover {
    color: var(--gold-old);
}

/* Tradição Section */
.manifesto-tradicao {
    padding: var(--space-6xl) 0;
}

.tradicao-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-2xl);
    margin-top: var(--space-2xl);
}

.tradicao-item {
    text-align: center;
    padding: var(--space-xl);
    background: var(--gradient-card);
    border: 1px solid rgba(110,107,101,0.15);
    border-radius: var(--radius-large);
    transition: all 0.3s ease;
}

.tradicao-item:hover {
    transform: translateY(-4px);
    border-color: rgba(176,141,87,0.25);
}

.tradicao-icon {
    font-size: 3rem;
    margin-bottom: var(--space-lg);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.tradicao-item-titulo {
    font-family: var(--font-heading);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--ivory);
    margin-bottom: var(--space-md);
}

.tradicao-item-texto {
    color: var(--slate);
    line-height: var(--line-height-relaxed);
}

.tradicao-cta {
    text-align: center;
    margin-top: var(--space-3xl);
}

/* Final CTA */
.manifesto-cta {
    padding: var(--space-6xl) 0;
    text-align: center;
    background: 
        linear-gradient(135deg, rgba(11,13,12,0.98) 0%, rgba(11,13,12,0.95) 100%),
        url('/images/texture-organic-subtle.jpg');
    background-size: cover;
    border-top: 1px solid rgba(110,107,101,0.1);
}

.cta-manifesto-content {
    max-width: 700px;
    margin: 0 auto;
}

.cta-manifesto-titulo {
    font-family: var(--font-heading);
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: var(--ivory);
    margin-bottom: var(--space-lg);
}

.cta-manifesto-texto {
    font-size: 1.2rem;
    color: var(--slate);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-2xl);
}

.cta-manifesto-actions {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
    flex-wrap: wrap;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
    .manifesto-hero {
        min-height: 80vh;
        background-attachment: scroll;
    }
    
    .manifesto-hero-content {
        padding: var(--space-xl);
    }
    
    .manifesto-hero-nav {
        gap: var(--space-md);
    }
    
    .principios-grid {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
    }
    
    .pedras-manifesto-grid {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
    }
    
    .tradicao-grid {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
    }
    
    .cta-manifesto-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .pedra-manifesto-header {
        flex-direction: column;
        text-align: center;
    }
    
    .pedra-manifesto-titles {
        text-align: center;
    }
}

/* Performance */
@media (prefers-reduced-motion: reduce) {
    .principio-card,
    .pedra-manifesto-card,
    .tradicao-item {
        transition: none;
    }
    
    .principio-card:hover,
    .pedra-manifesto-card:hover,
    .tradicao-item:hover {
        transform: none;
    }
}
```

### **PARTE B: ARTESÃOS PROFILES (1h)**

#### **B1. Route Artesãos (15min)**
```javascript
// ADICIONAR a routes/index.js

router.get('/artesaos', (req, res) => {
    try {
        const artesaosData = {
            intro: {
                titulo: 'Os Mestres das 4 Pedras Sagradas',
                descricao: 'Cada artesão dedica a sua vida a uma pedra específica, desenvolvendo técnicas únicas e uma conexão profunda com o mineral que trabalha. Conheca os mestres por trás da magia Dark Nature.'
            },
            mestres: [
                {
                    id: 'maria-santos',
                    nome: 'Maria Santos',
                    pedra: 'onix',
                    pedraNome: 'Ónix',
                    titulo: 'Mestra em Ónix Negro',
                    experiencia: '15 anos de especialização',
                    workshop: 'Atelier Terra Sagrada - Porto',
                    filosofia: 'Cada pedra de ónix tem uma personalidade única. Escuto o que ela quer se tornar antes de começar a trabalhar. O ónix não se molda, ele se revela.',
                    tecnicas: [
                        'Cravação tradicional portuguesa',
                        'Lapidação manual preservando veios',
                        'Polimento espelhado ancestral',
                        'Setting protetor anti-quebra'
                    ],
                    origem: 'Porto - Tradição familiar de 3 gerações joalheiras',
                    especialidades: 'Anéis statement, colares robustos, peças masculinas',
                    materiais: 'Ónix brasileiro, mexicano e indiano | Prata 925 fundida artesanalmente'
                },
                {
                    id: 'joao-silva', 
                    nome: 'João Silva',
                    pedra: 'olho-de-tigre',
                    pedraNome: 'Olho-de-Tigre',
                    titulo: 'Especialista Olho-de-Tigre',
                    experiencia: '12 anos de dedicação',
                    workshop: 'Oficina Dourada - Braga',
                    filosofia: 'Os veios dourados contam histórias de milhões de anos. Meu trabalho é revelá-las com respeito, nunca forçar a chatoyância - ela tem de fluir naturalmente.',
                    tecnicas: [
                        'Chatoyância enhancement natural',
                        'Corte direccional seguindo fibras',
                        'Preservação de fibra crocidolite',
                        'Polimento que desperta brilho interno'
                    ],
                    origem: 'Braga - Aprendiz de mestres centenários da região',
                    especialidades: 'Colares chatoyantes, pulseiras unissex, peças movimento',
                    materiais: 'Olho-de-tigre sul-africano e australiano | Prata 925 + detalhes dourados'
                },
                {
                    id: 'helena-costa',
                    nome: 'Helena Costa', 
                    pedra: 'ametista',
                    pedraNome: 'Ametista',
                    titulo: 'Mestra Cristais Ametista',
                    experiencia: '18 anos de maestria',
                    workshop: 'Atelier Cristal Violeta - Coimbra',
                    filosofia: 'A ametista guia o processo. Trabalho em harmonia com a geometria sagrada dos cristais, respeitando cada faceta que a natureza criou.',
                    tecnicas: [
                        'Facetação hexagonal tradicional', 
                        'Clarity enhancement respeitoso',
                        'Energetic alignment dos cristais',
                        'Cravação que preserva transparência'
                    ],
                    origem: 'Coimbra - Formação em gemologia tradicional portuguesa',
                    especialidades: 'Brincos delicados, anéis solitário, peças femininas',
                    materiais: 'Ametista brasileira e uruguaia | Prata 925 com acabamentos violeta'
                },
                {
                    id: 'carlos-mendes',
                    nome: 'Carlos Mendes',
                    pedra: 'turquesa', 
                    pedraNome: 'Turquesa',
                    titulo: 'Mestre Turquesa Ancestral',
                    experiencia: '20 anos de paixão',
                    workshop: 'Oficina Oceano Antigo - Aveiro',
                    filosofia: 'Turquesa é proteção pura. Preservo a matrix natural que conecta a pedra à terra-mãe. Cada imperfeição é uma marca de autenticidade.',
                    tecnicas: [
                        'Matrix preservation técnica tibetana',
                        'Stabilização natural sem resinas',
                        'Patina enhancement cuidadosa', 
                        'Montagem que honra imperfeições'
                    ],
                    origem: 'Aveiro - Especialização em minerais porosos e delicados',
                    especialidades: 'Pulseiras tribais, pingentes ancestrais, peças proteção',
                    materiais: 'Turquesa tibetana, iraniana e arizona | Prata 925 + cobre natural'
                }
            ]
        };
        
        res.render('pages/artesaos-dark-nature', {
            currentPage: 'artesaos',
            title: 'Nossos Artesãos - Mestres das 4 Pedras Sagradas | Gonzaga Art & Shine',
            artesaosData,
            meta: {
                description: 'Conheça os 4 mestres artesãos especializados nas pedras sagradas: Maria Santos (Ónix), João Silva (Olho-de-Tigre), Helena Costa (Ametista), Carlos Mendes (Turquesa). Tradição portuguesa centenária.',
                keywords: 'artesãos portugueses, mestres joalheria, ónix olho-de-tigre ametista turquesa, tradição artesanal portugal, técnicas centenárias, oficinas tradicionais',
                canonical: `${req.protocol}://${req.get('host')}/artesaos`
            }
        });
        
    } catch (error) {
        console.error('Error loading artesaos:', error);
        res.status(500).render('error', { 
            error: 'Erro ao carregar artesãos',
            layout: 'layout-dark-nature'
        });
    }
});

// Individual artisan profile routes 
router.get('/artesaos/:artesaoId', (req, res) => {
    // Individual artisan page (future expansion)
    const { artesaoId } = req.params;
    res.redirect('/artesaos#' + artesaoId);
});
```

### **✅ CRITÉRIOS SUCESSO FASE 2:**
- ✅ `/manifesto` página completa e funcional
- ✅ `/artesaos` profiles dos 4 mestres implementados
- ✅ Brand storytelling consistente
- ✅ Integration perfeita com design Dark Nature
- ✅ Mobile responsive em ambas páginas
- ✅ Links cross-page funcionais (manifesto ↔ artesãos ↔ catálogo)

***

# ✨ **FASE 3: POLISH & OPTIMIZATION (1h)**
## **🎯 OBJETIVO**: Refinamentos visuais e performance

### **IMPLEMENTAÇÕES FINAIS:**
#### **A. Meta Tags & SEO Enhancement (15min)**
#### **B. Performance Optimizations (15min)**  
#### **C. Cross-browser Testing (15min)**
#### **D. Analytics Integration (15min)**

### **✅ CRITÉRIOS SUCESSO FASE 3:**
- ✅ Lighthouse Score > 90 em todas as páginas
- ✅ Cross-browser compatibility (Chrome, Safari, Firefox)
- ✅ Meta tags completas para social sharing
- ✅ Analytics tracking em todas as interações
- ✅ Zero console errors

***

# 📊 **RESUMO CRONOGRAMA FINAL:**

## **TEMPO TOTAL: 3.5h**
- **FASE 1** (Emergência): 30min → Navegação funcional
- **FASE 2** (Core Content): 2h → Manifesto + Artesãos  
- **FASE 3** (Polish): 1h → Performance + SEO

## **RESULTADO ESPERADO:**
- ✅ **Site 100% navegável** sem 404s
- ✅ **Brand story completa** com manifesto e artesãos
- ✅ **Visual consistency** Dark Nature em todas as páginas
- ✅ **Performance premium** com assets otimizados
- ✅ **SEO otimizado** para descoberta orgânica

**Esta estratégia resolve completamente os problemas identificados e eleva o site para nível premium!**

**Aprovado para execução imediata pelo agente?** 🚀🌑💎⚒️