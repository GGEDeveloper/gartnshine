const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const Inventory = require('../models/Inventory');
const Report = require('../models/Report');

// Standard Modules
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// Controllers
const AuthController = require('../controllers/AuthController');
const ProductFamilyController = require('../controllers/ProductFamilyController');
const ProductController = require('../controllers/ProductController');
const InventoryController = require('../controllers/InventoryController');
const QuickProductController = require('../controllers/QuickProductController');

// Middleware
const { guestSessionRequired, adminSessionRequired, roleRequired } = require('../middleware/authMiddleware');
const { createGalleryUpload } = require('../middleware/galleryUpload');

const familyHeroUpload = createGalleryUpload('family');

// Models
const Checkpoint = require('../models/Checkpoint');

const XLSX = require('xlsx');

/** Stats para o dashboard (produtos, famílias, stock, valor potencial de inventário). */
async function loadDashboardStats() {
  let orderStats = { orders: 0, revenue: '0.00' };
  try {
    const ecommerce = require('../modules/ecommerce');
    if (typeof ecommerce.getDashboardStats === 'function') {
      orderStats = await ecommerce.getDashboardStats();
    }
  } catch (err) {
    console.warn('Dashboard e-commerce stats unavailable:', err.message);
  }

  const [
    totalProducts,
    totalFamilies,
    lowStockProducts,
    outOfStockProducts,
    recentProducts,
    inventorySummary,
    recentTransactions
  ] = await Promise.all([
    Product.count(),
    ProductFamily.count(),
    Product.countLowStock(),
    Product.countOutOfStock(),
    Product.getRecent(5),
    Product.getInventoryPotentialSummary(),
    Inventory.getRecentForDashboard(5)
  ]);
  return {
    products: totalProducts,
    families: totalFamilies,
    lowStock: lowStockProducts,
    outOfStock: outOfStockProducts,
    recentProducts,
    recentTransactions,
    orders: orderStats.orders,
    revenue: orderStats.revenue,
    inventoryPotentialRevenue: inventorySummary.potentialRevenue,
    inventoryTotalUnits: inventorySummary.totalUnits
  };
}

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
    res.locals.pageTitle = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].label : 'Admin Dashboard';

    next();
  } catch (error) {
    console.error('Error in adminMiddleware:', error);
    // Se houver erro no middleware, passa para o próximo handler de erro
    next(error); 
  }
};

// Aplicar o middleware a todas as rotas do admin
router.use(adminMiddleware);


// Mount settings router
const settingsAdminRouter = require('./admin/settings');
router.use('/settings', settingsAdminRouter);

// Mount gallery router (curadoria da galeria pública /collections)
const galleryAdminRouter = require('./admin/gallery');
router.use('/gallery', galleryAdminRouter);

// Rota para o painel de administração
router.get('/', adminSessionRequired, async (req, res) => {
  try {
    const stats = await loadDashboardStats();
    res.render('admin/dashboard', {
      title: 'Painel',
      user: req.session.user,
      stats
    });
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    req.flash('error_msg', 'Failed to load dashboard data.');
    res.render('admin/dashboard', {
      title: 'Painel',
      user: req.session.user,
      stats: {
        products: 'N/A',
        families: 'N/A',
        lowStock: 'N/A',
        outOfStock: 'N/A',
        orders: 'N/A',
        users: 'N/A',
        revenue: 'N/A',
        recentProducts: [],
        recentTransactions: [],
        inventoryPotentialRevenue: null,
        inventoryTotalUnits: null
      },
      error_msg: req.flash('error_msg')
    });
  }
});

// Alias for dashboard
router.get('/dashboard', adminSessionRequired, async (req, res) => {
  try {
    const stats = await loadDashboardStats();
    res.render('admin/dashboard', {
      title: 'Painel',
      user: req.session.user,
      stats
    });
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    req.flash('error_msg', 'Failed to load dashboard data.');
    res.render('admin/dashboard', {
      title: 'Painel',
      user: req.session.user,
      stats: {
        products: 'N/A',
        families: 'N/A',
        lowStock: 'N/A',
        outOfStock: 'N/A',
        orders: 'N/A',
        users: 'N/A',
        revenue: 'N/A',
        recentProducts: [],
        recentTransactions: [],
        inventoryPotentialRevenue: null,
        inventoryTotalUnits: null
      },
      error_msg: req.flash('error_msg')
    });
  }
});

// Export Excel: produtos, preço venda, stock, subtotais
router.get('/export/inventory-stock.xlsx', adminSessionRequired, async (req, res) => {
  try {
    const rows = await Product.getInventoryExportRows();
    const sheetData = rows.map((r) => ({
      'Referência': r.reference,
      'Nome': r.name,
      'Preço venda (€)': r.sale_price,
      Stock: r.stock,
      'Subtotal (€)': r.line_total
    }));
    const totalSum = rows.reduce((s, r) => s + r.line_total, 0);
    sheetData.push({
      'Referência': '',
      'Nome': '',
      'Preço venda (€)': '',
      Stock: 'TOTAL',
      'Subtotal (€)': totalSum
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventário');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `inventario-stock-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buf));
  } catch (error) {
    console.error('Inventory XLSX export error:', error);
    req.flash('error_msg', 'Erro ao gerar o ficheiro Excel.');
    res.redirect('/admin/dashboard');
  }
});

// Authentication routes
router.get('/login', guestSessionRequired, AuthController.showLoginForm.bind(AuthController));
router.post('/login', guestSessionRequired, AuthController.login.bind(AuthController));
router.get('/logout', adminSessionRequired, AuthController.logout.bind(AuthController));

// Configuração do Multer para upload de imagens de produtos
const productStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'media', 'products');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error creating product image upload directory:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const productImageUpload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
  }
});

// Configuração do Multer para upload de imagens do Summernote
const summernoteStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'media', 'content');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error creating Summernote image upload directory:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'content-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const summernoteImageUpload = multer({
  storage: summernoteStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Tipo de arquivo inválido para Summernote. Apenas imagens são permitidas.'));
  }
});

// Rota para upload de imagem do Summernote
router.post('/upload/image', adminSessionRequired, summernoteImageUpload.single('image'), (req, res) => {
  if (req.file) {
    // O caminho deve ser relativo à pasta 'public' para ser acessível via URL
    const imageUrl = `/media/content/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } else {
    res.status(400).json({ success: false, message: 'Nenhum arquivo enviado ou tipo de arquivo inválido.' });
  }
});


// Product Family / Categories + Colors Routes
router.get('/product-families', adminSessionRequired, ProductFamilyController.listFamilies);
router.get('/product-families/create', adminSessionRequired, ProductFamilyController.showAddForm);
router.post('/product-families/create', adminSessionRequired, ProductFamilyController.createFamily);
router.get('/product-families/edit/:id', adminSessionRequired, ProductFamilyController.showEditForm);
router.post('/product-families/edit/:id', adminSessionRequired, ProductFamilyController.updateFamily);
router.post('/product-families/edit/:id/hero-image',
  adminSessionRequired,
  familyHeroUpload.single('hero_image_file'),
  ProductFamilyController.updateHeroImage
);
router.post('/product-families/delete/:id', adminSessionRequired, ProductFamilyController.deleteFamily);
router.post('/product-families/colors/create', adminSessionRequired, ProductFamilyController.createColor);
router.post('/product-families/colors/edit/:id', adminSessionRequired, ProductFamilyController.updateColor);
router.post('/product-families/colors/delete/:id', adminSessionRequired, ProductFamilyController.deleteColor);


// Quick Product (mobile creation)
router.get('/quick-product', adminSessionRequired, QuickProductController.showForm);
router.get('/quick-product/api/next-reference', adminSessionRequired, QuickProductController.getNextReference);
router.get('/quick-product/api/categories', adminSessionRequired, QuickProductController.getCategories);
router.post('/quick-product',
  adminSessionRequired,
  (req, res, next) => {
    productImageUpload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'image', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('error_msg', 'Imagem demasiado grande. Máximo 5MB por ficheiro. Em telemóvel, considere reduzir a resolução.');
          return res.redirect('/admin/quick-product');
        }
        if (err.message && err.message.includes('arquivo inválido')) {
          req.flash('error_msg', 'Tipo de ficheiro inválido. Use JPEG, PNG, GIF ou WebP.');
          return res.redirect('/admin/quick-product');
        }
        return next(err);
      }
      next();
    });
  },
  QuickProductController.store
);

// Product Management Routes
router.get('/products', adminSessionRequired, ProductController.index);

router.get('/products/add', adminSessionRequired, ProductController.create);
router.post('/products/create', 
  adminSessionRequired, 
  productImageUpload.fields([
    { name: 'images', maxCount: 10 }, // Para múltiplas imagens
    { name: 'image', maxCount: 1 }    // Para uma imagem principal (se houver)
  ]), 
  ProductController.store
);
router.get('/products/edit/:id', adminSessionRequired, (req, res, next) => {
  // Capture returnTo/returnUrl parameter from query string (sem valor por
  // defeito aqui — deixa o controller decidir o fallback, senão nunca chega
  // a olhar para req.query.returnUrl)
  res.locals.returnTo = req.query.returnTo || req.query.returnUrl || '';
  next();
}, ProductController.edit);

router.post('/products/edit/:id', 
  adminSessionRequired, 
  productImageUpload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 1 } 
  ]),
  (req, res, next) => {
    // Preserve returnTo parameter through form submission
    res.locals.returnTo = req.body.returnTo || '/admin/products';
    next();
  },
  ProductController.update
);
router.get('/products/:id', adminSessionRequired, (req, res) => res.redirect(`/admin/products/edit/${req.params.id}`));
router.delete('/products/:id', adminSessionRequired, ProductController.delete);
router.post('/products/delete/:id', adminSessionRequired, ProductController.delete);

// Rota para remover uma imagem de um produto
router.delete('/products/:productId/images/:imageId', adminSessionRequired, async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    // Lógica para encontrar a imagem pelo imageId e verificar se pertence ao productId
    // Lógica para deletar a imagem do sistema de arquivos e do banco de dados
    
    // Exemplo: (Esta parte precisa ser implementada no seu Product model)
    // const imagePath = await Product.removeImage(productId, imageId); 
    // if (imagePath) {
    //   await fs.unlink(path.join(__dirname, '..', 'public', imagePath)); // Deleta do sistema de arquivos
    // }

    // Simulação de sucesso
    console.log(`Attempting to delete image ${imageId} for product ${productId}`);
    // Aqui você chamaria seu model para remover a referência da imagem do produto
    // e deletar o arquivo físico se necessário.

    // Supondo que seu model Product.removeImage(productId, imageId) faz o necessário:
    const success = await Product.deleteProductImage(imageId); // Ou um método similar
    
    if (success) {
      // Se a imagem foi removida do DB, tente remover do sistema de arquivos
      // Você precisará do caminho do arquivo para isso, que o model deveria fornecer ou você buscaria
      // Ex: const imageRecord = await ProductImage.findById(imageId);
      // if (imageRecord && imageRecord.path) {
      //   try {
      //     await fs.unlink(path.join(__dirname, '..', 'public', imageRecord.path));
      //   } catch (fileError) {
      //     console.error('Failed to delete image file:', fileError); 
      //     // Pode não ser um erro crítico se o DB está limpo
      //   }
      // }
      req.flash('success_msg', 'Imagem removida com sucesso.');
      res.json({ success: true, message: 'Imagem removida com sucesso.' });
    } else {
      req.flash('error_msg', 'Erro ao remover a imagem.');
      res.status(404).json({ success: false, message: 'Imagem não encontrada ou erro ao remover.' });
    }
  } catch (error) {
    console.error('Error deleting product image:', error);
    req.flash('error_msg', 'Erro interno ao tentar remover a imagem.');
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});


// User Management Routes
// router.get('/users', adminSessionRequired, UserController.index);
// router.get('/users/create', adminSessionRequired, UserController.create);
// router.post('/users/create', adminSessionRequired, UserController.store);
// router.get('/users/edit/:id', adminSessionRequired, UserController.edit);
// router.post('/users/edit/:id', adminSessionRequired, UserController.update);
// router.post('/users/delete/:id', adminSessionRequired, UserController.delete);


// Inventory Management Routes

router.get('/inventory', adminSessionRequired, InventoryController.index.bind(InventoryController));
router.get('/inventory/history/:productId', adminSessionRequired, InventoryController.showProductHistory.bind(InventoryController));
router.post('/inventory/adjust', adminSessionRequired, InventoryController.processAdjustment.bind(InventoryController));

// Checkpoint management routes
router.get('/checkpoints', adminSessionRequired, async (req, res) => {
  try {
    const checkpoints = await Checkpoint.getAll();
    
    res.render('admin/checkpoints', {
      layout: 'admin/layouts/main',
      title: 'Checkpoints',
      checkpoints,
      currentPath: req.path,
      csrfToken: req.csrfToken ? req.csrfToken() : null
    });
  } catch (error) {
    console.error('Error loading checkpoints:', error);
    res.status(500).render('error', {
      title: 'Erro',
      message: 'Falha ao carregar checkpoints.'
    }, { layout: false });
  }
});

router.post('/checkpoints/create', adminSessionRequired, async (req, res) => {
  try {
    const checkpoint = req.body;
    checkpoint.created_by = req.session?.user?.username || req.session?.user?.name || 'admin';
    
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

// ── Relatório de rentabilidade ────────────────────────────────────────────────
router.get('/reports', adminSessionRequired, async (req, res) => {
  try {
    const [products, stats, topSold, inventory] = await Promise.all([
      Report.getProductMargins(200),
      Report.getOrderStats(),
      Report.getTopSoldProducts(10),
      Report.getInventoryValue()
    ]);

    res.render('admin/reports', {
      title: 'Relatório de Rentabilidade',
      currentPath: '/reports',
      products,
      stats,
      topSold,
      inventory,
    });
  } catch (err) {
    console.error('Error loading reports:', err);
    res.render('admin/reports', {
      title: 'Relatório de Rentabilidade',
      currentPath: '/reports',
      products: [],
      stats: { total_orders: 0, total_revenue: 0, avg_order_value: 0, total_tax: 0, total_shipping: 0 },
      topSold: [],
      inventory: { stock_value_sale: 0, stock_value_cost: 0, total_units: 0 },
    });
  }
});

module.exports = router;