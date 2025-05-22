const BaseController = require('./BaseController');
const Product = require('../models/Product');
const { body } = require('express-validator');

class ProductController extends BaseController {
  constructor() {
    super(Product);
  }

  // Validação para criação/atualização de produtos
  static validate() {
    return [
      body('reference').notEmpty().withMessage('Reference is required'),
      body('name').notEmpty().withMessage('Name is required'),
      body('description').optional(),
      body('family_id').isInt().withMessage('Family ID must be an integer'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('featured').optional().isBoolean().withMessage('featured must be a boolean'),
      body('sort_order').optional().isInt().withMessage('sort_order must be an integer')
    ];
  }

  // Listar produtos ativos (para catálogo)
  async getActive(req, res) {
    try {
      const products = await Product.getActive();
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting active products:', error);
      return this.error(res, 'Failed to fetch active products', 500);
    }
  }

  // Listar produtos em destaque
  async getFeatured(req, res) {
    try {
      const products = await Product.getFeatured();
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting featured products:', error);
      return this.error(res, 'Failed to fetch featured products', 500);
    }
  }

  // Buscar produtos por família
  async getByFamily(req, res) {
    try {
      const { familyId } = req.params;
      const products = await Product.getByFamily(familyId);
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting products by family:', error);
      return this.error(res, 'Failed to fetch products by family', 500);
    }
  }

  // Upload de imagem
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return this.error(res, 'No file uploaded', 400);
      }

      const { id } = req.params;
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Atualizar o produto com a URL da imagem
      const updatedProduct = await Product.addImage(id, imageUrl);
      
      if (!updatedProduct) {
        return this.error(res, 'Product not found', 404);
      }
      
      return this.success(res, { imageUrl });
    } catch (error) {
      console.error('Error uploading product image:', error);
      return this.error(res, 'Failed to upload image', 500);
    }
  }

  // Atualizar preço
  async updatePrice(req, res) {
    try {
      const { id } = req.params;
      const { price } = req.body;
      
      if (!price) {
        return this.error(res, 'Price is required', 400);
      }
      
      const updatedProduct = await Product.updatePrice(id, price);
      
      if (!updatedProduct) {
        return this.error(res, 'Product not found', 404);
      }
      
      return this.success(res, updatedProduct);
    } catch (error) {
      console.error('Error updating product price:', error);
      return this.error(res, 'Failed to update price', 500);
    }
  }
}

module.exports = new ProductController();
