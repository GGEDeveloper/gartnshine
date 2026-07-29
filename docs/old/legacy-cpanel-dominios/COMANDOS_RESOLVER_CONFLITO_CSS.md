# 🔧 Comandos para Resolver Conflito no Servidor

## ⚠️ Problema
Há alterações locais no ficheiro `catalog-enhanced.css` que estão a impedir o pull.

## ✅ Solução: Descartar Alterações Locais e Usar Versão do Repo

```bash
cd /home/artnshin/artnshine.pt
git checkout -- gonzagas_node/public/css/catalog-enhanced.css
git pull origin main
```

## 🔄 Alternativa: Guardar Alterações Locais (se quiser manter)

```bash
cd /home/artnshin/artnshine.pt
git stash
git pull origin main
git stash pop  # Aplica alterações locais por cima (pode ter conflitos)
```

## 📋 Recomendação
**Use a primeira opção** (descartar alterações locais) porque queremos usar a versão corrigida do repositório.

