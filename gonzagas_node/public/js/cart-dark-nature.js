/**
 * Dark Nature Shopping Cart System
 * Client-side cart management with localStorage persistence
 */

class DarkNatureCart {
    constructor() {
        this.storageKey = 'darknature_cart';
        this.cart = this.loadCart();
        this.bindEvents();
        this.updateCartBadge();
        
        // If we're on the cart page, update the UI
        if (document.querySelector('.cart-page')) {
            this.updateCartUI();
        }
    }
    
    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('[Cart] Error loading cart:', error);
            return [];
        }
    }
    
    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.updateCartBadge();
            
            // Track cart update in analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cart_update', {
                    cart_size: this.getCartCount(),
                    cart_value: this.getCartTotal()
                });
            }
        } catch (error) {
            console.error('[Cart] Error saving cart:', error);
        }
    }
    
    /**
     * Add item to cart
     */
    addToCart(product) {
        try {
            // Check if product already exists in cart
            const existingIndex = this.cart.findIndex(item => item.productId === product.productId);
            
            if (existingIndex !== -1) {
                // Update quantity
                this.cart[existingIndex].quantity += (product.quantity || 1);
            } else {
                // Add new item
                this.cart.push({
                    productId: product.productId,
                    name: product.name,
                    slug: product.slug,
                    price: parseFloat(product.price),
                    image: product.image,
                    stoneType: product.stoneType,
                    quantity: product.quantity || 1,
                    addedAt: new Date().toISOString()
                });
            }
            
            this.saveCart();
            this.showAddedToCartNotification(product);
            
            // Enhanced E-commerce tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'add_to_cart', {
                    currency: 'EUR',
                    value: parseFloat(product.price),
                    items: [{
                        item_id: product.productId,
                        item_name: product.name,
                        item_category: 'Joalharia Artesanal',
                        item_category2: this.getStoneDisplayName(product.stoneType),
                        price: parseFloat(product.price),
                        quantity: product.quantity || 1
                    }]
                });
            }
            
            console.log('[Cart] Item added:', product.name);
            return true;
            
        } catch (error) {
            console.error('[Cart] Error adding to cart:', error);
            return false;
        }
    }
    
    /**
     * Remove item from cart
     */
    removeFromCart(productId) {
        try {
            const removedItem = this.cart.find(item => item.productId === productId);
            this.cart = this.cart.filter(item => item.productId !== productId);
            this.saveCart();
            this.updateCartUI();
            
            // Track removal in analytics
            if (typeof gtag !== 'undefined' && removedItem) {
                gtag('event', 'remove_from_cart', {
                    currency: 'EUR',
                    value: removedItem.price * removedItem.quantity,
                    items: [{
                        item_id: removedItem.productId,
                        item_name: removedItem.name,
                        price: removedItem.price,
                        quantity: removedItem.quantity
                    }]
                });
            }
            
            console.log('[Cart] Item removed:', productId);
            return true;
            
        } catch (error) {
            console.error('[Cart] Error removing from cart:', error);
            return false;
        }
    }
    
    /**
     * Update item quantity
     */
    updateQuantity(productId, newQuantity) {
        try {
            const item = this.cart.find(item => item.productId === productId);
            if (item) {
                item.quantity = parseInt(newQuantity);
                if (item.quantity <= 0) {
                    this.removeFromCart(productId);
                } else {
                    this.saveCart();
                    this.updateCartUI();
                }
            }
            return true;
        } catch (error) {
            console.error('[Cart] Error updating quantity:', error);
            return false;
        }
    }
    
    /**
     * Get cart total
     */
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    /**
     * Get cart item count
     */
    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }
    
    /**
     * Clear cart
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        console.log('[Cart] Cart cleared');
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            // Add to cart from product page
            if (e.target.matches('[data-add-to-cart]') || e.target.closest('[data-add-to-cart]')) {
                e.preventDefault();
                const btn = e.target.matches('[data-add-to-cart]') ? e.target : e.target.closest('[data-add-to-cart]');
                this.handleAddToCart(btn);
            }
            
            // Remove from cart
            if (e.target.matches('[data-remove-cart-item]') || e.target.closest('[data-remove-cart-item]')) {
                e.preventDefault();
                const btn = e.target.matches('[data-remove-cart-item]') ? e.target : e.target.closest('[data-remove-cart-item]');
                const productId = btn.dataset.removeCartItem || btn.closest('[data-remove-cart-item]').dataset.removeCartItem;
                this.removeFromCart(parseInt(productId));
            }
            
            // Clear cart
            if (e.target.matches('[data-clear-cart]')) {
                e.preventDefault();
                if (confirm('Tem a certeza que deseja limpar o carrinho?')) {
                    this.clearCart();
                }
            }
        });
        
        // Quantity changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-cart-quantity]')) {
                const productId = e.target.dataset.productId;
                const newQuantity = e.target.value;
                this.updateQuantity(parseInt(productId), newQuantity);
            }
        });
    }
    
    /**
     * Handle add to cart button click
     */
    handleAddToCart(btn) {
        const product = {
            productId: parseInt(btn.dataset.productId),
            name: btn.dataset.productName,
            slug: btn.dataset.productSlug,
            price: btn.dataset.productPrice,
            image: btn.dataset.productImage,
            stoneType: btn.dataset.stoneType,
            quantity: 1
        };
        
        if (product.productId && product.name && product.price) {
            this.addToCart(product);
        } else {
            console.error('[Cart] Invalid product data:', product);
        }
    }
    
    /**
     * Update cart badge in header
     */
    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        const count = this.getCartCount();
        
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    /**
     * Update cart page UI
     */
    updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const emptyState = document.getElementById('cart-empty');
        const cartContent = document.getElementById('cart-content');
        
        if (!cartItems) return;
        
        // Show/hide empty state
        if (this.cart.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            if (cartContent) cartContent.style.display = 'none';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        if (cartContent) cartContent.style.display = 'grid';
        
        // Render cart items
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.productId}">
                <div class="cart-item-image">
                    <a href="/produto/${item.slug}">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </a>
                </div>
                <div class="cart-item-details">
                    <a href="/produto/${item.slug}" class="cart-item-name">${item.name}</a>
                    <div class="cart-item-stone">
                        <span class="stone-badge badge-${item.stoneType}">${this.getStoneDisplayName(item.stoneType)}</span>
                    </div>
                    <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <label for="qty-${item.productId}" class="sr-only">Quantidade</label>
                    <input 
                        type="number" 
                        id="qty-${item.productId}"
                        min="1" 
                        max="10" 
                        value="${item.quantity}" 
                        data-cart-quantity 
                        data-product-id="${item.productId}"
                        class="qty-input"
                    >
                </div>
                <div class="cart-item-total">
                    €${(item.price * item.quantity).toFixed(2)}
                </div>
                <button 
                    class="cart-item-remove" 
                    data-remove-cart-item="${item.productId}"
                    aria-label="Remover ${item.name} do carrinho"
                    title="Remover item"
                >
                    <span>×</span>
                </button>
            </div>
        `).join('');
        
        // Update totals
        const subtotal = this.getCartTotal();
        const shipping = subtotal >= 75 ? 0 : 5.99;
        const total = subtotal + shipping;
        
        const subtotalEl = document.getElementById('cart-subtotal');
        const shippingEl = document.getElementById('cart-shipping');
        const totalEl = document.getElementById('cart-total');
        
        if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 ? 'Grátis' : `€${shipping.toFixed(2)}`;
        }
        if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
        
        // Show/hide free shipping progress
        const freeShippingProgress = document.querySelector('.free-shipping-progress');
        if (freeShippingProgress && subtotal < 75) {
            const remaining = 75 - subtotal;
            const progressBar = freeShippingProgress.querySelector('.progress-bar');
            const progressText = freeShippingProgress.querySelector('.progress-text');
            
            if (progressBar) {
                const percentage = (subtotal / 75) * 100;
                progressBar.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                progressText.textContent = `Faltam €${remaining.toFixed(2)} para envio grátis!`;
            }
            
            freeShippingProgress.style.display = 'block';
        } else if (freeShippingProgress) {
            freeShippingProgress.style.display = 'none';
        }
    }
    
    /**
     * Show "added to cart" notification
     */
    showAddedToCartNotification(product) {
        // Remove existing notification
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <div class="notification-text">
                    <strong>${product.name}</strong> adicionado ao carrinho
                </div>
                <a href="/cart" class="notification-link">Ver Carrinho</a>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    /**
     * Get display name for stone type
     */
    getStoneDisplayName(stoneType) {
        const stoneNames = {
            'onix': 'Ónix',
            'olho-de-tigre': 'Olho-de-Tigre',
            'ametista': 'Ametista',
            'turquesa': 'Turquesa'
        };
        return stoneNames[stoneType] || stoneType;
    }
}

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkNatureCart = new DarkNatureCart();
    });
} else {
    window.darkNatureCart = new DarkNatureCart();
}

