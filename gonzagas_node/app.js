require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const { pool } = require('./config/database');

// Carrega as configurações
const config = require('./config/config');

// Inicializa o aplicativo Express
const app = express();

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

app.use(session(sessionConfig));
app.use(flash());

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
    version: process.env.APP_VERSION || '1.0.0',
    environment: app.get('env'),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  };
  
  // Flash messages
  res.locals.messages = require('express-messages')(req, res);
  
  // Usuário autenticado
  res.locals.user = req.user || null;
  
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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://artnshine.pt'
      ],
      scriptSrcAttr: [
        "'self'",
        "'unsafe-inline'"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://artnshine.pt',
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      styleSrcElem: [
        "'self'",
        "'unsafe-inline'",
        'https://artnshine.pt',
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        'https://artnshine.pt',
        "https://fonts.gstatic.com", 
        "https://cdnjs.cloudflare.com",
        "data:"
      ],
      imgSrc: [
        "'self'", 
        'https://artnshine.pt',
        "data:", 
        "blob:", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      mediaSrc: [
        "'self'", 
        'https://artnshine.pt',
        "data:", 
        "blob:", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      formAction: [
        "'self'", 
        'https://artnshine.pt',
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      connectSrc: [
        "'self'", 
        'https://artnshine.pt',
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000",
        'wss://artnshine.pt'
      ]
    }
  },
  // Disable HTTPS-related headers
  strictTransportSecurity: false,
  expectCt: false
}));

app.use(cors({
  origin: config.baseUrl,
  credentials: true
}));

// Serve static files with proper headers and MIME types
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: function (res, filePathString, stat) { 
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
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm',
      '.ico': 'image/x-icon' // MIME type for favicon.ico
    };
    
    // Set the Content-Type header
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  }
}));

// Handle 404 for static files
app.use(['/css/*', '/js/*', '/*.ico', '/*.png', '/*.jpg', '/*.jpeg', '/*.gif', '/*.svg'], (req, res) => {
  console.error(`Static file not found: ${req.originalUrl}`);
  res.status(404).send('File not found');
});
app.use('/media', express.static(path.join(__dirname, 'public', 'uploads', 'products')));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global app variables
app.locals.siteTitle = 'Gonzaga\'s Art & Shine';
app.locals.siteDescription = 'Elegância que nasce da terra';
app.locals.theme = {
  colorPrimary: '#1a1a1a',
  colorSecondary: '#2d2d2d',
  colorAccent: '#c0a080',
  colorText: '#ffffff',
  colorHighlight: '#d4b190'
};

// Add user to all routes
app.use((req, res, next) => {
  try {
    // Garantir que a sessão seja salva
    if (req.session) {
      // Manter o acesso ao site ativo
      req.session.siteAccess = true;
      
      // Se o usuário estiver autenticado, adicionar aos locais
      if (req.session.user) {
        res.locals.user = req.session.user;
      } else {
        res.locals.user = null;
      }
    } else {
      console.log('Sessão não disponível');
      res.locals.user = null;
    }
    next();
  } catch (error) {
    console.error('Erro no middleware de usuário:', error);
    next(error);
  }
});

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

// Routers principais - registrados apenas uma vez, fora de qualquer função
const staticRouter = require('./routes/static');
app.use(staticRouter);
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

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
    } : {}
  });
});

// Tratamento de erros 404
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - 404 Not Found: ${req.url}`);
  res.status(404).render('error', {
    title: 'Página não encontrada',
    message: 'A página que você está procurando não existe ou foi movida.'
  });
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  next(err);
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  // Define as variáveis de resposta
  const statusCode = err.status || 500;
  const message = app.get('env') === 'development' ? err.message : 'Ocorreu um erro no servidor';
  const stack = app.get('env') === 'development' ? err.stack : null;
  
  // Log do erro
  console.error(`[${new Date().toISOString()}] Erro: ${message}`);
  console.error(stack || 'No stack trace available');
  
  // Resposta para requisições de API
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(app.get('env') === 'development' && { stack })
    });
  }
  
  // Renderiza a página de erro
  res.status(statusCode).render('error/500', {
    title: 'Erro no servidor',
    message,
    stack: app.get('env') === 'development' ? err.stack : null
  });
});

// Exporta o app para testes
module.exports = app;