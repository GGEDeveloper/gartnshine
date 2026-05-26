const express = require('express');
const registry = require('./registry');
const stripeProvider = require('./stripe');

function registerDefaultProviders() {
  registry.registerProvider('stripe', stripeProvider);
}

function initialize(app) {
  registerDefaultProviders();

  const webhookRouter = express.Router();
  webhookRouter.post(
    '/',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const signature = req.headers['stripe-signature'];
        const result = await stripeProvider.handleWebhook(req.body, signature);
        res.json({ received: true, ...result });
      } catch (err) {
        console.error('[stripe webhook]', err.message);
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.use('/webhooks/stripe', webhookRouter);
}

module.exports = {
  initialize,
  registerProvider: registry.registerProvider,
  getProvider: registry.getProvider,
  listProviders: registry.listProviders,
};
