# Módulo de Produtos

## Visão Geral

O módulo de produtos é responsável pelo gerenciamento completo do catálogo de produtos, incluindo cadastro, edição, exclusão e consulta de itens.

## Funcionalidades Principais

### 1. Cadastro de Produtos

- **Campos Obrigatórios**
  - Código de referência (único)
  - Nome do produto
  - Preço de venda
  - Categoria
  - Status (ativo/inativo/em reparo)

- **Campos Opcionais**
  - Descrição detalhada
  - Preço de custo
  - Quantidade em estoque (gerenciada automaticamente)
  - Imagem principal
  - Observações

### 2. Edição de Produtos

- Atualização de informações básicas
- Alteração de preços
- Atualização de status
- Troca de imagem
- Histórico de alterações

### 3. Consulta e Filtros

- Busca por referência ou nome
- Filtros por:
  - Categoria
  - Faixa de preço
  - Status
  - Estoque baixo
  - Data de cadastro

### 4. Gerenciamento de Imagens

- Upload de imagens
- Visualização em miniatura
- Ordenação de imagens
- Exclusão de imagens

## Modelo de Dados

```python
class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    cost_price = db.Column(db.Numeric(10, 2))
    stock_quantity = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50))
    image_path = db.Column(db.String(255))
    status = db.Column(db.Enum('active', 'inactive', 'repair', name='product_status'), default='active')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    stock_movements = db.relationship('StockMovement', backref='product', lazy=True)
    sale_items = db.relationship('SaleItem', backref='product', lazy=True)
    
    def __repr__(self):
        return f'<Product {self.reference} - {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'reference': self.reference,
            'name': self.name,
            'price': float(self.price) if self.price else None,
            'cost_price': float(self.cost_price) if self.cost_price else None,
            'stock_quantity': self.stock_quantity,
            'category': self.category,
            'image_url': url_for('static', filename=self.image_path) if self.image_path else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
```

## API Endpoints

### Listar Produtos

```
GET /api/products
```

**Parâmetros de Consulta:**
- `q`: Termo de busca (opcional)
- `category`: Filtrar por categoria (opcional)
- `min_price`: Preço mínimo (opcional)
- `max_price`: Preço máximo (opcional)
- `status`: Status do produto (active/inactive/repair) (opcional)
- `page`: Número da página (padrão: 1)
- `per_page`: Itens por página (padrão: 20)

**Resposta de Sucesso (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "reference": "PAN0001",
      "name": "Produto PAN0001",
      "price": 10.0,
      "stock_quantity": 5,
      "category": "Panos",
      "image_url": "/static/uploads/products/12345.jpg",
      "status": "active"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

### Obter Detalhes do Produto

```
GET /api/products/<reference>
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": 1,
  "reference": "PAN0001",
  "name": "Produto PAN0001",
  "description": "Descrição detalhada do produto",
  "price": 10.0,
  "cost_price": 5.18,
  "stock_quantity": 5,
  "category": "Panos",
  "image_url": "/static/uploads/products/12345.jpg",
  "status": "active",
  "notes": "Algumas observações importantes",
  "created_at": "2025-05-22T10:00:00Z",
  "updated_at": "2025-05-22T10:30:00Z"
}
```

### Criar Produto

```
POST /api/products
```

**Corpo da Requisição (JSON):**
```json
{
  "reference": "PAN0002",
  "name": "Novo Produto",
  "description": "Descrição do novo produto",
  "price": 15.99,
  "cost_price": 8.50,
  "category": "Panos",
  "status": "active"
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": 2,
  "reference": "PAN0002",
  "name": "Novo Produto",
  "message": "Produto criado com sucesso"
}
```

### Atualizar Produto

```
PUT /api/products/<reference>
```

**Corpo da Requisição (JSON):**
```json
{
  "name": "Nome Atualizado",
  "price": 17.99,
  "status": "active"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "message": "Produto atualizado com sucesso"
}
```

### Upload de Imagem

```
POST /api/products/<reference>/image
```

**Form Data:**
- `file`: Arquivo de imagem

**Resposta de Sucesso (200 OK):**
```json
{
  "message": "Imagem atualizada com sucesso",
  "image_url": "/static/uploads/products/67890.jpg"
}
```

## Regras de Negócio

1. **Validação de Referência**
   - Deve ser única no sistema
   - Formato: 3 letras + 4 números (ex: PAN0001)
   - Não pode ser alterada após a criação

2. **Preços**
   - Preço de venda não pode ser menor que o preço de custo
   - Alterações de preço devem ser registradas no histórico

3. **Estoque**
   - A quantidade em estoque é calculada automaticamente
   - Não pode ser negativa
   - Alertas para estoque baixo

4. **Status**
   - **Ativo**: Disponível para venda
   - **Inativo**: Não aparece no catálogo
   - **Em reparo**: Indisponível temporariamente

## Interface do Usuário

### Lista de Produtos

- Tabela com colunas principais
- Filtros rápidos
- Busca instantânea
- Paginação
- Botões de ação

### Formulário de Produto

- Validação em tempo real
- Upload de imagem com pré-visualização
- Campos organizados por seções
- Dicas de preenchimento

## Próximos Passos

1. Implementar a interface de listagem
2. Desenvolver o formulário de cadastro/edição
3. Criar os componentes de upload de imagem
4. Implementar a busca e filtros

---
[Voltar ao Ínicio](00_plano_principal.md)
