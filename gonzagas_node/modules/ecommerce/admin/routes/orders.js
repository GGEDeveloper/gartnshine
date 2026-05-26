const express = require('express');
const router = express.Router();
const Order = require('../../orders/models/Order');
const orderFulfillmentService = require('../../fulfillment/services/orderFulfillmentService');
const { adminSessionRequired } = require('../../../../middleware/authMiddleware');

router.use(adminSessionRequired);

router.get('/', async (req, res, next) => {
  try {
    const { orders, total } = await Order.list({
      status: req.query.status,
      paymentStatus: req.query.payment_status,
      search: req.query.search,
    });
    res.render('admin/orders/index', {
      title: 'Pedidos',
      orders,
      total,
      filters: req.query,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdWithItems(parseInt(req.params.id, 10));
    if (!order) return res.status(404).render('error', { title: '404', message: 'Pedido não encontrado' });
    res.render('admin/orders/detail', { title: `Pedido ${order.order_number}`, order });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/status', async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, notes } = req.body;
    await Order.updateStatus(orderId, status, req.session.user?.username || 'admin', notes);
    const events = require('../../events');
    const order = await Order.findByIdWithItems(orderId);
    if (status === 'shipped') events.emit('order.shipped', order);
    req.flash('success', 'Estado actualizado.');
    res.redirect(`/admin/orders/${orderId}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    await orderFulfillmentService.cancelOrder(
      orderId,
      req.session.user?.username || 'admin',
      req.body.notes || 'Cancelled by admin'
    );
    req.flash('success', 'Pedido cancelado.');
    res.redirect(`/admin/orders/${orderId}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/refund', async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const order = await Order.findById(orderId);
    if (order?.payment_reference) {
      const payments = require('../../../payments');
      const provider = payments.getProvider('stripe');
      if (provider?.isConfigured && (await provider.isConfigured())) {
        await provider.refund(order.payment_reference, parseFloat(order.total_amount));
      }
    }
    await Order.updatePaymentStatus(orderId, 'refunded');
    req.flash('success', 'Reembolso processado (se Stripe configurado).');
    res.redirect(`/admin/orders/${orderId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
