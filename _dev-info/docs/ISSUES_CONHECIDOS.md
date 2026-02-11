# Issues Conhecidos e Pontos de Atenção

**Última atualização:** 2025-02-11

## Críticos

### 1. API Product.getById inexistente
- **Ficheiro:** routes/api.js (linhas 215, 267)
- **Problema:** Chama `Product.getById(productId)` mas Product não tem getById
- **Modelo tem:** findById (BaseModel), findByIdWithDetails
- **Correcção:** Usar `Product.findByIdWithDetails(productId)` ou adicionar alias getById

### 2. Inventory.getProductHistory não existe
- **Ficheiro:** controllers/InventoryController.js (linha 91)
- **Problema:** Chama `this.Inventory.getProductHistory(productId)`
- **Inventory tem:** getProductTransactions, getMovementHistory
- **Correcção:** Usar getProductTransactions ou implementar getProductHistory

### 3. View admin/inventory/history.ejs ausente
- **Problema:** InventoryController.showProductHistory renderiza 'admin/inventory/history'
- **Correcção:** Criar a view ou alterar para view existente

### 4. Link histórico inventário incorrecto
- **Ficheiro:** views/admin/inventory/index.ejs (linha 268)
- **Actual:** `/admin/inventory/<%= product.id %>`
- **Rota real:** `/admin/inventory/history/:productId`
- **Correcção:** `/admin/inventory/history/<%= product.id %>`

## Médios

### 5. Inventory usa stock_quantity mas tabela tem current_stock
- **Ficheiro:** models/Inventory.js, updateProductStock
- **Problema:** UPDATE products SET stock_quantity = ...
- **Schema real:** products.current_stock
- **Correcção:** Alterar para current_stock

### 6. Checkpoint – variáveis de ambiente
- **Ficheiro:** models/Checkpoint.js
- **Problema:** Usa DB_PASS, projecto usa DB_PASSWORD
- **Problema:** created_by usa req.session.user.username, sessão tem user.name

### 7. Checkpoints sem adminSessionRequired
- **Problema:** Rotas de checkpoints não têm protecção explícita
- **Nota:** Estão em /admin, dependem do fluxo de montagem

### 8. Tabelas inventory_transactions, checkpoints na DB produção
- **Schema actual (dump):** Não inclui inventory_transactions, checkpoints, product_price_history
- **Código espera:** Essas tabelas
- **Impacto:** Inventário e checkpoints podem falhar em produção

## Baixos

### 9. routes/admin/products.js e routes/admin/index.js não montados
- Existem mas não estão em uso no admin.js principal
- routes/admin/products.js usa Sequelize (Product.findAndCountAll) – modelo Product é raw SQL

### 10. Duplicação de tratamento de erros em app.js
- Múltiplos handlers 404 e error middleware

### 11. Site password não activo
- checkSitePassword existe em middleware/auth.js mas não está aplicado em app.js
- config.adminUser, config.adminPass, config.sitePassword não definidos em config
