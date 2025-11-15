# Relatório de Problemas - Funcionalidade de Zoom na Página Admin/Products

**Data:** 2025-11-14  
**Página Testada:** `http://localhost:3000/admin/products`  
**Funcionalidade:** Zoom de imagens de produtos (lupa)

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Script de Zoom NÃO está sendo carregado**
- **Status:** ❌ CRÍTICO
- **Descrição:** O script de zoom (`imageZoomModal`) não está sendo extraído e renderizado pelo `express-ejs-layouts`
- **Evidência:**
  - Script está presente no arquivo `gonzagas_node/views/admin/products/index.ejs` (linhas 319-488)
  - Mas não aparece no HTML renderizado
  - `scriptsWithZoom: 0` quando testado no navegador
- **Causa Provável:** 
  - O `express-ejs-layouts` com `extractScripts: true` pode não estar extraindo scripts que estão no final do template
  - O layout espera `scripts` (plural) mas pode estar usando `script` (singular)
- **Localização:**
  - Arquivo: `gonzagas_node/views/admin/products/index.ejs` (linha 319)
  - Layout: `gonzagas_node/views/admin/layouts/main.ejs` (linha 143-144)

### 2. **Erro de Tabela `cookie_consents` não existe**
- **Status:** ⚠️ WARNING (não bloqueia funcionalidade)
- **Descrição:** Tabela `cookie_consents` não existe no banco de dados
- **Erro:**
  ```
  Error: Table 'artnshin_gonzagas_db.cookie_consents' doesn't exist
  ```
- **Impacto:** Logs de erro a cada requisição, mas não bloqueia funcionalidade
- **Localização:** `gonzagas_node/middleware/cookieConsent.js`

### 3. **Arquivo CSS `admin-mobile.css` não encontrado (404)**
- **Status:** ⚠️ WARNING
- **Descrição:** Arquivo `/css/admin-mobile.css` retorna 404
- **Erro:**
  ```
  GET /css/admin-mobile.css 404
  Refused to apply style from 'http://localhost:3000/css/admin-mobile.css' because its MIME type ('text/html') is not a supported stylesheet MIME type
  ```
- **Impacto:** Estilos mobile podem não estar sendo aplicados corretamente
- **Localização:** Referenciado em algum layout ou view

---

## ✅ ELEMENTOS CORRETOS

1. **HTML das Imagens está correto:**
   - Wrappers `.product-image-zoom-wrapper` estão presentes
   - Atributos `data-zoom-src` e `data-product-name` estão corretos
   - CSS de hover está funcionando (cursor: pointer)

2. **CSS de Zoom está presente:**
   - Estilos para `.image-zoom-modal` estão no template
   - Estilos para `.product-image-zoom-wrapper` estão corretos

3. **Estrutura do Script está correta:**
   - Função `createImageZoomModal()` está implementada
   - Event handlers estão configurados
   - Integração com DataTables está presente

---

## 🔧 SOLUÇÕES PROPOSTAS

### Solução 1: Forçar renderização do script diretamente no layout
**Problema:** `express-ejs-layouts` pode não estar extraindo scripts corretamente

**Solução:** Mover o script para ser renderizado diretamente no final do template, antes do fechamento do body, ou usar uma abordagem diferente.

**Opção A:** Usar `contentFor` ou `block` do express-ejs-layouts:
```ejs
<% block('scripts', () => { %>
  <script>
    // código do zoom
  </script>
<% }) %>
```

**Opção B:** Passar script via `locals` no controller:
```javascript
res.render('admin/products/index', {
  // ... outros dados
  script: '<script>/* código do zoom */</script>'
});
```

**Opção C:** Incluir script diretamente no final do template (fora do layout extraction):
```ejs
<!-- No final de index.ejs, antes de qualquer fechamento -->
<script>
  // código do zoom aqui
</script>
```

### Solução 2: Criar tabela `cookie_consents`
```sql
CREATE TABLE IF NOT EXISTS cookie_consents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id)
);
```

### Solução 3: Remover ou criar arquivo `admin-mobile.css`
- Opção A: Criar arquivo vazio em `public/css/admin-mobile.css`
- Opção B: Remover referência ao arquivo do layout

---

## 📊 TESTES REALIZADOS

1. ✅ Servidor iniciado com sucesso
2. ✅ Página `/admin/login` carrega corretamente
3. ❌ Login não está funcionando (redireciona de volta)
4. ❌ Script de zoom não está presente no HTML renderizado
5. ✅ HTML das imagens está correto
6. ✅ CSS de zoom está presente no template

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **PRIORIDADE ALTA:** Corrigir carregamento do script de zoom
   - Testar Opção A (block/contentFor)
   - Se não funcionar, usar Opção B (via locals)
   - Como último recurso, Opção C (script direto)

2. **PRIORIDADE MÉDIA:** Corrigir erro de `cookie_consents`
   - Criar migration ou tabela manualmente

3. **PRIORIDADE BAIXA:** Corrigir 404 do `admin-mobile.css`
   - Criar arquivo ou remover referência

---

## 📝 NOTAS TÉCNICAS

- **express-ejs-layouts versão:** 2.5.1
- **Configuração atual:** `extractScripts: true`
- **Layout usado:** `admin/layouts/main`
- **Variável esperada no layout:** `scripts` (plural) e `script` (singular)

---

**Relatório gerado automaticamente durante testes de funcionalidade**

