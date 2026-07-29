# Gonzaga's Art & Shine - Catálogo Online

Sistema de catálogo dinâmico para a marca **Gonzaga's Art & Shine**, especializada em joalharia de prata esterlina com tendências bali e boho.

## 🌟 Sobre o Projeto

Este é um catálogo online moderno e responsivo desenvolvido para exibir a coleção de joalharia da marca. O sistema inclui:

- **Catálogo Público**: Interface moderna com filtros, pesquisa e visualização de produtos
- **Painel Administrativo**: Gestão completa de produtos, stock, famílias e configurações
- **Sistema de Imagens**: Gestão automática de imagens de produtos
- **Configurações Flexíveis**: Controlo de visibilidade de preços e outras opções do site

## 🚀 Características Principais

### Frontend
- Design moderno com temas escuros, baseados em natureza/floresta
- Nuances psicadélicas e geométricas
- Catálogo responsivo com vista em grelha e lista
- Lazy loading de imagens
- Filtros avançados por família e preço
- Pesquisa em tempo real
- Páginas de detalhes de produtos

### Backend/Admin
- Gestão completa de produtos (CRUD)
- Controlo de stock e rentabilidade
- Gestão de famílias de produtos
- Biblioteca de media
- Configurações do site (ocultar preços, etc.)
- Sistema de autenticação seguro

## 📋 Requisitos

- **Node.js**: 18.x ou superior (produção corre em `node:20-alpine`)
- **MySQL/MariaDB**: 8.0+ ou 10.5+
- **NPM**: 9.x ou superior
- **Docker Compose** (para deployment em produção — ver secção Deployment)

## 🔧 Instalação

### Desenvolvimento Local (WSL/Windows)

```bash
# 1. Clonar o repositório
git clone https://github.com/GGEDeveloper/gartnshine.git
cd gartnshine-2

# 2. Instalar dependências
cd gonzagas_node
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as configurações da base de dados

# 4. Inicializar base de dados
# Ver docs/DATABASE.md para instruções

# 5. Iniciar servidor
npm start
# Ou em modo desenvolvimento:
npm run dev
```

### Acesso

- **Site Público**: http://localhost:3000
- **Catálogo**: http://localhost:3000/catalog
- **Admin Panel**: http://localhost:3000/admin
  - **Utilizador**: `gonzaga`
  - **Password**: `covil`
- **Password do Site**: `0009`

## 📁 Estrutura do Projeto

```
gartnshine-2/
├── gonzagas_node/          # Aplicação Node.js principal
│   ├── config/             # Configurações
│   ├── controllers/        # Controladores
│   ├── models/             # Modelos de dados
│   ├── routes/             # Rotas
│   ├── public/             # Ficheiros estáticos
│   │   ├── css/           # Estilos
│   │   ├── js/            # JavaScript
│   │   └── media/         # Imagens e media
│   ├── views/             # Templates EJS
│   └── scripts/           # Scripts utilitários
├── docs/                   # Documentação
│   ├── old/               # Documentação arquivada/obsoleta
│   └── DATABASE.md
└── README.md              # Este ficheiro
```

## 🚀 Deployment

### Servidor de Produção (waphix — Docker Compose)

A produção **não usa cPanel** (descontinuado). Corre num servidor próprio
("waphix") via Docker Compose: container `artnshine-app` + `mariadb`,
atrás de Nginx Proxy Manager, com DNS Cloudflare/DDNS.

Ver documentação completa em [`gonzagas_node/DEPLOYMENT.md`](gonzagas_node/DEPLOYMENT.md).

Guias antigos de cPanel/dominios.pt (obsoletos, mantidos só como
histórico) estão arquivados em `docs/old/legacy-cpanel-dominios/`.

## 🎨 Design e Temas

- **Tema Base**: Escuro, baseado em natureza/floresta
- **Cores Principais**:
  - Primary: `#1e1e1e` (Preto)
  - Accent: `#6a8c69` (Verde)
  - Highlight: `#b19cd9` (Roxo)
  - Text: `#f0f0f0` (Branco suave)
- **Estilo**: Psicadélico e geométrico

## 📝 Funcionalidades Recentes

### Versão Atual
- ✅ Correção de tamanho dos product cards no catálogo
- ✅ Respeito à configuração `hide_catalog_prices` em todas as páginas
- ✅ Sistema de lazy loading otimizado
- ✅ Documentação de deployment completa
- ✅ Gestão automática de imagens de produtos

## 🔐 Segurança

- Autenticação de administrador
- Password de acesso ao site
- Proteção CSRF
- Sanitização de inputs
- Validação de dados

## 📚 Documentação Adicional

- `docs/DATABASE.md` - Estrutura da base de dados
- `gonzagas_node/DEPLOYMENT.md` - Procedimento de deployment (waphix/Docker)
- `docs/admin-guide.md` - Guia do painel administrativo

## 🛠️ Scripts Disponíveis

```bash
npm start              # Iniciar servidor
npm run dev            # Modo desenvolvimento
npm run images:associate  # Associar imagens aos produtos
npm run images:diagnose   # Diagnosticar problemas de imagens
```

## 📞 Suporte

Para questões ou problemas:
1. Verificar a documentação em `docs/`
2. Verificar logs da aplicação
3. Verificar estado do repositório Git

## 📄 Licença

Este projeto é propriedade de Gonzaga's Art & Shine.

---

**Última atualização**: 2025-01-17  
**Versão**: 1.0.0
