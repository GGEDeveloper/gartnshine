/**
 * Módulo Instagram — caso de estudo modular.
 * @see ./README.md
 */

const mediaService = require('./services/mediaService');
const engagementService = require('./services/engagementService');
const capabilities = require('./services/capabilities');
const composerService = require('./services/composerService');
const routes = require('./routes/api');

module.exports = {
  fetchInstagramFeed: mediaService.fetchInstagramFeed,
  fetchInstagramPosts: mediaService.fetchInstagramPosts,
  fetchInstagramReels: mediaService.fetchInstagramReels,
  getPreviewMediaBatch: mediaService.getPreviewMediaBatch,
  invalidatePreviewCache: mediaService.invalidatePreviewCache,
  fetchCommentsForMedia: engagementService.fetchCommentsForMedia,
  fetchMediaEngagementSummary: engagementService.fetchMediaEngagementSummary,
  fetchMediaInsights: engagementService.fetchMediaInsights,
  enrichMediaWithEngagement: composerService.enrichMediaWithEngagement,
  getCapabilities: capabilities.getCapabilities,
  routes
};
