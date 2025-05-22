/**
 * Módulo Core
 * 
 * Este módulo contém as funcionalidades essenciais do sistema,
 * incluindo autenticação, gerenciamento de usuários e configurações.
 */

const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const settingsController = require('./controllers/settingsController');

const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const authService = require('./services/authService');
const userService = require('./services/userService');
const permissionService = require('./services/permissionService');

module.exports = {
  // Controllers
  controllers: {
    auth: authController,
    user: userController,
    settings: settingsController
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
    user: userRoutes,
    settings: settingsRoutes
  },
  
  // Services
  services: {
    auth: authService,
    user: userService,
    permission: permissionService
  }
};
