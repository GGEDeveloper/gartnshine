# 🔧 Comandos para Resetar Servidor para Estado Correto

## ⚠️ Situação Atual no Servidor:
- **Commit atual:** `8d977b6` (merge antigo - ERRADO)
- **Commit correto:** `898f242` (origin/main - CORRETO)
- **Status:** Ahead of origin/main by 26 commits
- **Mudanças:** Muitas imagens modificadas e não rastreadas

## 🎯 Comandos para Executar:

### Passo 1: Descartar TODAS as mudanças locais
```bash
# Descartar mudanças em arquivos rastreados
git reset --hard HEAD

# Descartar mudanças staged
git reset --hard
```

### Passo 2: Resetar para origin/main (commit correto)
```bash
# Atualizar referências remotas
git fetch origin

# Resetar completamente para origin/main
git reset --hard origin/main

# Verificar que está correto (deve mostrar 898f242)
git log --oneline -3
```

### Passo 3: Limpar arquivos não rastreados (CUIDADO com imagens)
```bash
# Ver o que será removido primeiro (opcional - para verificar)
git clean -fdn

# Remover arquivos não rastreados (exceto .env e backups)
# ⚠️ ATENÇÃO: Isto remove node_modules e arquivos temporários
git clean -fd

# Remover especificamente node_modules (CloudLinux requirement)
rm -rf gonzagas_node/node_modules
```

### Passo 4: Verificação Final
```bash
# Confirmar commit correto
git rev-parse HEAD
# Deve retornar: 898f242c4bb641d7fb543438e487ac2c74c1ef80

# Verificar status (deve estar limpo)
git status

# Verificar que origin/main está atualizado
git log --oneline origin/main -3
```

---

## 🚨 ALTERNATIVA: Se Precisar Manter as Imagens

Se as imagens em `gonzagas_node/public/media/` são importantes e foram modificadas no servidor:

```bash
# 1. Fazer backup das imagens modificadas
mkdir -p /tmp/media_backup
cp -r gonzagas_node/public/media/* /tmp/media_backup/

# 2. Resetar código
git fetch origin
git reset --hard origin/main

# 3. Restaurar imagens se necessário (após verificar)
# cp -r /tmp/media_backup/* gonzagas_node/public/media/
```

---

## ✅ Comandos Completos em Sequência:

```bash
cd /home/artnshin/artnshine.pt

# Resetar tudo para origin/main
git fetch origin
git reset --hard origin/main
git clean -fd

# Remover node_modules
rm -rf gonzagas_node/node_modules

# Verificar
git log --oneline -3
git status
```

