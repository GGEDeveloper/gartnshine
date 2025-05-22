const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Encontra um usuário pelo email
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

  // Encontra um usuário pelo ID
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

  // Cria um novo usuário
  static async create(userData) {
    try {
      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, userData.role || 'user']
      );

      return this.findById(result.insertId);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualiza um usuário existente
  static async update(id, userData) {
    try {
      const updateData = { ...userData };
      
      // Se uma nova senha for fornecida, faz o hash
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      } else {
        delete updateData.password; // Remove a senha se não for fornecida
      }

      const fields = [];
      const values = [];
      
      // Prepara os campos para atualização
      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });
      
      values.push(id); // Adiciona o ID no final para a cláusula WHERE

      const [result] = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Verifica se a senha está correta
  static async validatePassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      throw error;
    }
  }
}

module.exports = User;
