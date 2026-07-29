# 🖼️ Comandos para Atualizar Imagens de Produtos no dominios.pt

## ✅ Status

- **Total de imagens no git**: 188 arquivos JPG
- **Commit**: `0708c61` - feat: add missing product images (PVO0005-PVO0008)
- **Imagens adicionadas**: PVO0005.jpg, PVO0006.jpg, PVO0007.jpg, PVO0008.jpg

## 📋 Comandos para Executar no Servidor dominios.pt

### 🔄 Passo 1: Atualizar do Repositório
```bash
# Navegar para a raiz do repositório
cd /home/artnshin/artnshine.pt

# Fazer fetch do repositório remoto
git fetch origin

# Verificar diferenças
git log --oneline HEAD..origin/main

# Atualizar para o commit mais recente
git checkout main
git pull origin main
```

### ✅ Passo 2: Verificar Imagens
```bash
# Verificar que as novas imagens foram baixadas
ls -la gonzagas_node/public/media/products/PVO0005.jpg
ls -la gonzagas_node/public/media/products/PVO0006.jpg
ls -la gonzagas_node/public/media/products/PVO0007.jpg
ls -la gonzagas_node/public/media/products/PVO0008.jpg

# Contar total de imagens
find gonzagas_node/public/media/products -name "*.jpg" -type f | wc -l
# Deve mostrar: 188
```

### 🔧 Passo 3: Verificar Permissões
```bash
# Garantir permissões corretas nas imagens
chmod -R 644 gonzagas_node/public/media/products/*.jpg
chmod 755 gonzagas_node/public/media/products/
```

### ✅ Passo 4: Verificação Final
```bash
# Verificar commit
git log --oneline -1
# Deve mostrar: 0708c61 feat: add missing product images

# Verificar status
git status
# Deve mostrar: nothing to commit, working tree clean (ou apenas arquivos untracked normais)
```

## 🚀 Após Atualizar

**Não é necessário reiniciar a aplicação** - as imagens são arquivos estáticos servidos diretamente pelo Express.

### Testar no Site:
- Verificar que as imagens dos produtos aparecem corretamente
- Verificar especialmente produtos com referências: PVO0005, PVO0006, PVO0007, PVO0008

## 📝 Resumo dos Comandos (Copy & Paste)

```bash
cd /home/artnshin/artnshine.pt
git fetch origin
git checkout main
git pull origin main
ls -la gonzagas_node/public/media/products/PVO0005.jpg
find gonzagas_node/public/media/products -name "*.jpg" -type f | wc -l
chmod -R 644 gonzagas_node/public/media/products/*.jpg
git log --oneline -1
```

## ⚠️ Nota Importante

Se houver problemas com imagens não aparecendo:
1. Verificar permissões: `ls -la gonzagas_node/public/media/products/`
2. Verificar se o Express está servindo a pasta: verificar `app.js` tem `app.use('/media/products', ...)`
3. Verificar logs: `tail -f /home/artnshin/logs/nodejs.log`

