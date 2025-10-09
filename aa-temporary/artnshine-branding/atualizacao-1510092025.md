Excelentíssimo Senhor Hugo Gonzaga Gomes,

**EXATO!** Vou relembrar e estruturar tudo corretamente:

# 🎯 **PLANO COMPLETO RELEMBRADO**

## **VISÃO ARQUITETURA:**
- **Catálogo** (`/catalogo`) → **Sistema de produtos** existente (mantém-se igual)
- **Galeria** (`/galeria`) → **Showcase visual** novo (jornada mineral)
- **Integração simbiótica** → Links cruzados, visual consistente
- **4 pedras sagradas** → Base para ambos os sistemas

## **O QUE JÁ TEMOS FUNCIONANDO:**
✅ **Homepage** com 4 heroes sequenciais  
✅ **Catálogo** com filtros por pedra (`/catalogo?pedra=onix`)  
✅ **16 produtos** (4 por pedra) completos  
✅ **PDPs** com storytelling por pedra  
✅ **Sistema Dark Nature** visual consistency  

## **O QUE VAMOS ADICIONAR:**
🆕 **Galeria** (`/galeria`) → Showcase da jornada "Da Terra à Arte"  
🆕 **Navigation link** → Header integração  
🆕 **Cross-links** → Galeria ↔ Catálogo  
🆕 **4 assets base** → Expandir para mais no futuro  

***

# 💻 **CÓDIGO IMPLEMENTAÇÃO - GALERIA SIMBIÓTICA**

## **A. Route Integration (adicionar a routes/index.js):**
```javascript
// ADICIONAR após routes do catálogo existente

// Galeria Dark Nature - Showcase jornada mineral
router.get('/galeria', async (req, res) => {
    try {
        // Dados das 4 pedras (usar sistema existente)
        const pedrasInfo = {
            onix: {
                nome: 'Ónix',
                essencia: 'Força em Negro Profundo',
                origem: 'Brasil - Formação Vulcânica',
                chakra: 'Raiz',
                propriedades: 'Proteção ancestral, força interior, grounding'
            },
            'olho-de-tigre': {
                nome: 'Olho-de-tigre', 
                essencia: 'Poder Dourado da Terra',
                origem: 'África do Sul - Metamorfose Crocidolite',
                chakra: 'Plexo Solar', 
                propriedades: 'Coragem, clareza mental, proteção'
            },
            ametista: {
                nome: 'Ametista',
                essencia: 'Sabedoria do Crepúsculo', 
                origem: 'Brasil - Cristalização em Geodas',
                chakra: 'Terceiro Olho',
                propriedades: 'Transmutação, intuição, serenidade'
            },
            turquesa: {
                nome: 'Turquesa',
                essencia: 'Guardião dos Oceanos Antigos',
                origem: 'Tibete - Mineral Secundário', 
                chakra: 'Garganta',
                propriedades: 'Proteção viajantes, comunicação autêntica'
            }
        };
        
        // Assets da galeria (com os 4 que temos)
        const galleryAssets = {
            jornada: [
                {
                    id: 'caverna-hero',
                    src: '/gallery/dark-nature/hero/caverna-primordial-hero.jpg',
                    titulo: 'Origem Primordial',
                    descricao: 'Nas profundezas da terra nascem os minerais sagrados',
                    categoria: 'origem'
                },
                {
                    id: 'prata-onix',
                    src: '/gallery/dark-nature/transformacao/prata-abracando-onix.jpg', 
                    titulo: 'Alquimia Ancestral',
                    descricao: 'Prata 925 líquida abraça o ónix numa união sagrada',
                    categoria: 'transformacao',
                    pedra: 'onix'
                },
                {
                    id: 'bancada-artesao',
                    src: '/gallery/dark-nature/transformacao/bancada-artesao-penumbra.jpg',
                    titulo: 'Tradição Portuguesa', 
                    descricao: 'Ferramentas centenárias nas mãos de mestres artesãos',
                    categoria: 'transformacao'
                },
                {
                    id: 'quaternario-natural',
                    src: '/gallery/dark-nature/natureza/quaternario-natural-organic.jpg',
                    titulo: 'Harmonia Quaternária',
                    descricao: 'As 4 pedras sagradas em equilíbrio natural',
                    categoria: 'harmonia'
                }
            ]
        };
        
        // Stats para mostrar integração com catálogo
        const catalogStats = await Product.getCatalogStats(); // usar função existente
        
        res.render('pages/galeria-dark-nature', {
            layout: 'layout-dark-nature', // usar layout existente
            currentPage: 'galeria',
            title: 'Galeria Dark Nature - Da Terra Nasce a Arte | Gonzaga Art & Shine',
            pedrasInfo,
            galleryAssets,
            catalogStats,
            meta: {
                description: 'Explore a jornada visual das 4 pedras sagradas. Do mineral bruto ao artesanato português - autenticidade pura Dark Nature.',
                keywords: 'galeria pedras naturais, artesanato português, ónix olho-de-tigre ametista turquesa, processo artesanal',
                canonical: `${req.protocol}://${req.get('host')}/galeria`
            }
        });
        
    } catch (error) {
        console.error('Erro na galeria:', error);
        res.status(500).render('error', { 
            error: 'Erro ao carregar galeria',
            layout: 'layout-dark-nature'
        });
    }
});
```

## **B. View Template (CRIAR views/pages/galeria-dark-nature.ejs):**
```html
<!-- Usar head padrão Dark Nature -->
<%- include('../partials/head-dark-nature', {
    title: title,
    description: meta.description,
    keywords: meta.keywords,
    canonical: meta.canonical
}) %>

<body class="galeria-dark-nature-page" data-page="galeria">
    <!-- Header existente -->
    <%- include('../partials/header-dark-nature') %>
    
    <main class="galeria-main">
        <!-- Hero Galeria -->
        <section class="galeria-hero" style="background-image: url('<%= galleryAssets.jornada[0].src %>')">
            <div class="hero-overlay-dark"></div>
            <div class="container">
                <div class="galeria-hero-content" data-aos="fade-up">
                    <span class="galeria-kicker">Galeria Dark Nature</span>
                    <h1 class="galeria-title">
                        <span class="title-word">Da</span>
                        <span class="title-word accent">Terra</span>
                        <br>
                        <span class="title-word">Nasce a</span>
                        <span class="title-word primary">Arte</span>
                    </h1>
                    <p class="galeria-manifesto">
                        A jornada visual das 4 pedras sagradas desde as profundezas 
                        minerais até ao artesanato português ancestral. Sem artifícios, 
                        só autenticidade pura.
                    </p>
                    <div class="galeria-nav-stones">
                        <% Object.entries(pedrasInfo).forEach(([key, pedra]) => { %>
                        <a href="/catalogo?pedra=<%= key %>" class="stone-link stone-link--<%= key.replace('-', '_') %>">
                            <span class="stone-icon">
                                <% if (key === 'onix') { %>⚫<% } %>
                                <% if (key === 'olho-de-tigre') { %>🟤<% } %>
                                <% if (key === 'ametista') { %>🟣<% } %>
                                <% if (key === 'turquesa') { %>🔵<% } %>
                            </span>
                            <span class="stone-name"><%= pedra.nome %></span>
                        </a>
                        <% }); %>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Jornada Visual -->
        <section class="jornada-visual">
            <div class="container">
                <h2 class="section-title">A Jornada Visual</h2>
                
                <div class="jornada-grid">
                    <% galleryAssets.jornada.slice(1).forEach((asset, index) => { %>
                    <article class="jornada-card" data-categoria="<%= asset.categoria %>" data-aos="fade-up" data-aos-delay="<%= index * 200 %>">
                        <div class="jornada-card-media">
                            <img src="<%= asset.src %>" 
                                 alt="<%= asset.titulo %> - <%= asset.descricao %>"
                                 loading="lazy"
                                 class="jornada-image">
                            <div class="jornada-overlay">
                                <div class="jornada-content">
                                    <h3 class="jornada-card-title"><%= asset.titulo %></h3>
                                    <p class="jornada-card-desc"><%= asset.descricao %></p>
                                    <% if (asset.pedra) { %>
                                    <a href="/catalogo?pedra=<%= asset.pedra %>" class="jornada-link">
                                        Ver Coleção <%= pedrasInfo[asset.pedra].nome %> →
                                    </a>
                                    <% } else { %>
                                    <a href="/catalogo" class="jornada-link">
                                        Explorar Catálogo →
                                    </a>
                                    <% } %>
                                </div>
                            </div>
                        </div>
                    </article>
                    <% }); %>
                </div>
            </div>
        </section>
        
        <!-- Integração Catálogo -->
        <section class="galeria-catalog-bridge">
            <div class="container">
                <div class="bridge-content">
                    <h2>Descubra as Peças Reais</h2>
                    <p>Cada imagem desta galeria representa peças reais no nosso catálogo. 
                       Explore as <strong><%= catalogStats?.total || '16' %> peças</strong> 
                       artesanais disponíveis.</p>
                    
                    <div class="bridge-stats">
                        <% Object.entries(pedrasInfo).forEach(([key, pedra]) => { %>
                        <div class="stat-item">
                            <div class="stat-number"><%= catalogStats?.[key] || '4' %></div>
                            <div class="stat-label">Peças <%= pedra.nome %></div>
                            <a href="/catalogo?pedra=<%= key %>" class="stat-link">Ver Todas →</a>
                        </div>
                        <% }); %>
                    </div>
                    
                    <div class="bridge-actions">
                        <a href="/catalogo" class="btn btn--gold btn--large">
                            <span class="btn-text">Explorar Catálogo Completo</span>
                            <span class="btn-icon">💎</span>
                        </a>
                        <a href="/manifesto" class="btn btn--silver-outline btn--large">
                            <span class="btn-text">Conhecer Nossa Filosofia</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        
    </main>
    
    <!-- Footer existente -->
    <%- include('../partials/footer-dark-nature') %>
    
    <!-- Scripts existentes + específicos galeria -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="/js/dark-nature.js"></script> <!-- existente -->
    <script>
        // AOS init
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100
        });
        
        // Galeria tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Galeria Dark Nature',
                page_location: window.location.href,
                content_group1: 'galeria_showcase'
            });
        }
    </script>
</body>
</html>
```

## **C. CSS Específico (CRIAR public/css/galeria-dark-nature.css):**
```css
/* ==========================================
   GALERIA DARK NATURE - SIMBIÓTICA
   ========================================== */

/* Inherits from existing Dark Nature CSS */
@import url('./base-dark-nature.css');
@import url('./components-dark-nature.css');

/* Galeria Hero */
.galeria-hero {
    position: relative;
    min-height: 85vh;
    display: flex;
    align-items: center;
    background-attachment: fixed;
    background-size: cover;
    background-position: center;
    color: var(--ivory);
}

.hero-overlay-dark {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        rgba(11,13,12,0.85) 0%,
        rgba(11,13,12,0.6) 40%,
        rgba(11,13,12,0.8) 100%
    );
}

.galeria-hero-content {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
    z-index: 1;
    position: relative;
}

.galeria-kicker {
    display: block;
    font-family: var(--font-heading);
    font-size: 0.9rem;
    color: var(--gold-old);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: var(--space-lg);
}

.galeria-title {
    font-family: var(--font-heading);
    font-size: clamp(2.8rem, 8vw, 5.5rem);
    font-weight: 700;
    line-height: 0.8;
    margin-bottom: var(--space-xl);
    text-shadow: 0 4px 8px rgba(0,0,0,0.6);
}

.title-word.accent {
    color: var(--gold-old);
}

.title-word.primary {
    color: var(--silver-matte);
}

.galeria-manifesto {
    font-size: 1.1rem;
    color: rgba(231,225,214,0.95);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-2xl);
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.galeria-nav-stones {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
}

.stone-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md);
    background: rgba(11,13,12,0.7);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius);
    color: var(--ivory);
    text-decoration: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.stone-link:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--gold-old);
    transform: translateY(-2px);
}

.stone-icon {
    font-size: 1.5rem;
}

.stone-name {
    font-size: 0.85rem;
    font-weight: 600;
}

/* Jornada Visual */
.jornada-visual {
    padding: var(--space-6xl) 0;
}

.jornada-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-2xl);
    margin-top: var(--space-2xl);
}

.jornada-card {
    position: relative;
    border-radius: var(--radius-large);
    overflow: hidden;
    background: var(--gradient-card);
    border: 1px solid rgba(110,107,101,0.15);
    transition: all 0.4s ease;
}

.jornada-card:hover {
    transform: translateY(-8px);
    border-color: rgba(176,141,87,0.3);
    box-shadow: var(--shadow-elevated);
}

.jornada-card-media {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
}

.jornada-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.jornada-card:hover .jornada-image {
    transform: scale(1.05);
}

.jornada-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        180deg,
        transparent 0%,
        transparent 60%,
        rgba(0,0,0,0.8) 100%
    );
    display: flex;
    align-items: end;
    padding: var(--space-xl);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.jornada-card:hover .jornada-overlay {
    opacity: 1;
}

.jornada-content {
    color: var(--ivory);
}

.jornada-card-title {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: var(--space-xs);
}

.jornada-card-desc {
    font-size: 0.9rem;
    color: rgba(231,225,214,0.9);
    margin-bottom: var(--space-md);
    line-height: var(--line-height-relaxed);
}

.jornada-link {
    display: inline-flex;
    align-items: center;
    color: var(--gold-old);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: color 0.3s ease;
}

.jornada-link:hover {
    color: var(--silver-matte);
}

/* Bridge Catálogo */
.galeria-catalog-bridge {
    padding: var(--space-6xl) 0;
    background: rgba(255,255,255,0.01);
    border-top: 1px solid rgba(110,107,101,0.1);
    text-align: center;
}

.bridge-content {
    max-width: 800px;
    margin: 0 auto;
}

.bridge-content h2 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    color: var(--ivory);
    margin-bottom: var(--space-md);
}

.bridge-content p {
    font-size: 1.1rem;
    color: var(--slate);
    margin-bottom: var(--space-2xl);
    line-height: var(--line-height-relaxed);
}

.bridge-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-xl);
    margin-bottom: var(--space-2xl);
}

.stat-item {
    text-align: center;
    padding: var(--space-lg);
    background: var(--gradient-card);
    border: 1px solid rgba(110,107,101,0.15);
    border-radius: var(--radius-large);
}

.stat-number {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--gold-old);
    margin-bottom: var(--space-xs);
}

.stat-label {
    font-size: 0.9rem;
    color: var(--slate);
    margin-bottom: var(--space-sm);
}

.stat-link {
    color: var(--silver-matte);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    transition: color 0.3s ease;
}

.stat-link:hover {
    color: var(--gold-old);
}

.bridge-actions {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
    flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
    .galeria-hero {
        min-height: 70vh;
        background-attachment: scroll;
    }
    
    .jornada-grid {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
    }
    
    .galeria-nav-stones {
        gap: var(--space-md);
    }
    
    .bridge-actions {
        flex-direction: column;
        align-items: center;
    }
}
```

## **D. Header Integration (ATUALIZAR header-dark-nature.ejs):**
```html
<!-- ADICIONAR ao menu principal, após Catálogo -->
<li class="site-header__menu-item">
    <a href="/galeria" class="site-header__menu-link <%= currentPage === 'galeria' ? 'site-header__menu-link--active' : '' %>">
        <span class="site-header__menu-accent" data-accent="gallery"></span>
        Galeria
    </a>
</li>
```

***

# 🎯 **RESULTADO IMPLEMENTAÇÃO:**

## **URLs Funcionais:**
- `/galeria` → Showcase visual com 4 assets
- Integração `/galeria` ↔ `/catalogo` 
- Links diretos para coleções por pedra
- Navigation consistente Dark Nature

## **Experience Flow:**
1. **Homepage** → Heroes das 4 pedras
2. **Galeria** → Jornada visual "Da Terra à Arte"  
3. **Catálogo** → Produtos reais organizados
4. **PDPs** → Storytelling por peça individual

## **Assets Utilizados:**
- **Hero**: Caverna como background principal
- **Grid**: 3 cards com processo artesanal
- **Bridge**: Integração visual com catálogo
- **Expandível**: Estrutura pronta para mais assets

**Esta implementação mantém o catálogo existente intacto e adiciona a galeria como showcase visual complementar!** 🌑💎⚒️🍃