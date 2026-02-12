/**
 * Media Picker - Seleção de imagens da biblioteca para produtos
 * Gonzaga's Art & Shine - Integração Media Library ↔ Produtos
 */

(function() {
  'use strict';

  const THUMB_URL = '/admin/api/media/thumb?path=';
  const API_MEDIA = '/admin/api/media';

  function getProductImageFilename(fsPath) {
    if (!fsPath) return null;
    const p = String(fsPath).replace(/\\/g, '/').trim();
    if (p.startsWith('products/')) return p.replace(/^products\//, '');
    if (p.startsWith('products')) return p.replace(/^products\/?/, '');
    return p;
  }

  function createModal() {
    if (document.getElementById('mediaPickerModal')) return;
    const modal = document.createElement('div');
    modal.id = 'mediaPickerModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-images me-2"></i>Selecionar da Biblioteca de Media</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <div class="input-group">
                <input type="text" class="form-control" id="mediaPickerSearch" placeholder="Pesquisar ficheiros...">
                <select class="form-select" id="mediaPickerFolder" style="max-width: 150px;">
                  <option value="products">Produtos</option>
                  <option value="gallery">Gallery</option>
                  <option value="">Todos</option>
                </select>
                <button type="button" class="btn btn-outline-primary" id="mediaPickerLoad">Carregar</button>
              </div>
            </div>
            <div id="mediaPickerGrid" class="row g-2" style="min-height: 200px;"></div>
            <div id="mediaPickerLoading" class="text-center py-4" style="display:none;">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2">A carregar...</p>
            </div>
            <div id="mediaPickerEmpty" class="text-center py-4 text-muted" style="display:none;">
              Nenhum ficheiro na pasta produtos. Faça upload na <a href="/admin/media/library">Biblioteca</a>.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="mediaPickerConfirm">
              <i class="fas fa-check me-1"></i>Adicionar selecionados
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async function loadMedia(folder, search, page = 1) {
    const params = new URLSearchParams({
      folder: folder ? `/${folder}/` : '',
      search: search || '',
      page,
      limit: 24,
      sort: 'filename:asc'
    });
    const res = await fetch(`${API_MEDIA}?${params}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erro ao carregar');
    return data;
  }

  function renderGrid(media, selected) {
    const grid = document.getElementById('mediaPickerGrid');
    if (!media || media.length === 0) {
      grid.innerHTML = '';
      document.getElementById('mediaPickerEmpty').style.display = 'block';
      return;
    }
    document.getElementById('mediaPickerEmpty').style.display = 'none';
    grid.innerHTML = media.map(file => {
      const fsPath = file._fsPath || file.file_path || '';
      const thumbUrl = file._fsPath ? `${THUMB_URL}${encodeURIComponent(file._fsPath)}` : (file.url || '');
      const filename = getProductImageFilename(fsPath);
      const inProducts = !fsPath || fsPath.startsWith('products');
      const checked = selected.has(fsPath);
      return `
        <div class="col-4 col-md-3 col-lg-2">
          <div class="card h-100 media-picker-card ${checked ? 'border-primary' : ''}" 
               data-fs-path="${(fsPath || '').replace(/"/g, '&quot;')}"
               data-filename="${(filename || '').replace(/"/g, '&quot;')}"
               data-in-products="${inProducts}">
            <div class="card-body p-1 text-center">
              <img src="${thumbUrl}" alt="" class="img-fluid rounded" style="height:80px;object-fit:cover;width:100%;" 
                   onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23eee%22 width=%2280%22 height=%2280%22/%3E%3C/svg%3E'">
              <div class="form-check mt-1 mb-0">
                <input class="form-check-input media-picker-check" type="checkbox" ${checked ? 'checked' : ''} 
                       ${!inProducts ? 'disabled title="Apenas imagens da pasta Produtos"' : ''}>
              </div>
              <small class="d-block text-truncate" title="${(file.filename || '').replace(/"/g, '&quot;')}">${file.filename || ''}</small>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.media-picker-card').forEach(card => {
      const checkbox = card.querySelector('.media-picker-check');
      if (checkbox?.disabled) return;
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        checkbox.checked = !checkbox.checked;
        card.classList.toggle('border-primary', checkbox.checked);
      });
    });
  }

  window.MediaPicker = {
    open: function(callback) {
      createModal();
      const modalEl = document.getElementById('mediaPickerModal');
      const bsModal = window.bootstrap?.Modal ? new bootstrap.Modal(modalEl) : null;
      const selected = new Set();

      const folder = document.getElementById('mediaPickerFolder').value;
      const search = document.getElementById('mediaPickerSearch').value;

      document.getElementById('mediaPickerLoading').style.display = 'block';
      document.getElementById('mediaPickerGrid').style.display = 'none';

      loadMedia(folder, search).then(data => {
        document.getElementById('mediaPickerLoading').style.display = 'none';
        document.getElementById('mediaPickerGrid').style.display = 'flex';
        renderGrid(data.media || [], selected);
      }).catch(err => {
        document.getElementById('mediaPickerLoading').style.display = 'none';
        document.getElementById('mediaPickerGrid').innerHTML = `<div class="col-12 text-danger">${err.message}</div>`;
      });

      document.getElementById('mediaPickerLoad').onclick = () => {
        document.getElementById('mediaPickerLoading').style.display = 'block';
        const f = document.getElementById('mediaPickerFolder').value;
        const s = document.getElementById('mediaPickerSearch').value;
        loadMedia(f, s).then(data => {
          document.getElementById('mediaPickerLoading').style.display = 'none';
          renderGrid(data.media || [], selected);
        }).catch(err => {
          document.getElementById('mediaPickerLoading').style.display = 'none';
          document.getElementById('mediaPickerGrid').innerHTML = `<div class="col-12 text-danger">${err.message}</div>`;
        });
      };

      document.getElementById('mediaPickerConfirm').onclick = () => {
        const items = [];
        document.querySelectorAll('#mediaPickerGrid .media-picker-check:checked:not([disabled])').forEach(cb => {
          const card = cb.closest('.media-picker-card');
          if (card) {
            const filename = card.dataset.filename;
            const fsPath = card.dataset.fsPath;
            if (filename && card.dataset.inProducts === 'true') {
              items.push({ filename, _fsPath: fsPath });
            }
          }
        });
        if (typeof callback === 'function') callback(items);
        if (bsModal) bsModal.hide();
      };

      if (bsModal) bsModal.show();
    }
  };
})();
