/**
 * Mobile Camera Module
 * Handles camera access and photo capture on mobile devices
 * 
 * @module MobileCamera
 * @version 1.0.0
 * @author Gonzaga's Art & Shine Dev Team
 * @license UNLICENSED
 */

/**
 * Main camera class for mobile photo capture
 * @class MobileCamera
 * @example
 * const camera = new MobileCamera({
 *     previewElement: 'camera-preview',
 *     onCapture: (blob) => console.log('Photo captured', blob)
 * });
 * await camera.init();
 */
class MobileCamera {
    /**
     * Create a camera instance
     * @param {Object} options - Configuration options
     * @param {string} options.previewElement - ID do elemento <video> para preview
     * @param {Function} options.onCapture - Callback executado após captura
     * @param {Object} options.constraints - MediaStream constraints customizados
     * @param {number} options.maxWidth - Largura máxima da imagem (default: 1920)
     * @param {number} options.maxHeight - Altura máxima da imagem (default: 1080)
     * @param {number} options.quality - Qualidade JPEG 0-1 (default: 0.85)
     */
    constructor(options = {}) {
        this.options = {
            previewElement: 'camera-preview',
            onCapture: null,
            constraints: {
                video: {
                    facingMode: 'environment', // Câmara traseira por default
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            },
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            ...options
        };
        
        // State
        this.stream = null;
        this.videoElement = null;
        this.currentFacingMode = 'environment';
        this.availableCameras = [];
        this.isInitialized = false;
        this.isCapturing = false;
        
        // Debug mode
        this.debug = localStorage.getItem('DEBUG_CAMERA') === 'true';
    }
    
    /**
     * Initialize camera module
     * Sets up video element and checks browser support
     * @returns {Promise<boolean>} Success status
     * @throws {Error} If browser doesn't support getUserMedia
     */
    async init() {
        try {
            this.log('Initializing camera module...');
            
            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported in this browser');
            }
            
            // Get video element
            this.videoElement = document.getElementById(this.options.previewElement);
            if (!this.videoElement) {
                throw new Error(`Video element '${this.options.previewElement}' not found in DOM`);
            }
            
            // Enumerate available cameras
            await this.enumerateCameras();
            
            // Start camera with default facing mode
            await this.startCamera();
            
            this.isInitialized = true;
            this.log('Camera initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.handleError(error);
            return false;
        }
    }
    
    /**
     * Enumerate available cameras on device
     * @private
     * @returns {Promise<Array>} List of video input devices
     */
    async enumerateCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableCameras = devices.filter(device => device.kind === 'videoinput');
            
            this.log(`Found ${this.availableCameras.length} camera(s):`, 
                this.availableCameras.map(cam => cam.label || 'Unknown camera')
            );
            
            return this.availableCameras;
            
        } catch (error) {
            console.error('Error enumerating cameras:', error);
            this.availableCameras = [];
            return [];
        }
    }
    
    /**
     * Start camera with specified facing mode
     * @param {string} facingMode - 'user' (front) or 'environment' (back)
     * @returns {Promise<MediaStream>} Camera stream
     * @throws {Error} If camera access is denied or fails
     */
    async startCamera(facingMode = null) {
        try {
            this.log('Starting camera...');
            
            // Stop current stream if exists
            if (this.stream) {
                this.stopCamera();
            }
            
            // Update facing mode if provided
            if (facingMode) {
                this.currentFacingMode = facingMode;
            }
            
            // Build constraints
            const constraints = {
                ...this.options.constraints,
                video: {
                    ...this.options.constraints.video,
                    facingMode: this.currentFacingMode
                }
            };
            
            this.log('Requesting camera with constraints:', constraints);
            
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Attach stream to video element
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to be ready
            await this.videoElement.play();
            
            this.log('Camera started successfully', {
                facingMode: this.currentFacingMode,
                tracks: this.stream.getVideoTracks().length
            });
            
            // Dispatch event
            this.dispatchEvent('cameraStarted', { 
                facingMode: this.currentFacingMode,
                availableCameras: this.availableCameras.length
            });
            
            return this.stream;
            
        } catch (error) {
            console.error('Start camera error:', error);
            this.handleError(error);
            throw error;
        }
    }
    
    /**
     * Switch between front and back camera
     * @returns {Promise<void>}
     * @throws {Error} If only one camera available or switch fails
     */
    async switchCamera() {
        if (this.availableCameras.length < 2) {
            const message = 'Apenas uma câmara disponível neste dispositivo';
            this.log(message);
            
            if (window.notifications) {
                window.notifications.warning(message);
            }
            return;
        }
        
        try {
            this.log('Switching camera...');
            
            // Toggle facing mode
            const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
            
            // Restart camera with new mode
            await this.startCamera(newFacingMode);
            
            this.log(`Camera switched to ${newFacingMode}`);
            
            // Dispatch event
            this.dispatchEvent('cameraSwitched', { facingMode: newFacingMode });
            
            // Show notification
            if (window.notifications) {
                const cameraName = newFacingMode === 'user' ? 'Frontal' : 'Traseira';
                window.notifications.info(`Câmara ${cameraName} ativada`);
            }
            
        } catch (error) {
            console.error('Switch camera error:', error);
            
            if (window.notifications) {
                window.notifications.error('Erro ao trocar câmara');
            }
        }
    }
    
    /**
     * Capture photo from current video stream
     * Includes automatic compression and resize
     * @returns {Promise<Blob>} Compressed JPEG blob
     * @throws {Error} If camera not initialized or capture fails
     */
    async capturePhoto() {
        if (!this.isInitialized || !this.stream) {
            throw new Error('Camera not initialized');
        }
        
        if (this.isCapturing) {
            this.log('Already capturing, ignoring request');
            return null;
        }
        
        try {
            this.isCapturing = true;
            this.log('Capturing photo...');
            
            // Create canvas for capture
            const canvas = document.createElement('canvas');
            const video = this.videoElement;
            
            // Get video dimensions
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            
            this.log('Video dimensions:', { videoWidth, videoHeight });
            
            // Calculate new dimensions maintaining aspect ratio
            const { width, height } = this.calculateDimensions(videoWidth, videoHeight);
            
            canvas.width = width;
            canvas.height = height;
            
            this.log('Canvas dimensions:', { width, height });
            
            // Draw current video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(video, 0, 0, width, height);
            
            // Convert to blob with compression
            const blob = await this.canvasToBlob(canvas, this.options.quality);
            
            const sizeKB = (blob.size / 1024).toFixed(2);
            this.log(`Photo captured successfully: ${sizeKB} KB`);
            
            // Callback
            if (this.options.onCapture && typeof this.options.onCapture === 'function') {
                this.options.onCapture(blob);
            }
            
            // Dispatch event
            this.dispatchEvent('photoCaptured', { 
                blob,
                size: blob.size,
                sizeKB: parseFloat(sizeKB),
                type: blob.type,
                dimensions: { width, height }
            });
            
            // Show success notification
            if (window.notifications) {
                window.notifications.success(`Foto capturada (${sizeKB} KB)`);
            }
            
            return blob;
            
        } catch (error) {
            console.error('Capture photo error:', error);
            
            if (window.notifications) {
                window.notifications.error('Erro ao capturar foto');
            }
            
            throw error;
            
        } finally {
            this.isCapturing = false;
        }
    }
    
    /**
     * Calculate dimensions maintaining aspect ratio
     * @private
     * @param {number} videoWidth - Original width
     * @param {number} videoHeight - Original height
     * @returns {{width: number, height: number}} New dimensions
     */
    calculateDimensions(videoWidth, videoHeight) {
        let width = videoWidth;
        let height = videoHeight;
        
        // Resize if exceeds max dimensions
        if (width > this.options.maxWidth) {
            height = Math.round((height * this.options.maxWidth) / width);
            width = this.options.maxWidth;
        }
        
        if (height > this.options.maxHeight) {
            width = Math.round((width * this.options.maxHeight) / height);
            height = this.options.maxHeight;
        }
        
        return { width, height };
    }
    
    /**
     * Convert canvas to blob with compression
     * @private
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} quality - JPEG quality (0-1)
     * @returns {Promise<Blob>} Compressed image blob
     */
    canvasToBlob(canvas, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                },
                'image/jpeg',
                quality
            );
        });
    }
    
    /**
     * Get compressed blob with custom quality
     * Useful for manual re-compression
     * @param {number} quality - JPEG quality (0-1)
     * @returns {Promise<Blob>} Compressed blob
     */
    async getCompressedBlob(quality = this.options.quality) {
        const originalQuality = this.options.quality;
        this.options.quality = quality;
        
        try {
            const blob = await this.capturePhoto();
            return blob;
        } finally {
            this.options.quality = originalQuality;
        }
    }
    
    /**
     * Stop camera and release all resources
     */
    stopCamera() {
        this.log('Stopping camera...');
        
        if (this.stream) {
            // Stop all tracks
            this.stream.getTracks().forEach(track => {
                track.stop();
                this.log('Track stopped:', track.label);
            });
            this.stream = null;
        }
        
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        
        this.log('Camera stopped');
        
        // Dispatch event
        this.dispatchEvent('cameraStopped');
    }
    
    /**
     * Handle errors with user-friendly messages
     * @private
     * @param {Error} error - Error object
     */
    handleError(error) {
        let message = 'Erro ao acessar câmara';
        let techDetails = error.message;
        
        // Map error types to user-friendly messages
        switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                message = 'Permissão de câmara negada';
                techDetails = 'Por favor, permita o acesso à câmara nas configurações do navegador.';
                break;
                
            case 'NotFoundError':
            case 'DevicesNotFoundError':
                message = 'Nenhuma câmara encontrada';
                techDetails = 'Verifique se o dispositivo possui uma câmara conectada.';
                break;
                
            case 'NotReadableError':
            case 'TrackStartError':
                message = 'Câmara indisponível';
                techDetails = 'A câmara pode estar sendo usada por outra aplicação.';
                break;
                
            case 'OverconstrainedError':
            case 'ConstraintNotSatisfiedError':
                message = 'Câmara não suporta os requisitos';
                techDetails = 'Tentando com configurações alternativas...';
                break;
                
            case 'TypeError':
                message = 'Erro de configuração';
                techDetails = 'Navegador pode não suportar esta funcionalidade.';
                break;
        }
        
        console.error(`[MobileCamera] ${message}:`, techDetails, error);
        
        // Dispatch error event
        this.dispatchEvent('error', { 
            error, 
            message, 
            techDetails,
            errorName: error.name 
        });
        
        // Show notification
        if (window.notifications) {
            window.notifications.error(message, techDetails);
        } else {
            alert(`${message}\n\n${techDetails}`);
        }
    }
    
    /**
     * Dispatch custom DOM event
     * @private
     * @param {string} eventName - Event name (without prefix)
     * @param {Object} detail - Event detail data
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`mobilecamera:${eventName}`, { 
            detail,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
        this.log(`Event dispatched: mobilecamera:${eventName}`, detail);
    }
    
    /**
     * Debug logger
     * @private
     */
    log(...args) {
        if (this.debug) {
            console.log('[MobileCamera]', ...args);
        }
    }
    
    /**
     * Get current camera state
     * @returns {Object} Current state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isCapturing: this.isCapturing,
            hasStream: !!this.stream,
            currentFacingMode: this.currentFacingMode,
            availableCamerasCount: this.availableCameras.length,
            canSwitch: this.availableCameras.length >= 2
        };
    }
    
    /**
     * Cleanup and destroy camera instance
     */
    destroy() {
        this.log('Destroying camera instance...');
        
        this.stopCamera();
        this.isInitialized = false;
        this.videoElement = null;
        this.stream = null;
        this.availableCameras = [];
        
        this.log('Camera instance destroyed');
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileCamera;
} else {
    window.MobileCamera = MobileCamera;
}

// Enable debug mode via console
if (typeof window !== 'undefined') {
    window.enableCameraDebug = () => {
        localStorage.setItem('DEBUG_CAMERA', 'true');
        console.log('Camera debug mode enabled. Reload page to see debug logs.');
    };
    
    window.disableCameraDebug = () => {
        localStorage.removeItem('DEBUG_CAMERA');
        console.log('Camera debug mode disabled.');
    };
}

