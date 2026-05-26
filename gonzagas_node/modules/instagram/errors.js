/**
 * Erros normalizados do módulo Instagram (mensagens sem tokens).
 */

function attachGraphMeta(err, body, status) {
  if (body && body.error) {
    if (body.error.fbtrace_id) err.fbtrace_id = body.error.fbtrace_id;
    if (body.error.code != null) err.graphCode = body.error.code;
  }
  if (status) err.status = status;
  return err;
}

function apiError(message, code, status, body) {
  const err = new Error(message);
  err.code = code;
  return attachGraphMeta(err, body, status);
}

module.exports = {
  apiError,
  attachGraphMeta
};
