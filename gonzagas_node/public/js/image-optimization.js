class ImageOptimizer {
    constructor(options = {}) {
        this.options = {
            // Configurações padrão
            lazyOffset: 50, // Pixels antes de carregar
            placeholderColor: '#f0f0f0',
            fadeInDuration: 300,
            retryAttempts: 3,
            quality: {
                thumbnail: 0.7,
                medium: 0.8,
                large: 0.9
            },
            sizes: {
                thumbnail: { width: 200, height: 200 },
                medium: { width: 600, height: 600 },
                large: { width: 1200, height: 1200 }
            },
            ...options
        };

        this.observer = null;
        this.webpSupported = null;
        this.init();
    }

    async init() {
        // 1. Detectar suporte WebP
        this.webpSupported = await this.detectWebPSupport();
        document.documentElement.classList.add(
            this.webpSupported ? 'webp-supported' : 'webp-not-supported'
        );

        // 2. Inicializar lazy loading
        this.initLazyLoading();

        // 3. Adicionar progressive loading para imagens existentes
        this.enhanceExistingImages();

        // 4. Bind eventos
        this.bindEvents();
    }

    // DETECÇÃO WebP
    async detectWebPSupport() {
        return new Promise((resolve) => {
            const webp = new Image();
            webp.onload = webp.onerror = () => {
                resolve(webp.height === 2);
            };
            webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // LAZY LOADING IMPLEMENTATION
    initLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback para browsers antigos
            this.loadAllImages();
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: `${this.options.lazyOffset}px`,
            threshold: 0.01
        });

        // Observar todas as imagens lazy
        document.querySelectorAll('img[data-src], img[data-lazy]').forEach(img => {
            this.observer.observe(img);
        });
    }

    // CARREGAR IMAGEM COM RETRY
    async loadImage(img) {
        const originalSrc = img.dataset.src || img.dataset.lazy;
        if (!originalSrc) return;

        // Mostrar loading state
        img.classList.add('image-loading');

        try {
            // Escolher formato otimizado
            const optimizedSrc = this.getOptimizedSrc(originalSrc, img);

            // Carregar imagem
            await this.loadWithRetry(img, optimizedSrc);

            // Fade in effect
            img.style.opacity = '0';
            img.src = optimizedSrc;
            img.classList.remove('lazy', 'image-loading');
            img.classList.add('image-loaded');

            // Fade in
            img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
            img.style.opacity = '1';

        } catch (error) {
            console.error('Failed to load image:', originalSrc, error);
            // Fallback para imagem original
            img.src = originalSrc;
            img.classList.remove('lazy', 'image-loading');
            img.classList.add('image-error');
        }
    }

    // OTIMIZAÇÃO DE SRC BASEADA EM CONTEXTO
    getOptimizedSrc(src, img) {
        // Se WebP não suportado, retornar original
        if (!this.webpSupported) {
            return src;
        }

        // Determinar tamanho necessário baseado no contexto
        const imgRect = img.getBoundingClientRect();
        const imgWidth = Math.max(imgRect.width, img.width || 0);

        let targetSize = 'medium';
        if (imgWidth <= 250) {
            targetSize = 'thumbnail';
        } else if (imgWidth <= 800) {
            targetSize = 'medium';
        } else {
            targetSize = 'large';
        }

        // Verificar se imagem já está no formato otimizado
        if (src.includes('.webp')) {
            return src;
        }

        // Verificar classes do elemento para determinar tamanho
        if (img.classList.contains('thumbnail') || img.closest('.thumbnail')) {
            targetSize = 'thumbnail';
        } else if (img.classList.contains('gallery-image')) {
            targetSize = 'large';
        }

        return src;
    }

    // CARREGAR COM RETRY
    loadWithRetry(img, src, attempts = 0) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();

            tempImg.onload = () => {
                resolve(tempImg);
            };

            tempImg.onerror = () => {
                if (attempts < this.options.retryAttempts) {
                    // Retry após delay
                    setTimeout(() => {
                        this.loadWithRetry(img, src, attempts + 1)
                            .then(resolve)
                            .catch(reject);
                    }, 1000 * (attempts + 1)); // Delay progressivo
                } else {
                    reject(new Error('Failed to load after retries'));
                }
            };

            tempImg.src = src;
        });
    }

    // MELHORAR IMAGENS EXISTENTES
    enhanceExistingImages() {
        document.querySelectorAll('img:not([data-src]):not([data-lazy])').forEach(img => {
            // Adicionar fade-in para imagens que já carregaram
            if (img.complete) {
                img.style.transition = 'opacity 0.3s ease';
                img.classList.add('image-loaded');
            } else {
                img.addEventListener('load', () => {
                    img.style.transition = 'opacity 0.3s ease';
                    img.classList.add('image-loaded');
                });
            }
        });
    }

    // FALLBACK PARA BROWSERS ANTIGOS
    loadAllImages() {
        document.querySelectorAll('img[data-src], img[data-lazy]').forEach(img => {
            const src = img.dataset.src || img.dataset.lazy;
            if (src) {
                img.src = src;
                img.classList.remove('lazy');
                img.classList.add('image-loaded');
            }
        });
    }

    // BIND EVENTOS
    bindEvents() {
        // Reobservar imagens adicionadas dinamicamente
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'IMG' && (node.dataset.src || node.dataset.lazy)) {
                        if (this.observer) {
                            this.observer.observe(node);
                        }
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Handle resize para recarregar imagens com tamanho diferente
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 500);
        });
    }

    // HANDLE RESIZE
    handleResize() {
        // Recarregar imagens que podem precisar de tamanho diferente
        document.querySelectorAll('img.image-loaded').forEach(img => {
            const currentSrc = img.src;
            const originalSrc = img.dataset.originalSrc || currentSrc;
            const newOptimizedSrc = this.getOptimizedSrc(originalSrc, img);

            if (newOptimizedSrc !== currentSrc) {
                // Carregar novo tamanho se necessário
                this.loadImage(img);
            }
        });
    }

    // API PÚBLICA

    // Observar nova imagem
    observeImage(img) {
        if (this.observer && (img.dataset.src || img.dataset.lazy)) {
            this.observer.observe(img);
        }
    }

    // Forçar carregamento de uma imagem
    forceLoad(img) {
        if (img.dataset.src || img.dataset.lazy) {
            this.loadImage(img);
        }
    }

    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// CSS INJECTION para estados de loading
const imageOptimizerCSS = `
/* Image loading states */
img.lazy {
    opacity: 0.3;
    background-color: #f0f0f0;
    background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
}

img.image-loading {
    opacity: 0.5;
    filter: blur(2px);
}

img.image-loaded {
    opacity: 1;
    filter: none;
}

img.image-error {
    opacity: 0.7;
    background-color: #f8f9fa;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="%23adb5bd" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>') no-repeat center;
    background-size: 24px 24px;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* Progressive image enhancement */
.image-container {
    position: relative;
    overflow: hidden;
}

.image-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%),
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%);
    background-size: 8px 8px;
    background-position: 0 0, 4px 4px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-container img.lazy::before {
    opacity: 1;
}

/* Responsive image utilities */
.img-responsive {
    max-width: 100%;
    height: auto;
}

.img-cover {
    object-fit: cover;
}

.img-contain {
    object-fit: contain;
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = imageOptimizerCSS;
    document.head.appendChild(style);
}

// AUTO-INITIALIZE
let imageOptimizer;
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        imageOptimizer = new ImageOptimizer({
            // Configurações específicas para Gonzaga's
            lazyOffset: 100, // Carregar 100px antes
            fadeInDuration: 400,
            retryAttempts: 2
        });

        // Disponibilizar globalmente para outros scripts
        window.ImageOptimizer = imageOptimizer;
    });
}

// EXPORT para usar em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageOptimizer;
}

