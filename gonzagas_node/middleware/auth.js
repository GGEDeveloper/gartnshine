/**
 * Authentication Middleware - Dark Nature Admin
 * Protects routes requiring authentication
 */

/**
 * Require authenticated user (customer)
 */
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).redirect('/login');
    }
};

/**
 * Require authenticated admin user
 */
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.adminUser) {
        return next();
    } else {
        // If AJAX request, return JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({
                success: false,
                error: 'Autenticação admin necessária',
                redirectUrl: '/admin/login'
            });
        }
        // Otherwise redirect
        return res.status(401).redirect('/admin/login');
    }
};

/**
 * Check specific permission
 * @param {string} permission - Permission key to check
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (req.session.adminUser && req.session.adminUser.permissions) {
            const permissions = req.session.adminUser.permissions;
            
            // Master has all permissions
            if (permissions.all || permissions[permission]) {
                return next();
            }
        }
        
        return res.status(403).json({
            success: false,
            error: 'Permissão insuficiente'
        });
    };
};

/**
 * Optional auth - doesn't redirect, just populates req.user if available
 */
const optionalAuth = (req, res, next) => {
    // User already populated by session middleware
    next();
};

// Alias for backward compatibility with existing routes
const isAuthenticated = requireAdmin;

module.exports = {
    requireAuth,
    requireAdmin,
    checkPermission,
    optionalAuth,
    isAuthenticated // For backward compatibility with routes/api.js
};
