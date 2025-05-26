# Documentação do Frontend - Gonzaga's Art & Shine

## 📁 Estrutura de Arquivos

```
public/
├── css/
│   ├── main.css          # Estilos principais do site
│   ├── admin.css        # Estilos do painel administrativo
│   └── theme.css        # Variáveis de tema e estilos globais
└── js/
    ├── main.js         # Scripts principais
    └── admin.js        # Scripts do painel administrativo

views/
├── partials/         # Componentes reutilizáveis
│   ├── header.ejs
│   ├── footer.ejs
│   └── navigation.ejs
└── pages/
    ├── home.ejs
    ├── collections.ejs  # Página da galeria
    └── admin/          # Páginas do painel administrativo
```

## 🎨 Sistema de Estilos

### Cores Principais
```css
:root {
  --color-primary: #1e1e1e;      /* Cor de fundo principal */
  --color-secondary: #4a3c2d;   /* Cor de destaque */
  --color-accent: #6a8c69;      /* Cor de realce */
  --color-text: #f0f0f0;        /* Cor do texto principal */
  --color-highlight: #b19cd9;   /* Cor de destaque secundária */
}
```

### Tipografia
- **Títulos**: 'Playfair Display', serif
- **Corpo do texto**: 'Poppins', sans-serif

### Breakpoints
- `1200px`: Desktop grande
- `1024px`: Desktop
- `768px`: Tablet
- `576px`: Mobile
- `480px`: Mobile pequeno

## 🖼️ Galeria de Imagens

### Estrutura HTML
```html
<div class="gallery-grid">
  <div class="gallery-item">
    <div class="gallery-image-container">
      <img src="caminho/para/imagem.jpg" alt="Descrição" class="gallery-image">
    </div>
  </div>
</div>
```

### Estilos da Galeria
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.gallery-item {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  max-width: 300px;
  margin: 0 auto;
}

.gallery-image-container {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
}

.gallery-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
```

## 🔄 Como Adicionar Novas Páginas

1. Crie um novo arquivo `.ejs` na pasta `views/pages/`
2. Utilize a estrutura base:

```ejs
<%- include('../partials/header', { title: 'Título da Página' }) %>

<main class="page-content">
  <!-- Conteúdo da página aqui -->
</main>

<%- include('../partials/footer') %>
```

## 🛠️ Solução de Problemas Comuns

### Imagens não carregando
1. Verifique o caminho das imagens
2. Certifique-se de que os arquivos existem no diretório `public/media/`
3. Verifique as permissões do diretório

### Estilos não sendo aplicados
1. Limpe o cache do navegador (Ctrl+F5)
2. Verifique se há erros no console do navegador (F12 > Console)
3. Confirme se o arquivo CSS está sendo carregado corretamente

## 📱 Responsividade

### Media Queries
```css
/* Tablet */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
```

## 🎯 Boas Práticas

1. **Organização**
   - Mantenha os estilos relacionados juntos
   - Use nomes descritivos para classes
   - Comente seções complexas

2. **Performance**
   - Otimize imagens antes de fazer upload
   - Use sprites para ícones
   - Minifique arquivos CSS/JS em produção

3. **Acessibilidade**
   - Sempre use `alt` em imagens
   - Mantenha um bom contraste de cores
   - Use tags semânticas (header, nav, main, footer)

## 📝 Próximos Passos

1. Implementar carregamento lazy para imagens
2. Adicionar animações de transição entre páginas
3. Otimizar para SEO
4. Implementar modo escuro/claro

## 📞 Suporte
Para problemas ou dúvidas, entre em contato com a equipe de desenvolvimento.

---
Atualizado em: Maio de 2025
