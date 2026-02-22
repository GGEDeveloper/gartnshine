# Fase 3: Schema Markup (Rich Snippets)

## O Problema
O site não fornecia dados estruturados aos motores de busca. Sem isto, o Google não consegue mostrar \"Rich Snippets\" (preço, disponibilidade na página de resultados) nem perceber a estrutura de navegação do site.

## A Solução Implementada

Foram criados componentes EJS modulares baseados na especificação [Schema.org](https://schema.org/).

### 1. Schema de Produto (`schema-product.ejs`)
Criado em `views/partials/schema-product.ejs`.
Injetado no final de `views/catalog/product-detail.ejs`.

Fornece ao Google dados em tempo real sobre o produto:
- `@type`: `Product`
- `name`: Nome real do produto
- `sku`: Referência do produto
- `brand`: \"Gonzaga's Art & Shine\"
- `image`: URL absoluta da imagem principal
- `offers`: Preço (`product.price`) e Disponibilidade (`InStock` se `stock_quantity > 0`, senão `OutOfStock`).

### 2. Schema de Navegação (`schema-breadcrumb.ejs`)
Criado em `views/partials/schema-breadcrumb.ejs`.
Injetado no final de `views/catalog/product-detail.ejs`.

Diz ao Google como o site está estruturado hierarquicamente:
`Início > Catálogo > Nome do Produto`

Isto permite que o Google mostre as \"migalhas de pão\" nos resultados de pesquisa em vez do URL completo.

### 3. Schema de Loja Online (`OnlineStore`)
Injetado diretamente na `<head>` do `layouts/main.ejs` e também no fim do `views/index.ejs`.

Garante que o Google associa o domínio `artnshine.pt` à entidade comercial \"Art&Shine\", reconhecendo o logótipo, país de origem e serviço de apoio ao cliente.

## Como Testar
Para testar se o schema está a ser gerado corretamente:
1. Abrir uma página de produto (ex: `/catalog/product/123`).
2. Ver o código-fonte da página (`Ctrl+U`).
3. Procurar por `application/ld+json`.
4. Os blocos JSON devem conter os dados reais do produto e não variáveis vazias.
5. (Para Produção) Usar o [Rich Results Test](https://search.google.com/test/rich-results) do Google.