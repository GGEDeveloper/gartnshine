# Relatório de Correção de Cores - Paleta Prata/Bronze

**Data:** 2025-02-13  
**Objetivo:** Eliminar cores azul ciano e verde dos elementos do site (checkboxes, radios, botões, footer)  
**Site:** artnshine.pt

---

## Problemas Identificados (antes da correção)

1. **Checkboxes azul ciano** – Página Catalog, filtros "Todas as Famílias"
2. **Radio buttons azul** – Página Catalog, "Todos", "Até €50", etc.
3. **Botão "Filtros" com borda verde** – Página Catalog
4. **Linhas decorativas verdes** – Abaixo dos títulos do footer (Redes Sociais, Privacidade & Termos)

---

## Alterações Aplicadas

### 1. `gonzagas_node/public/css/variables.css`
- Variáveis já estavam corretas (aplicadas em commit anterior)
- `--color-highlight: #C0C0C0`, `--color-accent: #A8A8A8`, `--color-accent-alt: #B87333`
- Variáveis adicionais: `--color-silver`, `--color-silver-dark`, `--color-bronze`

### 2. `gonzagas_node/public/css/catalog.css`
- **Checkboxes e radios:** `accent-color: #C0C0C0 !important` (hex direto, não variável)
- **Bloco de fix no final:** Força `accent-color` com `!important` e `-webkit-accent-color` para compatibilidade
- **Botões Filtros:** `border-color: #A8A8A8 !important`, `color: #C0C0C0 !important`
- **Hover:** `border-color: #C0C0C0`, `background-color: rgba(192, 192, 192, 0.1)`
- **color-scheme: dark** para melhor renderização em temas escuros

### 3. `gonzagas_node/public/css/catalog-enhanced.css`
- **Substituição de verde por prata:** Todas as ocorrências de `rgba(106, 140, 105, ...)` → `rgba(168, 168, 168, ...)`
- **Checkboxes/radios:** `accent-color: #C0C0C0 !important`, `-webkit-accent-color: #C0C0C0 !important`
- **filter-toggle-btn:** Background e bordas atualizados para prata
- **filter-section, product-card, loading-spinner:** Bordas verdes substituídas por prata

### 4. `gonzagas_node/public/css/main.css`
- **Footer:** `.footer-section h3::after` → `background-color: #A8A8A8 !important`
- Linhas decorativas abaixo dos títulos do footer passam a ser prateadas

---

## Paleta Final

| Uso | Cor | Hex |
|-----|-----|-----|
| Checkboxes/radios (checked) | Prata | #C0C0C0 |
| Bordas, títulos | Prata escura | #A8A8A8 |
| Alternativas, destaques | Bronze | #B87333 |

---

## Verificação Pós-Deploy

1. **Página `/catalog`**
   - [ ] Checkboxes "Todas as Famílias" são prateados quando checked
   - [ ] Radio buttons "Todos", "Até €50", etc. são prateados quando selected
   - [ ] Botão "Filtros" (toggle e floating) tem borda prata, não verde

2. **Página `/` (home)**
   - [ ] Linhas abaixo dos títulos do footer ("Redes Sociais", "Privacidade & Termos") são prateadas

3. **Cache do browser**
   - Fazer hard refresh: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
   - Ou testar em modo incógnito: `Ctrl+Shift+N`

---

## Notas Técnicas

- **accent-color:** Browsers (Chrome, Firefox, Safari) usam ciano/azul por defeito. A propriedade `accent-color` com valor hex e `!important` força a cor prata.
- **color-scheme: dark:** Ajuda alguns browsers a renderizar inputs em tema escuro de forma consistente.
- **Hex vs variável CSS:** Usámos hex (#C0C0C0) diretamente em vez de `var(--color-silver)` para garantir que overrides de outros ficheiros não interfiram.

---

## Ficheiros Modificados

- `gonzagas_node/public/css/catalog.css`
- `gonzagas_node/public/css/catalog-enhanced.css`
- `gonzagas_node/public/css/main.css`
