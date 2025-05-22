const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class BaseModel {
  static tableName = '';
  static primaryKey = 'id';
  static pool = pool;

  /**
   * Executa uma consulta SQL e retorna os resultados
   */
  static async query(sql, params = []) {
    try {
      const [rows] = await this.pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error(`Error in ${this.name} query:`, error);
      throw error;
    }
  }

  /**
   * Busca um registro pelo ID
   */
  static async findById(id) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error(`Error in ${this.name} findById:`, error);
      throw error;
    }
  }

  /**
   * Busca todos os registros com opções de paginação e filtro
   */
  static async findAll({
    where = {},
    orderBy = {},
    limit = 100,
    offset = 0
  } = {}) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      let whereClause = '';
      const params = [];
      
      // Construir cláusula WHERE
      const whereConditions = [];
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          whereConditions.push(`${key} = ?`);
          params.push(value);
        }
      });
      
      if (whereConditions.length > 0) {
        whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      }
      
      // Construir ORDER BY
      let orderByClause = '';
      if (Object.keys(orderBy).length > 0) {
        const orderConditions = [];
        Object.entries(orderBy).forEach(([key, direction]) => {
          orderConditions.push(`${key} ${direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`);
        });
        orderByClause = `ORDER BY ${orderConditions.join(', ')}`;
      }
      
      // Construir LIMIT e OFFSET
      const limitClause = limit ? 'LIMIT ? OFFSET ?' : '';
      if (limit) {
        params.push(parseInt(limit), parseInt(offset));
      }
      
      const sql = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ${orderByClause}
        ${limitClause}
      `;
      
      // Executar consulta para obter os dados
      const [rows] = await this.pool.query(sql, params);
      
      // Contar o total de registros (para paginação)
      let total = 0;
      if (limit) {
        const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
        const [countRows] = await this.pool.query(countSql, params.slice(0, -2)); // Remove limit e offset
        total = countRows[0].total;
      } else {
        total = rows.length;
      }
      
      return {
        data: rows,
        pagination: {
          total,
          limit: limit ? parseInt(limit) : null,
          offset: offset ? parseInt(offset) : 0,
          totalPages: limit ? Math.ceil(total / limit) : 1
        }
      };
    } catch (error) {
      console.error(`Error in ${this.name} findAll:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo registro
   */
  static async create(data) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      const fields = [];
      const placeholders = [];
      const values = [];
      
      // Gerar UUID para a chave primária se não fornecida
      if (!data[this.primaryKey] && this.primaryKey === 'id') {
        data[this.primaryKey] = uuidv4();
      }
      
      // Preparar campos e valores
      Object.entries(data).forEach(([key, value]) => {
        // Se o valor for um objeto ou array, converter para JSON
        if (value !== null && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        fields.push(key);
        placeholders.push('?');
        values.push(value);
      });
      
      const sql = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      const [result] = await this.pool.query(sql, values);
      
      // Retornar o registro criado
      return this.findById(result.insertId || data[this.primaryKey]);
    } catch (error) {
      console.error(`Error in ${this.name} create:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um registro existente
   */
  static async update(id, data) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      const updates = [];
      const values = [];
      
      // Preparar atualizações
      Object.entries(data).forEach(([key, value]) => {
        // Se o valor for um objeto ou array, converter para JSON
        if (value !== null && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        // Não atualizar a chave primária
        if (key !== this.primaryKey) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (updates.length === 0) {
        throw new Error('No fields to update');
      }
      
      // Adicionar o ID ao final dos valores para a cláusula WHERE
      values.push(id);
      
      const sql = `
        UPDATE ${this.tableName}
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE ${this.primaryKey} = ?
      `;
      
      const [result] = await this.pool.query(sql, values);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Retornar o registro atualizado
      return this.findById(id);
    } catch (error) {
      console.error(`Error in ${this.name} update:`, error);
      throw error;
    }
  }

  /**
   * Exclui um registro
   */
  static async delete(id) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
      const [result] = await this.pool.query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error in ${this.name} delete:`, error);
      throw error;
    }
  }

  /**
   * Realiza uma exclusão lógica (soft delete)
   */
  static async softDelete(id, userId) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      // Verificar se a tabela tem a coluna deleted_at
      const [columns] = await this.pool.query(`
        SHOW COLUMNS FROM ${this.tableName} LIKE 'deleted_at'
      `);
      
      if (columns.length === 0) {
        throw new Error('Table does not support soft delete (missing deleted_at column)');
      }
      
      const data = { deleted_at: new Date() };
      
      // Se existir a coluna deleted_by, adicionar o ID do usuário
      const [deletedByColumn] = await this.pool.query(`
        SHOW COLUMNS FROM ${this.tableName} LIKE 'deleted_by'
      `);
      
      if (deletedByColumn.length > 0 && userId) {
        data.deleted_by = userId;
      }
      
      return this.update(id, data);
    } catch (error) {
      console.error(`Error in ${this.name} softDelete:`, error);
      throw error;
    }
  }

  /**
   * Restaura um registro excluído logicamente
   */
  static async restore(id) {
    if (!this.tableName) {
      throw new Error('tableName must be defined in the child class');
    }

    try {
      // Verificar se a tabela tem a coluna deleted_at
      const [columns] = await this.pool.query(`
        SHOW COLUMNS FROM ${this.tableName} LIKE 'deleted_at'
      `);
      
      if (columns.length === 0) {
        throw new Error('Table does not support soft delete (missing deleted_at column)');
      }
      
      const data = { deleted_at: null };
      
      // Se existir a coluna deleted_by, definir como NULL
      const [deletedByColumn] = await this.pool.query(`
        SHOW COLUMNS FROM ${this.tableName} LIKE 'deleted_by'
      `);
      
      if (deletedByColumn.length > 0) {
        data.deleted_by = null;
      }
      
      return this.update(id, data);
    } catch (error) {
      console.error(`Error in ${this.name} restore:`, error);
      throw error;
    }
  }

  /**
   * Criptografa uma senha usando bcrypt
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se uma senha corresponde ao hash
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = BaseModel;
