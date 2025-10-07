# 🔍 FASE 2 DETALHADA - Search + WhatsApp Integration
**Gonzaga's Art & Shine - Sprint 2 (1 semana)**

**Prioridade:** ALTA ⭐⭐⭐⭐  
**Duração:** 1 semana  
**Dependência:** Fase 1 (Otimização Core) completa

---

## 🎯 OBJETIVO DA FASE 2

Implementar sistema de pesquisa avançado para melhorar discovery de produtos e integração WhatsApp para facilitar contacto direto com clientes (substituindo carrinho de compras complexo).

---

## 📋 TAREFAS DA FASE 2

### **TAREFA 2.1: Sistema de Pesquisa Avançado**

#### **A. API Search Endpoints**

##### **Ficheiro:** `routes/api.js` (criar ou modificar)

**Features:**
- ✅ Search endpoint principal `/api/search`
- ✅ Suggestions endpoint `/api/search/suggestions`
- ✅ Validação de input (min 2 chars, max 50 chars)
- ✅ Ordenação inteligente (exact match > partial match)
- ✅ Filtro por família (opcional)
- ✅ Enhanced results com metadata
- ✅ Performance otimizada para shared hosting

**Código:**
```javascript
// Search endpoint com validação e performance
router.get('/search', async (req, res) => {
    const { q, limit = 10, family_id } = req.query;
    
    // Validação
    if (!q || q.length < 2) return res.json([]);
    if (q.length > 50) return res.status(400).json({ error: 'Search term too long' });
    
    // Query otimizada com índices
    // Ordenação inteligente (exact first)
    // Enhanced results com URLs e preços formatados
});

// Suggestions endpoint para autocomplete
router.get('/search/suggestions', async (req, res) => {
    // Máximo 5 sugestões
    // DISTINCT para evitar duplicados
    // Rápido (< 100ms)
});
```

**Micro-tasks:**
- [ ] Criar/abrir routes/api.js
- [ ] Implementar GET /search endpoint
- [ ] Implementar GET /search/suggestions endpoint
- [ ] Validação de inputs
- [ ] Query otimizada com índices
- [ ] Ordenação inteligente
- [ ] Enhanced results (URLs, preços formatados)
- [ ] Error handling robusto
- [ ] Testar API: curl http://localhost:3000/api/search?q=anel
- [ ] Testar suggestions: curl http://localhost:3000/api/search/suggestions?q=an

---

#### **B. Frontend Search Component**

##### **Ficheiro:** `public/js/advanced-search.js`

**Features:**
- ✅ AdvancedSearch class completa
- ✅ Debounce para performance (300ms)
- ✅ Cache de resultados (máx 50 queries)
- ✅ Autocomplete com suggestions
- ✅ Search history (localStorage, últimas 5)
- ✅ Keyboard navigation (↑↓ Enter Esc)
- ✅ Loading states
- ✅ Error handling
- ✅ Highlight de matches
- ✅ Mobile responsive

**Componentes:**
```javascript
class AdvancedSearch {
    // Config
    - minLength: 2
    - debounceTime: 300ms
    - maxResults: 8
    - Cache system
    - AbortController para cancelar requests
    
    // Methods
    - handleSearch() - Main search logic
    - getSuggestions() - Autocomplete
    - displayResults() - Render results
    - showRecent() - Search history
    - highlightMatch() - Visual feedback
    - keyboard navigation
}
```

**Micro-tasks:**
- [ ] Criar public/js/advanced-search.js
- [ ] Implementar AdvancedSearch class
- [ ] Init e bind events
- [ ] Search API integration
- [ ] Suggestions API integration
- [ ] Results rendering (HTML template)
- [ ] Loading states (spinner)
- [ ] Error states (user-friendly messages)
- [ ] Cache system (Map, limit 50)
- [ ] Search history (localStorage)
- [ ] Keyboard navigation (↑↓ Enter Esc)
- [ ] Highlight matches (mark tag)
- [ ] Mobile touch optimization
- [ ] Accessibility (ARIA labels)
- [ ] Testar em desktop
- [ ] Testar em mobile

---

#### **C. Search CSS Styling**

##### **Ficheiro:** `public/css/search.css`

**Features:**
- ✅ Search container & input
- ✅ Results dropdown (absolute positioning)
- ✅ Result items com thumbnail
- ✅ Loading spinner
- ✅ Error states
- ✅ Recent searches UI
- ✅ Suggestions UI
- ✅ Keyboard navigation highlight
- ✅ Mobile responsive
- ✅ Animations smooth
- ✅ Accessibility (high contrast, reduced motion)

**Components Styled:**
```css
.search-container
.search-input (rounded, golden focus)
.search-button
.search-results-container (dropdown, shadow)
.search-result-item (flex, hover effects)
.search-result-image (60x60px thumbnail)
.search-result-content
.search-loading (spinner)
.search-error
.search-recent (history)
.search-suggestions
```

**Micro-tasks:**
- [ ] Criar public/css/search.css
- [ ] Style search container e input
- [ ] Style results dropdown (white card)
- [ ] Style result items (flex layout)
- [ ] Thumbnail images (60x60px)
- [ ] Loading spinner animation
- [ ] Error message styling
- [ ] Recent searches styling
- [ ] Suggestions styling
- [ ] Hover effects
- [ ] Active/keyboard navigation highlight
- [ ] Mobile breakpoints (<768px)
- [ ] Animations (slideDown)
- [ ] Accessibility (prefers-reduced-motion)
- [ ] High contrast mode support

---

#### **D. Integration com Layout**

##### **Modificar:** `views/layouts/main.ejs` ou `views/partials/header.ejs`

**Adicionar:**
```html
<!-- No header principal -->
<div id="search-container" class="search-container">
    <form>
        <input type="search" 
               placeholder="Pesquisar produtos..." 
               aria-label="Pesquisar produtos"
               autocomplete="off">
        <button type="submit" class="search-button" aria-label="Pesquisar">
            <i class="fas fa-search"></i>
        </button>
    </form>
    <!-- Results e suggestions serão injetados pelo JS -->
</div>

<!-- Antes do </body> -->
<script src="/js/advanced-search.js"></script>
<link rel="stylesheet" href="/css/search.css">
```

**Micro-tasks:**
- [ ] Abrir views/layouts/main.ejs (ou header partial)
- [ ] Adicionar search container no header
- [ ] Include advanced-search.js script
- [ ] Include search.css stylesheet
- [ ] Verificar ordem de loading
- [ ] Testar que não quebra layout existente

---

### **TAREFA 2.2: WhatsApp Integration**

#### **A. Product Detail Controller**

##### **Modificar:** `controllers/CatalogController.js`

**Adicionar Método:**
```javascript
exports.showProductDetail = async (req, res) => {
    // Fetch product com todas as imagens
    // Criar mensagem WhatsApp formatada
    // SEO metadata (Schema.org)
    // Render product-detail.ejs
}
```

**WhatsApp Message Template:**
```
Olá! Gostaria de informações sobre:

*[Nome do Produto]*
Referência: [REF]
Preço: €[PREÇO] (ou "Preço sob consulta")

Link: [URL do produto]
```

**Micro-tasks:**
- [ ] Abrir controllers/CatalogController.js
- [ ] Criar método showProductDetail()
- [ ] Query para buscar produto + imagens
- [ ] Montar objeto whatsappData:
  - [ ] number (do .env)
  - [ ] message (template formatado)
  - [ ] encodedMessage (URL encoded)
- [ ] Criar seoData (title, description, keywords, og, jsonLd)
- [ ] Render product-detail.ejs
- [ ] Error handling (404, 500)
- [ ] Testar rota

---

#### **B. Product Detail Template**

##### **Criar:** `views/catalog/product-detail.ejs`

**Sections:**
- ✅ SEO meta tags (title, description, keywords)
- ✅ Open Graph tags
- ✅ JSON-LD structured data (Schema.org)
- ✅ Breadcrumbs navigation
- ✅ Product images gallery
- ✅ Product information (nome, ref, preço)
- ✅ Stock status
- ✅ Description & details
- ✅ **WhatsApp button (primary CTA)**
- ✅ Secondary actions (copy, share)
- ✅ Contact info
- ✅ Related products section

**WhatsApp Button:**
```html
<a href="https://wa.me/[NUMBER]?text=[MESSAGE]" 
   class="btn btn-whatsapp" 
   target="_blank">
    <i class="fab fa-whatsapp"></i>
    Pedir Informações via WhatsApp
</a>
```

**Micro-tasks:**
- [ ] Criar views/catalog/product-detail.ejs
- [ ] SEO meta tags section
- [ ] Open Graph meta tags
- [ ] JSON-LD structured data
- [ ] Breadcrumbs HTML
- [ ] Images gallery section:
  - [ ] Main image (large)
  - [ ] Thumbnail carousel
  - [ ] Click to change main
- [ ] Product info section:
  - [ ] Title, reference, family
  - [ ] Price (formatted ou "sob consulta")
  - [ ] Stock status (in/out)
- [ ] Description e details list
- [ ] WhatsApp button (green, prominent)
- [ ] Secondary actions (copy, share)
- [ ] Contact info box
- [ ] Related products placeholder
- [ ] JavaScript functions:
  - [ ] changeMainImage()
  - [ ] copyProductInfo()
  - [ ] shareProduct() (Web Share API)
  - [ ] trackWhatsAppClick() (analytics)
- [ ] Testar em mobile
- [ ] Testar em desktop

---

#### **C. WhatsApp & Product Detail CSS**

##### **Criar:** `public/css/whatsapp.css`

**Components:**
- ✅ .btn-whatsapp (green gradient, WhatsApp brand colors)
- ✅ .secondary-actions (copy, share buttons)
- ✅ .contact-info (outras formas de contacto)
- ✅ .notification (toast notifications)
- ✅ .whatsapp-float (floating button opcional)
- ✅ Mobile responsive
- ✅ Animations (pulse, hover effects)

**Micro-tasks:**
- [ ] Criar public/css/whatsapp.css
- [ ] Style btn-whatsapp (gradient verde #25D366)
- [ ] Hover effects (transform, shadow)
- [ ] Icon spacing e sizing
- [ ] Secondary actions buttons (flex, gap)
- [ ] Contact info box (border-left accent)
- [ ] Notification system (toast, top-right)
- [ ] Floating button (opcional, bottom-right)
- [ ] Mobile breakpoints
- [ ] Animations (whatsappPulse)
- [ ] Accessibility (focus states)
- [ ] Testar visual consistency

##### **Criar:** `public/css/product-detail.css`

**Components:**
- ✅ Product layout (grid: images | info)
- ✅ Images gallery (main + thumbnails)
- ✅ Product info section
- ✅ Price display
- ✅ Stock badges
- ✅ Details list
- ✅ Related products grid

**Micro-tasks:**
- [ ] Criar public/css/product-detail.css
- [ ] Product grid layout (desktop: 2 cols)
- [ ] Images section (main + carousel)
- [ ] Info section (typography, spacing)
- [ ] Price styling (large, golden)
- [ ] Stock badges (green/red)
- [ ] Details list (icon + text)
- [ ] Related products grid
- [ ] Mobile responsive (stack vertical)
- [ ] Testar responsiveness

---

#### **D. Routes Configuration**

##### **Modificar:** `routes/index.js`

**Adicionar:**
```javascript
// Product detail route
router.get('/catalog/product/:id', CatalogController.showProductDetail);
```

**Micro-tasks:**
- [ ] Abrir routes/index.js
- [ ] Import CatalogController (se ainda não)
- [ ] Adicionar rota /catalog/product/:id
- [ ] Testar rota: /catalog/product/1
- [ ] Verificar que não conflita com rotas existentes

##### **Modificar:** `app.js`

**Adicionar:**
```javascript
// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);
```

**Micro-tasks:**
- [ ] Abrir app.js
- [ ] Require routes/api.js
- [ ] Use API routes com prefix /api
- [ ] Verificar ordem de rotas
- [ ] Testar que não quebra nada

---

#### **E. Environment Configuration**

##### **Modificar:** `.env`

**Adicionar:**
```bash
# WhatsApp Integration
WHATSAPP_NUMBER=351XXXXXXXXX  # Número do Gonzaga (sem +)
WHATSAPP_ENABLED=true
```

**Micro-tasks:**
- [ ] Adicionar WHATSAPP_NUMBER ao .env
- [ ] Obter número real do cliente
- [ ] Testar formato (sem + nem espaços)

---

## ✅ CHECKLIST COMPLETO - FASE 2

### **2.1 Search System:**
```
[ ] Backend API:
    [ ] Criar/modificar routes/api.js
    [ ] Endpoint GET /api/search
    [ ] Endpoint GET /api/search/suggestions
    [ ] Validação de inputs (2-50 chars)
    [ ] Query otimizada (usar índices da Fase 1)
    [ ] Ordenação inteligente
    [ ] Enhanced results (metadata)
    [ ] Error handling
    [ ] Rate limiting aplicado

[ ] Frontend Component:
    [ ] Criar public/js/advanced-search.js
    [ ] AdvancedSearch class
    [ ] Debounce search (300ms)
    [ ] Cache system (Map, 50 queries)
    [ ] Autocomplete suggestions
    [ ] Search history (localStorage, 5 últimas)
    [ ] Results rendering
    [ ] Loading states
    [ ] Error handling
    [ ] Keyboard navigation (↑↓ Enter Esc)
    [ ] Highlight matches
    
[ ] Styling:
    [ ] Criar public/css/search.css
    [ ] Container e input
    [ ] Dropdown results
    [ ] Result items (thumbnail + info)
    [ ] Loading spinner
    [ ] Error messages
    [ ] Recent searches
    [ ] Suggestions
    [ ] Mobile responsive
    [ ] Animations
    
[ ] Integration:
    [ ] Modificar layout header
    [ ] Include JS script
    [ ] Include CSS
    [ ] Verificar não quebra layout
    
[ ] Testing:
    [ ] API endpoints funcionam
    [ ] Search em tempo real OK
    [ ] Suggestions aparecem
    [ ] History funciona
    [ ] Keyboard navigation OK
    [ ] Mobile experience boa
    [ ] Performance < 500ms
```

### **2.2 WhatsApp Integration:**
```
[ ] Backend:
    [ ] Modificar CatalogController.js
    [ ] Método showProductDetail()
    [ ] Query produto + imagens
    [ ] WhatsApp message template
    [ ] URL encoding correto
    [ ] SEO metadata (Schema.org)
    [ ] Error handling
    
[ ] Product Detail View:
    [ ] Criar views/catalog/product-detail.ejs
    [ ] SEO meta tags (title, description, keywords)
    [ ] Open Graph tags
    [ ] JSON-LD structured data
    [ ] Breadcrumbs
    [ ] Images gallery (main + thumbnails)
    [ ] Product info section
    [ ] Price display
    [ ] Stock status
    [ ] Description & details
    [ ] WhatsApp button (primary)
    [ ] Secondary actions (copy, share)
    [ ] Contact info box
    [ ] Related products section
    
[ ] WhatsApp Styling:
    [ ] Criar public/css/whatsapp.css
    [ ] btn-whatsapp (green gradient)
    [ ] Hover effects
    [ ] Icon sizing
    [ ] Secondary actions
    [ ] Contact info box
    [ ] Notification toasts
    [ ] Mobile responsive
    [ ] Animations (pulse, hover)
    
[ ] Product Detail Styling:
    [ ] Criar public/css/product-detail.css
    [ ] Grid layout (images | info)
    [ ] Gallery styling
    [ ] Info section
    [ ] Price & stock badges
    [ ] Details list
    [ ] Mobile responsive
    
[ ] Routes:
    [ ] Modificar routes/index.js
    [ ] Rota /catalog/product/:id
    [ ] Modificar app.js
    [ ] Include API routes
    
[ ] Configuration:
    [ ] Adicionar WHATSAPP_NUMBER ao .env
    [ ] Obter número real do cliente
    [ ] Testar formato
    
[ ] JavaScript Functions:
    [ ] changeMainImage() - Trocar foto principal
    [ ] copyProductInfo() - Clipboard API
    [ ] shareProduct() - Web Share API
    [ ] trackWhatsAppClick() - Analytics
    [ ] showNotification() - Toast messages
    
[ ] Testing:
    [ ] Product detail page carrega
    [ ] Imagens aparecem
    [ ] Gallery funciona (click thumbnails)
    [ ] WhatsApp button abre app
    [ ] Message formatada corretamente
    [ ] Copy function funciona
    [ ] Share API funciona (mobile)
    [ ] Contact links funcionam
    [ ] Mobile experience
    [ ] SEO meta tags corretos
    [ ] Schema.org válido
```

---

## 📊 ESTIMATIVA DE TEMPO - FASE 2

### **Dia 1: Search Backend**
```
Manhã (3h):
├── Criar routes/api.js
├── Endpoint /search
├── Endpoint /suggestions
└── Testing API

Tarde (2h):
├── Query optimization
├── Error handling
└── Validation
```

### **Dia 2: Search Frontend**
```
Manhã (3h):
├── Criar advanced-search.js
├── AdvancedSearch class
├── API integration
└── Cache system

Tarde (2h):
├── Keyboard navigation
├── Search history
└── Testing
```

### **Dia 3: Search Styling & Integration**
```
Manhã (2h):
├── Criar search.css
├── Style components
└── Animations

Tarde (3h):
├── Modificar layout header
├── Integration testing
├── Mobile testing
└── Fixes
```

### **Dia 4: WhatsApp Backend & Template**
```
Manhã (3h):
├── Modificar CatalogController
├── showProductDetail method
├── Query product data
└── WhatsApp message template

Tarde (2h):
├── Criar product-detail.ejs
├── SEO meta tags
├── Schema.org
└── Product layout
```

### **Dia 5: WhatsApp Styling & Integration**
```
Manhã (3h):
├── Criar whatsapp.css
├── Criar product-detail.css
├── Style all components
└── Animations

Tarde (2h):
├── JavaScript functions
├── Routes configuration
├── .env setup
└── Testing
```

### **Dia 6-7: Testing & Polish**
```
Testing Completo:
├── Search em todas as páginas
├── WhatsApp messages corretas
├── Mobile experience
├── SEO validation
├── Performance check
├── Bug fixes
└── Documentation
```

**TOTAL:** 5-7 dias (~1 semana com buffer)

---

## 🎯 MÉTRICAS DE SUCESSO - FASE 2

### **Search System:**
- [ ] Response time < 500ms (90% dos casos)
- [ ] Autocomplete < 200ms
- [ ] Cache hit rate > 50%
- [ ] Mobile search UX smooth
- [ ] Zero console errors

### **WhatsApp Integration:**
- [ ] Message formatada corretamente
- [ ] Link abre WhatsApp app (mobile)
- [ ] Link abre WhatsApp web (desktop)
- [ ] Product info completa na mensagem
- [ ] Analytics tracking funciona

### **SEO:**
- [ ] Schema.org válido (teste: Google Rich Results)
- [ ] Open Graph tags corretos
- [ ] Meta tags em todas as páginas
- [ ] Canonical URLs definidos

---

## 📁 ESTRUTURA DE FICHEIROS A CRIAR

### **Novos Ficheiros (7):**
```
routes/
└── api.js ✨ NOVO

public/js/
└── advanced-search.js ✨ NOVO

public/css/
├── search.css ✨ NOVO
├── whatsapp.css ✨ NOVO
└── product-detail.css ✨ NOVO

views/catalog/
└── product-detail.ejs ✨ NOVO

.env
└── (adicionar WHATSAPP_NUMBER) ⚠️ MODIFICAR
```

### **Ficheiros a Modificar (4):**
```
controllers/
└── CatalogController.js (+ showProductDetail)

routes/
└── index.js (+ product detail route)

app.js
└── (+ API routes)

views/layouts/main.ejs ou views/partials/header.ejs
└── (+ search container)
```

**TOTAL:** 7 novos + 4 modificados = **11 ficheiros**

---

## 🚨 DEPENDÊNCIAS DA FASE 1

### **CRÍTICO: Fase 2 depende de:**

```
✅ Database já tem índices críticos (Fase 1.1)
✅ Rate limiting ativo (Fase 1.2)
✅ Lazy loading implementado (Fase 1.3)

Sem estas otimizações da Fase 1:
⚠️  Search pode ser lento
⚠️  API vulnerável a abusos
⚠️  Images pesadas
```

### **Verificar ANTES de começar Fase 2:**
- [ ] Connection pool otimizado (limit: 3)
- [ ] Índices críticos criados
- [ ] Rate limiting ativo em /api
- [ ] Compression middleware ativo

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### **Sequência Lógica:**
```
1. Backend API (routes/api.js)
   ↓
2. Frontend JS (advanced-search.js)
   ↓
3. CSS Styling (search.css)
   ↓
4. Layout Integration (header)
   ↓
5. Testing Search
   ↓
6. WhatsApp Controller (CatalogController)
   ↓
7. Product Detail View (EJS template)
   ↓
8. WhatsApp CSS (whatsapp.css + product-detail.css)
   ↓
9. Routes (index.js, app.js)
   ↓
10. Testing WhatsApp
    ↓
11. Integration Testing
    ↓
12. Fixes & Polish
```

---

## 🧪 TESTING CHECKLIST

### **Search System:**
```
[ ] Desktop:
    [ ] Search input aparece no header
    [ ] Digite "anel" → resultados aparecem
    [ ] Click resultado → vai para produto
    [ ] Suggestions aparecem
    [ ] Recent searches funciona
    [ ] Keyboard navigation (↑↓)
    
[ ] Mobile:
    [ ] Search responsivo
    [ ] Touch-friendly
    [ ] Results não quebram layout
    [ ] Performance OK
    
[ ] Edge Cases:
    [ ] Query vazia → sem resultados
    [ ] Query muito longa → erro
    [ ] Sem resultados → mensagem clara
    [ ] API down → error handling
```

### **WhatsApp Integration:**
```
[ ] Desktop:
    [ ] /catalog/product/1 carrega
    [ ] Imagens aparecem
    [ ] Click thumbnail → muda main
    [ ] WhatsApp button visível
    [ ] Click → abre WhatsApp Web
    [ ] Message formatada OK
    
[ ] Mobile:
    [ ] Product page responsiva
    [ ] Gallery swipe funciona
    [ ] WhatsApp button prominent
    [ ] Click → abre WhatsApp app
    [ ] Message correta
    [ ] Share API funciona
    
[ ] Functions:
    [ ] Copy info → clipboard
    [ ] Share → native share
    [ ] All contact links trabalham
```

---

## 💡 NOTAS IMPORTANTES

### **WhatsApp Number Format:**
```
❌ ERRADO: +351 XXX XXX XXX
❌ ERRADO: 351 XXX XXX XXX (com espaços)
✅ CORRETO: 351XXXXXXXXX (sem + nem espaços)

Exemplo: 351912345678
```

### **Search Performance:**
```
⚠️  DEPENDENTE de índices da Fase 1!

Se Fase 1 não completa:
• Search pode ser lento (> 1s)
• Database pode sofrer com queries complexas
• Shared hosting pode ter timeouts
```

### **Mobile-First:**
```
✅ WhatsApp funciona melhor em mobile
✅ Search touch-optimized
✅ Product detail responsive
✅ Testar em devices reais
```

---

## 🎉 RESULTADO ESPERADO - FASE 2

### **Após Conclusão:**
```
✅ Search funcional em todas as páginas
✅ Autocomplete com suggestions
✅ Search history personalizada
✅ WhatsApp integration completa
✅ Product detail pages SEO-optimized
✅ Schema.org structured data
✅ Mobile-first experience
✅ Contact via WhatsApp facilitado
✅ Zero carrinho complexity
```

### **User Experience:**
```
Cliente:
1. Pesquisa "anel prata" → resultados instantâneos
2. Click produto → página detalhe
3. Click WhatsApp → conversa aberta com info
4. Gonzaga responde → venda!

Admin:
• Não precisa gerir carrinho/checkout
• WhatsApp é canal direto
• Simples e eficaz
```

---

## 📞 PRÓXIMOS PASSOS

### **Quando Começar Fase 2:**

```bash
# 1. Verificar que Fase 1 está completa
# 2. Criar branch (opcional)
git checkout -b feature/search-whatsapp

# 3. Começar por backend
# Criar routes/api.js

# 4. Testar cada componente isoladamente
# 5. Integration tests
# 6. Deploy
```

---

**Criado:** 2025-10-07  
**Status:** 📋 PRONTO PARA IMPLEMENTAÇÃO  
**Dependência:** ⚠️ Requer Fase 1 (Otimização Core) completa  
**Tempo Estimado:** 5-7 dias  
**Complexidade:** Média  
**ROI:** ⭐⭐⭐⭐ Alto

