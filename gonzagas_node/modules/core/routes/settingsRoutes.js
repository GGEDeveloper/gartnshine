const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const SettingsController = require('../controllers/settingsController');
const { isAuthenticated, isAdmin } = require('../../../middleware/auth');

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Aplica o middleware de autenticação e verificação de admin em todas as rotas
router.use(isAuthenticated);
router.use(isAdmin);

/**
 * @route   GET /api/settings
 * @desc    Obter todas as configurações
 * @access  Private/Admin
 */
router.get('/', SettingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Atualizar configurações
 * @access  Private/Admin
 */
router.put(
  '/',
  [
    body('*', 'Valor de configuração inválido').optional(),
    body().custom((value, { req }) => {
      // Verifica se pelo menos uma configuração foi fornecida
      if (Object.keys(req.body).length === 0) {
        throw new Error('Nenhuma configuração fornecida');
      }
      return true;
    })
  ],
  validate,
  SettingsController.updateSettings
);

module.exports = router;
