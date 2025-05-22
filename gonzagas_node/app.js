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
const { initialize: initializeDatabase } = require('./config/database');
const { initializeModules } = require('./config/modules');

// Carrega as configurações
const config = require('./config/config');

// Inicializa o aplicativo Express
const app = express();

// Configuração global de variáveis
app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 3000);

// Configurações de view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(config.session));
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
      defaultSrc: ["'self'", "http://localhost:3000", "http://127.0.0.1:3000", "http://172.30.46.39:3000"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      scriptSrcAttr: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com"
      ],
      styleSrcElem: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "https://cdnjs.cloudflare.com",
        "data:"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "blob:", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      mediaSrc: [
        "'self'", 
        "data:", 
        "blob:", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      formAction: [
        "'self'", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
      ],
      connectSrc: [
        "'self'", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://172.30.46.39:3000"
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

// Static files - serve before any route handling
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, '../../media')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Inicializa os módulos
async function initializeApp() {
  try {
    // Inicializa o banco de dados
    await initializeDatabase();
    
    // Inicializa os módulos do sistema
    await initializeModules(app);
    
    // Rotas principais
    const indexRouter = require('./routes/index');
    const productsRouter = require('./routes/products');
    const adminRouter = require('./routes/admin');
    
    // Usa as rotas
    app.use('/', indexRouter);
    app.use('/products', productsRouter);
    app.use('/admin', adminRouter);
    
    // Inicia o servidor
    const server = app.listen(app.get('port'), () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`${' '.repeat(15)}Gonzaga's Art & Shine`);
      console.log(`${' '.repeat(10)}Ambiente: ${app.get('env')}`);
      console.log(`${' '.repeat(10)}Servidor rodando em http://localhost:${app.get('port')}`);
      console.log(`${'='.repeat(50)}\n`);
    });
    
    return server;
  } catch (error) {
    console.error('Falha ao inicializar o aplicativo:', error);
    process.exit(1);
  }
}

// Inicializa o aplicativo
initializeApp().catch(console.error);

// Error logging middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  next(err);
});

// Error handling middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - 404 Not Found: ${req.url}`);
  res.status(404).render('error', {
    title: '404 - Not Found',
    message: 'The page you are looking for does not exist.',
    error: {}
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
  res.status(404).render('error/404', {
    title: 'Página não encontrada',
    message: 'A página que você está procurando não existe ou foi movida.'
  });
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