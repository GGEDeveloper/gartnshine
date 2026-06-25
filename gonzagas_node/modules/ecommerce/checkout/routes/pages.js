const path = require('path');
const express = require('express');
const router = express.Router();
const checkoutService = require('../services/checkoutService');
const cartService = require('../../cart/services/cartService');
const Order = require('../../orders/models/Order');
const Customer = require('../../accounts/models/Customer');
const EcommerceSettings = require('../../settings/models/EcommerceSettings');
const { requireEcommerceEnabled } = require('../../cart/middleware/requireEcommerceEnabled');

function viewPath(name) {
  return path.join(__dirname, '..', 'views', name);
}

router.get('/checkout', requireEcommerceEnabled, async (req, res, next) => {
  try {
    const sessionId = cartService.ensureSessionId(req, res);
    const cart = await cartService.getCart(sessionId);
    if (!cart.items.length) {
      // O carrinho é limpo logo após criar a encomenda, ANTES de saber se o
      // pagamento na Stripe vai correr bem. Se o cliente voltar (cartão
      // recusado, cancelou, ou usou o botão "voltar" do browser) sem ter
      // pago, não o mandamos para um carrinho vazio sem hipótese de
      // continuar — mostramos a encomenda pendente com opção de retomar o
      // pagamento.
      const pendingOrder = await Order.findPendingByCartSession(sessionId);
      if (pendingOrder) {
        return res.redirect(`/checkout/cancel?order=${encodeURIComponent(pendingOrder.order_number)}`);
      }
      return res.redirect('/cart');
    }
    const prepared = await checkoutService.prepareCheckout(sessionId, 'standard');
    let customer = null;
    if (req.session.customerId) {
      customer = await Customer.findById(req.session.customerId);
    }
    res.render(viewPath('checkout.ejs'), {
      title: 'Checkout',
      ...prepared,
      customer,
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
    const canRetry = !!(order && order.status === 'pending' && order.payment_status === 'pending');
    res.render(viewPath('checkout-cancel.ejs'), {
      title: 'Pagamento cancelado',
      order,
      canRetry,
      retryError: req.query.error === 'retry_failed',
    });
  } catch (err) {
    next(err);
  }
});

// Gera uma nova sessão de checkout da Stripe para uma encomenda já criada e
// ainda pendente — usado quando o cliente volta da Stripe sem pagar (cartão
// recusado, cancelou, ou usou o botão "voltar") e quer tentar pagar de novo
// sem ter de recriar a encomenda do zero.
router.get('/checkout/retry/:orderNumber', async (req, res, next) => {
  try {
    const order = await Order.findByOrderNumber(req.params.orderNumber);
    if (!order || order.status !== 'pending' || order.payment_status !== 'pending') {
      return res.redirect(`/checkout/cancel?order=${encodeURIComponent(req.params.orderNumber)}&error=retry_failed`);
    }

    const orderWithItems = await Order.findByIdWithItems(order.id);
    const paymentConfig = await EcommerceSettings.getPaymentConfig();
    if (paymentConfig.mode === 'disabled') {
      return res.redirect(`/checkout/cancel?order=${encodeURIComponent(order.order_number)}&error=retry_failed`);
    }

    const payments = require('../../../payments');
    const provider = payments.getProvider(paymentConfig.provider);
    const configured = provider && (await provider.isConfigured());
    if (!configured) {
      return res.redirect(`/checkout/cancel?order=${encodeURIComponent(order.order_number)}&error=retry_failed`);
    }

    const session = await provider.createCheckoutSession(orderWithItems);
    return res.redirect(session.url);
  } catch (err) {
    console.warn('[checkout/retry]', err.message);
    return res.redirect(`/checkout/cancel?order=${encodeURIComponent(req.params.orderNumber)}&error=retry_failed`);
  }
});

module.exports = router;
