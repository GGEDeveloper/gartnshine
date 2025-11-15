const CookieConsent = require('../models/CookieConsent');

/**
 * Middleware para gerenciar consentimento de cookies RGPD
 */
const cookieConsentMiddleware = async (req, res, next) => {
  try {
    // Obter session ID
    const sessionId = req.sessionID || req.session?.id;
    
    if (sessionId) {
      // Verificar se já existe consentimento para esta sessão
      let existingConsent = null;
      try {
        existingConsent = await CookieConsent.getBySessionId(sessionId);
      } catch (err) {
        // Se a tabela não existir, apenas logar e continuar sem erro
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.warn('Cookie consent table does not exist. Skipping consent check.');
          res.locals.cookieConsent = null;
          res.locals.hasGivenConsent = false;
          return next();
        }
        throw err;
      }
      
      // Adicionar informações de consentimento às variáveis locais
      res.locals.cookieConsent = existingConsent;
      res.locals.hasGivenConsent = !!existingConsent;
      
      // Adicionar helper functions para templates
      res.locals.canUseAnalytics = () => {
        return existingConsent && existingConsent.analytics;
      };
      
      res.locals.canUseMarketing = () => {
        return existingConsent && existingConsent.marketing;
      };
      
      res.locals.canUsePreferences = () => {
        return existingConsent && existingConsent.preferences;
      };
    } else {
      res.locals.cookieConsent = null;
      res.locals.hasGivenConsent = false;
      res.locals.canUseAnalytics = () => false;
      res.locals.canUseMarketing = () => false;
      res.locals.canUsePreferences = () => false;
    }
    
    next();
  } catch (error) {
    console.error('Error in cookie consent middleware:', error);
    
    // Em caso de erro, assumir que não há consentimento
    res.locals.cookieConsent = null;
    res.locals.hasGivenConsent = false;
    res.locals.canUseAnalytics = () => false;
    res.locals.canUseMarketing = () => false;
    res.locals.canUsePreferences = () => false;
    
    next();
  }
};

/**
 * Verificar se o usuário pode usar cookies de analytics
 */
const requireAnalyticsConsent = async (req, res, next) => {
  try {
    const sessionId = req.sessionID || req.session?.id;
    
    if (!sessionId) {
      return res.status(403).json({ error: 'Analytics cookies not allowed' });
    }
    
    const consent = await CookieConsent.getBySessionId(sessionId);
    
    if (!consent || !consent.analytics) {
      return res.status(403).json({ error: 'Analytics cookies not allowed' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking analytics consent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verificar se o usuário pode usar cookies de marketing
 */
const requireMarketingConsent = async (req, res, next) => {
  try {
    const sessionId = req.sessionID || req.session?.id;
    
    if (!sessionId) {
      return res.status(403).json({ error: 'Marketing cookies not allowed' });
    }
    
    const consent = await CookieConsent.getBySessionId(sessionId);
    
    if (!consent || !consent.marketing) {
      return res.status(403).json({ error: 'Marketing cookies not allowed' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking marketing consent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  cookieConsentMiddleware,
  requireAnalyticsConsent,
  requireMarketingConsent
}; 