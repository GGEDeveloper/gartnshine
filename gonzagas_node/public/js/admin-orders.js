/**
 * Admin Orders JavaScript
 * Handles the orders management interface
 */

document.addEventListener('DOMContentLoaded', () => {
  initOrdersTable();
  initOrderActions();
});

/**
 * Initialize the orders DataTable
 */
function initOrdersTable() {
  const ordersTable = document.getElementById('ordersTable');
  
  if (ordersTable) {
    // Verifica se DataTables já está definido
    if (typeof $.fn.DataTable === 'function') {
      $(ordersTable).DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
        "language": {
          "url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json"
        },
        "order": [[0, 'desc']],
        "columnDefs": [
          { "orderable": false, "targets": -1 } // Desabilita ordenação na coluna de ações
        ]
      });
    } else {
      console.error('DataTables não foi carregado corretamente.');
    }
  }
}

/**
 * Initialize order action buttons
 */
function initOrderActions() {
  // Botão de visualização rápida
  document.querySelectorAll('.btn-view-order').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const orderId = this.dataset.orderId;
      viewOrderDetails(orderId);
    });
  });
  
  // Botão de impressão
  document.querySelectorAll('.btn-print-order').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const orderId = this.dataset.orderId;
      printOrder(orderId);
    });
  });
  
  // Botão de atualizar status
  document.querySelectorAll('.btn-update-status').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const orderId = this.dataset.orderId;
      updateOrderStatus(orderId);
    });
  });
}

/**
 * View order details in a modal
 * @param {string} orderId - The ID of the order to view
 */
function viewOrderDetails(orderId) {
  // Aqui você pode implementar a lógica para buscar os detalhes do pedido via AJAX
  // e exibi-los em um modal
  console.log(`Visualizando detalhes do pedido #${orderId}`);
  
  // Exemplo de implementação com um modal do Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
  
  // Atualiza o título do modal
  document.getElementById('orderDetailsModalLabel').textContent = `Pedido #${orderId}`;
  
  // Aqui você pode fazer uma chamada AJAX para buscar os detalhes do pedido
  // e preencher o modal com os dados retornados
  
  // Exemplo de como preencher os dados (substitua por uma chamada AJAX real)
  // fetch(`/api/orders/${orderId}`)
  //   .then(response => response.json())
  //   .then(data => {
  //     // Preenche os dados do pedido no modal
  //     // ...
  //   })
  //   .catch(error => {
  //     console.error('Erro ao buscar detalhes do pedido:', error);
  //     showAlert('Erro ao carregar detalhes do pedido. Tente novamente.', 'danger');
  //   });
  
  // Abre o modal
  modal.show();
}

/**
 * Print an order
 * @param {string} orderId - The ID of the order to print
 */
function printOrder(orderId) {
  console.log(`Imprimindo pedido #${orderId}`);
  // Implemente a lógica para imprimir o pedido
  // Pode abrir uma nova janela com uma versão de impressão ou usar window.print()
  window.open(`/admin/orders/${orderId}/print`, '_blank');
}

/**
 * Update order status
 * @param {string} orderId - The ID of the order to update
 */
function updateOrderStatus(orderId) {
  // Aqui você pode implementar um seletor de status ou um modal para atualizar o status
  const newStatus = prompt('Digite o novo status do pedido:');
  
  if (newStatus) {
    console.log(`Atualizando status do pedido #${orderId} para: ${newStatus}`);
    
    // Aqui você pode implementar uma chamada AJAX para atualizar o status do pedido
    // fetch(`/api/orders/${orderId}/status`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ status: newStatus })
    // })
    // .then(response => response.json())
    // .then(data => {
    //   showAlert('Status do pedido atualizado com sucesso!', 'success');
    //   // Atualiza a linha da tabela com o novo status
    //   const statusCell = document.querySelector(`tr[data-order-id="${orderId}"] .order-status`);
    //   if (statusCell) {
    //     statusCell.textContent = newStatus;
    //     // Atualiza a classe do badge conforme o status
    //     updateStatusBadge(statusCell, newStatus);
    //   }
    // })
    // .catch(error => {
    //   console.error('Erro ao atualizar status do pedido:', error);
    //   showAlert('Erro ao atualizar status do pedido. Tente novamente.', 'danger');
    // });
  }
}

/**
 * Update status badge appearance based on status
 * @param {HTMLElement} element - The badge element
 * @param {string} status - The status text
 */
function updateStatusBadge(element, status) {
  // Remove todas as classes de cor
  element.className = 'badge';
  
  // Adiciona a classe de cor com base no status
  if (status.toLowerCase().includes('pago') || status.toLowerCase().includes('concluído')) {
    element.classList.add('bg-success');
  } else if (status.toLowerCase().includes('pendente')) {
    element.classList.add('bg-warning');
  } else if (status.toLowerCase().includes('cancelado')) {
    element.classList.add('bg-danger');
  } else if (status.toLowerCase().includes('processando')) {
    element.classList.add('bg-info');
  } else {
    element.classList.add('bg-secondary');
  }
}

/**
 * Show alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
  `;
  
  const container = document.querySelector('.alerts-container');
  if (container) {
    container.prepend(alert);
  } else {
    // Se não houver um container de alertas, adiciona no topo do conteúdo
    const content = document.querySelector('.admin-content');
    if (content) {
      content.insertBefore(alert, content.firstChild);
    } else {
      document.body.prepend(alert);
    }
  }
  
  // Remove o alerta após 5 segundos
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 150);
  }, 5000);
}
