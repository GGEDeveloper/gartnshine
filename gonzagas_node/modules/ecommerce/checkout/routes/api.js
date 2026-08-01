const express = require('express');
const path = require('path');
const router = express.Router();
const checkoutService = require('../services/checkoutService');
const cartService = require('../../cart/services/cartService');
const EcommerceSettings = require('../../settings/models/EcommerceSettings');
const { requireEcommerceEnabled } = require('../../cart/middleware/requireEcommerceEnabled');
const { requireCustomerForCheckout } = require('../middleware/requireCustomer');

router.use(requireEcommerceEnabled);
// A barreira tem de estar também aqui, não só na página: sem isto, bastava
// chamar POST /api/checkout/submit directamente para encomendar sem conta.
router.use(requireCustomerForCheckout);

router.post('/prepare', async (req, res) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const result = await checkoutService.prepareCheckout(
      sessionId,
      req.body.shippingMethodCode || 'standard'
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    // A encomenda fica sempre no email da conta, não no que vier no formulário.
    // É por email que /account/orders liga as encomendas ao cliente: se o campo
    // fosse editável, a pessoa podia encomendar e depois não ver a encomenda na
    // própria conta.
    const order = await checkoutService.submitCheckout(sessionId, {
      ...req.body,
      customerEmail: req.session.customerEmail,
    });
    await cartService.clearSession(sessionId);
    const paymentConfig = await EcommerceSettings.getPaymentConfig();

    let payment = { mode: paymentConfig.mode, redirectUrl: null };
    if (paymentConfig.mode !== 'disabled') {
      try {
        const payments = require('../../../payments');
        const provider = payments.getProvider(paymentConfig.provider);
        const configured =
          provider &&
          (typeof provider.isConfigured === 'function'
            ? await provider.isConfigured()
            : provider.isConfigured);
        if (configured) {
          const session = await provider.createCheckoutSession(order);
          payment.redirectUrl = session.url;
          payment.sessionId = session.sessionId;
        }
      } catch (payErr) {
        console.warn('[checkout] Payment redirect skipped:', payErr.message);
      }
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
      },
      payment,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
