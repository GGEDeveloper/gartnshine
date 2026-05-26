let stripeClient = null;

function getStripeClient(secretKey) {
  if (!secretKey) return null;
  if (!stripeClient) {
    try {
      const Stripe = require('stripe');
      stripeClient = new Stripe(secretKey);
    } catch (err) {
      console.warn('[payments/stripe] Stripe SDK not installed:', err.message);
      return null;
    }
  }
  return stripeClient;
}

function resetClient() {
  stripeClient = null;
}

module.exports = { getStripeClient, resetClient };
