const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cartApiRoutes = require('./cart/routes/api');
const cartPageRoutes = require('./cart/routes/pages');
const checkoutApiRoutes = require('./checkout/routes/api');
const checkoutPageRoutes = require('./checkout/routes/pages');
const settingsAdminRoutes = require('./settings/routes/admin');
const ordersAdminRoutes = require('./admin/routes/orders');
const accountRoutes = require('./accounts/routes/pages');
const orderEmails = require('./notifications/services/orderEmails');
const cronTasks = require('./jobs/cronTasks');
const events = require('./events');
const ecommerceAnalytics = require('./analytics/services/ecommerceAnalytics');
const Order = require('./orders/models/Order');
const cartService = require('./cart/services/cartService');
const EcommerceSettings = require('./settings/models/EcommerceSettings');

function initialize(app) {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/cart', apiLimiter, cartApiRoutes);
  app.use('/api/checkout', apiLimiter, checkoutApiRoutes);
  app.use('/', cartPageRoutes);
  app.use('/', checkoutPageRoutes);
  app.use('/admin/settings/ecommerce', settingsAdminRoutes);
  app.use('/admin/orders', ordersAdminRoutes);
  app.use('/account', accountRoutes);

  const publicPath = path.join(__dirname, 'public');
  app.use('/ecommerce', express.static(publicPath));

  orderEmails.registerListeners();

  events.on('order.paid', (order) => {
    ecommerceAnalytics.trackPurchase(order);
  });

  cronTasks.registerJobs();

  app.use(async (req, res, next) => {
    try {
      res.locals.ecommerceEnabled = await EcommerceSettings.isEnabled();
      if (req.cookies?.cart_session_id) {
        const cart = await cartService.getCart(req.cookies.cart_session_id);
        res.locals.cartItemCount = cart.itemCount;
      } else {
        res.locals.cartItemCount = 0;
      }
    } catch {
      res.locals.ecommerceEnabled = false;
      res.locals.cartItemCount = 0;
    }
    next();
  });
}

async function getDashboardStats() {
  return Order.getDashboardStats();
}

module.exports = {
  initialize,
  getDashboardStats,
  events,
  EcommerceSettings,
  Order,
  cartService,
};
