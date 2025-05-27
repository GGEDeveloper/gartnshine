/**
 * Script principal do painel administrativo
 * 
 * Este arquivo é carregado em todas as páginas do painel administrativo
 * e contém inicializações e funções globais.
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
  // Inicializa tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Inicializa popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'hover',
      html: true,
      container: 'body'
    });
  });
  
  // Inicializa toasts
  const toastElList = [].slice.call(document.querySelectorAll('.toast'));
  toastElList.map(function(toastEl) {
    return new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 5000
    }).show();
  });
  
  // Inicializa os selects personalizados
  if (typeof $.fn.select2 !== 'undefined') {
    $('.select2').select2({
      theme: 'bootstrap4',
      width: '100%',
      placeholder: 'Selecione uma opção',
      allowClear: true
    });
  }
  
  // Inicializa os datepickers
  if (typeof $.fn.datepicker !== 'undefined') {
    $('.datepicker').datepicker({
      format: 'dd/mm/yyyy',
      autoclose: true,
      todayHighlight: true,
      language: 'pt-BR'
    });
  }
  
  // Inicializa os timepickers
  if (typeof $.fn.timepicker !== 'undefined') {
    $('.timepicker').timepicker({
      showMeridian: false,
      showInputs: false,
      minuteStep: 5
    });
  }
  
  // Inicializa os inputs de arquivo personalizados
  bsCustomFileInput.init();
  
  // Inicializa os modais
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const title = button.getAttribute('data-bs-title') || '';
      const url = button.getAttribute('data-bs-url') || '';
      const size = button.getAttribute('data-bs-size') || '';
      
      const modalTitle = modal.querySelector('.modal-title');
      const modalBody = modal.querySelector('.modal-body');
      const modalDialog = modal.querySelector('.modal-dialog');
      
      if (title) {
        modalTitle.textContent = title;
      }
      
      if (size) {
        modalDialog.classList.add(`modal-${size}`);
      }
      
      if (url) {
        // Mostra um indicador de carregamento
        modalBody.innerHTML = `
          <div class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2">Carregando...</p>
          </div>
        `;
        
        // Carrega o conteúdo via AJAX
        fetch(url)
          .then(response => response.text())
          .then(html => {
            modalBody.innerHTML = html;
            // Inicializa componentes dentro do modal
            initComponents(modalBody);
          })
          .catch(error => {
            console.error('Erro ao carregar o conteúdo do modal:', error);
            modalBody.innerHTML = `
              <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Ocorreu um erro ao carregar o conteúdo. Tente novamente.
              </div>
            `;
          });
      }
    });
    
    // Limpa o conteúdo do modal quando ele é fechado
    modal.addEventListener('hidden.bs.modal', function () {
      const modalBody = modal.querySelector('.modal-body');
      modalBody.innerHTML = '';
      
      const modalDialog = modal.querySelector('.modal-dialog');
      modalDialog.classList.remove('modal-sm', 'modal-lg', 'modal-xl');
    });
  });
  
  // Inicializa os formulários com validação
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
  
  // Adiciona máscaras aos campos de formulário
  if (typeof $.fn.mask !== 'undefined') {
    $('.mask-phone').mask('(00) 00000-0000');
    $('.mask-cpf').mask('000.000.000-00');
    $('.mask-cnpj').mask('00.000.000/0000-00');
    $('.mask-cep').mask('00000-000');
    $('.mask-money').mask('000.000.000.000.000,00', {reverse: true});
    $('.mask-percent').mask('##0,00%', {reverse: true});
  }
  
  // Inicializa o tema escuro/claro
  initTheme();
  
  // Inicializa os componentes personalizados
  initComponents(document);
});

/**
 * Inicializa componentes personalizados
 * @param {HTMLElement} context - Elemento raiz para busca de componentes
 */
function initComponents(context) {
  // Inicializa os elementos de preview de imagem
  const fileInputs = context.querySelectorAll('.custom-file-input[type="file"]');
  fileInputs.forEach(input => {
    const preview = input.dataset.preview ? context.querySelector(input.dataset.preview) : null;
    
    input.addEventListener('change', function() {
      const file = this.files[0];
      
      if (file && preview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          if (preview.tagName === 'IMG') {
            preview.src = e.target.result;
          } else {
            preview.style.backgroundImage = `url(${e.target.result})`;
          }
          
          preview.classList.remove('d-none');
        };
        
        reader.readAsDataURL(file);
      }
    });
  });
  
  // Inicializa os elementos de toggle de senha
  const togglePasswordButtons = context.querySelectorAll('.toggle-password');
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.dataset.target;
      const targetInput = document.querySelector(targetId);
      
      if (targetInput) {
        const type = targetInput.type === 'password' ? 'text' : 'password';
        targetInput.type = type;
        
        // Alterna o ícone
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      }
    });
  });
  
  // Inicializa os elementos de contagem de caracteres
  const charCounters = context.querySelectorAll('.char-counter');
  charCounters.forEach(counter => {
    const targetId = counter.dataset.target;
    const targetInput = document.querySelector(targetId);
    const maxLength = parseInt(counter.dataset.maxlength) || 0;
    
    if (targetInput && maxLength > 0) {
      const updateCounter = () => {
        const currentLength = targetInput.value.length;
        const remaining = maxLength - currentLength;
        
        counter.textContent = `${currentLength} / ${maxLength}`;
        
        if (remaining < 0) {
          counter.classList.add('text-danger');
          counter.classList.remove('text-muted');
        } else {
          counter.classList.remove('text-danger');
          counter.classList.add('text-muted');
        }
      };
      
      targetInput.addEventListener('input', updateCounter);
      updateCounter(); // Atualiza o contador no carregamento
    }
  });
}

/**
 * Inicializa o tema (claro/escuro)
 */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Verifica o tema salvo no localStorage ou usa a preferência do sistema
  const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
  
  // Aplica o tema
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    if (themeToggle) {
      themeToggle.checked = true;
      const icon = themeToggle.nextElementSibling.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    }
  }
  
  // Adiciona o listener para alternar o tema
  if (themeToggle) {
    themeToggle.addEventListener('change', function() {
      const icon = this.nextElementSibling.querySelector('i');
      
      if (this.checked) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (icon) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        }
      } else {
        document.documentElement.removeAttribute('data-bs-theme');
        localStorage.setItem('theme', 'light');
        if (icon) {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
        }
      }
    });
  }
}

/**
 * Exibe uma notificação toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success, error, warning, info)
 * @param {number} delay - Tempo em milissegundos para a notificação desaparecer
 */
function showToast(message, type = 'info', delay = 5000) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  
  // Mapeia os tipos de notificação para classes do Bootstrap
  const typeClasses = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-info text-white'
  };
  
  // Ícones para cada tipo de notificação
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  
  toast.className = `toast align-items-center fade show ${typeClasses[type] || ''}`;
  toast.role = 'alert';
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.id = toastId;
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center">
        <i class="fas fa-${icons[type] || 'info-circle'} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Inicializa o toast do Bootstrap
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: delay
  });
  
  // Remove o toast do DOM após ser escondido
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
  
  bsToast.show();
  
  return toastId;
}

/**
 * Exibe um modal de confirmação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem de confirmação
 * @param {string} confirmButtonText - Texto do botão de confirmação
 * @param {string} cancelButtonText - Texto do botão de cancelamento
 * @returns {Promise<boolean>} Promise que resolve para true se confirmado, false se cancelado
 */
function showConfirm(title, message, confirmButtonText = 'Confirmar', cancelButtonText = 'Cancelar') {
  return new Promise((resolve) => {
    const modalId = 'confirm-modal';
    let modal = document.getElementById(modalId);
    
    // Cria o modal se não existir
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = modalId;
      modal.tabIndex = -1;
      modal.setAttribute('aria-hidden', 'true');
      
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelButtonText}</button>
              <button type="button" class="btn btn-primary" id="confirm-button">${confirmButtonText}</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
    
    // Atualiza o conteúdo do modal
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    const confirmButton = modal.querySelector('#confirm-button');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = message;
    confirmButton.textContent = confirmButtonText;
    
    // Cria uma instância do modal
    const modalInstance = new bootstrap.Modal(modal);
    
    // Remove event listeners anteriores para evitar duplicação
    const newModal = modal.cloneNode(true);
    modal.parentNode.replaceChild(newModal, modal);
    modal = newModal;
    
    // Adiciona os event listeners
    modal.querySelector('#confirm-button').addEventListener('click', () => {
      modalInstance.hide();
      resolve(true);
    });
    
    modal.addEventListener('hidden.bs.modal', () => {
      resolve(false);
    }, { once: true });
    
    // Exibe o modal
    modalInstance.show();
  });
}

// Expõe as funções para uso global
window.Admin = {
  showToast,
  showConfirm
};

// Inicializa o tema ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}
