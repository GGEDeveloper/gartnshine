const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../middleware/auth');
const Product = require('../../models/Product');
const { formatError } = require('../../utils/error-handler');

// Middleware para verificar se o usuário tem permissão para gerenciar produtos
router.use(requireAuth('manage_products'));

/**
 * Lista todos os produtos
 */
router.get('/', async (req, res, next) => {
  try {
    console.log('Acessando rota de listagem de produtos');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    console.log('Buscando produtos no banco de dados...');
    let products = [];
    try {
      products = await Product.getAll();
      console.log(`Total de produtos encontrados: ${products.length}`);
      if (products.length > 0) {
        console.log('Primeiro produto como exemplo:', {
          id: products[0].id,
          name: products[0].name,
          price: products[0].price,
          stock_quantity: products[0].stock_quantity,
          is_active: products[0].is_active,
          family_name: products[0].family_name
        });
      }
    } catch (dbError) {
      console.error('Erro ao buscar produtos no banco de dados:', dbError);
      return res.status(500).send('Erro ao buscar produtos');
    }
    
    // Mapear os produtos para o formato esperado pela view
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name || 'Sem nome',
      reference: product.reference || 'N/A',
      price: parseFloat(product.price) || 0,
      stock_quantity: parseInt(product.stock_quantity) || 0,
      is_active: product.is_active === 1 || product.is_active === true,
      family_name: product.family_name || 'Sem família',
      image_url: product.image_url || null
    }));
    
    const count = formattedProducts.length;
    const totalPages = Math.ceil(count / limit);
    const paginatedProducts = formattedProducts.slice(offset, offset + limit);
    
    console.log(`Renderizando view com ${paginatedProducts.length} produtos (página ${page} de ${totalPages})`);
    
    // Renderizar a view com os dados formatados
    res.render('admin/products/index', {
      title: 'Produtos',
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: count,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, count)
      },
      currentPath: '/admin/products',
      customCss: 'admin-products',
      customJs: 'admin-products'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    next(error);
  }
});

/**
 * API para DataTables
 */
router.get('/datatable', async (req, res) => {
  try {
    const { draw, start, length, order, search } = req.query;
    const orderColumn = order && order[0] ? order[0].column : 0;
    const orderDir = order && order[0] ? order[0].dir : 'desc';
    const searchValue = search ? search.value : '';
    
    const columns = ['id', 'name', 'price', 'stock', 'status', 'createdAt'];
    const orderBy = columns[orderColumn] || 'createdAt';
    
    const where = {};
    
    if (searchValue) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchValue}%` } },
        { description: { [Op.like]: `%${searchValue}%` } },
        { sku: { [Op.like]: `%${searchValue}%` } }
      ];
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [[orderBy, orderDir.toUpperCase()]],
      offset: parseInt(start),
      limit: parseInt(length)
    });
    
    const data = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.formattedPrice,
      stock: product.stock,
      status: product.status,
      createdAt: product.formattedCreatedAt,
      actions: `
        <div class="btn-group">
          <a href="/admin/products/${product.id}" class="btn btn-sm btn-info" title="Visualizar">
            <i class="fas fa-eye"></i>
          </a>
          <a href="/admin/products/${product.id}/edit" class="btn btn-sm btn-primary" title="Editar">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
    }));
    
    res.json({
      draw: parseInt(draw),
      recordsTotal: count,
      recordsFiltered: count,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar produtos para DataTable:', error);
    res.status(500).json({
      error: 'Erro ao carregar dados da tabela'
    });
  }
});

/**
 * Exibe o formulário para adicionar um novo produto
 */
router.get('/new', (req, res) => {
  res.render('admin/products/form', {
    title: 'Adicionar Produto',
    product: {},
    formAction: '/admin/products',
    method: 'POST',
    breadcrumbs: [
      { text: 'Dashboard', url: '/admin' },
      { text: 'Produtos', url: '/admin/products' },
      { text: 'Adicionar' }
    ]
  });
});

// Validação de produto
const productValidation = [
  check('name')
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ max: 255 }).withMessage('O nome não pode ter mais de 255 caracteres'),
  check('sku')
    .optional({ checkFalsy: true })
    .isLength({ max: 50 }).withMessage('O SKU não pode ter mais de 50 caracteres'),
  check('description')
    .optional({ checkFalsy: true }),
  check('price')
    .notEmpty().withMessage('O preço é obrigatório')
    .isFloat({ min: 0 }).withMessage('O preço deve ser um número positivo'),
  check('compareAtPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('O preço de comparação deve ser um número positivo'),
  check('costPerItem')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('O custo por item deve ser um número positivo'),
  check('stock')
    .notEmpty().withMessage('O estoque é obrigatório')
    .isInt({ min: 0 }).withMessage('O estoque deve ser um número inteiro não negativo'),
  check('barcode')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }).withMessage('O código de barras não pode ter mais de 100 caracteres'),
  check('status')
    .isIn(['draft', 'active', 'archived']).withMessage('Status inválido'),
  check('isTaxable')
    .optional()
    .isBoolean().withMessage('O campo tributável deve ser verdadeiro ou falso'),
  check('requiresShipping')
    .optional()
    .isBoolean().withMessage('O campo requer envio deve ser verdadeiro ou falso')
];

/**
 * Processa o formulário de criação de produto
 */
router.post('/', productValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('admin/products/form', {
        title: 'Adicionar Produto',
        product: req.body,
        formAction: '/admin/products',
        method: 'POST',
        errors: errors.array(),
        breadcrumbs: [
          { text: 'Dashboard', url: '/admin' },
          { text: 'Produtos', url: '/admin/products' },
          { text: 'Adicionar' }
        ]
      });
    }
    
    const productData = {
      ...req.body,
      userId: req.user.id,
      isTaxable: req.body.isTaxable === 'on',
      requiresShipping: req.body.requiresShipping === 'on',
      price: parseFloat(req.body.price),
      compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : null,
      costPerItem: req.body.costPerItem ? parseFloat(req.body.costPerItem) : null,
      stock: parseInt(req.body.stock)
    };
    
    const product = await Product.create(productData);
    
    req.flash('success', 'Produto adicionado com sucesso!');
    res.redirect(`/admin/products/${product.id}`);
  } catch (error) {
    next(error);
  }
});

/**
 * Middleware para carregar um produto
 */
async function loadProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      req.flash('error', 'Produto não encontrado');
      return res.redirect('/admin/products');
    }
    
    req.product = product;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Exibe os detalhes de um produto
 */
router.get('/:id', loadProduct, (req, res) => {
  const { product } = req;
  
  res.render('admin/products/show', {
    title: product.name,
    product,
    breadcrumbs: [
      { text: 'Dashboard', url: '/admin' },
      { text: 'Produtos', url: '/admin/products' },
      { text: product.name }
    ]
  });
});

/**
 * Exibe o formulário para editar um produto
 */
router.get('/:id/edit', loadProduct, (req, res) => {
  const { product } = req;
  
  res.render('admin/products/form', {
    title: `Editar: ${product.name}`,
    product,
    formAction: `/admin/products/${product.id}?_method=PUT`,
    method: 'POST',
    breadcrumbs: [
      { text: 'Dashboard', url: '/admin' },
      { text: 'Produtos', url: '/admin/products' },
      { text: product.name, url: `/admin/products/${product.id}` },
      { text: 'Editar' }
    ]
  });
});

/**
 * Processa o formulário de atualização de produto
 */
router.put('/:id', loadProduct, productValidation, async (req, res, next) => {
  try {
    const { product } = req;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('admin/products/form', {
        title: `Editar: ${product.name}`,
        product: { ...product.toJSON(), ...req.body },
        formAction: `/admin/products/${product.id}?_method=PUT`,
        method: 'POST',
        errors: errors.array(),
        breadcrumbs: [
          { text: 'Dashboard', url: '/admin' },
          { text: 'Produtos', url: '/admin/products' },
          { text: product.name, url: `/admin/products/${product.id}` },
          { text: 'Editar' }
        ]
      });
    }
    
    const productData = {
      ...req.body,
      isTaxable: req.body.isTaxable === 'on',
      requiresShipping: req.body.requiresShipping === 'on',
      price: parseFloat(req.body.price),
      compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : null,
      costPerItem: req.body.costPerItem ? parseFloat(req.body.costPerItem) : null,
      stock: parseInt(req.body.stock)
    };
    
    await product.update(productData);
    
    req.flash('success', 'Produto atualizado com sucesso!');
    res.redirect(`/admin/products/${product.id}`);
  } catch (error) {
    next(error);
  }
});

/**
 * Atualiza o status de um produto (via AJAX)
 */
router.patch('/:id/status', loadProduct, async (req, res) => {
  try {
    const { product } = req;
    const { status } = req.body;
    
    if (!['draft', 'active', 'archived'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status inválido' 
      });
    }
    
    await product.update({ status });
    
    res.json({ 
      success: true, 
      message: 'Status atualizado com sucesso',
      data: { status }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do produto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar status',
      error: error.message 
    });
  }
});

/**
 * Remove um produto
 */
router.delete('/:id', loadProduct, async (req, res, next) => {
  try {
    const { product } = req;
    
    await product.destroy();
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ 
        success: true, 
        message: 'Produto removido com sucesso',
        redirect: '/admin/products'
      });
    }
    
    req.flash('success', 'Produto removido com sucesso!');
    res.redirect('/admin/products');
  } catch (error) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao remover o produto',
        error: formatError(error)
      });
    }
    
    next(error);
  }
});

/**
 * API para buscar produtos (usado em selects com busca)
 */
router.get('/api/search', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.json({ results: [] });
    }
    
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { sku: { [Op.like]: `%${searchTerm}%` } }
        ],
        status: 'active'
      },
      limit: 10,
      attributes: ['id', 'name', 'sku', 'price', 'stock'],
      order: [['name', 'ASC']]
    });
    
    const results = products.map(product => ({
      id: product.id,
      text: `${product.name} (${product.sku || 'Sem SKU'})`,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock
    }));
    
    res.json({ results });
  } catch (error) {
    console.error('Erro na busca de produtos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar produtos',
      error: error.message 
    });
  }
});

module.exports = router;
