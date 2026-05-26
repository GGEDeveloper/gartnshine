/**
 * Capacidades em tempo de execução (caso de estudo — o que está ligado no .env).
 */

const fbClient = require('../clients/facebookGraphClient');

function getCapabilities() {
  const igLogin = !!(
    process.env.INSTAGRAM_ACCESS_TOKEN &&
    String(process.env.INSTAGRAM_ACCESS_TOKEN).trim()
  );
  const pageToken = fbClient.hasPageToken();
  const igUserId = !!(
    process.env.INSTAGRAM_USER_ID && String(process.env.INSTAGRAM_USER_ID).trim()
  );

  return {
    version: 1,
    instagramLogin: {
      enabled: igLogin,
      host: 'graph.instagram.com',
      capabilities: ['list_own_media', 'caption', 'permalink', 'media_urls']
    },
    facebookGraph: {
      enabled: pageToken,
      host: 'graph.facebook.com',
      needsInstagramBusiness: true,
      capabilities: pageToken
        ? [
            'read_ig_media_comments',
            'read_ig_media_counts',
            'read_ig_media_insights',
            'moderation_requires_extra_scopes'
          ]
        : [],
      configured: {
        pageAccessToken: pageToken,
        instagramUserId: igUserId
      }
    },
    limits: {
      commentsPerRequestMax: 50,
      instagramLoginMediaPerRequestMax: 100,
      tokensNeverLogged: true
    }
  };
}

module.exports = {
  getCapabilities
};
