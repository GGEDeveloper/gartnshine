/**
 * Mobile Camera Integration for Media Library
 * Handles camera capture for mobile devices
 */

class MediaCameraCapture {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.capturedImages = [];
        this.currentFacingMode = 'environment';
        
        this.constraints = {
            video: {
                width: { ideal: 1920, max: 3840 },
                height: { ideal: 1080, max: 2160 },
                facingMode: { ideal: 'environment' }
            }
        };
    }
    
    async initCamera() {
        this.video = document.getElementById('cameraVideo');
        this.canvas = document.getElementById('cameraCanvas');
        
        if (!this.video || !this.canvas) {
            console.error('Camera elements not found');
            return false;
        }
        
        try {
            await this.checkCameraPermissions();
            await this.startCamera();
            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.handleCameraError(error);
            return false;
        }
    }
    
    async checkCameraPermissions() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not supported on this device');
        }
        
        // Check for existing permissions
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            if (cameras.length === 0) {
                throw new Error('No camera found');
            }
            
            return true;
        } catch (error) {
            throw new Error('Unable to access camera devices');
        }
    }
    
    async startCamera() {
        try {
            if (this.stream) {
                this.stopCamera();
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            this.video.srcObject = this.stream;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.video.play();
            });
            
        } catch (error) {
            console.error('Camera start failed:', error);
            throw error;
        }
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
    }
    
    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        this.constraints.video.facingMode = { ideal: this.currentFacingMode };
        
        await this.startCamera();
    }
    
    captureImage() {
        if (!this.stream || !this.video) {
            console.error('Camera not ready');
            return;
        }
        
        const context = this.canvas.getContext('2d');
        
        // Set canvas size to video size
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Draw current video frame
        context.drawImage(this.video, 0, 0);
        
        // Convert to blob
        this.canvas.toBlob((blob) => {
            this.processCapturedImage(blob);
        }, 'image/jpeg', 0.9);
    }
    
    processCapturedImage(blob) {
        const imageData = {
            blob: blob,
            url: URL.createObjectURL(blob),
            timestamp: new Date().toISOString(),
            size: blob.size
        };
        
        this.capturedImages.push(imageData);
        this.displayCapturedImage(imageData);
    }
    
    displayCapturedImage(imageData) {
        const container = document.getElementById('capturedImages');
        if (!container) return;
        
        const imageElement = document.createElement('div');
        imageElement.className = 'captured-image-item';
        imageElement.innerHTML = `
            <img src="${imageData.url}" alt="Captured image">
            <div class="image-actions">
                <button onclick="mediaCamera.retakeImage(this)">
                    <i class="fas fa-redo"></i>
                </button>
                <button onclick="mediaCamera.removeImage(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(imageElement);
    }
    
    async uploadCapturedImages() {
        if (this.capturedImages.length === 0) {
            alert('Nenhuma imagem capturada');
            return;
        }
        
        try {
            const uploads = [];
            
            for (const imageData of this.capturedImages) {
                const formData = new FormData();
                formData.append('file', imageData.blob, 'camera_capture.jpg');
                formData.append('folder', window.mediaLibrary?.currentFolder || '/products/');
                formData.append('source', 'mobile_camera');
                formData.append('title', 'Camera Capture');
                
                uploads.push(
                    fetch('/admin/api/media/upload', {
                        method: 'POST',
                        body: formData
                    })
                );
            }
            
            const responses = await Promise.all(uploads);
            const results = await Promise.all(responses.map(r => r.json()));
            
            const successful = results.filter(r => r.success).length;
            
            if (successful > 0) {
                alert(`${successful} imagem(ns) enviada(s) com sucesso!`);
                this.clearCapturedImages();
                this.closeCameraCapture();
                
                // Refresh media library if available
                if (window.mediaLibrary) {
                    window.mediaLibrary.loadMedia();
                }
            } else {
                throw new Error('Falha no upload das imagens');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro no upload das imagens');
        }
    }
    
    handleCameraError(error) {
        let message = 'Erro na câmara';
        let suggestion = '';
        
        switch (error.name) {
            case 'NotAllowedError':
                message = 'Acesso à câmara negado';
                suggestion = 'Permita o acesso à câmara nas definições';
                break;
            case 'NotFoundError':
                message = 'Câmara não encontrada';
                suggestion = 'Verifique se o dispositivo tem câmara';
                break;
            case 'NotReadableError':
                message = 'Câmara em uso por outra aplicação';
                suggestion = 'Feche outras aplicações que usem a câmara';
                break;
            default:
                message = error.message || 'Erro desconhecido na câmara';
        }
        
        console.error('Camera error:', message, suggestion);
        alert(`${message}\n${suggestion}`);
    }
    
    removeImage(button) {
        const imageItem = button.closest('.captured-image-item');
        const index = Array.from(imageItem.parentNode.children).indexOf(imageItem);
        
        // Remove from array
        if (index >= 0) {
            URL.revokeObjectURL(this.capturedImages[index].url);
            this.capturedImages.splice(index, 1);
        }
        
        // Remove from DOM
        imageItem.remove();
    }
    
    clearCapturedImages() {
        this.capturedImages.forEach(img => {
            URL.revokeObjectURL(img.url);
        });
        this.capturedImages = [];
        
        const container = document.getElementById('capturedImages');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    closeCameraCapture() {
        this.stopCamera();
        this.clearCapturedImages();
        
        const modal = document.getElementById('cameraModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Global instance
window.mediaCamera = new MediaCameraCapture();

// Global functions
window.openCameraCapture = async () => {
    const modal = document.getElementById('cameraModal');
    if (modal) {
        modal.style.display = 'block';
        await window.mediaCamera.initCamera();
    }
};

window.closeCameraCapture = () => {
    window.mediaCamera.closeCameraCapture();
};

window.switchCamera = () => {
    window.mediaCamera.switchCamera();
};

window.captureImage = () => {
    window.mediaCamera.captureImage();
};

window.uploadCapturedImages = () => {
    window.mediaCamera.uploadCapturedImages();
};

