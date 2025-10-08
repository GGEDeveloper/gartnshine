/**
 * Site Configuration Middleware
 * 
 * Injects site configuration into all views
 * Makes site settings available as res.locals.site
 */

const siteConfig = require('../config/site');

module.exports = (req, res, next) => {
    // Inject entire config into views
    res.locals.site = siteConfig;
    
    // ========================================
    // HELPER FUNCTIONS FOR VIEWS
    // ========================================
    
    /**
     * Get WhatsApp URL with optional custom message
     * Usage in EJS: <%= getWhatsAppUrl() %>
     *               <%= getWhatsAppUrl("Custom message") %>
     */
    res.locals.getWhatsAppUrl = (message = null) => {
        if (!message) {
            message = siteConfig.getDefaultWhatsAppMessage();
        }
        return siteConfig.getWhatsAppUrl(message);
    };
    
    /**
     * Get WhatsApp URL for a specific product
     * Usage in EJS: <%= getProductWhatsAppUrl(product) %>
     */
    res.locals.getProductWhatsAppUrl = (product) => {
        const productUrl = `${req.protocol}://${req.get('host')}/catalog/product/${product.id}`;
        
        const message = `Olá! Gostaria de informações sobre:

*${product.name}*
Referência: ${product.reference}
Preço: €${product.sale_price}

Ver produto: ${productUrl}`;
        
        return siteConfig.getWhatsAppUrl(message);
    };
    
    /**
     * Get general inquiry WhatsApp URL
     * Usage in EJS: <%= getInquiryWhatsAppUrl() %>
     */
    res.locals.getInquiryWhatsAppUrl = () => {
        const message = `Olá! Gostaria de fazer uma consulta.`;
        return siteConfig.getWhatsAppUrl(message);
    };
    
    /**
     * Format price with currency
     * Usage in EJS: <%= formatPrice(product.sale_price) %>
     */
    res.locals.formatPrice = (price) => {
        return siteConfig.formatPrice(price);
    };
    
    /**
     * Check if feature is enabled
     * Usage in EJS: <% if (isFeatureEnabled('enableWhatsApp')) { %> ... <% } %>
     */
    res.locals.isFeatureEnabled = (feature) => {
        return siteConfig.isFeatureEnabled(feature);
    };
    
    /**
     * Get current year (for copyright)
     * Usage in EJS: © <%= currentYear %>
     */
    res.locals.currentYear = siteConfig.brand.year;
    
    /**
     * Get full page title for SEO
     * Usage in EJS: <title><%= getPageTitle('Product Name') %></title>
     */
    res.locals.getPageTitle = (pageTitle = null) => {
        if (pageTitle) {
            return `${pageTitle} | ${siteConfig.brand.name}`;
        }
        return siteConfig.seo.title;
    };
    
    /**
     * Get meta description
     * Usage in EJS: <meta name="description" content="<%= getMetaDescription() %>">
     */
    res.locals.getMetaDescription = (customDescription = null) => {
        return customDescription || siteConfig.seo.description;
    };
    
    /**
     * Build breadcrumb from path
     * Usage in EJS: <% const breadcrumb = buildBreadcrumb(); %>
     */
    res.locals.buildBreadcrumb = () => {
        const path = req.path;
        const parts = path.split('/').filter(p => p);
        
        const breadcrumb = [
            { name: 'Início', url: '/' }
        ];
        
        let currentPath = '';
        parts.forEach((part, index) => {
            currentPath += `/${part}`;
            
            // Capitalize and format
            let name = part.charAt(0).toUpperCase() + part.slice(1);
            name = name.replace(/-/g, ' ');
            
            // Don't add link for last item
            if (index === parts.length - 1) {
                breadcrumb.push({ name, url: null });
            } else {
                breadcrumb.push({ name, url: currentPath });
            }
        });
        
        return breadcrumb;
    };
    
    // ========================================
    // VALIDATION & WARNINGS
    // ========================================
    
    // Warn if WhatsApp number is still placeholder
    if (siteConfig.contact.whatsapp === '351XXXXXXXXX') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️  [Site Config] WhatsApp number is still a placeholder! Update config/site.js or WHATSAPP_NUMBER env var.');
        }
    }
    
    next();
};

