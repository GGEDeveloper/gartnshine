const express = require('express');
const router = express.Router();
const UserRightsController = require('../controllers/UserRightsController');
const AuditLog = require('../models/AuditLog');

// Middleware para log de auditoria
const auditMiddleware = async (req, res, next) => {
  const sessionId = req.session?.id || req.sessionID;
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    // Log da solicitação de direitos do usuário
    await AuditLog.logUserRightRequest(
      sessionId,
      userAgent,
      ipAddress,
      req.body.requestType || 'page_access',
      req.body.email || 'anonymous',
      {
        path: req.path,
        method: req.method,
        user_agent: userAgent,
        ip_address: ipAddress
      }
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
  
  next();
};

// Página principal de direitos do usuário
router.get('/user-rights', UserRightsController.userRightsPage);

// Solicitar acesso aos dados pessoais
router.post('/user-rights/request', auditMiddleware, UserRightsController.requestDataAccess);

// Confirmar solicitação via token
router.get('/user-rights/confirm/:token', UserRightsController.confirmRequest);

// Download de dados pessoais
router.get('/user-rights/download/:token', UserRightsController.downloadUserData);

// API para verificar status da solicitação
router.get('/user-rights/status/:token', UserRightsController.getRequestStatus);

// Rotas administrativas (protegidas por autenticação)
router.get('/admin/user-rights', async (req, res, next) => {
  // Verificar se o usuário está logado
  if (!req.session.user) {
    return res.redirect('/admin/login');
  }
  
  // Log de acesso administrativo
  const sessionId = req.session?.id || req.sessionID;
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    await AuditLog.logAdminAccess(
      sessionId,
      userAgent,
      ipAddress,
      'view_user_rights',
      'admin_panel',
      'user_rights_list',
      {
        admin_user: req.session.user.username,
        path: req.path
      }
    );
  } catch (error) {
    console.error('Error logging admin access:', error);
  }
  
  next();
}, UserRightsController.adminListRequests);

// Atualizar status de solicitação (admin)
router.post('/admin/user-rights/:requestId/status', async (req, res, next) => {
  // Verificar se o usuário está logado
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  // Log de acesso administrativo
  const sessionId = req.session?.id || req.sessionID;
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    await AuditLog.logAdminAccess(
      sessionId,
      userAgent,
      ipAddress,
      'update_user_rights_status',
      'user_rights_request',
      req.params.requestId,
      {
        admin_user: req.session.user.username,
        old_status: req.body.oldStatus,
        new_status: req.body.status,
        response_data: req.body.responseData
      }
    );
  } catch (error) {
    console.error('Error logging admin access:', error);
  }
  
  next();
}, UserRightsController.adminUpdateStatus);

module.exports = router; 