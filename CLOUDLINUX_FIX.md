# 🔧 Correção do Erro CloudLinux NodeJS Selector

## ❌ Erro Encontrado
```
Cloudlinux NodeJS Selector demands to store node modules for application in separate folder (virtual environment) pointed by symlink called "node_modules". That's why application should not contain folder/file with such name in application root
```

## 🔍 Causa
O **CloudLinux NodeJS Selector** exige que o `node_modules` seja um **symlink** para o ambiente virtual do cPanel, não uma pasta física no projeto.

## ✅ Solução no Servidor (dominios.pt)

### Passo 1: Remover pasta node_modules física
```bash
# Entrar no diretório da aplicação
cd /home/SEU_USERNAME/artnshine.pt/gonzagas_node

# !! IMPORTANTE: Verificar se estamos no lugar certo
pwd
# Deve mostrar: /home/username/artnshine.pt/gonzagas_node

# Remover a pasta node_modules física (SE EXISTIR)
rm -rf node_modules

# Verificar que foi removida
ls -la | grep node_modules
# Não deve mostrar nenhuma linha
```

### Passo 2: Usar o cPanel para instalar dependências
1. **cPanel** → **Setup Node.js App**
2. Localizar a aplicação **artnshine.pt**
3. Clicar em **"Run NPM Install"**
4. Aguardar conclusão

### Passo 3: Verificar symlink criado
```bash
# Verificar se o symlink foi criado automaticamente
ls -la | grep node_modules
# Deve mostrar algo como:
# lrwxrwxrwx ... node_modules -> /home/username/nodevenv/artnshine.pt/gonzagas_node/18/lib/node_modules
```

### Passo 4: Iniciar aplicação
1. **cPanel** → **Setup Node.js App**
2. Clicar em **"Start App"**
3. Verificar se inicia sem erros

## 🎯 Resultado Esperado

- ✅ `node_modules` é um **symlink** (não pasta)
- ✅ Dependências instaladas no ambiente virtual
- ✅ Aplicação inicia corretamente
- ✅ Site funciona: https://artnshine.pt

## ⚠️ Importante para Deploy

### No Repositório Git:
- ✅ **SEMPRE** ignorar `node_modules/` no `.gitignore`
- ✅ **NUNCA** fazer commit da pasta `node_modules`
- ✅ Fazer commit apenas do `package.json` e `package-lock.json`

### No Servidor:
- ✅ **SEMPRE** usar "Run NPM Install" do cPanel
- ✅ **NUNCA** criar pasta `node_modules` manualmente
- ✅ Deixar o CloudLinux gerir o ambiente virtual

## 📝 Nota Histórica
Este problema já foi enfrentado antes e está documentado em:
- `RECUPERACAO_DOMINIOS_PROCEDIMENTO.md` (linha 732-733)
- `docs/admin-guide.md` (seção sobre módulos em produção)

## 🔄 Comando de Emergência
Se o problema persistir:
```bash
# Parar aplicação no cPanel
# Depois executar:
cd /home/username/artnshine.pt/gonzagas_node
rm -rf node_modules package-lock.json
# Voltar ao cPanel e fazer "Run NPM Install" novamente
``` 