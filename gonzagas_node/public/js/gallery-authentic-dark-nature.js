// =============================================
// GONZAGA ART & SHINE - GALERIA AUTÊNTICA DARK NATURE
// Mineral Journey - Interactive Gallery
// Zero artifícios, só natureza pura
// =============================================

class GalleryAuthenticDarkNature {
    constructor() {
        this.currentFilter = 'all';
        this.specimens = [];
        this.currentSpecimenIndex = 0;
        this.lightboxActive = false;
        
        this.init();
    }
    
    init() {
        this.collectSpecimens();
        this.setupFilters();
        this.setupSpecimenLightbox();
        this.setupKeyboardNavigation();
        this.setupScrollEffects();
        this.bindEvents();
    }
    
    collectSpecimens() {
        const specimenCards = document.querySelectorAll('.specimen-card');
        this.specimens = Array.from(specimenCards).map((card, index) => {
            const img = card.querySelector('.specimen-image');
            const title = card.querySelector('.specimen-card__title');
            const description = card.querySelector('.specimen-card__description');
            const badge = card.querySelector('.specimen-card__badge');
            const category = card.dataset.category;
            const mineral = card.dataset.mineral;
            
            return {
                index,
                element: card,
                src: img?.src || '',
                alt: img?.alt || '',
                title: title?.textContent || '',
                description: description?.textContent || '',
                badge: badge?.textContent || '',
                category,
                mineral,
                meta: this.extractMetadata(card)
            };
        });
    }
    
    extractMetadata(card) {
        const metaItems = card.querySelectorAll('.meta-item, .tradition-item, .ecosystem-item');
        const metadata = {};
        
        metaItems.forEach(item => {
            const label = item.querySelector('.meta-label, .tradition-icon, .ecosystem-label')?.textContent?.trim();
            const value = item.querySelector('.meta-value, .tradition-text, .ecosystem-value')?.textContent?.trim();
            
            if (label && value) {
                metadata[label.replace(':', '')] = value;
            }
        });
        
        return metadata;
    }
    
    setupFilters() {
        const filterButtons = document.querySelectorAll('.journey-nav__btn');
        const specimenCards = document.querySelectorAll('.specimen-card');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter specimens with organic animation
                this.filterSpecimens(specimenCards, filter);
                this.currentFilter = filter;
                
                // Analytics tracking
                this.trackFilterUsage(filter);
            });
        });
    }
    
    filterSpecimens(cards, filter) {
        cards.forEach((card, index) => {
            const category = card.dataset.category;
            const mineral = card.dataset.mineral;
            const shouldShow = filter === 'all' || 
                             category === filter || 
                             mineral === filter;
            
            if (shouldShow) {
                card.style.display = 'block';
                // Organic fade-in animation
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                }, 50);
            } else {
                // Organic fade-out
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px) scale(0.95)';
                
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
    }
    
    setupSpecimenLightbox() {
        const lightbox = document.getElementById('specimen-lightbox');
        const zoomButtons = document.querySelectorAll('.btn-specimen-zoom');
        const closeBtn = lightbox.querySelector('.specimen-lightbox__close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const viewCollectionBtn = lightbox.querySelector('#view-collection');
        const shareBtn = lightbox.querySelector('#share-specimen');
        
        // Open lightbox on specimen zoom
        zoomButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const specimenId = btn.dataset.specimen;
                const specimenIndex = this.findSpecimenIndexById(specimenId) || index;
                this.openSpecimenLightbox(specimenIndex);
            });
        });
        
        // Close lightbox
        closeBtn.addEventListener('click', () => this.closeSpecimenLightbox());
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop-organic')) {
                this.closeSpecimenLightbox();
            }
        });
        
        // Navigation
        prevBtn.addEventListener('click', () => this.previousSpecimen());
        nextBtn.addEventListener('click', () => this.nextSpecimen());
        
        // Actions
        viewCollectionBtn.addEventListener('click', () => this.viewSpecimenCollection());
        shareBtn.addEventListener('click', () => this.shareSpecimen());
    }
    
    findSpecimenIndexById(specimenId) {
        return this.specimens.findIndex(specimen => {
            const cardBtn = specimen.element.querySelector(`[data-specimen="${specimenId}"]`);
            return cardBtn !== null;
        });
    }
    
    openSpecimenLightbox(index) {
        this.currentSpecimenIndex = index;
        const specimen = this.specimens[index];
        const lightbox = document.getElementById('specimen-lightbox');
        
        if (!specimen) return;
        
        // Update lightbox content
        lightbox.querySelector('.specimen-lightbox__image').src = specimen.src;
        lightbox.querySelector('.specimen-lightbox__image').alt = specimen.alt;
        lightbox.querySelector('.specimen-lightbox__title').textContent = specimen.title;
        lightbox.querySelector('.specimen-lightbox__description').textContent = specimen.description;
        
        // Update badge
        const badge = lightbox.querySelector('.specimen-lightbox__badge');
        badge.textContent = specimen.badge;
        badge.className = `specimen-lightbox__badge ${this.getBadgeClass(specimen)}`;
        
        // Update details
        this.updateSpecimenDetails(specimen);
        
        // Show lightbox with organic animation
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.lightboxActive = true;
        
        // Analytics
        this.trackSpecimenView(specimen.title, specimen.mineral);
    }
    
    getBadgeClass(specimen) {
        if (specimen.mineral) {
            return `mineral-badge--${specimen.mineral.replace('-', '_')}`;
        } else if (specimen.category === 'transformacao') {
            return 'process-badge';
        } else if (specimen.category === 'harmonia') {
            return 'harmony-badge';
        }
        return '';
    }
    
    updateSpecimenDetails(specimen) {
        const detailsContainer = document.getElementById('specimen-details');
        let detailsHTML = '';
        
        Object.entries(specimen.meta).forEach(([label, value]) => {
            detailsHTML += `
                <div class="specimen-detail-item">
                    <span class="detail-label">${label}:</span>
                    <span class="detail-value">${value}</span>
                </div>
            `;
        });
        
        detailsContainer.innerHTML = detailsHTML;
    }
    
    closeSpecimenLightbox() {
        const lightbox = document.getElementById('specimen-lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        this.lightboxActive = false;
    }
    
    previousSpecimen() {
        this.currentSpecimenIndex = this.currentSpecimenIndex === 0 
            ? this.specimens.length - 1 
            : this.currentSpecimenIndex - 1;
        this.openSpecimenLightbox(this.currentSpecimenIndex);
    }
    
    nextSpecimen() {
        this.currentSpecimenIndex = this.currentSpecimenIndex === this.specimens.length - 1 
            ? 0 
            : this.currentSpecimenIndex + 1;
        this.openSpecimenLightbox(this.currentSpecimenIndex);
    }
    
    viewSpecimenCollection() {
        const specimen = this.specimens[this.currentSpecimenIndex];
        if (specimen.mineral) {
            window.location.href = `/catalogo?pedra=${specimen.mineral}`;
        } else {
            window.location.href = '/catalogo';
        }
    }
    
    shareSpecimen() {
        const specimen = this.specimens[this.currentSpecimenIndex];
        
        if (navigator.share) {
            navigator.share({
                title: `${specimen.title} - Gonzaga Art & Shine`,
                text: specimen.description,
                url: `${window.location.origin}/galeria#specimen-${this.currentSpecimenIndex}`
            });
        } else {
            // Fallback: copy to clipboard
            const shareText = `${specimen.title} - ${specimen.description}\n${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                // Show temporary notification
                this.showShareNotification();
            });
        }
        
        this.trackSpecimenShare(specimen.title);
    }
    
    showShareNotification() {
        const notification = document.createElement('div');
        notification.className = 'share-notification';
        notification.textContent = 'Link copiado para clipboard!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gold-old);
            color: var(--black);
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxActive) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeSpecimenLightbox();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSpecimen();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSpecimen();
                    break;
                case ' ':
                    e.preventDefault();
                    this.nextSpecimen();
                    break;
            }
        });
    }
    
    setupScrollEffects() {
        // Organic parallax for hero
        const hero = document.querySelector('.gallery-hero.caverna-primordial');
        if (!hero) return;
        
        let ticking = false;
        
        const updateParallax = () => {
            const scrollY = window.pageYOffset;
            const rate = scrollY * -0.3; // Subtle parallax
            
            hero.style.transform = `translateY(${rate}px)`;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        // Only on desktop to avoid performance issues
        if (window.innerWidth > 768) {
            window.addEventListener('scroll', requestTick, { passive: true });
        }
    }
    
    bindEvents() {
        // Smooth anchor navigation
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Organic hover effects for specimen cards
        const specimenCards = document.querySelectorAll('.specimen-card');
        specimenCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.enhanceCardHover(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.resetCardHover(card);
            });
        });
    }
    
    enhanceCardHover(card) {
        // Add subtle glow based on mineral type
        const mineral = card.dataset.mineral;
        const category = card.dataset.category;
        
        if (mineral === 'onix') {
            card.style.boxShadow = '0 25px 50px rgba(17,17,17,0.4), 0 0 30px rgba(17,17,17,0.2)';
        } else if (mineral === 'olho-de-tigre') {
            card.style.boxShadow = '0 25px 50px rgba(107,74,27,0.4), 0 0 30px rgba(107,74,27,0.2)';
        } else if (mineral === 'ametista') {
            card.style.boxShadow = '0 25px 50px rgba(45,27,61,0.4), 0 0 30px rgba(45,27,61,0.2)';
        } else if (mineral === 'turquesa') {
            card.style.boxShadow = '0 25px 50px rgba(27,58,61,0.4), 0 0 30px rgba(27,58,61,0.2)';
        } else if (category === 'transformacao') {
            card.style.boxShadow = '0 25px 50px rgba(176,141,87,0.3), 0 0 30px rgba(176,141,87,0.2)';
        }
    }
    
    resetCardHover(card) {
        card.style.boxShadow = '';
    }
    
    // Analytics Methods
    trackFilterUsage(filter) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'gallery_filter_use', {
                event_category: 'engagement',
                event_label: filter,
                value: 1
            });
        }
    }
    
    trackSpecimenView(title, mineral) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'specimen_lightbox_view', {
                event_category: 'engagement', 
                event_label: `${mineral || 'unknown'}: ${title}`,
                value: 1
            });
        }
    }
    
    trackSpecimenShare(title) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'specimen_share', {
                event_category: 'social',
                event_label: title,
                value: 1
            });
        }
    }
}

// CSS Animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .specimen-detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(110,107,101,0.1);
    }
    
    .detail-label {
        font-weight: 600;
        color: var(--gold-old);
        font-size: 0.9rem;
    }
    
    .detail-value {
        color: var(--slate);
        font-size: 0.9rem;
        text-align: right;
        max-width: 60%;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GalleryAuthenticDarkNature();
});

// Progressive Enhancement
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Gallery assets cached for offline viewing');
    }).catch(() => {
        // Service worker not available, continue without caching
    });
}

