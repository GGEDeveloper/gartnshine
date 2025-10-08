/**
 * Site Configuration - Centralized Settings
 * 
 * Modify here to update across entire site
 * All values can be overridden by environment variables
 */

module.exports = {
    // ========================================
    // BRAND INFORMATION
    // ========================================
    brand: {
        name: "Gonzaga's Art & Shine",
        tagline: "Elegância que nasce da terra",
        slogan: "Elegância que nasce da terra",
        description: "Joias artesanais em prata 925 e pedras naturais. Cada peça é única, criada à mão com técnicas tradicionais portuguesas.",
        logo: "/images/logo.svg",
        favicon: "/favicon.ico",
        year: new Date().getFullYear()
    },
    
    // ========================================
    // CONTACT INFORMATION
    // ========================================
    contact: {
        // WhatsApp (format: country code + number without spaces)
        // Example: 351912345678 for +351 912 345 678
        whatsapp: process.env.WHATSAPP_NUMBER || "351XXXXXXXXX", // ← ALTERAR AQUI ou no .env
        
        // Email
        email: process.env.CONTACT_EMAIL || "geral@artnshine.pt",
        
        // Phone (display format)
        phone: process.env.CONTACT_PHONE || "+351 912 345 678",
        
        // Address
        address: process.env.CONTACT_ADDRESS || "Portugal"
    },
    
    // ========================================
    // SOCIAL MEDIA
    // ========================================
    social: {
        instagram: {
            url: process.env.INSTAGRAM_URL || "https://www.instagram.com/gonzagaartnshine/",
            handle: "@gonzagaartnshine"
        },
        facebook: {
            url: process.env.FACEBOOK_URL || "https://www.facebook.com/profile.php?id=61573519807731",
            name: "Gonzaga's Art & Shine"
        },
        // Add more social networks as needed
        // twitter: { url: "...", handle: "@..." },
        // pinterest: { url: "..." },
    },
    
    // ========================================
    // SEO CONFIGURATION
    // ========================================
    seo: {
        title: "Gonzaga's Art & Shine - Joias de Prata 925 Únicas",
        description: "Joias artesanais de prata 925 e pedras naturais. Cada peça é única, criada à mão em Portugal com técnicas tradicionais.",
        keywords: "joias prata 925, artesanal, handmade, brincos, anéis, colares, pulseiras, Portugal, pedras naturais, boho, bali",
        author: "Gonzaga's Art & Shine",
        ogImage: "/images/og-image.jpg",
        ogType: "website",
        twitterCard: "summary_large_image"
    },
    
    // ========================================
    // FEATURE FLAGS
    // ========================================
    features: {
        enableSearch: true,
        enableWhatsApp: true,
        enableAnalytics: process.env.NODE_ENV === 'production',
        enableNewsletter: false,
        enableWishlist: false,
        enableCart: false, // Future: shopping cart
        enableReviews: false,
        enableBlog: false
    },
    
    // ========================================
    // UI/UX SETTINGS
    // ========================================
    ui: {
        // Products
        productsPerPage: 24,
        featuredCount: 10,
        relatedProductsCount: 6,
        
        // Theme
        theme: process.env.SITE_THEME || "modern", // "modern" or "dark"
        
        // Language
        language: process.env.SITE_LANGUAGE || "pt",
        
        // Currency
        currency: "EUR",
        currencySymbol: "€",
        currencyPosition: "after", // "before" or "after" price
        
        // Date format
        dateFormat: "DD/MM/YYYY"
    },
    
    // ========================================
    // BUSINESS SETTINGS
    // ========================================
    business: {
        // Shipping
        freeShippingThreshold: 50, // Free shipping above this amount
        shippingCost: 5.00, // Standard shipping cost
        
        // Stock
        lowStockThreshold: 3, // Show "Low stock" warning
        
        // Returns
        returnPeriod: 14, // Days
        
        // Warranty
        warrantyPeriod: 24 // Months
    },
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    /**
     * Get WhatsApp URL with optional message
     * @param {string} message - Optional pre-filled message
     * @returns {string} WhatsApp URL
     */
    getWhatsAppUrl(message = null) {
        const number = this.contact.whatsapp.replace(/\s/g, '');
        const baseUrl = `https://wa.me/${number}`;
        
        if (message) {
            return `${baseUrl}?text=${encodeURIComponent(message)}`;
        }
        
        return baseUrl;
    },
    
    /**
     * Get default WhatsApp message
     * @returns {string} Default message
     */
    getDefaultWhatsAppMessage() {
        return `Olá! Gostaria de saber mais sobre as vossas joias.`;
    },
    
    /**
     * Format price
     * @param {number} price - Price value
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        const formatted = parseFloat(price).toFixed(2);
        if (this.ui.currencyPosition === 'before') {
            return `${this.ui.currencySymbol}${formatted}`;
        }
        return `${formatted} ${this.ui.currencySymbol}`;
    },
    
    /**
     * Check if feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean}
     */
    isFeatureEnabled(feature) {
        return this.features[feature] === true;
    }
};

