# 🗄️ CSS DEPRECATED ARCHIVE

**Data de arquivo:** 18 Fevereiro 2026  
**Razão:** Limpeza CSS - Ficheiros não carregados em nenhum layout

---

## 📋 FICHEIROS ARQUIVADOS (4 files - 25.3KB)

### 1. background-override.css (7KB)
**Status:** ❌ Não carregado  
**Referências:** 16 (todas em docs/)  
**Função:** Override temporário para forçar fundos pretos sólidos (remove gradientes)  
**Razão arquivo:** 
- CSS experimental nunca integrado no layout
- Regras duplicadas já existem em `dark-luxe.css`
- !important excessivo indica patch temporário

### 2. camera-capture.css (4.3KB)
**Status:** ❌ Não carregado  
**Referências:** 0 em views  
**Função:** Módulo fullscreen de captura de fotos via câmara móvel  
**Razão arquivo:**
- Feature nunca implementada
- Nenhuma view usa este CSS
- Código preparatório para funcionalidade futura

### 3. collections.css (3KB)
**Status:** ❌ Não carregado  
**Referências:** 0 em views  
**Função:** Página de galeria/coleções de produtos  
**Razão arquivo:**
- Página collections não existe no site
- Grid system duplicado já existe em `catalog-enhanced.css`

### 4. search-results.css (11KB)
**Status:** ❌ Não carregado  
**Referências:** 9 (todas em docs/)  
**Função:** Página dedicada de resultados de pesquisa com filtros sidebar  
**Razão arquivo:**
- Search usa modal inline, não página dedicada
- Layout sidebar não corresponde à arquitetura atual
- Regras de grid duplicadas em `catalog-enhanced.css`

---

## 📊 IMPACTO DA LIMPEZA

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Total CSS files** | 21 | 17 | -19% |
| **CSS não usado** | 25.3KB | 0KB | -100% |
| **Tamanho repo** | 161KB | 135.7KB | -16% |

---

## 🔄 COMO RESTAURAR

Se precisar recuperar algum ficheiro:

```bash
# Ver conteúdo arquivado
git show HEAD:gonzagas_node/_archive/css-deprecated/background-override.css

# Restaurar para public/css/
git checkout HEAD -- gonzagas_node/_archive/css-deprecated/camera-capture.css
mv gonzagas_node/_archive/css-deprecated/camera-capture.css gonzagas_node/public/css/
```

---

## ✅ CSS ATIVOS FRONTEND (10 files - 121.6KB)

Carregados em `views/layouts/main.ejs`:

1. **variables.css** (7.6KB) - Design tokens
2. **main.css** (35KB) - Core styles  
3. **homepage.css** (4.8KB) - Home específico
4. **theme.css** (27.4KB) - Sistema de temas
5. **components.css** (11KB) - Componentes reutilizáveis
6. **catalog-enhanced.css** (29KB) - Catálogo produtos
7. **notifications.css** (5.2KB) - Sistema notificações
8. **search.css** (5.6KB) - Modal pesquisa
9. **frontend-mobile.css** (7.6KB) - Responsive mobile
10. **dark-luxe.css** (5.8KB) - Dark theme overrides

---

## 🎯 PRÓXIMAS AÇÕES

### Fase 2: Análise Admin CSS
- [ ] **admin-layout-fix-definitive.css** - Integrar fixes no admin.css principal
- [ ] **admin-dark-luxe.css** vs **dark-luxe.css** - Verificar duplicação
- [ ] **admin-mobile.css** - Consolidar com frontend-mobile

### Fase 3: Otimização
- [ ] Minificar CSS ativos
- [ ] Critical CSS inline
- [ ] Lazy load CSS não crítico

---

**Mantido por:** GGEDeveloper  
**Última atualização:** 18/02/2026 03:11 WET
