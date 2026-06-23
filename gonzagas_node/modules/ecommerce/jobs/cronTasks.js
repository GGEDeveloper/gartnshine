const cron = require('node-cron');
const { pool } = require('../../../config/database');
const moduleConfig = require('../config');

function registerJobs() {
  cron.schedule('0 3 * * *', async () => {
    try {
      await pool.query(
        'DELETE FROM cart_sessions WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [moduleConfig.cartCleanupDays]
      );
      await pool.query(
        `UPDATE orders SET status = 'cancelled'
         WHERE status = 'pending' AND payment_status = 'pending'
         AND created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
        [moduleConfig.pendingOrderExpiryMinutes]
      );
    } catch (err) {
      console.error('[ecommerce jobs]', err.message);
    }
  });
}

module.exports = { registerJobs };
