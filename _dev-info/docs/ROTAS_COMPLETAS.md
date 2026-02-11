# Rotas Completas - Mapa do Sistema

**Última atualização:** 2025-02-11

## Registo de Routers (app.js)

```javascript
app.use(staticRouter);      // Primeiro
app.use('/', indexRouter);  // Rotas públicas
app.use('/admin', adminRouter);
app.use(cookieConsentRouter);
app.use(userRightsRouter);
app.use(seoRouter);
app.use('/api', apiRouter);
app.use('/admin', mediaRoutes);    // Admin media
app.use('/admin', analyticsRoutes); // Admin analytics
```

---

## ROTAS PÚBLICAS (Frontend Cliente)

| Método | Rota | Controller/Handler | Descrição |
|--------|------|-------------------|-----------|
| GET | `/` | routes/index | Home (featured, media gallery) |
| GET | `/collections` | routes/index | Galeria de imagens |
| GET | `/collection/:familyId` | routes/index | Produtos por família |
| GET | `/catalog` | CatalogController.displayCatalog | Catálogo principal |
| GET | `/catalog/product/:id` | routes/index (inline) | Detalhe produto + WhatsApp |
| GET | `/catalog/product-v2/:id` | routes/index | Detalhe produto V2 |
| GET | `/product/:id` | ProductController | Under construction |
| GET | `/product/:id/details-uc` | ProductController | Under construction |
| GET | `/search` | routes/index | Resultados de pesquisa |
| GET | `/index-v2` | routes/index | Homepage alternativa |
| GET | `/about` | - | Sobre |
| GET | `/privacy-policy` | - | Política de privacidade |
| GET | `/terms-of-service` | - | Termos de serviço |
| GET | `/api/nav-featured` | routes/index | API produtos em destaque (nav) |
| GET | `/user-rights` | UserRightsController | Direitos do utilizador |
| GET | `/privacy-settings` | CookieConsentController | Definições de cookies |
| GET | `/sitemap.xml` | routes/seo | Sitemap |
| GET | `/robots.txt` | routes/seo | Robots |

---

## ROTAS API (/api)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/products/featured` | Produtos em destaque |
| GET | `/products/family/:familyId` | Produtos por família |
| GET | `/families` | Todas as famílias |
| GET | `/search` | Pesquisa produtos |
| GET | `/search/suggestions` | Sugestões de pesquisa |
| GET | `/catalog/filter` | Filtros AJAX (famílias, preço, search) |
| GET | `/catalog/product/:id` | Produto para quick view |
| POST | `/cookie-consent` | Guardar consentimento cookies |
| GET | `/cookie-consent` | Obter consentimento |
| DELETE | `/cookie-consent` | Revogar consentimento |

**Nota:** Rotas `/api/admin/*` existem em api.js mas exigem autenticação.

---

## ROTAS ADMIN (/admin)

### Autenticação
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin/login` | guestSessionRequired | Formulário login |
| POST | `/admin/login` | guestSessionRequired | Processar login |
| GET | `/admin/logout` | adminSessionRequired | Logout |

### Dashboard
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin` | adminSessionRequired | Dashboard |
| GET | `/admin/dashboard` | adminSessionRequired | Dashboard |
| GET | `/admin/dashboard-v2` | adminSessionRequired | Dashboard V2 |

### Produtos
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin/products` | adminSessionRequired | Lista produtos |
| GET | `/admin/products-v2` | adminSessionRequired | Lista produtos (cards) |
| GET | `/admin/products/add` | adminSessionRequired | Formulário novo |
| POST | `/admin/products/create` | adminSessionRequired + multer | Criar produto |
| GET | `/admin/products/edit/:id` | adminSessionRequired | Formulário editar |
| POST | `/admin/products/edit/:id` | adminSessionRequired + multer | Actualizar produto |
| DELETE | `/admin/products/:id` | adminSessionRequired | Apagar produto |
| DELETE | `/admin/products/:productId/images/:imageId` | adminSessionRequired | Remover imagem |

### Famílias
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin/product-families` | adminSessionRequired | Lista famílias |
| GET | `/admin/product-families/create` | adminSessionRequired | Formulário nova |
| POST | `/admin/product-families/create` | adminSessionRequired | Criar família |
| GET | `/admin/product-families/edit/:id` | adminSessionRequired | Formulário editar |
| POST | `/admin/product-families/edit/:id` | adminSessionRequired | Actualizar família |
| POST | `/admin/product-families/delete/:id` | adminSessionRequired | Apagar família |

### Inventário
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin/inventory` | adminSessionRequired | Lista produtos com stock |
| GET | `/admin/inventory/history/:productId` | adminSessionRequired | Histórico produto |
| POST | `/admin/inventory/adjust` | adminSessionRequired | Ajustar stock |

### Checkpoints
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin/checkpoints` | - | Lista checkpoints |
| POST | `/admin/checkpoints/create` | - | Criar checkpoint |
| POST | `/admin/checkpoints/restore/:id` | - | Restaurar |
| POST | `/admin/checkpoints/delete/:id` | - | Apagar |

### Configurações
| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| GET | `/admin/settings` | adminSessionRequired | Formulário settings |
| POST | `/admin/settings` | adminSessionRequired | Guardar settings |

### Media
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/media/library` | Biblioteca de media |
| GET | `/admin/api/media` | Lista media (API) |
| GET | `/admin/api/media/:id` | Detalhe media |
| POST | `/admin/api/media/upload` | Upload |
| PUT | `/admin/api/media/:id` | Actualizar metadata |
| DELETE | `/admin/api/media/:id` | Apagar |
| GET | `/admin/api/media/folders` | Pastas |
| GET | `/admin/api/media/tags` | Tags |

### Analytics
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/analytics/dashboard` | Dashboard analytics |
| GET | `/admin/api/analytics/dashboard` | Dados dashboard |
| GET | `/admin/api/analytics/product/:id` | Performance produto |
| POST | `/admin/api/analytics/track` | Tracking evento |
| GET | `/admin/api/analytics/export/dashboard` | Export CSV |

### Outros Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/upload/image` | Upload imagem Summernote |
| GET | `/admin/test-route` | Teste |

---

## Rotas NÃO Montadas (Existentes mas não usadas)

- `routes/admin/index.js` – router modular alternativo
- `routes/admin/products.js` – usa Sequelize/DataTables (modelo Product é raw SQL)
