const BaseController = require('./BaseController');
const { body } = require('express-validator');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class CustomerController extends BaseController {
  constructor() {
    // Supondo que temos um modelo Customer
    super({ 
      getAll: async () => { /* implementação */ },
      getById: async () => { /* implementação */ },
      create: async () => { /* implementação */ },
      update: async () => { /* implementação */ },
      delete: async () => { /* implementação */ }
    });
  }

  // Validação para criação/atualização de clientes
  static validate(requirePassword = true) {
    const validations = [
      body('name').notEmpty().withMessage('Name is required'),
      body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
      body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
      body('tax_number').optional().isString().withMessage('Tax number must be a string'),
      body('address').optional().isString().withMessage('Address must be a string'),
      body('city').optional().isString().withMessage('City must be a string'),
      body('postal_code').optional().isPostalCode('any').withMessage('Invalid postal code'),
      body('country').optional().isString().withMessage('Country must be a string'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];

    if (requirePassword) {
      validations.push(
        body('password')
          .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
          .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
          .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
          .matches(/[0-9]/).withMessage('Password must contain at least one number')
      );
    }

    return validations;
  }

  // Registrar novo cliente
  async register(req, res) {
    try {
      // Validação dos dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return this.error(res, 'Validation failed', 400, errors);
      }

      const { email, password, ...customerData } = req.body;

      // Verificar se o email já está em uso
      const existingCustomer = await this.model.getByEmail(email);
      if (existingCustomer) {
        return this.error(res, 'Email already in use', 400);
      }

      // Criptografar senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Criar cliente
      const newCustomer = await this.model.create({
        ...customerData,
        email,
        password_hash: hashedPassword,
        verification_token: uuidv4(),
        is_active: false // Ativar após verificação de email
      });

      // Enviar email de verificação (implementar depois)
      // await sendVerificationEmail(newCustomer.email, newCustomer.verification_token);

      return this.success(res, { 
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        message: 'Registration successful. Please check your email to verify your account.'
      }, 201);
    } catch (error) {
      console.error('Error in customer registration:', error);
      return this.error(res, 'Registration failed', 500);
    }
  }

  // Login de cliente
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar entrada
      if (!email || !password) {
        return this.error(res, 'Email and password are required', 400);
      }

      // Buscar cliente pelo email
      const customer = await this.model.getByEmail(email);
      if (!customer) {
        return this.error(res, 'Invalid credentials', 401);
      }

      // Verificar senha
      const isMatch = await bcrypt.compare(password, customer.password_hash);
      if (!isMatch) {
        // Incrementar tentativas de login
        await this.model.incrementLoginAttempts(customer.id);
        return this.error(res, 'Invalid credentials', 401);
      }

      // Verificar se a conta está ativa
      if (!customer.is_active) {
        return this.error(res, 'Account is not active. Please check your email to verify your account.', 403);
      }

      // Gerar token JWT (implementar depois)
      const token = 'generated-jwt-token';

      // Atualizar último login
      await this.model.updateLastLogin(customer.id);

      return this.success(res, {
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email
        }
      });
    } catch (error) {
      console.error('Error in customer login:', error);
      return this.error(res, 'Login failed', 500);
    }
  }

  // Solicitar redefinição de senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return this.error(res, 'Email is required', 400);
      }

      const customer = await this.model.getByEmail(email);
      if (!customer) {
        // Não revelar que o email não existe por questões de segurança
        return this.success(res, { message: 'If your email is registered, you will receive a password reset link' });
      }

      // Gerar token de redefinição
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hora

      await this.model.update(customer.id, {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });

      // Enviar email com link de redefinição (implementar depois)
      // await sendPasswordResetEmail(customer.email, resetToken);

      return this.success(res, { 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    } catch (error) {
      console.error('Error in forgot password:', error);
      return this.error(res, 'Failed to process password reset request', 500);
    }
  }

  // Redefinir senha
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Validar senha
      const passwordErrors = validationResult(
        req,
        [
          body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one number')
        ]
      );

      if (!passwordErrors.isEmpty()) {
        return this.error(res, 'Validation failed', 400, passwordErrors);
      }

      // Buscar cliente pelo token
      const customer = await this.model.getByResetToken(token);
      if (!customer || new Date() > customer.password_reset_expires) {
        return this.error(res, 'Invalid or expired token', 400);
      }

      // Criptografar nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Atualizar senha e limpar token
      await this.model.update(customer.id, {
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null
      });

      return this.success(res, { message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return this.error(res, 'Failed to reset password', 500);
    }
  }
}

module.exports = new CustomerController();
