const UserRights = require('../models/UserRights');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

class UserRightsController {
  
  // Página principal de direitos do usuário
  static async userRightsPage(req, res) {
    try {
      res.render('user-rights', {
        title: 'Seus Direitos - Gonzaga\'s Art & Shine',
        currentPage: 'user-rights',
        sessionId: req.session.id || req.sessionID
      });
    } catch (error) {
      console.error('Error rendering user rights page:', error);
      res.status(500).render('error', { 
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar a página de direitos do usuário.',
        layout: false
      });
    }
  }

  // Solicitar acesso aos dados pessoais
  static async requestDataAccess(req, res) {
    try {
      const { email, requestType, details } = req.body;
      const sessionId = req.session.id || req.sessionID;

      // Validar email
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido'
        });
      }

      // Validar tipo de solicitação
      const validTypes = ['access', 'deletion', 'rectification', 'portability', 'objection'];
      if (!validTypes.includes(requestType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de solicitação inválido'
        });
      }

      // Criar solicitação
      const request = await UserRights.requestDataAccess(sessionId, email, requestType, details);

      // Enviar email de confirmação
      await this.sendConfirmationEmail(email, request.requestToken, requestType);

      res.json({
        success: true,
        message: 'Solicitação enviada com sucesso. Verifique seu email para confirmar.',
        requestId: request.id
      });

    } catch (error) {
      console.error('Error requesting data access:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Confirmar solicitação via token
  static async confirmRequest(req, res) {
    try {
      const { token } = req.params;

      // Buscar solicitação
      const request = await UserRights.getRequestByToken(token);
      if (!request) {
        return res.status(404).render('error', {
          error: 'Solicitação não encontrada',
          message: 'A solicitação não foi encontrada ou já expirou.',
          layout: false
        });
      }

      // Processar solicitação baseada no tipo
      let result;
      switch (request.request_type) {
        case 'access':
          result = await UserRights.processDataAccess(request.id, request.session_id);
          break;
        case 'deletion':
          result = await UserRights.processDataDeletion(request.id, request.session_id);
          break;
        case 'rectification':
          result = await UserRights.processDataRectification(request.id, request.session_id, request.details);
          break;
        default:
          await UserRights.updateRequestStatus(request.id, 'completed');
          result = { success: true, message: 'Solicitação processada com sucesso' };
      }

      // Enviar email de conclusão
      await this.sendCompletionEmail(request.email, request.request_type, result);

      res.render('request-confirmed', {
        title: 'Solicitação Confirmada - Gonzaga\'s Art & Shine',
        request,
        result
      });

    } catch (error) {
      console.error('Error confirming request:', error);
      res.status(500).render('error', {
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar a solicitação.',
        layout: false
      });
    }
  }

  // Download de dados pessoais
  static async downloadUserData(req, res) {
    try {
      const { token } = req.params;

      // Buscar solicitação
      const request = await UserRights.getRequestByToken(token);
      if (!request || request.request_type !== 'access') {
        return res.status(404).json({
          success: false,
          error: 'Solicitação de acesso não encontrada'
        });
      }

      // Verificar se já foi processada
      if (request.status !== 'completed' || !request.response_data) {
        return res.status(400).json({
          success: false,
          error: 'Solicitação ainda não foi processada'
        });
      }

      const dataFile = JSON.parse(request.response_data);
      
      // Verificar se arquivo existe
      try {
        await fs.access(dataFile.filepath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Arquivo de dados não encontrado'
        });
      }

      // Enviar arquivo
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${dataFile.filename}"`);
      
      const fileContent = await fs.readFile(dataFile.filepath);
      res.send(fileContent);

    } catch (error) {
      console.error('Error downloading user data:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // API para verificar status da solicitação
  static async getRequestStatus(req, res) {
    try {
      const { token } = req.params;

      const request = await UserRights.getRequestByToken(token);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Solicitação não encontrada'
        });
      }

      res.json({
        success: true,
        status: request.status,
        requestType: request.request_type,
        createdAt: request.created_at,
        processedAt: request.processed_at
      });

    } catch (error) {
      console.error('Error getting request status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Painel administrativo - listar solicitações
  static async adminListRequests(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const requests = await UserRights.getAllRequests(limit, offset);
      const stats = await UserRights.getRequestStats();

      res.render('admin/user-rights-requests', {
        title: 'Solicitações de Direitos do Usuário - Admin',
        requests,
        stats,
        currentPage: page,
        totalPages: Math.ceil(requests.length / limit)
      });

    } catch (error) {
      console.error('Error listing user rights requests:', error);
      res.status(500).render('error', {
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar as solicitações.',
        layout: false
      });
    }
  }

  // Painel administrativo - atualizar status
  static async adminUpdateStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { status, responseData } = req.body;

      const success = await UserRights.updateRequestStatus(requestId, status, responseData);

      res.json({
        success,
        message: success ? 'Status atualizado com sucesso' : 'Erro ao atualizar status'
      });

    } catch (error) {
      console.error('Error updating request status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Enviar email de confirmação
  static async sendConfirmationEmail(email, token, requestType) {
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const typeNames = {
        access: 'Acesso aos Dados',
        deletion: 'Eliminação de Dados',
        rectification: 'Retificação de Dados',
        portability: 'Portabilidade de Dados',
        objection: 'Oposição ao Tratamento'
      };

      const confirmUrl = `${process.env.SITE_URL || 'https://artnshine.pt'}/user-rights/confirm/${token}`;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@artnshine.pt',
        to: email,
        subject: `Confirmação de Solicitação - ${typeNames[requestType]}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c0a080;">Gonzaga's Art & Shine</h2>
            <p>Olá,</p>
            <p>Recebemos sua solicitação de <strong>${typeNames[requestType]}</strong>.</p>
            <p>Para confirmar e processar sua solicitação, clique no link abaixo:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="background: #c0a080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirmar Solicitação
              </a>
            </p>
            <p><strong>Nota:</strong> Este link é válido por 7 dias.</p>
            <p>Se você não fez esta solicitação, pode ignorar este email.</p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Gonzaga's Art & Shine - Cumprimento do RGPD<br>
              Email: geral@artnshine.pt<br>
              Website: https://artnshine.pt
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Não falhar a solicitação por erro de email
    }
  }

  // Enviar email de conclusão
  static async sendCompletionEmail(email, requestType, result) {
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const typeNames = {
        access: 'Acesso aos Dados',
        deletion: 'Eliminação de Dados',
        rectification: 'Retificação de Dados',
        portability: 'Portabilidade de Dados',
        objection: 'Oposição ao Tratamento'
      };

      let content = `<p>Sua solicitação de <strong>${typeNames[requestType]}</strong> foi processada com sucesso.</p>`;
      
      if (requestType === 'access' && result.dataFile) {
        const downloadUrl = `${process.env.SITE_URL || 'https://artnshine.pt'}/user-rights/download/${result.dataFile.filename}`;
        content += `
          <p>Seus dados pessoais estão disponíveis para download:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background: #c0a080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Baixar Meus Dados
            </a>
          </p>
        `;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@artnshine.pt',
        to: email,
        subject: `Solicitação Processada - ${typeNames[requestType]}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c0a080;">Gonzaga's Art & Shine</h2>
            <p>Olá,</p>
            ${content}
            <p>Obrigado por utilizar nossos serviços.</p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Gonzaga's Art & Shine - Cumprimento do RGPD<br>
              Email: geral@artnshine.pt<br>
              Website: https://artnshine.pt
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending completion email:', error);
      // Não falhar o processamento por erro de email
    }
  }
}

module.exports = UserRightsController; 