const express = require('express');
const registry = require('./registry');
const stripeProvider = require('./stripe');

function registerDefaultProviders() {
  registry.registerProvider('stripe', stripeProvider);
}

let webhookRouteMounted = false;

// Tem de ser chamado ANTES do express.json() global em app.js: o corpo do
// webhook precisa de chegar em raw bytes para stripe.webhooks.constructEvent
// conseguir verificar a assinatura.
function mountWebhookRoute(app) {
  if (webhookRouteMounted) return;
  webhookRouteMounted = true;

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

function initialize() {
  registerDefaultProviders();
}

module.exports = {
  initialize,
  mountWebhookRoute,
  registerProvider: registry.registerProvider,
  getProvider: registry.getProvider,
  listProviders: registry.listProviders,
};
