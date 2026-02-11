const path = require('path');
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const ProductColor = require('../models/ProductColor');

const getColorsSafe = async () => {
  try { return await ProductColor.getActive(); } catch { return []; }
};

class QuickProductController {
  /**
   * GET /admin/quick-product
   * Show mobile-first quick product creation form
   */
  async showForm(req, res) {
    try {
      const { categories, subcategories } = await ProductFamily.getCategoriesWithSubcategories().catch(() => ({
        categories: [],
        subcategories: []
      }));
      let families = categories.length || subcategories.length ? { categories, subcategories } : null;
      if (!families) {
        const all = await ProductFamily.getAll();
        families = { categories: all, subcategories: [] };
      }
      const colors = await getColorsSafe();
      const preselectedFamilyId = req.query.family_id ? String(req.query.family_id).trim() : null;
      const preselectedColor = req.query.color ? String(req.query.color).trim() : null;

      res.render('admin/quick-product/form', {
        layout: 'admin/layouts/main',
        title: 'Criar Produto Rápido',
        categories: families.categories,
        subcategories: families.subcategories,
        colors: colors && colors.length > 0 ? colors : [{ name: 'Prata' }, { name: 'Dourado' }, { name: 'Outro' }],
        preselectedFamilyId,
        preselectedColor,
        breadcrumbs: res.locals.breadcrumb || [],
        user: req.session?.user || req.user,
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
      });
    } catch (error) {
      console.error('QuickProductController.showForm error:', error);
      req.flash('error_msg', 'Erro ao carregar o formulário.');
      res.redirect('/admin/dashboard');
    }
  }

  /**
   * POST /admin/quick-product
   * Create product from quick form
   */
  async store(req, res) {
    try {
      const {
        reference,
        family_id,
        name,
        sale_price,
        color,
        current_stock,
        description
      } = req.body;

      if (!sale_price || parseFloat(sale_price) <= 0) {
        req.flash('error_msg', 'Preço de venda é obrigatório e deve ser maior que zero.');
        return res.redirect('/admin/quick-product');
      }

      const userId = req.session?.user?.id || req.user?.id || null;

      const productData = {
        reference: (reference || '').trim() || await Product.getNextReference(
          family_id ? (await ProductFamily.getById(family_id))?.code : 'GEN'
        ),
        family_id: family_id ? parseInt(family_id, 10) : null,
        name: (name || '').trim() || `Produto ${Date.now()}`,
        description: (description || '').trim() || null,
        sale_price: parseFloat(sale_price),
        purchase_price: 0,
        current_stock: parseInt(current_stock, 10) || 0,
        min_stock: 0,
        color: (color || '').trim() || null,
        is_active: 1,
        is_catalog_visible: 1,
        featured: 0
      };

      let images = [];
      if (req.files?.images && Array.isArray(req.files.images)) {
        images = req.files.images.map((file, i) => ({
          filename: file.filename,
          is_primary: i === 0
        }));
      } else if (req.files?.image && req.files.image[0]) {
        images = [{ filename: req.files.image[0].filename, is_primary: true }];
      }

      const productId = await Product.createProductWithImages(productData, images, userId);
      req.flash('success_msg', `Produto criado com sucesso! Referência: ${productData.reference}`);
      const params = new URLSearchParams();
      if (family_id) params.set('family_id', family_id);
      if (color && (color || '').trim()) params.set('color', color.trim());
      res.redirect('/admin/quick-product' + (params.toString() ? '?' + params.toString() : ''));
    } catch (error) {
      console.error('QuickProductController.store error:', error);
      req.flash('error_msg', 'Erro ao criar produto: ' + (error.message || 'Erro desconhecido'));
      res.redirect('/admin/quick-product');
    }
  }

  /**
   * GET /admin/quick-product/api/next-reference?prefix=XXX
   */
  async getNextReference(req, res) {
    try {
      const prefix = req.query.prefix || 'GEN';
      const ref = await Product.getNextReference(prefix);
      res.json({ reference: ref });
    } catch (error) {
      console.error('QuickProductController.getNextReference error:', error);
      res.status(500).json({ error: 'Erro ao gerar referência' });
    }
  }

  /**
   * GET /admin/quick-product/api/categories
   */
  async getCategories(req, res) {
    try {
      const { categories, subcategories } = await ProductFamily.getCategoriesWithSubcategories().catch(async () => {
        const all = await ProductFamily.getAll();
        return { categories: all, subcategories: [] };
      });
      res.json({ categories, subcategories });
    } catch (error) {
      console.error('QuickProductController.getCategories error:', error);
      res.status(500).json({ error: 'Erro ao carregar categorias' });
    }
  }
}

module.exports = new QuickProductController();
