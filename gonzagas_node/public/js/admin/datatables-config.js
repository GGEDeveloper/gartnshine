/**
 * Configuração global do DataTables para o painel administrativo
 */

// Extensão para tradução em português
$.extend(true, $.fn.dataTable.defaults, {
  language: {
    decimal: ",",
    thousands: ".",
    processing: "Processando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros por página",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    infoFiltered: "(filtrado de _MAX_ registros no total)",
    infoPostFix: "",
    loadingRecords: "Carregando...",
    zeroRecords: "Nenhum registro encontrado",
    emptyTable: "Nenhum dado disponível na tabela",
    paginate: {
      first: "Primeira",
      previous: "Anterior",
      next: "Próxima",
      last: "Última"
    },
    aria: {
      sortAscending: ": ativar para ordenar a coluna em ordem crescente",
      sortDescending: ": ativar para ordenar a coluna em ordem decrescente"
    },
    select: {
      rows: {
        _: "%d linhas selecionadas",
        0: "Nenhuma linha selecionada",
        1: "1 linha selecionada"
      }
    }
  },
  responsive: true,
  stateSave: true,
  lengthMenu: [10, 25, 50, 100],
  pageLength: 25,
  dom: `
    <"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-end"f>>
    <"row"<"col-sm-12"tr>>
    <"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>
  `,
  initComplete: function() {
    // Adiciona classe de estilização ao campo de busca
    $('.dataTables_filter input')
      .addClass('form-control form-control-sm')
      .attr('placeholder', 'Buscar...');
      
    // Adiciona classe de estilização ao seletor de itens por página
    $('.dataTables_length select')
      .addClass('form-control form-control-sm')
      .css('width', '75px');
      
    // Adiciona classes de estilização à paginação
    $('.dataTables_paginate')
      .addClass('pagination-sm')
      .find('.paginate_button')
      .addClass('page-item')
      .find('a')
      .addClass('page-link');
  }
});

/**
 * Inicializa uma tabela DataTable com configurações personalizadas
 * @param {string} selector - Seletor da tabela
 * @param {Object} options - Opções adicionais do DataTable
 * @returns {DataTable} Instância do DataTable
 */
function initDataTable(selector, options = {}) {
  const defaultOptions = {
    responsive: true,
    autoWidth: false,
    processing: true,
    serverSide: options.serverSide || false,
    ajax: options.ajax || null,
    columns: options.columns || [],
    order: options.order || [[0, 'desc']],
    drawCallback: function(settings) {
      // Inicializa tooltips do Bootstrap
      $('[data-toggle="tooltip"]').tooltip();
      
      // Inicializa popovers do Bootstrap
      $('[data-toggle="popover"]').popover({
        trigger: 'hover',
        html: true,
        container: 'body'
      });
      
      // Chama o callback personalizado, se fornecido
      if (typeof options.drawCallback === 'function') {
        options.drawCallback.call(this, settings);
      }
    },
    // Adiciona classes de estilização às linhas
    createdRow: function(row, data, dataIndex) {
      // Adiciona classe de destaque para itens com status inativo
      if (data.status === 'Inativo' || data.status === 'Cancelado') {
        $(row).addClass('table-danger');
      }
      
      // Adiciona classe de destaque para itens com stock baixo
      if (data.stock !== undefined && data.stock <= data.stockMin) {
        $(row).addClass('table-warning');
      }
      
      // Chama o callback personalizado, se fornecido
      if (typeof options.createdRow === 'function') {
        options.createdRow.call(this, row, data, dataIndex);
      }
    }
  };
  
  // Mescla as opções padrão com as opções fornecidas
  const finalOptions = $.extend(true, {}, defaultOptions, options);
  
  // Inicializa a tabela
  return $(selector).DataTable(finalOptions);
}

/**
 * Exporta dados para diferentes formatos
 * @param {DataTable} table - Instância do DataTable
 * @param {string} format - Formato de exportação (excel, pdf, print, etc.)
 */
function exportTable(table, format) {
  if (!table || !table.buttons) {
    console.error('Tabela ou botões não inicializados corretamente');
    return;
  }
  
  switch (format) {
    case 'excel':
      table.button('.buttons-excel').trigger();
      break;
    case 'pdf':
      table.button('.buttons-pdf').trigger();
      break;
    case 'print':
      table.button('.buttons-print').trigger();
      break;
    case 'copy':
      table.button('.buttons-copy').trigger();
      break;
    default:
      console.error('Formato de exportação não suportado:', format);
  }
}

// Expõe as funções para uso global
window.AdminDataTables = {
  init: initDataTable,
  export: exportTable
};

// Inicialização automática de tabelas com a classe 'datatable'
$(document).ready(function() {
  $('.datatable').each(function() {
    const $table = $(this);
    const options = $table.data('options') || {};
    
    // Converte string JSON para objeto, se necessário
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.error('Erro ao analisar opções do DataTable:', e);
        return;
      }
    }
    
    // Inicializa a tabela
    initDataTable($table, options);
  });
});
