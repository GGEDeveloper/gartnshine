# Documentação da Área de Coleções (collections)

## 📁 Localização dos Arquivos
- **Template principal:** `views/collections.ejs`
- **Estilos principais:** Inline no próprio EJS e em `/public/css/main.css`
- **Scripts:** Inline no EJS e dependências externas (Lightbox2)

---

## 🖼️ Estrutura da Galeria
A galeria de imagens é renderizada dinamicamente a partir da lista de imagens passada pelo backend (Express/EJS):

```ejs
<% if (images && images.length > 0) { %>
  <div class="gallery-grid">
    <% images.forEach((image, index) => { %>
      <div class="gallery-item">
        <a href="<%= image.url %>" data-lightbox="gallery" data-title="<%= image.filename.replace(/\.[^/.]+$/, '') %>" class="gallery-link">
          <div class="gallery-image-container">
            <img src="<%= image.url %>" alt="<%= image.filename.replace(/\.[^/.]+$/, '') %>" class="gallery-image" loading="lazy">
          </div>
        </a>
      </div>
    <% }); %>
  </div>
<% } else { %>
  <div class="no-images">
    <p>No images found in the gallery.</p>
  </div>
<% } %>
```

- Cada imagem é envolvida por um link `<a>` com atributos do Lightbox2.
- O grid é responsivo e se adapta ao tamanho da tela.

---

## 💡 Como funciona o Lightbox2
- O Lightbox2 é incluído via CDN no `<head>`:
  ```html
  <link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox-plus-jquery.min.js"></script>
  ```
- Ao clicar em qualquer imagem, ela abre em destaque com navegação por setas (próxima/anterior).
- As setas de navegação são garantidas por CSS customizado para ficarem sempre visíveis.
- A legenda exibida é o nome do arquivo (sem extensão).

---

## 🎨 Estilos Importantes
- Os estilos principais do grid e do lightbox estão no próprio arquivo EJS, mas podem ser movidos para um CSS externo para organização.
- Os botões de navegação do lightbox são reforçados via CSS para ficarem sempre visíveis e destacados.

---

## 🛠️ Como editar/adicionar imagens
1. **Adicionar imagens:**
   - Coloque os arquivos de imagem em `/public/media/`.
   - Os formatos suportados são `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`.
2. **Remover imagens:**
   - Basta remover o arquivo da pasta `/public/media/`.
3. **Atualizar a galeria:**
   - Basta atualizar a página, não é necessário reiniciar o servidor.

---

## ⚡ Como personalizar
- **Alterar grid:**
  - Edite a classe `.gallery-grid` para mudar espaçamento, número de colunas ou responsividade.
- **Alterar aparência do lightbox:**
  - Edite o bloco de estilos customizados para `.lb-nav`, `.lb-image`, etc.
- **Alterar legendas:**
  - Modifique o atributo `data-title` no link `<a>`.
- **Adicionar animações:**
  - Use CSS transitions no grid ou nas imagens.

---

## 📝 Dicas rápidas
- Sempre feche corretamente as tags EJS (`<% %>`, `<%= %>`).
- Se der erro de sintaxe, revise os blocos if/else e loops.
- Use `Ctrl+F5` para limpar o cache do navegador ao testar mudanças de CSS/JS.

---

## 🧩 Exemplos de Customização
- **Mostrar nome da imagem abaixo da foto:**
  ```ejs
  <div class="gallery-caption"><%= image.filename.replace(/\.[^/.]+$/, '') %></div>
  ```
- **Adicionar filtro por tipo:**
  - Implemente um dropdown e filtre a lista `images` no backend antes de renderizar.

---

## 📞 Suporte
Para dúvidas ou problemas, contate a equipe de desenvolvimento.

---
Atualizado em: Maio de 2025
