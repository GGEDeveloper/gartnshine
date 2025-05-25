const { pool } = require('../../../config/database');

class Role {
  /**
   * Encontra uma role pelo nome
   * @param {string} name - Nome da role
   * @returns {Promise<Object|null>} Role encontrada ou null
   */
  static async findByName(name) {
    try {
      const [rows] = await pool.query('SELECT * FROM roles WHERE name = ?', [name]);
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar role por nome:', error);
      throw error;
    }
  }

  /**
   * Encontra uma role pelo ID
   * @param {number} id - ID da role
   * @returns {Promise<Object|null>} Role encontrada ou null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar role por ID:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova role
   * @param {Object} roleData - Dados da role
   * @returns {Promise<Object>} Role criada
   */
  static async create(roleData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [roleData.name, roleData.description]
      );
      
      await connection.commit();
      
      // Retorna a role criada
      const role = await this.findById(result.insertId);
      return role;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar role:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Atualiza uma role existente
   * @param {number} id - ID da role
   * @param {Object} roleData - Dados a serem atualizados
   * @returns {Promise<Object|null>} Role atualizada ou null se não encontrada
   */
  static async update(id, roleData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const updateFields = [];
      const params = [];
      
      // Constrói a query dinamicamente com base nos campos fornecidos
      Object.entries(roleData).forEach(([key, value]) => {
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
        `UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      await connection.commit();
      
      // Retorna a role atualizada
      const role = await this.findById(id);
      return role;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar role:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Remove uma role
   * @param {number} id - ID da role a ser removida
   * @returns {Promise<boolean>} true se a role foi removida, false caso contrário
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Remove as permissões associadas à role
      await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [id]);
      
      // Remove a role
      const [result] = await connection.query('DELETE FROM roles WHERE id = ?', [id]);
      
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao remover role:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtém todas as roles
   * @returns {Promise<Array>} Lista de roles
   */
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM roles ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw error;
    }
  }

  /**
   * Adiciona uma permissão a uma role
   * @param {number} roleId - ID da role
   * @param {number} permissionId - ID da permissão
   * @returns {Promise<boolean>} true se a permissão foi adicionada, false caso contrário
   */
  static async addPermission(roleId, permissionId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Verifica se a associação já existe
      const [existing] = await connection.query(
        'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [roleId, permissionId]
      );
      
      if (existing.length > 0) {
        return true; // Já existe a associação
      }
      
      // Adiciona a associação
      await connection.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleId, permissionId]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao adicionar permissão à role:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Remove uma permissão de uma role
   * @param {number} roleId - ID da role
   * @param {number} permissionId - ID da permissão
   * @returns {Promise<boolean>} true se a permissão foi removida, false caso contrário
   */
  static async removePermission(roleId, permissionId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.query(
        'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [roleId, permissionId]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao remover permissão da role:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtém todas as permissões de uma role
   * @param {number} roleId - ID da role
   * @returns {Promise<Array>} Lista de permissões da role
   */
  static async getPermissions(roleId) {
    try {
      const [rows] = await pool.query(
        `SELECT p.* FROM permissions p 
         INNER JOIN role_permissions rp ON p.id = rp.permission_id 
         WHERE rp.role_id = ?`,
        [roleId]
      );
      return rows;
    } catch (error) {
      console.error('Erro ao buscar permissões da role:', error);
      throw error;
    }
  }
}

module.exports = Role;
