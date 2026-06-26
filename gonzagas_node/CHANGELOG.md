# Changelog - Gonzaga's Art & Shine

## [2026-06-26] - Admin: escolher imagem de fundo do Hero da homepage

### ✨ **Nova funcionalidade**
- Antes: a imagem de fundo do hero era sempre a primeira imagem (por ordem do sistema de ficheiros, não controlável) encontrada em `public/media/gallery/`, sem nenhuma forma de o admin escolher ou ver qual estava em uso.
- Agora, em **Admin → Settings → Imagem de fundo do Hero**:
  - Mostra a imagem **atualmente em uso** (com preview), incluindo quando é o fallback automático.
  - Permite **escolher** qualquer imagem já existente na galeria (grid de thumbnails, clicar e gravar).
  - Permite **enviar uma imagem nova** diretamente para usar como hero (fica também disponível na galeria geral).
  - Botão para **voltar ao automático** (limpa a escolha, volta ao comportamento antigo).
- Nova coluna `site_settings.hero_image` (`sql/add_hero_image.sql`, idempotente). `NULL` = fallback automático (comportamento antigo preservado).
- Se a imagem escolhida deixar de existir em disco (apagada manualmente), `routes/index.js` deteta e cai automaticamente no fallback em vez de mostrar uma imagem partida.

### ✅ **Validado**
- `SiteSettings.updateHeroImage()` testado contra BD local: define, lê e repõe a `NULL` corretamente.
- Lógica de fallback de `routes/index.js` replicada e testada isoladamente: escolha explícita é respeitada; se apontar para um ficheiro inexistente, cai para a primeira imagem da galeria.
- View `settings-form.ejs` renderizada via `ejs.renderFile` em 3 cenários (sem escolha, com escolha, galeria vazia) sem erros.

---

## [2026-06-25] - Imagens de produto: backfill, fluxo mais robusto e fix no script

### ✅ **Backfill corrido contra a BD local**
- `node scripts/generate-product-image-variants.js`: **301 imagens já tinham todas as variantes, 0 precisaram de ser processadas, 42 falharam** — todas as 42 falhas são `Original não encontrado`, dos 18 produtos `LTG...` criados em 2026-04-01 (antes da feature de tratamento de imagens existir, introduzida a 2026-06-23). Os ficheiros originais desses produtos nunca foram comitados ao git (confirmado via `git log --all`) — não existem neste ambiente. **Para corrigir, é necessário correr o mesmo script diretamente no servidor de produção (waphix)**, onde os originais podem realmente existir em disco.

### 🐛 **Falha no processamento de imagem ficava invisível**
- `processProductImage()` já era chamado em todos os pontos de upload (`ProductController.store/update`, `QuickProductController.store`), mas se o Sharp/Jimp falhasse a gerar uma variante, o produto gravava-se sem mais nada — a falha só ficava num `console.warn` nos logs do servidor, que ninguém via. Agora os três pontos de upload recolhem os ficheiros que falharam e mostram um `flash error_msg` ao admin ("Produto criado/atualizado, mas falhou o processamento de N imagem(ns)...") para ele saber que precisa de re-enviar essa imagem.

### 🐛 **Script de backfill nunca terminava por si só**
- `config/database.js` mantém um `setInterval` de health-check da BD vivo para sempre; o script chamava `pool.end()` no fim mas nunca `process.exit()`, por isso o processo Node ficava "pendurado" indefinidamente (a tentar usar o pool já fechado a cada intervalo) mesmo depois de imprimir "Concluído" — parecia preso quando na realidade já tinha terminado o trabalho. Adicionado `process.exit()` explícito no `finally`.

### 📖 **Documentação**
- README.md: nova secção "Imagens de produto" a documentar o pipeline, o script de backfill, e o comportamento em caso de falha.

---

## [2026-06-25] - Hambúrguer mobile, stock nos destaques, retomar pagamento Stripe

### 🎨 **Hambúrguer continuava cortado em telemóveis pequenos**
- A correção anterior (logo com ellipsis) era insuficiente: `.header-account-nav` (ícone "Conta"/botão "Criar conta", em `brand-showcase.css`, sem media query mobile e com `flex-shrink: 0`) continuava a ocupar ~50-80px fixos no header, excedendo a largura disponível em ecrãs de 320-360px e cortando o hambúrguer (último item flex, dentro de `.header-container` com `overflow-x: hidden`). Os mesmos links de conta já existem na gaveta do menu mobile (`accountNavContext="mobile"`), por isso `.header-account-nav` passa a `display: none !important` em `≤768px` — sem perda de funcionalidade.

### 🐛 **Produtos sem stock apareciam nos destaques mesmo com a setting ativa**
- A setting `hide_out_of_stock` (admin) já era respeitada no catálogo (`services/catalogQueryService.js`) mas não no carrossel de destaques da homepage, na API `/api/products/featured`, no preview `/api/nav-featured`, nem nos "produtos relacionados" mostrados quando um produto está esgotado. `Product.getFeatured()` passou a aceitar um segundo parâmetro `hideOutOfStock`, aplicado em todos estes pontos.

### 🐛 **Encomenda ficava "bloqueada" se o pagamento na Stripe falhasse e o cliente voltasse**
- O carrinho é limpo logo após a encomenda ser criada (`pending`/`pending`), **antes** de se saber se o pagamento na Stripe vai correr bem. Se o cliente tivesse um erro (cartão recusado, cancelou, ou usou o botão "voltar" do browser), `GET /checkout` via o carrinho vazio e mandava-o sempre para `/cart`, sem rasto da encomenda nem forma de retomar o pagamento.
- Agora: `GET /checkout` com carrinho vazio procura uma encomenda `pending`/`pending` associada à mesma sessão de carrinho (`Order.findPendingByCartSession`) e, se existir, mostra a página de cancelamento com a encomenda e um botão **"Pagar agora"**.
- Novo: `GET /checkout/retry/:orderNumber` gera uma nova sessão de checkout da Stripe para uma encomenda já criada (sem a recriar) e redireciona para lá. Se a encomenda já não estiver pendente (paga, cancelada ou expirada pelo cron de 30 min) ou a Stripe não estiver configurada, mostra mensagem de erro em vez de rebentar.

### ✅ **Validado**
- `Product.getFeatured(null, true)` testado contra BD local: 10 destaques → 3 com stock, nenhum com `current_stock <= 0`.
- Fluxo de retomar pagamento testado contra BD local: encomenda criada, carrinho limpo, `findPendingByCartSession` encontra a encomenda correta para retomar.

---

## [2026-06-25] - Checkout/Stripe: transações, webhook, IVA e portes

### 🐛 **Checkout e fulfillment partidos**
- `checkoutService.submitCheckout` chamava `pool.beginTransaction()` — método que não existe no `pool` (só em connections de `pool.getConnection()`) — o checkout falhava sempre. Corrigido para `getConnection()`/`beginTransaction()`/`commit()`/`rollback()`/`release()`.
- `orderFulfillmentService.fulfillPaidOrder` (chamado pelo webhook da Stripe) corria sem transação própria — o `SELECT ... FOR UPDATE` não bloqueava nada, risco de duplo processamento em retries da Stripe. Agora abre a sua própria transação.
- `Order.createFromCheckout` lia a order recém-criada com uma connection diferente da transação aberta, antes do `commit()` — devolvia `null` e rebentava o checkout. Corrigido para reutilizar a connection da transação.
- `inventoryAdapter` enviava `created_by: 'ecommerce'` (string) para uma coluna `int` — erro SQL sempre que um pagamento era confirmado. Corrigido para `NULL`.

### 🐛 **Webhook da Stripe nunca verificava a assinatura**
- `express.json()` global em `app.js` corria **antes** da rota `/webhooks/stripe` ser montada — o corpo chegava já parseado/consumido, e `stripe.webhooks.constructEvent` falhava sempre a verificação de assinatura. A rota do webhook passou a ser montada com `express.raw()` explicitamente **antes** do `express.json()` global (`modules/payments.mountWebhookRoute(app)`).

### 🐛 **Stripe cobrava sem IVA**
- `createCheckoutSession` enviava `item.base_price` (preço sem IVA) como valor da linha, sem `automatic_tax`/`tax_rates` configurado na sessão — o cliente era cobrado ~23% menos do que o total mostrado no checkout. Corrigido para enviar o preço **com IVA** (`unit_price`, ou `base_price * (1 + tax_rate)` quando `prices_include_tax = false`).

### 🐛 **Preço de envio no checkout não refletia a admin**
- O rádio de seleção de método de envio mostrava `shipping_methods.price` (valor estático da migração, nunca atualizado), enquanto o resumo de totais já usava o override de `ecommerce_settings.standard_shipping_cost`/`express_shipping_cost`. `shippingService.getActiveMethods(settings)` passou a aplicar o mesmo override antes de devolver os métodos à view.

### 🐛 **Carrossel de destaques na homepage não abria o produto**
- O link da imagem no carrossel "destaques" apontava para `/catalog?family=...` (catálogo da família), nunca para a página de detalhe do produto. Corrigido para `/catalog/product/:slug`.

### 🎨 **Hambúrguer cortado em ecrãs mobile pequenos**
- `.logo-container` com `flex-shrink: 0` mantinha a largura total do título, e combinado com `overflow-x: hidden` no `.header-container`, em ecrãs muito estreitos o hambúrguer (último item flex) ficava cortado. Logo passa a encolher com `text-overflow: ellipsis` em mobile.

### ✅ **Validado**
- Smoke test manual contra BD local: checkout cria order sem debitar stock prematuramente; pagamento confirma e debita stock; reenvio do webhook é idempotente; race condition de stock faz rollback sem order órfã; 5 checkouts sequenciais não esgotam o pool (`connectionLimit: 3`); valor calculado para a Stripe coincide com `order.total_amount`; preço de envio no checkout reflete alteração em tempo real na admin.

---

## [2026-06-23] - Fix crítico: cache "immutable" impedia que redeploys chegassem aos browsers

### 🐛 **Causa raiz: botão da sidebar "não funcionava" após redeploy em produção**
- `app.locals.app.version`, usado para cache-busting (`?v=...`) nos CSS/JS, estava **fixo em `'1.0.0'` em produção** — nunca mudava entre deploys, a menos que alguém bombasse manualmente a env var `APP_VERSION`
- Combinado com `Cache-Control: public, max-age=604800, immutable` (1 semana, sem revalidação) nos ficheiros estáticos em produção, isto significa que **qualquer browser que já tivesse visitado o admin ficava preso à versão antiga de `admin.js`/CSS por até 7 dias após um redeploy** — o botão da sidebar continuava a correr a lógica antiga (das versões anteriores a este trabalho) mesmo depois do código novo estar no servidor
- O layout do admin (`views/admin/layouts/main.ejs`) nem usava `?v=` nos seus `<link>`/`<script>` locais — único entre os layouts do site, o público (`views/layouts/main.ejs`) já tinha esse cache-busting (também afectado pelo mesmo `app.version` estático)
- **Suspeita**: este é provavelmente a causa de fundo de várias correções documentadas neste changelog que "não pareciam aplicar-se" após deploy, ao longo do histórico do projecto

### ✅ **Correção**
- `app.version` passa a usar um carimbo temporal gerado no arranque do processo (`Date.now()` calculado uma vez, fora do request handler) em **todos** os ambientes — cada deploy/restart do servidor gera uma versão nova automaticamente, sem intervenção manual; `APP_VERSION` (env) continua a poder fixar um valor manualmente se algum dia for necessário
- Adicionado `?v=<%= app.version %>` a todos os `<link>`/`<script>` locais do layout do admin (antes sem nenhum cache-busting)

### ✅ **Validado**
- Arranque em `NODE_ENV=production`: confirmado que `admin.js` e todos os CSS do admin são pedidos com `?v=<timestamp do arranque>`, apesar de continuarem a ser servidos com `Cache-Control: ... immutable`
- Sidebar (colapsar/expandir, gaveta mobile) testada de novo em modo produção — funciona

---

## [2026-06-23] - Admin: slider de tamanho de imagem na lista de Produtos

### 🖼️ **Tamanho da miniatura ajustável (só nesta página)**
- Novo slider "Tamanho da imagem" acima da tabela de Produtos (32px–160px), ajusta a miniatura da coluna "Imagem" e, por consequência, a altura da linha — útil para inspecionar imagens com mais detalhe sem abrir o zoom
- Estado persistido em `localStorage` (`admin-products-image-size`), aplicado via variável CSS `--products-img-size` escopada a `#products-table-wrapper`
- Removido tamanho fixo (50px inline, e um override de 40px só em ecrãs <992px) que antes ignorava qualquer tentativa de ajuste

### ✅ **Validado**
- Slider testado via Puppeteer: arrastar para 160px redimensiona a miniatura e a linha; estado sobrevive a reload da página
- `npm run validate:catalog` — OK (328 produtos)

---

## [2026-06-23] - Admin: sidebar colapsável + navegação melhorada na edição de produtos

### 🗂️ **Sidebar: gaveta colapsável em qualquer tamanho de ecrã**
- **Causa**: existiam **4 scripts diferentes** a competir pelo mesmo botão de toggle (`admin.js`, `admin-mobile-complete-solution.js`, `admin-mobile-buttons-fix.js`, e um `admin-mobile-fix.js` morto nem chegava a ser carregado), cada um a clonar o botão e substituir os listeners dos outros, usando classes inconsistentes (`sidebar-toggled` vs `sidebar-open` vs `.sidebar.open`) — comportamento instável e imprevisível
- Consolidado num único controlador em `admin.js`, com `admin-layout-fix-definitive.css` como única fonte de verdade para o layout sidebar/conteúdo
- **Desktop (≥992px)**: a sidebar pode agora ser encolhida para um modo "rail" de ícones (76px) através do botão de toggle; estado guardado em `localStorage` e restaurado entre sessões
- **Mobile/tablet (<992px)**: mantém-se o auto-hide (gaveta escondida por defeito), agora com um único overlay/backdrop, fecho por clique fora, Escape, clique num link de navegação, ou swipe
- Removidos os 3 scripts mortos/conflituosos (`admin-mobile-complete-solution.js`, `admin-mobile-buttons-fix.js`, `admin-mobile-fix.js`) e o bloco CSS duplicado equivalente em `admin.css`
- Tooltips nativos (`title`) adicionados a cada item do menu, visíveis quando a sidebar está no modo rail

### 📝 **Edição de Produto: permanece na página após gravar + navegação entre produtos**
- **Guardar mantém na página**: após gravar com sucesso, deixa de redirecionar para a lista — fica no formulário de edição (com mensagem de sucesso), preservando o `returnTo` para quando o utilizador quiser voltar
- **Botão "Voltar"** (topo e fundo da página) reverte realmente para a página anterior; se vier da lista de Produtos, preserva filtros, ordenação e página — corrigido um bug onde o parâmetro `returnUrl` da lista era ignorado por um valor por defeito definido demasiado cedo no middleware da rota
- **Navegação Anterior/Próximo** (topo e fundo): avança/recua para o produto com o id anterior/seguinte existente na BD (ignora buracos deixados por remoções), novo método `Product.getAdjacentIds()`; desactivado nas pontas (primeiro/último produto)
- **Caixa "Ir para ID"**: campo numérico + botão para saltar directamente para o produto com esse id
- Todos os links de navegação (Anterior/Próximo/Ir) preservam o `returnTo` corrente, para que o "Voltar" continue válido depois de navegar entre vários produtos

### ✅ **Validado**
- Inspecção de DOM via Puppeteer: sidebar colapsada mede 76px e persiste após reload; gaveta mobile abre/fecha com backdrop, Escape e clique fora
- Fluxo completo testado: lista filtrada → editar → gravar (fica na página) → Anterior/Próximo/Ir para ID → Voltar (filtros preservados)
- Comportamento de fronteira confirmado: "Anterior" desactivado no primeiro produto (id 1), "Próximo" desactivado no último (id 334)
- `npm run validate:catalog` — OK (328 produtos)

---

## [2026-06-23] - Admin: corrige layout desparametrizado da tabela de Produtos

### 🐛 **Causa raiz: `</div>` órfão colapsava ~493px de largura em todo o admin**
- `views/admin/products/index.ejs` tinha um `</div>` a mais no fim da página, que fechava o `<div id="content">` do layout principal demasiado cedo
- Isso fazia o `<footer>` escapar da estrutura flex (passava a ser irmão de `#content-wrapper` em vez de filho), e por não ter `position:fixed` roubava ~493px de largura ao conteúdo em **qualquer** tamanho de ecrã — exactamente o "desparametrizado de tamanho e visibilidade" reportado em modo grande/médio
- Confirmado por inspecção de DOM: `#content-wrapper` media 1166px num ecrã de 1920px (esperado: 1660px), 612px num ecrã de 1366px (esperado: 1106px) — défice constante de 494px em qualquer largura

### 🐛 **CSS da página nunca era aplicado (bug pré-existente, não introduzido agora)**
- O bloco `<style>` da página era injectado via `locals.styles.push(...)` (array, plural), mas o layout só lê `<%- style %>` (singular) — incompatibilidade total, o que significa que **todo** o CSS de responsividade da tabela, do drawer de filtros mobile e do zoom de imagens nunca chegou a ser aplicado, apesar de descrito em changelogs anteriores
- CSS movido para um ficheiro real, `public/css/admin-products.css`, referenciado directamente no layout (`views/admin/layouts/main.ejs`), eliminando a dependência do mecanismo avariado

### 🐛 **Tabela desaparecia entre 768px e 991px**
- `admin-tables-mobile.css` esconde `.table-responsive .table` até 991.98px à espera de uma classe genérica `.table-mobile-cards`, que esta página não usa (usa `.products-mobile-cards`) — nesse intervalo a tabela ficava `display:none` sem nada a substituí-la
- Adicionado override com maior especificidade em `admin-products.css` para manter a tabela visível até ao breakpoint mobile real da página (767.98px)

### 🎨 **Tabela mais legível em ecrãs médios**
- Colunas "Categoria" e "Nome" (texto de comprimento variável) passam a truncar com ellipsis em vez de forçar `nowrap` indiscriminado em todas as colunas — reduz a largura mínima necessária da tabela e elimina scroll horizontal desnecessário em ecrãs de 900px+
- Scroll horizontal interno do `.table-responsive` mantido apenas onde realmente necessário (ecrãs <1024px), sem nunca afectar a largura da página

### ✅ **Validado**
- Inspecção de DOM via Puppeteer em 1920/1366/1280/1024/992/900/820/768px — largura de `#content-wrapper` confirmada igual a `viewport - 260px` (sidebar) em todos os casos, sem overflow horizontal da página
- Screenshots visuais em todos os breakpoints — filtros em linha, tabela proporcionada, sem espaço vazio
- `npm run validate:catalog` — OK (328 produtos)

---

## [2026-06-23] - Merge: reconciliação com hotfixes de produção (waphix)

### 🔀 **Merge `origin/main` → branch de desenvolvimento**
- Branch local tinha divergido 24 commits de `origin/main`, que por sua vez tinha 6 commits de hotfixes aplicados directamente em produção (waphix): fix no INSERT de `customers` (coluna `name` inexistente na BD de produção), fix de header mobile cortado + debug OAuth, dependência `sequelize`, UX da tabela de produtos (margens, filtros persistentes, drawer mobile)
- Conflitos resolvidos priorizando sempre a versão de produção já validada (`layout: false` em páginas de erro, normalização de checkboxes, remoção de `prompt: select_account` no Google OAuth mobile); mantida a versão local apenas onde tinha um fix mais recente ainda não propagado a produção (rotação EXIF em `productImageProcessor.js`)
- **Validado**: `npm run validate:catalog` (328 produtos, 18 famílias) e `npm run test:ecommerce` (26/29 — as 3 falhas são um artefacto do próprio script de teste, que não envia `confirmPassword` no fluxo de registo, sem relação com o merge); smoke test manual de `/`, `/catalog`, `/admin/login`, `/account/login` — todos 200

---

## [2026-06-23] - Admin: UX melhorada tabela de produtos

### 🎨 **Margens reduzidas e filtros persistentes**
- **Margens laterais**: Reduzidas de px-3/px-md-4 para px-2/px-md-3 para maximizar espaço
- **Persistência de filtros**: Filtros agora são salvos em localStorage e restaurados ao voltar à página
- **Drawer de filtros em mobile**: Filtros agora ficam numa gaveta lateral em mobile para não ocupar espaço
- **UX melhorada**: Ao editar um produto e voltar, filtros e ordenação são mantidos
- **Botão "Limpar"**: Remove filtros do localStorage para reset completo

---

## [2026-06-23] - Admin: tabela de produtos responsiva

### 📊 **Tabela de produtos - responsividade melhorada**
- **Problema**: Tabela de produtos no admin ficava ilegível ao reduzir o tamanho da página
- **Solução**: Adicionado CSS responsivo específico para a tabela de produtos:
  - Tablets/laptops pequenos (768px-1200px): font-size 0.85rem, padding reduzido
  - Laptops muito pequenos (992px): font-size 0.8rem, imagens 40px, badges compactos
  - Mobile (<768px): usa cards em vez de tabela (já existente)
  - Desktop grande (1400px+): font-size 0.9rem, padding aumentado
- **Impacto**: Tabela ajusta-se automaticamente ao tamanho do ecrã mantendo legibilidade

---

## [2026-06-23] - Error: correção layout duplicado

### 🐛 **Páginas de erro desformatadas corrigidas**
- **Problema**: Páginas de erro apareciam com header/footer duplicados em desktop após erro OAuth
- **Causa**: `res.render('error')` estava a usar o layout principal por defeito, causando duplicação de elementos
- **Solução**: Adicionado `{ layout: false }` a todos os `render('error')` em:
  - `app.js` (error handlers globais)
  - `modules/ecommerce/admin/routes/orders.js`
  - `modules/ecommerce/cart/middleware/requireEcommerceEnabled.js`
  - `routes/admin.js` e `routes/admin/media.js`
  - `controllers/CatalogController.js`, `CookieConsentController.js`, `UserRightsController.js`
  - `routes/index.js`
- **Impacto**: Páginas de erro agora são standalone sem duplicação de layout

---

## [2026-06-23] - Mobile: correções páginas de erro

### 📱 **Páginas de erro - mobile otimizado**
- **Problema**: Páginas de erro (error.ejs, 404.ejs, 500.ejs) não estavam otimizadas para mobile
- **Solução**:
  - Adicionada media query `@media (max-width: 768px)` em todas as páginas de erro
  - Ajustado padding e max-width para melhor uso de espaço em ecrãs pequenos
  - Botões com `min-height: 48px` e `width: 100%` para touch targets adequados
  - Tamanhos de fonte reduzidos para melhor legibilidade em mobile

---

## [2026-06-23] - Mobile: correções header, criar conta e Google OAuth

### 📱 **Header mobile - layout corrigido**
- **Problema**: Header não ajustava bem o tamanho em mobile devido a max-width fixo e falta de estilos
- **Solução**: 
  - Adicionado `.logo-container { flex-shrink: 0 }` para evitar compressão do logo
  - Adicionado `gap: 0.5rem` ao `.header-container` para consistência
  - Removido `max-width: 1200px` do header em mobile (`max-width: none`)
  - Ajustado tamanho do logo com `clamp(1rem, 4vw, 1.25rem)` para responsividade fluida

### 📱 **Página criar conta - mobile otimizado**
- **Problema**: Formulário com max-width fixo, touch targets pequenos, padding excessivo
- **Solução**:
  - Adicionada media query `@media (max-width: 768px)` em `account.css`
  - `.account-form-wrap` ajustado para `max-width: 100%` com padding lateral
  - Inputs com `min-height: 44px` e `font-size: 16px` (evita zoom iOS)
  - Botão Google e botão primário com `min-height: 48px` para touch targets adequados
  - Padding da página reduzido de `2.5rem 0 3.5rem` para `1.5rem 0 2rem` em mobile

### 🔐 **Google OAuth - correções mobile**
- **Problema**: Prompt 'select_account' causava problemas em browsers mobile, falta de tratamento de erros
- **Solução**:
  - Removido `prompt: 'select_account'` do Passport authenticate (causava inconsistência em mobile)
  - Adicionado `console.error` e flash message específica no callback OAuth
  - Melhorado tratamento de erros com mensagem "Erro ao autenticar com Google. Tente novamente."
- **Nota**: A variável `GOOGLE_CALLBACK_URL` no `.env` deve estar configurada para o domínio de produção (não localhost)

### ✅ **Validado**
- `node --check` em `modules/ecommerce/accounts/routes/pages.js` — sem erros
- Sintaxe CSS validada

---

## [2026-06-23] - Bugfix: rotação EXIF de imagens e checkboxes Criar Rápido

### 🐛 **Rotação de imagens 90º counter-clockwise corrigida**
- **Problema**: Imagens carregadas via Criar Rápido ou edição de produtos apareciam rodadas 90º no sentido anti-horário
- **Causa**: O pipeline de processamento de imagens (`productImageProcessor.js`) não lidava com metadados EXIF de orientação
- **Solução**: Adicionado `.rotate()` ao pipeline Sharp em `resizeToJpeg()` e `resizeToWebp()` para correção automática de orientação EXIF
- **Impacto**: Todas as novas imagens processadas terão orientação correta; para imagens existentes, executar `node scripts/generate-product-image-variants.js --force`

### 🐛 **Checkboxes Criar Rápido inconsistentes corrigidos**
- **Problema**: Selectores "Ativo", "Visível no Catálogo" e "Destaque" no Criar Rápido não guardavam corretamente o estado após redirect
- **Causa**: Lógica de pré-seleção usava `!== false` (true para undefined) mas salvamento esperava explicitamente `'1'`
- **Solução**: Criadas helper functions `normalizeCheckbox()` e `boolToQueryParam()` para normalizar valores de forma consistente em todo o controller
- **Impacto**: Estado dos checkboxes agora preservado corretamente entre submissões consecutivas no Criar Rápido

### ✅ **Validado**
- `node --check` em `utils/productImageProcessor.js` e `controllers/QuickProductController.js` — sem erros
- Sintaxe JavaScript validada

---

## [2026-06-23] - Admin: melhorias de fluxo no Criar Rápido, Produtos e galeria

### ✨ **Criar Produto Rápido — visibilidade + memória de escolha**
- Adicionados toggles "Ativo", "Visível no Catálogo" e "Destaque" ao formulário (antes hardcoded: ativo+visível sempre ligados, destaque sempre desligado)
- Após criar um produto, a escolha destes 3 toggles é preservada via query string no redirect e pré-selecionada no formulário seguinte — facilita criar várias peças seguidas com as mesmas definições

### ✨ **Lista de Produtos (admin) — seletor de resultados por página**
- Novo dropdown "Por página" (10/20/50/100) no formulário de filtros, com auto-submit
- `ProductController.index` valida o `limit` recebido contra uma lista de valores permitidos (evita valores arbitrários via URL)

### ✨ **Lista de Produtos (admin) — navegação contínua no zoom/lightbox**
- Ao navegar pela galeria de imagens (GLightbox) e chegar ao fim da página actual, avança automaticamente para a página seguinte e continua a partir da primeira imagem (e o inverso a recuar a partir da primeira imagem da página)
- Implementado com o evento `slide_changed` do GLightbox (loop interno existente é usado para detectar a transição última→primeira) + `sessionStorage` para reabrir o lightbox na posição certa após o carregamento da nova página

### ✅ **Validado**
- `node --check` nos controllers alterados
- Compilação EJS das views alteradas e verificação de sintaxe do bloco `<script>` inline

---

## [2026-06-23] - Pipeline de otimização de imagens de produto

### 🖼️ **Problema**
Auditoria de performance revelou que as imagens de produto eram sempre servidas na resolução original do upload (por vezes 400-550KB), reutilizada sem alteração em todos os contextos — desde miniaturas de 48px no admin até à imagem principal de 600px no detalhe do produto.

### ✅ **Solução**
- Novo `utils/productImageProcessor.js` — gera 4 variantes (`full` 1600px, `medium` 800px, `small` 400px, `thumb` 160px) em JPEG + WebP por cada imagem de produto, usando Sharp (com fallback Jimp para ambientes cPanel), seguindo o mesmo padrão já usado na Media Library
- **O ficheiro original do upload nunca é alterado** — fica em disco intacto como backup/arquivo; todas as variantes são geradas a partir dele
- Geração automática integrada em `ProductController.store()`/`update()` e `QuickProductController.store()` — toda imagem nova introduzida a partir de agora gera as variantes sem intervenção manual
- `Product.delete()` passa a apagar também as variantes (8 ficheiros) ao remover um produto, além do original
- Helper `app.locals.productImg(filename, size)` disponível em todas as views EJS — devolve `{ jpg, webp }` com fallback automático para o placeholder SVG quando não há imagem
- Views actualizadas para pedir a variante certa por contexto, com `<picture>`+WebP e fallback JPEG: catálogo e homepage (`small`), detalhe de produto (`medium` na imagem principal, `thumb` nas miniaturas, `full` no zoom/lightbox), admin — dashboard/produtos/inventário/formulário (`thumb`/`small`)
- Script de backfill `scripts/generate-product-image-variants.js` para gerar as variantes das imagens já existentes: `node scripts/generate-product-image-variants.js` (idempotente; usar `--force` para regenerar)

### ✅ **Validado**
- `node --check` em todos os ficheiros JS novos/alterados
- Compilação EJS de todas as views alteradas sem erros
- Teste end-to-end: gerada variante de imagem real, confirmado original byte-a-byte intacto (hash MD5 igual) e miniatura ~18× mais leve (4.4KB vs 80KB)
- Backfill corrido contra a BD local (308 imagens originais em disco): **301 processadas com sucesso** (2408 ficheiros de variantes gerados, 301×8 — confirmado), **42 falhas** por ficheiro original em falta no disco (ver nota abaixo)

### ⚠️ **Nota: 42 imagens em falta (pré-existente, não introduzido por este trabalho)**
42 ficheiros referenciados em `product_images` não existem em disco mesmo após recuperação do servidor — afecta **31 produtos** (refs `LTCU0010`–`LTCU0025`, `LTG0001`–`LTG0016`), todos criados via Criar Rápido com nome placeholder "Produto {timestamp}", sugerindo que as imagens nunca chegaram a ser persistidas/migradas correctamente para estes produtos. Estes produtos já mostravam imagem partida (404) antes deste trabalho — fora de âmbito corrigir agora.

---

## [2026-06-23] - Admin: bugs críticos, consistência dark-luxe e tabelas/paginação

### 🐛 **Bugs críticos corrigidos**
- `admin-dark-luxe.css`: erro de sintaxe no `background` do `<body>` (faltava `linear-gradient(`)
- Dashboard: tabela "Transações Recentes" tinha 5 colunas no `<thead>` mas só 3 renderizadas no `<tbody>`, e os dados vinham sempre vazios (`recentTransactions: []` hardcoded) — agora usa `inventory_transactions` reais
- Header admin: avatar/nome sempre "Admin" (hardcoded) → usa utilizador da sessão; removido link morto `/admin/profile`
- Inventário: controller passava `totalPages`/`currentPage` mas a view nunca renderizava paginação — impossível navegar além da página 1; paginação adicionada
- Removidos `console.log` de debug e rota `/admin/test-route` deixados em produção (`routes/admin.js`, `InventoryController.js`)
- Removido `routes/admin/products.js` — ficheiro morto nunca montado, usava Sequelize (inexistente no projeto), com lógica de paginação duplicada e confusa

### 🎨 **Consistência visual com o tema dark-luxe do site**
- Badges de stock/status (Produtos, Inventário, Famílias) trocados de classes Bootstrap cruas (`bg-success`, `bg-warning`, etc.) para as classes dark-luxe (`badge-stock-in-stock`, `badge-product-active`, etc.)
- Placeholders de imagem (`bg-light`) trocados por nova classe `.img-placeholder` (dark) em Produtos, Inventário e Famílias
- Removidas classes Bootstrap 4 obsoletas (`text-gray-800`, `font-weight-bold`, `text-dark` em headers ordenáveis) em 9 views admin
- Reports e Analytics: removidas classes Bootstrap dark/cores hardcoded (`bg-dark`, `table-dark`, `bg-primary text-white`, etc.) substituídas por cards/stat-cards dark-luxe
- Orders: status e pagamento traduzidos para PT (`pending` → `Pendente`, etc.) com badges dark-luxe em vez de `bg-secondary`/`bg-info text-dark`
- Font do admin trocada de `Nunito` (nunca usada no CSS) para `Poppins`/`Inter`, alinhado com o site público
- Paginação (Produtos + Inventário): reescrita com elipses para listas longas, estados `disabled`, e página activa agora visível (antes quase indistinguível no tema escuro)

### ✅ **Validado**
- `node --check` em todos os ficheiros JS alterados
- Compilação EJS de todas as views alteradas sem erros

---

## [2026-05-26] - Conta cliente: navegação integrada

### 👤 **Conta cliente no site público**

#### **Navegação**
- Partial `_customerAccountNav.ejs` — header (Entrar + **Criar conta**), menu mobile, footer
- Carrinho, checkout e success — CTAs para login/registo; `returnTo` preservado
- Checkout pré-preenche dados se sessão cliente activa
- Success convida a criar conta com email do pedido (guest)

#### **Rotas / sessão**
- `/account` → redirect login ou pedidos
- `requireEcommerceEnabled` nas rotas de conta
- Redirect se já autenticado; logout limpa sessão

#### **Fix**
- Middleware `ecommerceEnabled` / `customerLoggedIn` movido **antes** das rotas e-commerce (header correcto em `/cart`, `/checkout`, `/account`)

#### **Validado**
- `npm run test:ecommerce` — **29/29** (incl. conta: header, footer, cart/checkout CTAs, login/logout, returnTo)
- `npm run validate:catalog` — OK

---

## [2026-05-26] - Mobile showcase + validação

### 📱 **Pass mobile completo (showcase + e-commerce)**

#### **CSS mobile**
- `frontend-mobile.css`: cores `#c0a080` → `var(--igp-gold)`; regras para IG strip, search, e-commerce, collection, privacy/terms, about, error; safe-area para cart/checkout
- `brand-showcase.css`: bloco `@media (max-width: 768px/480px)` para todas as páginas showcase (IG strip, collection, about, privacy/terms, search, product detail, btn-add-to-cart)
- `cart.css`: tabela → cards empilhados em mobile (`data-label` + `::before`); summary e CTA 100% largura
- `checkout.css`: inputs 16px (iOS), submit full-width, success/cancel empilhados, account pages
- `cart.ejs`: `data-label` em cada `<td>` para labels legíveis no layout card
- `mobile-header.ejs`: dropdown links/ícones com `var(--igp-gold)`

#### **Validado localmente (2026-05-26)**
- `npm run test:ecommerce` — **19/19** (cart API, checkout submit, success, account, admin orders/settings, add-to-cart no catálogo)
- `npm run validate:catalog` — OK (328 produtos, 18 famílias)
- Smoke HTTP: 18 rotas públicas + 4 assets CSS → **200**
- Estrutural: `data-theme="dark"`, `body.showcase-theme`, search sem HTML duplicado, privacy sem fundo claro
- **Nota:** não existe `npm run build` — app Node/Express; validação = `npm start` + scripts acima

---

## [2026-05-26] - Tema Showcase + E-commerce UI

### 🎨 **Alinhamento visual completo do site (showcase dark-gold)**

#### **Tema showcase (`brand-showcase.css` + `body.showcase-theme`)**
- Toda a paleta do site passa a usar dourado (#c9a84c) + cream (#f0ece4) sobre fundo escuro (#0a0a0a)
- `body.showcase-theme` redireciona variáveis legadas `--color-accent/highlight/text` para gold/cream — qualquer CSS que use `var(--color-*)` herda automaticamente
- `data-theme="dark"` corrigido (era `"[object Object]"` devido a `theme: {...}` passado como objecto nas rotas)
- CSS estático usa `no-cache` em desenvolvimento; `immutable` só em produção
- `app.version` dinâmico (`Date.now()`) em dev para cache busting automático

#### **Páginas corrigidas**
- **Privacy Policy + Terms of Service**: CSS inline com tema claro totalmente substituído por showcase dark
- **Search results**: Removida estrutura HTML duplicada (`<!DOCTYPE>/<html>/<body>` dentro do layout); estilos showcase aplicados
- **Collection page**: Estilos showcase para cabeçalho, divider geométrico dourado, controlos de sort, nav de coleções
- **Product detail**: Valores hardcoded `#C0C0C0/#A8A8A8/#B87333` migrados para `var(--color-*)` que herdam gold
- **About page**: `.about-connect`, `.social-links-large`, `h3` com gold/muted showcase
- **error.ejs**: Guards defensivos `title`/`message`; estilo refeito showcase dark; `title:` adicionado a 3 chamadas `render('error')` que faltavam

#### **E-commerce UI — showcase theme**
- `cart.css` reescrito: tabela dark com cabeçalho gold, qty input com focus ring dourado, cart-summary glass card, btn gold
- `checkout.css` reescrito: form inputs dark/gold focus, h2 secções gold, checkout-summary glass, submit btn gold, páginas success/cancel centradas com ícone ✦ dourado
- `brand-showcase.css`: `.btn-add-to-cart` outline → fill gold no hover; `.header-cart-badge` gold bg; Bootstrap `.form-control` global override para showcasetheme
- Account pages (`/account/login`, `/account/register`, `/account/orders`): h1 Georgia + underline gold, tabela showcase
- `checkout-success.ejs` / `checkout-cancel.ejs`: adicionado `<link>` para `checkout.css`

#### **Instagram strip na homepage**
- Secção "No Instagram" com 6 posts reais via Instagram Graph API
- Partial `partials/_ig-strip.ejs`; rota home com `instagramModule.fetchInstagramFeed(6)`
- Cache de 5 minutos em `mediaService.js`

---

## [2026-05-26] - E-commerce Modular (core)

### 🛒 **Loja online modular**

#### **Arquitectura**
- Novo módulo `modules/ecommerce/` com submódulos: cart, checkout, orders, settings, shipping, fulfillment, admin, accounts, notifications, analytics, jobs
- Novo módulo `modules/payments/` com provider Stripe (`disabled` / `test` / `live`)
- Registo em `config/modules.js`; inicialização via `initializeModules(app)` em `app.js`

#### **Base de dados**
- Schema unificado INT em `modules/ecommerce/sql/migrations/006_ecommerce_unified.sql`
- Migração de upgrade para instalações existentes: `007_ecommerce_alter_existing.sql`, `008_ecommerce_alter_customers.sql`
- Comando: `npm run db:ecommerce`
- Schema UUID em `database/migrations/sales/` marcado como **deprecated**

#### **Rotas públicas**
- `/cart`, `/checkout`, `/checkout/success`, `/checkout/cancel`
- API: `/api/cart/*`, `/api/checkout/prepare`, `/api/checkout/submit`
- Webhook: `POST /webhooks/stripe`

#### **Admin**
- `/admin/settings/ecommerce` — activar loja, IVA, Stripe, portes
- `/admin/orders`, `/admin/orders/:id` — gestão de pedidos
- Dashboard usa estatísticas reais de pedidos quando e-commerce activo

#### **Conta cliente (opcional)**
- `/account/login`, `/account/register`, `/account/orders`, `/account/logout`

#### **Correcções dev (2026-05-26, sessão 2)**
- `initializeModules()` movido **antes** dos routers em `app.js` — botão "Adicionar ao carrinho" no catálogo
- Migração `008_ecommerce_alter_customers.sql` — colunas conta cliente em tabela `customers` existente
- Carrinho limpo após checkout submit
- Script `npm run test:ecommerce` — validação automática (19 checks)

#### **Validado localmente (2026-05-26)**
- Carrinho API + página + PATCH/DELETE
- Checkout com carrinho preenchido
- Submissão de pedido com `payment_mode=disabled` + carrinho vazio após
- Conta cliente: registo + histórico pedidos
- Admin: login, lista/detalhe pedidos, settings e-commerce
- Catálogo: botão add-to-cart visível com loja activa

#### **Pendente antes de go-live**
- Teste Stripe em modo `test` + webhook
- Emails SMTP de confirmação (requer `SMTP_HOST`)
- Executar `npm run db:ecommerce` em produção/staging após deploy

#### **Documentação deploy/DB (2026-05-26)**
- `DATABASE.md`, `PRODUCTION_SETUP.md`, `DEPLOYMENT.md`, `docs/MODULAR_ARCHITECTURE.md`

#### **Correcção de migração**
- Script `run-migration.js` ignora comentários SQL por linha (evita saltar o primeiro `ALTER` em 007)

---

## [2025-03-04] - Header Search: Ícone Expandível (Mobile + Desktop)

### 🔍 **Pesquisa no Header - Padrão Unificado**

#### **Problema resolvido**
- No mobile: botão de navegação e barra de pesquisa "embrulhados" no topo direito
- No desktop: barra de pesquisa ocupava grande parte do ecrã

#### **Solução implementada (Opção B)**
- **Mobile e Desktop**: ícone de pesquisa (lupa) que expande ao clicar
- **Estado inicial**: Logo | Nav | 🔍 | ☰ (mobile) ou Logo | Nav | 🔍 (desktop)
- **Ao clicar na lupa**: barra de pesquisa expande com animação
- **Fechar**: botão ×, clique fora ou tecla Escape

#### **Ficheiros alterados**
- `views/partials/header.ejs` — estrutura HTML (wrapper, ícone, barra expandível, botão fechar)
- `public/css/frontend-mobile.css` — estilos mobile e desktop para o padrão expand-on-click
- `views/layouts/main.ejs` — Font Awesome para ícones (lupa, ×)

#### **Detalhes técnicos**
- Desktop: barra expandida com `max-width: 320px`, `min-width: 200px`
- Mobile: barra full-width quando expandida
- Compatível com `advanced-search.js` (sugestões e resultados)
- Acessibilidade: `aria-expanded`, `aria-label` nos botões

---

## [2025-07-18] - Arquitetura Modular & UI/UX Improvements

### 🏗️ **Arquitetura Modular Implementada**

#### **Sistema de Configuração Global**
- **Arquivo**: `public/js/config.js`
- **Funcionalidades**:
  - Detecção automática de ambiente (localhost = development)
  - Debug flags configuráveis
  - Feature toggles para funcionalidades
  - Controle de ordem de carregamento de módulos
  - Timeouts configuráveis

#### **Módulos JavaScript Organizados**
- **`public/js/modules/utils.js`**: Utilitários (debounce, throttle, manipulação DOM)
- **`public/js/modules/navigation.js`**: Sistema de navegação e scroll effects
- **`public/js/modules/ui.js`**: Componentes UI (loading, lightbox, back-to-top, video backgrounds)
- **`public/js/modules/carousel.js`**: Sistema de carrosséis reutilizável

#### **Module Manager**
- **Arquivo**: `public/js/main.js`
- **Funcionalidades**:
  - Inicialização segura e sequencial de módulos
  - Controle de dependências
  - Tratamento de erros
  - Sistema de logs para debugging

#### **CSS Componentizado**
- **Arquivo**: `public/css/components.css`
- **Componentes**:
  - Loading overlays reutilizáveis
  - Botões padronizados
  - Cards de produtos
  - Sistema de grids responsivo

### 📱 **Melhorias Mobile - Área Admin**

#### **CSS Mobile Específico**
- **Arquivo**: `public/css/admin-mobile.css`
- **Melhorias**:
  - Sidebar responsiva com toggle móvel
  - Menu hamburger funcional
  - Navegação otimizada para touch
  - Layout adaptativo para telas pequenas

#### **Tabelas Mobile-Friendly**
- **Arquivo**: `public/css/admin-tables-mobile.css`
- **Funcionalidades**:
  - Scroll horizontal em tabelas grandes
  - Cards responsivos para dados tabulares
  - Botões de ação otimizados para touch

#### **JavaScript Mobile**
- **Melhorias no**: `public/js/admin.js`
- **Funcionalidades**:
  - Toggle de sidebar móvel
  - Detecção de tamanho de tela
  - Eventos touch otimizados

### 🎨 **UI/UX da Galeria**

#### **Página Collections Otimizada**
- **Arquivo**: `views/collections.ejs`
- **Melhorias**:
  - Remoção do loading infinito
  - Interface limpa focada nas imagens
  - Remoção de elementos desnecessários:
    - Botões zoom não funcionais
    - Títulos e descrições redundantes
    - Overlays de informação
  - Mantido sistema lightbox funcional

#### **Performance Otimizada**
- **Loading progressivo** de imagens
- **Lazy loading** implementado
- **Transições suaves** mantidas
- **CSS otimizado** (remoção de estilos não utilizados)

### 🔧 **Correções Técnicas**

#### **Sistema Modular**
- ✅ Correção de dependências entre módulos
- ✅ Tratamento de erros melhorado
- ✅ Logs de debugging implementados
- ✅ Ordem de carregamento otimizada

#### **Interface Mobile**
- ✅ Sidebar inacessível corrigida
- ✅ Menu hamburger funcional
- ✅ Tabelas responsivas implementadas
- ✅ Touch navigation otimizada

#### **Galeria**
- ✅ Loading infinito eliminado
- ✅ Performance melhorada
- ✅ Interface limpa e minimalista
- ✅ Sistema lightbox mantido

### 📊 **Arquivos Modificados/Criados**

#### **Novos Arquivos**
```
public/js/config.js                 - Sistema de configuração global
public/js/modules/utils.js         - Módulo de utilitários
public/js/modules/navigation.js    - Módulo de navegação
public/js/modules/ui.js            - Módulo de componentes UI
public/js/modules/carousel.js      - Módulo de carrossel
public/css/components.css          - CSS componentizado
public/css/admin-mobile.css        - CSS mobile para admin
public/css/admin-tables-mobile.css - CSS para tabelas mobile
```

#### **Arquivos Atualizados**
```
public/js/main.js                  - Module Manager implementado
public/js/admin.js                 - Funcionalidades mobile adicionadas
views/collections.ejs              - Interface limpa implementada
views/admin/layouts/*.ejs          - CSS mobile incluído
```

### 🚀 **Benefícios Implementados**

1. **Modularidade**: Código organizado e reutilizável
2. **Manutenibilidade**: Fácil debugging e extensão
3. **Performance**: Loading otimizado e CSS limpo
4. **Responsividade**: Interface móvel completamente funcional
5. **UX**: Galeria limpa focada no conteúdo
6. **Escalabilidade**: Sistema preparado para futuras funcionalidades

### 📋 **Status dos Todos**
- ✅ Arquitetura modular implementada
- ✅ Interface admin mobile corrigida
- ✅ Galeria otimizada e limpa
- ✅ Sistema de loading corrigido
- ✅ Documentação atualizada

---

## Próximos Passos Sugeridos

1. **Testes de Integração**: Validar funcionamento em diferentes dispositivos
2. **Otimização de Imagens**: Implementar compressão automática
3. **SEO**: Adicionar meta tags otimizadas
4. **PWA**: Transformar em Progressive Web App
5. **Analytics**: Implementar tracking de uso

---

*Checkpoint criado em: 2025-07-18*
*Status: Sistema estável e funcional* 