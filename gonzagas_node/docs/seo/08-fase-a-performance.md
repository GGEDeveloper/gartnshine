# FASE A — Performance & Core Web Vitals

**Sprint SEO:** Otimização de imagens, OG image, favicons completos  
**Branch:** `dev/seo-performance-webp` _(a criar)_  
**Prioridade:** 🔴 Alta — ranking factor direto do Google

---

## Contexto

Core Web Vitals são **ranking factors oficiais do Google** desde 2021. Sites com melhor performance têm vantagem competitiva direta nos resultados de pesquisa.

**Impacto comprovado:**
- LCP de 7s → 1s = melhoria de 6x no score de performance
- 0.1s de redução = +8.4% conversão
- Sites com CLS < 0.1 têm -30% bounce rate

---

## Objetivos

| Métrica | Atual (estimado) | Target | Como medir |
|---------|------------------|--------|------------|
| **LCP** | ~4s | < 2.5s | PageSpeed Insights, Search Console |
| **INP** | ~250ms | < 200ms | PageSpeed Insights |
| **CLS** | ~0.15 | < 0.1 | PageSpeed Insights |
| **Performance Score** | ~65 | > 90 | PageSpeed Insights |
| **Imagem OG** | Placeholder 346 bytes | Real 1200×630px | Facebook Sharing Debugger |
| **Favicons** | Incompleto | Completo (5 ficheiros) | Favicon Checker |

---

## Task A1 — Conversão de Imagens para WebP

### O que é WebP
- Formato criado pelo Google, 30-50% menor que JPEG com a mesma qualidade
- Suportado por 97% dos browsers (Chrome, Firefox, Edge, Safari 14+)
- Fallback automático para JPEG/PNG em browsers antigos com `<picture>`

### Passo 1: Instalar sharp

```bash
npm install sharp --save
```

### Passo 2: Script de conversão em batch

Criar `gonzagas_node/scripts/convert-to-webp.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/uploads/products');
const outputDir = path.join(__dirname, '../public/uploads/products/webp');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, (err, files) => {
  if (err) throw err;

  let count = 0;
  const toConvert = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  toConvert.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

    sharp(inputPath)
      .webp({ quality: 85 }) // Qualidade 85 = balanço ideal qualidade/tamanho
      .toFile(outputPath)
      .then(() => {
        count++;
        console.log(`✓ [${count}/${toConvert.length}] ${file} → ${path.basename(outputPath)}`);
      })
      .catch(err => console.error(`✗ Erro em ${file}:`, err.message));
  });
});
```

Executar:
```bash
node gonzagas_node/scripts/convert-to-webp.js
```

### Passo 3: Middleware para conversão automática em upload

Adicionar em `gonzagas_node/middleware/imageUpload.js`:

```javascript
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImageToWebP(filePath) {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const webpDir = path.join(dir, 'webp');
  const webpPath = path.join(webpDir, path.basename(filePath).replace(ext, '.webp'));

  if (!fs.existsSync(webpDir)) {
    fs.mkdirSync(webpDir, { recursive: true });
  }

  await sharp(filePath)
    .webp({ quality: 85 })
    .toFile(webpPath);

  return webpPath;
}

module.exports = { processImageToWebP };
```

---

## Task A2 — Lazy Loading Nativo

### O que é
Imagens abaixo do fold (não visíveis no scroll inicial) só carregam quando o utilizador scrollar até elas. Reduz carga inicial e melhora LCP.

### Regra crítica

> ⚠️ **NUNCA** aplicar `loading="lazy"` em imagens hero, logo ou primeira imagem visível na página. Essas devem ter `loading="eager"` (ou omitir o atributo).

### Onde aplicar

| Página | `loading="lazy"` | `loading="eager"` |
|--------|-----------------|------------------|
| Homepage | Produtos posição 2+ | Hero banner, 1º produto |
| Product Detail | Imagens galeria secundárias | Imagem principal |
| Collections | Produtos posição 4+ | Primeiros 3 |
| Search Results | Posição 3+ | Primeiros 2 |

---

## Task A3 — Template `<picture>` com WebP + Fallback

### Template padrão (aplicar em todos os EJS)

```html
<picture>
  <source
    srcset="/uploads/products/webp/<%= product.image.replace(/\.(jpg|jpeg|png)$/i, '.webp') %>"
    type="image/webp">
  <img
    src="/uploads/products/<%= product.image %>"
    alt="<%= product.name %> em prata 925 — Art & Shine"
    width="800"
    height="800"
    loading="lazy">
</picture>
```

### Template para imagem principal (LCP — sem lazy)

```html
<picture>
  <source
    srcset="/uploads/products/webp/<%= product.image.replace(/\.(jpg|jpeg|png)$/i, '.webp') %>"
    type="image/webp">
  <img
    src="/uploads/products/<%= product.image %>"
    alt="<%= product.name %> em prata 925 — Art & Shine"
    width="800"
    height="800"
    loading="eager"
    fetchpriority="high">
</picture>
```

### Ficheiros a modificar

- [ ] `views/pages/product-detail.ejs`
- [ ] `views/partials/product-card.ejs` (ou equivalente no grid)
- [ ] `views/pages/search-results.ejs`
- [ ] `views/pages/index.ejs` (homepage)
- [ ] `views/pages/collection-detail.ejs`

### CSS global obrigatório (já deve existir, confirmar)

```css
img {
  max-width: 100%;
  height: auto;
}
```

Este CSS permite que `width/height` no HTML defina o aspect ratio enquanto a imagem é responsiva.

---

## Task A4 — Imagem Open Graph Real

### O problema atual

`/public/images/og-artnshine.jpg` tem **346 bytes** — é um placeholder vazio.

Quando alguém partilha o site no Facebook, LinkedIn ou WhatsApp → aparece imagem quebrada ou genérica.

### Especificações

| Plataforma | Dimensões | Formato | Tamanho máx |
|------------|-----------|---------|-------------|
| **Facebook** | 1200×630px | JPG/PNG | 8MB |
| **LinkedIn** | 1200×627px | JPG/PNG | 5MB |
| **Twitter/X** | 1200×675px | JPG/PNG | 5MB |
| **WhatsApp** | 1200×630px | JPG/PNG | — |
| **Universal** | **1200×630px** | **JPG** | **< 200KB** |

### Design da imagem

**Elementos obrigatórios:**
- Logo "Art & Shine" visível
- Tagline: "Elegância que nasce da terra"
- Uma das peças mais icónicas como fundo (anel ou colar de destaque)
- Paleta da marca (tons terrosos, prata, verde escuro)

**Layout sugerido:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [Foto de produto em destaque como background]    │
│   [Overlay semi-transparente escuro]                │
│                                                     │
│              ART & SHINE                            │
│      Elegância que nasce da terra                   │
│      Prata 925 · Pedras Naturais                    │
│                                artnshine.pt         │
└─────────────────────────────────────────────────────┘
              1200px × 630px
```

**Ferramentas:** Canva (template "Facebook Post" 1200×630), Figma, Photoshop

### Passos

1. Criar imagem 1200×630px com identidade da marca
2. Exportar como JPG, qualidade 85%, < 200KB
3. Substituir `gonzagas_node/public/images/og-artnshine.jpg`
4. Validar:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) → "Scrape Again"
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

---

## Task A5 — Favicons Completos

### Conjunto mínimo 2026

Apenas 5 ficheiros de imagem + 1 JSON são necessários para cobertura total:

| Ficheiro | Dimensões | Para quê |
|----------|-----------|----------|
| `favicon.ico` | 32×32px | Browsers antigos, tab do browser |
| `icon.svg` | Vectorial | Browsers modernos (melhor qualidade) |
| `apple-touch-icon.png` | 180×180px | iOS/macOS "Add to Home Screen" |
| `icon-192.png` | 192×192px | Android home screen |
| `icon-512.png` | 512×512px | Android splash screen + maskable |
| `manifest.webmanifest` | JSON | Metadata PWA |

### Gerar os ícones com sharp

```javascript
const sharp = require('sharp');

const logo = 'path/to/logo-artnshine.png'; // Mínimo 512×512px ou SVG
const brandBg = { r: 245, g: 240, b: 230, alpha: 1 }; // Tom fundo da marca

async function generateFavicons() {
  // favicon.ico (32x32)
  await sharp(logo)
    .resize(32, 32)
    .toFile('gonzagas_node/public/favicon.ico');

  // apple-touch-icon.png (180x180 com padding)
  await sharp(logo)
    .resize(140, 140)
    .extend({ top: 20, bottom: 20, left: 20, right: 20, background: brandBg })
    .toFile('gonzagas_node/public/apple-touch-icon.png');

  // icon-192.png
  await sharp(logo)
    .resize(192, 192)
    .toFile('gonzagas_node/public/icon-192.png');

  // icon-512.png (maskable — Android safe zone)
  await sharp(logo)
    .resize(409, 409)
    .extend({ top: 51, bottom: 52, left: 51, right: 52, background: brandBg })
    .toFile('gonzagas_node/public/icon-512.png');

  console.log('✓ Favicons gerados com sucesso');
}

generateFavicons();
```

### manifest.webmanifest

Criar `gonzagas_node/public/manifest.webmanifest`:

```json
{
  "name": "Art & Shine — Elegância que nasce da terra",
  "short_name": "Art&Shine",
  "description": "Joias artesanais em prata 925 e pedras naturais",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f5f0e6",
  "theme_color": "#8b7355",
  "lang": "pt-PT",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Tags HTML a adicionar

Adicionar em `views/layouts/main.ejs` e `views/partials/seo-head-standalone.ejs`, **antes** do `</head>`:

```html
<!-- Favicons -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">

<!-- PWA / Mobile -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Art&Shine">
<meta name="theme-color" content="#8b7355">
```

---

## Testes & Validação

### PageSpeed Insights (antes e depois)

**URL:** https://pagespeed.web.dev/

Testar estas 3 páginas:
1. `https://artnshine.pt` (homepage)
2. `https://artnshine.pt/catalog/product/47` (produto)
3. `https://artnshine.pt/collection/2` (coleção)

**Tabela de registo:**

| Página | LCP antes | LCP depois | INP antes | INP depois | CLS antes | CLS depois | Score antes | Score depois |
|--------|-----------|------------|-----------|------------|-----------|------------|-------------|---------------|
| Homepage | ___ | ___ | ___ | ___ | ___ | ___ | ___ | ___ |
| Produto | ___ | ___ | ___ | ___ | ___ | ___ | ___ | ___ |
| Coleção | ___ | ___ | ___ | ___ | ___ | ___ | ___ | ___ |

### Ferramentas de validação

| O quê | Ferramenta | URL |
|-------|-----------|-----|
| Core Web Vitals | PageSpeed Insights | https://pagespeed.web.dev/ |
| OG Image Facebook | Sharing Debugger | https://developers.facebook.com/tools/debug/ |
| OG Image LinkedIn | Post Inspector | https://www.linkedin.com/post-inspector/ |
| Favicons | Favicon Checker | https://realfavicongenerator.net/favicon_checker |
| Manifest / PWA | Chrome DevTools | Application → Manifest |
| Search Console CWV | Search Console | Experience → Core Web Vitals |

---

## Checklist de Implementação

### A1 — WebP
- [ ] `npm install sharp --save`
- [ ] Script `scripts/convert-to-webp.js` criado
- [ ] Executar script — imagens convertidas em `/uploads/products/webp/`
- [ ] Middleware upload automático configurado

### A2 + A3 — Templates HTML
- [ ] `product-detail.ejs` — imagem principal com `eager` + `fetchpriority="high"`
- [ ] `product-detail.ejs` — imagens galeria com `lazy`
- [ ] `product-card.ejs` / grid — `<picture>` + `lazy`
- [ ] `search-results.ejs` — `<picture>` + `lazy`
- [ ] `index.ejs` — hero com `eager`, produtos com `lazy`
- [ ] `collection-detail.ejs` — `<picture>` + `lazy`
- [ ] CSS global `img { max-width: 100%; height: auto; }` confirmado

### A4 — OG Image
- [ ] Imagem 1200×630px criada com identidade da marca
- [ ] Optimizada (< 200KB)
- [ ] Substituída em `/public/images/og-artnshine.jpg`
- [ ] Validada no Facebook Sharing Debugger
- [ ] Validada no LinkedIn Post Inspector

### A5 — Favicons
- [ ] `favicon.ico` (32×32)
- [ ] `icon.svg` (vectorial)
- [ ] `apple-touch-icon.png` (180×180 com padding)
- [ ] `icon-192.png`
- [ ] `icon-512.png` (maskable)
- [ ] `manifest.webmanifest` criado
- [ ] Tags HTML adicionadas ao `<head>` em `main.ejs` e `seo-head-standalone.ejs`
- [ ] Testado iOS Safari → Add to Home Screen
- [ ] Testado Android Chrome → Add to Home Screen

---

## Troubleshooting

### WebP não aparece no browser
- **Causa:** Browser antigo sem suporte a WebP
- **Solução:** Confirmar que `<picture>` tem fallback `<img>` com JPEG/PNG

### CLS ainda alto depois das alterações
- **Causa:** Faltam dimensões em algumas imagens, OU fonts a carregar tarde
- **Solução 1:** Verificar **todas** as `<img>` têm `width` e `height`
- **Solução 2:** Preload de fonts críticas: `<link rel="preload" href="/fonts/..." as="font" crossorigin>`

### OG image não actualiza no Facebook
- **Causa:** Cache do Facebook (dura até 7 dias)
- **Solução:** Ir ao [Sharing Debugger](https://developers.facebook.com/tools/debug/) → clicar "Scrape Again"

### Favicons não aparecem em iOS
- **Causa:** Cache do Safari / ficheiro não encontrado
- **Solução:** Hard refresh (fechar e reabrir browser) + verificar que `apple-touch-icon.png` está em `/public/`

---

## Próximos Passos (após Fase A)

1. **Deploy para produção** (dominios.pt)
2. **Aguardar 7 dias** para dados reais no Search Console
3. **Registar resultados** na tabela de validação acima
4. **Avançar para Fase C** — URLs Semânticas (maior impacto long-term em rankings)

---

**Doc anterior:** `07-seo-roadmap-avancado.md`  
**Doc seguinte:** `09-fase-b-schema-avancado.md` _(a criar)_
