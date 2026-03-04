# Documentação do Frontend - Gonzaga's Art & Shine

## 📁 Estrutura de Arquivos

```
public/
├── css/
│   ├── variables.css     # Paleta única (carregar primeiro)
│   ├── main.css          # Estilos principais do site
│   ├── theme.css         # Utilitários, sombras, gradientes
│   ├── dark-luxe.css     # Overrides tema escuro
│   ├── catalog.css       # Catálogo e galeria
│   ├── collections.css   # Página Collections
│   └── admin.css         # Painel administrativo
└── js/
    ├── main.js         # Scripts principais
    └── admin.js        # Scripts do painel administrativo

views/
├── partials/         # Componentes reutilizáveis
│   ├── header.ejs    # Header com pesquisa expandível (ícone → barra ao clicar)
│   ├── footer.ejs
│   └── navigation.ejs
└── pages/
    ├── home.ejs
    ├── collections.ejs  # Página da galeria
    └── admin/          # Páginas do painel administrativo
```

## 🎨 Sistema de Estilos (Modular)

### Carregamento de CSS (ordem)
1. **variables.css** – paleta única (fonte de verdade)
2. **main.css** – base e tipografia
3. **theme.css** – utilitários e sombras
4. **dark-luxe.css** – overrides para tema escuro elegante
5. Páginas específicas: homepage.css, catalog.css, collections.css, etc.

### Paleta (variables.css – sem azul/roxo/violeta)
```css
:root {
  --color-primary: #05070a;      /* Fundo principal */
  --color-secondary: #0b1016;
  --color-tertiary: #121922;
  --color-highlight: #9098a3;    /* Prateado */
  --color-accent: #4b6854;       /* Verde seco */
  --color-accent-alt: #8f846a;   /* Dourado leve */
  --color-text: #f4f6f8;
  --color-text-muted: #aab3bf;
}
```

### Páginas do frontend (main layout)
| Página | Layout | CSS principal |
|-------|--------|----------------|
| Home | main.ejs | variables, main, theme, catalog, dark-luxe |
| Gallery (Collections) | main.ejs | + collections.css |
| Catalog | main.ejs | + catalog.css, catalog-enhanced.css |
| Search Results | standalone | variables, main, catalog, search-results, dark-luxe |

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

## 🔍 Header e Pesquisa

### Pesquisa expandível (mobile + desktop)
O header usa um ícone de pesquisa (lupa) que expande ao clicar:
- **Estado inicial**: ícone compacto
- **Ao clicar**: barra de pesquisa com input e botão fechar
- **Fechar**: ×, clique fora ou Escape

Ficheiros: `views/partials/header.ejs`, `public/css/frontend-mobile.css`

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
Atualizado em: Março de 2025
