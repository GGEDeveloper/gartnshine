# CSS Alternative Versions - Unused

Versões alternativas de CSS admin que nunca foram implementadas.

## Ficheiros

### admin-v2.css
- **Tamanho:** 13.9KB
- **Arquivado:** 2026-02-18
- **Motivo:** Versão 2 do admin planejada mas nunca implementada
- **Referências:** 0 no código (28 menções apenas em docs de auditoria)
- **Seguro eliminar:** ✅ Sim

### admin-theme.css
- **Tamanho:** 8.7KB
- **Arquivado:** 2026-02-18
- **Motivo:** Tema alternativo nunca integrado
- **Referências:** 0 no código
- **Seguro eliminar:** ✅ Sim

## Nota Técnica

O admin atual usa apenas:
- admin.css (18.7KB) - principal
- admin-layout-fix-definitive.css (8.7KB) - fixes
- admin-tables-mobile.css (7.6KB) - mobile
- notifications.css (5.7KB) - notificações

Total: 40.7KB ativos vs 20.9KB não usados arquivados.

## Reversão

```bash
git mv _archive/css-deprecated/alternative-versions/[ficheiro] public/css/
```
