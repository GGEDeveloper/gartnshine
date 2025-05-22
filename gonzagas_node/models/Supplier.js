const BaseModel = require('./BaseModel');

class Supplier extends BaseModel {
  static tableName = 'suppliers';
  static primaryKey = 'id';

  /**
   * Busca fornecedores ativos
   */
  static async getActive() {
    try {
      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} 
         WHERE is_active = 1 
         AND deleted_at IS NULL 
         ORDER BY name`
      );
      return rows;
    } catch (error) {
      console.error('Error in Supplier getActive:', error);
      throw error;
    }
  }

  /**
   * Busca fornecedores por termo de pesquisa
   */
  static async search(query, limit = 10, offset = 0) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} 
         WHERE (name LIKE ? OR email LIKE ? OR contact_person LIKE ? OR tax_number LIKE ?)
         AND deleted_at IS NULL
         ORDER BY name
         LIMIT ? OFFSET ?`,
        [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
      );
      
      // Contar o total de resultados para paginação
      const [countRows] = await this.pool.query(
        `SELECT COUNT(*) as total 
         FROM ${this.tableName} 
         WHERE (name LIKE ? OR email LIKE ? OR contact_person LIKE ? OR tax_number LIKE ?)
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
      console.error('Error in Supplier search:', error);
      throw error;
    }
  }

  /**
   * Obtém os produtos fornecidos por um fornecedor
   */
  static async getProducts(supplierId) {
    try {
      const [rows] = await this.pool.query(
        `SELECT p.*, pf.name as family_name
         FROM products p
         JOIN product_suppliers ps ON p.id = ps.product_id
         LEFT JOIN product_families pf ON p.family_id = pf.id
         WHERE ps.supplier_id = ?
         AND p.deleted_at IS NULL
         ORDER BY p.name`,
        [supplierId]
      );
      return rows;
    } catch (error) {
      console.error('Error in Supplier getProducts:', error);
      throw error;
    }
  }

  /**
   * Obtém o histórico de compras de um fornecedor
   */
  static async getPurchaseHistory(supplierId, { startDate, endDate, limit = 10, page = 1 }) {
    try {
      const offset = (page - 1) * limit;
      const params = [supplierId];
      
      let dateCondition = '';
      if (startDate) {
        dateCondition += ' AND o.order_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        dateCondition += ' AND o.order_date <= ?';
        params.push(endDate);
      }
      
      // Adicionar limite e offset
      params.push(parseInt(limit), parseInt(offset));
      
      const [rows] = await this.pool.query(
        `SELECT 
            o.id as order_id,
            o.order_number,
            o.order_date,
            o.status,
            o.total_amount,
            oi.product_id,
            p.reference,
            p.name as product_name,
            oi.quantity,
            oi.unit_price,
            (oi.quantity * oi.unit_price) as line_total
         FROM purchase_orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.supplier_id = ?
         ${dateCondition}
         ORDER BY o.order_date DESC, o.id
         LIMIT ? OFFSET ?`,
        params
      );
      
      // Contar o total de registros
      const countParams = [supplierId];
      if (startDate) countParams.push(startDate);
      if (endDate) countParams.push(endDate);
      
      const [countRows] = await this.pool.query(
        `SELECT COUNT(DISTINCT o.id) as total
         FROM purchase_orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.supplier_id = ?
         ${dateCondition}`,
        countParams
      );
      
      const total = countRows[0].total;
      
      return {
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in Supplier getPurchaseHistory:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa um fornecedor
   */
  static async toggleStatus(id, isActive) {
    try {
      const [result] = await this.pool.query(
        `UPDATE ${this.tableName} 
         SET is_active = ?, 
             updated_at = NOW() 
         WHERE id = ?`,
        [isActive, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return this.findById(id);
    } catch (error) {
      console.error('Error in Supplier toggleStatus:', error);
      throw error;
    }
  }

  /**
   * Importa fornecedores a partir de um arquivo
   */
  static async importFromFile(filePath) {
    // Implementação da importação de arquivo
    // Esta é uma implementação de exemplo que precisaria ser adaptada
    // para o formato específico do seu arquivo de importação
    
    try {
      // Exemplo usando csv-parser (instalar com: npm install csv-parser)
      const fs = require('fs');
      const csv = require('csv-parser');
      
      const results = [];
      const errors = [];
      let processed = 0;
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', async (row) => {
            try {
              // Mapear os campos do CSV para o formato do banco de dados
              const supplierData = {
                name: row.name || row.Nome || row.FORNECEDOR,
                tax_number: row.tax_number || row.cnpj || row.CNPJ || row.TAX_ID,
                email: row.email || row.Email || row.EMAIL,
                phone: row.phone || row.telefone || row.Phone || row.TELEFONE,
                contact_person: row.contact_person || row.responsavel || row.Contact || row.CONTATO,
                address: row.address || row.endereco || row.Address || row.ENDERECO,
                city: row.city || row.cidade || row.City || row.CIDADE,
                state: row.state || row.estado || row.State || row.ESTADO,
                postal_code: row.postal_code || row.cep || row.CEP || row.PostalCode,
                country: row.country || row.pais || row.Country || 'Brasil',
                website: row.website || row.site || row.Website || row.WEBSITE,
                is_active: row.is_active !== undefined ? Boolean(row.is_active) : true
              };
              
              // Verificar se o fornecedor já existe (por CNPJ ou nome)
              const [existing] = await this.pool.query(
                'SELECT id FROM suppliers WHERE tax_number = ? OR (name = ? AND deleted_at IS NULL) LIMIT 1',
                [supplierData.tax_number, supplierData.name]
              );
              
              let result;
              if (existing && existing.length > 0) {
                // Atualizar fornecedor existente
                result = await this.update(existing[0].id, supplierData);
                result.action = 'updated';
              } else {
                // Criar novo fornecedor
                result = await this.create(supplierData);
                result.action = 'created';
              }
              
              results.push(result);
              processed++;
              
            } catch (error) {
              errors.push({
                row: processed + 1,
                error: error.message,
                data: row
              });
              processed++;
            }
          })
          .on('end', () => {
            resolve({
              total: processed,
              imported: results.length,
              errors: errors.length,
              results,
              errors
            });
          })
          .on('error', (error) => {
            reject(error);
          });
      });
      
    } catch (error) {
      console.error('Error in Supplier importFromFile:', error);
      throw error;
    }
  }
}

module.exports = new Supplier();
