# Archive: catalog.css (redundante)

**Data de arquivamento:** 2026-02-18  
**Motivo:** Redundância com catalog-enhanced.css confirmada por análise técnica e teste visual.

---

## Motivo do Arquivamento

- **catalog.css** carregava ANTES de **catalog-enhanced.css** no layout público (`views/layouts/main.ejs`).
- Análise de sobreposição (Fase 2) mostrou **65,4% de seletores em comum** entre os dois ficheiros.
- **catalog-enhanced.css** contém 57% de seletores únicos adicionais e cobre funcionalmente o catálogo.
- Teste visual pelo utilizador confirmou: *"parece tudo ótimo"* sem catalog.css.
- Conclusão: catalog-enhanced.css é **autossuficiente**; catalog.css era base redundante.

---

## Métricas Técnicas

| Ficheiro            | Tamanho | Linhas | Seletores únicos |
|---------------------|---------|--------|-------------------|
| catalog.css         | 17 KB   | 825    | 318               |
| catalog-enhanced.css| 29 KB   | 1335   | 481               |

**Sobreposição:** 208 seletores em ambos (65% do catalog.css).  
**Referência:** `docs/css-audit/12-catalog-overlap-analysis.md`

---

## Resultado do Teste Visual

- **Data:** 2026-02-18  
- **Método:** Validação visual pelo utilizador (sem screenshots formais).  
- **Feedback:** *"parece tudo ótimo"* (sem catalog.css).  
- **Elementos verificados:** grid, cards, hover, mobile, console sem erros.  
- **Documento de decisão:** `docs/css-audit/17-catalog-test-APPROVED.md`

---

## Validação e Método

1. **Fase 2:** Análise de seletores (catalog vs catalog-enhanced) → 65% sobreposição.  
2. **Fase 3:** catalog.css comentado no layout; testes visuais pelo utilizador.  
3. **Decisão:** Remoção definitiva e arquivamento.  
4. **Alteração no layout:** Removida a linha que carregava catalog.css em `views/layouts/main.ejs`; mantido apenas `catalog-enhanced.css`.

---

## Impacto

- **Menos um ficheiro CSS** no carregamento do frontend.
- **-17 KB** por página que usa o layout principal.
- **Melhor performance:** menos um request HTTP e menos CSS a parsear.

---

## Referências

- `docs/css-audit/12-catalog-overlap-analysis.md` — análise de sobreposição  
- `docs/css-audit/17-catalog-test-decision.md` — instruções do teste  
- `docs/css-audit/17-catalog-test-APPROVED.md` — decisão aprovada e evidências  
- `docs/css-audit/FASE3-RELATORIO-FINAL.md` — relatório final da Fase 3
