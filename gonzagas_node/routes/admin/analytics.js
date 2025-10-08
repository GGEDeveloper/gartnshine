const express = require('express');
const { query, param, validationResult } = require('express-validator');
const Analytics = require('../../models/Analytics');

const router = express.Router();

/**
 * GET /admin/analytics/dashboard
 * Analytics dashboard page
 */
router.get('/analytics/dashboard', (req, res) => {
    res.render('admin/analytics/dashboard', {
        title: 'Analytics Dashboard',
        user: req.session?.user || {},
        page: 'analytics'
    });
});

/**
 * GET /admin/api/analytics/dashboard
 * Get dashboard data
 */
router.get('/api/analytics/dashboard', [
    query('days').optional().isInt({ min: 1, max: 365 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors.array()
            });
        }
        
        const days = req.query.days || 30;
        const data = await Analytics.getDashboardData(days);
        
        res.json({
            success: true,
            data
        });
        
    } catch (error) {
        console.error('Analytics dashboard API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar dados de analytics'
        });
    }
});

/**
 * GET /admin/api/analytics/product/:id
 * Get product performance data
 */
router.get('/api/analytics/product/:id', [
    param('id').isInt({ min: 1 }).toInt(),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors.array()
            });
        }
        
        const productId = req.params.id;
        const days = req.query.days || 30;
        
        const data = await Analytics.getProductPerformance(productId, days);
        
        res.json({
            success: true,
            data
        });
        
    } catch (error) {
        console.error('Product analytics API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar dados do produto'
        });
    }
});

/**
 * POST /admin/api/analytics/track
 * Track custom event (for manual tracking)
 */
router.post('/api/analytics/track', async (req, res) => {
    try {
        const {
            sessionId,
            eventType,
            eventCategory,
            eventAction,
            eventLabel,
            eventValue,
            productId
        } = req.body;
        
        if (!sessionId || !eventType || !eventCategory || !eventAction) {
            return res.status(400).json({
                success: false,
                message: 'Missing required tracking parameters'
            });
        }
        
        await Analytics.trackEvent({
            sessionId,
            eventType,
            eventCategory,
            eventAction,
            eventLabel,
            eventValue,
            pageUrl: req.headers.referer || '/',
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            productId
        });
        
        res.json({
            success: true,
            message: 'Event tracked successfully'
        });
        
    } catch (error) {
        console.error('Track event API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registar evento'
        });
    }
});

/**
 * GET /admin/api/analytics/export/dashboard
 * Export dashboard data as CSV
 */
router.get('/api/analytics/export/dashboard', [
    query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
    query('format').optional().isIn(['csv', 'json'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors.array()
            });
        }
        
        const days = req.query.days || 30;
        const format = req.query.format || 'csv';
        const data = await Analytics.getDashboardData(days);
        
        if (format === 'csv') {
            const csv = generateCSVReport(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csv);
        } else {
            res.json({
                success: true,
                data,
                exportDate: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao exportar dados'
        });
    }
});

// Helper method to generate CSV
function generateCSVReport(data) {
    const { dailyStats, overview, topPages, topProducts } = data;
    
    let csv = 'Analytics Report\n\n';
    
    // Overview section
    csv += 'OVERVIEW\n';
    csv += 'Metric,Value\n';
    csv += `Total Sessions,${overview.total_sessions || 0}\n`;
    csv += `Total Page Views,${overview.total_page_views || 0}\n`;
    csv += `Total Conversions,${overview.total_conversions || 0}\n`;
    csv += `Conversion Rate,${(overview.conversion_rate || 0).toFixed(2)}%\n`;
    csv += `Avg Session Duration,${Math.round(overview.avg_session_duration || 0)}s\n`;
    csv += `Bounce Rate,${(overview.bounce_rate || 0).toFixed(2)}%\n\n`;
    
    // Daily stats section
    csv += 'DAILY STATISTICS\n';
    csv += 'Date,Sessions,Page Views,WhatsApp Clicks,Conversion Rate\n';
    dailyStats.forEach(day => {
        csv += `${day.date},${day.total_sessions},${day.page_views},${day.whatsapp_clicks},${(day.conversion_rate || 0).toFixed(2)}%\n`;
    });
    csv += '\n';
    
    // Top pages section
    csv += 'TOP PAGES\n';
    csv += 'Page,Views,Unique Views,Avg Time\n';
    topPages.forEach(page => {
        csv += `"${page.page_title || page.page_url}",${page.views},${page.unique_views},${Math.round(page.avg_time_on_page || 0)}s\n`;
    });
    csv += '\n';
    
    // Top products section
    csv += 'TOP PRODUCTS\n';
    csv += 'Product,Reference,Views,Conversions,Conversion Rate\n';
    topProducts.forEach(product => {
        csv += `"${product.name}",${product.reference},${product.views},${product.conversions},${(product.conversion_rate || 0).toFixed(2)}%\n`;
    });
    
    return csv;
}

module.exports = router;

