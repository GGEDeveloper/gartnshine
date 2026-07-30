/**
 * Media do Instagram sincronizada da conta da loja.
 *
 * O estado de moderação (escondido / destacado / ordem) vive aqui e não na
 * API — sobrevive às sincronizações. A sincronização faz upsert: actualiza o
 * que a API devolve (as `media_url` são assinadas e caducam) mas **nunca**
 * mexe nas colunas de moderação.
 */

const { pool } = require('../config/database');

class InstagramMedia {
  /**
   * Guarda o que veio da API. Devolve quantos entraram de novo e quantos
   * foram actualizados.
   */
  static async upsertMany(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return { inseridos: 0, actualizados: 0 };
    }

    const antes = await this.count();
    const agora = new Date();

    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      await pool.query(
        `INSERT INTO instagram_media
           (ig_id, media_type, media_url, thumbnail_url, permalink, caption,
            posted_at, last_synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           media_type    = VALUES(media_type),
           media_url     = VALUES(media_url),
           thumbnail_url = VALUES(thumbnail_url),
           permalink     = VALUES(permalink),
           caption       = VALUES(caption),
           posted_at     = VALUES(posted_at),
           last_synced_at = VALUES(last_synced_at)`,
        [
          String(item.id),
          item.media_type || 'IMAGE',
          item.media_url || null,
          item.thumbnail_url || null,
          item.permalink || null,
          item.caption || null,
          item.timestamp ? new Date(item.timestamp) : null,
          agora
        ]
      );
    }

    const depois = await this.count();
    return { inseridos: depois - antes, actualizados: items.length - (depois - antes) };
  }

  static async count() {
    const [[r]] = await pool.query('SELECT COUNT(*) AS n FROM instagram_media');
    return Number(r.n);
  }

  /** Contagens para o painel do admin. */
  static async stats() {
    const [[r]] = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(is_hidden = 0) AS visiveis,
              SUM(is_hidden = 1) AS escondidos,
              SUM(is_featured = 1 AND is_hidden = 0) AS destacados
         FROM instagram_media`
    );
    return {
      total: Number(r.total || 0),
      visiveis: Number(r.visiveis || 0),
      escondidos: Number(r.escondidos || 0),
      destacados: Number(r.destacados || 0)
    };
  }

  /**
   * Media para o site. Destacados primeiro, depois os mais recentes.
   * `sort_order` permite arrastar para uma ordem própria dentro de cada grupo.
   */
  static async getPublic(limit = 24) {
    const n = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
    const [rows] = await pool.query(
      `SELECT id, ig_id, media_type, media_url, thumbnail_url, permalink,
              caption, posted_at, is_featured
         FROM instagram_media
        WHERE is_hidden = 0 AND media_url IS NOT NULL
        ORDER BY is_featured DESC, sort_order ASC, posted_at DESC
        LIMIT ?`,
      [n]
    );
    return rows;
  }

  /** Listagem do admin, com filtro opcional por estado. */
  static async getForAdmin({ estado = 'todos' } = {}) {
    let where = '';
    if (estado === 'visiveis') where = 'WHERE is_hidden = 0';
    else if (estado === 'escondidos') where = 'WHERE is_hidden = 1';
    else if (estado === 'destacados') where = 'WHERE is_featured = 1';

    const [rows] = await pool.query(
      `SELECT id, ig_id, media_type, media_url, thumbnail_url, permalink,
              caption, posted_at, is_hidden, is_featured, sort_order, last_synced_at
         FROM instagram_media
         ${where}
        ORDER BY is_featured DESC, posted_at DESC`
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM instagram_media WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
  }

  static async setHidden(id, hidden) {
    const [r] = await pool.query(
      'UPDATE instagram_media SET is_hidden = ? WHERE id = ?',
      [hidden ? 1 : 0, id]
    );
    return r.affectedRows > 0;
  }

  static async setFeatured(id, featured) {
    const [r] = await pool.query(
      'UPDATE instagram_media SET is_featured = ? WHERE id = ?',
      [featured ? 1 : 0, id]
    );
    return r.affectedRows > 0;
  }

  /**
   * Remove um post da base local. Volta a aparecer na sincronização seguinte
   * se ainda existir no Instagram — para o tirar do site em definitivo usa-se
   * `setHidden`, que persiste.
   */
  static async delete(id) {
    const [r] = await pool.query('DELETE FROM instagram_media WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  /** Aplica uma ordem explícita (lista de ids pela ordem desejada). */
  static async reorder(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return false;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < ids.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await conn.query('UPDATE instagram_media SET sort_order = ? WHERE id = ?', [i, ids[i]]);
      }
      await conn.commit();
      return true;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}

module.exports = InstagramMedia;
