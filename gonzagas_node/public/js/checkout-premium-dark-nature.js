/**
 * Checkout Premium Dark Nature - Sacred Checkout Experience
 * Multi-step wizard with stone preference tracking
 */

class CheckoutPremiumDarkNature {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.cart = [];
        this.formData = {};
    }
    
    /**
     * Initialize checkout
     */
    init() {
        console.log('🛒 Initializing Dark Nature Checkout...');
        
        // Load cart from localStorage
        this.loadCart();
        
        // Render cart summary
        this.renderCartSummary();
        
        // Calculate totals
        this.calculateTotals();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize step 1
        this.showStep(1);
        
        console.log('✅ Checkout initialized');
    }
    
    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const cartData = localStorage.getItem('gonzaga_cart');
            this.cart = cartData ? JSON.parse(cartData) : [];
            
            // If cart is empty, redirect to cart page
            if (this.cart.length === 0) {
                window.location.href = '/cart';
                return;
            }
            
            console.log(`📦 Cart loaded: ${this.cart.length} items`);
        } catch (error) {
            console.error('Load cart error:', error);
            this.cart = [];
        }
    }
    
    /**
     * Render cart summary in sidebar
     */
    renderCartSummary() {
        const container = document.getElementById('summary-items');
        if (!container) return;
        
        if (this.cart.length === 0) {
            container.innerHTML = '<p class="empty-cart-message">Carrinho vazio</p>';
            return;
        }
        
        container.innerHTML = this.cart.map(item => `
            <div class="summary-item">
                <div class="item-image">
                    <img src="${item.productImage || '/images/placeholders/product-dark.jpg'}" 
                         alt="${item.productName || 'Produto'}" 
                         loading="lazy">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.productName || 'Produto'}</div>
                    <div class="item-quantity">Quantidade: ${item.quantity}</div>
                    <div class="item-price">€${(item.productPrice * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Calculate and update totals
     */
    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => {
            return sum + (item.productPrice * item.quantity);
        }, 0);
        
        // Get shipping method
        const shippingMethodInput = document.querySelector('input[name="shippingMethod"]:checked');
        const shippingMethod = shippingMethodInput ? shippingMethodInput.value : 'standard';
        
        // Calculate shipping (free if > 75€)
        let shipping = 0;
        if (subtotal < 75) {
            shipping = shippingMethod === 'express' ? 12.99 : 5.99;
        }
        
        // Calculate tax (23% IVA)
        const tax = (subtotal + shipping) * 0.23;
        
        // Total
        const total = subtotal + shipping + tax;
        
        // Update UI
        this.updateSummaryUI({
            subtotal,
            shipping,
            tax,
            total
        });
        
        return { subtotal, shipping, tax, total };
    }
    
    /**
     * Update summary UI
     */
    updateSummaryUI(totals) {
        const elements = {
            subtotal: document.getElementById('summary-subtotal'),
            shipping: document.getElementById('summary-shipping'),
            tax: document.getElementById('summary-tax'),
            total: document.getElementById('summary-total')
        };
        
        if (elements.subtotal) elements.subtotal.textContent = `€${totals.subtotal.toFixed(2)}`;
        if (elements.shipping) {
            elements.shipping.textContent = totals.shipping === 0 ? 'Grátis' : `€${totals.shipping.toFixed(2)}`;
        }
        if (elements.tax) elements.tax.textContent = `€${totals.tax.toFixed(2)}`;
        if (elements.total) elements.total.textContent = `€${totals.total.toFixed(2)}`;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Shipping method change
        const shippingInputs = document.querySelectorAll('input[name="shippingMethod"]');
        shippingInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.calculateTotals();
            });
        });
        
        // Payment method change
        const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.showPaymentDetails(e.target.value);
            });
        });
    }
    
    /**
     * Show payment details for selected method
     */
    showPaymentDetails(method) {
        // Hide all
        document.querySelectorAll('.payment-details').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show selected
        const detailsEl = document.getElementById(`payment-details-${method}`);
        if (detailsEl) {
            detailsEl.style.display = 'block';
        }
    }
    
    /**
     * Navigate to specific step
     */
    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        this.currentStep = stepNumber;
        this.showStep(stepNumber);
        this.updateProgress(stepNumber);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Next step
     */
    nextStep() {
        // Validate current step
        if (!this.validateStep(this.currentStep)) {
            return;
        }
        
        // Save form data
        this.saveStepData(this.currentStep);
        
        // Go to next step
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
            
            // If step 4, populate review
            if (this.currentStep === 4) {
                this.populateReview();
            }
        }
    }
    
    /**
     * Previous step
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }
    
    /**
     * Show specific step
     */
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.add('wizard-step--hidden');
        });
        
        // Show target step
        const targetStep = document.getElementById(`step-${stepNumber}`);
        if (targetStep) {
            targetStep.classList.remove('wizard-step--hidden');
        }
    }
    
    /**
     * Update progress indicator
     */
    updateProgress(stepNumber) {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const num = index + 1;
            
            step.classList.remove('progress-step--active', 'progress-step--completed');
            
            if (num === stepNumber) {
                step.classList.add('progress-step--active');
            } else if (num < stepNumber) {
                step.classList.add('progress-step--completed');
            }
        });
    }
    
    /**
     * Validate current step
     */
    validateStep(stepNumber) {
        const step = document.getElementById(`step-${stepNumber}`);
        if (!step) return true;
        
        // Get required inputs in this step
        const requiredInputs = step.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.value || !input.validity.valid) {
                input.classList.add('field-error');
                isValid = false;
                
                // Add error shake animation
                input.style.animation = 'shake 0.5s';
                setTimeout(() => { input.style.animation = ''; }, 500);
            } else {
                input.classList.remove('field-error');
                input.classList.add('field-success');
            }
        });
        
        if (!isValid) {
            this.showNotification('Por favor preencha todos os campos obrigatórios', 'error');
        }
        
        return isValid;
    }
    
    /**
     * Save step data
     */
    saveStepData(stepNumber) {
        const step = document.getElementById(`step-${stepNumber}`);
        if (!step) return;
        
        const inputs = step.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else {
                this.formData[input.name] = input.value;
            }
        });
        
        console.log('💾 Step data saved:', this.formData);
    }
    
    /**
     * Populate review step
     */
    populateReview() {
        // Customer info
        const customerInfo = document.getElementById('review-customer-info');
        if (customerInfo) {
            customerInfo.innerHTML = `
                <p><strong>Nome:</strong> ${this.formData.customerName || 'N/A'}</p>
                <p><strong>Email:</strong> ${this.formData.customerEmail || 'N/A'}</p>
                <p><strong>Telefone:</strong> ${this.formData.customerPhone || 'N/A'}</p>
                ${this.formData.stonePreference ? `<p><strong>Pedra Preferida:</strong> ${this.getStoneName(this.formData.stonePreference)}</p>` : ''}
            `;
        }
        
        // Shipping info
        const shippingInfo = document.getElementById('review-shipping-info');
        if (shippingInfo) {
            const shippingMethodName = this.formData.shippingMethod === 'express' ? 'Envio Expresso' : 'Envio Standard';
            shippingInfo.innerHTML = `
                <p><strong>Morada:</strong> ${this.formData.shippingAddress || 'N/A'}</p>
                <p><strong>Cidade:</strong> ${this.formData.shippingCity || 'N/A'}</p>
                <p><strong>Código Postal:</strong> ${this.formData.shippingPostalCode || 'N/A'}</p>
                <p><strong>Método:</strong> ${shippingMethodName}</p>
            `;
        }
        
        // Payment info
        const paymentInfo = document.getElementById('review-payment-info');
        if (paymentInfo) {
            const paymentMethodName = this.getPaymentMethodName(this.formData.paymentMethod);
            paymentInfo.innerHTML = `
                <p><strong>Método:</strong> ${paymentMethodName}</p>
                ${this.formData.paymentMethod === 'mbway' && this.formData.mbwayPhone ? 
                    `<p><strong>MB Way:</strong> ${this.formData.mbwayPhone}</p>` : ''}
            `;
        }
    }
    
    /**
     * Get stone display name
     */
    getStoneName(value) {
        const names = {
            'onix': 'Ónix',
            'olho-de-tigre': 'Olho-de-Tigre',
            'ametista': 'Ametista',
            'turquesa': 'Turquesa'
        };
        return names[value] || value;
    }
    
    /**
     * Get payment method display name
     */
    getPaymentMethodName(value) {
        const names = {
            'mbway': 'MB Way',
            'paypal': 'PayPal',
            'transfer': 'Transferência Bancária'
        };
        return names[value] || value;
    }
    
    /**
     * Submit order
     */
    async submitOrder() {
        try {
            // Final validation
            const termsAccept = document.getElementById('terms-accept');
            if (!termsAccept || !termsAccept.checked) {
                this.showNotification('Por favor aceite os Termos e Condições', 'error');
                return;
            }
            
            // Show loading
            this.showLoading('Processando o seu pedido sagrado...');
            
            // Get totals
            const totals = this.calculateTotals();
            
            // Prepare order data
            const orderData = {
                customerInfo: {
                    name: this.formData.customerName,
                    email: this.formData.customerEmail,
                    phone: this.formData.customerPhone,
                    stonePreference: this.formData.stonePreference || null
                },
                shippingInfo: {
                    address: this.formData.shippingAddress,
                    city: this.formData.shippingCity,
                    postalCode: this.formData.shippingPostalCode,
                    method: this.formData.shippingMethod || 'standard'
                },
                paymentInfo: {
                    method: this.formData.paymentMethod || 'mbway',
                    mbwayPhone: this.formData.mbwayPhone || null
                },
                cartItems: this.cart.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                    productPrice: item.productPrice,
                    quantity: item.quantity
                })),
                totals: {
                    subtotal: totals.subtotal,
                    shipping: totals.shipping,
                    tax: totals.tax,
                    total: totals.total
                }
            };
            
            console.log('📤 Submitting order:', orderData);
            
            // Submit to backend
            const response = await fetch('/checkout/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Clear cart
                localStorage.removeItem('gonzaga_cart');
                
                // Track purchase in analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'purchase', {
                        transaction_id: result.orderNumber,
                        value: totals.total,
                        currency: 'EUR',
                        tax: totals.tax,
                        shipping: totals.shipping,
                        items: this.cart.map(item => ({
                            item_id: item.productId,
                            item_name: item.productName,
                            price: item.productPrice,
                            quantity: item.quantity
                        }))
                    });
                }
                
                // Redirect to confirmation
                window.location.href = result.redirectUrl || `/order-confirmation/${result.orderNumber}`;
                
            } else {
                throw new Error(result.error || 'Erro ao processar pedido');
            }
            
        } catch (error) {
            console.error('Submit order error:', error);
            this.hideLoading();
            this.showNotification(error.message || 'Erro ao processar pedido. Tente novamente.', 'error');
        }
    }
    
    /**
     * Show loading overlay
     */
    showLoading(message = 'A processar...') {
        let overlay = document.querySelector('.checkout-loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'checkout-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner">⚡</div>
                    <div class="loading-text">${message}</div>
                    <div class="loading-subtitle">Por favor aguarde...</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.add('active');
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.querySelector('.checkout-loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `checkout-notification checkout-notification--${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        // Append to body
        document.body.appendChild(notification);
        
        // Show
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide after 5s
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    /**
     * Get cart count
     */
    getCartCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    /**
     * Get cart total
     */
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    }
}

/* Notification Styles (Inline CSS) */
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.checkout-notification {
    position: fixed;
    top: 100px;
    right: -400px;
    max-width: 400px;
    padding: var(--space-lg) var(--space-xl);
    background: linear-gradient(145deg, rgba(11,13,12,0.98) 0%, rgba(11,13,12,0.95) 100%);
    border: 1px solid rgba(110,107,101,0.3);
    border-radius: var(--radius-large);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: var(--space-md);
    z-index: 1001;
    transition: right 0.3s ease;
}

.checkout-notification.show {
    right: var(--space-xl);
}

.checkout-notification--error {
    border-color: rgba(220,20,60,0.5);
    background: linear-gradient(145deg, rgba(220,20,60,0.15) 0%, rgba(11,13,12,0.95) 100%);
}

.checkout-notification--success {
    border-color: rgba(34,139,34,0.5);
    background: linear-gradient(145deg, rgba(34,139,34,0.15) 0%, rgba(11,13,12,0.95) 100%);
}

.notification-icon {
    font-size: 1.5rem;
}

.notification-message {
    color: var(--ivory);
    font-size: 0.95rem;
    line-height: 1.4;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}

.field-error {
    border-color: rgba(220,20,60,0.6) !important;
    background-color: rgba(220,20,60,0.08) !important;
    box-shadow: 0 0 0 2px rgba(220,20,60,0.2) !important;
}

.field-success {
    border-color: rgba(34,139,34,0.6) !important;
    background-color: rgba(34,139,34,0.05) !important;
}
`;
document.head.appendChild(notificationStyles);

// Export for global access
window.CheckoutPremiumDarkNature = CheckoutPremiumDarkNature;

