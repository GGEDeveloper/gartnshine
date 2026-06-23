# Módulo Instagram — caso de estudo (Gonzaga's Art & Shine)

Arquitectura modular para integrar **dois mundos** da plataforma Meta:

1. **Instagram Login** (`graph.instagram.com` + token `IG…`) — lista de media do utilizador que autorizou a app.
2. **Instagram Graph API via Facebook** (`graph.facebook.com` + **Page access token**) — comentários, contagens, insights e futuras extensões (moderação, respostas, etc.).

Nenhum token é escrito em `console.log` ou em ficheiros de log neste módulo.

---

## Estrutura de pastas

| Caminho | Função |
|---------|--------|
| `config.js` | Versão da API, hosts, nomes de campos default. |
| `errors.js` | Erros HTTP/Graph normalizados. |
| `http/graphGet.js` | Cliente GET JSON genérico. |
| `clients/instagramLoginClient.js` | `me/media` no host Instagram. |
| `clients/facebookGraphClient.js` | Chamadas `/{ig-media-id}/…` no host Facebook. |
| `services/mediaService.js` | Posts/reels/feed + cache de preview. |
| `services/engagementService.js` | Comentários, resumo de media, insights. |
| `services/capabilities.js` | O que o `.env` actual permite. |
| `routes/api.js` | Router Express montado em `/api/instagram`. |
| `index.js` | Fachada pública do módulo + re-exports. |

O ficheiro legado [`services/instagram.js`](../../services/instagram.js) re-exporta este módulo para não partir rotas existentes (`/instagram`, `/instagram-preview`).

---

## Variáveis de ambiente

### Já em uso (Instagram Login)

```env
INSTAGRAM_ACCESS_TOKEN=IG...
INSTAGRAM_USER_ID=178414...   # ID profissional; útil para Graph Facebook e documentação
```

Opcional:

```env
INSTAGRAM_GRAPH_VERSION=v22.0
```

### Graph API (Facebook) — para comentários, likes count, insights

Conta **Instagram Business/Creator** ligada a uma **Página Facebook**, app no [Meta for Developers](https://developers.facebook.com/), com permissões revistas quando exigido.

```env
# Token de página com acesso ao Instagram (nome aceite pelo módulo)
FACEBOOK_PAGE_ACCESS_TOKEN=...
# ou alias:
# INSTAGRAM_PAGE_ACCESS_TOKEN=...

# Opcional: campos extra no GET /{id} (likes, comentários, etc.)
# INSTAGRAM_FB_MEDIA_FIELDS=like_count,comments_count,is_comment_enabled,permalink,media_type

# Opcional: métricas default para insights (exemplo)
# INSTAGRAM_DEFAULT_INSIGHT_METRICS=engagement,impressions,reach
```

**Importante:** o token `IG…` do Instagram Login **não** substitui o Page token no `graph.facebook.com`. São fluxos diferentes.

---

## API REST (caso de estudo)

Montagem em [`app.js`](../../app.js):

```js
app.use('/api/instagram', require('./modules/instagram').routes);
```

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/instagram/capabilities` | JSON com o que está configurado e limites. |
| GET | `/api/instagram/media/:id/comments?limit=25` | Comentários (máx. 50). Requer Page token + permissões. |
| GET | `/api/instagram/media/:id/summary?fields=…` | Nó IG Media (ex.: `like_count`, `comments_count`). |
| GET | `/api/instagram/media/:id/insights?metrics=engagement,impressions` | Insights (métricas válidas dependem do tipo de post). |

Respostas de erro das rotas: `{ ok: false, code, message }`. Código `FB_NO_PAGE_TOKEN` → HTTP 503 (funcionalidade indisponível).

Em **produção**, protege estas rotas (sessão admin, API key, ou remover rotas públicas).

### Composição (só Node, sem rota dedicada)

`enrichMediaWithEngagement(posts)` — junta cada item de `me/media` com `GET /{id}` (likes, comentários, …) em lotes; ver `services/composerService.js`.

---

## Limites e expectativas (Meta)

- **Comentários:** até 50 por pedido; paginação `paging`; regras especiais para live; replies via expansão de campo.
- **“Reações” tipo Facebook** não existem no feed Instagram da mesma forma; há **gostos** e interacções na app — o que a API expõe depende do produto e da revisão.
- **Insights:** nem todas as métricas aplicam a todos os tipos de media; erros 400 com mensagens Meta são normais durante experimentação.
- **URLs `media_url`:** podem expirar; o permalink no Instagram continua válido para o utilizador.

---

## Extensões futuras (mantendo o módulo)

1. `clients/facebookGraphClient.js` — novos métodos (`hideComment`, `reply`, webhooks).
2. `services/engagementService.js` — orquestração + cache Redis opcional.
3. `routes/webhooks.js` — sub-router para `X-Hub-Signature` e eventos em tempo real.
4. `services/syncService.js` — persistir posts em MariaDB para catálogo offline.

---

## Uso no código Node

```js
const instagram = require('./modules/instagram');

const caps = instagram.getCapabilities();
const posts = await instagram.fetchInstagramPosts(8);
const comments = await instagram.fetchCommentsForMedia('MEDIA_ID', { limit: 10 });
const enriched = await instagram.enrichMediaWithEngagement(posts, { concurrency: 2 });
```

---

## Referências

- [Instagram Platform](https://developers.facebook.com/docs/instagram-platform/)
- [IG Media comments](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/comments)
- [Instagram Login](https://developers.facebook.com/docs/instagram-basic-display-api/) (evolução / produtos relacionados)
