# Módulo de Estoque

## Visão Geral

O módulo de estoque é responsável pelo controle completo das movimentações de produtos, permitindo o registro de entradas, saídas e ajustes de inventário.

## Funcionalidades Principais

### 1. Movimentações de Estoque

- **Entrada (Compra/Devolução)**
  - Registro de compras de fornecedores
  - Devoluções de clientes
  - Ajustes positivos de inventário

- **Saída (Venda/Perda)**
  - Baixa por venda
  - Perdas e avarias
  - Ajustes negativos de inventário

- **Transferências**
  - Entre setores
  - Entre filiais (se aplicável)

### 2. Controle de Lotes e Validades

- Registro de números de lote
- Controle de validade
- Alertas de produtos próximos ao vencimento

### 3. Inventário Físico

- Contagem de estoque
- Ajustes de inventário
- Relatório de divergências
- Assinatura digital do responsável

## Modelo de Dados

```python
class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.Enum('purchase', 'sale', 'adjustment', name='movement_type'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_value = db.Column(db.Numeric(10, 2), nullable=False)
    reference = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Campos específicos para lotes/validades
    batch_number = db.Column(db.String(50))
    expiry_date = db.Column(db.Date)
    
    # Relacionamentos
    product = db.relationship('Product', back_populates='stock_movements')
    user = db.relationship('User')
    
    def __repr__(self):
        return f'<StockMovement {self.id} - {self.movement_type} - {self.quantity} units>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_reference': self.product.reference if self.product else None,
            'product_name': self.product.name if self.product else None,
            'movement_type': self.movement_type,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price) if self.unit_price else None,
            'total_value': float(self.total_value) if self.total_value else None,
            'reference': self.reference,
            'batch_number': self.batch_number,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_by_name': f"{self.user.first_name} {self.user.last_name}" if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
```

## API Endpoints

### Listar Movimentações

```
GET /api/stock/movements
```

**Parâmetros de Consulta:**
- `product_id`: Filtrar por produto (opcional)
- `movement_type`: Tipo de movimentação (purchase/sale/adjustment) (opcional)
- `start_date`: Data inicial (opcional)
- `end_date`: Data final (opcional)
- `reference`: Referência (opcional)
- `page`: Número da página (padrão: 1)
- `per_page`: Itens por página (padrão: 50)

**Resposta de Sucesso (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_reference": "PAN0001",
      "product_name": "Produto PAN0001",
      "movement_type": "purchase",
      "quantity": 10,
      "unit_price": 5.18,
      "total_value": 51.80,
      "reference": "NF12345",
      "batch_number": "LOT123",
      "expiry_date": "2025-12-31",
      "notes": "Compra inicial",
      "created_by": 1,
      "created_by_name": "João Silva",
      "created_at": "2025-05-22T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 50,
  "total_pages": 1
}
```

### Registrar Entrada no Estoque

```
POST /api/stock/entry
```

**Corpo da Requisição (JSON):**
```json
{
  "product_id": 1,
  "quantity": 5,
  "unit_price": 5.50,
  "movement_type": "purchase",
  "reference": "NF12346",
  "batch_number": "LOT124",
  "expiry_date": "2025-12-31",
  "notes": "Reposição de estoque"
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": 2,
  "message": "Entrada no estoque registrada com sucesso",
  "new_stock_quantity": 15
}
```

### Registrar Saída do Estoque

```
POST /api/stock/out
```

**Corpo da Requisição (JSON):**
```json
{
  "product_id": 1,
  "quantity": 2,
  "unit_price": 10.00,
  "movement_type": "sale",
  "reference": "VEND123",
  "notes": "Venda para cliente"
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": 3,
  "message": "Saída do estoque registrada com sucesso",
  "new_stock_quantity": 13
}
```

### Ajuste de Estoque

```
POST /api/stock/adjust
```

**Corpo da Requisição (JSON):**
```json
{
  "product_id": 1,
  "quantity": -1,
  "movement_type": "adjustment",
  "notes": "Ajuste de inventário - produto danificado"
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": 4,
  "message": "Ajuste de estoque realizado com sucesso",
  "new_stock_quantity": 12
}
```

### Obter Saldo Atual

```
GET /api/stock/balance/<product_id>
```

**Resposta de Sucesso (200 OK):**
```json
{
  "product_id": 1,
  "product_reference": "PAN0001",
  "product_name": "Produto PAN0001",
  "current_quantity": 12,
  "last_update": "2025-05-22T14:30:00Z"
}
```

## Regras de Negócio

1. **Validação de Estoque**
   - Não permitir saídas maiores que o estoque disponível
   - Alertar quando o estoque estiver abaixo do mínimo
   - Bloquear vendas de produtos inativos

2. **Cálculo de Custo**
   - Manter histórico de preços de compra
   - Calcular custo médio ponderado
   - Atualizar preço de custo nas entradas

3. **Rastreabilidade**
   - Registrar usuário responsável por cada movimentação
   - Manter histórico completo de alterações
   - Permitir anexar documentos (NF, fotos, etc.)

4. **Validações**
   - Quantidades devem ser números inteiros positivos
   - Preços não podem ser negativos
   - Datas devem ser válidas (não podem ser futuras para movimentações)

## Fluxos de Trabalho

### 1. Recebimento de Mercadoria

1. Selecionar o fornecedor
2. Informar número da nota fiscal
3. Adicionar itens com quantidades e preços
4. Validar totais
5. Confirmar recebimento
6. Atualizar estoque automaticamente

### 2. Inventário Físico

1. Gerar relatório de contagem
2. Realizar contagem dos itens
3. Registrar contagem no sistema
4. Sistema gera relatório de divergências
5. Aprovar ajustes necessários
6. Atualizar estoque

### 3. Ajuste de Estoque

1. Selecionar produto e motivo do ajuste
2. Informar nova quantidade ou diferença
3. Adicionar observações
4. Confirmar ajuste
5. Sistema registra movimentação e atualiza saldo

## Relatórios

### 1. Movimentações por Período
- Filtros por produto, tipo de movimentação e datas
- Totais por tipo de movimentação
- Exportação para Excel/PDF

### 2. Posição de Estoque
- Saldo atual por produto
- Valor total em estoque
- Filtros por categoria e status

### 3. Produtos em Falta
- Itens com estoque abaixo do mínimo
- Itens sem movimentação há mais de X dias
- Itens próximos ao vencimento

## Interface do Usuário

### Lista de Movimentações

- Tabela com colunas principais
- Filtros avançados
- Ordenação por data/produto
- Paginação

### Formulário de Movimentação

- Seleção de produto com busca
- Cálculo automático de totais
- Campos condicionais por tipo de movimentação
- Validação em tempo real

### Painel de Controle

- Gráfico de entradas x saídas
- Top produtos mais movimentados
- Alertas de estoque baixo
- Indicadores principais

## Próximos Passos

1. Implementar os endpoints da API
2. Desenvolver a interface de listagem
3. Criar os formulários de movimentação
4. Implementar os relatórios
5. Desenvolver o painel de controle

---
[Voltar ao Ínicio](00_plano_principal.md)
