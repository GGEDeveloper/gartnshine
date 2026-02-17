# Decisão: Status de layout.ejs

**Data:** 2026-02-17

---

## Descobertas da Investigação

### Configuração do View Engine (app.js)

O sistema usa **express-ejs-layouts** com configuração via `config/view.js`:

```javascript
// Layout padrão público
app.set('layout', viewConfig.layouts.public.default); // = 'layouts/main'

// Middleware define layout baseado em rota:
// /admin → 'admin/layouts/main'
// outras → 'layouts/main'
```

### Layout Padrão Detectado

✅ **layouts/main.ejs** é o padrão ativo para frontend  
✅ **admin/layouts/main.ejs** é o padrão ativo para admin  
❓ **layout.ejs** existe mas não está configurado como padrão

---

## Referências Encontradas

### layout.ejs usado por:

**Apenas 1 referência encontrada:**
- `test-frontend-styles.js:78` — arquivo de teste, não produção

**Total:** 0 referências em código de produção

### layouts/main.ejs usado por:

**Múltiplas referências ativas:**
- `config/view.js` — definido como padrão público
- `routes/index.js` — 4 rotas explicitamente usam `layout: 'layouts/main'`
- `controllers/CatalogController.js` — usa `layout: 'layouts/main'`
- Todas as rotas frontend usam este layout via padrão do express-ejs-layouts

**Total:** ~15+ referências ativas em produção

---

## CSS Exclusivos de layout.ejs

### background-override.css
**Status:** Usado em 2 lugares:
- ✅ `views/layout.ejs` (layout legado)
- ✅ `views/catalog/product-detail.ejs` (view ativa!)

**Conclusão:** NÃO pode ser arquivado — usado por product-detail.ejs

### black-background-fix.css
**Status:** Usado apenas em:
- ✅ `views/layout.ejs` (layout legado)

**Conclusão:** Pode ser arquivado SE layout.ejs não for usado

### css/mobile/* subfolder
**Status:** Verificar se existe e onde é usado

---

## Análise de Contexto Histórico

Commits recentes mostram grande refactoring de CSS (Feb 16-17, 2026):
- Sistema migrado para `layouts/main.ejs` como padrão
- express-ejs-layouts configurado como sistema de layouts
- layout.ejs parece ser legado de antes desta refatoração

**Evidência:** Nenhuma rota ativa referencia layout.ejs diretamente.

---

## DECISÃO

### ✅ CENÁRIO A: layout.ejs NÃO é usado (confirmado)

**Evidências:**
- ✅ Nenhuma rota ativa referencia layout.ejs
- ✅ Sistema usa express-ejs-layouts com layouts/main.ejs como padrão
- ✅ Única referência é em arquivo de teste

**Ação:** Arquivar layout.ejs + CSS exclusivos (black-background-fix.css, css/mobile/* se só usado por layout.ejs)

**⚠️ EXCEÇÃO:** background-override.css NÃO arquivar — usado por catalog/product-detail.ejs

**Risco:** BAIXO (confirmado não usado)

**Executar:** SIM

---

## DECISÃO FINAL

✅ **ARQUIVAR layout.ejs e CSS relacionados (exceto background-override.css)**

**Justificação:**
1. layout.ejs não está configurado como layout padrão
2. Nenhuma rota ativa referencia layout.ejs
3. Sistema usa layouts/main.ejs via express-ejs-layouts
4. Única referência é em arquivo de teste

**CSS a arquivar:**
- ✅ black-background-fix.css (só usado por layout.ejs)
- ✅ css/mobile/* subfolder (se só usado por layout.ejs — verificar)

**CSS a MANTER:**
- ⚠️ background-override.css (usado por catalog/product-detail.ejs)

---

## Próximos Passos

1. Verificar se css/mobile/ existe e onde é usado
2. Se css/mobile/ só usado por layout.ejs → arquivar
3. Arquivar layout.ejs e black-background-fix.css
4. MANTER background-override.css (usado ativamente)
