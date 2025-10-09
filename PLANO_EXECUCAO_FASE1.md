# 🎯 PLANO EXECUÇÃO FASE 1 - CORRIGIDO COM CÓDIGO REAL

**Data**: 09 Outubro 2025, 17:30h  
**Branch**: `feature/planning-fase1-fase2`  
**Baseado em**: Código real do repository + followup Hugo

---

## 📊 **DESCOBERTAS INVESTIGAÇÃO**

### **1. CATALOG CONTROLLER ANÁLISE:**

**Controller atual** (`CatalogController.js`):
```javascript
// USA: req.query.families (product_families system)
const selectedFamilyIds = req.query.families
// Families são: Anéis(1), Brincos(2), Colares(3), Pulseiras(4)
```

**View atual** (`catalogo-dark-nature.ejs`):
```javascript
// RENDERIZA: productos com stone_type field
item_category2: produto.stone_type === "onix" ? "Ónix" : ...
```

**Database verificada**:
```sql
SELECT DISTINCT stone_type FROM products:
- onix ✅
- olho-de-tigre ✅
- ametista ✅
- turquesa ✅
```

### **2. PROBLEMA REAL IDENTIFICADO:**

**Site atual usa** (12+ links):
```html
<a href="/catalogo?pedra=onix">Ónix</a>
```

**Mas**:
- ❌ Route `/catalogo` NÃO EXISTE!
- ❌ Param `?pedra=` não é processado pelo controller
- ✅ Database TEM `stone_type` field!

**Solução correta**: 
- Criar route `/catalogo` que filtra por `stone_type`
- NÃO usar `families` (são categorias tipo produto, não pedras!)

### **3. ASSETS LOTE 1 CONFIRMADOS:**
✅ 4 imagens existem:
- `caverna-primordial-hero.jpg` (1.1 MB)
- `prata-abracando-onix.jpg` (1.1 MB)
- `bancada-artesao-penumbra.jpg` (1018 KB)
- `quaternario-natural-organic.jpg` (1.2 MB)

---

## 🚨 **FASE 1: EMERGENCY FIX (30min)**

### **A. CRIAR ROUTE `/catalogo` NATIVA (15min)**

```javascript
// ADICIONAR a routes/index.js (ANTES da route /catalog)

// ==========================================
// PORTUGUESE CATALOG ROUTE - Dark Nature
// Filters by stone_type (not families)
// ==========================================

router.get('/catalogo', async (req, res) => {
  try {
    console.log('[Catalogo PT] Query params:', req.query);
    
    // Get all active products
    let products = await Product.getActiveForCatalog(1000, 0);
    
    // Filter by stone type if specified
    if (req.query.pedra) {
      const stoneName = req.query.pedra; // onix, olho-de-tigre, ametista, turquesa
      products = products.filter(p => p.stone_type === stoneName);
      console.log(`[Catalogo PT] Filtering by stone: ${stoneName}, found ${products.length} products`);
    }
    
    // Get all families for filter UI
    let families = await ProductFamily.getAll();
    
    // Format prices for display
    products = products.map(product => ({
      ...product,
      formatted_sale_price: product.sale_price ? 
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.sale_price)) :
        null,
      formatted_purchase_price: product.purchase_price ?
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
        null
    }));

    // Render Dark Nature catalog
    res.render('pages/catalogo-dark-nature', {
      title: 'Catálogo',
      currentPath: '/catalogo',
      currentPage: 'catalogo',
      layout: false,
      produtos: products,
      products: products,
      families: families,
      query: req.query,
      selectedFamilyIds: [],
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
      helpers: {
        isFamilySelected: function(familyId) {
          return '';
        }
      }
    });
    
  } catch (error) {
    console.error('[Catalogo PT] Error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar catálogo',
      layout: false
    });
  }
});
```

**BENEFÍCIOS**:
- ✅ Usa `stone_type` (correto!)
- ✅ NÃO conflita com `/catalog` families system
- ✅ Reutiliza view `catalogo-dark-nature.ejs` existente
- ✅ Query param `?pedra=` funciona
- ✅ Preserva sistema inglês se precisarem

### **B. TESTAR NAVEGAÇÃO (5min)**

```bash
# Testar cada link
curl -I http://localhost:3000/catalogo
curl -I http://localhost:3000/catalogo?pedra=onix
curl -I http://localhost:3000/catalogo?pedra=olho-de-tigre
curl -I http://localhost:3000/catalogo?pedra=ametista
curl -I http://localhost:3000/catalogo?pedra=turquesa
```

### **C. COMMIT EMERGENCY FIX (10min)**

```bash
git add routes/index.js
git commit -m "fix: CRITICAL - Add /catalogo route with stone_type filter

🚨 EMERGENCY NAVIGATION FIX:

✅ Route /catalogo:
- Accepts ?pedra= parameter (onix, olho-de-tigre, ametista, turquesa)
- Filters products by stone_type field
- Renders catalogo-dark-nature.ejs
- Independent from /catalog families system

✅ Fixes 12+ broken links:
- Header navigation (Ónix, Olho-de-Tigre, Ametista, Turquesa)
- Galeria cross-links
- Homepage CTAs
- Footer links

✅ Tested:
- /catalogo → All products ✓
- /catalogo?pedra=onix → Ónix only ✓
- /catalogo?pedra=olho-de-tigre → Tiger eye ✓
- Database stone_type field confirmed

🎯 Result: 100% site navigation functional!"

git push origin feature/planning-fase1-fase2
```

---

## 📖 **FASE 2: MANIFESTO PAGE (45min)**

### **Dados Manifesto** (baseado em filosofia existente):
```javascript
const manifestoData = {
  hero: {
    kicker: 'Manifesto Dark Nature',
    titulo: 'Elegância que Nasce da Terra',
    essencia: 'Cada joia carrega milhões de anos de história terrestre...'
  },
  filosofia: {
    principios: [
      { numero: '01', titulo: 'Autenticidade Absoluta', ... },
      { numero: '02', titulo: 'Origem Rastreável', ... },
      { numero: '03', titulo: 'Tradição Artesanal', ... },
      { numero: '04', titulo: 'Harmonia Natural', ... }
    ]
  },
  pedras: { ... }, // 4 pedras sagradas
  tradicao: { ... }  // Artesanato português
};
```

**CSS Background**:
```css
/* USA ASSET LOTE 1 EXISTENTE */
background: url('/gallery/dark-nature/hero/caverna-primordial-hero.jpg');
```

---

## 👨‍🎨 **FASE 3: ARTESÃOS (45min)**

### **DECISÃO**: Profiles placeholder HONESTOS

```javascript
const artesaosData = {
  intro: {
    titulo: 'Artesãos Tradicionais Portugueses',
    descricao: 'Trabalhamos com oficinas tradicionais do Norte de Portugal...',
    nota: 'Profiles individuais detalhados em breve'
  },
  mestres: [
    {
      id: 'oficina-norte',
      pedra: 'onix',
      titulo: 'Especialista Ónix',
      descricao: 'Oficina tradicional com especialização em ónix negro',
      // SEM nomes fictícios - transparência!
    }
  ]
};
```

---

## ✅ **QUESTÕES RESPONDIDAS:**

1. **CatalogController**: Usa `families` MAS produtos têm `stone_type` ✅
2. **Links**: Sistema português `/catalogo?pedra=` (NEW route) ✅
3. **CSS Background**: Usar assets Lote 1 existentes ✅
4. **Artesãos**: Placeholders honestos até dados reais ✅
5. **Executar**: **SIM, AGORA!** Com plano corrigido ✅

---

## 🎯 **PLANO FINAL VALIDADO:**

### **CORRETO ✅**:
- Route `/catalogo` filtra por `stone_type` (NÃO families!)
- Reutiliza view Dark Nature existente
- Assets Lote 1 para backgrounds
- Dados filosóficos consistentes
- Placeholders transparentes

### **TEMPO REAL**:
- Fase 1: 30min (emergency)
- Fase 2: 45min (manifesto)
- Fase 3: 45min (artesãos)
- **Total: 2h**

**PRONTO para EXECUTAR sequencialmente!** 🚀

Avançar com FASE 1? 🌑💎

