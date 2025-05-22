const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../../../config/config');

class AuthService {
  /**
   * Autentica um usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token JWT
   */
  static async authenticate(email, password) {
    try {
      // Busca o usuário pelo email
      const user = await User.findOne({ where: { email } });
      
      // Verifica se o usuário existe
      if (!user) {
        throw new Error('Credenciais inválidas');
      }
      
      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }
      
      // Gera o token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Atualiza o último login
      await user.update({ lastLogin: new Date() });
      
      // Retorna os dados do usuário e o token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      console.error('Erro no serviço de autenticação:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se um token JWT é válido
   * @param {string} token - Token JWT
   * @returns {Promise<Object>} Dados decodificados do token
   */
  static async verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw new Error('Token inválido ou expirado');
    }
  }
  
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Novo usuário criado
   */
  static async register(userData) {
    try {
      // Verifica se o email já está em uso
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
      
      // Cria o novo usuário
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user'
      });
      
      // Remove a senha do objeto de retorno
      const userJson = user.toJSON();
      delete userJson.password;
      
      return userJson;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
