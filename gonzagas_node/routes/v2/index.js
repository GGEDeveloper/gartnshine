const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { isAuthenticated, hasRole } = require('../../../middleware/auth');
const {
  ProductController,
  CustomerController,
  SupplierController,
  InventoryController
} = require('../../controllers');

// Middleware para validação de erros
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

// Rotas públicas
router.post('/auth/register', 
  CustomerController.validate(),
  validate,
  CustomerController.register
);

router.post('/auth/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  CustomerController.login
);

router.post('/auth/forgot-password',
  body('email').isEmail().normalizeEmail(),
  validate,
  CustomerController.forgotPassword
);

router.post('/auth/reset-password/:token',
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  validate,
  CustomerController.resetPassword
);

// Rotas de produtos (públicas)
router.get('/products', ProductController.getActive);
router.get('/products/featured', ProductController.getFeatured);
router.get('/products/family/:familyId', 
  param('familyId').isInt().toInt(),
  validate,
  ProductController.getByFamily
);
router.get('/products/:id', 
  param('id').isInt().toInt(),
  validate,
  ProductController.getById
);

// Rotas de fornecedores (públicas)
router.get('/suppliers', SupplierController.getAll);
router.get('/suppliers/active', SupplierController.getActive);
router.get('/suppliers/search', SupplierController.search);
router.get('/suppliers/:id', 
  param('id').isInt().toInt(),
  validate,
  SupplierController.getById
);

// Middleware para rotas autenticadas
router.use(isAuthenticated);

// Rotas de clientes (autenticadas)
router.get('/customers/me', 
  CustomerController.getProfile
);

router.put('/customers/me', 
  CustomerController.validate(false),
  validate,
  CustomerController.updateProfile
);

router.put('/customers/me/password', 
  [
    body('current_password').notEmpty(),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
  ],
  validate,
  CustomerController.changePassword
);

// Middleware para rotas de administração
router.use(hasRole('admin'));

// Rotas de administração de produtos
router.post('/admin/products', 
  ProductController.validate(),
  validate,
  ProductController.create
);

router.put('/admin/products/:id', 
  param('id').isInt().toInt(),
  ProductController.validate(),
  validate,
  ProductController.update
);

router.delete('/admin/products/:id', 
  param('id').isInt().toInt(),
  validate,
  ProductController.delete
);

router.post('/admin/products/:id/image', 
  param('id').isInt().toInt(),
  validate,
  // upload.single('image'), // Middleware de upload de arquivo
  ProductController.uploadImage
);

// Rotas de administração de fornecedores
router.post('/admin/suppliers', 
  SupplierController.validate(),
  validate,
  SupplierController.create
);

router.put('/admin/suppliers/:id', 
  param('id').isInt().toInt(),
  SupplierController.validate(),
  validate,
  SupplierController.update
);

router.delete('/admin/suppliers/:id', 
  param('id').isInt().toInt(),
  validate,
  SupplierController.delete
);

// Rotas de administração de clientes
router.get('/admin/customers', 
  CustomerController.getAll
);

router.get('/admin/customers/:id', 
  param('id').isInt().toInt(),
  validate,
  CustomerController.getById
);

router.put('/admin/customers/:id', 
  param('id').isInt().toInt(),
  CustomerController.validate(false),
  validate,
  CustomerController.update
);

router.delete('/admin/customers/:id', 
  param('id').isInt().toInt(),
  validate,
  CustomerController.delete
);

// Rotas de estoque
router.post('/inventory/stock-in', 
  InventoryController.validateMovement(),
  validate,
  InventoryController.stockIn
);

router.post('/inventory/stock-out', 
  InventoryController.validateMovement(),
  validate,
  InventoryController.stockOut
);

router.post('/inventory/adjust', 
  [
    body('product_id').isInt().toInt(),
    body('new_quantity').isInt().toInt(),
    body('reason').optional().isString()
  ],
  validate,
  InventoryController.adjustStock
);

router.get('/inventory/movements', 
  InventoryController.getMovementHistory
);

router.get('/inventory/current', 
  InventoryController.getCurrentStock
);

router.get('/inventory/low-stock', 
  InventoryController.getLowStockProducts
);

router.get('/inventory/value', 
  InventoryController.getInventoryValue
);

// Exportar rotas
module.exports = router;
