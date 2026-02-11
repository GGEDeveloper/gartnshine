# Inventário e Produtos - Guia Completo

**Última atualização:** 2025-02-11

---

## 1. Informações Associadas a Produtos

### Campos da Tabela `products` (schema actual)

| Campo | Tipo | Formulário | Descrição |
|-------|------|------------|-----------|
| `id` | INT | - | Auto-increment |
| `reference` | VARCHAR(50) | ✓ | **Referência única** (ex: PAN0001) |
| `barcode` | VARCHAR(50) | ✓ | Código de barras |
| `family_id` | INT | ✓ | FK → product_families (categoria) |
| `name` | VARCHAR(200) | ✓ | Nome do produto |
| `description` | TEXT | ✓ | Descrição |
| `purchase_price` | DECIMAL | ✓ | Preço de compra (€) |
| `sale_price` | DECIMAL | ✓ | Preço de venda (€) |
| `current_stock` | INT | ✓ | Stock actual |
| `min_stock` | INT | ✓ | Stock mínimo (alerta) |
| `weight` | DECIMAL | ✓ | Peso |
| `weight_unit` | ENUM(g,kg) | ✓ | Unidade do peso |
| `dimensions` | VARCHAR(50) | ✓ | Ex: "10x5x2 cm" |
| `style` | VARCHAR(100) | ✓ | Estilo (ex: Boho, Bali) |
| `material` | VARCHAR(100) | ✓ | Material (ex: Prata 925) |
| `notes` | TEXT | ✓ | Notas internas |
| `is_active` | TINYINT | ✓ | Produto activo |
| `is_catalog_visible` | TINYINT | ✓ | Visível no catálogo público |
| `featured` | TINYINT | ✓ | Em destaque na home |
| `created_by`, `updated_by` | INT | - | Audit |
| `created_at`, `updated_at` | TIMESTAMP | - | - |

### Tabela `product_images`

| Campo | Descrição |
|-------|-----------|
| `product_id` | FK → products |
| `image_filename` | Nome do ficheiro (ex: image-1234567890.jpg) |
| `is_primary` | 1 = imagem principal |
| `sort_order` | Ordem de exibição |

### Dados do Excel (Book1_com_imagens / excel1.csv)

Colunas disponíveis para importação/referência:
- **REF** → reference
- **Preço Venda € Unit** → sale_price
- **Valor Compra € Unit** → purchase_price
- **STK Atual Unit** → current_stock
- **FAM** → família (ex: PAN → product_families)
- **image** / **Foto** → nome do ficheiro de imagem (ex: IMG_7797.jpg)

---

## 2. Fluxo de Introdução de Novo Produto

### Passo a passo

1. **Admin** → `/admin/products` → botão "Adicionar"
2. **Formulário** → `/admin/products/add` (product-form.ejs)
3. **Preencher** campos (ver secção 3)
4. **Upload** de imagens (múltiplas, primeira = principal)
5. **Submit** → POST `/admin/products/create`
6. **Backend** → ProductController.store → Product.createProductWithImages
7. **Se current_stock > 0** → regista transação em inventory_transactions (initial_stock)

### Rotas

| Acção | Rota | Método |
|-------|------|--------|
| Formulário novo | /admin/products/add | GET |
| Criar produto | /admin/products/create | POST |
| Formulário editar | /admin/products/edit/:id | GET |
| Actualizar produto | /admin/products/edit/:id | POST |

### Multer (upload)

- **Destino:** `public/media/products/`
- **Limite:** 5MB por ficheiro
- **Tipos:** jpeg, jpg, png, gif, webp
- **Campos:** `images` (múltiplas), `image` (legado, única)

---

## 3. Campos do Formulário (product-form.ejs)

### Informações Básicas
- **Nome** * (obrigatório)
- **Referência**
- **Código de Barras**
- **Família** (select product_families)

### Preços
- Preço de Compra (€)
- Preço de Venda (€)

### Stock
- Estoque Actual
- Estoque Mínimo

### Características
- Peso + unidade (g/kg)
- Dimensões
- Material (default: Prata 925)
- Estilo

### Descrição / Notas
- Descrição
- Notas Internas

### Configurações (checkboxes)
- Produto Activo
- Visível no Catálogo
- Produto em Destaque

### Imagens
- **Existentes:** ver, definir principal, marcar para remover
- **Novas:** input file múltiplo (name="images")

---

## 4. Campos que o Modelo Persiste (createProductWithImages)

**Campos aceites:** name, reference, description, family_id, sale_price, purchase_price, current_stock, min_stock, tax_rate, weight, dimensions, is_active, is_catalog_visible, featured, notes, attributes

**⚠️ O modelo NÃO inclui:** barcode, material, style, weight_unit

Embora o formulário e a tabela tenham estes campos, o array `productFields` em createProductWithImages/updateProductWithImages **não os inclui**. Será necessário acrescentar para serem gravados.

---

## 5. Inventário – Relação com Produtos

### O que o Inventário mostra

- Lista de produtos com: id, imagem, referência, família, stock actual, status (activo/inactivo)
- **Filtros:** referência, categoria, status produto, status stock
- **Acções por produto:**
  - Ver Histórico → `/admin/inventory/history/:productId` (view em falta)
  - Editar Produto → `/admin/products/edit/:id`
  - Eliminar

### Link para histórico

- **Actual:** `/admin/inventory/<%= product.id %>`
- **Rota correcta:** `/admin/inventory/history/<%= product.id %>`
- **Problema:** View `admin/inventory/history.ejs` não existe; `Inventory.getProductHistory` não existe

### Ajuste de stock

- Rota: POST `/admin/inventory/adjust`
- Body: product_id, quantity, movement_type (in/out), notes, unit_cost, etc.
- **Nota:** Tabela `inventory_transactions` pode não existir na DB de produção actual

---

## 6. Fluxo de Imagens

```
Upload (form) → Multer → public/media/products/{filename}
                    ↓
Product.createProductWithImages / updateProductWithImages
                    ↓
INSERT product_images (product_id, image_filename, is_primary, sort_order)
```

- **URL pública:** `/media/products/{filename}`
- **Compatibilidade:** `/uploads/products/` também serve o mesmo diretório

---

## 7. Resumo – Como Adicionar Novo Produto

1. Aceder a `/admin/products` → "Adicionar"
2. Preencher: Nome, Referência (única), Família, Preços, Stock
3. Opcional: Material, Estilo, Peso, Dimensões, Descrição
4. Upload de imagens (múltiplas, primeira = principal)
5. Marcar: Activo, Visível no Catálogo, Em Destaque (se aplicável)
6. Guardar

**Importar do Excel:** Não existe script de importação automático. O excel1.csv pode ser usado como base para um script ou importação manual.
