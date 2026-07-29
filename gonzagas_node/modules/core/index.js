/**
 * Módulo Core
 * 
 * Este módulo contém as funcionalidades essenciais do sistema,
 * incluindo autenticação, gerenciamento de usuários e configurações.
 */

const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const authService = require('./services/authService');
const userService = require('./services/userService');
const permissionService = require('./services/permissionService');

module.exports = {
  // Controllers
  controllers: {
    auth: authController,
    user: userController
  },

  // Models
  models: {
    User,
    Role,
    Permission
  },

  // Routes
  routes: {
    auth: authRoutes,
    user: userRoutes
  },
  
  // Services
  services: {
    auth: authService,
    user: userService,
    permission: permissionService
  }
};
