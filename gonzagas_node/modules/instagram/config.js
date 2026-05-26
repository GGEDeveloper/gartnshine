/**
 * Configuração central do módulo Instagram (sem segredos).
 * Tokens vêm sempre de process.env — ver README.md do módulo.
 */

const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v22.0';

module.exports = {
  GRAPH_VERSION,
  INSTAGRAM_LOGIN_HOST: 'https://graph.instagram.com',
  FACEBOOK_GRAPH_HOST: 'https://graph.facebook.com',
  /** Campos default para me/media (Instagram Login) */
  INSTAGRAM_LOGIN_MEDIA_FIELDS:
    'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
  /** Campos opcionais em IG Media via Graph API (Facebook) — podem falhar consoante app/review */
  FACEBOOK_IG_MEDIA_OPTIONAL_FIELDS:
    process.env.INSTAGRAM_FB_MEDIA_FIELDS ||
    'like_count,comments_count,is_comment_enabled,media_type,permalink',
  /** Campos para comentários top-level + uma página de replies */
  FACEBOOK_IG_COMMENT_FIELDS:
    'id,text,timestamp,username,like_count,replies{id,text,timestamp,username,like_count}'
};
