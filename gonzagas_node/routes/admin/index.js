const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { formatError } = require('../../utils/error-handler');

// Middleware para verificar autenticação e permissões de admin
router.use(requireAuth());
router.use(requireRole('admin'));

// Middleware para adicionar variáveis comuns às views
router.use((req, res, next) => {
  // Configurações gerais do painel
  res.locals.app = {
    name: process.env.APP_NAME || 'Gonzaga\'s Art & Shine',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.APP_URL || 'http://localhost:3000',
    adminPath: '/admin',
    currentUrl: req.originalUrl,
    user: req.user
  };
  
  // Configurações do painel administrativo
  res.locals.admin = {
    title: 'Painel Administrativo',
    description: 'Gerenciamento do sistema',
    layout: 'admin/layouts/modular',
    sidebarCollapsed: req.cookies.sidebarCollapsed === 'true',
    darkMode: req.cookies.darkMode === 'true',
    modules: {}
  };
  
  // Adiciona mensagens flash
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info'),
    warning: req.flash('warning')
  };
  
  next();
});

// Rota principal do painel administrativo
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    breadcrumbs: [
      { text: 'Dashboard' }
    ]
  });
});

// Carregar módulos dinamicamente
const modulesPath = path.join(__dirname, 'modules');

// Verifica se o diretório de módulos existe
if (fs.existsSync(modulesPath)) {
  // Lê todos os arquivos no diretório de módulos
  const moduleFiles = fs.readdirSync(modulesPath)
    .filter(file => file.endsWith('.js'));
  
  // Carrega cada módulo
  moduleFiles.forEach(file => {
    try {
      const moduleName = path.basename(file, '.js');
      const modulePath = `./modules/${moduleName}`;
      const moduleRouter = require(modulePath);
      
      // Adiciona as rotas do módulo
      router.use(`/${moduleName}`, moduleRouter);
      
      console.log(`Módulo carregado: ${moduleName}`);
    } catch (error) {
      console.error(`Erro ao carregar o módulo ${file}:`, error);
    }
  });
}

// Rotas de usuários
const usersRouter = require('./users');
router.use('/users', usersRouter);

// Rotas de perfil
const profileRouter = require('./profile');
router.use('/profile', profileRouter);

// Rotas de configurações
const settingsRouter = require('./settings');
router.use('/settings', settingsRouter);

// Rotas de produtos (exemplo de rota modular)
const productsRouter = require('./products');
router.use('/products', productsRouter);

// Rota para alternar o tema escuro/claro
router.post('/toggle-theme', (req, res) => {
  const darkMode = req.cookies.darkMode !== 'true';
  res.cookie('darkMode', darkMode, { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    httpOnly: true 
  });
  res.json({ success: true, darkMode });
});

// Rota para alternar a barra lateral
router.post('/toggle-sidebar', (req, res) => {
  const collapsed = req.cookies.sidebarCollapsed !== 'true';
  res.cookie('sidebarCollapsed', collapsed, { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    httpOnly: true 
  });
  res.json({ success: true, collapsed });
});

// Manipulador de erros 404 para rotas do admin
router.use((req, res, next) => {
  res.status(404).render('admin/errors/404', {
    title: 'Página não encontrada',
    layout: 'admin/layouts/modular',
    breadcrumbs: [
      { text: 'Erro 404' }
    ]
  });
});

// Manipulador de erros global para rotas do admin
router.use((err, req, res, next) => {
  console.error('Erro no painel administrativo:', err);
  
  // Se for uma resposta JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro no servidor',
      error: process.env.NODE_ENV === 'development' ? formatError(err) : {}
    });
  }
  
  // Se for uma requisição normal
  res.status(500).render('admin/errors/500', {
    title: 'Erro no servidor',
    layout: 'admin/layouts/modular',
    error: process.env.NODE_ENV === 'development' ? err : {},
    breadcrumbs: [
      { text: 'Erro 500' }
    ]
  });
});

module.exports = router;
