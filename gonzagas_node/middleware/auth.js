const config = require('../config/config');

/**
 * Middleware para verificar se o usuário está autenticado
 */
const isAuthenticated = (req, res, next) => {
  // Rotas que não requerem autenticação
  const publicPaths = ['/login', '/logout', '/favicon.ico'];
  
  // Verifica se a rota atual é pública
  const isPublicPath = publicPaths.some(path => req.path.endsWith(path));
  
  // Se for uma rota pública, permite o acesso
  if (isPublicPath) {
    return next();
  }
  
  // Verifica se o usuário está autenticado
  if (req.session && req.session.user) {
    // Se estiver autenticado, permite o acesso
    return next();
  }
  
  // Se não estiver autenticado, redireciona para a página de login
  return res.redirect('/admin/login');
};

/**
 * Autentica um usuário com credenciais
 */
const authenticateUser = (username, password) => {
  console.log('=== AUTENTICANDO USUÁRIO ===');
  console.log('Usuário fornecido:', username);
  console.log('Senha fornecida:', password ? '***' : 'não fornecida');
  console.log('Usuário esperado:', config.adminUser);
  
  // Verifica se as credenciais são válidas
  if (username === config.adminUser && password === config.adminPass) {
    const user = { 
      username: config.adminUser,
      role: 'admin',
      lastLogin: new Date().toISOString()
    };
    console.log('Autenticação bem-sucedida para usuário:', user);
    return user;
  }
  
  console.log('Falha na autenticação: credenciais inválidas');
  return null;
};

/**
 * Handle site-wide password
 */
const checkSitePassword = (req, res, next) => {
  // If already authorized, continue
  if (req.session.siteAccess) {
    return next();
  }

  // Check for password in cookies
  if (req.cookies && req.cookies.sitePassword === config.sitePassword) {
    req.session.siteAccess = true;
    return next();
  }

  // Skip for site password page and static assets
  if (req.path === '/site-password' || 
      req.path.startsWith('/public/') || 
      req.path.startsWith('/media/') ||
      req.path.startsWith('/css/') ||
      req.path.startsWith('/js/') ||
      req.path.startsWith('/images/') ||
      req.path.startsWith('/favicon.ico')) {
    return next();
  }

  // If this is a POST to the password page, check the password
  if (req.path === '/site-password' && req.method === 'POST') {
    const { sitePassword } = req.body;
    
    if (!sitePassword) {
      req.flash('error_msg', 'Please enter the password');
      return res.redirect('/site-password');
    }
    
    if (sitePassword === config.sitePassword) {
      req.session.siteAccess = true;
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return res.redirect(redirectTo);
    }
    
    req.flash('error_msg', 'Invalid password');
    return res.redirect('/site-password');
  }

  // Save the requested URL and show password page
  req.session.returnTo = req.originalUrl;
  res.render('site-password', {
    title: 'Enter Password',
    error_msg: req.flash('error_msg')
  });
};

module.exports = {
  isAuthenticated,
  authenticateUser,
  checkSitePassword
}; 