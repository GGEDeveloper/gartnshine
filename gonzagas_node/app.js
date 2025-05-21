const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/config');
const db = require('./config/database');

// Initialize the app
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(config.session));
app.use(flash());

// Logging middleware
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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

// Removed site-wide password middleware

// Error logging middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  next(err);
});

// Routes
app.use(require('./routes/static')); // Rotas estáticas (favicon.ico, etc.)
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

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

// Start the server
const PORT = config.port;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  // Test database connection
  await db.testConnection();
});

module.exports = app; 