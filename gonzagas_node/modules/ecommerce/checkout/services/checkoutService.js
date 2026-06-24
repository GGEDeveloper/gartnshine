const EcommerceSettings = require('../../settings/models/EcommerceSettings');
const pricingService = require('../../settings/services/pricingService');
const shippingService = require('../../shipping/services/shippingService');
const cartService = require('../../cart/services/cartService');
const Order = require('../../orders/models/Order');
const events = require('../../events');

async function prepareCheckout(sessionId, shippingMethodCode) {
  const cart = await cartService.getCart(sessionId);
  if (!cart.items.length) throw new Error('Carrinho vazio');

  const settings = await EcommerceSettings.getAll();
  const subtotalForShipping = cart.items.reduce((s, i) => s + i.totalPrice, 0);
  const { cost: shippingCost, method } = await shippingService.calculateShippingCost(
    shippingMethodCode || 'standard',
    subtotalForShipping,
    settings
  );

  const totals = pricingService.calculateCartTotals(cart.items, shippingCost, settings);
  const methods = await shippingService.getActiveMethods();

  return { cart, totals, shippingMethod: method, shippingMethods: methods, settings };
}

async function submitCheckout(sessionId, formData, connection) {
  const conn = connection || pool;
  const shippingCode = formData.shippingMethodCode || 'standard';

  await conn.beginTransaction();
  try {
    const prepared = await prepareCheckout(sessionId, shippingCode);
    const { cart, totals, shippingMethod } = prepared;

    // Verificar stock com SELECT FOR UPDATE (previne race condition)
    for (const item of cart.items) {
      const [stockRows] = await conn.query(
        'SELECT current_stock FROM products WHERE id = ? FOR UPDATE',
        [item.productId]
      );
      const currentStock = stockRows[0]?.current_stock || 0;

      if (item.quantity > currentStock) {
        await conn.rollback();
        throw new Error(
          `"${item.name}" tem apenas ${currentStock} unidade(s) disponíve${currentStock === 1 ? 'l' : 'is'}. Atualize o carrinho antes de continuar.`
        );
      }
      if (currentStock <= 0) {
        await conn.rollback();
        throw new Error(`"${item.name}" ficou esgotado. Remova-o do carrinho antes de continuar.`);
      }
    }

    const order = await Order.createFromCheckout(
      {
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        billingAddressLine1: formData.billingAddressLine1,
        billingAddressLine2: formData.billingAddressLine2,
        billingCity: formData.billingCity,
        billingPostalCode: formData.billingPostalCode,
        billingCountry: formData.billingCountry || 'Portugal',
        shippingAddressLine1: formData.sameAsBilling
          ? formData.billingAddressLine1
          : formData.shippingAddressLine1,
        shippingAddressLine2: formData.sameAsBilling
          ? formData.billingAddressLine2
          : formData.shippingAddressLine2,
        shippingCity: formData.sameAsBilling ? formData.billingCity : formData.shippingCity,
        shippingPostalCode: formData.sameAsBilling
          ? formData.billingPostalCode
          : formData.shippingPostalCode,
        shippingCountry: formData.sameAsBilling
          ? formData.billingCountry || 'Portugal'
          : formData.shippingCountry || 'Portugal',
        shippingMethodCode: shippingMethod?.code || shippingCode,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        shippingAmount: totals.shipping,
        totalAmount: totals.total,
        currency: 'EUR',
        paymentMethod: formData.paymentMethod || 'stripe',
        notes: formData.notes,
        cartSessionId: sessionId,
      },
      cart.items.map((i) => ({
        productId: i.productId,
        reference: i.reference,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        basePrice: i.basePrice,
        totalPrice: i.totalPrice,
        name: i.name,
        imageFilename: i.imageFilename,
      })),
      conn
    );

    await conn.commit();
    events.emit('order.created', order);
    return order;
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

module.exports = { prepareCheckout, submitCheckout };
