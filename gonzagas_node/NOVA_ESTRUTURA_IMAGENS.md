# 📁 NOVA ESTRUTURA DE IMAGENS - GONZAGA'S ART & SHINE

## 🎯 ESTRUTURA DEFINITIVA

```
public/
├── uploads/
│   └── products/               ← ÚNICA pasta para imagens de produtos
│       ├── PAN0001.jpg         ← Produtos existentes (referência)
│       ├── PAN0002.jpg
│       ├── ONIX-001.jpg        ← Produtos storytelling (referência)
│       ├── TIGER-001.jpg
│       └── ...
│
└── images/
    ├── placeholders/           ← Imagens fallback/sistema
    │   └── product-dark.jpg
    ├── backgrounds/            ← Backgrounds decorativos (futuro)
    ├── icons/                  ← Ícones SVG (futuro)
    └── logos/                  ← Logos da marca
```

## 📝 REGRAS DE ORGANIZAÇÃO

1. **Produtos:** SEMPRE em `/uploads/products/[REFERENCE].jpg`
   - Nome do arquivo = `reference` do produto (ex: PAN0001, ONIX-001)
   - Formato: JPEG otimizado
   - Tamanho ideal: 100-500KB

2. **Placeholders:** Em `/images/placeholders/`
   - Nomes descritivos (product-dark.jpg)
   - Reutilizáveis

3. **Assets de Sistema:** Em `/images/[categoria]/`
   - backgrounds/, icons/, logos/, etc.

## 🔄 MIGRAÇÃO A FAZER

### Mover:
```
DE: public/images/produtos/onix/anel-protecao-01.jpg
PARA: public/uploads/products/ONIX-001.jpg

DE: public/images/produtos/olho-de-tigre/colar-coragem-01.jpg  
PARA: public/uploads/products/TIGER-001.jpg

DE: public/images/placeholder-produto-dark.jpg
PARA: public/images/placeholders/product-dark.jpg
```

### Deletar:
```
public/images/produtos/ (pasta inteira, já não necessária)
```

## 💻 CÓDIGO A ATUALIZAR

### routes/index.js:
```javascript
// Imagem principal
produto.imagem_principal = allImages.length > 0 
  ? `/uploads/products/${allImages[0]}` 
  : '/images/placeholders/product-dark.jpg';

// Related products
imagem_principal: p.main_image 
  ? `/uploads/products/${p.main_image}` 
  : '/images/placeholders/product-dark.jpg'
```

### views/partials/product-card-dark.ejs:
```javascript
const produtoImagem = produto.imagem_principal || produto.image_url || '/images/placeholders/product-dark.jpg';
```

## ✅ VANTAGENS

- ✅ Única fonte de verdade para produtos
- ✅ Fácil de fazer backup
- ✅ Fácil de sincronizar com produção
- ✅ Escalável (adicionar produtos = só upload em products/)
- ✅ Compatível com padrões Express/Node

