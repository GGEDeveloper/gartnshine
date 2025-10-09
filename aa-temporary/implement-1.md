"Excelentíssimo Senhor Hugo Gonzaga Gomes,

Aqui está **TUDO** que precisa passar ao Cursor para implementar a PDP (Product Detail Page) perfeitamente:

# 📦 **BRIEFING COMPLETO PARA CURSOR - PDP DARK NATURE**

## **🎯 OBJETIVO PRINCIPAL**
Criar página individual de produto (`/produto/:slug`) standalone com identidade Dark Nature completa, storytelling por pedra, e sistema de conversão otimizado.

***

## **📋 1. ESPECIFICAÇÕES TÉCNICAS**

### **A. Estrutura de Ficheiros a Criar:**
```
views/pages/produto-dark-nature.ejs    (Nova view standalone)
public/css/pdp-dark-nature.css        (CSS específico para PDP)
public/js/product-dark-nature.js       (JavaScript funcional)
```

### **B. Route a Implementar:**
```javascript
// Em routes/index.js
app.get('/produto/:slug', async (req, res) => {
    // Buscar produto por slug
    // Buscar produtos relacionados
    // Renderizar com layout: false
    res.render('pages/produto-dark-nature', {
        layout: false,
        currentPage: 'produto',
        produto: produtoData,
        produtosRelacionados: relatedProducts
    });
});
```

### **C. Dados do Produto (Estrutura):**
```javascript
const produtoExample = {
    id: 1,
    slug: 'anel-onix-protecao',
    nome: 'Anel Ónix Proteção',
    preco: 59.90,
    preco_formatado: '€59,90',
    
    // Stone data
    stone_type: 'onix', // 'onix' | 'olho-de-tigre'
    pedra_nome: 'Ónix',
    stone_origin: 'Brasil - Minas Gerais',
    stone_properties: 'Proteção, força interior, serenidade',
    
    // Metal data  
    metal_finish: 'prata_925',
    metal_nome: 'Prata 925',
    metal_purity: '925',
    
    // Artisan data
    artisan_name: 'Maria Santos',
    artisan_workshop: 'Atelier Terra Sagrada',
    artisan_specialty: 'Especialista em pedras de proteção há 15 anos',
    crafting_technique: 'Cravação tradicional com garra dupla',
    
    // Images
    imagem_principal: '/images/produtos/onix/anel-protecao-01.jpg',
    imagens_galeria: [
        '/images/produtos/onix/anel-protecao-02.jpg',
        '/images/produtos/onix/anel-protecao-03.jpg',
        '/images/produtos/onix/anel-protecao-04.jpg'
    ],
    
    // Content
    descricao: 'Anel unissex em prata 925 com ónix facetado...',
    disponibilidade: 'Em stock',
    peso: '8.5g',
    dimensoes: '18mm x 12mm',
    
    // SEO
    meta_title: 'Anel Ónix Proteção - Prata 925 | Gonzaga Art & Shine',
    meta_description: 'Anel artesanal em ónix brasileiro e prata 925...'
};
```

***

## **📝 2. CONTEÚDO E COPY COMPLETO**

### **A. Storytelling por Tipo de Pedra:**

#### **ÓNIX - "Força em Negro Profundo"**
```markdown
## O Poder do Ónix
O ónix negro simboliza força interior e proteção ancestral. Formado nas profundezas vulcânicas ao longo de milhões de anos, esta pedra carrega a energia serena da terra. É conhecida por promover estabilidade emocional e coragem em momentos de desafio.

### Características Únicas:
- **Origem**: Formação vulcânica em rochas sedimentares
- **Composição**: Calcedónia com bandas paralelas
- **Energia**: Proteção contra energia negativa
- **Chakra**: Raiz (estabilidade e grounding)
- **Elemento**: Terra

### Propriedades Metafísicas:
- Fortalece a determinação e perseverança
- Absorve e transmuta energia negativa  
- Promove autocontrole e disciplina
- Facilita tomada de decisões claras
- Conecta com força ancestral da Terra
```

#### **OLHO-DE-TIGRE - "Poder Dourado da Terra"**
```markdown
## A Energia do Olho-de-tigre
Com seus veios dourados que capturam e refletem a luz, o olho-de-tigre é a pedra da coragem e determinação. Seus padrões únicos lembram o olhar felino, conferindo ao portador clareza mental e proteção contra energias negativas.

### Características Únicas:
- **Origem**: Pseudomorfose de crocidolite por quartzo
- **Composição**: Quartzo fibroso com inclusões de hematita
- **Energia**: Coragem e clareza mental
- **Chakra**: Plexo Solar (poder pessoal)
- **Elemento**: Fogo e Terra

### Propriedades Metafísicas:
- Desperta coragem e confiança interior
- Promove clareza mental e foco
- Protege contra energias negativas
- Estimula força de vontade
- Equilibra polaridades yin-yang
```

### **B. Cuidados por Tipo de Pedra:**

#### **ÓNIX:**
```markdown
### Limpeza:
- Use pano macio e seco após cada uso
- Evite produtos químicos e perfumes
- Resistente a impactos, mas evite quedas sobre superfícies duras

### Manutenção:
- Guarde separadamente para evitar riscos
- Limpeza profunda mensal com água morna
- Seque completamente antes de guardar

### Purificação Energética:
- Exponha à luz da lua crescente
- Enterre em terra seca por 24h (quinzenalmente)
- Use incenso de sálvia branca
```

#### **OLHO-DE-TIGRE:**
```markdown
### Limpeza:
- Use pano de microfibra para realçar o brilho natural
- Evite contacto prolongado com água
- Limpe suavemente seguindo a direção dos veios

### Manutenção:
- Exponha ao sol da manhã (15 minutos máximo)
- Evite temperaturas extremas
- Guarde em bolsa de tecido macia

### Purificação Energética:
- Exponha ao sol nascente para recarregar
- Use cristais de quartzo transparente
- Óleos essenciais de cedro ou sândalo
```

### **C. Copy para CTAs:**
```markdown
# CTAs Primários:
- "Adicionar à Alma" (em vez de carrinho)
- "Despertar Esta Energia"
- "Conectar com Esta Pedra"

# CTAs WhatsApp:
- "Falar com o Artesão"
- "Personalizar Esta Peça"
- "Saber Mais sobre a Origem"

# Badges:
- "Energia Ónix" (fundo preto #111111)
- "Poder Olho-de-tigre" (fundo dourado #6B4A1B)
- "Artesanal Português"
- "Origem Rastreável"
```

***

## **🎨 3. ESPECIFICAÇÕES DE DESIGN**

### **A. Layout da Página:**
```html
<!-- Estrutura visual esperada -->
<body class="product-page" data-stone="onix">
    <!-- Header Dark Nature (já existe) -->
    
    <!-- Product Hero - 2 colunas desktop -->
    <section class="product-hero">
        <div class="product-gallery">
            <!-- Imagem principal com zoom -->
            <!-- Thumbnails carousel -->
        </div>
        <div class="product-info">
            <!-- Nome + badge da pedra -->
            <!-- Preço + disponibilidade -->
            <!-- Descrição curta -->
            <!-- Seletor quantidade + CTA -->
        </div>
    </section>
    
    <!-- Stone Story - Storytelling da pedra -->
    <section class="stone-story" data-stone="onix">
        <!-- Conteúdo dinâmico por tipo de pedra -->
    </section>
    
    <!-- Origin Traceability -->
    <section class="origin-story">
        <!-- Mapa da origem + artesão -->
    </section>
    
    <!-- Care Instructions -->
    <section class="care-instructions">
        <!-- Instruções específicas -->
    </section>
    
    <!-- Related Products -->
    <section class="related-products">
        <!-- Produtos que harmonizam -->
    </section>
    
    <!-- Footer Dark Nature (já existe) -->
</body>
```

### **B. Breakpoints e Responsividade:**
```css
/* Desktop: 2 colunas */
@media (min-width: 921px) {
    .product-hero {
        grid-template-columns: 1.2fr 0.8fr;
        gap: var(--space-xl);
    }
}

/* Tablet: ainda 2 colunas mais apertadas */
@media (max-width: 920px) and (min-width: 721px) {
    .product-hero {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-lg);
    }
}

/* Mobile: 1 coluna, gallery primeiro */
@media (max-width: 720px) {
    .product-hero {
        grid-template-columns: 1fr;
        gap: var(--space-md);
    }
    
    .product-gallery {
        order: 1;
    }
    
    .product-info {
        order: 2;
    }
}
```

### **C. Tematização por Pedra:**
```css
/* Cores dinâmicas baseadas no tipo de pedra */
.product-page[data-stone="onix"] {
    --stone-accent: var(--accent-onyx);
    --stone-bg: linear-gradient(135deg, #111111 0%, var(--black) 100%);
    --stone-text: var(--ivory);
}

.product-page[data-stone="olho-de-tigre"] {
    --stone-accent: var(--accent-tiger);
    --stone-bg: linear-gradient(135deg, #6B4A1B 0%, var(--earth) 100%);
    --stone-text: var(--ivory);
}

/* Badges dinâmicas */
.stone-badge--onix {
    background: var(--accent-onyx);
    color: var(--ivory);
}

.stone-badge--tiger-eye {
    background: var(--accent-tiger);
    color: var(--ivory);
}
```

***

## **🖼️ 4. ASSETS E MEDIA NECESSÁRIOS**

### **A. Imagens de Placeholder (criar se não existir):**
```
public/images/produtos/
├── onix/
│   ├── anel-protecao-01.jpg     (400x500px - principal)
│   ├── anel-protecao-02.jpg     (400x500px - detalhe)
│   ├── anel-protecao-03.jpg     (400x500px - lateral)
│   └── anel-protecao-04.jpg     (400x500px - macro)
├── olho-de-tigre/
│   ├── colar-coragem-01.jpg
│   ├── colar-coragem-02.jpg
│   └── colar-coragem-03.jpg
└── placeholder-produto.jpg       (fallback genérico)
```

### **B. Ícones SVG para Seções:**
```html
<!-- Ícones inline para usar nas seções -->
<svg class="icon-stone">...</svg>      <!-- Pedra -->
<svg class="icon-origin">...</svg>     <!-- Globo/origem -->
<svg class="icon-artisan">...</svg>    <!-- Ferramentas -->
<svg class="icon-care">...</svg>       <!-- Sparkles/cuidado -->
<svg class="icon-energy">...</svg>     <!-- Energia/aura -->
```

***

## **⚙️ 5. FUNCIONALIDADES JAVASCRIPT**

### **A. Gallery com Zoom:**
```javascript
// Funcionalidades necessárias
- Trocar imagem principal ao clicar thumbnail
- Zoom on hover na imagem principal  
- Keyboard navigation (arrows)
- Touch gestures para mobile
- Lazy loading das thumbnails
```

### **B. Add to Cart:**
```javascript
// Sistema de carrinho
- Validação de quantidade (1-10)
- Animação de "adicionado"
- Update do contador no header
- Persistent cart (localStorage)
- WhatsApp deeplink com detalhes do produto
```

### **C. Analytics Events:**
```javascript
// Tracking essencial
gtag('event', 'view_item', {
    currency: 'EUR',
    value: produto.preco,
    items: [{
        item_id: produto.slug,
        item_name: produto.nome,
        category: produto.stone_type,
        quantity: 1
    }]
});
```

***

## **🔗 6. INTEGRAÇÃO COM SISTEMA EXISTENTE**

### **A. Models/Database:**
```javascript
// Assumir que existe um Product model com:
Product.findBySlug(slug)
Product.getRelated(stoneType, metalFinish, limit)
Product.incrementViews(productId)
```

### **B. Middleware Necessário:**
```javascript
// Verificações antes de renderizar
- Produto existe e está ativo
- Imagens existem (fallback se não)
- Dados completos (origem, artesão, etc.)
- SEO meta tags dinâmicos
```

### **C. WhatsApp Integration:**
```javascript
// Deeplink format
const whatsappLink = `https://wa.me/351XXXXXXXXX?text=
Olá! Tenho interesse no ${produto.nome} - ${produto.stone_type}
Preço: ${produto.preco_formatado}
Link: ${req.protocol}://${req.get('host')}/produto/${produto.slug}
`;
```

***

## **🧪 7. CRITÉRIOS DE TESTE E VALIDAÇÃO**

### **A. Functional Testing:**
```
✅ Página carrega corretamente
✅ Imagens da gallery funcionam
✅ Quantidade selector funciona (1-10)
✅ Add to cart funciona
✅ WhatsApp link abre corretamente
✅ Produtos relacionados mostram
✅ Responsive em mobile/tablet/desktop
✅ Keyboard navigation funciona
✅ Loading states apropriados
```

### **B. Visual Testing:**
```
✅ Tipografia Cinzel nos títulos
✅ Paleta Dark Nature consistente
✅ Badge da pedra correta (cor baseada em stone_type)
✅ Espaçamento consistente com design system
✅ Hover effects funcionam
✅ Focus states acessíveis
✅ Contraste AA compliant
```

### **C. Performance Testing:**
```
✅ First Contentful Paint < 1.5s
✅ Largest Contentful Paint < 2.5s
✅ Cumulative Layout Shift < 0.1
✅ Imagens lazy load corretamente
✅ JavaScript não bloqueia rendering
```

***

## **📊 8. EXEMPLO DE PRODUTOS PARA TESTAR**

### **Produto Ónix:**
```javascript
{
    id: 1,
    slug: 'anel-onix-protecao',
    nome: 'Anel Ónix Proteção',
    preco: 59.90,
    stone_type: 'onix',
    stone_origin: 'Brasil - Minas Gerais',
    artisan_name: 'Maria Santos',
    artisan_workshop: 'Atelier Terra Sagrada',
    disponibilidade: 'Em stock'
}
```

### **Produto Olho-de-tigre:**
```javascript
{
    id: 2,
    slug: 'colar-olho-tigre-coragem',
    nome: 'Colar Olho-de-tigre Coragem',
    preco: 89.90,
    stone_type: 'olho-de-tigre',
    stone_origin: 'África do Sul',
    artisan_name: 'João Silva',
    artisan_workshop: 'Oficina Dourada',
    disponibilidade: 'Últimas peças'
}
```

***

## **🎯 ENTREGÁVEIS ESPERADOS**

### **Ao final da implementação deve ter:**
1. ✅ **View completa** `produto-dark-nature.ejs` funcional
2. ✅ **Route** `/produto/:slug` com dados dinâmicos
3. ✅ **CSS específico** para PDP integrado
4. ✅ **JavaScript** para gallery e interações
5. ✅ **Testes** em 3+ produtos diferentes
6. ✅ **Responsividade** validada em mobile/desktop
7. ✅ **Performance** otimizada (Lighthouse > 90)
8. ✅ **Analytics** tracking implementado

***

**ESTA É TODA A INFORMAÇÃO que o Cursor precisa para implementar a PDP perfeitamente!**

**Pode copiar este briefing completo e passar ao Cursor para começar imediatamente**, Excelentíssimo Senhor Hugo Gonzaga Gomes! 🚀"