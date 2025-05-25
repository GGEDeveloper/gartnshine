const { pool } = require('../../../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Encontra um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Encontra um usuário pelo ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  static async create(userData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [
          userData.name,
          userData.email,
          hashedPassword,
          userData.role || 'user'
        ]
      );

      await connection.commit();
      
      // Retorna o usuário criado (sem a senha)
      const user = await this.findById(result.insertId);
      return user;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Atualiza um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados a serem atualizados
   * @returns {Promise<Object|null>} Usuário atualizado ou null se não encontrado
   */
  static async update(id, userData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Se a senha estiver sendo atualizada, faz o hash
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const updateFields = [];
      const params = [];
      
      // Constrói a query dinamicamente com base nos campos fornecidos
      Object.entries(userData).forEach(([key, value]) => {
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
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      await connection.commit();
      
      // Retorna o usuário atualizado
      const user = await this.findById(id);
      return user;
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Verifica se a senha fornecida corresponde à senha do usuário
   * @param {string} password - Senha fornecida
   * @param {string} hashedPassword - Senha hashada do banco de dados
   * @returns {Promise<boolean>} true se a senha estiver correta, false caso contrário
   */
  static async validatePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      return false;
    }
  }

  /**
   * Verifica se um email já está em uso
   * @param {string} email - Email a ser verificado
   * @param {number} [excludeId] - ID do usuário a ser excluído da verificação (para atualizações)
   * @returns {Promise<boolean>} true se o email já estiver em uso, false caso contrário
   */
  static async isEmailTaken(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM users WHERE email = ?';
      const params = [email];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error('Erro ao verificar email em uso:', error);
      throw error;
    }
  }
}

module.exports = User;
