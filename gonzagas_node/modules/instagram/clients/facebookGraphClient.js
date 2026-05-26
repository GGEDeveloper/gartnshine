/**
 * Cliente Instagram via Graph API do Facebook — graph.facebook.com.
 * Requer token de página (Page) com permissões Instagram adequadas.
 */

const config = require('../config');
const { graphGet } = require('../http/graphGet');
const { apiError } = require('../errors');

function pageAccessToken() {
  return (
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
    process.env.INSTAGRAM_PAGE_ACCESS_TOKEN ||
    ''
  ).trim();
}

function buildUrl(path, searchParams) {
  const token = pageAccessToken();
  if (!token) {
    const err = new Error('Facebook Page access token not configured');
    err.code = 'FB_NO_PAGE_TOKEN';
    throw err;
  }
  const base = `${config.FACEBOOK_GRAPH_HOST}/${config.GRAPH_VERSION}${path}`;
  const u = new URL(base);
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v != null && v !== '') u.searchParams.set(k, String(v));
  });
  u.searchParams.set('access_token', token);
  return u.toString();
}

/**
 * Comentários de um IG Media (id numérico do post).
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/comments
 */
async function fetchIgMediaComments(igMediaId, options = {}) {
  const limit = Math.min(Math.max(parseInt(String(options.limit || 25), 10) || 25, 1), 50);
  const fields =
    options.fields || config.FACEBOOK_IG_COMMENT_FIELDS;
  const url = buildUrl(`/${igMediaId}/comments`, {
    fields,
    limit: String(limit)
  });
  const { ok, status, body } = await graphGet(url);
  if (!ok || body.error) {
    throw apiError(
      (body.error && body.error.message) || `HTTP ${status}`,
      'FB_COMMENTS_API',
      status,
      body
    );
  }
  return {
    data: Array.isArray(body.data) ? body.data : [],
    paging: body.paging || null
  };
}

/**
 * Metadados / contagens de um IG Media (likes, comentários, etc. consoante permissões).
 */
async function fetchIgMediaNode(igMediaId, fields) {
  const url = buildUrl(`/${igMediaId}`, {
    fields: fields || config.FACEBOOK_IG_MEDIA_OPTIONAL_FIELDS
  });
  const { ok, status, body } = await graphGet(url);
  if (!ok || body.error) {
    throw apiError(
      (body.error && body.error.message) || `HTTP ${status}`,
      'FB_MEDIA_API',
      status,
      body
    );
  }
  return body;
}

/**
 * Insights de media (métricas variam por tipo de media e produto).
 * @param {string} igMediaId
 * @param {string} metrics - ex: "engagement,impressions,reach"
 */
async function fetchIgMediaInsights(igMediaId, metrics) {
  const url = buildUrl(`/${igMediaId}/insights`, {
    metric: metrics
  });
  const { ok, status, body } = await graphGet(url);
  if (!ok || body.error) {
    throw apiError(
      (body.error && body.error.message) || `HTTP ${status}`,
      'FB_INSIGHTS_API',
      status,
      body
    );
  }
  return Array.isArray(body.data) ? body.data : [];
}

function hasPageToken() {
  return !!pageAccessToken();
}

module.exports = {
  fetchIgMediaComments,
  fetchIgMediaNode,
  fetchIgMediaInsights,
  hasPageToken
};
