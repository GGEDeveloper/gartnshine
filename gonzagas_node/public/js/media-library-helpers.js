/**
 * Media Library Helper Functions
 */

// Adicionar métodos helper ao MediaLibrary
if (typeof MediaLibrary !== 'undefined') {
    
    MediaLibrary.prototype.startEditingTitle = function(titleElement) {
        titleElement.contentEditable = 'true';
        titleElement.classList.add('editing');
        titleElement.focus();
        
        // Select all text
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(titleElement);
        sel.removeAllRanges();
        sel.addRange(range);
    };
    
    MediaLibrary.prototype.saveTitle = function(titleElement) {
        const newName = titleElement.textContent.trim();
        const original = titleElement.dataset.original;
        const mediaId = titleElement.dataset.mediaId;
        
        titleElement.contentEditable = 'false';
        titleElement.classList.remove('editing');
        
        if (newName && newName !== original) {
            this.updateMediaName(mediaId, newName);
            titleElement.dataset.original = newName;
        } else {
            titleElement.textContent = original;
        }
    };
    
    MediaLibrary.prototype.quickEditName = function(mediaId) {
        const card = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (!card) return;
        
        const title = card.querySelector('.media-title');
        if (title) {
            this.startEditingTitle(title);
        }
    };
    
    MediaLibrary.prototype.updateMediaName = async function(mediaId, newName) {
        try {
            // Para filesystem media, precisamos renomear o ficheiro
            const fsPath = document.querySelector(`[data-media-id="${mediaId}"]`)?.dataset.fsPath;
            
            if (fsPath) {
                // Rename filesystem file
                const response = await fetch(`${this.apiEndpoint}/${mediaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: newName
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showSuccess('Nome atualizado com sucesso!');
                } else {
                    throw new Error(data.message || 'Erro ao atualizar nome');
                }
            }
            
        } catch (error) {
            console.error('Update name error:', error);
            this.showError('Erro ao atualizar nome: ' + error.message);
            this.loadMedia(); // Reload to restore original
        }
    };
    
    MediaLibrary.prototype.showMediaPreview = function(mediaId) {
        const card = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (!card) return;
        
        const fullUrl = card.dataset.fullUrl;
        const fsPath = card.dataset.fsPath;
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content large">
                <div class="modal-header">
                    <h3><i class="fas fa-image"></i> Pré-visualização</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <img src="${fullUrl}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;" alt="Preview">
                    <div style="margin-top: 1.5rem;">
                        <input type="text" 
                               value="${fullUrl}" 
                               readonly 
                               class="form-control" 
                               onclick="this.select()"
                               style="font-family: monospace; font-size: 0.875rem;">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Fechar
                    </button>
                    <button class="btn btn-primary" onclick="window.mediaLibrary.copyUrl('${fullUrl}'); this.closest('.modal').remove();">
                        <i class="fas fa-copy"></i> Copiar URL
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    MediaLibrary.prototype.toggleSelection = function(mediaId, checked) {
        if (checked) {
            this.selectedFiles.add(mediaId);
        } else {
            this.selectedFiles.delete(mediaId);
        }
        
        // Update card visual state
        const card = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (card) {
            if (checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
        
        // Update selection count if exists
        this.updateSelectionCount();
    };
    
    MediaLibrary.prototype.updateSelectionCount = function() {
        const count = this.selectedFiles.size;
        const countElement = document.getElementById('selectionCount');
        if (countElement) {
            countElement.textContent = count;
        }
        
        // Show/hide bulk actions
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            bulkActions.style.display = count > 0 ? 'flex' : 'none';
        }
    };
    
    MediaLibrary.prototype.getFileTypeIcon = function(mimeType) {
        if (!mimeType) return 'IMG';
        
        if (mimeType.startsWith('image/')) {
            const ext = mimeType.split('/')[1].toUpperCase();
            return ext.substring(0, 4);
        }
        
        return 'FILE';
    };
}
