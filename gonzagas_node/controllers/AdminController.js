/**
 * Admin Controller - Dark Nature Admin Panel
 * Handles admin authentication, dashboard, and management functions
 */

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class AdminController {
    
    /**
     * Admin login
     */
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username e password são obrigatórios'
                });
            }
            
            // Find admin user
            const [adminRows] = await pool.execute(
                'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
                [username]
            );
            
            if (adminRows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciais inválidas'
                });
            }
            
            const admin = adminRows[0];
            
            // Verify password
            const passwordMatch = await bcrypt.compare(password, admin.password_hash);
            
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciais inválidas'
                });
            }
            
            // Update login stats
            await pool.execute(
                'UPDATE admin_users SET last_login = NOW(), login_count = login_count + 1 WHERE id = ?',
                [admin.id]
            );
            
            // Set session
            req.session.adminUser = {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                fullName: admin.full_name,
                role: admin.role,
                permissions: typeof admin.permissions === 'string' ? JSON.parse(admin.permissions) : admin.permissions
            };
            
            res.json({
                success: true,
                redirectUrl: '/admin'
            });
            
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
    
    /**
     * Admin logout
     */
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/admin/login');
        });
    }
    
    /**
     * Admin dashboard
     */
    static async dashboard(req, res) {
        try {
            const dashboardData = await this.getDashboardData();
            
            res.render('admin/dashboard-dark-nature', {
                currentPage: 'admin-dashboard',
                title: 'Dashboard Admin - Gonzaga Art & Shine',
                dashboardData,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar dashboard',
                layout: false
            });
        }
    }
    
    /**
     * Get dashboard data (metrics)
     */
    static async getDashboardData() {
        try {
            // Today's revenue
            const [todayRevenueRows] = await pool.execute(
                `SELECT COALESCE(SUM(total_amount), 0) as revenue
                 FROM orders 
                 WHERE DATE(created_at) = CURDATE() 
                 AND status IN ('confirmed', 'processing', 'shipped', 'delivered')`
            );
            
            // Monthly orders
            const [monthlyOrdersRows] = await pool.execute(
                `SELECT COUNT(*) as count
                 FROM orders 
                 WHERE MONTH(created_at) = MONTH(CURDATE()) 
                 AND YEAR(created_at) = YEAR(CURDATE())`
            );
            
            // Total customers
            const [totalCustomersRows] = await pool.execute(
                'SELECT COUNT(DISTINCT customer_email) as count FROM orders'
            );
            
            // Available products
            const [availableProductsRows] = await pool.execute(
                'SELECT COUNT(*) as count FROM products WHERE is_active = 1'
            );
            
            // Stone performance
            const [stonePerformanceRows] = await pool.execute(
                `SELECT 
                    p.stone_type,
                    COUNT(oi.id) as sales,
                    COALESCE(SUM(oi.total_price), 0) as revenue,
                    COUNT(DISTINCT p.id) as stock
                 FROM products p
                 LEFT JOIN order_items oi ON p.id = oi.product_id
                 LEFT JOIN orders o ON oi.order_id = o.id
                 WHERE p.stone_type IS NOT NULL
                 AND (o.status IN ('confirmed', 'processing', 'shipped', 'delivered') OR o.status IS NULL)
                 GROUP BY p.stone_type`
            );
            
            // Recent activities
            const [recentActivitiesRows] = await pool.execute(
                `SELECT 
                    action,
                    description,
                    created_at,
                    user_identifier
                 FROM activity_log 
                 ORDER BY created_at DESC 
                 LIMIT 10`
            );
            
            // Process stone performance
            const stones = {
                onyx: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 },
                tiger: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 },
                amethyst: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 },
                turquoise: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 }
            };
            
            stonePerformanceRows.forEach(row => {
                if (row.stone_type) {
                    const stoneKey = this.mapStoneTypeToKey(row.stone_type);
                    stones[stoneKey] = {
                        sales: row.sales,
                        revenue: parseFloat(row.revenue).toFixed(2),
                        stock: row.stock,
                        trendPercent: Math.min(100, (row.sales / 10) * 100) // Simple trend
                    };
                }
            });
            
            // Process recent activities
            const recentActivities = recentActivitiesRows.map(activity => ({
                icon: this.getActivityIcon(activity.action),
                message: activity.description || activity.action,
                timeAgo: this.getTimeAgo(activity.created_at),
                type: this.getActivityType(activity.action)
            }));
            
            return {
                todayRevenue: parseFloat(todayRevenueRows[0].revenue).toFixed(2),
                monthlyOrders: monthlyOrdersRows[0].count,
                totalCustomers: totalCustomersRows[0].count,
                availableProducts: availableProductsRows[0].count,
                stones,
                recentActivities
            };
            
        } catch (error) {
            console.error('Get dashboard data error:', error);
            return {
                todayRevenue: '0.00',
                monthlyOrders: 0,
                totalCustomers: 0,
                availableProducts: 0,
                stones: {
                    onyx: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 },
                    tiger: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 },
                    amethyst: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 },
                    turquoise: { sales: 0, revenue: '0.00', stock: 0, trendPercent: 0 }
                },
                recentActivities: []
            };
        }
    }
    
    /**
     * Map stone_type to key
     */
    static mapStoneTypeToKey(stoneType) {
        if (!stoneType) return null;
        
        const mapping = {
            'onyx': 'onyx',
            'onix': 'onyx',
            'tiger_eye': 'tiger',
            'tiger-eye': 'tiger',
            'olho-de-tigre': 'tiger',
            'amethyst': 'amethyst',
            'ametista': 'amethyst',
            'turquoise': 'turquoise',
            'turquesa': 'turquoise'
        };
        
        return mapping[stoneType.toLowerCase()] || stoneType;
    }
    
    /**
     * Get activity icon
     */
    static getActivityIcon(action) {
        const icons = {
            'order_created': '📦',
            'product_viewed': '👁️',
            'product_added': '💎',
            'customer_registered': '👤',
            'payment_completed': '💳',
            'order_shipped': '🚚',
            'order_status_updated': '🔄'
        };
        return icons[action] || '📝';
    }
    
    /**
     * Get activity type
     */
    static getActivityType(action) {
        if (action.includes('order')) return 'order';
        if (action.includes('product')) return 'product';
        if (action.includes('customer')) return 'customer';
        return 'general';
    }
    
    /**
     * Get time ago
     */
    static getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m atrás`;
        if (hours < 24) return `${hours}h atrás`;
        return `${days}d atrás`;
    }
    
    /**
     * List orders (for admin)
     */
    static async listOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;
            const status = req.query.status || 'all';
            
            let whereClause = '1=1';
            let params = [];
            
            if (status !== 'all') {
                whereClause += ' AND o.status = ?';
                params.push(status);
            }
            
            const [ordersRows] = await pool.execute(
                `SELECT 
                    o.*,
                    COUNT(oi.id) as item_count
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 WHERE ${whereClause}
                 GROUP BY o.id
                 ORDER BY o.created_at DESC
                 LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );
            
            const [countRows] = await pool.execute(
                `SELECT COUNT(DISTINCT o.id) as total FROM orders o WHERE ${whereClause}`,
                params
            );
            
            const totalOrders = countRows[0].total;
            const totalPages = Math.ceil(totalOrders / limit);
            
            res.render('admin/orders-list-dark-nature', {
                currentPage: 'admin-orders',
                title: 'Gestão de Pedidos - Admin',
                orders: ordersRows,
                pagination: {
                    current: page,
                    total: totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                currentStatus: status,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('List orders error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar pedidos',
                layout: false
            });
        }
    }
    
    /**
     * View single order (for admin)
     */
    static async viewOrder(req, res) {
        try {
            const { id } = req.params;
            
            const [orderRows] = await pool.execute(
                `SELECT o.*,
                 GROUP_CONCAT(
                     CONCAT(oi.product_name, '|', oi.quantity, '|', oi.unit_price, '|', oi.total_price, '|', oi.product_image)
                     SEPARATOR ';;'
                 ) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.id = ?
                 GROUP BY o.id`,
                [id]
            );
            
            if (orderRows.length === 0) {
                return res.status(404).render('error', {
                    error: 'Pedido não encontrado',
                    layout: false
                });
            }
            
            const order = orderRows[0];
            
            // Parse items
            const items = order.items ? order.items.split(';;').map(item => {
                const [name, quantity, unitPrice, totalPrice, image] = item.split('|');
                return {
                    name,
                    quantity: parseInt(quantity),
                    unitPrice: parseFloat(unitPrice),
                    totalPrice: parseFloat(totalPrice),
                    image: image !== 'null' ? image : null
                };
            }) : [];
            
            res.render('admin/order-detail-dark-nature', {
                currentPage: 'admin-orders',
                title: `Pedido ${order.order_number} - Admin`,
                order: {
                    ...order,
                    items
                },
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('View order error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar pedido',
                layout: false
            });
        }
    }
    
    /**
     * Update order status
     */
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, trackingNumber } = req.body;
            
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
            
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Status inválido'
                });
            }
            
            const updateData = [status];
            let query = 'UPDATE orders SET status = ?, updated_at = NOW()';
            
            if (trackingNumber) {
                query += ', tracking_number = ?';
                updateData.push(trackingNumber);
            }
            
            query += ' WHERE id = ?';
            updateData.push(id);
            
            await pool.execute(query, updateData);
            
            // Log activity
            if (req.logActivity) {
                req.logActivity('order_status_updated', 'order', id, `Order status updated to ${status}`);
            }
            
            res.json({
                success: true,
                message: 'Status atualizado com sucesso'
            });
            
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao atualizar status'
            });
        }
    }
    
    /**
     * Add order note
     */
    static async addOrderNote(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            
            if (!note) {
                return res.status(400).json({
                    success: false,
                    error: 'Nota vazia'
                });
            }
            
            // Append note to admin_notes
            await pool.execute(
                `UPDATE orders 
                 SET admin_notes = CONCAT(COALESCE(admin_notes, ''), '\n[', NOW(), '] ', ?),
                     updated_at = NOW()
                 WHERE id = ?`,
                [note, id]
            );
            
            res.json({
                success: true,
                message: 'Nota adicionada com sucesso'
            });
            
        } catch (error) {
            console.error('Add order note error:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao adicionar nota'
            });
        }
    }
    
    /**
     * Dashboard updates (AJAX endpoint)
     */
    static async dashboardUpdates(req, res) {
        try {
            const dashboardData = await this.getDashboardData();
            res.json(dashboardData);
        } catch (error) {
            console.error('Dashboard updates error:', error);
            res.status(500).json({ error: 'Erro ao carregar atualizações' });
        }
    }
    
    /**
     * List products (for admin)
     */
    static async listProducts(req, res) {
        try {
            const [productsRows] = await pool.execute(
                `SELECT 
                    p.id,
                    p.name,
                    p.reference,
                    p.stone_type,
                    p.sale_price,
                    p.current_stock,
                    p.is_active,
                    (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC LIMIT 1) as image_url
                 FROM products p
                 ORDER BY p.id DESC
                 LIMIT 50`
            );
            
            res.render('admin/products-list-dark-nature', {
                currentPage: 'admin-products',
                title: 'Gestão de Produtos - Admin',
                products: productsRows,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('List products error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar produtos',
                layout: false
            });
        }
    }
    
    /**
     * List customers (for admin)
     */
    static async listCustomers(req, res) {
        try {
            const [customersRows] = await pool.execute(
                `SELECT * FROM customers
                 ORDER BY total_spent DESC, last_order_date DESC
                 LIMIT 50`
            );
            
            res.render('admin/customers-list-dark-nature', {
                currentPage: 'admin-customers',
                title: 'Gestão de Clientes - Admin',
                customers: customersRows,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('List customers error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar clientes',
                layout: false
            });
        }
    }
    
    /**
     * View single customer (for admin)
     */
    static async viewCustomer(req, res) {
        try {
            const { id } = req.params;
            
            const [customerRows] = await pool.execute(
                'SELECT * FROM customers WHERE id = ?',
                [id]
            );
            
            if (customerRows.length === 0) {
                return res.status(404).render('error', {
                    error: 'Cliente não encontrado',
                    layout: false
                });
            }
            
            // Get customer orders
            const [ordersRows] = await pool.execute(
                `SELECT * FROM orders 
                 WHERE customer_email = ?
                 ORDER BY created_at DESC`,
                [customerRows[0].email]
            );
            
            res.render('admin/customer-detail-dark-nature', {
                currentPage: 'admin-customers',
                title: `Cliente ${customerRows[0].name} - Admin`,
                customer: customerRows[0],
                orders: ordersRows,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('View customer error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar cliente',
                layout: false
            });
        }
    }
    
    /**
     * Analytics page (for admin)
     */
    static async analytics(req, res) {
        try {
            // Get analytics data
            const dashboardData = await this.getDashboardData();
            
            res.render('admin/analytics-dark-nature', {
                currentPage: 'admin-analytics',
                title: 'Analytics - Admin',
                analyticsData: dashboardData,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar analytics',
                layout: false
            });
        }
    }
    
    /**
     * Settings page (for admin)
     */
    static async settings(req, res) {
        try {
            const [settingsRows] = await pool.execute(
                'SELECT * FROM ecommerce_settings ORDER BY category, setting_key'
            );
            
            res.render('admin/settings-dark-nature', {
                currentPage: 'admin-settings',
                title: 'Configurações - Admin',
                settings: settingsRows,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('Settings error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar configurações',
                layout: false
            });
        }
    }
    
    /**
     * Update settings
     */
    static async updateSettings(req, res) {
        try {
            const updates = req.body; // { setting_key: value, ... }
            
            for (const [key, value] of Object.entries(updates)) {
                await pool.execute(
                    'UPDATE ecommerce_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?',
                    [value, key]
                );
            }
            
            res.json({
                success: true,
                message: 'Configurações atualizadas com sucesso'
            });
            
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao atualizar configurações'
            });
        }
    }
    
    /**
     * Activities log page
     */
    static async activities(req, res) {
        try {
            const [activitiesRows] = await pool.execute(
                `SELECT * FROM activity_log 
                 ORDER BY created_at DESC 
                 LIMIT 100`
            );
            
            res.render('admin/activities-dark-nature', {
                currentPage: 'admin-activities',
                title: 'Registo de Atividades - Admin',
                activities: activitiesRows,
                adminUser: req.session.adminUser,
                layout: false
            });
            
        } catch (error) {
            console.error('Activities error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar atividades',
                layout: false
            });
        }
    }
}

module.exports = AdminController;

