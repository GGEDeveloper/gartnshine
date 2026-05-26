/**
 * GET JSON para APIs Meta — nunca regista access_token.
 */

/**
 * @param {string} url - URL completa (já com query string)
 * @returns {Promise<{ ok: boolean, status: number, body: object }>}
 */
async function graphGet(url) {
  let response;
  try {
    response = await fetch(url, { method: 'GET' });
  } catch (cause) {
    const err = new Error(cause.message || 'Network request failed');
    err.code = 'GRAPH_NETWORK';
    err.cause = cause;
    throw err;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  return { ok: response.ok, status: response.status, body };
}

module.exports = { graphGet };
