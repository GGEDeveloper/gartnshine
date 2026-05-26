const express = require('express');
const router = express.Router();
const EcommerceSettings = require('../models/EcommerceSettings');
const { adminSessionRequired } = require('../../../../middleware/authMiddleware');

router.use(adminSessionRequired);

router.get('/', async (req, res, next) => {
  try {
    const settings = await EcommerceSettings.getAll(true);
    res.render('admin/settings/ecommerce', {
      title: 'E-commerce Settings',
      settings,
      messages: req.flash(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    await EcommerceSettings.setMany({
      ecommerce_enabled: body.ecommerce_enabled === 'on',
      maintenance_mode: body.maintenance_mode === 'on',
      prices_include_tax: body.prices_include_tax === 'on',
      tax_rate: parseFloat(body.tax_rate) || 23,
      payment_provider: body.payment_provider || 'stripe',
      payment_mode: body.payment_mode || 'disabled',
      stripe_publishable_key: body.stripe_publishable_key || '',
      stripe_secret_key: body.stripe_secret_key || '',
      stripe_webhook_secret: body.stripe_webhook_secret || '',
      shipping_mode: body.shipping_mode || 'flat_rate',
      free_shipping_threshold: parseFloat(body.free_shipping_threshold) || 75,
      standard_shipping_cost: parseFloat(body.standard_shipping_cost) || 5.99,
      express_shipping_cost: parseFloat(body.express_shipping_cost) || 12.99,
      order_notification_email: body.order_notification_email || '',
    });
    req.flash('success', 'Configurações e-commerce guardadas.');
    res.redirect('/admin/settings/ecommerce');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
