/**
 * Controlador de Produtos
 * 
 * Este controlador gerencia as operações relacionadas a produtos.
 */

const Product = require('../../../models/Product');

class ProductController {
  /**
   * Obtém todos os produtos
   */
  static async getAllProducts(req, res) {
    try {
      const products = await Product.getAllWithStock();
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar produtos',
        error: error.message
      });
    }
  }

  /**
   * Obtém um produto pelo ID
   */
  static async getProductById(req, res) {
    try {
      const product = await Product.getByIdWithDetails(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  /**
   * Cria um novo produto
   */
  static async createProduct(req, res) {
    try {
      const productId = await Product.create(req.body);
      const product = await Product.getByIdWithDetails(productId);
      
      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar produto',
        error: error.message
      });
    }
  }

  /**
   * Atualiza um produto existente
   */
  static async updateProduct(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const success = await Product.update(productId, req.body);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      
      const updatedProduct = await Product.getByIdWithDetails(productId);
      
      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar produto',
        error: error.message
      });
    }
  }

  /**
   * Remove um produto
   */
  static async deleteProduct(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const success = await Product.delete(productId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Produto removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir produto',
        error: error.message
      });
    }
  }
}

module.exports = ProductController;
