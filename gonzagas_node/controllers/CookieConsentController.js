const CookieConsent = require('../models/CookieConsent');
const BaseController = require('./BaseController');

class CookieConsentController extends BaseController {
  
  /**
   * Salvar consentimento de cookies
   */
  static async saveConsent(req, res) {
    try {
      const sessionId = req.sessionID || req.session?.id;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID not found'
        });
      }

      const {
        necessary = true,
        analytics = false,
        marketing = false,
        preferences = false
      } = req.body;

      const consentData = {
        necessary: Boolean(necessary),
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        preferences: Boolean(preferences),
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      };

      await CookieConsent.saveConsent(sessionId, consentData);

      res.json({
        success: true,
        message: 'Cookie consent saved successfully',
        consent: consentData
      });

    } catch (error) {
      console.error('Error saving cookie consent:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving cookie consent'
      });
    }
  }

  /**
   * Obter consentimento atual
   */
  static async getConsent(req, res) {
    try {
      const sessionId = req.sessionID || req.session?.id;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID not found'
        });
      }

      const consent = await CookieConsent.getBySessionId(sessionId);

      res.json({
        success: true,
        consent: consent || {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false
        }
      });

    } catch (error) {
      console.error('Error getting cookie consent:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting cookie consent'
      });
    }
  }

  /**
   * Revogar consentimento
   */
  static async revokeConsent(req, res) {
    try {
      const sessionId = req.sessionID || req.session?.id;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID not found'
        });
      }

      await CookieConsent.revokeConsent(sessionId);

      res.json({
        success: true,
        message: 'Cookie consent revoked successfully'
      });

    } catch (error) {
      console.error('Error revoking cookie consent:', error);
      res.status(500).json({
        success: false,
        message: 'Error revoking cookie consent'
      });
    }
  }

  /**
   * Estatísticas de consentimento (admin)
   */
  static async getConsentStats(req, res) {
    try {
      const stats = await CookieConsent.getConsentStats();
      
      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Error getting consent stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting consent stats'
      });
    }
  }

  /**
   * Listar todos os consentimentos (admin)
   */
  static async getAllConsents(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const consents = await CookieConsent.getAllConsents(limit, offset);

      res.json({
        success: true,
        consents,
        pagination: {
          page,
          limit,
          offset
        }
      });

    } catch (error) {
      console.error('Error getting all consents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting all consents'
      });
    }
  }

  /**
   * Renderizar página de configurações de privacidade
   */
  static async showPrivacySettings(req, res) {
    try {
      const sessionId = req.sessionID || req.session?.id;
      let currentConsent = null;

      if (sessionId) {
        currentConsent = await CookieConsent.getBySessionId(sessionId);
      }

      res.render('privacy-settings', {
        title: 'Configurações de Privacidade',
        currentConsent: currentConsent || {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false
        }
      });

    } catch (error) {
      console.error('Error showing privacy settings:', error);
      res.status(500).render('error', {
        title: 'Erro',
        message: 'Erro ao carregar configurações de privacidade',
        layout: false
      });
    }
  }

}

module.exports = CookieConsentController; 