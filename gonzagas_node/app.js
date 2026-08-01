require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts');
const { pool } = require('./config/database');
const SiteSettings = require('./models/SiteSettings'); // Added for site settings
const { cookieConsentMiddleware } = require('./middleware/cookieConsent');

// Carrega as configurações
const config = require('./config/config');

// Inicializa o aplicativo Express
const app = express();

// Carimbo gerado no arranque do processo — usado como cache-buster (?v=) para
// CSS/JS estáticos. Os ficheiros estáticos são servidos com Cache-Control
// "immutable" por até 1 semana em produção; sem este carimbo a mudar a cada
// deploy/restart, browsers que já visitaram o admin ficam presos a versões
// antigas de admin.js/admin.css mesmo depois de um redeploy.
const SERVER_BOOT_VERSION = Date.now().toString();

// Trust proxy - CRÍTICO em produção (nginx/Cloudflare): usa X-Forwarded-For para IP real
// Sem isto, todos os utilizadores partilham o mesmo IP do proxy → rate limit dispara para todos
const trustProxy = process.env.TRUST_PROXY;
app.set('trust proxy', trustProxy === '1' || trustProxy === 'true' ? 1 : (trustProxy || false));

// WWW → non-WWW redirect (U3) — deve estar antes de qualquer outro middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const host = req.get('host') || '';
    if (host.toLowerCase().startsWith('www.')) {
      const cleanHost = host
        .replace(/^www\./i, '')
        .replace(/:443$/, '')
        .replace(/:80$/, '');
      return res.redirect(301, 'https://' + cleanHost + req.originalUrl);
    }
  }
  next();
});

// Configuração global de variáveis
app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 3000);

// Carrega as configurações de visualização
const viewConfig = require('./config/view');

// Configurações de view engine
app.set('views', path.join(__dirname, viewConfig.views.directory));
app.set('view engine', viewConfig.views.extension);
app.set('layout', viewConfig.layouts.public.default);
app.set('view cache', viewConfig.views.cache);
app.set('etag', false);

// Configura o express-ejs-layouts
app.use(expressLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('layout extractMetas', true);

// Middleware para definir o layout padrão com base na rota
app.use((req, res, next) => {
  // Se a rota começar com /admin, usa o layout do admin
  if (req.path.startsWith('/admin')) {
    res.locals.layout = viewConfig.layouts.admin.default;
  } else {
    res.locals.layout = viewConfig.layouts.public.default;
  }
  next();
});

// 1. Compression middleware (PRIMEIRO)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balanço entre CPU e compressão
  threshold: 1024 // Só comprimir files > 1KB
}));

// 2. Rate limiting global (configurável via .env)
// RATE_LIMIT_WINDOW_MS, RATE_LIMIT_API_MAX, RATE_LIMIT_PUBLIC_MAX, RATE_LIMIT_ADMIN_MAX
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const RATE_LIMIT_API_MAX = parseInt(process.env.RATE_LIMIT_API_MAX, 10) || 2500;
const RATE_LIMIT_PUBLIC_MAX = parseInt(process.env.RATE_LIMIT_PUBLIC_MAX, 10) || 2500;
const RATE_LIMIT_ADMIN_MAX = parseInt(process.env.RATE_LIMIT_ADMIN_MAX, 10) || 2500;

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: (req) => {
    if (req.path.startsWith('/admin')) return RATE_LIMIT_ADMIN_MAX;
    if (req.path.startsWith('/api')) return RATE_LIMIT_API_MAX;
    return RATE_LIMIT_PUBLIC_MAX;
  },
  message: {
    error: 'Demasiados pedidos, tente novamente em 15 minutos',
    retryAfter: Math.round(RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Estáticos não contam
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|webp)$/)) return true;
    // Health check
    if (req.path === '/health' || req.path === '/ping') return true;
    return false;
  }
});

app.use(globalLimiter);

// Webhook da Stripe precisa do corpo em formato raw para verificar a assinatura
// (stripe.webhooks.constructEvent). Tem de ser montado ANTES do express.json()
// global, senão o corpo já vem parseado/consumido e a verificação falha sempre.
require('./modules/payments').mountWebhookRoute(app);

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Corrige domínio do cookie de sessão para ambiente local
const sessionConfig = { ...config.session }; 

// Override para desenvolvimento local OU simulação local de produção
if (process.env.NODE_ENV === 'development') {
    // Para desenvolvimento, sempre permitir cookies inseguros e domínio indefinido para localhost
    if (sessionConfig.cookie) {
        sessionConfig.cookie.domain = undefined;
        sessionConfig.cookie.secure = false;
    }
} else if (process.env.NODE_ENV === 'production') {
    // Para produção, verificar se estamos rodando localmente inspecionando config.server.publicUrl
    // config.server.publicUrl tem como padrão http://localhost:PORT se a variável de ambiente PUBLIC_URL não estiver definida
    
    const publicUrlIsLocal = config.server.publicUrl.startsWith('http://localhost') || 
                             config.server.publicUrl.startsWith('http://127.0.0.1');
    
    if (publicUrlIsLocal) {
        // Se for modo de produção mas parecer um servidor local, permitir cookies inseguros
        if (sessionConfig.cookie) {
            sessionConfig.cookie.domain = undefined; 
            sessionConfig.cookie.secure = false;     
        }
    }
}

// Sessões guardadas na base de dados (tabela `sessions`), não em memória.
// Com conta obrigatória no checkout, o MemoryStore por omissão do
// express-session desligava todos os clientes autenticados a cada reinício do
// container — ou seja, a cada deploy, a meio de compras. Também impedia correr
// mais do que um processo. Se a criação do store falhar, o arranque continua
// com o store em memória em vez de deixar o site em baixo.
try {
  const MySQLStore = require('express-mysql-session')(session);
  sessionConfig.store = new MySQLStore(
    {
      createDatabaseTable: true,
      // Limpeza de sessões expiradas de 15 em 15 minutos
      clearExpired: true,
      checkExpirationInterval: 15 * 60 * 1000,
      // Deixa o expiry ser o do cookie (rolling), não um valor fixo
      expiration: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 30 * 60 * 1000,
      schema: {
        tableName: 'sessions',
        columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' },
      },
    },
    pool
  );
  console.log('✅ Sessões persistentes na base de dados (tabela `sessions`)');
} catch (err) {
  console.error('⚠️  Falha a criar o store de sessões na BD, a usar memória:', err.message);
}

app.use(session(sessionConfig));
app.use(flash());

// Cookie consent middleware (after session)
app.use(cookieConsentMiddleware);

// Logging
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware de log personalizado
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Variáveis globais para as views
app.use((req, res, next) => {
  // Dados comuns a todas as views
  res.locals.app = {
    name: 'Gonzaga\'s Art & Shine',
    // APP_VERSION (env) permite fixar a versão manualmente; sem isso, usa o
    // carimbo de arranque do processo para garantir cache-busting automático
    // a cada deploy/restart, mesmo em produção.
    version: process.env.APP_VERSION || SERVER_BOOT_VERSION,
    environment: app.get('env'),
    baseUrl: process.env.BASE_URL || 'https://artnshine.pt'
  };

  // Tema showcase (dourado/cream) activo em todas as páginas públicas
  if (!req.path.startsWith('/admin')) {
    res.locals.showcaseTheme = true;
  }

  // Flash messages
  res.locals.messages = require('express-messages')(req, res);
  
  // Usuário autenticado
  res.locals.user = req.user || null;
  
  next();
});

// SEO: currentPath e fullUrl para meta tags dinâmicas
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.fullUrl = (process.env.BASE_URL || 'https://artnshine.pt') + req.path;
  next();
});

// Middleware to load site settings globally
app.use(async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.locals.siteSettings = settings;
  } catch (error) {
    console.error('Error loading site settings for views:', error);
    // Provide default settings to prevent crashes if DB fetch fails
    res.locals.siteSettings = {
      featured_carousel_enabled: true,
      catalog_page_enabled: true,
      hide_catalog_prices: false,
      hide_out_of_stock: false
    };
  }
  next();
});

// Carrega dados de famílias para o menu de navegação
app.use(async (req, res, next) => {
  try {
    const ProductFamily = require('./models/ProductFamily');
    const families = await ProductFamily.getAll();
    res.locals.families = families || [];
  } catch (error) {
    console.error('Error loading families for navigation:', error);
    res.locals.families = [];
  }
  next();
});

// Security middleware
const isDev = process.env.NODE_ENV !== 'production';
const devSources = isDev ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://artnshine.pt',
        'https://www.googletagmanager.com',
        'https://cdn.jsdelivr.net', // Adicionado para Bootstrap JS e outros scripts do jsdelivr
        'https://cdn.datatables.net', // Adicionado para DataTables JS
        'https://code.jquery.com'    // Adicionado para jQuery
      ],
      scriptSrcAttr: [
        "'self'",
        "'unsafe-inline'"
      ],
      scriptSrcElem: [ // Adicionada diretiva explícita
        "'self'",
        "'unsafe-inline'",
        'https://artnshine.pt',
        'https://www.googletagmanager.com',
        'https://cdn.jsdelivr.net', // Adicionado para Bootstrap JS e outros scripts do jsdelivr
        'https://cdn.datatables.net', // Adicionado para DataTables JS
        'https://code.jquery.com',
        'https://unpkg.com'    // Adicionado para Swiper JS
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://artnshine.pt',
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net', // Adicionado para Bootstrap CSS e ApexCharts CSS
        'https://cdn.datatables.net',
        'https://unpkg.com' // Adicionado para Swiper CSS e JS
      ],
      styleSrcElem: [
        "'self'",
        "'unsafe-inline'",
        'https://artnshine.pt',
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net', // Adicionado para Bootstrap CSS e ApexCharts CSS
        'https://cdn.datatables.net', // Adicionado para DataTables CSS
        'https://unpkg.com'    // Adicionado para Swiper CSS
      ],
      fontSrc: [
        "'self'", 
        'https://artnshine.pt',
        "https://fonts.gstatic.com", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",  // Adicionado para as fontes do Slick Carousel
        "data:"
      ],
      imgSrc: [
        "'self'", 
        'https://artnshine.pt',
        "data:", 
        "blob:", 
        ...devSources,
        'https://ui-avatars.com', 
        'https://cdn.jsdelivr.net', // ajax-loader.gif do Slick Carousel
        'https://*.cdninstagram.com',
        'https://*.fbcdn.net',
        'https://lh3.googleusercontent.com' // Google user avatars
      ],
      mediaSrc: [
        "'self'",
        'https://artnshine.pt',
        'data:',
        'blob:',
        ...devSources,
        'https://*.cdninstagram.com',
        'https://*.fbcdn.net',
        'https://*.instagram.com'
      ],
      formAction: [
        "'self'", 
        'https://artnshine.pt',
        ...devSources
      ],
      connectSrc: [
        "'self'", 
        'https://artnshine.pt',
        ...devSources,
        'wss://*.artnshine.pt',
        'https://cdn.datatables.net',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://accounts.google.com',
        'https://oauth2.googleapis.com'
      ]
    }
  },
  // Disable HTTPS-related headers
  strictTransportSecurity: false,
  expectCt: false
}));

app.use(cors({
  origin: process.env.BASE_URL || 'https://artnshine.pt',
  credentials: true
}));

// Serve static files with proper headers, MIME types, and caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0', // No cache in development
  etag: true,
  lastModified: true,
  setHeaders: function (res, filePathString, stat) { 
      // Disable cache for JS and CSS files in development
      if (process.env.NODE_ENV !== 'production' && (filePathString.endsWith('.js') || filePathString.endsWith('.css'))) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    // Set CORP header for all static files
    res.header('Cross-Origin-Resource-Policy', 'same-site');
    
    // Set proper MIME types based on file extension
    const pathModule = require('path'); 
    const ext = pathModule.extname(filePathString).toLowerCase(); 
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.woff2': 'font/woff2',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm',
      '.ico': 'image/x-icon'
    };
    
    // Set the Content-Type header
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    
    // Caching específico por tipo de arquivo (apenas em produção)
    if (process.env.NODE_ENV === 'production') {
      if (ext.match(/\.(css|js)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 1 semana
      } else if (ext.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 dias
      } else if (ext.match(/\.(woff|woff2|eot|ttf)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 ano
      }
    }
    
    // Adicionar header de compressão para tipos específicos
    const contentType = res.getHeader('content-type');
    if (contentType && /text|javascript|json|css|xml|svg/.test(contentType)) {
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
}));

// Handle 404 for static files
app.use(['/css/*', '/js/*', '/*.ico', '/*.png', '/*.jpg', '/*.jpeg', '/*.gif', '/*.svg'], (req, res) => {
  console.error(`Static file not found: ${req.originalUrl}`);
  res.status(404).send('File not found');
});
// Media files path com proteção e caching
// Serve /media/products/* from public/media/products/
app.use('/media/products', express.static(path.join(__dirname, 'public', 'media', 'products'), {
  maxAge: '30d',
  etag: true,
  setHeaders: (res, path, stat) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
}));

// Serve /media/* from public/media/ (for other media like gallery, content, etc)
app.use('/media', express.static(path.join(__dirname, 'public', 'media'), {
  maxAge: '30d',
  etag: true,
  setHeaders: (res, path, stat) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
}));

// COMPATIBILIDADE: Serve /uploads/products/* from public/media/products/ (para arquivos antigos que ainda usam /uploads/products/)
app.use('/uploads/products', express.static(path.join(__dirname, 'public', 'media', 'products'), {
  maxAge: '30d',
  etag: true,
  setHeaders: (res, path, stat) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
}));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global app variables
// A marca vive em config/brand.js. Fica em app.locals para estar disponível
// em todas as vistas como `brand.*` sem cada rota ter de a passar.
app.locals.brand = require('./config/brand');
app.locals.siteTitle = app.locals.brand.nome;
app.locals.siteDescription = app.locals.brand.mote;
app.locals.theme = {
  colorPrimary: '#000000',
  colorSecondary: '#000000',
  colorAccent: '#A8A8A8',
  colorText: '#f4f6f8',
  colorHighlight: '#C0C0C0'
};

// Helper de imagens de produto (variantes otimizadas: full/medium/small/thumb)
app.locals.productImg = require('./utils/productImageProcessor').productImg;

// Add user to all routes
app.use((req, res, next) => {
  try {
    if (req.session) {
      if (req.session.user) {
        res.locals.user = req.session.user;
      } else {
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }
    next();
  } catch (error) {
    console.error('Erro no middleware de usuário:', error);
    next(error);
  }
});

// Protecção por password de site — desactivada em dev
// Para activar em produção: definir SITE_PASSWORD no .env do servidor

/* // Comentado para evitar dupla inicialização do servidor. server.js é o responsável.
// Inicialização direta do servidor Express
const server = app.listen(app.get('port'), () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${' '.repeat(15)}Gonzaga's Art & Shine`);
  console.log(`${' '.repeat(10)}Ambiente: ${app.get('env')}`);
  console.log(`${' '.repeat(10)}Servidor rodando em http://localhost:${app.get('port')}`);
  console.log(`${'='.repeat(50)}\n`);
});
*/

// Módulos e-commerce e pagamentos — ANTES dos routers principais para que
// res.locals.ecommerceEnabled chegue ao catálogo e restantes views públicas
const { initializeModules } = require('./config/modules');
initializeModules(app);

// Routers principais - registrados apenas uma vez, fora de qualquer função
const staticRouter = require('./routes/static');
app.use(staticRouter);
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);
const cookieConsentRouter = require('./routes/cookie-consent');
app.use(cookieConsentRouter);
const userRightsRouter = require('./routes/user-rights');
app.use(userRightsRouter);
const seoRouter = require('./routes/seo');
app.use(seoRouter);

// API — módulo Instagram (rotas específicas antes do router /api genérico)
const instagramModule = require('./modules/instagram');
app.use('/api/instagram', instagramModule.routes);

// API routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// === FASE 5: MEDIA ROUTES ===
const mediaRoutes = require('./routes/admin/media');
app.use('/admin', mediaRoutes);

// === FASE 6: ANALYTICS ROUTES ===
const analyticsRoutes = require('./routes/admin/analytics');
app.use('/admin', analyticsRoutes);

// === ANALYTICS CRON JOB (Daily Stats) ===
const cron = require('node-cron');
const Analytics = require('./models/Analytics');

// Run daily at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    try {
        await Analytics.generateDailyStats();
        console.log(`✅ Daily stats generated: ${new Date().toISOString()}`);
    } catch (error) {
        console.error('❌ Error generating daily stats:', error);
    }
});

// Tratamento de erros 404 (deve ficar APÓS todos os routers)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - 404 Not Found: ${req.url}`);
  res.status(404).render('error', {
    title: 'Página não encontrada',
    message: 'A página que você está procurando não existe ou foi movida.'
  });
});

// Error handling middleware with more details
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // Log the error
  console.error('Error stack:', err.stack);

  // Render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: 'Something went wrong on our end.',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : {},
    layout: false
  });
});

// Exporta o app para testes
module.exports = app;