# JavaScript Archive

Scripts JavaScript não mais utilizados na aplicação.
**Arquivados em:** 2026-02-18

## 📁 Estrutura

### admin-versions/
Versões anteriores de ficheiros admin (backups pré-refactor).

- **`admin.old.js`** (19.1KB)
  - **Origem:** Backup de `admin.js` antes de refactoring
  - **Data:** ~2025 Q3
  - **Razão:** Versão monolítica substituída por módulos
  - **Status:** ✅ Zero referências em código atual

### debug-tools/
Ferramentas de debugging não mais necessárias.

- **`debug-navigation.js`** (4.3KB)
  - **Propósito:** Debug de sistema de navegação
  - **Uso:** Ferramenta temporária para identificar problemas
  - **Resolução:** Problemas corrigidos, debug integrado em utils.js
  - **Status:** ✅ Zero referências em código atual

### mobile-fixes-old/
Fixes mobile antigos substituídos por soluções completas.

- **`admin-mobile-fix.js`** (6.6KB)
  - **Propósito:** Correções mobile admin
  - **Substituído por:** `admin-mobile-complete-solution.js`
  - **Razão:** Solução parcial → solução completa
  - **Status:** ✅ Não carregado em layouts

---

## 🔍 Verificações Realizadas

Antes do arquivamento, confirmado:

### ✅ admin.old.js
- Zero referências em views/ (layouts, partials, páginas)
- Não carregado em nenhum layout (main.ejs, admin/layouts/main.ejs)
- Funcionalidade coberta por `admin.js` atual
- Pesquisa no código: 0 ocorrências

### ✅ debug-navigation.js
- Zero referências em views/
- Não incluído em scripts de build
- Debug tools integrados em `utils.js` e `modules/navigation.js`
- Pesquisa no código: 0 ocorrências

### ✅ admin-mobile-fix.js
- Não carregado no layout admin (`views/admin/layouts/main.ejs`)
- Substituído por `admin-mobile-complete-solution.js` (carregado)
- Funcionalidade duplicada
- Última modificação: >3 meses

---

## 📊 Impacto do Arquivamento

| Ficheiro | Tamanho | Referências | Risco |
|----------|---------|-------------|-------|
| admin.old.js | 19.1KB | 0 | Zero |
| debug-navigation.js | 4.3KB | 0 | Zero |
| admin-mobile-fix.js | 6.6KB | 0 | Zero |
| **TOTAL** | **29.9KB** | **0** | **Zero** |

**Resultado:** ~30KB limpos da pasta `public/js/` sem impacto na aplicação.

---

## 🔄 Reversão

Se necessário reverter (improvável):

### Restaurar ficheiro individual
```bash
# Copiar de volta para public/js/
cp _archive/js-deprecated/[pasta]/[ficheiro].js public/js/

# E adicionar ao layout apropriado
```

### Consultar versão histórica
```bash
# Via git (antes de 2026-02-18)
git log --all --full-history -- "public/js/[ficheiro].js"
git show [commit_hash]:gonzagas_node/public/js/[ficheiro].js
```

---

## 📝 Histórico de Uso

### admin.old.js
**Período ativo:** 2024 Q4 - 2025 Q2
**Contexto:** Versão inicial do painel admin antes da modularização
**Problemas resolvidos:** Refactoring para arquitetura modular

### debug-navigation.js
**Período ativo:** 2025 Q3
**Contexto:** Fase de debugging de navegação mobile
**Problemas resolvidos:** Sistema de navegação estabilizado

### admin-mobile-fix.js
**Período ativo:** 2025 Q3
**Contexto:** Primeira iteração de fixes mobile admin
**Problemas resolvidos:** Solução completa implementada

---

## ✨ Nota Final

Todos os ficheiros arquivados representam **evolução natural** do projeto:
- De soluções parciais → soluções completas
- De código monolítico → arquitetura modular
- De debug tools → sistemas estáveis

Mantidos para referência histórica e aprendizado.
