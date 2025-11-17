# Changelog - Gonzaga's Art & Shine

Todas as alterações notáveis neste projeto serão documentadas neste ficheiro.

## [1.0.0] - 2025-01-17

### ✨ Adicionado
- Sistema completo de catálogo online
- Painel administrativo para gestão de produtos
- Sistema de configurações do site (ocultar preços, etc.)
- Documentação completa de deployment
- Scripts para gestão de imagens de produtos
- Sistema de lazy loading otimizado para imagens
- Filtros avançados no catálogo (família, preço)
- Pesquisa em tempo real
- Vista em grelha e lista

### 🔧 Corrigido
- Product cards ocupando 2 slots no grid (corrigido)
- Tamanho inconsistente dos product cards (corrigido)
- Preços a aparecer mesmo quando configurado para ocultar (corrigido)
- Problemas de carregamento de imagens no catálogo (corrigido)
- Layout responsivo dos product cards (melhorado)

### 📝 Documentação
- README.md atualizado com informações completas
- DEPLOYMENT_PROCEDURE.md criado
- DEPLOYMENT_COMMANDS.md criado
- Documentação de resolução de conflitos

### 🎨 Melhorias de Design
- CSS otimizado para product cards consistentes
- Grid layout melhorado com `align-items: stretch`
- Limitação de títulos a 2 linhas
- Melhor gestão de overflow de conteúdo

### 🔒 Segurança
- Sistema de autenticação implementado
- Password de acesso ao site
- Proteção CSRF

---

## Formato

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

### Tipos de Alterações
- `✨ Adicionado` - Novas funcionalidades
- `🔧 Corrigido` - Correções de bugs
- `📝 Documentação` - Alterações na documentação
- `🎨 Melhorias de Design` - Melhorias visuais e de UX
- `🔒 Segurança` - Correções de segurança
- `⚡ Performance` - Melhorias de performance
- `🗑️ Removido` - Funcionalidades removidas
