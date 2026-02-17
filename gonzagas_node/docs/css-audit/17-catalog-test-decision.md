# Teste Visual: Remoção de catalog.css

**Data:** 2026-02-17  
**Status:** ⏳ Aguardando testes visuais manuais

---

## Mudança Testada

Remover `<link rel="stylesheet" href="/css/catalog.css?v=<%= Date.now() %>">` de main.ejs  
Manter apenas `catalog-enhanced.css`

**Análise Fase 2:** 65.4% sobreposição entre catalog.css e catalog-enhanced.css

---

## Instruções para Teste Manual

### Passo 1: Screenshots ANTES (Baseline)

1. Iniciar servidor: `npm start`
2. Abrir: http://localhost:3000/catalog
3. Fazer screenshot COMPLETO da página (scroll completo)
   - Guardar em: `docs/css-audit/screenshots/fase3/before/catalog-desktop.png`
4. Testar filtros (se existirem):
   - Aplicar um filtro
   - Screenshot: `docs/css-audit/screenshots/fase3/before/catalog-filtered.png`
5. Redimensionar para mobile (F12 > 375px width):
   - Screenshot: `docs/css-audit/screenshots/fase3/before/catalog-mobile.png`
6. Abrir console (F12):
   - Screenshot se houver erros: `docs/css-audit/screenshots/fase3/before/console-errors.png`
   - Se não houver erros, anotar: "No console errors"

### Passo 2: Aplicar Mudança

**Comando já executado:** Backup criado em `views/layouts/main.ejs.backup`

**Próximo passo:** Remover linha de catalog.css do main.ejs (aguardando aprovação)

### Passo 3: Screenshots DEPOIS (Teste)

Após remover catalog.css e reiniciar servidor:

1. Abrir: http://localhost:3000/catalog
2. **FORÇA REFRESH:** Ctrl+Shift+R (limpar cache)
3. Screenshot COMPLETO: `docs/css-audit/screenshots/fase3/after/catalog-desktop.png`
4. Testar MESMOS filtros de antes:
   - Screenshot: `docs/css-audit/screenshots/fase3/after/catalog-filtered.png`
5. Mobile (375px):
   - Screenshot: `docs/css-audit/screenshots/fase3/after/catalog-mobile.png`
6. Console (F12):
   - Screenshot se erros: `docs/css-audit/screenshots/fase3/after/console-errors.png`
   - Anotar erros (se houver)

---

## Checklist de Validação

### Desktop
- [ ] Grid de produtos renderiza igual
- [ ] Cards têm bordas/sombras corretas
- [ ] Hover effects funcionam
- [ ] Imagens com aspect ratio correto
- [ ] Preços visíveis e formatados
- [ ] Filtros (se existirem) estilizados
- [ ] Paginação estilizada
- [ ] Nenhum erro no console
- [ ] Nenhum 'flash' de conteúdo sem estilo

### Mobile
- [ ] Responsive mantido
- [ ] Cards renderizam corretamente
- [ ] Touch interactions OK

### Performance
- [ ] Sem flash de conteúdo sem estilo
- [ ] Carregamento suave

---

## DECISÃO: [PREENCHER APÓS TESTES]

### ⏳ Aguardando testes visuais...

**Quando testes estiverem completos:**

- Se tudo OK → Aprovar remoção (Opção A)
- Se algo quebrou → Rejeitar remoção (Opção B)

---

## Opção A: APROVAR remoção (se tudo OK)

```bash
# Aceitar mudança
rm views/layouts/main.ejs.backup
git add views/layouts/main.ejs
git commit -m "refactor: remove redundant catalog.css from main layout

Visual regression test passed:
- Grid layout maintained
- Card styling intact
- Hover effects working
- Mobile responsive verified
- No console errors
- catalog-enhanced.css is self-sufficient

Screenshots: docs/css-audit/screenshots/fase3/
Analysis: 65% selector overlap confirmed redundant"

# Arquivar catalog.css
mv public/css/catalog.css _archive/css-deprecated/catalog-old/
git add _archive/css-deprecated/catalog-old/catalog.css
git commit -m "chore: archive redundant catalog.css

Confirmed via visual testing that catalog-enhanced.css
contains all necessary styles. catalog.css was providing
only redundant base styles (65% overlap).

Original file preserved in archive for reference."
```

---

## Opção B: REJEITAR remoção (se algo quebrou)

```bash
# Reverter mudança
mv views/layouts/main.ejs.backup views/layouts/main.ejs
echo "❌ Test FAILED - Reverted to original main.ejs"

# Documentar o que quebrou
# [DESCREVER ISSUES ENCONTRADOS]
```

---

**⚠️ IMPORTANTE:** Este teste requer validação visual manual. Não prosseguir sem screenshots e validação completa.
