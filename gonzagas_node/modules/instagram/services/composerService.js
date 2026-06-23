/**
 * Composição — cruza media (Instagram Login) com dados do Graph (Facebook).
 * Útil para vitrines que mostram likes/comentários quando o Page token existe.
 */

const fb = require('../clients/facebookGraphClient');
const engagementService = require('./engagementService');

/**
 * @param {object[]} items - objetos com pelo menos `id` (IG media id)
 * @param {{ concurrency?: number }} opts
 * @returns {Promise<Array<{ media: object, engagement: object|null, error?: string }>>}
 */
async function enrichMediaWithEngagement(items, opts = {}) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return [];

  if (!fb.hasPageToken()) {
    return list.map((m) => ({
      media: m,
      engagement: null,
      skipped: 'no_page_token'
    }));
  }

  const concurrency = Math.min(Math.max(parseInt(String(opts.concurrency || 2), 10) || 2, 1), 5);
  const out = [];

  for (let i = 0; i < list.length; i += concurrency) {
    const chunk = list.slice(i, i + concurrency);
    const part = await Promise.all(
      chunk.map(async (m) => {
        if (!m || !m.id) {
          return { media: m, engagement: null, error: 'no_media_id' };
        }
        try {
          const engagement = await engagementService.fetchMediaEngagementSummary(
            m.id
          );
          return { media: m, engagement };
        } catch (e) {
          return { media: m, engagement: null, error: e.code || 'enrich_failed' };
        }
      })
    );
    out.push(...part);
  }

  return out;
}

module.exports = {
  enrichMediaWithEngagement
};
