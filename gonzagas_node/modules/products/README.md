# Módulo de Produtos

Este módulo gerencia o catálogo de produtos do sistema, incluindo operações CRUD (Criar, Ler, Atualizar, Deletar) para produtos.

## Rotas da API

### Listar todos os produtos
```
GET /api/products
```

### Obter um produto por ID
```
GET /api/products/:id
```

### Criar um novo produto
```
POST /api/products
```

### Atualizar um produto existente
```
PUT /api/products/:id
```

### Excluir um produto
```
DELETE /api/products/:id
```

## Modelo de Dados

O módulo utiliza o modelo `Product` localizado em `models/Product.js`.

## Estrutura do Módulo

- `controllers/` - Controladores para as rotas da API
- `routes/` - Definição das rotas (usando o index.js na raiz do módulo)
- `README.md` - Esta documentação

## Inicialização

O módulo é automaticamente inicializado pelo sistema principal. Durante a inicialização, ele registra suas rotas no aplicativo Express.
