console.log('--- LOADING controllers/AuthController.js ---');
const BaseController = require('./BaseController');
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');

class AuthController extends BaseController {
  constructor() {
    super({}); // Pass an empty object or a relevant model if BaseController expects one
    this.User = User;
  }

  // Exibir formulário de login
  showLoginForm(req, res) {
    res.render('admin/auth/login', {
      layout: 'admin/layouts/auth',
      title: 'Login - Admin',
      error_msg: req.flash('error'),
      success_msg: req.flash('success')
    });
  }

  // Processar login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validação básica
      if (!email || !password) {
        req.flash('error', 'Email e senha são obrigatórios');
        return res.redirect('/admin/login');
      }

      // Buscar usuário
      const user = await User.findByEmail(email);
      if (!user) {
        req.flash('error', 'Credenciais inválidas');
        return res.redirect('/admin/login');
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        req.flash('error', 'Credenciais inválidas');
        return res.redirect('/admin/login');
      }

      // Verificar se é admin
      if (user.role !== 'admin') {
        req.flash('error', 'Acesso negado. Apenas administradores podem acessar esta área.');
        return res.redirect('/admin/login');
      }

      // Salvar na sessão
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      // Mensagem de sucesso e redirecionamento
      req.flash('success', `Bem-vindo, ${user.name}! Login realizado com sucesso.`);
      return res.redirect('/admin?login=success');

    } catch (error) {
      console.error('Erro no login:', error);
      req.flash('error', 'Erro interno do servidor. Tente novamente.');
      return res.redirect('/admin/login');
    }
  }

  // Logout
  logout(req, res) {
    const userName = req.session.user ? req.session.user.name : 'Usuário';
    
    // Preparar mensagem antes de destruir a sessão
    const logoutMessage = `Logout realizado com sucesso. Até logo, ${userName}!`;
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao fazer logout:', err);
        return res.redirect('/admin/login?error=logout_failed');
      }
      
      // Clearar cookie de sessão
      res.clearCookie('connect.sid');
      
      // Redirecionar para login (sem flash messages já que a sessão foi destruída)
      res.redirect('/admin/login?logout=success');
    });
  }

  // Verificar se está autenticado (middleware)
  requireAuth(req, res, next) {
    if (!req.session.user) {
      req.flash('warning', 'Você precisa fazer login para acessar esta área');
      return res.redirect('/admin/login');
    }
    
    // Verificar se é admin
    if (req.session.user.role !== 'admin') {
      req.flash('error', 'Acesso negado. Permissões insuficientes.');
      return res.redirect('/admin/login');
    }
    
    next();
  }

  // Verificar se já está logado (redireciona se já autenticado)
  redirectIfAuthenticated(req, res, next) {
    if (req.session.user) {
      req.flash('info', 'Você já está logado no sistema');
      return res.redirect('/admin');
    }
    next();
  }
}

module.exports = new AuthController();
