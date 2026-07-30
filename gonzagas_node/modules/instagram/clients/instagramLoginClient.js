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
  // O token pode vir de fora (é o caso quando está guardado na base de dados
  // e gerido pelo admin); o process.env fica como recurso, para o módulo
  // continuar utilizável sozinho.
  const token = (opts && opts.token) || process.env.INSTAGRAM_ACCESS_TOKEN;
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

/**
 * Renova um token de longa duração. Os tokens do Instagram duram 60 dias e
 * só podem ser renovados depois de terem pelo menos 24 horas. Devolve o novo
 * token e quantos segundos lhe restam.
 *
 * Sem isto o token morre em silêncio — foi o que aconteceu a 10/07/2026.
 */
async function refreshLongLivedToken(token) {
  if (!token || !String(token).trim()) {
    const err = new Error('Instagram access token not configured');
    err.code = 'INSTAGRAM_NO_TOKEN';
    throw err;
  }

  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: String(token).trim()
  });
  const url = `${config.INSTAGRAM_LOGIN_HOST}/refresh_access_token?${params.toString()}`;

  const { ok, status, body } = await graphGet(url);
  if (!ok || body.error) {
    throw apiError(
      (body.error && body.error.message) || `HTTP ${status}`,
      'INSTAGRAM_REFRESH',
      status,
      body
    );
  }

  return {
    accessToken: body.access_token,
    expiresIn: Number(body.expires_in) || 0
  };
}

/** Perfil da conta ligada — serve para confirmar que o token é válido. */
async function fetchMyProfile(token) {
  const t = token || process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!t || !String(t).trim()) {
    const err = new Error('Instagram access token not configured');
    err.code = 'INSTAGRAM_NO_TOKEN';
    throw err;
  }
  const params = new URLSearchParams({
    fields: 'id,username,account_type,media_count',
    access_token: String(t).trim()
  });
  const url = `${config.INSTAGRAM_LOGIN_HOST}/${config.GRAPH_VERSION}/me?${params.toString()}`;
  const { ok, status, body } = await graphGet(url);
  if (!ok || body.error) {
    throw apiError(
      (body.error && body.error.message) || `HTTP ${status}`,
      'INSTAGRAM_API',
      status,
      body
    );
  }
  return body;
}

module.exports = {
  refreshLongLivedToken,
  fetchMyProfile,
  fetchMyMedia
};
