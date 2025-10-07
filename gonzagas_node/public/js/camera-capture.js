/**
 * =====================================================
 * MOBILE CAMERA CAPTURE MODULE
 * =====================================================
 * Project: Gonzaga's Art & Shine
 * Task: 1.1 - Camera Access Module
 * Description: HTML5 getUserMedia API for camera access
 * Compatibility: iOS Safari 14+, Chrome Android 90+
 * =====================================================
 */

class CameraCapture {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.onCapture = options.onCapture || null;
        this.onError = options.onError || null;
        
        // Configuration
        this.config = {
            video: {
                facingMode: 'environment', // Start with rear camera (better quality)
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            imageQuality: 0.85,
            maxWidth: 1600,
            maxHeight: 1600
        };
        
        // State
        this.stream = null;
        this.currentFacingMode = 'environment';
        this.videoElement = null;
        this.canvasElement = null;
        this.isActive = false;
        this.availableCameras = [];
        
        // Feature detection
        this.isSupported = this.checkSupport();
        
        // Initialize
        this.init();
    }
    
    /**
     * Check if camera capture is supported
     */
    checkSupport() {
        // Check for getUserMedia support
        const hasGetUserMedia = !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia
        );
        
        if (!hasGetUserMedia) {
            console.warn('getUserMedia not supported in this browser');
            return false;
        }
        
        // Check for Canvas support
        const canvas = document.createElement('canvas');
        const hasCanvas = !!(canvas.getContext && canvas.getContext('2d'));
        
        if (!hasCanvas) {
            console.warn('Canvas API not supported');
            return false;
        }
        
        return true;
    }
    
    /**
     * Initialize camera capture
     */
    async init() {
        if (!this.isSupported) {
            this.showFallback();
            return;
        }
        
        try {
            // Enumerate available cameras
            await this.detectCameras();
        } catch (error) {
            console.error('Error initializing camera:', error);
        }
    }
    
    /**
     * Detect available cameras
     */
    async detectCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableCameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log(`Found ${this.availableCameras.length} camera(s)`);
            
            return this.availableCameras;
        } catch (error) {
            console.error('Error enumerating devices:', error);
            return [];
        }
    }
    
    /**
     * Request camera access and start stream
     */
    async startCamera(facingMode = 'environment') {
        if (!this.isSupported) {
            this.handleError('Camera not supported in this browser');
            return false;
        }
        
        try {
            // Stop existing stream if any
            if (this.stream) {
                this.stopCamera();
            }
            
            // Update facing mode
            this.currentFacingMode = facingMode;
            
            // Request camera access
            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };
            
            console.log('Requesting camera access...', constraints);
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            console.log('✅ Camera access granted');
            
            this.isActive = true;
            
            return true;
            
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }
    
    /**
     * Stop camera stream
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
            console.log('Camera stopped');
        }
        
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        
        this.isActive = false;
    }
    
    /**
     * Switch between front and rear cameras
     */
    async switchCamera() {
        const newFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        
        console.log(`Switching camera from ${this.currentFacingMode} to ${newFacingMode}`);
        
        const success = await this.startCamera(newFacingMode);
        
        if (success && this.videoElement) {
            this.videoElement.srcObject = this.stream;
        }
        
        return success;
    }
    
    /**
     * Create camera UI overlay
     */
    createUI() {
        const overlay = document.createElement('div');
        overlay.className = 'camera-overlay';
        overlay.innerHTML = `
            <div class="camera-container">
                <div class="camera-header">
                    <button class="btn-close" data-camera-action="close">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3>Capturar Foto</h3>
                    <button class="btn-switch-camera" data-camera-action="switch" 
                            style="display: ${this.availableCameras.length > 1 ? 'block' : 'none'}">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                
                <div class="camera-preview">
                    <video autoplay playsinline></video>
                    <canvas style="display:none;"></canvas>
                </div>
                
                <div class="camera-controls">
                    <button class="btn-capture" data-camera-action="capture">
                        <i class="fas fa-camera"></i>
                        <span>Capturar</span>
                    </button>
                </div>
                
                <div class="camera-hints">
                    <p><i class="fas fa-info-circle"></i> Posicione o produto com boa iluminação</p>
                </div>
            </div>
        `;
        
        this.container.appendChild(overlay);
        
        // Get references
        this.videoElement = overlay.querySelector('video');
        this.canvasElement = overlay.querySelector('canvas');
        
        // Bind events
        this.bindUIEvents(overlay);
        
        return overlay;
    }
    
    /**
     * Bind UI event handlers
     */
    bindUIEvents(overlay) {
        overlay.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-camera-action]')?.dataset.cameraAction;
            
            if (!action) return;
            
            switch (action) {
                case 'close':
                    this.close();
                    break;
                    
                case 'switch':
                    await this.switchCamera();
                    break;
                    
                case 'capture':
                    await this.capturePhoto();
                    break;
            }
        });
    }
    
    /**
     * Open camera interface
     */
    async open() {
        if (!this.isSupported) {
            this.handleError('Camera not supported. Please use file upload.');
            return false;
        }
        
        // Create UI
        const overlay = this.createUI();
        
        // Start camera
        const started = await this.startCamera(this.currentFacingMode);
        
        if (started && this.stream && this.videoElement) {
            // Connect stream to video element
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = resolve;
            });
            
            // Start playing
            await this.videoElement.play();
            
            console.log('✅ Camera preview active');
            
            return true;
        } else {
            this.close();
            return false;
        }
    }
    
    /**
     * Close camera interface
     */
    close() {
        this.stopCamera();
        
        const overlay = this.container.querySelector('.camera-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.videoElement = null;
        this.canvasElement = null;
    }
    
    /**
     * Capture photo from video stream
     */
    async capturePhoto() {
        if (!this.videoElement || !this.canvasElement || !this.stream) {
            console.error('Camera not ready');
            return null;
        }
        
        try {
            // Get video dimensions
            const video = this.videoElement;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            
            console.log(`Capturing photo: ${videoWidth}x${videoHeight}`);
            
            // Set canvas size
            this.canvasElement.width = videoWidth;
            this.canvasElement.height = videoHeight;
            
            // Draw current video frame to canvas
            const ctx = this.canvasElement.getContext('2d');
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
            
            // Add flash effect
            this.showFlashEffect();
            
            // Convert to blob
            const blob = await this.canvasToBlob(this.canvasElement);
            
            // Create file object
            const timestamp = Date.now();
            const file = new File(
                [blob], 
                `capture_${timestamp}.jpg`, 
                { type: 'image/jpeg' }
            );
            
            console.log('✅ Photo captured:', {
                size: `${(file.size / 1024).toFixed(2)} KB`,
                dimensions: `${videoWidth}x${videoHeight}`
            });
            
            // Callback
            if (this.onCapture) {
                this.onCapture(file, blob);
            }
            
            // Close camera
            this.close();
            
            return file;
            
        } catch (error) {
            console.error('Error capturing photo:', error);
            this.handleError('Erro ao capturar foto');
            return null;
        }
    }
    
    /**
     * Convert canvas to blob
     */
    canvasToBlob(canvas, quality = 0.85) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                'image/jpeg',
                quality
            );
        });
    }
    
    /**
     * Show flash effect on capture
     */
    showFlashEffect() {
        const flash = document.createElement('div');
        flash.className = 'camera-flash';
        this.container.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 200);
    }
    
    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Camera error:', error);
        
        let message = 'Erro ao acessar a câmara';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            message = 'Permissão de câmara negada. Por favor, permite o acesso nas configurações.';
        } else if (error.name === 'NotFoundError') {
            message = 'Nenhuma câmara encontrada no dispositivo.';
        } else if (error.name === 'NotReadableError') {
            message = 'Câmara está sendo usada por outra aplicação.';
        } else if (typeof error === 'string') {
            message = error;
        }
        
        // Show error notification
        if (window.notifications) {
            window.notifications.error(message);
        } else {
            alert(message);
        }
        
        // Callback
        if (this.onError) {
            this.onError(error);
        }
        
        // Show fallback
        this.showFallback();
    }
    
    /**
     * Show fallback file input
     */
    showFallback() {
        console.log('Showing file input fallback');
        
        // Hide camera button, show file input
        const cameraButton = document.querySelector('[data-action="open-camera"]');
        const fileInput = document.querySelector('input[type="file"][accept*="image"]');
        
        if (cameraButton) {
            cameraButton.style.display = 'none';
        }
        
        if (fileInput) {
            fileInput.style.display = 'block';
            fileInput.required = true;
        }
    }
    
    /**
     * Check if device is mobile
     */
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }
    
    /**
     * Get supported facing modes
     */
    async getSupportedFacingModes() {
        const cameras = await this.detectCameras();
        const facingModes = new Set();
        
        for (const camera of cameras) {
            // Try to determine facing mode from label
            const label = camera.label.toLowerCase();
            if (label.includes('front') || label.includes('user')) {
                facingModes.add('user');
            } else if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
                facingModes.add('environment');
            }
        }
        
        // If can't determine, assume both are available if multiple cameras
        if (cameras.length > 1 && facingModes.size === 0) {
            facingModes.add('user');
            facingModes.add('environment');
        }
        
        return Array.from(facingModes);
    }
}

/**
 * =====================================================
 * GLOBAL CAMERA INSTANCE
 * =====================================================
 */

// Initialize global camera instance when DOM is ready
let cameraInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📷 Camera Capture Module loaded');
    
    // Check if mobile device
    if (CameraCapture.isMobileDevice()) {
        console.log('📱 Mobile device detected - camera features available');
    } else {
        console.log('💻 Desktop device detected - file upload will be used');
    }
});

/**
 * =====================================================
 * HELPER FUNCTIONS
 * =====================================================
 */

/**
 * Initialize camera for a specific form
 */
function initCameraForForm(formElement, imageInputName = 'product_image') {
    if (!CameraCapture) {
        console.error('CameraCapture class not available');
        return;
    }
    
    const isMobile = CameraCapture.isMobileDevice();
    const cameraButton = formElement.querySelector('[data-action="open-camera"]');
    const fileInput = formElement.querySelector(`input[name="${imageInputName}"]`);
    const previewContainer = formElement.querySelector('.image-preview-container');
    
    if (!isMobile) {
        // Hide camera button on desktop
        if (cameraButton) {
            cameraButton.style.display = 'none';
        }
        return;
    }
    
    // Create camera instance
    cameraInstance = new CameraCapture({
        container: document.body,
        onCapture: (file, blob) => {
            handleCapturedImage(file, blob, formElement, fileInput, previewContainer);
        },
        onError: (error) => {
            console.error('Camera error:', error);
            if (window.notifications) {
                window.notifications.error('Erro ao acessar câmara. Use upload de ficheiro.');
            }
        }
    });
    
    // Bind camera button
    if (cameraButton) {
        cameraButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await cameraInstance.open();
        });
    }
}

/**
 * Handle captured image
 */
function handleCapturedImage(file, blob, formElement, fileInput, previewContainer) {
    console.log('Handling captured image:', file.name, file.size);
    
    // Create a FileList-like object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Update file input
    if (fileInput) {
        fileInput.files = dataTransfer.files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    }
    
    // Show preview
    if (previewContainer) {
        showImagePreview(blob, previewContainer);
    }
    
    // Show success notification
    if (window.notifications) {
        window.notifications.success('Foto capturada com sucesso!');
    }
}

/**
 * Show image preview
 */
function showImagePreview(blob, container) {
    // Clear existing preview
    container.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.className = 'captured-image-preview';
    img.src = URL.createObjectURL(blob);
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-image';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => {
        container.innerHTML = '';
        const fileInput = container.closest('form').querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };
    
    // Append to container
    container.appendChild(img);
    container.appendChild(removeBtn);
    container.style.display = 'block';
    
    // Clean up blob URL after image loads
    img.onload = () => {
        URL.revokeObjectURL(img.src);
    };
}

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

// Make available globally
window.CameraCapture = CameraCapture;
window.initCameraForForm = initCameraForForm;

console.log('✅ Camera Capture Module initialized');

