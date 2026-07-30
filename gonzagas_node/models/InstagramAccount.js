/**
 * Ligação ao Instagram: token, validade e estado da última sincronização.
 *
 * Uma linha só (id = 1). O token vive aqui e não no .env porque o utilizador
 * tem de o poder trocar pelo admin sem acesso ao servidor — e porque a
 * renovação automática precisa de o reescrever.
 *
 * O `.env` continua a ser lido como arranque: se a base de dados ainda não
 * tem token mas o `.env` tem, usa-se esse até alguém gravar um pelo admin.
 */

const { pool } = require('../config/database');

const DIAS = 24 * 60 * 60 * 1000;
/** Renova quando faltarem menos de 10 dias — os tokens duram 60. */
const MARGEM_RENOVACAO_MS = 10 * DIAS;

class InstagramAccount {
  static async get() {
    const [rows] = await pool.query('SELECT * FROM instagram_account WHERE id = 1');
    if (rows.length === 0) {
      await pool.query('INSERT IGNORE INTO instagram_account (id) VALUES (1)');
      return { id: 1, access_token: null };
    }
    return rows[0];
  }

  /** Token a usar: o da base de dados; sem ele, o do .env. */
  static async getToken() {
    const conta = await this.get();
    const guardado = conta.access_token && String(conta.access_token).trim();
    if (guardado) return guardado;
    const env = process.env.INSTAGRAM_ACCESS_TOKEN;
    return env && String(env).trim() ? String(env).trim() : null;
  }

  static async saveToken(token, expiresInSeconds = null) {
    const expiraEm = expiresInSeconds
      ? new Date(Date.now() + Number(expiresInSeconds) * 1000)
      : null;
    await pool.query(
      `UPDATE instagram_account
          SET access_token = ?, token_expires_at = ?, token_refreshed_at = NOW(),
              last_error = NULL, last_error_at = NULL
        WHERE id = 1`,
      [token, expiraEm]
    );
    return this.get();
  }

  static async saveProfile({ id, username }) {
    await pool.query(
      'UPDATE instagram_account SET ig_user_id = ?, username = ? WHERE id = 1',
      [id || null, username || null]
    );
  }

  static async recordSync(count) {
    await pool.query(
      `UPDATE instagram_account
          SET last_sync_at = NOW(), last_sync_count = ?,
              last_error = NULL, last_error_at = NULL
        WHERE id = 1`,
      [count]
    );
  }

  static async recordError(message) {
    await pool.query(
      'UPDATE instagram_account SET last_error = ?, last_error_at = NOW() WHERE id = 1',
      [String(message || '').slice(0, 1000)]
    );
  }

  static async clear() {
    await pool.query(
      `UPDATE instagram_account
          SET access_token = NULL, token_expires_at = NULL, token_refreshed_at = NULL,
              ig_user_id = NULL, username = NULL, last_error = NULL, last_error_at = NULL
        WHERE id = 1`
    );
  }

  /**
   * Estado da ligação, já interpretado, para o admin não ter de o deduzir.
   */
  static async status() {
    const conta = await this.get();
    const token = await this.getToken();
    const expira = conta.token_expires_at ? new Date(conta.token_expires_at) : null;
    const agora = Date.now();

    let estado = 'desligado';
    let diasRestantes = null;

    if (token) {
      if (!expira) {
        // Token vindo do .env ou gravado sem validade conhecida: só se sabe
        // se presta depois de o usar.
        estado = 'ligado_sem_validade';
      } else {
        diasRestantes = Math.floor((expira.getTime() - agora) / DIAS);
        if (diasRestantes < 0) estado = 'expirado';
        else if (expira.getTime() - agora < MARGEM_RENOVACAO_MS) estado = 'a_expirar';
        else estado = 'ligado';
      }
    }

    return {
      estado,
      diasRestantes,
      temToken: !!token,
      tokenDaBaseDeDados: !!(conta.access_token && String(conta.access_token).trim()),
      expiraEm: expira,
      renovadoEm: conta.token_refreshed_at,
      username: conta.username,
      igUserId: conta.ig_user_id,
      ultimaSync: conta.last_sync_at,
      ultimaSyncTotal: conta.last_sync_count,
      ultimoErro: conta.last_error,
      ultimoErroEm: conta.last_error_at
    };
  }

  /** Precisa de renovação? (nunca renovar um token já expirado — não dá) */
  static async precisaRenovar() {
    const s = await this.status();
    return s.estado === 'a_expirar';
  }
}

module.exports = InstagramAccount;
module.exports.MARGEM_RENOVACAO_MS = MARGEM_RENOVACAO_MS;
