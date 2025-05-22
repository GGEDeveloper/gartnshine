const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/authController');

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST /api/auth/register
 * @desc    Registrar um novo usuário
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name', 'Nome é obrigatório').not().isEmpty(),
    body('email', 'Por favor, inclua um email válido').isEmail(),
    body('password', 'Por favor, informe uma senha com 6 ou mais caracteres').isLength({ min: 6 })
  ],
  validate,
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e obter token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email', 'Por favor, inclua um email válido').isEmail(),
    body('password', 'Senha é obrigatória').exists()
  ],
  validate,
  AuthController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Obter perfil do usuário autenticado
 * @access  Private
 */
router.get('/me', AuthController.getProfile);

module.exports = router;
