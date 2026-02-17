# 🗂️ PLANO DE ARQUIVAMENTO CSS - GONZAGA ART & SHINE

**Data:** 2026-02-17  
**Branch:** feature/planning-fase1-fase2  
**Objetivo:** Limpar estrutura CSS movendo ficheiros redundantes para arquivo

---

## 📋 SITUAÇÃO ACTUAL

### Ficheiros CSS Totais: 37 ficheiros + 1 pasta

```
/css/
├── tokens-dark-nature.css (9KB) ✅ ATIVO - Primitivos
├── variables.css (6.7KB) ✅ ATIVO - Aliases compatibilidade
├── base-dark-nature.css (15KB) ✅ ATIVO - Reset + tipografia
├── components-dark-nature.css (30KB) ✅ ATIVO - Componentes
│
├── PÁGINAS ESPECÍFICAS (ATIVAS):
├── pdp-dark-nature.css (15KB) ✅
├── cart-dark-nature.css (12KB) ✅
├── checkout-premium-dark-nature.css (18KB) ✅
├── galeria-dark-nature.css (10KB) ✅
├── gallery-authentic-dark-nature.css (17KB) ✅
├── manifesto-dark-nature.css (14KB) ✅
├── artesaos-dark-nature.css (12KB) ✅
├── support-pages-dark-nature.css (14KB) ✅
│
├── ADMIN (REVISAR):
├── admin-dark-nature.css (12KB) ✅ ATIVO
├── admin-login-dark-nature.css (6KB) ✅ ATIVO
├── admin-dashboard.css (4KB) ⚠️ REVISAR
├── admin-theme.css (8.7KB) ⚠️ REVISAR
├── admin-layout-fix-definitive.css (8.7KB) ⚠️ REVISAR
├── admin-layout-fix.css (5.9KB) ❌ REDUNDANTE?
├── admin-v2.css (13.9KB) ❌ REDUNDANTE?
├── admin.css (18.7KB) ❌ REDUNDANTE?
├── admin-orders.css (1.8KB) ⚠️ REVISAR
├── admin-product-form.css (3.7KB) ⚠️ REVISAR
├── admin-products-v2.css (6KB) ⚠️ REVISAR
├── admin-tables-mobile.css (7.6KB) ⚠️ REVISAR
│
├── COMPATIBILIDADE/UTILITIES:
├── analytics-dashboard.css (7.6KB) ⚠️ REVISAR
├── media-library.css (14.5KB) ⚠️ REVISAR
├── loading-states.css (4.6KB) ✅ ATIVO
├── notifications.css (5.7KB) ✅ ATIVO
├── mobile-navigation.css (6.9KB) ✅ ATIVO
├── enhanced-navigation.css (4KB) ✅ ATIVO
├── search.css (1.6KB) ✅ ATIVO
├── search-results.css (10.7KB) ✅ ATIVO
├── theme.css (7KB) ⚠️ REVISAR
│
├── VERSÕES ANTIGAS (CANDIDATOS A ARQUIVO):
├── main.css (35KB) ❌ ARQUIVAR - Gigante catch-all não usado
├── catalog.css (12KB) ❌ ARQUIVAR - Versão antiga
├── catalog-v2.css (3KB) ❌ ARQUIVAR - Versão antiga
├── homepage-v2.css (19KB) ❌ ARQUIVAR - index.ejs standalone
├── components.css (9KB) ❌ ARQUIVAR - Substituído por -dark-nature
├── dashboard.css (40KB!) ❌ ARQUIVAR - Gigante, versão antiga
└── collection.ejs (template?) ⚠️ VERIFICAR
```

---

## ✅ FICHEIROS CONFIRMADOS PARA ARQUIVO

### PRIORIDADE ALTA - Redundância Confirmada:

1. **main.css (35KB)**
   - Motivo: Catch-all gigante não referenciado em layout.ejs nem main-layout.ejs
   - Substituído por: Sistema modular tokens → base → components
   - Seguro arquivar: ✅ SIM

2. **dashboard.css (40KB)**
   - Motivo: Gigante, provavelmente versão antiga do admin
   - Substituído por: admin-dark-nature.css + admin-dashboard.css
   - Seguro arquivar: ✅ SIM

3. **components.css (9KB)**
   - Motivo: Substituído por components-dark-nature.css (30KB)
   - Versão: Antiga sem Dark Nature theme
   - Seguro arquivar: ✅ SIM

4. **catalog.css (12KB)**
   - Motivo: Versão antiga, catalog usa layout.ejs com sistema modular
   - Substituído por: components-dark-nature.css
   - Seguro arquivar: ✅ SIM

5. **catalog-v2.css (3KB)**
   - Motivo: Versão intermediária obsoleta
   - Substituído por: Sistema modular atual
   - Seguro arquivar: ✅ SIM

6. **homepage-v2.css (19KB)**
   - Motivo: index.ejs é standalone, não carrega este ficheiro
   - Substituído por: Inline no index.ejs ou sistema modular
   - Seguro arquivar: ✅ SIM

### PRIORIDADE MÉDIA - Verificar Uso:

7. **admin.css (18.7KB)**
   - Motivo: Pode ser substituído por admin-dark-nature.css
   - Acção: VERIFICAR se main-layout.ejs o usa
   - Seguro arquivar: ⚠️ VERIFICAR PRIMEIRO

8. **admin-v2.css (13.9KB)**
   - Motivo: Versão intermediária
   - Acção: VERIFICAR se algum template o usa
   - Seguro arquivar: ⚠️ VERIFICAR PRIMEIRO

9. **admin-layout-fix.css (5.9KB)**
   - Motivo: Substituído por admin-layout-fix-definitive.css
   - Acção: VERIFICAR se ainda é necessário
   - Seguro arquivar: ⚠️ VERIFICAR PRIMEIRO

10. **theme.css (7KB)**
    - Motivo: Pode ser redundante com tokens-dark-nature.css
    - Acção: VERIFICAR conteúdo e uso
    - Seguro arquivar: ⚠️ VERIFICAR PRIMEIRO

---

## 📁 ESTRUTURA DE ARQUIVO PROPOSTA

```
/css/
├── _archive/
│   ├── README.md ← Documentação do arquivo
│   ├── 2026-02-17-cleanup/
│   │   ├── main.css
│   │   ├── dashboard.css
│   │   ├── components.css
│   │   ├── catalog.css
│   │   ├── catalog-v2.css
│   │   ├── homepage-v2.css
│   │   └── _manifest.json ← Metadata do arquivo
│   └── admin-legacy/
│       ├── admin.css (se confirmado)
│       ├── admin-v2.css (se confirmado)
│       └── admin-layout-fix.css (se confirmado)
```

---

## 🔍 PLANO DE VERIFICAÇÃO

### Fase 1: Verificar Uso Actual (OBRIGATÓRIA)

```bash
# Buscar referências nos templates EJS
grep -r "main.css" gonzagas_node/views/
grep -r "dashboard.css" gonzagas_node/views/
grep -r "catalog.css" gonzagas_node/views/
grep -r "components.css" gonzagas_node/views/
grep -r "admin.css" gonzagas_node/views/admin/
grep -r "admin-v2.css" gonzagas_node/views/admin/
```

### Fase 2: Criar Estrutura de Arquivo

1. Criar pasta `/css/_archive/`
2. Criar subpasta `/css/_archive/2026-02-17-cleanup/`
3. Criar README.md com documentação
4. Criar manifest.json com metadata

### Fase 3: Mover Ficheiros (Prioridade Alta)

```bash
# Mover ficheiros confirmados
mv main.css _archive/2026-02-17-cleanup/
mv dashboard.css _archive/2026-02-17-cleanup/
mv components.css _archive/2026-02-17-cleanup/
mv catalog.css _archive/2026-02-17-cleanup/
mv catalog-v2.css _archive/2026-02-17-cleanup/
mv homepage-v2.css _archive/2026-02-17-cleanup/
```

### Fase 4: Testar

- [ ] Build local bem-sucedido
- [ ] Homepage carrega corretamente
- [ ] Catálogo carrega corretamente
- [ ] Admin carrega corretamente
- [ ] Product detail pages funcionam
- [ ] Mobile navigation funciona

### Fase 5: Commit e Deploy

```bash
git add .
git commit -m "chore: arquivar CSS redundante - limpeza estrutura"
git push origin feature/planning-fase1-fase2
```

---

## 📊 BENEFÍCIOS ESPERADOS

### Antes:
- 37 ficheiros CSS
- ~460KB total (estimativa)
- Confusão sobre qual usar
- Duplicação de código

### Depois:
- ~31 ficheiros CSS ativos (-6 ficheiros)
- ~340KB total (-120KB, -26%)
- Estrutura clara e organizada
- Arquivo documentado para referência

---

## ⚠️ NOTAS DE SEGURANÇA

1. **NUNCA DELETAR, SEMPRE ARQUIVAR**
   - Ficheiros movidos para _archive/, não eliminados
   - Possível restaurar se necessário

2. **TESTAR ANTES DE COMMIT**
   - Build local
   - Testar principais páginas
   - Verificar console browser por erros 404

3. **DOCUMENTAR TUDO**
   - README.md no arquivo
   - Manifest.json com metadata
   - Commit message descritivo

4. **BACKUP ANTES DE COMEÇAR**
   - Branch já é backup (feature/planning-fase1-fase2)
   - Não mexer em main/master sem testar

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Criar este documento de planeamento
2. ⏳ Executar verificações da Fase 1
3. ⏳ Criar estrutura de arquivo
4. ⏳ Mover ficheiros confirmados
5. ⏳ Testar thoroughly
6. ⏳ Commit e push
7. ⏳ Documentar resultados

---

**Aprovado por:** _Aguardando aprovação Excelentíssimo Senhor Hugo Gonzaga Gomes_  
**Data Execução:** _A definir_  
**Responsável:** Sistema de desenvolvimento
