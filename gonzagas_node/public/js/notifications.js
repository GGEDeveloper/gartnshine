/**
 * Sistema de Notificações Popup - Gonzaga's Art & Shine
 * Mostra notificações elegantes para ações do usuário
 */

class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Criar container de notificações se não existir
    if (!document.getElementById('notification-container')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notification-container');
    }

    // Processar mensagens flash do servidor
    this.processFlashMessages();
  }

  /**
   * Mostra uma notificação
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duração em ms (0 = não remove automaticamente)
   */
  show(message, type = 'info', duration = 5000) {
    const notification = this.createNotification(message, type);
    this.container.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto-remover se duration > 0
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, duration);
    }

    return notification;
  }

  createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = this.getIcon(type);
    
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${icon}
        </div>
        <div class="notification-message">
          ${message}
        </div>
        <button class="notification-close" onclick="notifications.remove(this.closest('.notification'))">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-progress"></div>
    `;

    return notification;
  }

  getIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>'
    };
    return icons[type] || icons.info;
  }

  remove(notification) {
    if (notification && notification.parentNode) {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  // Métodos de conveniência
  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 8000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  // Processar mensagens flash do servidor
  processFlashMessages() {
    const flashMessages = window.flashMessages || {};
    
    Object.keys(flashMessages).forEach(type => {
      const messages = flashMessages[type];
      if (Array.isArray(messages)) {
        messages.forEach(message => {
          // Mapear tipos do Express para nossos tipos
          const notificationType = this.mapFlashType(type);
          this.show(message, notificationType);
        });
      }
    });
    
    // Limpar mensagens após processar
    window.flashMessages = {};
  }

  mapFlashType(flashType) {
    const typeMap = {
      'success': 'success',
      'error': 'error', 
      'danger': 'error',
      'warning': 'warning',
      'info': 'info',
      'message': 'info'
    };
    return typeMap[flashType] || 'info';
  }

  // Limpar todas as notificações
  clear() {
    const notifications = this.container.querySelectorAll('.notification');
    notifications.forEach(notification => this.remove(notification));
  }
}

// Instância global
window.notifications = new NotificationSystem();

// Eventos personalizados para integrações
document.addEventListener('DOMContentLoaded', function() {
  // Notificações para formulários
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.classList.contains('needs-validation')) {
      setTimeout(() => {
        if (form.checkValidity()) {
          notifications.info('Processando...', 2000);
        }
      }, 100);
    }
  });

  // Notificações para ações de botões
  document.addEventListener('click', function(e) {
    const button = e.target.closest('[data-notification]');
    if (button) {
      const message = button.getAttribute('data-notification');
      const type = button.getAttribute('data-notification-type') || 'info';
      notifications.show(message, type);
    }
  });
});

// Expor para uso global
window.showNotification = (message, type, duration) => {
  return notifications.show(message, type, duration);
}; 