# Auditoria técnica de SEO — 30/07/2026

Auditoria automatizada de **todas** as 441 URLs do sitemap (32 páginas fixas +
409 páginas de produto), corrida contra a aplicação local com a base de dados
de desenvolvimento.

Complementa o [plano master](seo.md), que cobre o lado de estratégia e de
contas externas (Merchant Center, Business Profile, Pinterest). Esta auditoria
é só o lado técnico do site.

## Resultado

| | Antes | Depois |
|---|---|---|
| Problemas nas 44 páginas fixas + amostra | 313 | **0** |
| Problemas nas 409 páginas de produto | 92 | **2** (títulos a 64 chars) |

## O que estava mal e foi corrigido

Commit `14db113`.

### 1. As 293 imagens do sitemap davam 404 — o problema mais grave

`routes/seo.js` construía `<image:loc>` como
`/uploads/products/<ficheiro>`, mas as imagens vivem em `/media/products/`.
Verificação que o confirmou:

```
/uploads/products/PAN0001.jpg        404
/media/products/PAN0001.jpg          200
/media/products/PAN0001-medium.jpg   200
```

Passou a usar a variante `-medium`, como o feed do Merchant Center já fazia.
**Efeito:** o Google não conseguia associar nenhuma imagem a nenhum produto
através do sitemap — perdia-se toda a presença em Google Imagens e o
enriquecimento visual dos resultados.

### 2. Páginas de listagem vazias no sitemap

`ProductFamily.getAllForSitemap()` devolvia todas as famílias, incluindo as
sem produtos activos (`/collection/21` e `/collection/10`). Passou a exigir
que exista pelo menos um produto activo na família **ou nas subcategorias**
(a taxonomia tem dois níveis: material → tipo+material).

### 3. Meta descriptions finas e duplicadas

- `/catalog`, `/privacy-policy` e `/terms-of-service` não definiam
  `metaDescription` e herdavam a genérica do site: **a mesma descrição em três
  páginas**, e abaixo dos 60 caracteres. Cada uma tem agora a sua.
- **92 páginas de produto** ficavam abaixo dos 60 caracteres, porque a
  descrição da ficha é frequentemente de uma linha ("Brincos de prata argola
  oval fina."). `buildProductDescription()` usa a descrição da ficha quando ela
  já tem 110+ caracteres e, quando é curta, junta-lhe material, família e
  contexto da loja.
- As páginas de família e de coleção com descrições curtas no admin recebem o
  mesmo tratamento (`buildFamilyDescription`, `buildCollectionDescription`).

Isto resolve por código o que o plano master tinha como **C4 — preencher
descriptions na DB**: preencher as descrições no admin continua a ser melhor
(texto humano ganha sempre), mas já não há páginas com snippet fino.

### 4. Títulos duplicados entre peças do mesmo modelo

31 modelos existem em várias peças com o mesmo `name` — sete, no caso da
"Pulseira de Prata Malha Trançada Estilo Bali". A primeira fica com o slug
igual ao nome e as restantes levam um sufixo (a referência, ou `-variante`);
é esse o sinal usado por `hasReferenceInSlug()`. Quando o slug difere do nome,
o título passa a `Nome (REF)` e a descrição ganha `ref. REF`.

**Nota de estratégia:** isto resolve a duplicação de metadados, mas mantém as
peças do mesmo modelo como páginas independentes a competir entre si. A
alternativa — canonicalizar as repetições para uma página única — retiraria
páginas vendáveis da pesquisa e é uma decisão de negócio, não técnica. Fica
registada como opção.

### 5. Sufixo da marca a empurrar os títulos para fora do corte

`views/layouts/main.ejs` acrescentava sempre `| Art&Shine`, e a rota de
produto usava um sufixo ainda mais longo (`- Gonzaga's Art & Shine`), pondo
todos os produtos acima dos 62 caracteres. O sufixo passa a entrar **só quando
o título ainda cabe** nos ~60 caracteres.

### 6. Coleção curada com o nome de uma família

Uma coleção chamada "Pedras Naturais" e a família homónima davam dois títulos
idênticos. As páginas de coleção levam agora o sufixo `— Coleção`.

### 7. Login do admin indexável

O `robots.txt` bloqueia `/admin/`, mas quem chega por link directo não passa
pelo `robots.txt`. `views/admin/layouts/auth.ejs` ganhou
`<meta name="robots" content="noindex, nofollow">`.

## O que foi verificado e está correcto

- **Canonical** em todas as páginas, a apontar para si mesma, com redirect 301
  de ID→slug em produtos e famílias.
- **Um único `<h1>`** por página.
- **Open Graph e Twitter Card** completos em todas as páginas.
- **`lang="pt-PT"`** em todas as páginas.
- **Dados estruturados** válidos: `@graph` com `OnlineStore` + `WebSite` +
  `WebPage` em todas as páginas, mais `Product` e `BreadcrumbList` nas páginas
  de produto.
- **`alt`** em todas as imagens.
- **`robots.txt`** com `Disallow: /admin/`, `/api/`, `/search?*` e linha
  `Sitemap:`.
- **Sitemap** XML válido, 441 URLs.
- **Feed do Merchant Center** (`/feed/products.xml`) XML válido, 409 artigos,
  todas as `g:image_link` a resolver.

## O que fica pendente

| Item | Nota |
|---|---|
| 2 títulos a 64 caracteres | `Pulseira de Prata Malha Trançada com Cabeças de Dragão (PPU0020)` e a `PPU0029`. Nome de 54 caracteres + referência. Irrelevante na prática. |
| Reindexação do sitemap | Tem de ser pedida na Search Console **depois** do deploy — é o que faz o Google voltar a buscar as 293 imagens. Ver `docs/DEPLOY_HOME_NAV_SEO.md`, Passo 5. |
| Canonicalização de modelos repetidos | Decisão de negócio (ver ponto 4). |
| Descrições humanas no admin | O fallback resolve o mínimo; texto próprio continua a ser melhor para CTR. |
| Itens do plano master | HTTP→HTTPS no servidor, Merchant Center, Google Business Profile, Pinterest — ver [seo.md](seo.md). |

## Como reproduzir a auditoria

Os dois scripts usados são de análise, não fazem parte da aplicação:

- Auditoria geral (com browser, via Puppeteer): recolhe as URLs de
  `url > loc` do sitemap e verifica título, description, canonical, contagem de
  `h1`, OG/Twitter, `lang`, validade do JSON-LD, `alt` das imagens e páginas de
  listagem vazias.
- Auditoria de todas as páginas de produto (sem browser, HTTP directo):
  comprimento e unicidade de título e description, e canonical.

**Atenção ao seleccionar as URLs:** `querySelectorAll('loc')` também apanha os
`<image:loc>` dentro de `<image:image>`, o que faz a auditoria tratar imagens
como páginas e produzir centenas de falsos positivos. Usar
`querySelectorAll('url > loc')`.
