const Role = require('../models/Role');
const Permission = require('../models/Permission');

class PermissionService {
  /**
   * Verifica se um usuário tem uma permissão específica
   * @param {number} userId - ID do usuário
   * @param {string} resource - Recurso a ser acessado
   * @param {string} action - Ação a ser realizada
   * @returns {Promise<boolean>} True se o usuário tem a permissão
   */
  static async hasPermission(userId, resource, action) {
    try {
      // TODO: Implementar lógica de verificação de permissão
      // Por enquanto, retorna true para permitir o acesso
      return true;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      throw error;
    }
  }
  
  /**
   * Obtém todas as permissões de um usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<Array>} Lista de permissões do usuário
   */
  static async getUserPermissions(userId) {
    try {
      // TODO: Implementar lógica para obter permissões do usuário
      // Por enquanto, retorna um array vazio
      return [];
    } catch (error) {
      console.error('Erro ao obter permissões do usuário:', error);
      throw error;
    }
  }
  
  /**
   * Obtém todas as permissões disponíveis
   * @returns {Promise<Array>} Lista de todas as permissões
   */
  static async getAllPermissions() {
    try {
      const permissions = await Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });
      return permissions;
    } catch (error) {
      console.error('Erro ao obter permissões:', error);
      throw error;
    }
  }
  
  /**
   * Cria uma nova permissão
   * @param {Object} permissionData - Dados da permissão
   * @returns {Promise<Object>} Nova permissão criada
   */
  static async createPermission(permissionData) {
    try {
      const permission = await Permission.create(permissionData);
      return permission;
    } catch (error) {
      console.error('Erro ao criar permissão:', error);
      throw error;
    }
  }
  
  /**
   * Remove uma permissão
   * @param {number} id - ID da permissão
   * @returns {Promise<boolean>} True se a permissão foi removida com sucesso
   */
  static async deletePermission(id) {
    try {
      const permission = await Permission.findByPk(id);
      
      if (!permission) {
        throw new Error('Permissão não encontrada');
      }
      
      await permission.destroy();
      return true;
    } catch (error) {
      console.error(`Erro ao remover permissão com ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = PermissionService;
