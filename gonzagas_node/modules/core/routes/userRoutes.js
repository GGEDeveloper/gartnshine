const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const UserController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../../../middleware/auth');

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Aplica o middleware de autenticação em todas as rotas
router.use(isAuthenticated);
router.use(isAdmin);

/**
 * @route   GET /api/users
 * @desc    Obter todos os usuários
 * @access  Private/Admin
 */
router.get('/', UserController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  [param('id', 'ID inválido').isInt()],
  validate,
  UserController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Criar um novo usuário
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('name', 'Nome é obrigatório').not().isEmpty(),
    body('email', 'Por favor, inclua um email válido').isEmail(),
    body('password', 'Por favor, informe uma senha com 6 ou mais caracteres')
      .isLength({ min: 6 }),
    body('role', 'Função inválida').isIn(['admin', 'manager', 'user'])
  ],
  validate,
  UserController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar um usuário
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    param('id', 'ID inválido').isInt(),
    body('name', 'Nome é obrigatório').optional().not().isEmpty(),
    body('email', 'Por favor, inclua um email válido').optional().isEmail(),
    body('password', 'A senha deve ter pelo menos 6 caracteres')
      .optional()
      .isLength({ min: 6 }),
    body('role', 'Função inválida').optional().isIn(['admin', 'manager', 'user'])
  ],
  validate,
  UserController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Excluir um usuário
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  [param('id', 'ID inválido').isInt()],
  validate,
  UserController.deleteUser
);

module.exports = router;
