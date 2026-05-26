const path = require('path');
const express = require('express');
const router = express.Router();
const checkoutService = require('../services/checkoutService');
const cartService = require('../../cart/services/cartService');
const Order = require('../../orders/models/Order');
const { requireEcommerceEnabled } = require('../../cart/middleware/requireEcommerceEnabled');

function viewPath(name) {
  return path.join(__dirname, '..', 'views', name);
}

router.get('/checkout', requireEcommerceEnabled, async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const cart = await cartService.getCart(sessionId);
    if (!cart.items.length) {
      return res.redirect('/cart');
    }
    const prepared = await checkoutService.prepareCheckout(sessionId, 'standard');
    res.render(viewPath('checkout.ejs'), {
      title: 'Checkout',
      ...prepared,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/checkout/success', async (req, res, next) => {
  try {
    const orderNumber = req.query.order;
    const order = orderNumber ? await Order.findByOrderNumber(orderNumber) : null;
    res.render(viewPath('checkout-success.ejs'), {
      title: 'Pedido confirmado',
      order,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/checkout/cancel', async (req, res, next) => {
  try {
    const orderNumber = req.query.order;
    const order = orderNumber ? await Order.findByOrderNumber(orderNumber) : null;
    res.render(viewPath('checkout-cancel.ejs'), {
      title: 'Pagamento cancelado',
      order,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
