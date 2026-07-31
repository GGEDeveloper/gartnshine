/**
 * Mobile Navigation V2 - Enhanced Mobile & Touch Experience
 * Gonzaga's Art & Shine
 */

class MobileNavigationV2 {
    constructor() {
        this.navbar = document.querySelector('.navbar-v2');
        this.mobileToggle = document.querySelector('.mobile-nav-toggle');
        this.mobileOverlay = document.querySelector('.mobile-nav-overlay');
        this.mobileContent = document.querySelector('.mobile-nav-content');
        this.searchInput = document.querySelector('.search-input-v2');
        this.mobileSearchInput = document.querySelector('.search-input-mobile');
        
        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.scrollTimeout = null;
        this.searchTimeout = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupScrollBehavior();
        this.setupSearchFunctionality();
        this.setupTouchGestures();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
        this.loadNavigationData();
    }
    
    bindEvents() {
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        // Close menu on overlay click
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', (e) => {
                if (e.target === this.mobileOverlay) {
                    this.closeMobileMenu();
                }
            });
        }
        
        // Close button
        const closeBtn = document.querySelector('.mobile-nav-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Dropdown menus (desktop)
        this.setupDropdownMenus();
        
        // Expandable mobile menu items
        this.setupExpandableMenus();
        
        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    setupDropdownMenus() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            let hideTimeout;
            
            if (!trigger || !menu) return;
            
            // Desktop hover behavior
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth >= 768) {
                    clearTimeout(hideTimeout);
                    this.showDropdown(dropdown, menu);
                }
            });
            
            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth >= 768) {
                    hideTimeout = setTimeout(() => {
                        this.hideDropdown(dropdown, menu);
                    }, 150);
                }
            });
            
            // Click behavior for mobile
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    this.toggleDropdown(dropdown, menu);
                }
            });
            
            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDropdown(dropdown, menu);
                }
            });
        });
    }
    
    setupExpandableMenus() {
        const expandableItems = document.querySelectorAll('.mobile-menu-item.expandable');
        
        expandableItems.forEach(item => {
            const trigger = item.querySelector('.mobile-menu-trigger');
            const submenu = item.querySelector('.mobile-submenu');
            
            if (!trigger || !submenu) return;
            
            trigger.addEventListener('click', () => {
                this.toggleExpandableMenu(item, submenu);
            });
        });
    }
    
    setupScrollBehavior() {
        const updateNavbar = () => {
            const currentScrollY = window.pageYOffset;
            
            // Only apply scroll behavior on larger screens
            if (window.innerWidth >= 768) {
                // Hide/show navbar based on scroll direction
                if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                    this.navbar.classList.add('navbar-hidden');
                } else {
                    this.navbar.classList.remove('navbar-hidden');
                }
            }
            
            // Add scrolled class for styling
            if (currentScrollY > 50) {
                this.navbar.classList.add('navbar-scrolled');
            } else {
                this.navbar.classList.remove('navbar-scrolled');
            }
            
            // Update reading progress
            this.updateReadingProgress(currentScrollY);
            
            this.lastScrollY = currentScrollY;
        };
        
        window.addEventListener('scroll', () => {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(updateNavbar, 10);
        }, { passive: true });
    }
    
    setupSearchFunctionality() {
        // Desktop search
        if (this.searchInput) {
            this.setupSearchInput(this.searchInput, '.search-results-nav');
        }
        
        // Mobile search
        if (this.mobileSearchInput) {
            this.setupSearchInput(this.mobileSearchInput, '.mobile-search-results');
        }
    }
    
    setupSearchInput(input, resultsSelector) {
        input.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(query, resultsSelector);
                }, 300);
            } else {
                this.hideSearchResults(resultsSelector);
            }
        });
        
        input.addEventListener('focus', () => {
            if (input.value.trim().length >= 2) {
                this.showSearchResults(resultsSelector);
            }
        });
        
        input.addEventListener('blur', (e) => {
            // Delay hiding to allow clicks on results
            setTimeout(() => {
                this.hideSearchResults(resultsSelector);
            }, 200);
        });
    }
    
    setupTouchGestures() {
        if (!('ontouchstart' in window)) return;
        
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        
        // Touch start
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }, { passive: true });
        
        // Touch end
        document.addEventListener('touchend', () => {
            if (!startX || !currentX) return;
            
            const deltaX = currentX - startX;
            const deltaY = Math.abs(currentY - startY);
            
            // Horizontal swipe detection (more horizontal than vertical)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                // Swipe from right edge to open menu
                if (startX > window.innerWidth - 50 && deltaX < -50 && !this.isMenuOpen) {
                    this.openMobileMenu();
                }
                // Swipe right to close menu
                else if (this.isMenuOpen && deltaX > 50) {
                    this.closeMobileMenu();
                }
            }
            
            // Reset values
            startX = startY = currentX = currentY = 0;
        }, { passive: true });
    }
    
    setupKeyboardNavigation() {
        // Tab trap for mobile menu
        if (this.mobileContent) {
            this.mobileContent.addEventListener('keydown', (e) => {
                if (!this.isMenuOpen || e.key !== 'Tab') return;
                
                const focusableElements = this.mobileContent.querySelectorAll(
                    'a, button, input, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }
    
    setupAccessibility() {
        // Update ARIA attributes
        if (this.mobileToggle) {
            this.mobileToggle.setAttribute('aria-expanded', 'false');
        }
        
        if (this.mobileOverlay) {
            this.mobileOverlay.setAttribute('aria-hidden', 'true');
        }
        
        // Announce menu state changes
        this.createLiveRegion();
    }
    
    createLiveRegion() {
        if (document.getElementById('nav-live-region')) return;
        
        const liveRegion = document.createElement('div');
        liveRegion.id = 'nav-live-region';
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
    
    async loadNavigationData() {
        try {
            // Load featured products for navigation menu
            const response = await fetch('/api/nav-featured');
            const data = await response.json();
            
            if (data.success) {
                this.renderNavFeatured(data.data);
            }
        } catch (error) {
            console.error('Failed to load navigation data:', error);
        }
    }
    
    renderNavFeatured(products) {
        const container = document.getElementById('navFeaturedProducts');
        if (!container || !products.length) return;
        
        container.innerHTML = products.map(product => `
            <a href="/loja/produto/${product.id}" class="featured-mini-item">
                <div class="featured-mini-image">
                    <img src="${product.main_image ? `/uploads/products/${product.main_image}` : '/images/imagem-nao-disponivel.svg'}" 
                         alt="${product.name}" loading="lazy">
                </div>
                <div class="featured-mini-info">
                    <div class="featured-mini-name">${product.name}</div>
                    <div class="featured-mini-price">
                        ${product.sale_price ? `€${parseFloat(product.sale_price).toFixed(2)}` : 'Sob consulta'}
                    </div>
                </div>
            </a>
        `).join('');
    }
    
    async performSearch(query, resultsSelector) {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            this.displaySearchResults(data, resultsSelector, query);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }
    
    displaySearchResults(results, resultsSelector, query) {
        let container = document.querySelector(resultsSelector);
        
        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.className = resultsSelector.replace('.', '');
            
            const searchContainer = document.querySelector('.search-container-nav, .search-container-mobile');
            if (searchContainer) {
                searchContainer.appendChild(container);
            }
        }
        
        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="nav-search-item">
                    <div class="nav-search-info">
                        <div class="nav-search-name">Nenhum resultado para "${query}"</div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = results.map(product => `
                <a href="/loja/produto/${product.id}" class="nav-search-item">
                    <div class="nav-search-image">
                        <img src="${product.image_url || '/images/imagem-nao-disponivel.svg'}" 
                             alt="${product.name}" loading="lazy">
                    </div>
                    <div class="nav-search-info">
                        <div class="nav-search-name">${this.highlightMatch(product.name, query)}</div>
                        <div class="nav-search-price">${product.price_formatted}</div>
                    </div>
                </a>
            `).join('');
        }
        
        this.showSearchResults(resultsSelector);
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    showSearchResults(selector) {
        const container = document.querySelector(selector);
        if (container) {
            container.classList.add('show');
        }
    }
    
    hideSearchResults(selector) {
        const container = document.querySelector(selector);
        if (container) {
            container.classList.remove('show');
        }
    }
    
    // Menu Management Methods
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (this.isMenuOpen) return;
        
        this.isMenuOpen = true;
        
        // Update classes and attributes
        this.mobileOverlay.classList.add('active');
        this.mobileToggle.classList.add('active');
        document.body.classList.add('menu-open');
        
        // Update ARIA
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        this.mobileOverlay.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const firstFocusable = this.mobileContent.querySelector('input, a, button');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
        
        // Announce to screen readers
        this.announce('Menu aberto');
    }
    
    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        
        // Update classes and attributes
        this.mobileOverlay.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Update ARIA
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.mobileOverlay.setAttribute('aria-hidden', 'true');
        
        // Return focus to toggle button
        this.mobileToggle.focus();
        
        // Announce to screen readers
        this.announce('Menu fechado');
    }
    
    showDropdown(dropdown, menu) {
        dropdown.classList.add('active');
        menu.setAttribute('aria-hidden', 'false');
    }
    
    hideDropdown(dropdown, menu) {
        dropdown.classList.remove('active');
        menu.setAttribute('aria-hidden', 'true');
    }
    
    toggleDropdown(dropdown, menu) {
        const isActive = dropdown.classList.contains('active');
        
        // Close all other dropdowns first
        document.querySelectorAll('.dropdown.active').forEach(d => {
            if (d !== dropdown) {
                this.hideDropdown(d, d.querySelector('.dropdown-menu'));
            }
        });
        
        if (isActive) {
            this.hideDropdown(dropdown, menu);
        } else {
            this.showDropdown(dropdown, menu);
        }
    }
    
    toggleExpandableMenu(item, submenu) {
        const isExpanded = item.classList.contains('expanded');
        
        if (isExpanded) {
            item.classList.remove('expanded');
            submenu.style.maxHeight = '0';
        } else {
            item.classList.add('expanded');
            submenu.style.maxHeight = submenu.scrollHeight + 'px';
        }
    }
    
    updateReadingProgress(scrollY) {
        const progressBar = document.querySelector('.reading-progress');
        if (!progressBar) return;
        
        const winScroll = scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (winScroll / height) * 100;
        
        progressBar.style.width = Math.min(scrolled, 100) + '%';
    }
    
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Close all dropdowns on resize
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            this.hideDropdown(dropdown, dropdown.querySelector('.dropdown-menu'));
        });
    }
    
    announce(message) {
        const liveRegion = document.getElementById('nav-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    // Utility function
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
    
    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        clearTimeout(this.scrollTimeout);
        clearTimeout(this.searchTimeout);
        
        document.body.classList.remove('menu-open');
        
        const liveRegion = document.getElementById('nav-live-region');
        if (liveRegion) {
            liveRegion.remove();
        }
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    window.mobileNavigation = new MobileNavigationV2();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.mobileNavigation) {
        window.mobileNavigation.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigationV2;
}
