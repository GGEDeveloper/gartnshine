const BaseController = require('./BaseController');
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const ProductColor = require('../models/ProductColor');

const getColorsSafe = async () => { try { return await ProductColor.getActive(); } catch { return []; } };
const { body, validationResult } = require('express-validator');
const path = require('path'); // For image path manipulation
const { processProductImage } = require('../utils/productImageProcessor');

/**
 * Gera as variantes (full/medium/small/thumb) para cada imagem nova/seleccionada.
 * Nunca bloqueia o fluxo em caso de erro (produto continua a gravar-se) — mas
 * devolve os ficheiros que falharam para o caller poder avisar o admin via
 * flash, em vez de a falha ficar só num console.warn que ninguém vê.
 */
async function generateVariantsFor(images) {
  const failed = [];
  for (const img of images) {
    if (!img || !img.filename) continue;
    try {
      const result = await processProductImage(img.filename);
      if (!result.ok) failed.push(img.filename);
    } catch (err) {
      console.warn('Falha ao gerar variantes para', img.filename, err.message);
      failed.push(img.filename);
    }
  }
  return failed;
}

class ProductController extends BaseController {
  constructor() {
    super(Product);
  }

  // Admin: Listar todos os produtos para gerenciamento
  async index(req, res) {
    console.log('ProductController.index - query params:', req.query);
    try {
      const ALLOWED_LIMITS = [10, 20, 50, 100];
      const page = parseInt(req.query.page) || 1;
      const requestedLimit = parseInt(req.query.limit);
      const limit = ALLOWED_LIMITS.includes(requestedLimit) ? requestedLimit : 10;
      const offset = (page - 1) * limit;

      const filterOptions = {
        reference: req.query.reference,
        categoryName: req.query.category,
        status: req.query.status,
        stock_status: req.query.stock_status
      };

      const sortOptions = {
        sortBy: req.query.sort_by || 'reference',
        sortOrder: (req.query.sort_order || 'asc').toUpperCase()
      };
      if (sortOptions.sortOrder !== 'ASC' && sortOptions.sortOrder !== 'DESC') {
        sortOptions.sortOrder = 'ASC';
      }

      for (const key in filterOptions) {
        if (filterOptions[key] === undefined || filterOptions[key] === '') {
          delete filterOptions[key];
        }
      }

      const products = await Product.getAll(limit, offset, filterOptions, sortOptions);
      const totalProducts = await Product.count(filterOptions);
      const totalPages = Math.ceil(totalProducts / limit);
      const productFamilies = await ProductFamily.getAll();

      res.render('admin/products/index', {
        layout: 'admin/layouts/main',
        title: 'Produtos',
        products,
        productFamilies,
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        currentPath: req.path,
        queryParams: { ...req.query, sort_by: sortOptions.sortBy, sort_order: sortOptions.sortOrder.toLowerCase() },
        user: req.user || req.session?.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null,
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
      const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
      res.render('admin/products/product-form', { 
        layout: 'admin/layouts/main',
        title: 'Create New Product',
        product: {}, 
        productFamilies,
        colors: colors || [],
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
      const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
      return res.status(400).render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: 'Create New Product',
        product: req.body,
        productFamilies,
        colors: colors || [],
        isNew: true,
        errors: errors.array(),
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null
      });
    }

    try {
      const productData = { ...req.body };
      productData.tax_rate = req.body.tax_rate ? parseFloat(req.body.tax_rate) : 0;

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
        is_primary: false
      })) : [];

      // Imagens da Biblioteca de Media (não são uploads - já existem em /media/products)
      const mediaLibraryStr = (req.body.mediaLibraryImages || '').trim();
      if (mediaLibraryStr) {
        const libraryFilenames = mediaLibraryStr.split('|').filter(Boolean);
        libraryFilenames.forEach(fn => {
          if (fn && !images.some(i => i.filename === fn)) {
            images.push({ filename: fn, path: `/media/products/${fn}`, is_primary: false });
          }
        });
      }

      const primaryImageFilename = req.body.primary_image_filename;
      if (primaryImageFilename) {
        images = images.map(img => ({ ...img, is_primary: img.filename === primaryImageFilename }));
      } else if (images.length > 0) {
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

      const failedVariants = await generateVariantsFor(images);

      await Product.createProductWithImages(productData, images, req.user.id);

      if (failedVariants.length) {
        req.flash('error_msg', `Produto criado, mas falhou o processamento de ${failedVariants.length} imagem(ns) (${failedVariants.join(', ')}). Tente re-enviar essas imagens.`);
      }
      req.flash('success_msg', 'Product created successfully!');
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error storing product:', error);
      req.flash('error_msg', 'Failed to create product. ' + error.message);
      const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
      res.status(500).render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: 'Create New Product',
        product: req.body,
        productFamilies,
        colors: colors || [],
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

      // Guardar query params do referer ou returnUrl para preservar filtros/página após update
      // Priority: returnTo (from route) > returnUrl (query param) > referer
      const returnTo = res.locals.returnTo || req.query.returnTo || req.query.returnUrl || '';
      const referer = req.get('referer') || '';
      
      // Priorizar returnTo/returnUrl se fornecido
      if (returnTo && (returnTo.includes('/admin/products') || returnTo.includes('/catalog/product'))) {
        try {
          const url = new URL(returnTo, `http://${req.get('host') || 'localhost'}`);
          const queryParams = url.searchParams.toString();
          if (queryParams && returnTo.includes('/admin/products')) {
            req.session.productListQueryParams = queryParams;
            console.log('Saved query params from returnTo:', queryParams);
          }
        } catch (error) {
          console.error('Error parsing returnTo:', error);
        }
      } else if (referer.includes('/admin/products')) {
        try {
          // Se o referer for absoluto, usar URL diretamente
          // Se for relativo, construir URL completo
          let refererUrl;
          if (referer.startsWith('http://') || referer.startsWith('https://')) {
            refererUrl = new URL(referer);
          } else {
            const protocol = req.protocol || 'http';
            const host = req.get('host') || 'localhost';
            refererUrl = new URL(referer, `${protocol}://${host}`);
          }
          const queryParams = refererUrl.searchParams.toString();
          if (queryParams) {
            req.session.productListQueryParams = queryParams;
            console.log('Saved query params from referer:', queryParams);
          }
        } catch (error) {
          console.error('Error parsing referer URL:', error);
          // Se falhar, tentar extrair query string manualmente
          const queryMatch = referer.match(/\?([^#]+)/);
          if (queryMatch && queryMatch[1]) {
            req.session.productListQueryParams = queryMatch[1];
          }
        }
      }

      const [productFamilies, colors, adjacentIds] = await Promise.all([
        ProductFamily.getAll(),
        getColorsSafe(),
        Product.getAdjacentIds(productId),
      ]);

      let backUrl = '/admin/products';
      if (returnTo && (returnTo.includes('/admin/products') || returnTo.includes('/catalog/product'))) {
        backUrl = returnTo;
      } else if (req.session.productListQueryParams) {
        backUrl = '/admin/products?' + req.session.productListQueryParams;
      }

      res.render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: `Edit Product: ${product.name}`,
        product,
        productFamilies,
        colors: colors || [],
        isNew: false,
        backUrl: backUrl, // Pass backUrl to view
        returnTo: returnTo, // Pass returnTo for form submission
        prevId: adjacentIds.prevId,
        nextId: adjacentIds.nextId,
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
      const product = await Product.findByIdWithDetails(productId);
      const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
      return res.status(400).render('admin/products/product-form', {
        layout: 'admin/layouts/main',
        title: 'Edit Product',
        product: { ...product, ...req.body },
        productFamilies,
        colors: colors || [],
        isNew: false,
        errors: errors.array(),
        breadcrumbs: res.locals.breadcrumb,
        user: req.user,
        csrfToken: req.csrfToken ? req.csrfToken() : null
      });
    }

    try {
      const isTruthy = (value) => value === '1' || value === 'on' || value === true || value === 'true';

      const attributes = [];
      if (Array.isArray(req.body.attributeNames) && Array.isArray(req.body.attributeValues)) {
        for (let i = 0; i < req.body.attributeNames.length; i++) {
          const name = (req.body.attributeNames[i] || '').trim();
          const value = (req.body.attributeValues[i] || '').trim();
          if (name && value) attributes.push({ name, value });
        }
      }

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
        material: req.body.material,
        color: req.body.color,
        style: req.body.style,
        notes: req.body.notes,
        barcode: req.body.barcode,
        attributes: JSON.stringify(attributes),
        is_active: isTruthy(req.body.is_active),
        featured: isTruthy(req.body.featured),
        is_catalog_visible: isTruthy(req.body.is_catalog_visible),
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

      const mediaLibraryStr = (req.body.mediaLibraryImages || '').trim();
      if (mediaLibraryStr) {
        const libraryFilenames = mediaLibraryStr.split('|').filter(Boolean);
        libraryFilenames.forEach(fn => {
          if (fn && !allNewImages.some(i => i.filename === fn)) {
            allNewImages.push({ filename: fn, path: `/media/products/${fn}`, is_primary: false });
          }
        });
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

      const failedVariants = await generateVariantsFor(allNewImages);

      // Após gravar, permanece na própria página de edição (em vez de voltar para a
      // lista) — o utilizador usa o botão "Voltar" quando quiser sair, e esse botão
      // continua a respeitar os filtros/ordenação/página de onde veio.
      const buildEditUrl = (returnTo) => '/admin/products/edit/' + productId + (returnTo ? '?returnTo=' + encodeURIComponent(returnTo) : '');

      try {
        console.log(`Attempting to update product ${productId} with userId: ${userId}`);
        await Product.updateProductWithImages(productId, productData, allNewImages, userId);
        if (failedVariants.length) {
          req.flash('error_msg', `Produto atualizado, mas falhou o processamento de ${failedVariants.length} imagem(ns) (${failedVariants.join(', ')}). Tente re-enviar essas imagens.`);
        }
        req.flash('success_msg', 'Product updated successfully!');

        const returnTo = res.locals.returnTo || req.body.returnTo || '';
        res.redirect(buildEditUrl(returnTo));
      } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.sqlMessage && error.sqlMessage.includes('CONSTRAINT `fk_products_updated_by`')) {
          console.warn(`Update failed for product ${productId} due to invalid updated_by user ID: ${userId}. Attempting to save product with updated_by set to NULL.`);
          try {
            await Product.updateProductWithImages(productId, productData, allNewImages, null); // Retry with userId = null
            req.flash('warning_msg', `Product updated. However, the 'updated by' user (ID ${userId}) was not found, so this information was not recorded for this update.`);

            const returnTo = res.locals.returnTo || req.body.returnTo || '';
            res.redirect(buildEditUrl(returnTo));
          } catch (retryError) {
            console.error(`Error updating product ${productId} even after attempting with updated_by = NULL:`, retryError);
            req.flash('error_msg', `Product update failed. User ID ${userId} may be invalid. (Details: ${retryError.message})`);
            const product = await Product.findByIdWithDetails(productId);
            const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
            res.status(500).render('admin/products/product-form', {
              product: { ...product, ...req.body },
              productFamilies,
              colors: colors || [],
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
          const product = await Product.findByIdWithDetails(productId);
          const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
          res.status(500).render('admin/products/product-form', {
            product: { ...product, ...req.body },
            productFamilies,
            colors: colors || [],
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
      const product = await Product.findByIdWithDetails(productId);
      const [productFamilies, colors] = await Promise.all([ProductFamily.getAll(), getColorsSafe()]);
      res.status(500).render('admin/products/product-form', {
        product: { ...product, ...req.body },
        productFamilies,
        colors: colors || [],
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
    const productId = parseInt(req.params.id);
    if (!productId || isNaN(productId)) {
      req.flash('error_msg', 'ID de produto inválido.');
      return res.redirect('/admin/products');
    }
    try {
      const deleted = await Product.delete(productId);
      if (deleted) {
        req.flash('success_msg', 'Produto excluído com sucesso.');
      } else {
        req.flash('error_msg', 'Produto não encontrado ou não foi possível excluir.');
      }
      return res.redirect('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error_msg', 'Erro ao excluir produto: ' + (error.message || 'erro desconhecido'));
      return res.redirect('/admin/products');
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