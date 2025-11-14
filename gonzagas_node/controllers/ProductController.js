const BaseController = require('./BaseController');
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const { body, validationResult } = require('express-validator');
const path = require('path'); // For image path manipulation

class ProductController extends BaseController {
  constructor() {
    super(Product);
  }

  // Admin: Listar todos os produtos para gerenciamento
  async index(req, res) {
    console.log('ProductController.index - query params:', req.query);
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const filterOptions = {
        reference: req.query.reference,
        categoryName: req.query.category, // Will need to resolve to family_id in Model
        status: req.query.status,
        stock_status: req.query.stock_status
      };

      // Remove undefined or empty string filters
      for (const key in filterOptions) {
        if (filterOptions[key] === undefined || filterOptions[key] === '') {
          delete filterOptions[key];
        }
      }
      console.log('ProductController.index - Constructed filterOptions:', filterOptions);

      const products = await Product.getAll(limit, offset, filterOptions);
      const totalProducts = await Product.count(filterOptions);
      const totalPages = Math.ceil(totalProducts / limit);
      const productFamilies = await ProductFamily.getAll();

      res.render('admin/products/index', {
        layout: 'admin/layouts/main',
        title: 'Manage Products',
        products,
        productFamilies,
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        currentPath: req.path,
        queryParams: req.query,
        user: req.user,
        breadcrumbs: res.locals.breadcrumb,
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
      });
    } catch (error) {
      console.error('Error loading products admin page:', error);
      req.flash('error_msg', 'Falha ao carregar a página de produtos. Por favor, tente novamente.');
      res.redirect('/admin/dashboard');
    }
  }

  // Show form to create a new product
  async create(req, res) {
    try {
      const productFamilies = await ProductFamily.getAll();
      res.render('admin/products/product-form', { 
        layout: 'admin/layouts/main',
        title: 'Create New Product',
        product: {}, 
        productFamilies,
        isNew: true, 
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null 
      });
    } catch (error) {
      console.error('Error showing create product form:', error);
      req.flash('error_msg', 'Failed to load the create product form.');
      res.redirect('/admin/products');
    }
  }

  // Store a new product in the database
  async store(req, res) {
    console.log('--- ProductController.store ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const productFamilies = await ProductFamily.getAll();
      return res.status(400).render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: 'Create New Product',
        product: req.body,
        productFamilies,
        isNew: true,
        errors: errors.array(),
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null
      });
    }

    try {
      const productData = { ...req.body };
      
      productData.is_active = !!(productData.is_active === 'on' || productData.is_active === true || productData.is_active === 'true' || productData.is_active === '1');
      productData.is_catalog_visible = !!(productData.is_catalog_visible === 'on' || productData.is_catalog_visible === true || productData.is_catalog_visible === 'true' || productData.is_catalog_visible === '1');
      productData.featured = !!(req.body.featured === 'on' || req.body.featured === true || req.body.featured === 'true' || req.body.featured === '1' || req.body.featured === 1);

      // Handle product attributes
      const attributes = [];
      if (Array.isArray(req.body.attributeNames) && Array.isArray(req.body.attributeValues)) {
        for (let i = 0; i < req.body.attributeNames.length; i++) {
          const name = req.body.attributeNames[i].trim();
          const value = req.body.attributeValues[i].trim();
          if (name && value) {
            attributes.push({ name, value });
          }
        }
      }
      productData.attributes = JSON.stringify(attributes);

      let images = req.files && req.files.images ? req.files.images.map(file => ({
        path: path.join('/media/products/', file.filename).replace(/\\/g, '/'),
        filename: file.filename,
        is_primary: false // Default to false, will be set by primary_image_id
      })) : [];
      
      // If a primary image was selected from newly uploaded images
      const primaryImageFilename = req.body.primary_image_filename; // Assuming this field is sent from the form
      if (primaryImageFilename) {
        images = images.map(img => ({
          ...img,
          is_primary: img.filename === primaryImageFilename
        }));
      } else if (images.length > 0) {
        // If no primary image is explicitly selected, make the first uploaded image primary
        images[0].is_primary = true;
      }

      const mainImage = req.files && req.files.image ? {
        path: path.join('/media/products/', req.files.image[0].filename).replace(/\\/g, '/'),
        filename: req.files.image[0].filename,
        is_primary: true
      } : null;

      if (mainImage) {
        images.unshift(mainImage); 
      }
      
      await Product.createProductWithImages(productData, images, req.user.id);
      
      req.flash('success_msg', 'Product created successfully!');
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error storing product:', error);
      req.flash('error_msg', 'Failed to create product. ' + error.message);
      const productFamilies = await ProductFamily.getAll();
      res.status(500).render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: 'Create New Product',
        product: req.body,
        productFamilies,
        isNew: true,
        error_msg: req.flash('error_msg'),
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null
      });
    }
  }

  // Show form to edit an existing product
  async edit(req, res) {
    console.log('--- ENTERING ProductController.edit method ---');
    console.log('Requested Product ID:', req.params.id);

    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        req.flash('error_msg', 'Invalid Product ID.');
        return res.redirect('/admin/products');
      }

      const product = await Product.findByIdWithDetails(productId);

      if (!product) {
        req.flash('error_msg', 'Product not found.');
        return res.redirect('/admin/products');
      }
      console.log('product.is_catalog_visible:', product.is_catalog_visible);
      console.log('typeof product.is_catalog_visible:', typeof product.is_catalog_visible);
      console.log('product images:', product.images);

      const productFamilies = await ProductFamily.getAll();
      
      res.render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: `Edit Product: ${product.name}`,
        product,
        productFamilies,
        isNew: false, 
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null,
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
      });
    } catch (error) {
      console.error('--- ERROR in ProductController.edit ---:', error);
      req.flash('error_msg', `Failed to load product for editing: ${error.message}`);
      res.redirect('/admin/products');
    }
  }

  // Update an existing product
  async update(req, res) {
    console.log('--- ProductController.update ---');
    const productId = parseInt(req.params.id);
    console.log('Product ID:', productId);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const product = await Product.findById(productId);
      const productFamilies = await ProductFamily.getAll();
      return res.status(400).render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: 'Edit Product',
        product: { ...product, ...req.body },
        productFamilies,
        isNew: false,
        errors: errors.array(),
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null
      });
    }

    try {
      const isTruthy = (value) => value === '1' || value === 'on' || value === true || value === 'true';

      const productData = {
        name: req.body.name,
        description: req.body.description,
        family_id: req.body.family_id ? parseInt(req.body.family_id, 10) : null,
        reference: req.body.reference,
        purchase_price: req.body.purchase_price ? parseFloat(req.body.purchase_price) : 0.00,
        sale_price: req.body.sale_price ? parseFloat(req.body.sale_price) : 0.00,
        tax_rate: req.body.tax_rate ? parseFloat(req.body.tax_rate) : 0.00,
        current_stock: req.body.current_stock ? parseInt(req.body.current_stock, 10) : 0,
        min_stock: req.body.min_stock ? parseInt(req.body.min_stock, 10) : 0,
        max_stock: (req.body.max_stock && req.body.max_stock !== '') ? parseInt(req.body.max_stock, 10) : null,
        tags: req.body.tags,
        weight: req.body.weight ? parseFloat(req.body.weight) : 0.000,
        dimensions: req.body.dimensions,
        is_active: isTruthy(req.body.is_active),
        featured: isTruthy(req.body.featured),
        is_catalog_visible: isTruthy(req.body.is_catalog_visible),
        // Gestão de imagens
        imagesToDelete: req.body.imagesToDelete ? req.body.imagesToDelete.split(',').filter(id => id.trim() !== '').map(id => parseInt(id.trim(), 10)) : [],
        primary_image_id: req.body.primary_image_id ? parseInt(req.body.primary_image_id, 10) : null,
      };

      let allNewImages = [];

      if (req.files && Array.isArray(req.files.images) && req.files.images.length > 0) {
        allNewImages = req.files.images.map(file => ({
          path: path.join('/media/products/', file.filename).replace(/\\/g, '/'),
          filename: file.filename,
          is_primary: false
        }));
      }

      const mainImageUpload = req.files && Array.isArray(req.files.image) && req.files.image.length > 0
        ? req.files.image[0]
        : null;

      if (mainImageUpload) {
        allNewImages.unshift({
          path: path.join('/media/products/', mainImageUpload.filename).replace(/\\/g, '/'),
          filename: mainImageUpload.filename,
          is_primary: true
        });
      }

      const primaryImageFilename = req.body.primary_image_filename;
      if (primaryImageFilename && allNewImages.length > 0) {
        allNewImages = allNewImages.map(image => ({
          ...image,
          is_primary: image.filename === primaryImageFilename || image.is_primary
        }));
      }

      const userId = req.user ? req.user.id : (req.session && req.session.user ? req.session.user.id : null);
      if (!userId) {
        console.error('Critical: User ID not found in req.user or req.session.user in ProductController.update');
      }
      console.log(`ProductController.update: Using userId: ${userId}`);

      try {
        console.log(`Attempting to update product ${productId} with userId: ${userId}`);
        await Product.updateProductWithImages(productId, productData, allNewImages, userId);
        req.flash('success_msg', 'Product updated successfully!');
        res.redirect('/admin/products');
      } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.sqlMessage && error.sqlMessage.includes('CONSTRAINT `fk_products_updated_by`')) {
          console.warn(`Update failed for product ${productId} due to invalid updated_by user ID: ${userId}. Attempting to save product with updated_by set to NULL.`);
          try {
            await Product.updateProductWithImages(productId, productData, allNewImages, null); // Retry with userId = null
            req.flash('warning_msg', `Product updated. However, the 'updated by' user (ID ${userId}) was not found, so this information was not recorded for this update.`);
            res.redirect('/admin/products');
          } catch (retryError) {
            console.error(`Error updating product ${productId} even after attempting with updated_by = NULL:`, retryError);
            req.flash('error_msg', `Product update failed. User ID ${userId} may be invalid. (Details: ${retryError.message})`);
            const product = await Product.findById(productId);
            const productFamilies = await ProductFamily.getAll();
            res.status(500).render('admin/products/product-form', {
              product: { ...product, ...req.body },
              productFamilies,
              isNew: false,
              error_msg: req.flash('error_msg'),
              breadcrumbs: res.locals.breadcrumb,
              user: req.user,
              csrfToken: req.csrfToken ? req.csrfToken() : null
            });
          }
        } else {
          console.error(`Error updating product ${productId}:`, error);
          req.flash('error_msg', 'Error updating product: ' + error.message);
          const product = await Product.findById(productId);
          const productFamilies = await ProductFamily.getAll();
          res.status(500).render('admin/products/product-form', {
            product: { ...product, ...req.body },
            productFamilies,
            isNew: false,
            error_msg: req.flash('error_msg'),
            breadcrumbs: res.locals.breadcrumb,
            user: req.user,
            csrfToken: req.csrfToken ? req.csrfToken() : null
          });
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);
      req.flash('error_msg', 'Failed to update product. ' + error.message);
      const product = await Product.findById(productId);
      const productFamilies = await ProductFamily.getAll();
      res.status(500).render('admin/products/product-form', {
        product: { ...product, ...req.body },
        productFamilies,
        isNew: false,
        error_msg: req.flash('error_msg'),
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null
      });
    }
  }

  // Delete a product
  async delete(req, res) {
    console.log('--- ProductController.delete ---');
    const productId = parseInt(req.params.id);
    console.log('Product ID to delete:', productId);

    try {
      const result = await Product.deleteById(productId);
      
      if (result && result.affectedRows > 0) { 
          req.flash('success_msg', 'Product deleted successfully.');
      } else {
          req.flash('error_msg', 'Product not found or could not be deleted.');
      }
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error_msg', 'Failed to delete product. ' + error.message);
      res.redirect('/admin/products');
    }
  }

  // Public: Listar todos os produtos ativos para o catálogo
  async getPublic(req, res) {
    try {
      const products = await Product.getActive();
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting public products:', error);
      return this.error(res, 'Failed to fetch products', 500);
    }
  }

  // Public: Obter um produto pelo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return this.error(res, 'Product not found', 404);
      }
      return this.success(res, product);
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return this.error(res, 'Failed to fetch product', 500);
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

  // Public: Show product detail under construction page
  async showProductDetailUnderConstruction(req, res) {
    try {
      // Optionally, you could fetch the product basic info if needed for the title or breadcrumbs
      // const productId = req.params.id;
      // const product = await Product.findById(productId);
      // if (!product) {
      //   req.flash('error_msg', 'Product not found.');
      //   return res.redirect('/catalog');
      // }

      res.render('product-detail-uc', {
        // layout: 'layouts/main-layout', // Already set in product-detail-uc.ejs
        title: 'Detalhes do Produto - Em Breve!', // product ? product.name : 'Product Details - Coming Soon!',
        product: null, // Or pass product if fetched
        user: req.user, // Pass user for layout consistency
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Catalog', url: '/catalog' },
          { name: 'Product Details', isActive: true }
        ]
      });
    } catch (error) {
      console.error('Error showing product detail under construction page:', error);
      req.flash('error_msg', 'Failed to load page. Please try again.');
      res.redirect('/catalog');
    }
  }

  // Upload de imagem
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return this.error(res, 'No file uploaded', 400);
      }

      const { id } = req.params;
      const imageUrl = path.join('/media/products/', req.file.filename).replace(/\\/g, '/');
      
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