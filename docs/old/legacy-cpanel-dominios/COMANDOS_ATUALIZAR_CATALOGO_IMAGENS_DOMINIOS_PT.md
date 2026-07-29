# 🖼️ Comandos para Atualizar Catálogo com Correção de Imagens no dominios.pt

## 📋 Resumo das Correções

Corrigido problema onde apenas as primeiras 16 imagens apareciam no catálogo. Agora TODAS as 188 imagens carregam imediatamente.

**Alterações:**
- CatalogLazyLoad agora carrega todas as imagens imediatamente
- Script adicional para garantir visibilidade de todas as imagens
- Removido `loading="lazy"` que estava a atrasar carregamento

## 📋 Comandos para Executar no Servidor dominios.pt

### 🔄 Passo 1: Backup (Recomendado)
```bash
cd /home/artnshin/artnshine.pt
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)
```

### 🔄 Passo 2: Atualizar Código
```bash
cd /home/artnshin/artnshine.pt
git fetch origin
git checkout main
git pull origin main
```

### ✅ Passo 3: Verificar Commit
```bash
git log --oneline -1
```
**Deve mostrar:** `fix: complete image loading solution - all images load immediately`

### 🔧 Passo 4: Limpar e Configurar (se necessário)
```bash
cd gonzagas_node
rm -rf node_modules
chmod 755 server.js
chmod -R 755 public/ views/ controllers/ models/
```

### 🔍 Passo 5: Verificar Ficheiros Alterados
```bash
ls -la public/js/modules/catalog-lazy-load.js
ls -la views/public/catalog.ejs
```

### 🚀 Passo 6: Reiniciar Aplicação (via cPanel)
1. Aceder ao cPanel
2. Node.js App
3. Selecionar a aplicação
4. Clicar em **"Restart App"**

**OU via terminal (se tiver acesso):**
```bash
pm2 restart artnshine.pt
# ou
systemctl restart nodejs-artnshine.pt
```

## ✅ Verificação Pós-Deployment

### Testar no Browser:
1. Aceder a: https://artnshine.pt/catalog
2. Abrir Console do Browser (F12)
3. Verificar mensagem: `"Loading all 188 product images immediately..."`
4. Verificar que TODAS as imagens aparecem (não apenas as primeiras 16)
5. Fazer scroll para baixo e verificar que todas as imagens estão visíveis

### Verificar Logs (se necessário):
```bash
cd /home/artnshin/artnshine.pt/gonzagas_node
tail -f logs/app.log
# ou
pm2 logs artnshine.pt
```

## 📝 Resumo dos Comandos (Copy & Paste)

```bash
cd /home/artnshin/artnshine.pt
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)
git fetch origin
git checkout main
git pull origin main
git log --oneline -1
cd gonzagas_node
rm -rf node_modules
chmod 755 server.js
chmod -R 755 public/ views/ controllers/ models/
```

**Depois reiniciar a aplicação via cPanel.**

## ⚠️ Notas Importantes

- **Não é necessário** executar `npm install` a menos que haja novas dependências
- As alterações são principalmente JavaScript e templates EJS
- O servidor deve ser reiniciado para aplicar as mudanças
- Todas as 188 imagens devem aparecer imediatamente após o deployment

## 🔍 Se Algo Correr Mal

Se houver problemas após o deployment:

1. **Reverter para backup:**
```bash
cd /home/artnshin/artnshine.pt
rm -rf gonzagas_node
cp -r gonzagas_node_backup_YYYYMMDD_HHMMSS gonzagas_node
# Reiniciar aplicação
```

2. **Verificar logs de erro:**
```bash
cd /home/artnshin/artnshine.pt/gonzagas_node
tail -100 logs/app.log
```

3. **Verificar permissões:**
```bash
chmod -R 755 gonzagas_node/public gonzagas_node/views
```

