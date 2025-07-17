# 🏗️ GUIA DEFINITIVO: DEPLOYMENT MULTI-DOMÍNIO SEM CONFLITOS

## 🎯 OBJETIVO
Evitar conflitos entre domínios no deployment (artnshine.pt vs alitools.pt vs infiniteshine.pt)

## ⚠️ PROBLEMA HISTÓRICO
- **❌ artnshine.pt** redirecionando para **alitools.pt**
- **❌ Document Roots** com paths relativos conflitantes
- **❌ Projetos** interferindo uns com os outros

## ✅ SOLUÇÃO: ISOLAMENTO ABSOLUTO

### 🏗️ ESTRUTURA CORRETA NO SERVIDOR

```
/home/artnshin/
├── public_html/                     ← artnshine.pt (DOMÍNIO PRINCIPAL)
│   ├── gonzagas_node/               ← Projeto Gonzaga's
│   ├── .env
│   ├── server.js
│   └── [arquivos do projeto]
│
├── alitools_project/                ← alitools.pt (ISOLADO)
│   ├── frontend/
│   ├── backend/
│   └── [arquivos do alitools]
│
├── infiniteshine_project/           ← infiniteshine.pt (ISOLADO)
│   ├── frontend/
│   └── [arquivos do infiniteshine]
│
└── [outros_projetos]/               ← Futuros projetos (ISOLADOS)
```

### 📋 CONFIGURAÇÃO NO cPANEL

#### 🏠 DOMÍNIO PRINCIPAL (artnshine.pt):
```
Document Root: /public_html ✅
Status: Principal domain
Path: ABSOLUTO
```

#### 🔗 ADDON DOMAINS:
```
alitools.pt:
Document Root: /home/artnshin/alitools_project ✅
Status: Addon domain
Path: ABSOLUTO

infiniteshine.pt:
Document Root: /home/artnshin/infiniteshine_project ✅  
Status: Addon domain
Path: ABSOLUTO
```

## 🚫 CONFIGURAÇÕES PERIGOSAS A EVITAR

### ❌ PATHS RELATIVOS (causam conflitos):
```
NUNCA USAR:
alitools.pt → Document Root: /alitools          ❌
infiniteshine.pt → Document Root: /infiniteshine ❌

PROBLEMA: Resolve para /public_html/alitools/
RESULTADO: Conflito com domínio principal
```

### ❌ SUBPASTAS DO PRINCIPAL:
```
NUNCA USAR:
/public_html/alitools/     ❌
/public_html/infiniteshine/ ❌

PROBLEMA: Cria dependências entre projetos
RESULTADO: Deploy de um afeta o outro
```

## ✅ PROCEDIMENTO SEGURO DE DEPLOYMENT

### 🔍 PRÉ-DEPLOYMENT CHECKLIST:
```bash
# 1. Verificar status do domínio principal:
curl -I https://artnshine.pt
# DEVE retornar: HTTP/1.1 200 OK

# 2. Verificar Document Roots atuais:
# cPanel → Addon Domains → Verificar paths

# 3. Mapear estrutura atual:
ls -la /home/artnshin/
```

### 🚀 DEPLOYMENT STEP-BY-STEP:

#### **PASSO 1: Criar Estrutura Isolada**
```bash
# SSH para o servidor:
mkdir -p /home/artnshin/alitools_project
mkdir -p /home/artnshin/infiniteshine_project

# Verificar isolamento:
ls -la /home/artnshin/ | grep project
```

#### **PASSO 2: Configurar Document Root**
```
cPanel → Addon Domains → alitools.pt → Edit:
Document Root: /home/artnshin/alitools_project ✅

Verificar:
- Path é ABSOLUTO ✅
- Não usa subpasta de public_html ✅
```

#### **PASSO 3: Deploy do Projeto**
```bash
# Opção A: Git deploy
cd /home/artnshin/alitools_project
git clone [repository] .

# Opção B: Upload via File Manager
# Upload e extrair arquivos na pasta isolada
```

#### **PASSO 4: Teste de Isolamento**
```bash
# Testar ambos os domínios:
curl -I https://artnshine.pt     # ✅ DEVE funcionar
curl -I https://alitools.pt      # ✅ DEVE funcionar

# Verificar processos independentes:
ps aux | grep node
```

### 🔄 RECOVERY/ROLLBACK PROCEDURE

Se novo projeto causar problemas:
```bash
# 1. Parar aplicação problemática (cPanel)
# 2. Verificar recuperação do principal:
curl -I https://artnshine.pt

# 3. Se necessário, reverter Document Root:
# cPanel → Addon Domains → Edit → Reverter path

# 4. Remover projeto problemático:
rm -rf /home/artnshin/[projeto]_project
```

## 📊 MONITORING E VERIFICAÇÃO

### 🔍 COMANDOS DE VERIFICAÇÃO:
```bash
# 1. Status dos domínios:
curl -s -o /dev/null -w "%{http_code}" https://artnshine.pt
curl -s -o /dev/null -w "%{http_code}" https://alitools.pt

# 2. Processos Node.js:
ps aux | grep node | grep -v grep

# 3. Verificar Document Roots:
# cPanel → Addon Domains → Listar configurações

# 4. Verificar isolamento:
ls -la /home/artnshin/ | grep -E "(public_html|project)"
```

### 🚨 ALERTAS DE PROBLEMAS:
```
❌ HTTP 404/500 no domínio principal
❌ Redirecionamentos entre domínios
❌ Processos Node.js conflitantes (mesma porta)
❌ Document Roots com paths relativos
```

## 🎯 BENEFÍCIOS DO ISOLAMENTO ABSOLUTO

### ✅ VANTAGENS:
- **Zero interferências** entre projetos
- **Deploy independente** de cada domínio
- **Rollback seguro** sem afetar outros projetos
- **Manutenção facilitada** - um projeto por pasta
- **Escalabilidade** - adicionar novos projetos sem conflitos

### 📈 MÉTRICAS DE SUCESSO:
- **Uptime do principal**: 100% durante deployment
- **Tempo de deployment**: < 30 minutos
- **Rollback time**: < 5 minutos se necessário
- **Conflitos pós-deploy**: Zero

## 🎓 LIÇÕES APRENDIDAS

### 🏆 REGRAS DE OURO:
1. **Paths absolutos sempre** - nunca usar relativos no cPanel
2. **Um diretório por projeto** - isolamento total garantido  
3. **Testar principal primeiro** - antes de qualquer deployment
4. **Monitorização contínua** - verificar que tudo funciona

### 🚀 PRÓXIMOS PASSOS:
1. **Aplicar no alitools.pt** seguindo este guia
2. **Documentar configuração final** de cada projeto
3. **Criar templates** para futuros deployments
4. **Automatizar verificações** de isolamento

## 📋 CHECKLIST FINAL DE DEPLOYMENT

- [ ] ✅ Domínio principal funcionando 100%
- [ ] ✅ Estrutura isolada criada para novo projeto
- [ ] ✅ Document Root configurado com path absoluto
- [ ] ✅ Projeto deployado na pasta isolada
- [ ] ✅ Teste de ambos os domínios funcionando
- [ ] ✅ Verificação de processos independentes
- [ ] ✅ Monitorização configurada
- [ ] ✅ Documentação atualizada

**🎯 RESULTADO: DEPLOYMENT MULTI-DOMÍNIO SEM CONFLITOS** 