const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

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

// Outras importações e configurações
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const Checkpoint = require('../models/Checkpoint');
const Inventory = require('../models/Inventory');
const { isAuthenticated, authenticateUser } = require('../middleware/auth');
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

// Rota GET para a página de login
router.get('/login', (req, res) => {
  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  
  res.render('admin/login', {
    title: 'Admin Login',
    error: req.flash('error')
  });
});

// Rota POST para processar o login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validar entrada
  if (!username || !password) {
    req.flash('error', 'Por favor, forneça nome de usuário e senha');
    return res.redirect('/admin/login');
  }
  
  const user = authenticateUser(username, password);
  
  if (user) {
    // Salvar informações do usuário na sessão
    req.session.user = user;
    
    // Redirecionar para o dashboard
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
  isAuthenticated(req, res, next);
});

// Admin dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
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
      // Produtos com baixo estoque
      Product.pool.query("SELECT COUNT(*) as count FROM products WHERE current_stock > 0 AND current_stock < 5"),
      // Produtos sem estoque
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
    res.render('admin/simple-dashboard', {
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
router.get('/products', async (req, res) => {
  try {
    const products = await Product.getAll();
    const families = await ProductFamily.getAll();
    
    res.render('admin/products', {
      title: 'Manage Products',
      products,
      families
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load products.'
    });
  }
});

router.get('/products/add', async (req, res) => {
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

// Product family management routes
router.get('/families', async (req, res) => {
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

router.post('/families/add', async (req, res) => {
  try {
    const family = req.body;
    await ProductFamily.create(family);
    
    req.flash('success_msg', 'Product family added successfully');
    res.redirect('/admin/families');
  } catch (error) {
    console.error('Error adding product family:', error);
    req.flash('error_msg', 'Failed to add product family');
    res.redirect('/admin/families');
  }
});

router.post('/families/edit/:id', async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const family = req.body;
    
    await ProductFamily.update(familyId, family);
    
    req.flash('success_msg', 'Product family updated successfully');
    res.redirect('/admin/families');
  } catch (error) {
    console.error('Error updating product family:', error);
    req.flash('error_msg', 'Failed to update product family');
    res.redirect('/admin/families');
  }
});

router.post('/families/delete/:id', async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    await ProductFamily.delete(familyId);
    
    req.flash('success_msg', 'Product family deleted successfully');
    res.redirect('/admin/families');
  } catch (error) {
    console.error('Error deleting product family:', error);
    req.flash('error_msg', error.message || 'Failed to delete product family');
    res.redirect('/admin/families');
  }
});

// Inventory management routes
// Rotas de gerenciamento de inventário
router.get('/inventory', isAuthenticated, InventoryController.index.bind(InventoryController));
router.get('/inventory/transactions', isAuthenticated, InventoryController.listTransactions.bind(InventoryController));
router.get('/inventory/:productId', isAuthenticated, InventoryController.showProductHistory.bind(InventoryController));
router.post('/inventory/adjust', isAuthenticated, InventoryController.processAdjustment.bind(InventoryController));

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