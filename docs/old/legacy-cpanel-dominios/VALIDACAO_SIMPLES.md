# ✅ GUIA SIMPLES DE VALIDAÇÃO - Página Catálogo

**URL**: `http://localhost:3000/catalog`  
**Login de Teste**: miguelmelo70@gmail.com / 2585

---

## 🎯 TESTES RÁPIDOS (5 minutos)

### 1️⃣ **Página Carrega** ✅
- [ ] Abrir `http://localhost:3000/catalog`
- [ ] Verificar se produtos aparecem
- [ ] Verificar se não há erros no console (F12)

### 2️⃣ **Filtros Funcionam** ✅
- [ ] Clicar em uma família (ex: "Anéis")
- [ ] Verificar se produtos mudam sem recarregar página
- [ ] Verificar se contador de resultados atualiza

### 3️⃣ **Ordenação Funciona** ✅
- [ ] Mudar ordenação no dropdown (ex: "Preço: Menor para Maior")
- [ ] Verificar se produtos reordenam
- [ ] Verificar se URL muda

### 4️⃣ **Busca Funciona** ✅
- [ ] Digitar algo na busca (ex: "PAN0001")
- [ ] Verificar se produtos filtram
- [ ] Limpar busca e verificar se volta ao normal

### 5️⃣ **Quick View Funciona** ✅
- [ ] Clicar em "Ver Rápido" em um produto
- [ ] Verificar se modal abre com detalhes
- [ ] Fechar modal (X ou clicar fora)

### 6️⃣ **View Modes Funcionam** ✅
- [ ] Clicar no botão de lista (ícone de lista)
- [ ] Verificar se layout muda para lista
- [ ] Clicar no botão de grid (ícone de grid)
- [ ] Verificar se volta para grid

### 7️⃣ **Lazy Loading Funciona** ✅
- [ ] Rolar página para baixo
- [ ] Verificar se imagens carregam conforme aparecem
- [ ] Verificar se não há "quebras" visuais

### 8️⃣ **Mobile Funciona** ✅
- [ ] Redimensionar janela para mobile (< 768px)
- [ ] Clicar no botão "Filtros" (menu hamburger)
- [ ] Verificar se sidebar abre
- [ ] Fechar sidebar

---

## 🔍 TESTES DETALHADOS (10 minutos)

### **Teste 1: Filtros Combinados**
1. Selecionar família "Anéis"
2. Selecionar faixa de preço "€10 - €20"
3. Verificar se apenas produtos que correspondem aparecem
4. Clicar em "Limpar Filtros"
5. Verificar se todos os produtos voltam

### **Teste 2: Ordenação + Filtros**
1. Filtrar por família "Anéis"
2. Ordenar por "Preço: Maior para Menor"
3. Verificar se produtos estão ordenados corretamente
4. Verificar se filtro permanece ativo

### **Teste 3: Busca + Filtros**
1. Buscar "PAN"
2. Filtrar por família "Anéis"
3. Verificar se resultados combinam ambos
4. Limpar busca
5. Verificar se filtro permanece

### **Teste 4: Quick View Completo**
1. Abrir quick view de um produto
2. Verificar se imagem aparece
3. Verificar se preço aparece
4. Verificar se descrição aparece
5. Clicar em "Ver Detalhes Completos"
6. Verificar se redireciona para página do produto

### **Teste 5: Navegação**
1. Aplicar filtros
2. Ordenar produtos
3. Copiar URL
4. Abrir URL em nova aba
5. Verificar se filtros e ordenação estão aplicados

---

## ⚠️ PROBLEMAS COMUNS

### **Se filtros não funcionam:**
- Verificar console (F12) para erros
- Verificar se API está respondendo: `http://localhost:3000/api/catalog/filter?families=1`

### **Se quick view não abre:**
- Verificar se Bootstrap JS está carregado
- Verificar console para erros
- Tentar clicar diretamente no botão "Ver Rápido"

### **Se imagens não carregam:**
- Verificar se servidor está rodando
- Verificar se imagens existem em `/media/`
- Verificar console para erros 404

### **Se layout quebra:**
- Verificar se CSS está carregado (`catalog-enhanced.css`)
- Verificar se não há conflitos de CSS
- Limpar cache do navegador (Ctrl+Shift+R)

---

## ✅ CHECKLIST FINAL

Antes de aprovar, verificar:

- [ ] Todos os testes rápidos passaram
- [ ] Console não tem erros críticos (apenas warnings OK)
- [ ] Performance está aceitável (< 5 segundos para carregar)
- [ ] Mobile funciona corretamente
- [ ] Todas as funcionalidades estão responsivas

---

## 📝 O QUE REPORTAR

Se encontrar problemas, reportar:

1. **O que estava a fazer** (ex: "Aplicar filtro de família")
2. **O que esperava** (ex: "Produtos deveriam filtrar")
3. **O que aconteceu** (ex: "Página recarregou completamente")
4. **Erros no console** (copiar mensagens de erro)
5. **Screenshot** (se possível)

---

## 🚀 APÓS VALIDAÇÃO

Se tudo estiver OK:

1. ✅ Confirmar que está tudo funcional
2. ✅ Pedir para fazer commit e push
3. ✅ Pedir para fazer merge para main

---

**Tempo Estimado**: 15 minutos  
**Dificuldade**: Fácil  
**Resultado Esperado**: Todas as funcionalidades funcionando perfeitamente

