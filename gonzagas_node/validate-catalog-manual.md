# 📋 Validação Manual - Página do Catálogo

## Credenciais de Teste
- **Email**: miguelmelo70@gmail.com
- **Password**: 2585

---

## ✅ Checklist de Validação

### 1. Carregamento da Página
- [ ] Acessar `http://localhost:3000/catalog`
- [ ] Página carrega sem erros
- [ ] Grid de produtos é visível
- [ ] Sidebar de filtros está visível (desktop)

### 2. Filtros AJAX
- [ ] Clicar em uma família (ex: "Aneis")
- [ ] Produtos filtram SEM reload da página
- [ ] Contador de produtos atualiza
- [ ] URL atualiza com parâmetros
- [ ] Clicar em "Limpar Filtros" funciona

### 3. Filtros de Preço
- [ ] Selecionar "Até €50"
- [ ] Produtos filtram corretamente
- [ ] Selecionar "€50 - €100"
- [ ] Produtos filtram corretamente
- [ ] Selecionar "€100+"
- [ ] Produtos filtram corretamente

### 4. Ordenação
- [ ] Selecionar "Preço: Menor → Maior"
- [ ] Produtos ordenam corretamente
- [ ] Selecionar "Nome: A-Z"
- [ ] Produtos ordenam corretamente
- [ ] Selecionar "Referência: Crescente"
- [ ] Produtos ordenam corretamente

### 5. Busca
- [ ] Digitar "anel" na busca
- [ ] Produtos filtram em tempo real
- [ ] Termos pesquisados são destacados
- [ ] Limpar busca funciona

### 6. View Modes
- [ ] Clicar em ícone de lista
- [ ] Vista muda para lista
- [ ] Clicar em ícone de grelha
- [ ] Vista muda para grelha
- [ ] Preferência é salva (recarregar página mantém)

### 7. Quick View
- [ ] Clicar em "Ver Detalhes" em um produto
- [ ] Modal abre
- [ ] Dados do produto carregam
- [ ] Imagem é visível
- [ ] Botão "Ver Detalhes Completos" funciona
- [ ] Fechar modal funciona

### 8. GLightbox (Zoom de Imagens)
- [ ] Clicar em uma imagem de produto
- [ ] GLightbox abre
- [ ] Imagem é ampliada
- [ ] Navegação entre imagens funciona (se houver múltiplas)
- [ ] Fechar funciona

### 9. Lazy Loading
- [ ] Scroll para baixo na página
- [ ] Imagens carregam conforme aparecem
- [ ] Skeleton screens aparecem durante carregamento

### 10. Mobile
- [ ] Redimensionar janela para mobile (< 576px)
- [ ] Botão "Filtros" aparece
- [ ] Clicar em "Filtros"
- [ ] Drawer de filtros abre
- [ ] Overlay escuro aparece
- [ ] Fechar drawer funciona

### 11. Cards de Produto
- [ ] Hover sobre um card
- [ ] Efeito de zoom na imagem
- [ ] Overlay aparece
- [ ] Botão "Ver Detalhes" aparece
- [ ] Badges aparecem (se aplicável)

### 12. Performance
- [ ] Página carrega em < 5 segundos
- [ ] Filtros respondem rapidamente
- [ ] Sem travamentos ou lag

### 13. Console do Browser
- [ ] Abrir DevTools (F12)
- [ ] Verificar Console
- [ ] Não deve haver erros críticos
- [ ] Módulos devem estar carregados:
  - ✅ catalogFilters
  - ✅ catalogLazyLoad
  - ✅ catalogSort
  - ✅ catalogGrid
  - ✅ catalogQuickView
  - ✅ catalogViewModes
  - ✅ catalogSearch

### 14. Network Tab
- [ ] Verificar requisições AJAX
- [ ] `/api/catalog/filter` deve retornar 200
- [ ] `/api/catalog/product/:id` deve retornar 200
- [ ] Imagens devem carregar corretamente

---

## 🐛 Problemas Conhecidos (Não Críticos)

1. **Rate Limiting (429)**: Em testes rápidos, pode aparecer. Normal em ambiente de desenvolvimento.
2. **Imagens 404**: Algumas imagens podem não existir (ex: PVO0005.jpg). Não afeta funcionalidade.
3. **Console Warnings**: Alguns módulos podem não inicializar se elementos não existirem (normal).

---

## ✅ Resultado Esperado

Após validação manual, todas as funcionalidades principais devem estar funcionando:
- ✅ Filtros AJAX
- ✅ Ordenação
- ✅ Busca
- ✅ View modes
- ✅ Quick view
- ✅ GLightbox
- ✅ Lazy loading
- ✅ Mobile responsive

---

## 📝 Notas

- Rate limiting pode causar 429 em testes rápidos (normal)
- Algumas imagens podem não existir (não crítico)
- Console warnings sobre módulos são esperados se elementos não existirem

