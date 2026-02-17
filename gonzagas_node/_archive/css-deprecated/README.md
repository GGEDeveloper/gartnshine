# Archive: CSS obsoleto / consolidado (Gonzaga's Art & Shine)

**Criado em:** Fase 1 da auditoria CSS (2026-02-17).

## Objetivo

Esta pasta recebe ficheiros CSS que forem:
- substituídos por versões definitivas (ex.: admin-layout-fix → admin-layout-fix-definitive),
- integrados noutros ficheiros (fixes temporários),
- confirmados como não referenciados (CSS morto),
- ou duplicados após consolidação (ex.: catalog antigo).

## Estrutura

- `admin-old-versions/` — versões antigas de admin (admin-v2, admin-theme, etc.)
- `fixes-temporary/` — fixes que foram integrados em theme/admin
- `catalog-old/` — catalog.css se catalog-enhanced for mantido como único
- `navigation-old/` — navigation-v2, enhanced-navigation, mobile-navigation se mortos

## Fase 1

**Nenhum ficheiro foi movido.** Apenas foi criada a estrutura e documentado o plano em `docs/css-audit/10-archive-plan.md`.

Os movimentos serão feitos na **Fase 2**, após testes de consolidação.

---

## Arquivamento Fase 3 - 2026-02-17

### Metodologia
Arquivos movidos SOMENTE após dupla verificação:
1. Fase 2: Análise inicial (grep -r)
2. Fase 3: Re-verificação antes de mover
3. Critério: ZERO referências em views/

### Admin Versions (não referenciados em views/)
admin-layout-fix.css
admin-theme.css
admin-v2.css

### Navigation Versions
enhanced-navigation.css
mobile-navigation.css
navigation-v2.css

### Features Unused
admin-dashboard.css
admin-orders.css
admin-product-form.css
dashboard.css
loading-states.css
product-detail-v2.css

### Admin Subfolder
admin-styles.css
header-sidebar-fixes.css

**Verificação:** docs/css-audit/16-dead-files-reverification.txt
**Registro:** docs/css-audit/16-files-moved.txt
**Data:** 2026-02-17 12:06 WET
**Branch:** style-consolidation-fase3-safe-cleanup
