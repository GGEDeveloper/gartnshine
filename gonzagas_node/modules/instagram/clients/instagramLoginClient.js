/**
 * Cliente Instagram Login — graph.instagram.com (token IG...).
 */

const config = require('../config');
const { graphGet } = require('../http/graphGet');
const { apiError } = require('../errors');

/**
 * @param {{ limit: number, fields?: string }} opts
 * @returns {Promise<object[]>} data array
 */
async function fetchMyMedia(opts) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token || !String(token).trim()) {
    const err = new Error('Instagram access token not configured');
    err.code = 'INSTAGRAM_NO_TOKEN';
    throw err;
  }

  const limit = Math.min(Math.max(parseInt(String(opts.limit), 10) || 9, 1), 100);
  const fields = opts.fields || config.INSTAGRAM_LOGIN_MEDIA_FIELDS;

  const base = `${config.INSTAGRAM_LOGIN_HOST}/${config.GRAPH_VERSION}/me/media`;
  const params = new URLSearchParams({
    fields,
    limit: String(limit),
    access_token: String(token).trim()
  });
  const url = `${base}?${params.toString()}`;

  const { ok, status, body } = await graphGet(url);

  if (!ok || body.error) {
    throw apiError(
      (body.error && body.error.message) || `HTTP ${status}`,
      'INSTAGRAM_API',
      status,
      body
    );
  }

  return Array.isArray(body.data) ? body.data : [];
}

module.exports = {
  fetchMyMedia
};
