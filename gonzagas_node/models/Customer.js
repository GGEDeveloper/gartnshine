const BaseModel = require('./BaseModel');

class Customer extends BaseModel {
  static tableName = 'customers';
  static primaryKey = 'id';

  /**
   * Busca um cliente pelo email
   */
  static async findByEmail(email) {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM customers WHERE email = ? AND deleted_at IS NULL LIMIT 1',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Customer findByEmail:', error);
      throw error;
    }
  }

  /**
   * Busca um cliente pelo token de redefinição de senha
   */
  static async findByResetToken(token) {
    try {
      const [rows] = await this.pool.query(
        `SELECT * FROM customers 
         WHERE password_reset_token = ? 
         AND password_reset_expires > NOW() 
         AND deleted_at IS NULL 
         LIMIT 1`,
        [token]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Customer findByResetToken:', error);
      throw error;
    }
  }

  /**
   * Atualiza a senha do cliente
   */
  static async updatePassword(id, password) {
    try {
      const hashedPassword = await this.hashPassword(password);
      const [result] = await this.pool.query(
        `UPDATE customers 
         SET password_hash = ?, 
             password_reset_token = NULL, 
             password_reset_expires = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [hashedPassword, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Customer updatePassword:', error);
      throw error;
    }
  }

  /**
   * Define o token de redefinição de senha
   */
  static async setPasswordResetToken(id, token, expiresInHours = 1) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const [result] = await this.pool.query(
        `UPDATE customers 
         SET password_reset_token = ?, 
             password_reset_expires = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [token, expiresAt, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Customer setPasswordResetToken:', error);
      throw error;
    }
  }

  /**
   * Atualiza o último login do cliente
   */
  static async updateLastLogin(id) {
    try {
      await this.pool.query(
        'UPDATE customers SET last_login = NOW(), updated_at = NOW() WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error in Customer updateLastLogin:', error);
      throw error;
    }
  }

  /**
   * Incrementa o contador de tentativas de login
   */
  static async incrementLoginAttempts(id) {
    try {
      await this.pool.query(
        'UPDATE customers SET login_attempts = IFNULL(login_attempts, 0) + 1, updated_at = NOW() WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error in Customer incrementLoginAttempts:', error);
      throw error;
    }
  }

  /**
   * Verifica se o cliente está bloqueado por excesso de tentativas de login
   */
  static async isLockedOut(id) {
    try {
      const [rows] = await this.pool.query(
        `SELECT login_attempts, last_login_attempt 
         FROM customers 
         WHERE id = ? AND deleted_at IS NULL 
         LIMIT 1`,
        [id]
      );
      
      if (!rows[0]) return false;
      
      const { login_attempts, last_login_attempt } = rows[0];
      const maxAttempts = process.env.MAX_LOGIN_ATTEMPTS || 5;
      const lockoutMinutes = process.env.LOGIN_LOCKOUT_MINUTES || 30;
      
      // Se não houver tentativas ou se a última tentativa foi há mais tempo que o período de bloqueio
      if (!login_attempts || !last_login_attempt) return false;
      
      const lastAttempt = new Date(last_login_attempt);
      const lockoutUntil = new Date(lastAttempt.getTime() + (lockoutMinutes * 60 * 1000));
      
      // Verifica se excedeu o número máximo de tentativas e se ainda está no período de bloqueio
      return login_attempts >= maxAttempts && new Date() < lockoutUntil;
    } catch (error) {
      console.error('Error in Customer isLockedOut:', error);
      throw error;
    }
  }

  /**
   * Reseta o contador de tentativas de login
   */
  static async resetLoginAttempts(id) {
    try {
      await this.pool.query(
        'UPDATE customers SET login_attempts = 0, last_login_attempt = NULL, updated_at = NOW() WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error in Customer resetLoginAttempts:', error);
      throw error;
    }
  }

  /**
   * Busca clientes por critérios de pesquisa
   */
  static async search(query, limit = 10, offset = 0) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await this.pool.query(
        `SELECT id, name, email, phone, tax_number, created_at 
         FROM customers 
         WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ? OR tax_number LIKE ?)
         AND deleted_at IS NULL
         LIMIT ? OFFSET ?`,
        [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
      );
      
      // Contar o total de resultados para paginação
      const [countRows] = await this.pool.query(
        `SELECT COUNT(*) as total 
         FROM customers 
         WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ? OR tax_number LIKE ?)
         AND deleted_at IS NULL`,
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      
      const total = countRows[0].total;
      
      return {
        data: rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in Customer search:', error);
      throw error;
    }
  }

  /**
   * Atualiza o perfil do cliente
   */
  static async updateProfile(id, data) {
    try {
      // Remover campos que não devem ser atualizados diretamente
      const { password, email, ...profileData } = data;
      
      // Se houver senha, criptografar antes de salvar
      if (password) {
        const hashedPassword = await this.hashPassword(password);
        profileData.password_hash = hashedPassword;
      }
      
      return this.update(id, profileData);
    } catch (error) {
      console.error('Error in Customer updateProfile:', error);
      throw error;
    }
  }
}

module.exports = new Customer();
