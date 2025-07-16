const express = require('express');
const router = express.Router();
const CookieConsentController = require('../controllers/CookieConsentController');

// POST /api/cookie-consent - Salvar consentimento de cookies
router.post('/api/cookie-consent', CookieConsentController.saveConsent);

// GET /api/cookie-consent - Obter consentimento atual
router.get('/api/cookie-consent', CookieConsentController.getConsent);

// DELETE /api/cookie-consent - Revogar consentimento
router.delete('/api/cookie-consent', CookieConsentController.revokeConsent);

// GET /privacy-settings - Página de configurações de privacidade
router.get('/privacy-settings', CookieConsentController.showPrivacySettings);

// Rotas admin para estatísticas de consentimento
router.get('/admin/api/cookie-consent/stats', CookieConsentController.getConsentStats);
router.get('/admin/api/cookie-consent/all', CookieConsentController.getAllConsents);

module.exports = router; 