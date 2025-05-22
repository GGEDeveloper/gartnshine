const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const config = require('../config/config');

/**
 * Verifica se o token JWT é válido
 */
const verifyToken = (token) => {
  try {
    if (!token) return null;
    
    // Remove o prefixo 'Bearer ' se existir
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

/**
 * Middleware para verificar se o usuário está autenticado via JWT
 */
const isAuthenticated = (req, res, next) => {
  // Rotas que não requerem autenticação
  const publicPaths = [
    '/api/v2/auth/login',
    '/api/v2/auth/register',
    '/api/v2/auth/forgot-password',
    '/api/v2/auth/reset-password/.*',
    '/api/v2/products',
    '/api/v2/products/featured',
    '/api/v2/products/family/.*',
    '/api/v2/products/.*',
    '/api/v2/suppliers',
    '/api/v2/suppliers/active',
    '/api/v2/suppliers/search',
    '/api/v2/suppliers/.*',
    '/favicon.ico'
  ];
  
  // Verifica se a rota atual é pública
  const isPublicPath = publicPaths.some(path => {
    const regex = new RegExp(`^${path.replace(/\*/g, '.*')}$`);
    return regex.test(req.path);
  });
  
  // Se for uma rota pública, permite o acesso
  if (isPublicPath) {
    return next();
  }
  
  // Verifica autenticação via JWT
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1] || req.cookies.token;
  
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido ou expirado' 
      });
    }
    
    // Adiciona o usuário à requisição
    req.user = decoded;
    return next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Não autorizado' 
    });
  }
};

/**
 * Middleware para verificar se o usuário tem uma determinada função
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Não autenticado' 
      });
    }
    
    // Se for um array de roles, verifica se o usuário tem alguma delas
    // Se for uma string, verifica se o usuário tem essa role
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado: permissão insuficiente' 
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar se o usuário é o dono do recurso
 */
const isOwner = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recurso não encontrado' 
        });
      }
      
      // Verifica se o usuário é o dono do recurso ou um administrador
      if (resource.user_id !== req.user.id && !req.user.roles.includes('admin')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado: você não é o proprietário deste recurso' 
        });
      }
      
      // Adiciona o recurso à requisição para uso posterior
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Error in isOwner middleware:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao verificar a propriedade do recurso' 
      });
    }
  };
};

/**
 * Gera um token JWT para o usuário
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles || ['user']
  };
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '1d'
  });
};

/**
 * Autentica um usuário com credenciais
 * @deprecated Use o AuthController em vez disso
 */
const authenticateUser = (username, password) => {
  console.log('=== AUTENTICANDO USUÁRIO ===');
  console.log('Usuário fornecido:', username);
  console.log('Senha fornecida:', password ? '***' : 'não fornecida');
  console.log('Usuário esperado:', config.adminUser);
  
  // Verifica se as credenciais são válidas
  if (username === config.adminUser && password === config.adminPass) {
    const user = { 
      id: 1,
      username: config.adminUser,
      email: 'admin@example.com',
      roles: ['admin'],
      lastLogin: new Date().toISOString()
    };
    
    // Gera o token JWT
    user.token = generateToken(user);
    
    console.log('Autenticação bem-sucedida para usuário:', user.username);
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