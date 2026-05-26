const path = require('path');
const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const EcommerceSettings = require('../../settings/models/EcommerceSettings');
const pricingService = require('../../settings/services/pricingService');
const { requireEcommerceEnabled } = require('../middleware/requireEcommerceEnabled');

function viewPath(name) {
  return path.join(__dirname, '..', 'views', name);
}

router.get('/cart', requireEcommerceEnabled, async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const cart = await cartService.getCart(sessionId);
    const settings = await EcommerceSettings.getAll();
    const totals = pricingService.calculateCartTotals(cart.items, 0, settings);
    res.render(viewPath('cart.ejs'), {
      title: 'Carrinho',
      cart,
      totals,
      settings,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
