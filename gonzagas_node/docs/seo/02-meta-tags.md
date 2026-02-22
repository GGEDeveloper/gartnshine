# Fase 2: Meta Tags Dinâmicas e Copy

## O Problema
1. O domínio `gonzagaartshine.com` estava hardcoded em várias views, direcionando o Google para um domínio errado (o correto é `artnshine.pt`).
2. As meta tags no layout principal (`main.ejs`) eram estáticas. Todas as páginas do site tinham a mesma `<title>` e `<meta name=\"description\">`.
3. Termos incorretos como \"joalharia gótica\" estavam a ser usados, desalinhados com a verdadeira identidade da marca (minimalista, orgânica, prata 925, pedras naturais).
4. As URLs Canónicas (`<link rel=\"canonical\">`) não existiam.

## A Solução Implementada

### 1. Novo `<head>` no Layout Principal (`layouts/main.ejs`)
Foi injetado um bloco completo de SEO dinâmico que reage às variáveis passadas pelas rotas:

- **Title e Description:** Específicas por página.
- **Canonical URL:** Para evitar conteúdo duplicado.
- **Open Graph (Facebook, LinkedIn):** Imagens, títulos e descrições para partilha social.
- **Twitter Cards:** Para partilhas no Twitter/X.
- **Schema.org:** Estrutura básica `OnlineStore` apontando para `artnshine.pt`.

### 2. Suporte a Páginas Standalone
Criado o ficheiro `views/partials/seo-head-standalone.ejs`. 
Algumas páginas (como o carrinho ou checkout) não usam o `main.ejs` (têm `layout: false`). Este partial garante que essas páginas também têm SEO dinâmico sem duplicar código.

### 3. Middleware de URL (`app.js`)
Criado um middleware global para que todas as views saibam exatamente em que URL estão:
```javascript
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.fullUrl = (process.env.BASE_URL || 'https://artnshine.pt') + req.path;
  next();
});
```

### 4. Correção Global de Copy da Marca
**O que foi removido:** 
- `joalharia gótica`
- `gothic jewelry`

**O que foi implementado (Baseado no `about.ejs`):**
- \"Elegância que nasce da terra\"
- \"Joias artesanais em prata 925 com pedras naturais\"
- Focus nas 4 pedras core: Ónix, Olho-de-Tigre, Ametista, Turquesa.
- Palavras-chave: `Gonzaga Art Shine, prata 925, pedras naturais, joias artesanais, prata alternativa, Portugal`

### 5. Injeção de Dados nas Rotas (`routes/index.js`)
As rotas principais foram atualizadas para passar os dados corretos para o EJS:
- **Homepage (`/`)**
- **Sobre (`/about`)**
- **Galeria/Coleções (`/collections`)**
- **Família de Produto (`/collection/:familyId`)**: Usa a descrição real da família da BD.
- **Produto Específico (`/catalog/product/:id`)**: Usa o nome e descrição do produto da BD.

## Open Graph Image (Pendente)
Foi criado o ficheiro `gonzagas_node/public/images/og-artnshine.jpg` como placeholder (1x1px).
**Ação futura necessária:** Substituir este ficheiro por uma imagem real da marca de `1200x630px` (ex: anel em destaque sobre fundo preto com o logo Art&Shine).