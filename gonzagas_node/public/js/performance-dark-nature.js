// =============================================
// GONZAGA ART & SHINE - PERFORMANCE OPTIMIZER
// Dark Nature Theme - Progressive Enhancement
// =============================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalImages();
        this.optimizeScrolling();
        this.prefetchLinks();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    loadImage(img) {
        const src = img.dataset.src || img.src;
        
        // Create WebP version if supported
        if (this.supportsWebP()) {
            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            const testImg = new Image();
            testImg.onload = () => img.src = webpSrc;
            testImg.onerror = () => img.src = src;
            testImg.src = webpSrc;
        } else {
            img.src = src;
        }
    }

    supportsWebP() {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }

    preloadCriticalImages() {
        const criticalImages = [
            '/images/backgrounds/onyx-hero-bg.jpg',
            '/images/backgrounds/tiger-eye-hero-bg.jpg',
            '/images/backgrounds/amethyst-hero-bg.jpg',
            '/images/backgrounds/turquoise-hero-bg.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    optimizeScrolling() {
        let ticking = false;

        const updateScroll = () => {
            const scrollY = window.pageYOffset;
            const heroes = document.querySelectorAll('.hero');
            
            heroes.forEach(hero => {
                const speed = 0.5;
                hero.style.transform = `translateY(${scrollY * speed}px)`;
            });

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    prefetchLinks() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    if (link.href) {
                        this.prefetchLink(link.href);
                        observer.unobserve(link);
                    }
                }
            });
        });

        document.querySelectorAll('a[href^="/"]').forEach(link => {
            observer.observe(link);
        });
    }

    prefetchLink(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
});

