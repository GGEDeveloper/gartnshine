const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');

class AuditLog extends BaseModel {
  static tableName = 'audit_logs';
  static primaryKey = 'id';

  static get pool() {
    return pool;
  }

  // Criar entrada de log
  static async createLog(data) {
    try {
      const {
        session_id,
        user_agent,
        ip_address,
        action,
        resource,
        resource_id,
        details,
        consent_changes,
        legal_basis,
        retention_period
      } = data;

      const [result] = await pool.query(`
        INSERT INTO audit_logs (
          session_id, user_agent, ip_address, action, resource, resource_id,
          details, consent_changes, legal_basis, retention_period, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        session_id,
        user_agent,
        ip_address,
        action,
        resource,
        resource_id,
        JSON.stringify(details),
        JSON.stringify(consent_changes),
        legal_basis,
        retention_period
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Log de acesso aos dados
  static async logDataAccess(sessionId, userAgent, ipAddress, resource, resourceId, details = {}) {
    return await this.createLog({
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ipAddress,
      action: 'data_access',
      resource: resource,
      resource_id: resourceId,
      details: details,
      legal_basis: 'legitimate_interest',
      retention_period: '2 years'
    });
  }

  // Log de alteração de consentimento
  static async logConsentChange(sessionId, userAgent, ipAddress, consentChanges, details = {}) {
    return await this.createLog({
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ipAddress,
      action: 'consent_change',
      resource: 'cookie_consent',
      resource_id: sessionId,
      details: details,
      consent_changes: consentChanges,
      legal_basis: 'consent',
      retention_period: '3 years'
    });
  }

  // Log de processamento de direitos do usuário
  static async logUserRightRequest(sessionId, userAgent, ipAddress, requestType, email, details = {}) {
    return await this.createLog({
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ipAddress,
      action: 'user_right_request',
      resource: 'user_rights',
      resource_id: email,
      details: {
        request_type: requestType,
        email: email,
        ...details
      },
      legal_basis: 'legal_obligation',
      retention_period: '6 years'
    });
  }

  // Log de eliminação de dados
  static async logDataDeletion(sessionId, userAgent, ipAddress, deletedData, details = {}) {
    return await this.createLog({
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ipAddress,
      action: 'data_deletion',
      resource: 'user_data',
      resource_id: sessionId,
      details: {
        deleted_data: deletedData,
        ...details
      },
      legal_basis: 'legal_obligation',
      retention_period: '6 years'
    });
  }

  // Log de exportação de dados
  static async logDataExport(sessionId, userAgent, ipAddress, exportInfo, details = {}) {
    return await this.createLog({
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ipAddress,
      action: 'data_export',
      resource: 'user_data',
      resource_id: sessionId,
      details: {
        export_info: exportInfo,
        ...details
      },
      legal_basis: 'legal_obligation',
      retention_period: '6 years'
    });
  }

  // Log de acesso administrativo
  static async logAdminAccess(sessionId, userAgent, ipAddress, adminAction, resource, resourceId, details = {}) {
    return await this.createLog({
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ipAddress,
      action: 'admin_access',
      resource: resource,
      resource_id: resourceId,
      details: {
        admin_action: adminAction,
        ...details
      },
      legal_basis: 'legitimate_interest',
      retention_period: '5 years'
    });
  }

  // Obter logs por sessão
  static async getLogsBySession(sessionId, limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM audit_logs 
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [sessionId, limit, offset]);

      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : {},
        consent_changes: row.consent_changes ? JSON.parse(row.consent_changes) : null
      }));
    } catch (error) {
      console.error('Error getting logs by session:', error);
      throw error;
    }
  }

  // Obter logs por ação
  static async getLogsByAction(action, limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM audit_logs 
        WHERE action = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [action, limit, offset]);

      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : {},
        consent_changes: row.consent_changes ? JSON.parse(row.consent_changes) : null
      }));
    } catch (error) {
      console.error('Error getting logs by action:', error);
      throw error;
    }
  }

  // Obter logs por período
  static async getLogsByDateRange(startDate, endDate, limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM audit_logs 
        WHERE created_at >= ? AND created_at <= ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [startDate, endDate, limit, offset]);

      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : {},
        consent_changes: row.consent_changes ? JSON.parse(row.consent_changes) : null
      }));
    } catch (error) {
      console.error('Error getting logs by date range:', error);
      throw error;
    }
  }

  // Obter estatísticas de logs
  static async getLogStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          action,
          COUNT(*) as total_logs,
          COUNT(DISTINCT session_id) as unique_sessions,
          COUNT(DISTINCT ip_address) as unique_ips,
          MIN(created_at) as first_log,
          MAX(created_at) as last_log
        FROM audit_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY action
        ORDER BY total_logs DESC
      `);

      return rows;
    } catch (error) {
      console.error('Error getting log stats:', error);
      throw error;
    }
  }

  // Obter estatísticas de consentimento
  static async getConsentStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_consent_changes,
          COUNT(DISTINCT session_id) as unique_sessions,
          SUM(CASE WHEN JSON_EXTRACT(consent_changes, '$.necessary') = true THEN 1 ELSE 0 END) as necessary_consents,
          SUM(CASE WHEN JSON_EXTRACT(consent_changes, '$.analytics') = true THEN 1 ELSE 0 END) as analytics_consents,
          SUM(CASE WHEN JSON_EXTRACT(consent_changes, '$.marketing') = true THEN 1 ELSE 0 END) as marketing_consents,
          SUM(CASE WHEN JSON_EXTRACT(consent_changes, '$.preferences') = true THEN 1 ELSE 0 END) as preferences_consents
        FROM audit_logs
        WHERE action = 'consent_change' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      return rows;
    } catch (error) {
      console.error('Error getting consent stats:', error);
      throw error;
    }
  }

  // Obter logs de direitos do usuário
  static async getUserRightLogs(limit = 50, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM audit_logs 
        WHERE action = 'user_right_request'
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : {}
      }));
    } catch (error) {
      console.error('Error getting user right logs:', error);
      throw error;
    }
  }

  // Buscar logs por IP
  static async getLogsByIP(ipAddress, limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM audit_logs 
        WHERE ip_address = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [ipAddress, limit, offset]);

      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : {},
        consent_changes: row.consent_changes ? JSON.parse(row.consent_changes) : null
      }));
    } catch (error) {
      console.error('Error getting logs by IP:', error);
      throw error;
    }
  }

  // Limpar logs antigos baseado no período de retenção
  static async cleanOldLogs() {
    try {
      const retentionPeriods = {
        '1 year': 365,
        '2 years': 730,
        '3 years': 1095,
        '5 years': 1825,
        '6 years': 2190
      };

      let deletedCount = 0;

      for (const [period, days] of Object.entries(retentionPeriods)) {
        const [result] = await pool.query(`
          DELETE FROM audit_logs 
          WHERE retention_period = ? AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [period, days]);

        deletedCount += result.affectedRows;
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning old logs:', error);
      throw error;
    }
  }

  // Obter logs detalhados para auditoria
  static async getDetailedLogs(filters = {}, limit = 100, offset = 0) {
    try {
      let query = `
        SELECT 
          id,
          session_id,
          user_agent,
          ip_address,
          action,
          resource,
          resource_id,
          details,
          consent_changes,
          legal_basis,
          retention_period,
          created_at,
          CASE 
            WHEN action = 'consent_change' THEN 'Alteração de Consentimento'
            WHEN action = 'data_access' THEN 'Acesso aos Dados'
            WHEN action = 'user_right_request' THEN 'Solicitação de Direitos'
            WHEN action = 'data_deletion' THEN 'Eliminação de Dados'
            WHEN action = 'data_export' THEN 'Exportação de Dados'
            WHEN action = 'admin_access' THEN 'Acesso Administrativo'
            ELSE action
          END as action_description
        FROM audit_logs
        WHERE 1=1
      `;

      const queryParams = [];

      if (filters.action) {
        query += ` AND action = ?`;
        queryParams.push(filters.action);
      }

      if (filters.sessionId) {
        query += ` AND session_id = ?`;
        queryParams.push(filters.sessionId);
      }

      if (filters.ipAddress) {
        query += ` AND ip_address = ?`;
        queryParams.push(filters.ipAddress);
      }

      if (filters.dateFrom) {
        query += ` AND created_at >= ?`;
        queryParams.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        query += ` AND created_at <= ?`;
        queryParams.push(filters.dateTo);
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      const [rows] = await pool.query(query, queryParams);

      return rows.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : {},
        consent_changes: row.consent_changes ? JSON.parse(row.consent_changes) : null
      }));
    } catch (error) {
      console.error('Error getting detailed logs:', error);
      throw error;
    }
  }

  // Middleware para log automático
  static middleware() {
    return (req, res, next) => {
      const originalSend = res.send;
      const startTime = Date.now();

      res.send = function(data) {
        const duration = Date.now() - startTime;
        const sessionId = req.session?.id || req.sessionID;
        const userAgent = req.get('User-Agent') || '';
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Log apenas para rotas específicas
        if (req.path.includes('/api/') || req.path.includes('/admin/')) {
          AuditLog.logDataAccess(sessionId, userAgent, ipAddress, req.path, null, {
            method: req.method,
            status_code: res.statusCode,
            duration: duration,
            query_params: req.query,
            body_size: data ? data.length : 0
          }).catch(error => {
            console.error('Error logging data access:', error);
          });
        }

        originalSend.call(this, data);
      };

      next();
    };
  }
}

module.exports = AuditLog; 