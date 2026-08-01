const path = require('path');
const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const EcommerceSettings = require('../../settings/models/EcommerceSettings');
const pricingService = require('../../settings/services/pricingService');
const { requireEcommerceEnabled } = require('../middleware/requireEcommerceEnabled');

router.use(requireEcommerceEnabled);

router.get('/', async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const cart = await cartService.getCart(sessionId);
    const settings = await EcommerceSettings.getAll();
    const totals = pricingService.calculateCartTotals(cart.items, 0, settings);
    res.json({ success: true, cart, totals });
  } catch (err) {
    next(err);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId required' });
    }
    const cart = await cartService.addItem(
      sessionId,
      parseInt(productId, 10),
      quantity || 1,
      req.session?.customerEmail || null
    );
    const settings = await EcommerceSettings.getAll();
    const totals = pricingService.calculateCartTotals(cart.items, 0, settings);
    res.json({ success: true, cart, totals });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/items/:productId', async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const productId = parseInt(req.params.productId, 10);
    const cart = await cartService.updateItem(sessionId, productId, req.body.quantity);
    const settings = await EcommerceSettings.getAll();
    const totals = pricingService.calculateCartTotals(cart.items, 0, settings);
    res.json({ success: true, cart, totals });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const productId = parseInt(req.params.productId, 10);
    const cart = await cartService.removeItem(sessionId, productId);
    const settings = await EcommerceSettings.getAll();
    const totals = pricingService.calculateCartTotals(cart.items, 0, settings);
    res.json({ success: true, cart, totals });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
