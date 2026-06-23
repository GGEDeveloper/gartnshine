/**
 * Serviço de media — Instagram Login + cache curto para preview.
 */

const instagramLoginClient = require('../clients/instagramLoginClient');

let previewCache = { at: 0, data: null };
let previewInflight = null;
const PREVIEW_CACHE_MS = 5 * 60 * 1000; // 5 minutes
const PREVIEW_FETCH_LIMIT = 55;

async function getPreviewMediaBatch() {
  const now = Date.now();
  if (previewCache.data && now - previewCache.at < PREVIEW_CACHE_MS) {
    return previewCache.data;
  }
  if (!previewInflight) {
    previewInflight = instagramLoginClient
      .fetchMyMedia({ limit: PREVIEW_FETCH_LIMIT })
      .then((data) => {
        previewCache = { at: Date.now(), data };
        return data;
      })
      .catch((err) => {
        previewCache = { at: 0, data: null };
        throw err;
      })
      .finally(() => {
        previewInflight = null;
      });
  }
  return previewInflight;
}

async function fetchInstagramPosts(limit = 8) {
  const all = await getPreviewMediaBatch();
  const cap = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 25);
  return all
    .filter(
      (p) =>
        p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM'
    )
    .slice(0, cap);
}

async function fetchInstagramReels(limit = 4) {
  const all = await getPreviewMediaBatch();
  const cap = Math.min(Math.max(parseInt(limit, 10) || 4, 1), 25);
  return all.filter((p) => p.media_type === 'VIDEO').slice(0, cap);
}

async function fetchInstagramFeed(limit = 9) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 25);
  return instagramLoginClient.fetchMyMedia({ limit: safeLimit });
}

function invalidatePreviewCache() {
  previewCache = { at: 0, data: null };
}

module.exports = {
  fetchInstagramFeed,
  fetchInstagramPosts,
  fetchInstagramReels,
  getPreviewMediaBatch,
  invalidatePreviewCache
};
