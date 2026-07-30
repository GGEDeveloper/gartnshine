/**
 * Sincronização com o Instagram e renovação do token.
 *
 * Faz a ponte entre o módulo `modules/instagram` (que só fala com a API e não
 * conhece a base de dados) e os modelos que guardam o resultado.
 *
 * Regra que vale para tudo aqui: **nada disto pode deitar abaixo uma página**.
 * Se a API falhar, regista-se o erro na conta e devolve-se o que já está
 * guardado. Foi assim que a faixa de media da página inicial desapareceu em
 * silêncio quando o token expirou a 10/07/2026 — o erro nunca chegou a
 * lado nenhum onde fosse visto.
 */

const instagramLoginClient = require('../modules/instagram/clients/instagramLoginClient');
const InstagramAccount = require('../models/InstagramAccount');
const InstagramMedia = require('../models/InstagramMedia');

/** Quantos posts trazer de cada vez. A API aceita até 100. */
const LIMITE_SYNC = 50;

/**
 * Valida um token contra a API e guarda-o com o perfil da conta.
 * Usado quando alguém cola um token novo no admin.
 */
async function ligarComToken(token) {
  const limpo = String(token || '').trim();
  if (!limpo) {
    throw new Error('Token vazio.');
  }

  // Confirma que presta antes de gravar — não vale a pena guardar lixo.
  const perfil = await instagramLoginClient.fetchMyProfile(limpo);

  // Tenta apurar a validade renovando-o já. Um token acabado de emitir tem
  // menos de 24h e a API recusa renovar; nesse caso assume-se 60 dias, que é
  // o que o Instagram dá aos tokens de longa duração.
  let expiresIn = 60 * 24 * 60 * 60;
  try {
    const r = await instagramLoginClient.refreshLongLivedToken(limpo);
    if (r.accessToken) {
      await InstagramAccount.saveToken(r.accessToken, r.expiresIn);
      await InstagramAccount.saveProfile(perfil);
      return { perfil, renovado: true };
    }
  } catch (_) {
    // Renovação indisponível agora (token demasiado recente, ou de curta
    // duração). Guarda-se na mesma; o agendador tenta mais tarde.
  }

  await InstagramAccount.saveToken(limpo, expiresIn);
  await InstagramAccount.saveProfile(perfil);
  return { perfil, renovado: false };
}

/**
 * Renova o token se estiver perto de expirar. Idempotente e silencioso:
 * pode ser chamado a cada arranque e a cada sincronização.
 */
async function renovarSeNecessario({ forcar = false } = {}) {
  const status = await InstagramAccount.status();
  if (!status.temToken) return { renovado: false, motivo: 'sem token' };
  if (status.estado === 'expirado') {
    return { renovado: false, motivo: 'expirado — só um token novo resolve' };
  }
  if (!forcar && status.estado === 'ligado') {
    return { renovado: false, motivo: 'ainda válido' };
  }

  const token = await InstagramAccount.getToken();
  try {
    const r = await instagramLoginClient.refreshLongLivedToken(token);
    if (!r.accessToken) return { renovado: false, motivo: 'resposta sem token' };
    await InstagramAccount.saveToken(r.accessToken, r.expiresIn);
    return { renovado: true, expiresIn: r.expiresIn };
  } catch (err) {
    await InstagramAccount.recordError(`Renovação falhou: ${err.message}`);
    return { renovado: false, motivo: err.message };
  }
}

/**
 * Vai buscar os posts e guarda-os. Não apaga nada: o que já cá está mantém o
 * estado de moderação, e um post apagado no Instagram continua guardado até
 * alguém o remover à mão.
 */
async function sincronizar({ limite = LIMITE_SYNC } = {}) {
  const token = await InstagramAccount.getToken();
  if (!token) {
    const msg = 'Sem token do Instagram. Ligue a conta no admin.';
    await InstagramAccount.recordError(msg);
    throw new Error(msg);
  }

  // Aproveita para renovar quando está perto do fim.
  await renovarSeNecessario();
  const tokenActual = await InstagramAccount.getToken();

  let itens;
  try {
    itens = await instagramLoginClient.fetchMyMedia({ limit: limite, token: tokenActual });
  } catch (err) {
    await InstagramAccount.recordError(err.message);
    throw err;
  }

  const r = await InstagramMedia.upsertMany(itens);
  await InstagramAccount.recordSync(itens.length);

  try {
    const perfil = await instagramLoginClient.fetchMyProfile(tokenActual);
    await InstagramAccount.saveProfile(perfil);
  } catch (_) {
    // O perfil é acessório; não faz falhar a sincronização.
  }

  return { total: itens.length, ...r };
}

/**
 * Media para as páginas públicas. Nunca lança: se algo correr mal devolve
 * lista vazia e a secção simplesmente não aparece.
 */
async function getMediaPublica(limite = 24) {
  try {
    return await InstagramMedia.getPublic(limite);
  } catch (err) {
    console.error('Instagram: falha a ler media pública:', err.message);
    return [];
  }
}

module.exports = {
  ligarComToken,
  renovarSeNecessario,
  sincronizar,
  getMediaPublica,
  LIMITE_SYNC
};
