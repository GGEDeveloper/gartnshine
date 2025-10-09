# 🔧 TROUBLESHOOT - Erro 500 na PDP

## 🎯 **PASSO A PASSO PARA RESOLVER**

### **PASSO 1: Adicionar Colunas ao DB**

```bash
cd /home/ggedeveloper/newgans2/gartnshine/gonzagas_node

# Conectar ao MySQL/MariaDB
mysql -u root -p

# Selecionar database (ajustar nome se necessário)
USE gonzagas_db;

# Executar script de colunas
SOURCE add_pdp_columns.sql;

# OU copiar e colar o conteúdo do arquivo manualmente
```

**Se der erro "Column already exists"** → Ignorar, significa que já existe! ✅

---

### **PASSO 2: Inserir Produtos de Teste**

```bash
# Ainda no MySQL
SOURCE insert_test_products_pdp.sql;

# OU se preferir, versão simplificada sem colunas extras:
```

**VERSÃO SIMPLIFICADA (se der erro nas colunas):**
```sql
INSERT INTO products (reference, name, description, sale_price, purchase_price, current_stock, is_active, featured, family_id)
VALUES
('ONIX-ANEL-001', 'Anel Ónix Proteção', 'Anel artesanal em ónix brasileiro e prata 925.', 59.90, 29.90, 5, 1, 1, 1),
('TIGER-COLAR-001', 'Colar Olho-de-tigre Coragem', 'Colar com olho-de-tigre da África do Sul.', 89.90, 44.90, 3, 1, 1, 1);
```

---

### **PASSO 3: Verificar Produtos Criados**

```sql
-- Ver produtos criados
SELECT id, reference, name, sale_price FROM products 
WHERE reference LIKE 'ONIX-%' OR reference LIKE 'TIGER-%';

-- Anotar os IDs (exemplo: 15, 16)
```

**ANOTA OS IDs AQUI:**
- Anel Ónix: ID = `_____`
- Colar Olho-de-tigre: ID = `_____`

---

### **PASSO 4: Reiniciar Servidor Node**

```bash
# Sair do MySQL
exit;

# Ir para pasta do projeto
cd /home/ggedeveloper/newgans2/gartnshine/gonzagas_node

# Matar processo existente (se estiver rodando)
pkill -f "node server.js"
# OU
pm2 stop all

# Iniciar servidor
npm start
# OU
node server.js
# OU
pm2 start server.js
```

---

### **PASSO 5: Verificar Logs do Servidor**

No terminal onde o servidor está rodando, procurar por:

```
[PDP] Accessing product with slug: 15
[PDP] Query results: 1 products found
```

**Se aparecer `[PDP ERROR]`** → Ler a mensagem de erro completa!

---

### **PASSO 6: Testar URLs**

Abrir no browser (ajustar ID conforme PASSO 3):

```
# Teste 1: Com ID do produto
http://localhost:3000/produto/15

# Teste 2: Com slug (se adicionaste as colunas)
http://localhost:3000/produto/anel-onix-protecao

# Teste 3: Outro produto
http://localhost:3000/produto/16
```

---

## 🔍 **POSSÍVEIS ERROS E SOLUÇÕES**

### **Erro 1: "Column 'slug' doesn't exist"**

**Solução:** As colunas não foram adicionadas. Executar `add_pdp_columns.sql` primeiro.

**OU usar rota sem depender de slug:**

Comentar linha do slug na query:
```javascript
// Em routes/index.js, linha ~499
WHERE p.id = ? AND p.is_active = 1
// Remover: (p.slug = ? OR p.id = ?)
```

E mudar parâmetros:
```javascript
`, [slug]);  // Só passar slug uma vez
```

---

### **Erro 2: "Table 'product_images' doesn't exist"**

**Solução:** Criar tabela ou remover parte da query:

```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

**OU simplificar query** para não buscar imagens:
```javascript
// Remover subquery de imagens
const [results] = await pool.execute(`
  SELECT p.*, pf.name as family_name
  FROM products p
  LEFT JOIN product_families pf ON p.family_id = pf.id
  WHERE p.id = ? AND p.is_active = 1
  LIMIT 1
`, [slug]);
```

---

### **Erro 3: "Cannot read property 'stone_type' of undefined"**

**Solução:** Produto não tem stone_type. Adicionar defaults na view:

Já está implementado! A rota faz:
```javascript
produto.stone_type = produto.stone_type || 'natural';
```

---

### **Erro 4: "Views directory error" ou "Template not found"**

**Solução:** Verificar se arquivos existem:

```bash
ls -la views/pages/produto-dark-nature.ejs
ls -la views/partials/stone-story-onix.ejs
ls -la views/partials/stone-story-tiger.ejs
ls -la views/partials/care-instructions-onix.ejs
ls -la views/partials/care-instructions-olho-de-tigre.ejs
```

Se não existirem, **recriar** (copiar dos arquivos que criei).

---

### **Erro 5: "CSS não carrega" ou "JavaScript não funciona"**

**Solução:** Verificar arquivos CSS e JS:

```bash
ls -la public/css/pdp-dark-nature.css
ls -la public/js/product-dark-nature.js
```

Se não existirem, **recriar** (copiar dos arquivos que criei).

---

## 🧪 **TESTE RÁPIDO SEM DB COMPLEXO**

Se queres testar IMEDIATAMENTE sem mexer no DB, cria uma **rota de teste**:

```javascript
// Adicionar em routes/index.js ANTES da rota /produto/:slug

router.get('/produto-teste', (req, res) => {
  const produto = {
    id: 999,
    nome: 'Anel Ónix Teste',
    preco: 59.90,
    preco_formatado: '€59,90',
    descricao: 'Anel de teste para validar PDP Dark Nature',
    slug: 'teste',
    stone_type: 'onix',
    pedra_nome: 'Ónix',
    stone_origin: 'Brasil',
    stone_properties: 'Proteção',
    metal_nome: 'Prata 925',
    metal_finish: 'prata_925',
    metal_purity: '925',
    artisan_name: 'Artesão Teste',
    artisan_workshop: 'Workshop Teste',
    artisan_specialty: 'Especialista em testes',
    crafting_technique: 'Técnica de teste',
    peso: '10g',
    dimensoes: '20x15mm',
    disponibilidade: 'Em stock',
    imagem_principal: '/images/placeholder-produto-dark.jpg',
    imagens_galeria: [],
    meta_title: 'Teste',
    meta_description: 'Teste'
  };

  res.render('pages/produto-dark-nature', {
    layout: false,
    currentPage: 'produto',
    title: 'Teste PDP',
    produto: produto,
    produtosRelacionados: [],
    siteTitle: 'Gonzaga\'s Art & Shine',
    siteDescription: 'Teste',
    canonicalUrl: 'http://localhost:3000/produto-teste'
  });
});
```

**Testar:** `http://localhost:3000/produto-teste`

Se funcionar aqui, o problema é **só no DB/Query!** 🎉

---

## 📋 **CHECKLIST DE VERIFICAÇÃO**

- [ ] **Colunas adicionadas ao DB** (`add_pdp_columns.sql`)
- [ ] **Produtos de teste inseridos** (IDs anotados)
- [ ] **Servidor reiniciado**
- [ ] **Logs verificados** (sem `[PDP ERROR]`)
- [ ] **URL testada** (`/produto/ID`)
- [ ] **Arquivos EJS existem** (5 arquivos)
- [ ] **CSS existe** (`pdp-dark-nature.css`)
- [ ] **JS existe** (`product-dark-nature.js`)

---

## 🆘 **SE CONTINUAR COM ERRO 500**

### **Ver logs completos:**

```bash
# Terminal onde servidor está rodando
# Procurar por [PDP ERROR]

# OU ver logs do PM2
pm2 logs

# OU ver logs do sistema
tail -f /var/log/nginx/error.log  # Se usar nginx
```

### **Testar query diretamente no MySQL:**

```sql
USE gonzagas_db;

SELECT p.*, 
       pf.name as family_name,
       (SELECT GROUP_CONCAT(pi.image_filename ORDER BY pi.is_primary DESC) 
        FROM product_images pi 
        WHERE pi.product_id = p.id) as images
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id
WHERE p.id = 15 AND p.is_active = 1
LIMIT 1;
```

**Se der erro na query** → O problema está no SQL, não no código Node!

---

## 🎯 **PRODUTO GARANTIDO PARA TESTAR**

Se tiveres **QUALQUER** produto ativo no DB:

```sql
-- Ver primeiro produto ativo
SELECT id, name, is_active FROM products WHERE is_active = 1 LIMIT 1;
```

Testar com esse ID:
```
http://localhost:3000/produto/[ID_AQUI]
```

---

## 🚀 **RESUMO RÁPIDO**

```bash
# 1. DB
mysql -u root -p
USE gonzagas_db;
SOURCE add_pdp_columns.sql;
SOURCE insert_test_products_pdp.sql;
exit;

# 2. Reiniciar
cd gonzagas_node
npm start

# 3. Testar
# Browser: http://localhost:3000/produto/1
```

---

**Se continuares com erro 500, copia-me os logs do terminal (a parte `[PDP ERROR]`) para eu ajudar!** 🔍

