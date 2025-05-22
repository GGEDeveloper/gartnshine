const User = require('../models/User');

class UserService {
  /**
   * Busca todos os usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  static async findAll() {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['name', 'ASC']]
      });
      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
  
  /**
   * Busca um usuário pelo ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  static async findById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      return user;
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Novo usuário criado
   */
  static async create(userData) {
    try {
      const user = await User.create(userData);
      
      // Remove a senha do objeto de retorno
      const userJson = user.toJSON();
      delete userJson.password;
      
      return userJson;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} userData - Novos dados do usuário
   * @returns {Promise<Object>} Usuário atualizado
   */
  static async update(id, userData) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualiza os dados do usuário
      await user.update(userData);
      
      // Remove a senha do objeto de retorno
      const userJson = user.toJSON();
      delete userJson.password;
      
      return userJson;
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove um usuário
   * @param {number} id - ID do usuário
   * @returns {Promise<boolean>} True se o usuário foi removido com sucesso
   */
  static async delete(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      await user.destroy();
      return true;
    } catch (error) {
      console.error(`Erro ao remover usuário com ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = UserService;
