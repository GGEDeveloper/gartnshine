const { pool } = require('../../../../config/database');
const moduleConfig = require('../../config');

let cache = null;
let cacheAt = 0;

function parseValue(row) {
  const raw = row.setting_value;
  switch (row.setting_type) {
    case 'boolean':
      return raw === 'true' || raw === '1' || raw === true;
    case 'number':
      return parseFloat(raw) || 0;
    case 'json':
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    default:
      return raw ?? '';
  }
}

function serializeValue(value, type) {
  if (type === 'boolean') return value ? 'true' : 'false';
  if (type === 'json') return JSON.stringify(value);
  return String(value ?? '');
}

async function getAll(force = false) {
  const now = Date.now();
  if (!force && cache && now - cacheAt < moduleConfig.settingsCacheMs) {
    return cache;
  }
  const [rows] = await pool.query('SELECT * FROM ecommerce_settings');
  const settings = {};
  for (const row of rows) {
    settings[row.setting_key] = parseValue(row);
  }
  cache = settings;
  cacheAt = now;
  return settings;
}

async function get(key, defaultValue = null) {
  const all = await getAll();
  return all[key] !== undefined ? all[key] : defaultValue;
}

async function set(key, value) {
  const [rows] = await pool.query(
    'SELECT setting_type FROM ecommerce_settings WHERE setting_key = ? LIMIT 1',
    [key]
  );
  const type = rows[0]?.setting_type || 'string';
  const serialized = serializeValue(value, type);
  await pool.query(
    `INSERT INTO ecommerce_settings (setting_key, setting_value, setting_type)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
    [key, serialized, type]
  );
  cache = null;
}

async function setMany(pairs) {
  for (const [key, value] of Object.entries(pairs)) {
    await set(key, value);
  }
}

async function isEnabled() {
  const enabled = await get('ecommerce_enabled', false);
  const maintenance = await get('maintenance_mode', false);
  return !!enabled && !maintenance;
}

async function getPaymentConfig() {
  const settings = await getAll();
  return {
    provider: settings.payment_provider || 'stripe',
    mode: settings.payment_mode || 'disabled',
    stripePublishableKey: settings.stripe_publishable_key || process.env.STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: settings.stripe_secret_key || process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: settings.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '',
  };
}

module.exports = {
  getAll,
  get,
  set,
  setMany,
  isEnabled,
  getPaymentConfig,
  invalidateCache: () => {
    cache = null;
  },
};
