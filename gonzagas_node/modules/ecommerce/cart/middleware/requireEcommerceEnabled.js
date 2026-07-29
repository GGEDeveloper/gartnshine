const EcommerceSettings = require('../../settings/models/EcommerceSettings');

async function requireEcommerceEnabled(req, res, next) {
  try {
    const enabled = await EcommerceSettings.isEnabled();
    if (!enabled) {
      if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
        return res.status(503).json({
          success: false,
          error: 'Loja online temporariamente indisponível.',
        });
      }
      return res.status(503).render('error', {
        title: 'Em breve',
        message: 'A loja online estará disponível em breve. Entretanto, contacte-nos via WhatsApp.',
        layout: false
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireEcommerceEnabled };
