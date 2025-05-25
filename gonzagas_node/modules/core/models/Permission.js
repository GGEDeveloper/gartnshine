const { pool } = require('../../../config/database');

class Permission {
  /**
   * Encontra uma permissão pelo nome
   * @param {string} name - Nome da permissão
   * @returns {Promise<Object|null>} Permissão encontrada ou null
   */
  static async findByName(name) {
    try {
      const [rows] = await pool.query('SELECT * FROM permissions WHERE name = ?', [name]);
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar permissão por nome:', error);
      throw error;
    }
  }

  /**
   * Encontra uma permissão pelo ID
   * @param {number} id - ID da permissão
   * @returns {Promise<Object|null>} Permissão encontrada ou null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM permissions WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar permissão por ID:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova permissão
   * @param {Object} permissionData - Dados da permissão
   * @returns {Promise<Object>} Permissão criada
   */
  static async create(permissionData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.query(
        'INSERT INTO permissions (name, description, resource, action) VALUES (?, ?, ?, ?)',
        [
          permissionData.name,
          permissionData.description,
          permissionData.resource,
          permissionData.action
        ]
      );
      
      await connection.commit();
      
      // Retorna a permissão criada
      const permission = await this.findById(result.insertId);
      return permission;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar permissão:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Atualiza uma permissão existente
   * @param {number} id - ID da permissão
   * @param {Object} permissionData - Dados a serem atualizados
   * @returns {Promise<Object|null>} Permissão atualizada ou null se não encontrada
   */
  static async update(id, permissionData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const updateFields = [];
      const params = [];
      
      // Constrói a query dinamicamente com base nos campos fornecidos
      Object.entries(permissionData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });
      
      if (updateFields.length === 0) {
        throw new Error('Nenhum campo válido para atualização fornecido');
      }
      
      // Adiciona o ID ao final dos parâmetros para o WHERE
      params.push(id);
      
      const [result] = await connection.query(
        `UPDATE permissions SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      await connection.commit();
      
      // Retorna a permissão atualizada
      const permission = await this.findById(id);
      return permission;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar permissão:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Remove uma permissão
   * @param {number} id - ID da permissão a ser removida
   * @returns {Promise<boolean>} true se a permissão foi removida, false caso contrário
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Remove as associações da permissão com as roles
      await connection.query('DELETE FROM role_permissions WHERE permission_id = ?', [id]);
      
      // Remove a permissão
      const [result] = await connection.query('DELETE FROM permissions WHERE id = ?', [id]);
      
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao remover permissão:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtém todas as permissões
   * @returns {Promise<Array>} Lista de permissões
   */
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM permissions ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      throw error;
    }
  }

  /**
   * Obtém as roles associadas a uma permissão
   * @param {number} permissionId - ID da permissão
   * @returns {Promise<Array>} Lista de roles associadas à permissão
   */
  static async getRoles(permissionId) {
    try {
      const [rows] = await pool.query(
        `SELECT r.* FROM roles r 
         INNER JOIN role_permissions rp ON r.id = rp.role_id 
         WHERE rp.permission_id = ?`,
        [permissionId]
      );
      return rows;
    } catch (error) {
      console.error('Erro ao buscar roles da permissão:', error);
      throw error;
    }
  }
}

module.exports = Permission;
