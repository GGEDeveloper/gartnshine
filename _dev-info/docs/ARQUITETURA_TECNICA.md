# Arquitetura Técnica - Gonzaga's Art & Shine

**Última atualização:** 2025-02-11

## 1. Visão Geral

Sistema web monolítico em Node.js + Express com:
- **Frontend público** (cliente): catálogo, home, galeria
- **Backend administrativo**: gestão de produtos, inventário, configurações
- **Base de dados:** MariaDB/MySQL
- **Template engine:** EJS com express-ejs-layouts

## 2. Fluxo de Request

```
Cliente → Express → Middleware (session, siteSettings, families) → Router → Controller → Model → DB
                                                                                    ↓
                                                                              View (EJS) → HTML
```

## 3. Estrutura de Pastas

```
gonzagas_node/
├── app.js                  # Configuração Express, middleware, rotas
├── server.js               # Inicialização HTTP
├── config/
│   ├── config.js           # Configurações gerais
│   ├── database.js         # Pool MySQL
│   ├── view.js             # Layouts (admin vs public)
│   └── admin-panel.js      # Menu admin
├── controllers/            # Lógica de negócio
├── models/                 # Acesso a dados (Product, ProductFamily, etc.)
├── routes/                 # Definição de rotas
│   ├── index.js            # Rotas públicas (/)
│   ├── admin.js            # Rotas admin (/admin)
│   ├── api.js              # API REST (/api)
│   └── admin/              # Sub-rotas admin (settings, media, analytics)
├── middleware/             # Auth, cookie consent, etc.
├── views/                  # Templates EJS
│   ├── layouts/            # main.ejs (público)
│   ├── admin/layouts/      # main.ejs (admin)
│   ├── partials/           # header, footer, etc.
│   └── public/             # catalog.ejs
└── public/                 # Static + JS + CSS + media
```

## 4. Layouts (View Engine)

| Rota | Layout | Uso |
|------|--------|-----|
| `/admin/*` | `admin/layouts/main` | Sidebar, topbar, Bootstrap admin |
| Resto | `layouts/main` | Header público, footer, tema escuro |

Definido em `app.js`:
```javascript
if (req.path.startsWith('/admin')) {
  res.locals.layout = viewConfig.layouts.admin.default;
} else {
  res.locals.layout = viewConfig.layouts.public.default;
}
```

## 5. Middleware Global (Ordem)

1. **compression** – compressão gzip
2. **helmet** – headers de segurança
3. **rateLimit** – limite de requests (admin: 200, api: 100, público: 300)
4. **express.json**, **urlencoded**, **cookieParser**
5. **session** – express-session
6. **flash** – mensagens flash
7. **cookieConsentMiddleware**
8. **Variáveis globais** – res.locals.app, messages, user
9. **SiteSettings** – carrega site_settings da BD (catalog_page_enabled, hide_catalog_prices, etc.)
10. **ProductFamily.getAll** – carrega famílias para menu de navegação
11. **Static files** – public/, media/
12. **Routers** – static, index, admin, api, etc.

## 6. Base de Dados

- **Pool:** mysql2 (config/database.js)
- **Variáveis:** DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- **Tabelas principais:** products, product_families, product_images, users, site_settings, etc.

## 7. Sessão

- **Store:** memória (express-session)
- **Admin:** req.session.user = { id, name, email, role }
- **Site:** req.session.siteAccess (password do site - não activo)

## 8. Segurança

- **Helmet** – CSP, XSS, etc.
- **Rate limiting** – por tipo de rota
- **Admin:** adminSessionRequired (verifica req.session.user)
- **CORS** – config.baseUrl
