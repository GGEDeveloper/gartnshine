/**
 * Activity Logger Middleware - Dark Nature
 * Logs user and admin activities to activity_log table
 */

const { pool } = require('../config/database');

/**
 * Activity logging middleware
 * Adds req.logActivity() method to all requests
 */
const logActivity = async (req, res, next) => {
    // Add logActivity method to request object
    req.logActivity = async (action, entityType = null, entityId = null, description = null, metadata = null) => {
        try {
            const userType = req.session.adminUser ? 'admin' : 'customer';
            const userId = req.session.adminUser?.id || req.session.user?.id || null;
            const userIdentifier = req.session.adminUser?.username || req.session.user?.email || req.ip;
            
            await pool.execute(
                `INSERT INTO activity_log 
                 (user_type, user_id, user_identifier, action, entity_type, entity_id, description, metadata, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userType,
                    userId,
                    userIdentifier,
                    action,
                    entityType,
                    entityId,
                    description,
                    metadata ? JSON.stringify(metadata) : null,
                    req.ip || req.connection.remoteAddress,
                    req.get('User-Agent') || 'Unknown'
                ]
            );
        } catch (error) {
            console.error('Activity log error:', error);
            // Don't throw - logging should never break the main flow
        }
    };
    
    next();
};

/**
 * Auto-log specific actions
 */
const autoLogActivity = (action, entityType = null) => {
    return async (req, res, next) => {
        // Log after response is sent
        res.on('finish', () => {
            if (res.statusCode < 400 && req.logActivity) {
                const entityId = req.params.id || null;
                req.logActivity(action, entityType, entityId, `${action} - ${req.method} ${req.path}`);
            }
        });
        
        next();
    };
};

module.exports = {
    logActivity,
    autoLogActivity
};

