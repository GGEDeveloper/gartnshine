const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');

class CookieConsent extends BaseModel {
  static tableName = 'cookie_consents';
  static primaryKey = 'id';

  static get pool() {
    return pool;
  }

  // Gravar consentimento do usuário
  static async saveConsent(sessionId, consentData) {
    try {
      const {
        necessary = true,
        analytics = false,
        marketing = false,
        preferences = false,
        ip_address,
        user_agent
      } = consentData;

      const [result] = await pool.query(`
        INSERT INTO cookie_consents (
          session_id, necessary, analytics, marketing, preferences, 
          ip_address, user_agent, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          necessary = VALUES(necessary),
          analytics = VALUES(analytics),
          marketing = VALUES(marketing),
          preferences = VALUES(preferences),
          updated_at = NOW()
      `, [sessionId, necessary, analytics, marketing, preferences, ip_address, user_agent]);

      return result;
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      throw error;
    }
  }

  // Obter consentimento por session ID
  static async getBySessionId(sessionId) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM cookie_consents 
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [sessionId]);

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error getting cookie consent:', error);
      throw error;
    }
  }

  // Verificar se o usuário já deu consentimento
  static async hasConsent(sessionId) {
    try {
      const consent = await this.getBySessionId(sessionId);
      return consent !== null;
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      return false;
    }
  }

  // Obter todas as preferências de consentimento
  static async getAllConsents(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM cookie_consents
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return rows;
    } catch (error) {
      console.error('Error getting all consents:', error);
      throw error;
    }
  }

  // Revogar consentimento
  static async revokeConsent(sessionId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM cookie_consents 
        WHERE session_id = ?
      `, [sessionId]);

      return result;
    } catch (error) {
      console.error('Error revoking cookie consent:', error);
      throw error;
    }
  }

  // Estatísticas de consentimento
  static async getConsentStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          COUNT(*) as total_consents,
          SUM(necessary) as necessary_count,
          SUM(analytics) as analytics_count,
          SUM(marketing) as marketing_count,
          SUM(preferences) as preferences_count,
          AVG(necessary) * 100 as necessary_percentage,
          AVG(analytics) * 100 as analytics_percentage,
          AVG(marketing) * 100 as marketing_percentage,
          AVG(preferences) * 100 as preferences_percentage
        FROM cookie_consents
      `);

      return rows[0];
    } catch (error) {
      console.error('Error getting consent stats:', error);
      throw error;
    }
  }
}

module.exports = CookieConsent; 