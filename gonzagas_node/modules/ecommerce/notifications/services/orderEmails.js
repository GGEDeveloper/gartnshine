const events = require('../../events');
const EcommerceSettings = require('../../settings/models/EcommerceSettings');

function registerListeners() {
  events.on('order.paid', async (order) => {
    console.log(`[ecommerce] Order paid: ${order.order_number}`);
    try {
      await sendAdminNotification(order);
    } catch (err) {
      console.warn('[ecommerce] Admin notification failed:', err.message);
    }
  });

  events.on('order.shipped', (order) => {
    console.log(`[ecommerce] Order shipped: ${order.order_number}`);
  });
}

async function sendAdminNotification(order) {
  const email = await EcommerceSettings.get('order_notification_email');
  if (!email) return;
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    if (!process.env.SMTP_HOST) return;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || email,
      to: email,
      subject: `Novo pedido ${order.order_number}`,
      text: `Novo pedido pago: ${order.order_number}\nTotal: €${order.total_amount}\nCliente: ${order.customer_name} (${order.customer_email})`,
    });
  } catch (err) {
    console.warn('[orderEmails]', err.message);
  }
}

module.exports = { registerListeners, sendAdminNotification };
