const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const ProductFamilyController = require('../controllers/ProductFamilyController');

// Middleware para adicionar currentPath e breadcrumb a todas as rotas do admin
const adminMiddleware = (req, res, next) => {
  try {
    // Garante que res.locals exista
    res.locals = res.locals || {};
    
    // Extrai o caminho base
    const fullPath = req.originalUrl.split('?')[0]; // Remove query strings
    let currentPath = fullPath.replace(/^\/admin/, '') || '/';
    
    // Garante que o caminho comece com /
    if (!currentPath.startsWith('/')) {
      currentPath = '/' + currentPath;
    }
    
    // Define currentPath para uso nos templates
    res.locals.currentPath = currentPath;
    
    // Define um breadcrumb padrão baseado na rota atual
    let breadcrumb = [];
    const pathParts = currentPath.split('/').filter(part => part);
    
    // Se não for a página inicial, adiciona a home como primeiro item
    if (currentPath !== '/') {
      breadcrumb.push({ label: 'Home', url: '/admin' });
    }
    
    // Adiciona cada parte do caminho ao breadcrumb
    let currentUrl = '';
    pathParts.forEach((part, index) => {
      currentUrl += `/${part}`;
      const isLast = index === pathParts.length - 1;
      
      // Formata o nome para exibição (remove hífens e capitaliza)
      const formattedLabel = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumb.push({
        label: formattedLabel,
        url: isLast ? null : `/admin${currentUrl}`, // Não cria link para a página atual
        active: isLast
      });
    });
    
    // Adiciona ao res.locals para disponibilizar em todas as views
    res.locals.breadcrumb = breadcrumb;
    
    // Adiciona ao objeto de renderização
    res.locals.renderOptions = res.locals.renderOptions || {};
    res.locals.renderOptions.currentPath = currentPath;
    res.locals.renderOptions.breadcrumb = breadcrumb;
    
    next();
  } catch (error) {
    console.error('Erro no middleware de rotas do admin:', error);
    next(error);
  }
};

// Aplica o middleware a todas as rotas do admin
router.use(adminMiddleware);

// Redireciona /admin para dashboard ou login
router.get('/', (req, res) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  return res.redirect('/admin/login');
});

// Outras importações e configurações
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const Checkpoint = require('../models/Checkpoint');
const Inventory = require('../models/Inventory');
const adminSessionRequired = require('../middleware/adminAuth');
const { authenticateUser } = require('../middleware/auth');

// Função para autenticar por email OU nome
async function authenticateByUsernameOrEmail(username, password) {
  try {
    console.log('[AUTH] Iniciando autenticação para:', username);
    const User = require('../models/User');
    console.log('[AUTH] Tentando autenticar:', username);
    
    // Procurar por email
    console.log('[AUTH] Buscando por email...');
    let user = await User.findByEmail(username);
    
    if (user) {
      console.log('[AUTH] Encontrado por email:', user.email, 'ID:', user.id, 'Role:', user.role);
    } else {
      console.log('[AUTH] Nenhum usuário encontrado com o email:', username);
      
      // Procurar por nome
      console.log('[AUTH] Buscando por nome de usuário...');
      try {
        const [rows] = await require('../config/database').pool.query(
          'SELECT * FROM users WHERE name = ? LIMIT 1',
          [username]
        );
        user = rows[0];
        
        if (user) {
          console.log('[AUTH] Encontrado por nome:', user.name, 'ID:', user.id, 'Role:', user.role);
        } else {
          console.log('[AUTH] Nenhum usuário encontrado com o nome:', username);
        }
      } catch (dbErr) {
        console.error('[AUTH] Erro ao buscar usuário por nome:', dbErr);
        return null;
      }
    }
    
    if (!user) {
      console.log('[AUTH] Usuário não encontrado no sistema:', username);
      return null;
    }
    
    console.log('[AUTH] Validando senha para o usuário:', user.email);
    const bcrypt = require('bcryptjs');
    
    try {
      const valid = await bcrypt.compare(password, user.password);
      
      if (!valid) {
        console.log('[AUTH] Senha inválida para o usuário:', user.email);
        return null;
      }
      
      console.log('[AUTH] Autenticação bem-sucedida para:', user.email, 'Role:', user.role);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
    } catch (hashErr) {
      console.error('[AUTH] Erro ao comparar hashes de senha:', hashErr);
      return null;
    }
    
  } catch (err) {
    console.error('[AUTH] Erro no processo de autenticação:', err);
    return null;
  }
}

const config = require('../config/config');
const InventoryController = require('../controllers/InventoryController');

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../media_processed'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error('Error: Images only!'));
  }
});

// Rota para a página de pedidos
router.get('/orders', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }

    // Aqui você pode adicionar a lógica para buscar os pedidos do banco de dados
    const orders = []; // Substitua por sua lógica de busca de pedidos

    res.render('admin/orders', {
      title: 'Pedidos',
      user: req.session.user,
      orders: orders,
      currentPath: '/orders'
    });
  } catch (error) {
    console.error('Erro ao carregar a página de pedidos:', error);
    res.status(500).render('error', {
      message: 'Ocorreu um erro ao carregar a página de pedidos.',
      error: {}
    });
  }
});

// Rota GET para a página de login
router.get('/login', (req, res) => {
  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  
  // Usar o layout principal do site para a página de login
  res.render('admin/login', {
    title: 'Acesso Restrito',
    error: req.flash('error'),
    layout: 'admin/layouts/auth',  // Usa o layout de autenticação do admin
    siteTitle: config.site.name, 
    theme: {
      colorPrimary: '#6c5ce7',
      colorSecondary: '#a29bfe',
      colorAccent: '#fd79a8',
      colorText: '#2d3436',
      colorHighlight: '#dfe6e9',
      primaryRgb: '108, 92, 231'
    }
  });
});

// Rota POST para processar o login
router.post('/login', async (req, res) => {
  console.log('[LOGIN] Body recebido:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', 'Por favor, forneça email/nome de usuário e senha');
    return res.redirect('/admin/login');
  }

  const user = await authenticateByUsernameOrEmail(username, password);
  if (user) {
    req.session.user = user;
    return res.redirect('/admin/dashboard');
  } else {
    req.flash('error', 'Nome de usuário ou senha inválidos');
    res.redirect('/admin/login');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Apply authentication middleware to all admin routes EXCEPT login
router.use((req, res, next) => {
  // Se for a rota de login, não aplicar o middleware de autenticação
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }
  
  // Aplicar o middleware de autenticação para todas as outras rotas
  adminSessionRequired(req, res, next);
});

// Admin dashboard
router.get('/dashboard', adminSessionRequired, async (req, res) => {
  try {
    // Define o breadcrumb específico para o dashboard
    res.locals.breadcrumb = [
      { label: 'Home', url: '/admin' },
      { label: 'Dashboard', active: true }
    ];
    
    // Buscar dados do dashboard em paralelo
    const [
      [productsCount],
      [familiesCount],
      [lowStock],
      [outOfStock],
      [recentProducts],
      [recentTransactions]
    ] = await Promise.all([
      // Contagem de produtos
      Product.pool.query('SELECT COUNT(*) as count FROM products'),
      // Contagem de famílias
      Product.pool.query('SELECT COUNT(*) as count FROM product_families'),
      // Produtos com baixo stock
      Product.pool.query("SELECT COUNT(*) as count FROM products WHERE current_stock > 0 AND current_stock < 5"),
      // Produtos sem stock
      Product.pool.query("SELECT COUNT(*) as count FROM products WHERE current_stock <= 0"),
      // Produtos recentes
      Product.pool.query(`
        SELECT p.id, p.reference, p.name, p.sale_price, p.current_stock, p.is_active,
               (SELECT CONCAT('/media/', image_filename) 
                FROM product_images 
                WHERE product_id = p.id 
                ORDER BY is_primary DESC, sort_order ASC, id ASC 
                LIMIT 1) as image_url
        FROM products p
        ORDER BY p.created_at DESC 
        LIMIT 5
      `),
      // Transações recentes
      Product.pool.query(`
        SELECT t.*, p.name as product_name 
        FROM inventory_transactions t
        LEFT JOIN products p ON t.product_id = p.id
        ORDER BY t.created_at DESC 
        LIMIT 5
      `)
    ]);

    // Preparar os dados para o template
    const stats = {
      products: productsCount[0].count,
      families: familiesCount[0].count,
      lowStock: lowStock[0].count,
      outOfStock: outOfStock[0].count
    };

    // Renderizar o template com todos os dados
    res.render('admin/dashboard', {
      title: 'Dashboard',
      siteTitle: config.site.name, 
      breadcrumb: [
        { label: 'Home', url: '/admin' },
        { label: 'Dashboard', active: true }
      ],
      stats: {
        products: productsCount[0].count,
        families: familiesCount[0].count,
        lowStock: lowStock[0].count,
        outOfStock: outOfStock[0].count,
        recentProducts: recentProducts || [],
        recentTransactions: recentTransactions || []
      },
      theme: {
        colorPrimary: '#1e1e1e',
        colorSecondary: '#4a3c2d',
        colorAccent: '#6a8c69',
        colorText: '#333333',
        colorHighlight: '#b19cd9',
        colorSuccess: '#4caf50',
        colorWarning: '#ff9800',
        colorDanger: '#f44336',
        colorInfo: '#2196f3'
      },
      styles: `
        <style>
          :root {
            --primary: #4e73df;
            --success: #1cc88a;
            --info: #36b9cc;
            --warning: #f6c23e;
            --danger: #e74a3b;
            --light: #f8f9fc;
            --dark: #5a5c69;
          }
        </style>
      `,
      colorSuccessRgb: '76, 175, 80',
      colorWarningRgb: '255, 152, 0',
      colorDangerRgb: '244, 67, 54',
      colorPrimaryRgb: '30, 30, 30',
      user: req.session.user,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('ERRO NO DASHBOARD:', error);
    req.flash('error', 'Erro ao carregar o painel de controle');
    res.redirect('/admin');
  }
});

// Product management routes
router.get('/products', async (req, res) => {
  try {
    console.log('Iniciando busca de produtos...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || config.pagination.defaultLimitAdmin || 10; 
    const offset = (page - 1) * limit;
    
    // Buscar produtos e contar o total
    const [products, totalProducts, productFamilies] = await Promise.all([
      Product.getAll(limit, offset),
      Product.count(),
      ProductFamily.getAll() // Fetch all product families
    ]);

    const totalPages = Math.ceil(totalProducts / limit);
    
    // Formatar os produtos para a view
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name || 'Sem nome',
      reference: product.reference || 'N/A',
      price: parseFloat(product.sale_price) || 0,
      stock_quantity: parseInt(product.current_stock) || 0,
      is_active: product.is_active === 1 || product.is_active === true,
      family_name: product.family_name || 'Sem família',
      image_url: product.image_filename || (product.reference ? `${product.reference}.jpg` : null)
    }));
    
    res.render('admin/products/simple-index', {
      title: 'Gerenciar Produtos',
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalProducts,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, totalProducts)
      },
      productFamilies: productFamilies, // Pass product families to the view
      limit: limit,
      currentPath: '/admin/products',
      user: req.session.user || { name: 'Admin' },
      siteTitle: config.site.name, 
      theme: {
        colorPrimary: '#1e1e1e',
        colorSecondary: '#4a3c2d',
        colorAccent: '#6a8c69',
        colorText: '#333333',
        colorHighlight: '#d4a76a'
      },
      breadcrumb: [
        { title: 'Dashboard', url: '/admin' },
        { title: 'Produtos', active: true }
      ]
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Falha ao carregar os produtos. Por favor, tente novamente.'
    });
  }
});

router.get('/products/add', async (req, res) => {
  try {
    const families = await ProductFamily.getAll();
    
    res.render('admin/products/product-form', {
      title: 'Add Product',
      product: {},
      families,
      isNew: true
    });
  } catch (error) {
    console.error('Error loading product form:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the product form.'
    });
  }
});

router.post('/products/add', upload.single('image'), async (req, res) => {
  try {
    const product = req.body;
    
    // Handle checkbox values
    product.is_active = product.is_active === 'on';
    product.featured = product.featured === 'on';
    
    // Handle file upload
    if (req.file) {
      product.image_filename = req.file.filename;
    }
    
    await Product.create(product);
    
    req.flash('success_msg', 'Product added successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error adding product:', error);
    req.flash('error_msg', 'Failed to add product');
    res.redirect('/admin/products/add');
  }
});

router.get('/products/edit/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.getById(productId);
    
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/admin/products');
    }
    
    const families = await ProductFamily.getAll();
    
    res.render('admin/products/product-form', {
      title: 'Edit Product',
      product,
      families,
      isNew: false
    });
  } catch (error) {
    console.error('Error loading product for editing:', error);
    req.flash('error_msg', 'Failed to load product for editing');
    res.redirect('/admin/products');
  }
});

router.post('/products/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = req.body;
    
    // Handle checkbox values
    product.is_active = product.is_active === 'on';
    product.featured = product.featured === 'on';
    
    // Handle file upload
    if (req.file) {
      product.image_filename = req.file.filename;
    }
    
    await Product.update(productId, product);
    
    req.flash('success_msg', 'Product updated successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);
    req.flash('error_msg', 'Failed to update product');
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
});

router.post('/products/delete/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await Product.delete(productId);
    
    req.flash('success_msg', 'Product deleted successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    req.flash('error_msg', 'Failed to delete product');
    res.redirect('/admin/products');
  }
});

// Product Family Routes
router.get('/product-families', adminMiddleware, ProductFamilyController.listFamilies);
router.get('/product-families/add', adminMiddleware, ProductFamilyController.showAddForm);
router.post('/product-families/add', adminMiddleware, ProductFamilyController.createFamily);
router.get('/product-families/edit/:id', adminMiddleware, ProductFamilyController.showEditForm);
router.post('/product-families/edit/:id', adminMiddleware, ProductFamilyController.updateFamily);
router.post('/product-families/delete/:id', adminMiddleware, ProductFamilyController.deleteFamily);

// Inventory management routes
// Rotas de gerenciamento de inventário
router.get('/inventory', adminSessionRequired, InventoryController.index.bind(InventoryController));
router.get('/inventory/transactions', adminSessionRequired, InventoryController.listTransactions.bind(InventoryController));
router.get('/inventory/:productId', adminSessionRequired, InventoryController.showProductHistory.bind(InventoryController));
router.post('/inventory/adjust', adminSessionRequired, InventoryController.processAdjustment.bind(InventoryController));

// Checkpoint management routes
router.get('/checkpoints', async (req, res) => {
  try {
    const checkpoints = await Checkpoint.getAll();
    
    res.render('admin/checkpoints', {
      title: 'Manage Checkpoints',
      checkpoints
    });
  } catch (error) {
    console.error('Error loading checkpoints:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load checkpoints.'
    });
  }
});

router.post('/checkpoints/create', async (req, res) => {
  try {
    const checkpoint = req.body;
    checkpoint.created_by = req.session.user.username;
    
    await Checkpoint.create(checkpoint);
    
    req.flash('success_msg', 'Checkpoint created successfully');
    res.redirect('/admin/checkpoints');
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    req.flash('error_msg', 'Failed to create checkpoint');
    res.redirect('/admin/checkpoints');
  }
});

router.post('/checkpoints/restore/:id', async (req, res) => {
  try {
    const checkpointId = parseInt(req.params.id);
    await Checkpoint.restore(checkpointId);
    
    req.flash('success_msg', 'Checkpoint restored successfully');
    res.redirect('/admin/checkpoints');
  } catch (error) {
    console.error('Error restoring checkpoint:', error);
    req.flash('error_msg', 'Failed to restore checkpoint');
    res.redirect('/admin/checkpoints');
  }
});

router.post('/checkpoints/delete/:id', async (req, res) => {
  try {
    const checkpointId = parseInt(req.params.id);
    await Checkpoint.delete(checkpointId);
    
    req.flash('success_msg', 'Checkpoint deleted successfully');
    res.redirect('/admin/checkpoints');
  } catch (error) {
    console.error('Error deleting checkpoint:', error);
    req.flash('error_msg', 'Failed to delete checkpoint');
    res.redirect('/admin/checkpoints');
  }
});

module.exports = router; 