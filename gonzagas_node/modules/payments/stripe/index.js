const EcommerceSettings = require('../../ecommerce/settings/models/EcommerceSettings');
const { getStripeClient } = require('./stripeClient');
const { pool } = require('../../../config/database');
const orderFulfillmentService = require('../../ecommerce/fulfillment/services/orderFulfillmentService');

async function getConfig() {
  return EcommerceSettings.getPaymentConfig();
}

function isConfigured() {
  return getConfig().then((c) => !!(c.stripeSecretKey && c.mode !== 'disabled'));
}

async function createCheckoutSession(order) {
  const config = await getConfig();
  const stripe = getStripeClient(config.stripeSecretKey);
  if (!stripe) throw new Error('Stripe not configured');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const lineItems = (order.items || []).map((item) => ({
    price_data: {
      currency: (order.currency || 'eur').toLowerCase(),
      product_data: { name: item.product_name || item.name },
      unit_amount: Math.round(parseFloat(item.base_price || item.unit_price) * 100),
    },
    quantity: item.quantity,
  }));

  if (parseFloat(order.shipping_amount) > 0) {
    lineItems.push({
      price_data: {
        currency: (order.currency || 'eur').toLowerCase(),
        product_data: { name: 'Portes de envio' },
        unit_amount: Math.round(parseFloat(order.shipping_amount) * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${baseUrl}/checkout/success?order=${encodeURIComponent(order.order_number)}`,
    cancel_url: `${baseUrl}/checkout/cancel?order=${encodeURIComponent(order.order_number)}`,
    customer_email: order.customer_email,
    metadata: {
      order_id: String(order.id),
      order_number: order.order_number,
    },
  });

  await pool.query(
    `INSERT INTO payments (order_id, provider, external_id, status, amount, currency, payload_json)
     VALUES (?, 'stripe', ?, 'pending', ?, ?, ?)`,
    [
      order.id,
      session.id,
      order.total_amount,
      order.currency || 'EUR',
      JSON.stringify({ sessionId: session.id }),
    ]
  );

  return { url: session.url, sessionId: session.id };
}

async function handleWebhook(rawBody, signature) {
  const config = await getConfig();
  const stripe = getStripeClient(config.stripeSecretKey);
  if (!stripe) throw new Error('Stripe not configured');

  let event;
  if (config.stripeWebhookSecret) {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
  } else {
    throw new Error('Stripe webhook secret not configured');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = parseInt(session.metadata?.order_id, 10);
    if (!orderId) return { handled: false, reason: 'no order_id' };

    const [existing] = await pool.query(
      `SELECT id FROM payments WHERE provider = 'stripe' AND external_id = ? LIMIT 1`,
      [session.id]
    );
    if (existing.length) {
      const [paid] = await pool.query('SELECT payment_status FROM orders WHERE id = ?', [orderId]);
      if (paid[0]?.payment_status === 'paid') {
        return { handled: true, duplicate: true };
      }
    }

    await pool.query(
      `INSERT INTO payments (order_id, provider, external_id, status, amount, currency, payload_json)
       VALUES (?, 'stripe', ?, 'completed', ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = 'completed', payload_json = VALUES(payload_json)`,
      [
        orderId,
        session.id,
        (session.amount_total || 0) / 100,
        (session.currency || 'eur').toUpperCase(),
        JSON.stringify(session),
      ]
    );

    await orderFulfillmentService.fulfillPaidOrder(orderId, session.payment_intent || session.id);
    return { handled: true, orderId };
  }

  return { handled: false, type: event.type };
}

async function refund(paymentReference, amount) {
  const config = await getConfig();
  const stripe = getStripeClient(config.stripeSecretKey);
  if (!stripe) throw new Error('Stripe not configured');
  return stripe.refunds.create({
    payment_intent: paymentReference,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}

module.exports = {
  name: 'stripe',
  isConfigured,
  createCheckoutSession,
  handleWebhook,
  refund,
};
