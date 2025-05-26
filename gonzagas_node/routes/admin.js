const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const adminSessionRequired = require('../middleware/adminAuth');

// Middleware para adicionar currentPath a todas as rotas do admin
const adminMiddleware = (req, res, next) => {
  try {
    // Garante que res.locals exista
    res.locals = res.locals || {};
    
    // Extrai o caminho base
    const fullPath = req.originalUrl || req.path;
    let currentPath = fullPath.replace(/^\/admin/, '') || '/';
    
    // Garante que o caminho comece com /
    if (!currentPath.startsWith('/')) {
      currentPath = '/' + currentPath;
    }
    
    // Define currentPath para uso nos templates
    res.locals.currentPath = currentPath;
    
    // Adiciona ao objeto de renderização
    res.locals.renderOptions = res.locals.renderOptions || {};
    res.locals.renderOptions.currentPath = currentPath;
    
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
const { authenticateUser } = require('../middleware/auth');

// Função para autenticar por email OU nome
async function authenticateByUsernameOrEmail(username, password) {
  try {
    const User = require('../models/User');
    console.log('[AUTH] Tentando autenticar:', username);
    // Procurar por email
    let user = await User.findByEmail(username);
    if (user) {
      console.log('[AUTH] Encontrado por email:', user.email, 'role:', user.role);
    }
    if (!user) {
      // Procurar por nome
      const [rows] = await require('../config/database').pool.query(
        'SELECT * FROM users WHERE name = ? LIMIT 1',
        [username]
      );
      user = rows[0];
      if (user) {
        console.log('[AUTH] Encontrado por nome:', user.name, 'role:', user.role);
      }
    }
    if (!user) {
      console.log('[AUTH] Usuário não encontrado:', username);
      return null;
    }
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('[AUTH] Senha inválida para usuário:', username, 'hash no banco:', user.password);
      return null;
    }
    // Não filtrar por role!
    console.log('[AUTH] Autenticação bem-sucedida:', user.email, 'role:', user.role);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (err) {
    console.error('Erro na autenticação:', err);
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
router.get('/orders', adminSessionRequired, async (req, res) => {
  try {
    const orders = []; // Aqui você buscaria os pedidos do banco de dados
    
    res.render('admin/orders', { 
      title: 'Pedidos',
      orders,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    res.status(500).send('Erro ao carregar a página de pedidos');
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
    layout: '../layout',  // Usa o layout principal do site
    siteTitle: 'Gonzaga\'s Art & Shine',
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
    // Buscar dados do dashboard em paralelo
    const [
      [productsCount],
      [familiesCount],
      [lowStock],
      [outOfStock],
      [customersCount],
      [ordersCount],
      [revenue],
      [recentProducts],
      [recentTransactions]
    ] = await Promise.all([
      // Contagem de produtos
      Product.pool.query('SELECT COUNT(*) as count FROM products'),
      // Contagem de famílias
      Product.pool.query('SELECT COUNT(*) as count FROM product_families'),
      // Produtos com baixo estoque
      Product.pool.query("SELECT COUNT(*) as count FROM products WHERE current_stock > 0 AND current_stock < 5"),
      // Produtos sem estoque
      Product.pool.query("SELECT COUNT(*) as count FROM products WHERE current_stock <= 0"),
      // Contagem de clientes
      Product.pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"),
      // Contagem de pedidos
      Product.pool.query("SELECT COUNT(*) as count FROM orders"),
      // Receita total
      Product.pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'completed'"),
      // Produtos recentes
      Product.pool.query(`
        SELECT p.id, p.reference, p.name, p.sale_price, p.current_stock as stock_quantity, p.is_active,
               (SELECT CONCAT('/media/', image_filename) 
                FROM product_images 
                WHERE product_id = p.id 
                ORDER BY is_primary DESC, sort_order ASC, id ASC 
                LIMIT 1) as image_url,
               pf.name as family_name
        FROM products p
        LEFT JOIN product_families pf ON p.family_id = pf.id
        ORDER BY p.created_at DESC 
        LIMIT 5
      `),
      // Transações recentes (pedidos)
      Product.pool.query(`
        SELECT o.id, o.customer_name, o.created_at, o.total_amount, o.status
        FROM orders o
        ORDER BY o.created_at DESC 
        LIMIT 5
      `)
    ]);


    // Formatando a receita para o formato brasileiro
    const formatCurrency = (value) => {
      return parseFloat(value || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    // Preparar os dados para o template
    const stats = {
      products: productsCount[0].count || 0,
      customers: customersCount[0].count || 0,
      orders: ordersCount[0].count || 0,
      revenue: formatCurrency(revenue[0].total || 0),
      families: familiesCount[0].count || 0,
      lowStock: lowStock[0].count || 0,
      outOfStock: outOfStock[0].count || 0
    };

    // Definir o layout para o painel administrativo
    res.locals.layout = 'admin/layouts/main';
    
    // Renderizar o template com todos os dados
    res.render('admin/pages/simple-dashboard', {
      title: 'Dashboard',
      siteTitle: 'Gonzaga\'s Art & Shine',
      stats,
      recentProducts: recentProducts || [],
      recentTransactions: recentTransactions || [],
      theme: {
        colorPrimary: '#1e1e1e',
        colorSecondary: '#4a3c2d',
        colorAccent: '#6a8c69',
        colorText: '#333333',
        colorHighlight: '#b19cd9',
        colorSuccess: '#4caf50',
        colorWarning: '#ff9800',
        colorDanger: '#f44336',
        colorInfo: '#2196f3',
        colorSuccessRgb: '76, 175, 80',
        colorWarningRgb: '255, 152, 0',
        colorDangerRgb: '244, 67, 54',
        colorPrimaryRgb: '30, 30, 30'
      },
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
router.get('/products', adminSessionRequired, async (req, res) => {
  try {
    console.log('Iniciando busca de produtos...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Buscar produtos e contar o total
    const [products, totalProducts] = await Promise.all([
      Product.getAll(limit, offset),
      Product.count()
    ]);
    
    console.log('Produtos encontrados:', products.length);
    if (products.length > 0) {
      console.log('Primeiro produto (se existir):', {
        id: products[0].id,
        name: products[0].name,
        price: products[0].price,
        stock_quantity: products[0].stock_quantity,
        is_active: products[0].is_active,
        family_name: products[0].family_name
      });
    }
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Formatar os produtos para a view
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
      currentPath: '/admin/products',
      user: req.session.user || { name: 'Admin' },
      siteTitle: 'Gonzaga\'s Art & Shine',
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

router.get('/products/add', adminSessionRequired, async (req, res) => {
  try {
    const families = await ProductFamily.getAll();
    
    res.render('admin/product-form', {
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

router.post('/products/add', adminSessionRequired, upload.single('image'), async (req, res) => {
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

router.get('/products/edit/:id', adminSessionRequired, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.getById(productId);
    
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/admin/products');
    }
    
    const families = await ProductFamily.getAll();
    
    res.render('admin/product-form', {
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

router.post('/products/update/:id', adminSessionRequired, upload.single('image'), async (req, res) => {
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

router.post('/products/delete/:id', adminSessionRequired, async (req, res) => {
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

// Product family management routes
router.get('/categories', adminSessionRequired, async (req, res) => {
  try {
    const families = await ProductFamily.getAllWithProductCount();
    
    res.render('admin/families', {
      title: 'Manage Product Families',
      families
    });
  } catch (error) {
    console.error('Error loading product families:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load product families.'
    });
  }
});

router.post('/categories/add', adminSessionRequired, async (req, res) => {
  try {
    const family = req.body;
    await ProductFamily.create(family);
    
    req.flash('success_msg', 'Product family added successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error adding product family:', error);
    req.flash('error_msg', 'Failed to add product family');
    res.redirect('/admin/categories');
  }
});

router.post('/categories/edit/:id', adminSessionRequired, async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const family = req.body;
    
    await ProductFamily.update(familyId, family);
    
    req.flash('success_msg', 'Product family updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating product family:', error);
    req.flash('error_msg', 'Failed to update product family');
    res.redirect('/admin/categories');
  }
});

router.post('/categories/delete/:id', adminSessionRequired, async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    await ProductFamily.delete(familyId);
    
    req.flash('success_msg', 'Product family deleted successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting product family:', error);
    req.flash('error_msg', error.message || 'Failed to delete product family');
    res.redirect('/admin/families');
  }
});

// Inventory management routes
// Rotas de gerenciamento de inventário
router.get('/inventory', adminSessionRequired, InventoryController.index.bind(InventoryController));
router.get('/inventory/transactions', adminSessionRequired, InventoryController.listTransactions.bind(InventoryController));
router.get('/inventory/:productId', adminSessionRequired, InventoryController.showProductHistory.bind(InventoryController));
router.post('/inventory/adjust', adminSessionRequired, InventoryController.processAdjustment.bind(InventoryController));

// Checkpoint management routes
router.get('/checkpoints', adminSessionRequired, async (req, res) => {
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

router.post('/checkpoints/create', adminSessionRequired, async (req, res) => {
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

router.post('/checkpoints/restore/:id', adminSessionRequired, async (req, res) => {
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

router.post('/checkpoints/delete/:id', adminSessionRequired, async (req, res) => {
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

// Reports route
router.get('/reports', adminSessionRequired, async (req, res) => {
  try {
    // Dados de exemplo para os gráficos
    const salesData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [
        {
          label: 'Vendas',
          backgroundColor: 'rgba(52, 195, 143, 0.2)',
          borderColor: '#34c38f',
          borderWidth: 1,
          data: [65, 59, 80, 81, 56, 55, 40, 45, 55, 70, 90, 100]
        }
      ]
    };

    const topProducts = [
      { name: 'Produto A', sales: 120 },
      { name: 'Produto B', sales: 98 },
      { name: 'Produto C', sales: 85 },
      { name: 'Produto D', sales: 72 },
      { name: 'Produto E', sales: 60 }
    ];

    res.render('admin/reports', {
      title: 'Relatórios',
      currentPath: '/reports',
      user: req.session.user,
      salesData: JSON.stringify(salesData),
      topProducts: topProducts
    });
  } catch (error) {
    console.error('Error loading reports:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load reports page.'
    });
  }
});

// Customers route
router.get('/customers', adminSessionRequired, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Buscar clientes e contar o total
    const [customers, totalCustomers] = await Promise.all([
      // Buscar clientes com paginação
      Product.pool.query('SELECT * FROM users WHERE role = ? LIMIT ? OFFSET ?', ['customer', limit, offset]),
      // Contar total de clientes
      Product.pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['customer'])
    ]);
    
    const totalPages = Math.ceil(totalCustomers[0].count / limit);
    
    res.render('admin/customers', {
      title: 'Clientes',
      customers: customers[0] || [],
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCustomers[0].count,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, totalCustomers[0].count)
      },
      currentPath: '/customers',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error loading customers:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load customers page.'
    });
  }
});

// Settings route
router.get('/settings', adminSessionRequired, async (req, res) => {
  try {
    res.render('admin/settings', {
      title: 'Configurações',
      user: req.session.user,
      currentPath: '/settings'
    });
  } catch (error) {
    console.error('Error loading settings:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load settings page.'
    });
  }
});

module.exports = router; 