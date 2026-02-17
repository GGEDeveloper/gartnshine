/**
 * Homepage V2 - Gonzaga's Art & Shine
 * Enhanced functionality and interactions
 */

class HomepageV2 {
    constructor() {
        this.featuredProducts = [];
        this.categories = [];
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Load data
            await this.loadFeaturedProducts();
            await this.loadCategories();
            
            // Initialize components
            this.setupHeroInteractions();
            this.setupScrollEffects();
            this.setupPerformanceOptimizations();
            this.setupAccessibility();
            
            console.log('Homepage V2 initialized successfully');
        } catch (error) {
            console.error('Homepage initialization failed:', error);
            this.showErrorFallback();
        }
    }
    
    async loadFeaturedProducts() {
        try {
            this.showLoading('featured');
            
            const response = await fetch('/api/products/featured?limit=8');
            const data = await response.json();
            
            if (data.success) {
                this.featuredProducts = data.data;
                this.renderFeaturedProducts();
            } else {
                throw new Error(data.message || 'Failed to load featured products');
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
            this.showErrorState('featured');
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/families');
            const data = await response.json();
            
            if (data.success) {
                this.categories = data.data;
                this.renderCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showErrorState('categories');
        }
    }
    
    renderFeaturedProducts() {
        const wrapper = document.getElementById('mainProductsWrapper');
        if (!wrapper || !this.featuredProducts.length) return;
        
        wrapper.innerHTML = this.featuredProducts.map(product => `
            <div class="swiper-slide">
                <div class="featured-product-card" data-aos="fade-up">
                    <div class="featured-product-image">
                        <img src="${product.main_image ? `/uploads/products/${product.main_image}` : '/images/placeholder.jpg'}" 
                             alt="${product.name}" 
                             loading="lazy">
                        ${product.featured ? '<span class="product-badge">Destaque</span>' : ''}
                    </div>
                    
                    <div class="featured-product-info">
                        <div class="featured-product-category">${product.family_name || 'Joias'}</div>
                        <h3 class="featured-product-name">${product.name}</h3>
                        <div class="featured-product-price">
                            ${product.sale_price ? 
                                `€${parseFloat(product.sale_price).toFixed(2)}` : 
                                'Preço sob consulta'
                            }
                        </div>
                        
                        <div class="featured-product-cta">
                            <a href="/catalog/product/${product.id}" class="btn-product-view">
                                Ver Detalhes
                            </a>
                            <a href="https://wa.me/351XXXXXXXXX?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre ${product.name} (REF: ${product.reference})`)}" 
                               class="btn-product-whatsapp" 
                               target="_blank"
                               onclick="this.trackWhatsAppClick('${product.id}', 'featured')">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize AOS for new elements
        if (window.AOS) {
            AOS.refresh();
        }
    }
    
    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid || !this.categories.length) return;
        
        grid.innerHTML = this.categories.slice(0, 6).map(category => `
            <div class="category-card" data-aos="fade-up" onclick="this.navigateToCategory(${category.id})">
                <div class="category-image">
                    <img src="${category.image_url || '/images/category-placeholder.jpg'}" 
                         alt="${category.name}" 
                         loading="lazy">
                </div>
                
                <div class="category-overlay">
                    <div class="category-content">
                        <h3 class="category-name">${category.name}</h3>
                        <p class="category-count">${category.product_count || 0} produtos</p>
                        <span class="btn-category-view">Explorar</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (window.AOS) {
            AOS.refresh();
        }
    }
    
    setupHeroInteractions() {
        // Parallax effect for hero background
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const heroSection = document.getElementById('heroSection');
            
            if (heroSection) {
                const speed = 0.5;
                heroSection.style.transform = `translateY(${scrolled * speed}px)`;
            }
            
            ticking = false;
        };
        
        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        // Only enable parallax on desktop for performance
        if (window.innerWidth > 768) {
            window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupScrollEffects() {
        // Scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // Trigger custom animations based on element type
                    this.triggerCustomAnimation(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements for scroll animations
        document.querySelectorAll('.trust-card, .category-card, .featured-product-card').forEach(el => {
            observer.observe(el);
        });
        
        // Navbar scroll behavior
        this.setupNavbarScroll();
    }
    
    setupNavbarScroll() {
        let lastScrollY = window.scrollY;
        let scrollTimeout;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.navbar-v2');
            
            if (!navbar) return;
            
            // Hide/show navbar based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('navbar-hidden');
            } else {
                navbar.classList.remove('navbar-hidden');
            }
            
            // Add background on scroll
            if (currentScrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            
            lastScrollY = currentScrollY;
        };
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateNavbar, 10);
        }, { passive: true });
    }
    
    setupPerformanceOptimizations() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize scroll performance
        this.optimizeScrollPerformance();
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // WebP support detection
                        if (this.supportsWebP() && !img.src.includes('.svg')) {
                            const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                            this.loadImageWithFallback(img, webpSrc, img.src);
                        }
                        
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    supportsWebP() {
        if (this.webpSupport !== undefined) {
            return this.webpSupport;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this.webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        return this.webpSupport;
    }
    
    loadImageWithFallback(img, webpSrc, fallbackSrc) {
        const webpImg = new Image();
        webpImg.onload = () => img.src = webpSrc;
        webpImg.onerror = () => img.src = fallbackSrc;
        webpImg.src = webpSrc;
    }
    
    preloadCriticalResources() {
        const criticalResources = [
            '/css/main.css',
            '/css/homepage-v2.css',
            '/js/swiper-setup.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
    
    optimizeScrollPerformance() {
        // Throttle scroll events for better performance
        let scrollTicking = false;
        
        const optimizedScrollHandler = () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    // Update scroll-dependent elements
                    this.updateScrollDependentElements();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };
        
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }
    
    updateScrollDependentElements() {
        const scrollY = window.pageYOffset;
        
        // Update CSS custom property for use in CSS
        document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
        
        // Update reading progress if present
        const progressBar = document.querySelector('.reading-progress');
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = `${scrolled}%`;
        }
    }
    
    setupAccessibility() {
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();
        
        // ARIA live regions for dynamic content
        this.setupAriaLiveRegions();
        
        // Focus management
        this.setupFocusManagement();
    }
    
    setupKeyboardNavigation() {
        // Skip to main content link
        this.createSkipLink();
        
        // Enhanced focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    createSkipLink() {
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Saltar para o conteúdo principal';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    setupAriaLiveRegions() {
        // Create live region for announcements
        if (!document.querySelector('#announcement-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'announcement-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }
    }
    
    setupFocusManagement() {
        // Trap focus in modals when they're open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals/dropdowns
                this.closeAllModals();
            }
        });
    }
    
    triggerCustomAnimation(element) {
        // Custom animations based on element class
        if (element.classList.contains('trust-card')) {
            this.animateTrustCard(element);
        } else if (element.classList.contains('category-card')) {
            this.animateCategoryCard(element);
        }
    }
    
    animateTrustCard(card) {
        const icon = card.querySelector('.trust-icon');
        if (icon) {
            icon.style.animation = 'pulse 0.6s ease-out';
        }
    }
    
    animateCategoryCard(card) {
        const overlay = card.querySelector('.category-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeInUp 0.6s ease-out';
        }
    }
    
    // Utility Methods
    showLoading(section) {
        const container = document.getElementById(`${section}ProductsWrapper`) || 
                         document.getElementById(`${section}Grid`);
        
        if (container) {
            container.innerHTML = this.getSkeletonLoader(section);
        }
    }
    
    getSkeletonLoader(section) {
        const skeletonCount = section === 'featured' ? 4 : 6;
        return Array(skeletonCount).fill().map(() => `
            <div class="swiper-slide">
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showErrorState(section) {
        const container = document.getElementById(`${section}ProductsWrapper`) || 
                         document.getElementById(`${section}Grid`);
        
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar conteúdo</p>
                    <button onclick="location.reload()" class="btn-retry">Tentar Novamente</button>
                </div>
            `;
        }
    }
    
    showErrorFallback() {
        // Show basic fallback content if JavaScript fails
        document.body.classList.add('js-error');
        console.error('Homepage failed to initialize. Fallback content displayed.');
    }
    
    closeAllModals() {
        // Close any open modals/dropdowns
        document.querySelectorAll('.modal.active, .dropdown.active').forEach(el => {
            el.classList.remove('active');
        });
    }
    
    // Analytics & Tracking
    trackWhatsAppClick(productId, section) {
        // Track WhatsApp clicks for analytics
        if (window.gtag) {
            gtag('event', 'whatsapp_click', {
                product_id: productId,
                section: section,
                page: 'homepage'
            });
        }
        
        console.log(`WhatsApp clicked: Product ${productId} from ${section}`);
    }
    
    navigateToCategory(categoryId) {
        // Navigate to category page
        window.location.href = `/catalog?category=${categoryId}`;
        
        // Track category click
        if (window.gtag) {
            gtag('event', 'category_click', {
                category_id: categoryId,
                page: 'homepage'
            });
        }
    }
}

// Global functions for inline handlers
window.navigateToCategory = (categoryId) => {
    if (window.homepageV2) {
        window.homepageV2.navigateToCategory(categoryId);
    }
};

window.trackWhatsAppClick = (productId, section) => {
    if (window.homepageV2) {
        window.homepageV2.trackWhatsAppClick(productId, section);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage
    if (document.body.classList.contains('homepage-v2')) {
        window.homepageV2 = new HomepageV2();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomepageV2;
}
