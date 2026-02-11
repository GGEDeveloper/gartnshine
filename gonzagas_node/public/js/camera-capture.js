/**
 * =====================================================
 * CAMERA CAPTURE MODULE - Gonzaga's Art & Shine
 * =====================================================
 * In-page product photo capture via getUserMedia
 * Supports: Quick Product, Product Form (new/edit)
 * Works on mobile and desktop (webcam)
 * Modular, configurable via initCameraForForm(options)
 * =====================================================
 */

(function(global) {
  'use strict';

  class CameraCapture {
    constructor(options = {}) {
      this.container = options.container || document.body;
      this.onCapture = options.onCapture || null;
      this.onError = options.onError || null;
      this.facingMode = options.facingMode || 'environment';

      this.config = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        imageQuality: 0.85
      };

      this.stream = null;
      this.currentFacingMode = this.facingMode;
      this.videoElement = null;
      this.canvasElement = null;
      this.isActive = false;
      this.availableCameras = [];
      this.isSupported = this.checkSupport();
      this.init();
    }

    checkSupport() {
      const hasGetUserMedia = !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      );
      if (!hasGetUserMedia) return false;
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    }

    async init() {
      if (!this.isSupported) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.availableCameras = devices.filter(d => d.kind === 'videoinput');
      } catch (e) {
        console.warn('Camera init:', e);
      }
    }

    async startCamera(facingMode = this.facingMode) {
      if (!this.isSupported) {
        this.handleError('Camera not supported');
        return false;
      }
      try {
        if (this.stream) this.stopCamera();
        this.currentFacingMode = facingMode;
        const constraints = {
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.isActive = true;
        return true;
      } catch (err) {
        this.handleError(err);
        return false;
      }
    }

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }
      if (this.videoElement) this.videoElement.srcObject = null;
      this.isActive = false;
    }

    async switchCamera() {
      const next = this.currentFacingMode === 'environment' ? 'user' : 'environment';
      const ok = await this.startCamera(next);
      if (ok && this.videoElement) {
        this.videoElement.srcObject = this.stream;
        this.videoElement.style.transform = next === 'user' ? 'scaleX(-1)' : 'none';
      }
      return ok;
    }

    createUI() {
      const overlay = document.createElement('div');
      overlay.className = 'camera-overlay';
      overlay.style.setProperty('--camera-facing', this.currentFacingMode === 'user' ? '-1' : '1');
      overlay.innerHTML = `
        <div class="camera-container">
          <div class="camera-header">
            <button type="button" class="btn-close" data-camera-action="close" aria-label="Fechar">
              <i class="fas fa-times"></i>
            </button>
            <h3>Capturar Foto</h3>
            <button type="button" class="btn-switch-camera" data-camera-action="switch" 
              style="display:${this.availableCameras.length > 1 ? 'flex' : 'none'}" aria-label="Trocar câmara">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
          <div class="camera-preview">
            <video autoplay playsinline muted></video>
            <canvas style="display:none"></canvas>
          </div>
          <div class="camera-controls">
            <button type="button" class="btn-capture" data-camera-action="capture">
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
      this.videoElement = overlay.querySelector('video');
      this.canvasElement = overlay.querySelector('canvas');
      this.videoElement.style.transform = this.currentFacingMode === 'user' ? 'scaleX(-1)' : 'none';

      overlay.addEventListener('click', async (e) => {
        const action = e.target.closest('[data-camera-action]')?.dataset.cameraAction;
        if (!action) return;
        if (action === 'close') this.close();
        else if (action === 'switch') await this.switchCamera();
        else if (action === 'capture') await this.capturePhoto();
      });

      return overlay;
    }

    async open() {
      if (!this.isSupported) {
        this.handleError('Câmara não suportada. Use upload de ficheiro.');
        return false;
      }
      const overlay = this.createUI();
      const started = await this.startCamera(this.currentFacingMode);

      if (started && this.stream && this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await new Promise(r => { this.videoElement.onloadedmetadata = r; });
        await this.videoElement.play();
        return true;
      }
      this.close();
      return false;
    }

    close() {
      this.stopCamera();
      const el = this.container.querySelector('.camera-overlay');
      if (el) el.remove();
      this.videoElement = null;
      this.canvasElement = null;
    }

    async capturePhoto() {
      if (!this.videoElement || !this.canvasElement || !this.stream) return null;
      try {
        const v = this.videoElement;
        const w = v.videoWidth || 640;
        const h = v.videoHeight || 480;
        if (w <= 0 || h <= 0) {
          this.handleError('Vídeo ainda a carregar. Tente novamente.');
          return null;
        }
        this.canvasElement.width = w;
        this.canvasElement.height = h;
        const ctx = this.canvasElement.getContext('2d');
        ctx.drawImage(v, 0, 0, w, h);

        const flash = document.createElement('div');
        flash.className = 'camera-flash';
        this.container.appendChild(flash);
        setTimeout(() => flash.remove(), 200);

        const blob = await new Promise((resolve, reject) => {
          this.canvasElement.toBlob(b => b ? resolve(b) : reject(new Error('Blob failed')), 'image/jpeg', 0.85);
        });

        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (this.onCapture) this.onCapture(file, blob);
        this.close();
        return file;
      } catch (err) {
        this.handleError(err);
        return null;
      }
    }

    handleError(err) {
      let msg = 'Erro ao acessar a câmara';
      if (err && err.name === 'NotAllowedError') msg = 'Permissão negada. Permita o acesso à câmara nas definições.';
      else if (err && err.name === 'NotFoundError') msg = 'Nenhuma câmara encontrada.';
      else if (err && err.name === 'NotReadableError') msg = 'Câmara em uso por outra aplicação.';
      else if (typeof err === 'string') msg = err;

      if (global.notifications && typeof global.notifications.error === 'function') {
        global.notifications.error(msg);
      } else {
        alert(msg);
      }
      if (this.onError) this.onError(err);
      this.close();
    }

    static isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  }

  /**
   * Initialize camera for a product form.
   * @param {HTMLFormElement} formElement - The form
   * @param {Object} options - { imageInputName, multiple, mobileOnly, previewContainer }
   */
  function initCameraForForm(formElement, options = {}) {
    if (typeof options === 'string') options = { imageInputName: options };
    const {
      imageInputName = 'images',
      multiple = true,
      mobileOnly = false
    } = options;

    const cameraButton = formElement.querySelector('[data-action="open-camera"]');
    const fileInput = formElement.querySelector(`input[name="${imageInputName}"]`);

    if (!cameraButton || !fileInput) return;

    const isMobile = CameraCapture.isMobileDevice();
    if (mobileOnly && !isMobile) {
      cameraButton.style.display = 'none';
      return;
    }

    const instance = new CameraCapture({
      container: document.body,
      facingMode: 'environment',
      onCapture: (file, blob) => {
        const dt = new DataTransfer();
        if (multiple && fileInput.files && fileInput.files.length > 0) {
          for (let i = 0; i < fileInput.files.length; i++) dt.items.add(fileInput.files[i]);
        }
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        if (global.notifications && typeof global.notifications.success === 'function') {
          global.notifications.success('Foto capturada!');
        }
      },
      onError: () => {
        if (global.notifications && typeof global.notifications.error === 'function') {
          global.notifications.error('Use o upload de ficheiro.');
        } else {
          alert('Use o upload de ficheiro.');
        }
      }
    });

    cameraButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await instance.open();
    });
  }

  global.CameraCapture = CameraCapture;
  global.initCameraForForm = initCameraForForm;

})(typeof window !== 'undefined' ? window : this);
