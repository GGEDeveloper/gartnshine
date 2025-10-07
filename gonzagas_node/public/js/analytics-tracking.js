/**
 * Analytics Tracking - Client Side
 * Automatic tracking of user interactions
 */

class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.trackingEndpoint = '/admin/api/analytics/track';
        this.pageStartTime = Date.now();
        this.maxScrollPercentage = 0;
        this.trackingQueue = [];
        this.isTracking = true;
        
        this.init();
    }
    
    init() {
        // Track page view
        this.trackPageView();
        
        // Setup event listeners
        this.bindEvents();
        
        // Setup scroll tracking
        this.setupScrollTracking();
        
        // Track page unload
        this.setupUnloadTracking();
        
        // Process tracking queue periodically
        this.setupQueueProcessor();
    }
    
    generateSessionId() {
        // Try to get existing session ID from sessionStorage
        let sessionId = sessionStorage.getItem('analytics_session_id');
        
        if (!sessionId) {
            // Generate new session ID
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        
        return sessionId;
    }
    
    trackPageView() {
        const pageData = this.getPageData();
        
        this.trackEvent({
            eventType: 'page_view',
            eventCategory: 'engagement',
            eventAction: 'view_page',
            eventLabel: pageData.url,
            pageData
        });
    }
    
    trackEvent(eventData) {
        if (!this.isTracking) return;
        
        const event = {
            sessionId: this.sessionId,
            eventType: eventData.eventType,
            eventCategory: eventData.eventCategory,
            eventAction: eventData.eventAction,
            eventLabel: eventData.eventLabel || null,
            eventValue: eventData.eventValue || null,
            productId: eventData.productId || this.getProductIdFromPage(),
            timestamp: Date.now(),
            ...eventData.pageData
        };
        
        this.trackingQueue.push(event);
        
        // Send immediately for important events
        if (eventData.eventType === 'conversion' || eventData.immediate) {
            this.processQueue();
        }
    }
    
    bindEvents() {
        // WhatsApp clicks
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"], a[href*="whatsapp"], .btn-whatsapp, .btn-whatsapp-mini');
            if (whatsappLink) {
                this.trackEvent({
                    eventType: 'conversion',
                    eventCategory: 'business',
                    eventAction: 'whatsapp_click',
                    eventLabel: whatsappLink.href || 'whatsapp_button',
                    immediate: true
                });
            }
            
            // Phone clicks
            const phoneLink = e.target.closest('a[href^="tel:"]');
            if (phoneLink) {
                this.trackEvent({
                    eventType: 'conversion',
                    eventCategory: 'business',
                    eventAction: 'phone_call',
                    eventLabel: phoneLink.href,
                    immediate: true
                });
            }
            
            // Email clicks
            const emailLink = e.target.closest('a[href^="mailto:"]');
            if (emailLink) {
                this.trackEvent({
                    eventType: 'conversion',
                    eventCategory: 'business',
                    eventAction: 'email_click',
                    eventLabel: emailLink.href,
                    immediate: true
                });
            }
            
            // Product links
            const productLink = e.target.closest('a[href*="/catalog/product/"]');
            if (productLink) {
                const productId = this.extractProductId(productLink.href);
                this.trackEvent({
                    eventType: 'navigation',
                    eventCategory: 'engagement',
                    eventAction: 'product_click',
                    eventLabel: productLink.href,
                    productId: productId
                });
            }
            
            // Search interactions
            const searchBtn = e.target.closest('.search-btn, button[type="submit"]');
            if (searchBtn) {
                const searchForm = searchBtn.closest('form');
                const searchInput = searchForm?.querySelector('input[type="search"], input[name="q"], .search-input');
                if (searchInput) {
                    this.trackEvent({
                        eventType: 'search',
                        eventCategory: 'engagement',
                        eventAction: 'search_submit',
                        eventLabel: searchInput.value,
                        eventValue: searchInput.value.length
                    });
                }
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.trackEvent({
                    eventType: 'form',
                    eventCategory: 'engagement',
                    eventAction: 'form_submit',
                    eventLabel: form.action || form.id || 'unknown_form'
                });
            }
        });
        
        // File downloads
        document.addEventListener('click', (e) => {
            const downloadLink = e.target.closest('a[download], a[href$=".pdf"], a[href$=".zip"], a[href$=".doc"], a[href$=".docx"]');
            if (downloadLink) {
                this.trackEvent({
                    eventType: 'download',
                    eventCategory: 'engagement',
                    eventAction: 'file_download',
                    eventLabel: downloadLink.href
                });
            }
        });
        
        // External links
        document.addEventListener('click', (e) => {
            const externalLink = e.target.closest('a[target="_blank"]');
            if (externalLink && !externalLink.href.includes(window.location.hostname)) {
                this.trackEvent({
                    eventType: 'navigation',
                    eventCategory: 'engagement',
                    eventAction: 'external_link',
                    eventLabel: externalLink.href
                });
            }
        });
    }
    
    setupScrollTracking() {
        let scrollTimeout;
        
        const trackScroll = () => {
            const scrollPercentage = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercentage > this.maxScrollPercentage) {
                this.maxScrollPercentage = Math.min(scrollPercentage, 100);
                
                // Track milestone percentages
                const milestones = [25, 50, 75, 90, 100];
                const milestone = milestones.find(m => 
                    this.maxScrollPercentage >= m && 
                    !this.hasTrackedScrollMilestone(m)
                );
                
                if (milestone) {
                    this.trackEvent({
                        eventType: 'scroll',
                        eventCategory: 'engagement',
                        eventAction: 'scroll_depth',
                        eventLabel: `${milestone}%`,
                        eventValue: milestone
                    });
                    
                    this.markScrollMilestoneTracked(milestone);
                }
            }
        };
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        }, { passive: true });
    }
    
    setupUnloadTracking() {
        const trackPageTime = () => {
            const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
            
            this.trackEvent({
                eventType: 'timing',
                eventCategory: 'engagement',
                eventAction: 'time_on_page',
                eventLabel: window.location.pathname,
                eventValue: timeOnPage,
                immediate: true
            });
        };
        
        // Track when user leaves the page
        window.addEventListener('beforeunload', trackPageTime);
        window.addEventListener('pagehide', trackPageTime);
        
        // Track when page becomes hidden (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                trackPageTime();
            } else {
                this.pageStartTime = Date.now(); // Reset start time when page becomes visible again
            }
        });
    }
    
    setupQueueProcessor() {
        // Process queue every 5 seconds
        setInterval(() => {
            if (this.trackingQueue.length > 0) {
                this.processQueue();
            }
        }, 5000);
        
        // Also process queue when it gets large
        const originalPush = this.trackingQueue.push;
        this.trackingQueue.push = function(...items) {
            const result = originalPush.apply(this, items);
            if (this.length >= 5) {
                setTimeout(() => window.analytics?.processQueue(), 100);
            }
            return result;
        };
    }
    
    async processQueue() {
        if (this.trackingQueue.length === 0) return;
        
        const events = [...this.trackingQueue];
        this.trackingQueue = [];
        
        try {
            // Send events in batches
            const batchSize = 10;
            for (let i = 0; i < events.length; i += batchSize) {
                const batch = events.slice(i, i + batchSize);
                
                await fetch(this.trackingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        events: batch
                    })
                });
            }
        } catch (error) {
            console.error('Analytics tracking error:', error);
            // Re-add failed events to queue for retry
            this.trackingQueue.unshift(...events);
        }
    }
    
    getPageData() {
        return {
            url: window.location.href,
            pathname: window.location.pathname,
            referrer: document.referrer,
            title: document.title,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    getProductIdFromPage() {
        // Extract product ID from URL if on product page
        const match = window.location.pathname.match(/\/catalog\/product\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }
    
    extractProductId(url) {
        const match = url.match(/\/catalog\/product\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }
    
    hasTrackedScrollMilestone(milestone) {
        const key = `scroll_${milestone}_${window.location.pathname}`;
        return sessionStorage.getItem(key) === 'true';
    }
    
    markScrollMilestoneTracked(milestone) {
        const key = `scroll_${milestone}_${window.location.pathname}`;
        sessionStorage.setItem(key, 'true');
    }
    
    // Public methods
    enableTracking() {
        this.isTracking = true;
    }
    
    disableTracking() {
        this.isTracking = false;
    }
    
    // Track custom events manually
    track(eventType, eventCategory, eventAction, eventLabel = null, eventValue = null) {
        this.trackEvent({
            eventType,
            eventCategory,
            eventAction,
            eventLabel,
            eventValue
        });
    }
}

// Auto-initialize if not in admin area
if (!window.location.pathname.startsWith('/admin/')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.analytics = new AnalyticsTracker();
    });
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracker;
}

