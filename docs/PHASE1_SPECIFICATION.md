# 📱 FASE 1: Mobile Camera Admin - Especificação Técnica
**Branch:** `feature/mobile-media-enhancements`  
**Sprint:** 1 (2 semanas)  
**Prioridade:** ⭐⭐⭐⭐⭐ CRÍTICA

---

## 🎯 Objetivos da Fase 1

### Funcionalidades Core:
1. ✅ **Mobile Camera Capture** - Tirar foto diretamente no admin mobile
2. ✅ **Real-time Compression** - Comprimir antes do upload
3. ✅ **Multi-camera Switching** - Alternar entre câmaras (frontal/traseira)
4. ✅ **Quick Product Creation** - Workflow simplificado foto → produto

### Métricas de Sucesso:
- 🎯 Tempo de captura → upload: **< 5 segundos**
- 🎯 Redução de tamanho: **60-70%** (sem perda visível de qualidade)
- 🎯 Compatibilidade: **Android 10+ | iOS 14+**
- 🎯 User flow: **≤ 3 cliques** (foto → produto salvo)

---

## 📐 Arquitetura Técnica

### Stack:
```
Frontend:
- HTML5 getUserMedia API (camera access)
- Canvas API (compression/resize)
- JavaScript vanilla (sem libs extras)
- CSS3 (interface camera)

Backend:
- Express.js routes (já existente)
- Multer middleware (já configurado)
- MySQL (produto creation)

Storage:
- File system (public/uploads/products/)
```

### Fluxo de Dados:
```
1. User clica "Tirar Foto"
   ↓
2. getUserMedia() → Video stream
   ↓
3. User clica "Capturar"
   ↓
4. Canvas capture → Compression
   ↓
5. Blob → FormData → Upload (Multer)
   ↓
6. Server save → Database entry
   ↓
7. Redirect to product detail
```

---

## 🔧 Componentes a Implementar

### **1. Mobile Camera Module** (`mobile-camera.js`)

#### **Responsabilidades:**
- Acesso à câmara do dispositivo
- Stream de vídeo preview
- Captura de foto (snapshot)
- Alternância entre câmaras
- Compressão básica

#### **API Pública:**
```javascript
class MobileCamera {
    constructor(options)
    async init()
    async startCamera(facingMode)
    async switchCamera()
    capturePhoto()
    stopCamera()
    getCompressedBlob(quality)
}
```

#### **Especificação Detalhada:**

```javascript
/**
 * Mobile Camera Module
 * Handles camera access and photo capture
 * 
 * @class MobileCamera
 * @example
 * const camera = new MobileCamera({
 *     previewElement: 'camera-preview',
 *     onCapture: (blob) => { ... }
 * });
 * await camera.init();
 */

class MobileCamera {
    /**
     * @param {Object} options
     * @param {string} options.previewElement - ID do elemento <video>
     * @param {Function} options.onCapture - Callback após captura
     * @param {Object} options.constraints - MediaStream constraints
     * @param {number} options.maxWidth - Largura máxima (default: 1920)
     * @param {number} options.maxHeight - Altura máxima (default: 1080)
     * @param {number} options.quality - Qualidade JPEG (0-1, default: 0.85)
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
        
        this.stream = null;
        this.videoElement = null;
        this.currentFacingMode = 'environment';
        this.availableCameras = [];
        this.isInitialized = false;
    }
    
    /**
     * Initialize camera module
     * @returns {Promise<boolean>}
     */
    async init() {
        try {
            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported');
            }
            
            // Get video element
            this.videoElement = document.getElementById(this.options.previewElement);
            if (!this.videoElement) {
                throw new Error(`Element ${this.options.previewElement} not found`);
            }
            
            // Enumerate available cameras
            await this.enumerateCameras();
            
            // Start camera
            await this.startCamera();
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('Camera init error:', error);
            this.handleError(error);
            return false;
        }
    }
    
    /**
     * Enumerate available cameras
     * @private
     */
    async enumerateCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableCameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log(`Found ${this.availableCameras.length} cameras:`, this.availableCameras);
            
            return this.availableCameras;
        } catch (error) {
            console.error('Error enumerating cameras:', error);
            return [];
        }
    }
    
    /**
     * Start camera with given facing mode
     * @param {string} facingMode - 'user' (front) or 'environment' (back)
     * @returns {Promise<MediaStream>}
     */
    async startCamera(facingMode = null) {
        try {
            // Stop current stream if exists
            if (this.stream) {
                this.stopCamera();
            }
            
            // Update facing mode if provided
            if (facingMode) {
                this.currentFacingMode = facingMode;
            }
            
            // Request camera access
            const constraints = {
                ...this.options.constraints,
                video: {
                    ...this.options.constraints.video,
                    facingMode: this.currentFacingMode
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Attach stream to video element
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            
            // Dispatch event
            this.dispatchEvent('cameraStarted', { facingMode: this.currentFacingMode });
            
            return this.stream;
            
        } catch (error) {
            console.error('Start camera error:', error);
            this.handleError(error);
            throw error;
        }
    }
    
    /**
     * Switch between front/back camera
     * @returns {Promise<void>}
     */
    async switchCamera() {
        if (this.availableCameras.length < 2) {
            console.warn('Only one camera available, cannot switch');
            return;
        }
        
        // Toggle facing mode
        const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        
        // Restart camera with new mode
        await this.startCamera(newFacingMode);
        
        this.dispatchEvent('cameraSwitched', { facingMode: newFacingMode });
    }
    
    /**
     * Capture photo from current video stream
     * @returns {Promise<Blob>}
     */
    async capturePhoto() {
        if (!this.isInitialized || !this.stream) {
            throw new Error('Camera not initialized');
        }
        
        try {
            // Create canvas
            const canvas = document.createElement('canvas');
            const video = this.videoElement;
            
            // Calculate dimensions maintaining aspect ratio
            const { width, height } = this.calculateDimensions(
                video.videoWidth,
                video.videoHeight
            );
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw current frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, width, height);
            
            // Convert to blob with compression
            const blob = await this.canvasToBlob(canvas, this.options.quality);
            
            // Callback
            if (this.options.onCapture && typeof this.options.onCapture === 'function') {
                this.options.onCapture(blob);
            }
            
            // Dispatch event
            this.dispatchEvent('photoCaptured', { 
                blob, 
                size: blob.size,
                type: blob.type
            });
            
            return blob;
            
        } catch (error) {
            console.error('Capture photo error:', error);
            throw error;
        }
    }
    
    /**
     * Calculate dimensions maintaining aspect ratio
     * @private
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
     */
    canvasToBlob(canvas, quality) {
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
     * Stop camera and release resources
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        
        this.dispatchEvent('cameraStopped');
    }
    
    /**
     * Get compressed blob (for manual compression)
     * @param {number} quality - JPEG quality (0-1)
     * @returns {Promise<Blob>}
     */
    async getCompressedBlob(quality = this.options.quality) {
        const tempQuality = this.options.quality;
        this.options.quality = quality;
        const blob = await this.capturePhoto();
        this.options.quality = tempQuality;
        return blob;
    }
    
    /**
     * Handle errors with user-friendly messages
     * @private
     */
    handleError(error) {
        let message = 'Erro ao acessar câmara';
        
        if (error.name === 'NotAllowedError') {
            message = 'Permissão de câmara negada. Por favor, permita o acesso nas configurações.';
        } else if (error.name === 'NotFoundError') {
            message = 'Nenhuma câmara encontrada no dispositivo.';
        } else if (error.name === 'NotReadableError') {
            message = 'Câmara já está em uso por outra aplicação.';
        }
        
        this.dispatchEvent('error', { error, message });
        
        // Show notification if available
        if (window.notifications) {
            window.notifications.error(message);
        } else {
            alert(message);
        }
    }
    
    /**
     * Dispatch custom event
     * @private
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`mobilecamera:${eventName}`, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopCamera();
        this.isInitialized = false;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileCamera;
} else {
    window.MobileCamera = MobileCamera;
}
```

---

### **2. Image Compression Module** (`image-compression.js`)

#### **Responsabilidades:**
- Compressão avançada de imagens
- Múltiplos níveis de qualidade
- Resize inteligente
- Preview antes/depois

#### **API Pública:**
```javascript
class ImageCompressor {
    static compress(file, options)
    static resizeImage(file, maxDimensions)
    static getImageDimensions(file)
    static calculateCompression(originalSize, compressedSize)
}
```

#### **Especificação Detalhada:**

```javascript
/**
 * Image Compression Utility
 * Advanced image compression with quality presets
 * 
 * @class ImageCompressor
 */

class ImageCompressor {
    /**
     * Compression quality presets
     */
    static PRESETS = {
        LOW: { quality: 0.6, maxWidth: 1280, maxHeight: 720 },
        MEDIUM: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 },
        HIGH: { quality: 0.9, maxWidth: 2560, maxHeight: 1440 },
        PRODUCT: { quality: 0.92, maxWidth: 2048, maxHeight: 2048 }, // For product photos
        THUMBNAIL: { quality: 0.7, maxWidth: 400, maxHeight: 400 }
    };
    
    /**
     * Compress image file or blob
     * @param {File|Blob} file - Image file
     * @param {Object} options - Compression options
     * @param {string} options.preset - Preset name ('PRODUCT', 'HIGH', etc)
     * @param {number} options.quality - Manual quality (0-1)
     * @param {number} options.maxWidth - Max width
     * @param {number} options.maxHeight - Max height
     * @param {string} options.outputType - Output MIME type (default: 'image/jpeg')
     * @returns {Promise<Blob>}
     */
    static async compress(file, options = {}) {
        // Merge options with preset
        const preset = options.preset ? this.PRESETS[options.preset.toUpperCase()] : null;
        const config = {
            quality: 0.85,
            maxWidth: 1920,
            maxHeight: 1080,
            outputType: 'image/jpeg',
            ...preset,
            ...options
        };
        
        try {
            // Load image
            const img = await this.loadImage(file);
            
            // Calculate new dimensions
            const { width, height } = this.calculateDimensions(
                img.width,
                img.height,
                config.maxWidth,
                config.maxHeight
            );
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Draw with high quality
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            const blob = await this.canvasToBlob(canvas, config.outputType, config.quality);
            
            // Log compression stats
            console.log('Compression stats:', {
                original: `${(file.size / 1024).toFixed(2)} KB`,
                compressed: `${(blob.size / 1024).toFixed(2)} KB`,
                reduction: `${this.calculateCompression(file.size, blob.size).toFixed(1)}%`,
                dimensions: `${width}x${height}`
            });
            
            return blob;
            
        } catch (error) {
            console.error('Compression error:', error);
            throw error;
        }
    }
    
    /**
     * Load image from file
     * @private
     */
    static loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }
    
    /**
     * Calculate new dimensions maintaining aspect ratio
     * @private
     */
    static calculateDimensions(width, height, maxWidth, maxHeight) {
        let newWidth = width;
        let newHeight = height;
        
        // Scale down if necessary
        if (newWidth > maxWidth) {
            newHeight = Math.round((newHeight * maxWidth) / newWidth);
            newWidth = maxWidth;
        }
        
        if (newHeight > maxHeight) {
            newWidth = Math.round((newWidth * maxHeight) / newHeight);
            newHeight = maxHeight;
        }
        
        return { width: newWidth, height: newHeight };
    }
    
    /**
     * Convert canvas to blob
     * @private
     */
    static canvasToBlob(canvas, type, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Blob creation failed')),
                type,
                quality
            );
        });
    }
    
    /**
     * Get image dimensions without loading
     * @param {File|Blob} file
     * @returns {Promise<{width, height}>}
     */
    static async getImageDimensions(file) {
        const img = await this.loadImage(file);
        return { width: img.width, height: img.height };
    }
    
    /**
     * Calculate compression percentage
     * @param {number} originalSize - Original file size
     * @param {number} compressedSize - Compressed file size
     * @returns {number} Compression percentage
     */
    static calculateCompression(originalSize, compressedSize) {
        return ((originalSize - compressedSize) / originalSize) * 100;
    }
    
    /**
     * Resize image to specific dimensions
     * @param {File|Blob} file
     * @param {Object} dimensions - {width, height}
     * @returns {Promise<Blob>}
     */
    static async resizeImage(file, dimensions) {
        return this.compress(file, {
            maxWidth: dimensions.width,
            maxHeight: dimensions.height,
            quality: 0.9
        });
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageCompressor;
} else {
    window.ImageCompressor = ImageCompressor;
}
```

---

### **3. Quick Product Form** (`quick-product-form.js`)

#### **Responsabilidades:**
- Formulário simplificado
- Auto-save de foto capturada
- Smart defaults
- Validação básica

#### **Implementação:**

```javascript
/**
 * Quick Product Creation Form
 * Simplified workflow for rapid product addition
 */

class QuickProductForm {
    constructor(options = {}) {
        this.options = {
            formId: 'quick-product-form',
            photoFieldId: 'product-photo',
            onSuccess: null,
            onError: null,
            ...options
        };
        
        this.capturedPhoto = null;
        this.camera = null;
        
        this.init();
    }
    
    init() {
        this.form = document.getElementById(this.options.formId);
        if (!this.form) {
            console.error(`Form ${this.options.formId} not found`);
            return;
        }
        
        this.bindEvents();
        this.initCamera();
    }
    
    initCamera() {
        this.camera = new MobileCamera({
            previewElement: 'camera-preview',
            onCapture: (blob) => {
                this.handlePhotoCapture(blob);
            }
        });
        
        this.camera.init();
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Auto-generate reference
        const nameField = this.form.querySelector('[name="name"]');
        if (nameField) {
            nameField.addEventListener('input', () => {
                this.generateReference();
            });
        }
    }
    
    handlePhotoCapture(blob) {
        this.capturedPhoto = blob;
        
        // Show preview
        this.showPhotoPreview(blob);
        
        // Enable submit button
        const submitBtn = this.form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }
    
    showPhotoPreview(blob) {
        const preview = document.getElementById('photo-preview');
        if (!preview) return;
        
        const url = URL.createObjectURL(blob);
        preview.src = url;
        preview.style.display = 'block';
    }
    
    generateReference() {
        const nameField = this.form.querySelector('[name="name"]');
        const refField = this.form.querySelector('[name="reference"]');
        
        if (!nameField || !refField || refField.value) return;
        
        // Generate reference from name
        const name = nameField.value;
        const ref = 'GAS-' + name.substring(0, 3).toUpperCase() + '-' + Date.now().toString(36);
        refField.value = ref;
    }
    
    async handleSubmit() {
        if (!this.capturedPhoto) {
            alert('Por favor, capture uma foto primeiro');
            return;
        }
        
        try {
            // Show loading
            this.setLoading(true);
            
            // Prepare form data
            const formData = new FormData(this.form);
            formData.append('photo', this.capturedPhoto, 'product-photo.jpg');
            
            // Submit
            const response = await fetch('/admin/products/quick-add', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (this.options.onSuccess) {
                    this.options.onSuccess(result);
                } else {
                    window.location.href = `/admin/products/${result.productId}`;
                }
            } else {
                throw new Error(result.message || 'Erro ao salvar produto');
            }
            
        } catch (error) {
            console.error('Submit error:', error);
            
            if (this.options.onError) {
                this.options.onError(error);
            } else {
                alert('Erro ao salvar produto: ' + error.message);
            }
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        const submitBtn = this.form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.textContent = loading ? 'Salvando...' : 'Salvar Produto';
        }
    }
    
    destroy() {
        if (this.camera) {
            this.camera.destroy();
        }
    }
}

// Auto-init if on quick-add page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quick-product-form')) {
        window.quickProductForm = new QuickProductForm();
    }
});
```

---

## 🎨 UI Components

### **Camera Interface HTML** (`views/admin/products/camera.ejs`)

```html
<!-- Camera Modal -->
<div class="mobile-camera-modal" id="camera-modal">
    <div class="mobile-camera-container">
        <!-- Header -->
        <div class="mobile-camera-header">
            <button class="btn-icon" id="close-camera">
                <i class="fas fa-times"></i>
            </button>
            <h3>Capturar Foto</h3>
            <button class="btn-icon" id="switch-camera" title="Trocar câmara">
                <i class="fas fa-sync-alt"></i>
            </button>
        </div>
        
        <!-- Video Preview -->
        <div class="mobile-camera-preview">
            <video id="camera-preview" autoplay playsinline></video>
            
            <!-- Overlay guides -->
            <div class="camera-guides">
                <div class="guide-grid"></div>
            </div>
        </div>
        
        <!-- Controls -->
        <div class="mobile-camera-controls">
            <!-- Capture Button -->
            <button class="btn-capture" id="capture-photo">
                <span class="capture-ring"></span>
                <span class="capture-button"></span>
            </button>
            
            <!-- Info -->
            <div class="camera-info">
                <span id="camera-status">Pronto</span>
            </div>
        </div>
        
        <!-- Settings (optional) -->
        <div class="mobile-camera-settings">
            <label>
                <input type="range" id="quality-slider" min="60" max="100" value="85">
                <span>Qualidade: <span id="quality-value">85</span>%</span>
            </label>
        </div>
    </div>
</div>
```

### **Quick Add Form** (`views/admin/products/quick-add.ejs`)

```html
<% layout('admin/layouts/main') %>

<div class="quick-add-container">
    <div class="page-header">
        <h1><i class="fas fa-bolt"></i> Adicionar Produto Rápido</h1>
        <p>Foto → Produto em 3 passos</p>
    </div>
    
    <!-- Step 1: Photo -->
    <div class="quick-add-step" data-step="1">
        <div class="step-header">
            <span class="step-number">1</span>
            <h3>Capturar Foto</h3>
        </div>
        
        <div class="photo-capture-area">
            <button type="button" class="btn btn-lg btn-primary" id="open-camera">
                <i class="fas fa-camera"></i> Abrir Câmara
            </button>
            
            <!-- Photo Preview -->
            <div class="photo-preview-container" style="display: none;">
                <img id="photo-preview" alt="Preview">
                <button type="button" class="btn btn-sm btn-secondary" id="retake-photo">
                    <i class="fas fa-redo"></i> Tirar Novamente
                </button>
            </div>
        </div>
    </div>
    
    <!-- Step 2: Basic Info -->
    <form id="quick-product-form" method="POST" action="/admin/products/quick-add">
        <div class="quick-add-step" data-step="2">
            <div class="step-header">
                <span class="step-number">2</span>
                <h3>Informações Básicas</h3>
            </div>
            
            <div class="form-group">
                <label for="name">Nome do Produto *</label>
                <input type="text" name="name" id="name" class="form-control" required
                       placeholder="Ex: Anel Prata Bali">
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="reference">Referência</label>
                        <input type="text" name="reference" id="reference" class="form-control"
                               placeholder="Auto-gerada se vazio">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="sale_price">Preço de Venda (€) *</label>
                        <input type="number" name="sale_price" id="sale_price" 
                               class="form-control" step="0.01" required>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="family_id">Categoria</label>
                        <select name="family_id" id="family_id" class="form-control">
                            <option value="">Selecione...</option>
                            <% families.forEach(family => { %>
                                <option value="<%= family.id %>"><%= family.name %></option>
                            <% }); %>
                        </select>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="current_stock">Stock Inicial</label>
                        <input type="number" name="current_stock" id="current_stock" 
                               class="form-control" value="1">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Step 3: Submit -->
        <div class="quick-add-step" data-step="3">
            <div class="step-header">
                <span class="step-number">3</span>
                <h3>Finalizar</h3>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-lg btn-success" disabled>
                    <i class="fas fa-save"></i> Salvar Produto
                </button>
                
                <a href="/admin/products" class="btn btn-lg btn-secondary">
                    <i class="fas fa-times"></i> Cancelar
                </a>
            </div>
        </div>
    </form>
</div>

<!-- Include camera modal -->
<%- include('camera') %>

<!-- Scripts -->
<script src="/js/mobile-camera.js"></script>
<script src="/js/image-compression.js"></script>
<script src="/js/quick-product-form.js"></script>
```

---

## 📂 Estrutura de Ficheiros (FASE 1)

```
gonzagas_node/
├── public/
│   ├── js/
│   │   ├── mobile-camera.js ✨ NOVO
│   │   ├── image-compression.js ✨ NOVO
│   │   └── quick-product-form.js ✨ NOVO
│   └── css/
│       ├── mobile-camera.css ✨ NOVO
│       └── quick-add.css ✨ NOVO
├── views/
│   └── admin/
│       └── products/
│           ├── camera.ejs ✨ NOVO
│           └── quick-add.ejs ✨ NOVO
├── routes/
│   └── admin/
│       └── products.js (MODIFICAR - adicionar rota quick-add)
└── controllers/
    └── ProductController.js (MODIFICAR - adicionar quickAdd method)
```

---

## ✅ Checklist de Implementação

### Semana 1:
- [ ] Criar `mobile-camera.js` com todas as funcionalidades
- [ ] Criar `image-compression.js` com presets
- [ ] Criar interface HTML da câmara (`camera.ejs`)
- [ ] Criar CSS para interface mobile (`mobile-camera.css`)
- [ ] Testar acesso à câmara em Android/iOS
- [ ] Testar alternância entre câmaras
- [ ] Testar compressão (verificar redução de tamanho)

### Semana 2:
- [ ] Criar `quick-product-form.js`
- [ ] Criar view `quick-add.ejs`
- [ ] Adicionar rota POST `/admin/products/quick-add`
- [ ] Implementar `ProductController.quickAdd()`
- [ ] Integrar com Multer (upload)
- [ ] Testar workflow completo (foto → produto salvo)
- [ ] Otimizar para mobile (CSS responsivo)
- [ ] Documentação de uso

---

## 🧪 Plano de Testes

### Testes Manuais:
1. **Android Chrome**
   - [ ] Abre câmara traseira
   - [ ] Troca para frontal
   - [ ] Captura foto
   - [ ] Compressão funciona (< 500KB)
   - [ ] Upload bem-sucedido

2. **iOS Safari**
   - [ ] Abre câmara traseira
   - [ ] Troca para frontal
   - [ ] Captura foto
   - [ ] Compressão funciona
   - [ ] Upload bem-sucedido

3. **Desktop (Fallback)**
   - [ ] Abre webcam se disponível
   - [ ] Mensagem clara se não disponível
   - [ ] Fallback para upload tradicional

### Performance:
- [ ] Tempo de captura: < 2s
- [ ] Tempo de compressão: < 1s
- [ ] Tempo de upload: < 3s
- [ ] Tamanho após compressão: 200-500KB
- [ ] Qualidade visual aceitável

---

**Ready to implement! 🚀**

Próximo passo: Começar a criar os ficheiros JavaScript conforme especificado acima.

