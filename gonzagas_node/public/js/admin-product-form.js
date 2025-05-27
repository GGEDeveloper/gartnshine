$(document).ready(function() {
  // Inicialização do Summernote para o campo de descrição
  $('.summernote').summernote({
    height: 200,
    lang: 'pt-BR',
    toolbar: [
      ['style', ['style']],
      ['font', ['bold', 'underline', 'clear']],
      ['fontname', ['fontname']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link', 'picture', 'video']],
      ['view', ['fullscreen', 'codeview', 'help']]
    ],
    callbacks: {
      onImageUpload: function(files) {
        uploadSummernoteImage(files[0], this);
      }
    }
  });

  // Função para upload de imagem no Summernote
  function uploadSummernoteImage(file, editor) {
    const formData = new FormData();
    formData.append('image', file);
    
    $.ajax({
      url: '/admin/upload/image',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        if (response.success) {
          const image = $('<img>').attr('src', response.url);
          $(editor).summernote('insertNode', image[0]);
        } else {
          showAlert('Erro ao fazer upload da imagem: ' + (response.message || 'Erro desconhecido'), 'danger');
        }
      },
      error: function(xhr) {
        const errorMessage = xhr.responseJSON?.message || 'Erro ao fazer upload da imagem';
        showAlert(errorMessage, 'danger');
      }
    });
  }

  // Inicialização do Select2
  $('.select2').select2({
    theme: 'bootstrap4',
    tags: true,
    tokenSeparators: [',', ' '],
    placeholder: 'Selecione ou digite para adicionar',
    allowClear: true
  });

  // Inicialização do file input personalizado
  bsCustomFileInput.init();

  // Preview da imagem ao selecionar
  $('#image').on('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#imagePreview').attr('src', e.target.result);
      }
      reader.readAsDataURL(file);
    }
  });

  // Adicionar novo campo de atributo
  $('#addAttribute').on('click', function() {
    const template = document.getElementById('attributeTemplate');
    const clone = template.content.cloneNode(true);
    document.getElementById('customAttributes').appendChild(clone);
    attachAttributeEvents();
  });

  // Remover campo de atributo
  function attachAttributeEvents() {
    $('.remove-attribute').off('click').on('click', function() {
      if ($('.attribute-row').length > 1) {
        $(this).closest('.attribute-row').remove();
      } else {
        showAlert('Pelo menos um atributo é necessário', 'warning');
      }
    });
  }
  attachAttributeEvents();

  // Validação do formulário
  $('#productForm').validate({
    rules: {
      name: {
        required: true,
        minlength: 3,
        maxlength: 255
      },
      price: {
        required: true,
        number: true,
        min: 0
      },
      stock: {
        required: true,
        digits: true,
        min: 0
      },
      sku: {
        maxlength: 100
      },
      barcode: {
        maxlength: 100
      }
    },
    messages: {
      name: {
        required: 'Por favor, insira o nome do produto',
        minlength: 'O nome deve ter pelo menos 3 caracteres',
        maxlength: 'O nome não pode ter mais de 255 caracteres'
      },
      price: {
        required: 'Por favor, insira o preço do produto',
        number: 'Por favor, insira um valor numérico válido',
        min: 'O preço não pode ser negativo'
      },
      stock: {
        required: 'Por favor, insira a quantidade em stock',
        digits: 'A quantidade deve ser um número inteiro',
        min: 'A quantidade não pode ser negativa'
      },
      sku: {
        maxlength: 'O SKU não pode ter mais de 100 caracteres'
      },
      barcode: {
        maxlength: 'O código de barras não pode ter mais de 100 caracteres'
      }
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.form-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    },
    submitHandler: function(form) {
      // Desabilitar o botão de envio para evitar múltiplos cliques
      const submitButton = $(form).find('button[type="submit"]');
      const originalText = submitButton.html();
      submitButton.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Salvando...');
      
      // Enviar o formulário via AJAX
      const formData = new FormData(form);
      
      // Adicionar o conteúdo do Summernote ao FormData
      $('.summernote').each(function() {
        formData.set($(this).attr('name'), $(this).summernote('code'));
      });
      
      $.ajax({
        url: $(form).attr('action'),
        type: $(form).attr('method'),
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
          if (response.redirect) {
            window.location.href = response.redirect;
          } else {
            showAlert('Produto salvo com sucesso!', 'success');
            if (response.id && !window.location.href.includes(response.id)) {
              // Atualizar a URL para incluir o ID do produto após a criação
              window.history.pushState({}, '', `/admin/products/${response.id}/edit`);
            }
          }
        },
        error: function(xhr) {
          const errorMessage = xhr.responseJSON?.message || 'Erro ao salvar o produto';
          showAlert(errorMessage, 'danger');
        },
        complete: function() {
          // Reativar o botão de envio
          submitButton.prop('disabled', false).html(originalText);
        }
      });
      
      return false; // Impede o envio normal do formulário
    }
  });

  // Confirmação de exclusão
  $('#deleteProduct').on('click', function() {
    if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      const productId = $(this).data('product-id');
      $.ajax({
        url: `/admin/products/${productId}`,
        type: 'DELETE',
        success: function(response) {
          if (response.redirect) {
            window.location.href = response.redirect;
          } else {
            window.location.href = '/admin/products';
          }
        },
        error: function(xhr) {
          const errorMessage = xhr.responseJSON?.message || 'Erro ao excluir o produto';
          showAlert(errorMessage, 'danger');
        }
      });
    }
  });

  // Função para exibir mensagens de alerta
  function showAlert(message, type) {
    const alert = $(`
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `);
    
    $('.alerts-container').append(alert);
    
    // Remover o alerta após 5 segundos
    setTimeout(() => {
      alert.alert('close');
    }, 5000);
  }

  // Atualizar o slug quando o nome for alterado
  $('#name').on('keyup', function() {
    const name = $(this).val();
    if (name && (!$('#slug').val() || !$('#slug').data('user-modified'))) {
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-')      // Substitui espaços por hífens
        .replace(/--+/g, '-')       // Remove múltiplos hífens seguidos
        .replace(/^-+|-+$/g, '');   // Remove hífens do início e do fim
      $('#slug').val(slug);
    }
  });

  // Marcar quando o usuário modificar manualmente o slug
  $('#slug').on('input', function() {
    $(this).data('user-modified', true);
  });

  // Inicializar tooltips
  $('[data-toggle="tooltip"]').tooltip();
});
