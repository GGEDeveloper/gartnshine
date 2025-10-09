/* =============================================
   GONZAGA ART & SHINE - PDP JAVASCRIPT
   Product Detail Page Functionality
   ============================================= */

// =============================================
// 1. GALLERY FUNCTIONALITY
// =============================================

/**
 * Change main gallery image
 */
function changeImage(imageSrc, thumbElement) {
    const mainImage = document.getElementById('main-image');
    
    if (!mainImage) return;
    
    // Fade out animation
    mainImage.style.opacity = '0';
    
    setTimeout(() => {
        mainImage.src = imageSrc;
        mainImage.dataset.zoom = imageSrc;
        mainImage.style.opacity = '1';
    }, 200);
    
    // Update active thumbnail
    document.querySelectorAll('.gallery__thumb').forEach(thumb => {
        thumb.classList.remove('gallery__thumb--active');
    });
    
    if (thumbElement) {
        thumbElement.classList.add('gallery__thumb--active');
    }
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'image_view', {
            event_category: 'Product Gallery',
            event_label: imageSrc
        });
    }
}

/**
 * Initialize zoom functionality
 */
function initializeZoom() {
    const mainImage = document.getElementById('main-image');
    const galleryMain = document.querySelector('.gallery__main');
    
    if (!mainImage || !galleryMain) return;
    
    mainImage.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.style.transformOrigin = `${x}% ${y}%`;
    });
    
    mainImage.addEventListener('mouseleave', function() {
        this.style.transformOrigin = 'center center';
    });
}

/**
 * Keyboard navigation for gallery
 */
function initializeKeyboardNav() {
    const thumbnails = Array.from(document.querySelectorAll('.gallery__thumb'));
    
    if (thumbnails.length === 0) return;
    
    document.addEventListener('keydown', function(e) {
        const activeFocusedElement = document.activeElement;
        
        if (!activeFocusedElement || !activeFocusedElement.classList.contains('gallery__thumb')) {
            return;
        }
        
        const currentIndex = thumbnails.indexOf(activeFocusedElement);
        
        if (e.key === 'ArrowRight' && currentIndex < thumbnails.length - 1) {
            e.preventDefault();
            thumbnails[currentIndex + 1].focus();
            thumbnails[currentIndex + 1].click();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            thumbnails[currentIndex - 1].focus();
            thumbnails[currentIndex - 1].click();
        }
    });
}

// =============================================
// 2. QUANTITY SELECTOR
// =============================================

/**
 * Increment quantity
 */
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let currentValue = parseInt(quantityInput.value) || 1;
    const maxValue = parseInt(quantityInput.max) || 10;
    
    if (currentValue < maxValue) {
        quantityInput.value = currentValue + 1;
    }
}

/**
 * Decrement quantity
 */
function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let currentValue = parseInt(quantityInput.value) || 1;
    const minValue = parseInt(quantityInput.min) || 1;
    
    if (currentValue > minValue) {
        quantityInput.value = currentValue - 1;
    }
}

// =============================================
// 3. ADD TO CART FUNCTIONALITY
// =============================================

/**
 * Add product to cart
 */
function addToCart(productId, productName) {
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    const button = document.querySelector('.btn--add-to-cart');
    
    if (!button) return;
    
    // Visual feedback
    const originalText = button.querySelector('.btn__text').textContent;
    button.querySelector('.btn__text').textContent = 'Adicionado à Alma!';
    button.classList.add('added');
    button.disabled = true;
    
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('gonzagas_cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            id: productId,
            name: productName,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save cart
    localStorage.setItem('gonzagas_cart', JSON.stringify(cart));
    
    // Update cart counter in header (if exists)
    updateCartCounter();
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'EUR',
            value: 0, // Real value would come from product data
            items: [{
                item_id: productId,
                item_name: productName,
                quantity: quantity
            }]
        });
    }
    
    // Show notification (could be improved with a toast system)
    console.log(`Added ${quantity}x ${productName} to cart`);
    
    // Reset button after delay
    setTimeout(() => {
        button.querySelector('.btn__text').textContent = originalText;
        button.classList.remove('added');
        button.disabled = false;
        
        // Reset quantity to 1
        if (quantityInput) {
            quantityInput.value = 1;
        }
    }, 2000);
}

/**
 * Update cart counter in header
 */
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('gonzagas_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find cart counter element (adjust selector based on your header structure)
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// =============================================
// 4. WISHLIST FUNCTIONALITY
// =============================================

/**
 * Toggle product in wishlist
 */
function toggleWishlist(productId) {
    const button = document.querySelector('.btn--wishlist');
    if (!button) return;
    
    const icon = button.querySelector('.btn__icon');
    
    // Get wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('gonzagas_wishlist') || '[]');
    
    const existingIndex = wishlist.indexOf(productId);
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        icon.textContent = '❤️';
        button.style.borderColor = 'var(--slate)';
        
        console.log(`Removed product ${productId} from wishlist`);
    } else {
        // Add to wishlist
        wishlist.push(productId);
        icon.textContent = '💖';
        button.style.borderColor = 'var(--gold-old)';
        
        console.log(`Added product ${productId} to wishlist`);
    }
    
    // Save wishlist
    localStorage.setItem('gonzagas_wishlist', JSON.stringify(wishlist));
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', existingIndex > -1 ? 'remove_from_wishlist' : 'add_to_wishlist', {
            item_id: productId
        });
    }
}

/**
 * Initialize wishlist state on page load
 */
function initializeWishlistState() {
    const button = document.querySelector('.btn--wishlist');
    if (!button) return;
    
    const productId = document.querySelector('.btn--add-to-cart')?.dataset.productId;
    if (!productId) return;
    
    const wishlist = JSON.parse(localStorage.getItem('gonzagas_wishlist') || '[]');
    
    if (wishlist.includes(productId)) {
        const icon = button.querySelector('.btn__icon');
        icon.textContent = '💖';
        button.style.borderColor = 'var(--gold-old)';
    }
}

// =============================================
// 5. SMOOTH SCROLL TO SECTIONS
// =============================================

/**
 * Smooth scroll to specific section
 */
function scrollToSection(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// =============================================
// 6. IMAGE LAZY LOADING (FALLBACK)
// =============================================

/**
 * Initialize lazy loading for older browsers
 */
function initializeLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        return; // Native lazy loading is supported
    }
    
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Trigger load
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// =============================================
// 7. TOUCH GESTURES FOR MOBILE GALLERY
// =============================================

/**
 * Initialize touch gestures for gallery
 */
function initializeTouchGestures() {
    const galleryMain = document.querySelector('.gallery__main');
    const thumbnails = Array.from(document.querySelectorAll('.gallery__thumb'));
    
    if (!galleryMain || thumbnails.length === 0) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    galleryMain.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    galleryMain.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    }, false);
    
    function handleGesture() {
        const activeThumbnail = document.querySelector('.gallery__thumb--active');
        const currentIndex = thumbnails.indexOf(activeThumbnail);
        
        if (touchEndX < touchStartX - 50 && currentIndex < thumbnails.length - 1) {
            // Swiped left - next image
            thumbnails[currentIndex + 1].click();
        }
        
        if (touchEndX > touchStartX + 50 && currentIndex > 0) {
            // Swiped right - previous image
            thumbnails[currentIndex - 1].click();
        }
    }
}

// =============================================
// 8. INITIALIZATION ON DOM LOADED
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[PDP] Initializing Product Detail Page...');
    
    // Initialize all functionalities
    initializeZoom();
    initializeKeyboardNav();
    initializeLazyLoading();
    initializeTouchGestures();
    initializeWishlistState();
    updateCartCounter();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                scrollToSection(targetId);
            }
        });
    });
    
    // Track time on page
    let timeOnPage = 0;
    const trackingInterval = setInterval(() => {
        timeOnPage += 1;
        
        // Track engagement at 30 seconds
        if (timeOnPage === 30 && typeof gtag !== 'undefined') {
            gtag('event', 'engaged_view', {
                event_category: 'Product Page',
                event_label: document.title,
                value: 30
            });
        }
    }, 1000);
    
    // Clear interval on page unload
    window.addEventListener('beforeunload', function() {
        clearInterval(trackingInterval);
        
        // Track total time on page
        if (typeof gtag !== 'undefined' && timeOnPage > 0) {
            gtag('event', 'page_view_time', {
                event_category: 'Product Page',
                event_label: document.title,
                value: timeOnPage
            });
        }
    });
    
    console.log('[PDP] Initialization complete!');
});

// =============================================
// 9. PERFORMANCE MONITORING (OPTIONAL)
// =============================================

/**
 * Log performance metrics
 */
window.addEventListener('load', function() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;
        
        console.log(`[PDP Performance]`);
        console.log(`Page Load Time: ${pageLoadTime}ms`);
        console.log(`Connect Time: ${connectTime}ms`);
        console.log(`Render Time: ${renderTime}ms`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: 'page_load',
                value: pageLoadTime,
                event_category: 'Performance'
            });
        }
    }
});

// =============================================
// 10. EXPORT FUNCTIONS FOR INLINE USAGE
// =============================================

// Functions that are called inline in EJS are already globally available
// This ensures they're accessible from onclick attributes

console.log('[PDP JavaScript] Loaded successfully!');

