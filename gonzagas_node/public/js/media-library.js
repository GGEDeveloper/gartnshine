/**
 * Media Library Management System
 * Advanced media management with drag & drop, filtering, editing
 */

class MediaLibrary {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/admin/api/media';
        this.uploadEndpoint = options.uploadEndpoint || '/admin/api/media/upload';
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024;
        this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        this.currentView = 'grid'; // grid or list
        this.selectedFiles = new Set();
        this.currentFolder = '';
        this.currentTags = [];
        this.currentSearch = '';
        this.currentSort = 'created_at:desc';
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.totalItems = 0;
        
        this.uploadQueue = [];
        this.isUploading = false;
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.bindEvents();
        this.loadMedia();
        this.setupKeyboardShortcuts();
    }
    
    setupDragAndDrop() {
        const dropzone = document.getElementById('dropzone');
        if (!dropzone) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            }, false);
        });
        
        dropzone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFilesUpload(files);
        }, false);
    }
    
    bindEvents() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFilesUpload(files);
            });
        }
        
        // Search
        const searchInput = document.getElementById('mediaSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.currentPage = 1;
                    this.loadMedia();
                }, 300);
            });
        }
        
        // Filters
        const folderSelect = document.getElementById('folderSelect');
        if (folderSelect) {
            folderSelect.addEventListener('change', (e) => {
                this.currentFolder = e.target.value;
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        const tagSelect = document.getElementById('tagSelect');
        if (tagSelect) {
            tagSelect.addEventListener('change', (e) => {
                this.currentTags = Array.from(e.target.selectedOptions).map(opt => opt.value);
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        // Items per page
        const limitSelect = document.getElementById('limitSelect');
        if (limitSelect) {
            limitSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        // View mode toggle
        const viewToggle = document.getElementById('toggleViewMode');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                this.toggleViewMode();
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + A - Select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }
            
            // Delete - Delete selected
            if (e.key === 'Delete' && this.selectedFiles.size > 0) {
                e.preventDefault();
                this.deleteSelected();
            }
            
            // Escape - Clear selection
            if (e.key === 'Escape') {
                this.clearSelection();
                this.closeModals();
            }
        });
    }
    
    async loadMedia() {
        try {
            this.showLoading(true);
            
            const params = new URLSearchParams({
                folder: this.currentFolder,
                search: this.currentSearch,
                sort: this.currentSort,
                page: this.currentPage,
                limit: this.itemsPerPage
            });
            
            if (this.currentTags.length > 0) {
                params.append('tags', this.currentTags.join(','));
            }
            
            const response = await fetch(`${this.apiEndpoint}?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderMedia(data.media);
                this.updatePagination(data.pagination);
                this.totalItems = data.pagination.total;
            } else {
                throw new Error(data.message || 'Failed to load media');
            }
            
        } catch (error) {
            console.error('Load media error:', error);
            this.showError('Erro ao carregar ficheiros de media');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderMedia(mediaFiles) {
        const grid = document.getElementById('mediaGrid');
        const noResults = document.getElementById('noResults');
        
        if (!mediaFiles || mediaFiles.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            this.mediaCache = new Map();
            const dropzone = document.getElementById('dropzone');
            if (dropzone) dropzone.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        this.mediaCache = new Map(mediaFiles.map(f => [f.id, f]));
        grid.innerHTML = mediaFiles.map(file => this.createMediaCard(file)).join('');
        
        const dropzone = document.getElementById('dropzone');
        if (dropzone) dropzone.style.display = 'none';
        
        if (document.getElementById('loadingState')) document.getElementById('loadingState').style.display = 'none';
        if (grid) grid.style.display = 'grid';
        
        // Bind card events
        this.bindMediaCardEvents();
    }
    
    createMediaCard(file) {
        const isSelected = this.selectedFiles.has(file.id);
        const tags = (file.tags || []).map(tag => 
            `<span class="tag" style="background-color: ${tag.color}20; color: ${tag.color};">${tag.name}</span>`
        ).join('');
        
        const fsPath = (file._fsPath || '').replace(/"/g, '&quot;');
        return `
            <div class="media-card ${isSelected ? 'selected' : ''}" 
                 data-media-id="${file.id}"
                 data-filename="${file.filename}"
                 data-type="${file.mime_type}"
                 data-fs-path="${fsPath}">
                
                <div class="media-card-image">
                    <img src="${file.variants.medium || file.url}" 
                         alt="${file.alt_text || file.original_name}"
                         loading="lazy"
                         onerror="this.src='${file.url}'">
                    
                    <!-- Selection Checkbox -->
                    <div class="media-checkbox">
                        <input type="checkbox" 
                               ${isSelected ? 'checked' : ''} 
                               onchange="window.mediaLibrary.toggleSelection(${file.id}, this.checked)">
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="media-actions">
                        <button class="action-btn" 
                                onclick="window.mediaLibrary.viewMedia(${file.id})"
                                title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        <button class="action-btn" 
                                onclick="window.mediaLibrary.editMedia(${file.id})"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        
                        <button class="action-btn" 
                                onclick="window.mediaLibrary.copyUrl('${file.url}')"
                                title="Copiar URL">
                            <i class="fas fa-copy"></i>
                        </button>
                        
                        <button class="action-btn danger" 
                                onclick="window.mediaLibrary.deleteMedia(${file.id}, '${(file._fsPath || '').replace(/'/g, "\\'")}')"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <!-- File Type Badge -->
                    <div class="file-type-badge">
                        ${this.getFileTypeIcon(file.mime_type)}
                    </div>
                </div>
                
                <div class="media-card-info">
                    <h4 class="media-title" title="${file.title || file.original_name}">
                        ${file.title || file.original_name}
                    </h4>
                    
                    <div class="media-meta">
                        <span class="file-size">${file.file_size_formatted}</span>
                        ${file.dimensions.width ? 
                            `<span class="dimensions">${file.dimensions.width} × ${file.dimensions.height}</span>` : 
                            ''
                        }
                    </div>
                    
                    ${tags ? `<div class="media-tags">${tags}</div>` : ''}
                    
                    <div class="media-date">${file.created_ago}</div>
                </div>
            </div>
        `;
    }
    
    bindMediaCardEvents() {
        // Double-click to view details
        document.querySelectorAll('.media-card').forEach(card => {
            card.addEventListener('dblclick', () => {
                const mediaId = parseInt(card.dataset.mediaId);
                this.viewMedia(mediaId);
            });
            
            // Single click to select
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.media-checkbox') && !e.target.closest('.media-actions')) {
                    const mediaId = parseInt(card.dataset.mediaId);
                    const isSelected = this.selectedFiles.has(mediaId);
                    
                    if (e.ctrlKey || e.metaKey) {
                        // Toggle selection with Ctrl/Cmd
                        this.toggleSelection(mediaId, !isSelected);
                    } else {
                        // Replace selection
                        this.clearSelection();
                        this.toggleSelection(mediaId, true);
                    }
                }
            });
        });
    }
    
    async handleFilesUpload(files) {
        // Validate files
        const validFiles = [];
        const errors = [];
        
        for (const file of files) {
            if (!this.allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Tipo de ficheiro não suportado`);
                continue;
            }
            
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name}: Ficheiro demasiado grande (máx. ${this.formatFileSize(this.maxFileSize)})`);
                continue;
            }
            
            validFiles.push(file);
        }
        
        if (errors.length > 0) {
            this.showError('Alguns ficheiros foram rejeitados:\n' + errors.join('\n'));
        }
        
        if (validFiles.length === 0) return;
        
        // Add files to upload queue
        this.uploadQueue.push(...validFiles);
        this.processUploadQueue();
    }
    
    async processUploadQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) return;
        
        this.isUploading = true;
        this.showUploadProgress(true);
        
        const totalFiles = this.uploadQueue.length;
        let processedFiles = 0;
        
        while (this.uploadQueue.length > 0) {
            const file = this.uploadQueue.shift();
            
            try {
                await this.uploadSingleFile(file, processedFiles + 1, totalFiles);
                processedFiles++;
            } catch (error) {
                console.error('Upload error:', error);
                this.showError(`Erro no upload de ${file.name}: ${error.message}`);
            }
        }
        
        this.isUploading = false;
        this.showUploadProgress(false);
        
        // Reload media after upload
        this.loadMedia();
        
        this.showSuccess(`${processedFiles} ficheiro(s) enviado(s) com sucesso!`);
    }
    
    async uploadSingleFile(file, current, total) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', this.currentFolder || '/products/');
        formData.append('source', 'web');
        
        // Show individual upload progress
        this.updateUploadProgress(file.name, 0, current, total);
        
        const response = await fetch(this.uploadEndpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
        
        this.updateUploadProgress(file.name, 100, current, total);
        return response.json();
    }
    
    showUploadProgress(show) {
        const container = document.querySelector('.upload-progress-container');
        const dropzoneContent = document.querySelector('.dropzone-content');
        
        if (container) {
            container.style.display = show ? 'block' : 'none';
        }
        
        if (dropzoneContent) {
            dropzoneContent.style.display = show ? 'none' : 'block';
        }
    }
    
    updateUploadProgress(filename, progress, current, total) {
        const container = document.getElementById('uploadProgressItems');
        if (!container) return;
        
        let progressItem = container.querySelector(`[data-filename="${filename}"]`);
        
        if (!progressItem) {
            progressItem = document.createElement('div');
            progressItem.className = 'upload-progress-item';
            progressItem.dataset.filename = filename;
            progressItem.innerHTML = `
                <div class="progress-info">
                    <span class="filename">${filename}</span>
                    <span class="progress-text">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-status">Enviando ${current} de ${total}</div>
            `;
            container.appendChild(progressItem);
        }
        
        const progressFill = progressItem.querySelector('.progress-fill');
        const progressText = progressItem.querySelector('.progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;
        
        if (progress === 100) {
            progressItem.classList.add('completed');
            setTimeout(() => {
                progressItem.remove();
            }, 2000);
        }
    }
    
    // Media management methods
    async viewMedia(mediaId) {
        const cached = this.mediaCache && this.mediaCache.get(Number(mediaId));
        if (cached) {
            this.currentMediaDetail = cached;
            this.showMediaDetail(cached);
            return;
        }
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentMediaDetail = data.media;
                this.showMediaDetail(data.media);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('View media error:', error);
            this.showError('Erro ao carregar detalhes do ficheiro');
        }
    }
    
    showMediaDetail(media) {
        const modal = document.getElementById('mediaDetailModal');
        const content = document.getElementById('mediaDetailContent');
        
        content.innerHTML = `
            <div class="media-detail-layout">
                <div class="media-detail-image">
                    <img src="${media.variants.large || media.url}" alt="${media.alt_text || media.original_name}">
                    
                    <div class="image-variants">
                        <h4>Variantes Disponíveis:</h4>
                        <div class="variants-list">
                            <a href="${media.url}" target="_blank" class="variant-link">
                                <i class="fas fa-expand"></i> Original (${media.file_size_formatted})
                            </a>
                            ${Object.entries(media.variants).map(([size, url]) => `
                                <a href="${url}" target="_blank" class="variant-link">
                                    <i class="fas fa-image"></i> ${size}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="media-detail-info">
                    <h3>${media.title || media.original_name}</h3>
                    
                    <div class="detail-section">
                        <h4>Informação do Ficheiro</h4>
                        <dl class="detail-list">
                            <dt>Nome do Ficheiro:</dt>
                            <dd>${media.filename}</dd>
                            
                            <dt>Nome Original:</dt>
                            <dd>${media.original_name}</dd>
                            
                            <dt>Tamanho:</dt>
                            <dd>${media.file_size_formatted}</dd>
                            
                            <dt>Dimensões:</dt>
                            <dd>${(media.dimensions && media.dimensions.width) ? `${media.dimensions.width} × ${media.dimensions.height} px` : '-'}</dd>
                            
                            <dt>Tipo:</dt>
                            <dd>${media.mime_type}</dd>
                            
                            <dt>Enviado:</dt>
                            <dd>${media.created_at ? new Date(media.created_at).toLocaleString('pt-PT') : '-'}</dd>
                            
                            <dt>URL:</dt>
                            <dd>
                                <input type="text" value="${window.location.origin}${media.url}" readonly class="url-input">
                                <button onclick="window.mediaLibrary.copyUrl('${media.url}')" class="btn btn-sm">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </dd>
                        </dl>
                    </div>
                    
                    ${media.alt_text || media.description ? `
                        <div class="detail-section">
                            <h4>Metadata</h4>
                            <dl class="detail-list">
                                ${media.alt_text ? `
                                    <dt>Texto Alternativo:</dt>
                                    <dd>${media.alt_text}</dd>
                                ` : ''}
                                ${media.description ? `
                                    <dt>Descrição:</dt>
                                    <dd>${media.description}</dd>
                                ` : ''}
                            </dl>
                        </div>
                    ` : ''}
                    
                    ${(media.tags && media.tags.length) > 0 ? `
                        <div class="detail-section">
                            <h4>Tags</h4>
                            <div class="tags-display">
                                ${media.tags.map(tag => `
                                    <span class="tag" style="background-color: ${tag.color}20; color: ${tag.color};">
                                        ${tag.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="window.mediaLibrary.editMedia(${media.id}); window.mediaLibrary.closeMediaDetail();">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        
                        <button class="btn btn-secondary" onclick="window.mediaLibrary.copyUrl('${media.url}')">
                            <i class="fas fa-copy"></i> Copiar URL
                        </button>
                        
                        <button class="btn btn-danger" onclick="window.mediaLibrary.deleteMedia(${media.id}, '${(media._fsPath || '').replace(/'/g, "\\'")}'); window.mediaLibrary.closeMediaDetail();">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    async editMedia(mediaId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showEditMedia(data.media);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Edit media error:', error);
            this.showError('Erro ao carregar ficheiro para edição');
        }
    }
    
    showEditMedia(media) {
        const modal = document.getElementById('editMediaModal');
        
        // Fill form with current values
        document.getElementById('editMediaId').value = media.id;
        document.getElementById('editTitle').value = media.title || '';
        document.getElementById('editAltText').value = media.alt_text || '';
        document.getElementById('editDescription').value = media.description || '';
        document.getElementById('editFolder').value = media.folder_path;
        
        // Handle tags
        const tagsInput = document.getElementById('editTags');
        const selectedTags = document.getElementById('selectedTags');
        
        if (media.tags) {
            const tagNames = media.tags.map(tag => tag.name);
            tagsInput.value = tagNames.join(', ');
            
            selectedTags.innerHTML = media.tags.map(tag => `
                <span class="selected-tag" style="background-color: ${tag.color}20; color: ${tag.color};">
                    ${tag.name}
                    <button type="button" onclick="this.parentElement.remove()">×</button>
                </span>
            `).join('');
        }
        
        modal.style.display = 'block';
    }
    
    async saveMediaEdit() {
        const mediaId = document.getElementById('editMediaId').value;
        const formData = {
            title: document.getElementById('editTitle').value,
            alt_text: document.getElementById('editAltText').value,
            description: document.getElementById('editDescription').value,
            folder_path: document.getElementById('editFolder').value,
            tags: document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Ficheiro atualizado com sucesso!');
                this.closeEditMedia();
                this.loadMedia();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Save media edit error:', error);
            this.showError('Erro ao guardar alterações');
        }
    }
    
    async deleteMedia(mediaId, fsPath, skipConfirm) {
        if (!skipConfirm && !confirm('Tem certeza que deseja eliminar este ficheiro? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        const path = fsPath || (this.currentMediaDetail && this.currentMediaDetail._fsPath) || 
            (document.querySelector(`[data-media-id="${mediaId}"]`)?.dataset?.fsPath || '');
        
        try {
            const url = path ? `${this.apiEndpoint}/${mediaId}?path=${encodeURIComponent(path)}` : `${this.apiEndpoint}/${mediaId}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Ficheiro eliminado com sucesso!');
                this.loadMedia();
                this.selectedFiles.delete(mediaId);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Delete media error:', error);
            this.showError('Erro ao eliminar ficheiro');
        }
    }
    
    // Utility methods
    toggleSelection(mediaId, selected) {
        if (selected) {
            this.selectedFiles.add(mediaId);
        } else {
            this.selectedFiles.delete(mediaId);
        }
        
        // Update UI
        const card = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (card) {
            card.classList.toggle('selected', selected);
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = selected;
            }
        }
        
        this.updateSelectionUI();
    }
    
    async deleteSelected() {
        if (this.selectedFiles.size === 0) return;
        if (!confirm(`Eliminar ${this.selectedFiles.size} ficheiro(s) selecionado(s)? Esta ação não pode ser desfeita.`)) return;
        for (const mediaId of [...this.selectedFiles]) {
            const card = document.querySelector(`[data-media-id="${mediaId}"]`);
            const fsPath = card?.dataset?.fsPath || (this.mediaCache?.get(Number(mediaId))?._fsPath);
            await this.deleteMedia(mediaId, fsPath, true);
        }
        this.selectedFiles.clear();
        this.loadMedia();
    }

    selectAll() {
        const cards = document.querySelectorAll('.media-card');
        cards.forEach(card => {
            const mediaId = parseInt(card.dataset.mediaId);
            this.toggleSelection(mediaId, true);
        });
    }
    
    clearSelection() {
        this.selectedFiles.clear();
        document.querySelectorAll('.media-card.selected').forEach(card => {
            card.classList.remove('selected');
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        this.updateSelectionUI();
    }
    
    updateSelectionUI() {
        // Update selection count and show/hide bulk actions
        const count = this.selectedFiles.size;
        // Implementation for showing selection status and bulk actions
    }
    
    copyUrl(url) {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            this.showSuccess('URL copiado para a área de transferência!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                this.showSuccess('URL copiado para a área de transferência!');
            } catch (err) {
                console.error('Failed to copy URL:', err);
                this.showError('Erro ao copiar URL');
            }
            document.body.removeChild(textArea);
        });
    }
    
    toggleViewMode() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        const grid = document.getElementById('mediaGrid');
        const toggleBtn = document.getElementById('toggleViewMode');
        
        grid.className = `media-${this.currentView}`;
        
        if (this.currentView === 'grid') {
            toggleBtn.innerHTML = '<i class="fas fa-th-large"></i><span>Grelha</span>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-list"></i><span>Lista</span>';
        }
    }
    
    updatePagination(paginationData) {
        const { page, totalPages, total, limit } = paginationData;
        
        // Update pagination info
        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);
        document.getElementById('paginationInfo').textContent = 
            `Mostrando ${start}-${end} de ${total} ficheiros`;
        
        // Update pagination buttons
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = this.generatePaginationHTML(page, totalPages);
    }
    
    generatePaginationHTML(currentPage, totalPages) {
        let html = '';
        
        // Previous button
        html += `
            <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="window.mediaLibrary.goToPage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<button class="page-btn" onclick="window.mediaLibrary.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="window.mediaLibrary.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="page-ellipsis">...</span>`;
            }
            html += `<button class="page-btn" onclick="window.mediaLibrary.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        html += `
            <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="window.mediaLibrary.goToPage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        return html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadMedia();
    }
    
    // UI helper methods
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const mediaGrid = document.getElementById('mediaGrid');
        
        if (loadingState) loadingState.style.display = show ? 'block' : 'none';
        if (mediaGrid) mediaGrid.style.display = show ? 'none' : 'grid';
    }
    
    showError(message) {
        // Create and show error notification
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        // Create and show success notification
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    getFileTypeIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return '<i class="fas fa-image"></i>';
        }
        return '<i class="fas fa-file"></i>';
    }
    
    // Modal methods
    closeMediaDetail() {
        document.getElementById('mediaDetailModal').style.display = 'none';
    }
    
    closeEditMedia() {
        document.getElementById('editMediaModal').style.display = 'none';
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Global functions for inline handlers
window.openMediaDetail = (mediaId) => {
    if (window.mediaLibrary) {
        window.mediaLibrary.viewMedia(mediaId);
    }
};

window.closeMediaDetail = () => {
    if (window.mediaLibrary) {
        window.mediaLibrary.closeMediaDetail();
    }
};

window.closeEditMedia = () => {
    if (window.mediaLibrary) {
        window.mediaLibrary.closeEditMedia();
    }
};

window.saveMediaEdit = () => {
    if (window.mediaLibrary) {
        window.mediaLibrary.saveMediaEdit();
    }
};

window.MediaLibrary = MediaLibrary;
