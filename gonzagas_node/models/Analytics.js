/**
 * Analytics Model - Business Intelligence & Reporting
 * Handles analytics data collection and reporting
 */

const pool = require('../config/database');

class Analytics {
    constructor() {
        this.sessionTimeout = 30 * 60; // 30 minutes
    }
    
    /**
     * Track page view event
     */
    async trackPageView(data) {
        const {
            sessionId,
            userId = null,
            pageUrl,
            pageTitle = null,
            pageType = null,
            productId = null,
            categoryId = null,
            userAgent = null,
            ipAddress = null,
            referrer = null
        } = data;
        
        try {
            // Update or create session
            await this.updateSession(sessionId, { userId, userAgent, ipAddress, referrer });
            
            // Insert page view
            const [result] = await pool.query(`
                INSERT INTO analytics_page_views 
                (session_id, page_url, page_title, page_type, product_id, category_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [sessionId, pageUrl, pageTitle, pageType, productId, categoryId]);
            
            // Track event
            await this.trackEvent({
                sessionId,
                userId,
                eventType: 'page_view',
                eventCategory: 'engagement',
                eventAction: 'view_page',
                eventLabel: pageUrl,
                pageUrl,
                userAgent,
                ipAddress,
                productId
            });
            
            return result.insertId;
        } catch (error) {
            console.error('Track page view error:', error);
            throw error;
        }
    }
    
    /**
     * Track custom event
     */
    async trackEvent(data) {
        const {
            sessionId,
            userId = null,
            eventType,
            eventCategory,
            eventAction,
            eventLabel = null,
            eventValue = null,
            pageUrl,
            referrer = null,
            userAgent = null,
            ipAddress = null,
            productId = null,
            productCategory = null
        } = data;
        
        try {
            // Parse device info from user agent
            const deviceInfo = this.parseUserAgent(userAgent);
            
            await pool.query(`
                INSERT INTO analytics_events 
                (session_id, user_id, event_type, event_category, event_action, 
                 event_label, event_value, page_url, referrer, user_agent, 
                 ip_address, device_type, browser, os, product_id, product_category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sessionId, userId, eventType, eventCategory, eventAction,
                eventLabel, eventValue, pageUrl, referrer, userAgent,
                ipAddress, deviceInfo.deviceType, deviceInfo.browser, 
                deviceInfo.os, productId, productCategory
            ]);
            
            // Update session activity
            await this.updateSessionActivity(sessionId);
            
        } catch (error) {
            console.error('Track event error:', error);
            throw error;
        }
    }
    
    /**
     * Track conversion event
     */
    async trackConversion(data) {
        const {
            sessionId,
            conversionType,
            conversionValue = 0,
            productId = null,
            productCategory = null,
            funnelStage = 'interest'
        } = data;
        
        try {
            // Get session for attribution data
            const [sessions] = await pool.query(`
                SELECT source, medium FROM analytics_sessions WHERE id = ?
            `, [sessionId]);
            
            const session = sessions[0];
            
            const [result] = await pool.query(`
                INSERT INTO analytics_conversions 
                (session_id, conversion_type, conversion_value, product_id, 
                 product_category, funnel_stage, first_touch_source, last_touch_source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sessionId, conversionType, conversionValue, productId,
                productCategory, funnelStage, session?.source, session?.source
            ]);
            
            // Mark session as converted
            await pool.query(`
                UPDATE analytics_sessions 
                SET converted = TRUE, conversion_type = ?, conversion_value = ?
                WHERE id = ?
            `, [conversionType, conversionValue, sessionId]);
            
            // Track as event too
            await this.trackEvent({
                sessionId,
                eventType: 'conversion',
                eventCategory: 'business',
                eventAction: conversionType,
                eventValue: conversionValue,
                pageUrl: '/conversion',
                productId
            });
            
            return result.insertId;
        } catch (error) {
            console.error('Track conversion error:', error);
            throw error;
        }
    }
    
    /**
     * Track search query
     */
    async trackSearch(data) {
        const {
            sessionId,
            queryText,
            resultsCount = 0,
            searchType = 'catalog',
            filtersApplied = null,
            clickedPosition = null,
            clickedProductId = null
        } = data;
        
        try {
            await pool.query(`
                INSERT INTO analytics_search_queries 
                (session_id, query_text, results_count, search_type, 
                 filters_applied, clicked_result_position, clicked_product_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                sessionId, queryText, resultsCount, searchType,
                JSON.stringify(filtersApplied), clickedPosition, clickedProductId
            ]);
            
            // Track as event
            await this.trackEvent({
                sessionId,
                eventType: 'search',
                eventCategory: 'engagement',
                eventAction: 'search_query',
                eventLabel: queryText,
                eventValue: resultsCount,
                pageUrl: '/search'
            });
            
        } catch (error) {
            console.error('Track search error:', error);
            throw error;
        }
    }
    
    /**
     * Update or create session
     */
    async updateSession(sessionId, data = {}) {
        const {
            userId = null,
            userAgent = null,
            ipAddress = null,
            referrer = null
        } = data;
        
        try {
            // Check if session exists
            const [existing] = await pool.query(`
                SELECT id, page_views FROM analytics_sessions WHERE id = ?
            `, [sessionId]);
            
            if (existing.length > 0) {
                // Update existing session
                await pool.query(`
                    UPDATE analytics_sessions 
                    SET page_views = page_views + 1, 
                        updated_at = NOW(),
                        end_time = NOW(),
                        duration_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
                    WHERE id = ?
                `, [sessionId]);
            } else {
                // Create new session
                const deviceInfo = this.parseUserAgent(userAgent);
                const trafficSource = this.parseTrafficSource(referrer);
                
                await pool.query(`
                    INSERT INTO analytics_sessions 
                    (id, user_id, start_time, device_type, browser, os, 
                     source, medium, referrer)
                    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)
                `, [
                    sessionId, userId, deviceInfo.deviceType, 
                    deviceInfo.browser, deviceInfo.os,
                    trafficSource.source, trafficSource.medium, referrer
                ]);
            }
        } catch (error) {
            console.error('Update session error:', error);
            throw error;
        }
    }
    
    /**
     * Get analytics dashboard data
     */
    async getDashboardData(days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            // Get overview metrics
            const [overview] = await pool.query(`
                SELECT 
                    COUNT(DISTINCT s.id) as total_sessions,
                    COUNT(DISTINCT pv.id) as total_page_views,
                    COUNT(DISTINCT c.id) as total_conversions,
                    AVG(s.duration_seconds) as avg_session_duration,
                    AVG(s.page_views) as avg_pages_per_session,
                    SUM(CASE WHEN s.page_views = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.id) as bounce_rate
                FROM analytics_sessions s
                LEFT JOIN analytics_page_views pv ON s.id = pv.session_id
                LEFT JOIN analytics_conversions c ON s.id = c.session_id
                WHERE s.start_time >= ?
            `, [startDate]);
            
            // Get daily stats for chart
            const [dailyStats] = await pool.query(`
                SELECT 
                    date,
                    total_sessions,
                    page_views,
                    whatsapp_clicks,
                    conversion_rate
                FROM analytics_daily_stats 
                WHERE date >= DATE(?)
                ORDER BY date ASC
            `, [startDate]);
            
            // Get device breakdown
            const [deviceStats] = await pool.query(`
                SELECT 
                    device_type,
                    COUNT(*) as sessions,
                    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analytics_sessions WHERE start_time >= ?) as percentage
                FROM analytics_sessions 
                WHERE start_time >= ?
                GROUP BY device_type
                ORDER BY sessions DESC
            `, [startDate, startDate]);
            
            // Get traffic sources
            const [trafficSources] = await pool.query(`
                SELECT 
                    COALESCE(source, 'Direct') as source,
                    COUNT(*) as sessions,
                    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analytics_sessions WHERE start_time >= ?) as percentage
                FROM analytics_sessions 
                WHERE start_time >= ?
                GROUP BY source
                ORDER BY sessions DESC
                LIMIT 10
            `, [startDate, startDate]);
            
            // Get top pages
            const [topPages] = await pool.query(`
                SELECT 
                    pv.page_url,
                    pv.page_title,
                    pv.page_type,
                    COUNT(*) as views,
                    COUNT(DISTINCT pv.session_id) as unique_views,
                    AVG(pv.time_on_page) as avg_time_on_page
                FROM analytics_page_views pv
                JOIN analytics_sessions s ON pv.session_id = s.id
                WHERE s.start_time >= ?
                GROUP BY pv.page_url, pv.page_title, pv.page_type
                ORDER BY views DESC
                LIMIT 10
            `, [startDate]);
            
            // Get top products
            const [topProducts] = await pool.query(`
                SELECT 
                    p.id,
                    p.name,
                    p.reference,
                    COUNT(DISTINCT pv.session_id) as views,
                    COUNT(c.id) as conversions,
                    COUNT(c.id) * 100.0 / COUNT(DISTINCT pv.session_id) as conversion_rate
                FROM products p
                LEFT JOIN analytics_page_views pv ON p.id = pv.product_id
                LEFT JOIN analytics_sessions s ON pv.session_id = s.id
                LEFT JOIN analytics_conversions c ON p.id = c.product_id AND c.session_id = s.id
                WHERE s.start_time >= ?
                GROUP BY p.id, p.name, p.reference
                HAVING views > 0
                ORDER BY views DESC
                LIMIT 10
            `, [startDate]);
            
            // Get conversion funnel
            const [conversionFunnel] = await pool.query(`
                SELECT 
                    conversion_type,
                    COUNT(*) as conversions,
                    AVG(conversion_value) as avg_value
                FROM analytics_conversions c
                JOIN analytics_sessions s ON c.session_id = s.id
                WHERE s.start_time >= ?
                GROUP BY conversion_type
                ORDER BY conversions DESC
            `, [startDate]);
            
            return {
                overview: overview[0] || {},
                dailyStats,
                deviceStats,
                trafficSources,
                topPages,
                topProducts,
                conversionFunnel
            };
            
        } catch (error) {
            console.error('Get dashboard data error:', error);
            throw error;
        }
    }
    
    /**
     * Get product performance report
     */
    async getProductPerformance(productId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const [performance] = await pool.query(`
                SELECT 
                    p.id,
                    p.name,
                    p.reference,
                    COUNT(DISTINCT pv.session_id) as unique_views,
                    COUNT(pv.id) as total_views,
                    AVG(pv.time_on_page) as avg_time_on_page,
                    COUNT(DISTINCT CASE WHEN s.page_views = 1 THEN s.id END) * 100.0 / COUNT(DISTINCT pv.session_id) as bounce_rate,
                    COUNT(c.id) as conversions,
                    COUNT(c.id) * 100.0 / COUNT(DISTINCT pv.session_id) as conversion_rate,
                    COUNT(CASE WHEN c.conversion_type = 'whatsapp_click' THEN 1 END) as whatsapp_clicks
                FROM products p
                LEFT JOIN analytics_page_views pv ON p.id = pv.product_id
                LEFT JOIN analytics_sessions s ON pv.session_id = s.id
                LEFT JOIN analytics_conversions c ON p.id = c.product_id AND c.session_id = s.id
                WHERE p.id = ? AND (s.start_time IS NULL OR s.start_time >= ?)
                GROUP BY p.id, p.name, p.reference
            `, [productId, startDate]);
            
            // Get daily trend
            const [dailyTrend] = await pool.query(`
                SELECT 
                    DATE(s.start_time) as date,
                    COUNT(DISTINCT pv.session_id) as views,
                    COUNT(c.id) as conversions
                FROM analytics_page_views pv
                JOIN analytics_sessions s ON pv.session_id = s.id
                LEFT JOIN analytics_conversions c ON pv.product_id = c.product_id AND c.session_id = s.id
                WHERE pv.product_id = ? AND s.start_time >= ?
                GROUP BY DATE(s.start_time)
                ORDER BY date ASC
            `, [productId, startDate]);
            
            return {
                performance: performance[0] || {},
                dailyTrend
            };
            
        } catch (error) {
            console.error('Get product performance error:', error);
            throw error;
        }
    }
    
    /**
     * Generate daily stats (run as cron job)
     */
    async generateDailyStats(date = null) {
        const targetDate = date || new Date();
        targetDate.setDate(targetDate.getDate() - 1); // Previous day
        const dateStr = targetDate.toISOString().split('T')[0];
        
        try {
            const [stats] = await pool.query(`
                SELECT 
                    COUNT(DISTINCT s.id) as total_sessions,
                    COUNT(DISTINCT s.user_id) as unique_visitors,
                    COUNT(pv.id) as page_views,
                    AVG(s.duration_seconds) as avg_session_duration,
                    SUM(CASE WHEN s.page_views = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.id) as bounce_rate,
                    COUNT(DISTINCT CASE WHEN s.device_type = 'desktop' THEN s.id END) as desktop_sessions,
                    COUNT(DISTINCT CASE WHEN s.device_type = 'mobile' THEN s.id END) as mobile_sessions,
                    COUNT(DISTINCT CASE WHEN s.device_type = 'tablet' THEN s.id END) as tablet_sessions,
                    COUNT(c.id) as total_conversions,
                    COUNT(CASE WHEN c.conversion_type = 'whatsapp_click' THEN 1 END) as whatsapp_clicks,
                    COUNT(CASE WHEN c.conversion_type = 'phone_call' THEN 1 END) as phone_calls,
                    COUNT(c.id) * 100.0 / COUNT(DISTINCT s.id) as conversion_rate
                FROM analytics_sessions s
                LEFT JOIN analytics_page_views pv ON s.id = pv.session_id
                LEFT JOIN analytics_conversions c ON s.id = c.session_id
                WHERE DATE(s.start_time) = ?
            `, [dateStr]);
            
            const statsData = stats[0] || {};
            
            // Insert or update daily stats
            await pool.query(`
                INSERT INTO analytics_daily_stats 
                (date, total_sessions, unique_visitors, page_views, bounce_rate, 
                 avg_session_duration, desktop_sessions, mobile_sessions, tablet_sessions,
                 total_conversions, whatsapp_clicks, phone_calls, conversion_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_sessions = VALUES(total_sessions),
                unique_visitors = VALUES(unique_visitors),
                page_views = VALUES(page_views),
                bounce_rate = VALUES(bounce_rate),
                avg_session_duration = VALUES(avg_session_duration),
                desktop_sessions = VALUES(desktop_sessions),
                mobile_sessions = VALUES(mobile_sessions),
                tablet_sessions = VALUES(tablet_sessions),
                total_conversions = VALUES(total_conversions),
                whatsapp_clicks = VALUES(whatsapp_clicks),
                phone_calls = VALUES(phone_calls),
                conversion_rate = VALUES(conversion_rate)
            `, [
                dateStr,
                statsData.total_sessions || 0,
                statsData.unique_visitors || 0,
                statsData.page_views || 0,
                statsData.bounce_rate || 0,
                statsData.avg_session_duration || 0,
                statsData.desktop_sessions || 0,
                statsData.mobile_sessions || 0,
                statsData.tablet_sessions || 0,
                statsData.total_conversions || 0,
                statsData.whatsapp_clicks || 0,
                statsData.phone_calls || 0,
                statsData.conversion_rate || 0
            ]);
            
            console.log(`Daily stats generated for ${dateStr}`);
            
        } catch (error) {
            console.error('Generate daily stats error:', error);
            throw error;
        }
    }
    
    /**
     * Helper methods
     */
    parseUserAgent(userAgent) {
        if (!userAgent) {
            return { deviceType: null, browser: null, os: null };
        }
        
        const ua = userAgent.toLowerCase();
        
        // Device type detection
        let deviceType = 'desktop';
        if (ua.includes('mobile') || ua.includes('android')) {
            deviceType = 'mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            deviceType = 'tablet';
        }
        
        // Browser detection
        let browser = 'unknown';
        if (ua.includes('chrome')) browser = 'Chrome';
        else if (ua.includes('firefox')) browser = 'Firefox';
        else if (ua.includes('safari')) browser = 'Safari';
        else if (ua.includes('edge')) browser = 'Edge';
        else if (ua.includes('opera')) browser = 'Opera';
        
        // OS detection
        let os = 'unknown';
        if (ua.includes('windows')) os = 'Windows';
        else if (ua.includes('mac os')) os = 'macOS';
        else if (ua.includes('linux')) os = 'Linux';
        else if (ua.includes('android')) os = 'Android';
        else if (ua.includes('ios')) os = 'iOS';
        
        return { deviceType, browser, os };
    }
    
    parseTrafficSource(referrer) {
        if (!referrer) {
            return { source: 'direct', medium: 'none' };
        }
        
        const ref = referrer.toLowerCase();
        
        // Search engines
        if (ref.includes('google.')) return { source: 'google', medium: 'organic' };
        if (ref.includes('bing.')) return { source: 'bing', medium: 'organic' };
        if (ref.includes('yahoo.')) return { source: 'yahoo', medium: 'organic' };
        if (ref.includes('duckduckgo.')) return { source: 'duckduckgo', medium: 'organic' };
        
        // Social media
        if (ref.includes('facebook.')) return { source: 'facebook', medium: 'social' };
        if (ref.includes('instagram.')) return { source: 'instagram', medium: 'social' };
        if (ref.includes('twitter.')) return { source: 'twitter', medium: 'social' };
        if (ref.includes('linkedin.')) return { source: 'linkedin', medium: 'social' };
        if (ref.includes('pinterest.')) return { source: 'pinterest', medium: 'social' };
        
        // Extract domain as source
        try {
            const url = new URL(referrer);
            return { source: url.hostname, medium: 'referral' };
        } catch {
            return { source: 'unknown', medium: 'referral' };
        }
    }
    
    async updateSessionActivity(sessionId) {
        try {
            await pool.query(`
                UPDATE analytics_sessions 
                SET end_time = NOW(),
                    duration_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
                WHERE id = ?
            `, [sessionId]);
        } catch (error) {
            console.error('Update session activity error:', error);
        }
    }
}

module.exports = new Analytics();

