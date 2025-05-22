const BaseController = require('./BaseController');
const { body } = require('express-validator');

class SupplierController extends BaseController {
  constructor() {
    // Supondo que temos um modelo Supplier
    super({ 
      getAll: async () => { /* implementação */ },
      getById: async () => { /* implementação */ },
      create: async () => { /* implementação */ },
      update: async () => { /* implementação */ },
      delete: async () => { /* implementação */ }
    });
  }

  // Validação para criação/atualização de fornecedores
  static validate() {
    return [
      body('name').notEmpty().withMessage('Name is required'),
      body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
      body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
      body('tax_number').optional().isString().withMessage('Tax number must be a string'),
      body('address').optional().isString().withMessage('Address must be a string'),
      body('city').optional().isString().withMessage('City must be a string'),
      body('postal_code').optional().isPostalCode('any').withMessage('Invalid postal code'),
      body('country').optional().isString().withMessage('Country must be a string'),
      body('contact_person').optional().isString().withMessage('Contact person must be a string'),
      body('website').optional().isURL().withMessage('Invalid website URL'),
      body('payment_terms').optional().isString().withMessage('Payment terms must be a string'),
      body('lead_time_days').optional().isInt({ min: 0 }).withMessage('Lead time must be a positive integer'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];
  }

  // Listar fornecedores ativos
  async getActive(req, res) {
    try {
      const suppliers = await this.model.getActive();
      return this.success(res, suppliers);
    } catch (error) {
      console.error('Error getting active suppliers:', error);
      return this.error(res, 'Failed to fetch active suppliers', 500);
    }
  }

  // Buscar fornecedores por termo
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return this.error(res, 'Search query is required', 400);
      }
      
      const suppliers = await this.model.search(q);
      return this.success(res, suppliers);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      return this.error(res, 'Failed to search suppliers', 500);
    }
  }

  // Obter produtos de um fornecedor
  async getProducts(req, res) {
    try {
      const { id } = req.params;
      const products = await this.model.getProducts(id);
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting supplier products:', error);
      return this.error(res, 'Failed to fetch supplier products', 500);
    }
  }

  // Obter histórico de compras de um fornecedor
  async getPurchaseHistory(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, limit = 10, page = 1 } = req.query;
      
      const history = await this.model.getPurchaseHistory(id, { 
        startDate, 
        endDate,
        limit: parseInt(limit),
        page: parseInt(page)
      });
      
      return this.success(res, history);
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return this.error(res, 'Failed to fetch purchase history', 500);
    }
  }

  // Ativar/desativar fornecedor
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      if (typeof is_active !== 'boolean') {
        return this.error(res, 'is_active must be a boolean', 400);
      }
      
      const updatedSupplier = await this.model.update(id, { is_active });
      
      if (!updatedSupplier) {
        return this.error(res, 'Supplier not found', 404);
      }
      
      return this.success(res, updatedSupplier);
    } catch (error) {
      console.error('Error toggling supplier status:', error);
      return this.error(res, 'Failed to update supplier status', 500);
    }
  }

  // Importar fornecedores de arquivo
  async import(req, res) {
    try {
      if (!req.file) {
        return this.error(res, 'No file uploaded', 400);
      }
      
      // Processar arquivo (implementar lógica de importação)
      // const results = await this.model.importFromFile(req.file.path);
      
      // Remover arquivo temporário
      // fs.unlinkSync(req.file.path);
      
      return this.success(res, {
        message: 'Import completed',
        // ...results
      });
    } catch (error) {
      console.error('Error importing suppliers:', error);
      
      // Remover arquivo temporário em caso de erro
      if (req.file && fs.existsSync(req.file.path)) {
        // fs.unlinkSync(req.file.path);
      }
      
      return this.error(res, 'Failed to import suppliers', 500);
    }
  }
}

module.exports = new SupplierController();
