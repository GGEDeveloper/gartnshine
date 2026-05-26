/**
 * Engagement — comentários, contagens, insights via Graph API (Facebook).
 * Só funciona com token de página e permissões Meta aprovadas.
 */

const fb = require('../clients/facebookGraphClient');
const config = require('../config');

async function fetchCommentsForMedia(igMediaId, options = {}) {
  if (!fb.hasPageToken()) {
    const err = new Error('Facebook Page token not configured');
    err.code = 'FB_NO_PAGE_TOKEN';
    throw err;
  }
  return fb.fetchIgMediaComments(igMediaId, options);
}

/**
 * like_count, comments_count, etc. (campos dependem da API e do tipo de conta).
 */
async function fetchMediaEngagementSummary(igMediaId, fields) {
  if (!fb.hasPageToken()) {
    const err = new Error('Facebook Page token not configured');
    err.code = 'FB_NO_PAGE_TOKEN';
    throw err;
  }
  return fb.fetchIgMediaNode(igMediaId, fields);
}

/**
 * Insights (métricas) — lista depende do tipo de media; ver documentação Meta.
 * @param {string} igMediaId
 * @param {string} metrics - vírgula ou string única
 */
async function fetchMediaInsights(igMediaId, metrics) {
  if (!fb.hasPageToken()) {
    const err = new Error('Facebook Page token not configured');
    err.code = 'FB_NO_PAGE_TOKEN';
    throw err;
  }
  const m = metrics || process.env.INSTAGRAM_DEFAULT_INSIGHT_METRICS || 'engagement,impressions,reach';
  return fb.fetchIgMediaInsights(igMediaId, m);
}

module.exports = {
  fetchCommentsForMedia,
  fetchMediaEngagementSummary,
  fetchMediaInsights,
  FACEBOOK_IG_MEDIA_OPTIONAL_FIELDS: config.FACEBOOK_IG_MEDIA_OPTIONAL_FIELDS
};
