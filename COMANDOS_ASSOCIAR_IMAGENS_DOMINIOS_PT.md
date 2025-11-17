# 🖼️ Comandos para Associar Imagens aos Produtos no dominios.pt

## 📋 Problema Identificado

As imagens físicas existem na pasta `gonzagas_node/public/media/products/` (188 arquivos), mas muitas não estão associadas na tabela `product_images` da base de dados. O catálogo busca imagens através da tabela `product_images`, e quando não encontra, usa o placeholder.

## 🔧 Solução

Criado script `associate-product-images.js` que:
1. Lê todas as imagens da pasta `public/media/products/`
2. Para cada imagem, encontra o produto pela referência (nome do arquivo)
3. Insere ou atualiza o registo na tabela `product_images`

## 📋 Comandos para Executar no Servidor dominios.pt

### 🔄 Passo 1: Atualizar Código (se necessário)
```bash
cd /home/artnshin/artnshine.pt
git fetch origin
git pull origin main
```

### 🔧 Passo 2: Executar Script de Associação
```bash
cd /home/artnshin/artnshine.pt/gonzagas_node
npm run images:associate
```

**OU diretamente:**
```bash
cd /home/artnshin/artnshine.pt/gonzagas_node
node scripts/associate-product-images.js
```

### ✅ Passo 3: Verificar Resultados
O script irá mostrar:
- Total de imagens processadas
- Produtos com nova imagem criada
- Produtos com imagem atualizada
- Produtos não encontrados
- Erros (se houver)

### 🔍 Passo 4: Verificar na Base de Dados (Opcional)
```bash
# Verificar quantos produtos têm imagens associadas
mysql -u [user] -p [database] -e "SELECT COUNT(DISTINCT product_id) as produtos_com_imagens FROM product_images;"

# Verificar produtos sem imagens
mysql -u [user] -p [database] -e "SELECT p.id, p.reference, p.name FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id WHERE pi.id IS NULL AND p.is_active = 1 AND p.is_catalog_visible = 1 LIMIT 10;"
```

## 🚀 Após Executar

**Não é necessário reiniciar a aplicação** - as alterações na base de dados são imediatas.

### Testar no Site:
1. Aceder a: https://artnshine.pt/catalog
2. Verificar que todas as imagens aparecem corretamente
3. Verificar que não há placeholders (exceto produtos realmente sem imagem)

## 📝 Resumo dos Comandos (Copy & Paste)

```bash
cd /home/artnshin/artnshine.pt
git pull origin main
cd gonzagas_node
npm run images:associate
```

## ⚠️ Notas Importantes

- O script **não remove** imagens existentes, apenas adiciona/atualiza
- Se um produto já tiver uma imagem primária, o script atualiza o nome do arquivo se for diferente
- Se um produto não tiver nenhuma imagem, o script cria uma nova como primária
- Produtos sem correspondência na BD (referência não encontrada) são reportados mas não causam erro

## 🔄 Se Precisar Re-executar

O script é seguro para re-executar múltiplas vezes:
- Não duplica imagens
- Atualiza apenas se necessário
- Mantém a estrutura existente

