const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class UserRights extends BaseModel {
  static tableName = 'user_rights_requests';
  static primaryKey = 'id';

  static get pool() {
    return pool;
  }

  // Solicitar acesso aos dados pessoais
  static async requestDataAccess(sessionId, email, requestType, details = null) {
    try {
      const requestToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      const [result] = await pool.query(`
        INSERT INTO user_rights_requests (
          session_id, email, request_type, details, request_token, 
          status, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
      `, [sessionId, email, requestType, details, requestToken, expiresAt]);

      return {
        id: result.insertId,
        requestToken,
        expiresAt
      };
    } catch (error) {
      console.error('Error creating user rights request:', error);
      throw error;
    }
  }

  // Obter solicitação por token
  static async getRequestByToken(token) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM user_rights_requests 
        WHERE request_token = ? AND expires_at > NOW()
      `, [token]);

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error getting request by token:', error);
      throw error;
    }
  }

  // Processar solicitação de acesso aos dados
  static async processDataAccess(requestId, sessionId) {
    try {
      // Obter dados do usuário baseado na sessão
      const userData = await this.getUserDataBySession(sessionId);
      
      // Criar arquivo de dados
      const dataFile = await this.createDataExportFile(userData);
      
      // Atualizar status da solicitação
      await pool.query(`
        UPDATE user_rights_requests 
        SET status = 'completed', response_data = ?, processed_at = NOW()
        WHERE id = ?
      `, [dataFile, requestId]);

      return {
        success: true,
        dataFile,
        userData
      };
    } catch (error) {
      console.error('Error processing data access:', error);
      throw error;
    }
  }

  // Obter dados do usuário por sessão
  static async getUserDataBySession(sessionId) {
    try {
      const userData = {
        session_info: {
          session_id: sessionId,
          created_at: new Date().toISOString()
        },
        consent_data: [],
        interaction_logs: []
      };

      // Obter dados de consentimento
      const [consentRows] = await pool.query(`
        SELECT * FROM cookie_consents 
        WHERE session_id = ?
        ORDER BY created_at DESC
      `, [sessionId]);

      userData.consent_data = consentRows;

      // Obter logs de interação (se existirem)
      try {
        const [logRows] = await pool.query(`
          SELECT * FROM user_activity_logs 
          WHERE session_id = ?
          ORDER BY created_at DESC
          LIMIT 100
        `, [sessionId]);
        
        userData.interaction_logs = logRows;
      } catch (logError) {
        // Tabela pode não existir
        userData.interaction_logs = [];
      }

      return userData;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Criar arquivo de exportação de dados
  static async createDataExportFile(userData) {
    try {
      const exportDir = path.join(__dirname, '../exports');
      
      // Criar diretório se não existir
      try {
        await fs.mkdir(exportDir, { recursive: true });
      } catch (e) {
        // Directory already exists
      }

      const filename = `user_data_${Date.now()}.json`;
      const filepath = path.join(exportDir, filename);

      // Criar arquivo JSON com dados
      const exportData = {
        export_info: {
          exported_at: new Date().toISOString(),
          data_controller: "Gonzaga's Art & Shine",
          contact_email: "geral@artnshine.pt",
          website: "https://artnshine.pt"
        },
        user_data: userData,
        privacy_notice: {
          message: "Este arquivo contém todos os dados pessoais que temos sobre você.",
          retention_period: "Os dados são retidos conforme nossa Política de Privacidade.",
          your_rights: [
            "Direito de acesso aos seus dados pessoais",
            "Direito de retificação de dados incorretos",
            "Direito de apagamento dos seus dados",
            "Direito de limitação do tratamento",
            "Direito de portabilidade dos dados",
            "Direito de oposição ao tratamento"
          ]
        }
      };

      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));

      return {
        filename,
        filepath,
        size: (await fs.stat(filepath)).size
      };
    } catch (error) {
      console.error('Error creating data export file:', error);
      throw error;
    }
  }

  // Processar solicitação de eliminação de dados
  static async processDataDeletion(requestId, sessionId) {
    try {
      // Eliminar dados de consentimento
      await pool.query(`
        DELETE FROM cookie_consents 
        WHERE session_id = ?
      `, [sessionId]);

      // Eliminar logs de atividade (se existirem)
      try {
        await pool.query(`
          DELETE FROM user_activity_logs 
          WHERE session_id = ?
        `, [sessionId]);
      } catch (e) {
        // Tabela pode não existir
      }

      // Atualizar status da solicitação
      await pool.query(`
        UPDATE user_rights_requests 
        SET status = 'completed', processed_at = NOW()
        WHERE id = ?
      `, [requestId]);

      return {
        success: true,
        message: 'Dados eliminados com sucesso'
      };
    } catch (error) {
      console.error('Error processing data deletion:', error);
      throw error;
    }
  }

  // Processar solicitação de retificação
  static async processDataRectification(requestId, sessionId, corrections) {
    try {
      // Log das correções
      const correctionLog = {
        session_id: sessionId,
        corrections: corrections,
        timestamp: new Date().toISOString()
      };

      // Atualizar status da solicitação
      await pool.query(`
        UPDATE user_rights_requests 
        SET status = 'completed', response_data = ?, processed_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(correctionLog), requestId]);

      return {
        success: true,
        message: 'Dados retificados com sucesso'
      };
    } catch (error) {
      console.error('Error processing data rectification:', error);
      throw error;
    }
  }

  // Listar todas as solicitações
  static async getAllRequests(limit = 50, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM user_rights_requests
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return rows;
    } catch (error) {
      console.error('Error getting all requests:', error);
      throw error;
    }
  }

  // Atualizar status da solicitação
  static async updateRequestStatus(requestId, status, responseData = null) {
    try {
      const [result] = await pool.query(`
        UPDATE user_rights_requests 
        SET status = ?, response_data = ?, processed_at = NOW()
        WHERE id = ?
      `, [status, responseData, requestId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  // Estatísticas das solicitações
  static async getRequestStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          request_type,
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
          AVG(CASE WHEN processed_at IS NOT NULL THEN 
            TIMESTAMPDIFF(HOUR, created_at, processed_at) 
          END) as avg_processing_hours
        FROM user_rights_requests
        GROUP BY request_type
      `);

      return rows;
    } catch (error) {
      console.error('Error getting request stats:', error);
      throw error;
    }
  }
}

module.exports = UserRights; 