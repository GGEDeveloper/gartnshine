/**
 * Swiper Configuration for Homepage V2
 * Optimized for touch devices and accessibility
 */

class SwiperSetup {
    constructor() {
        this.swipers = {};
        this.init();
    }
    
    init() {
        // Wait for Swiper library to load
        if (typeof Swiper !== 'undefined') {
            this.initializeSwipers();
        } else {
            // Retry if Swiper not loaded yet
            setTimeout(() => this.init(), 100);
        }
    }
    
    initializeSwipers() {
        this.initFeaturedSwiper();
        this.initProductsSwiper();
        
        // Reinitialize on window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    initFeaturedSwiper() {
        const featuredElement = document.querySelector('.featured-swiper');
        if (!featuredElement) return;
        
        this.swipers.featured = new Swiper('.featured-swiper', {
            // Basic settings
            slidesPerView: 1,
            spaceBetween: 0,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            
            // Effects
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            },
            
            // Pagination
            pagination: {
                el: '.featured-swiper .swiper-pagination',
                clickable: true,
                dynamicBullets: true
            },
            
            // Accessibility
            a11y: {
                prevSlideMessage: 'Produto anterior',
                nextSlideMessage: 'Próximo produto',
                paginationBulletMessage: 'Ir para produto {{index}}'
            },
            
            // Keyboard
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            
            // Touch settings
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            
            // Performance
            watchOverflow: true,
            observer: true,
            observeParents: true
        });
    }
    
    initProductsSwiper() {
        const productsElement = document.querySelector('.products-swiper');
        if (!productsElement) return;
        
        this.swipers.products = new Swiper('.products-swiper', {
            // Responsive slides
            slidesPerView: 1.2,
            spaceBetween: 20,
            centeredSlides: false,
            
            // Responsive breakpoints
            breakpoints: {
                480: {
                    slidesPerView: 1.5,
                    spaceBetween: 24
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 24
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                },
                1280: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            },
            
            // Navigation
            navigation: {
                nextEl: '.products-next',
                prevEl: '.products-prev'
            },
            
            // Pagination
            pagination: {
                el: '.products-pagination',
                clickable: true,
                dynamicBullets: true
            },
            
            // Accessibility
            a11y: {
                prevSlideMessage: 'Produtos anteriores',
                nextSlideMessage: 'Próximos produtos',
                paginationBulletMessage: 'Ir para página {{index}}'
            },
            
            // Keyboard
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            
            // Touch settings
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            
            // Smooth scrolling
            freeMode: false,
            freeModeSticky: true,
            
            // Performance
            watchOverflow: true,
            observer: true,
            observeParents: true,
            
            // Events
            on: {
                init: () => {
                    this.updateNavigationState();
                },
                slideChange: () => {
                    this.updateNavigationState();
                }
            }
        });
    }
    
    updateNavigationState() {
        // Update navigation button states
        const productsSwiper = this.swipers.products;
        if (!productsSwiper) return;
        
        const prevBtn = document.querySelector('.products-prev');
        const nextBtn = document.querySelector('.products-next');
        
        if (prevBtn) {
            prevBtn.classList.toggle('swiper-button-disabled', productsSwiper.isBeginning);
        }
        
        if (nextBtn) {
            nextBtn.classList.toggle('swiper-button-disabled', productsSwiper.isEnd);
        }
    }
    
    handleResize() {
        // Reinitialize swipers on significant resize
        Object.values(this.swipers).forEach(swiper => {
            if (swiper && swiper.update) {
                swiper.update();
            }
        });
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Destroy swipers (for cleanup)
    destroy() {
        Object.values(this.swipers).forEach(swiper => {
            if (swiper && swiper.destroy) {
                swiper.destroy(true, true);
            }
        });
        this.swipers = {};
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('homepage-v2')) {
        window.swiperSetup = new SwiperSetup();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.swiperSetup) {
        window.swiperSetup.destroy();
    }
});
