/**
 * Utilitários para o Painel Administrativo
 * 
 * Funções auxiliares para uso em todo o painel administrativo.
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Gera um ID único para uploads
 * @returns {string} ID único
 */
function generateUniqueId() {
  return uuidv4();
}

/**
 * Valida e processa upload de arquivos
 * @param {Object} file - Objeto de arquivo do multer
 * @param {Array} allowedTypes - Tipos MIME permitidos
 * @param {number} maxSize - Tamanho máximo em bytes
 * @returns {Promise<Object>} Dados do arquivo processado
 */
async function processFileUpload(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) {
  try {
    // Verifica se há um arquivo
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    // Verifica o tipo do arquivo
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.mimetype}`);
    }

    // Verifica o tamanho do arquivo
    if (file.size > maxSize) {
      throw new Error(`Tamanho do arquivo excede o limite de ${maxSize / (1024 * 1024)}MB`);
    }

    // Gera um nome único para o arquivo
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${generateUniqueId()}${fileExt}`;
    
    // Define o caminho de destino
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);
    
    // Cria o diretório de uploads se não existir
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Move o arquivo para o diretório de uploads
    await fs.rename(file.path, filePath);
    
    // Retorna os dados do arquivo
    return {
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      path: `/uploads/${fileName}`,
      url: `/uploads/${fileName}`
    };
  } catch (error) {
    // Remove o arquivo temporário em caso de erro
    if (file && file.path) {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error('Erro ao remover arquivo temporário:', err);
      }
    }
    throw error;
  }
}

/**
 * Formata dados para DataTables
 * @param {Array} data - Dados a serem formatados
 * @param {number} total - Total de registros sem paginação
 * @param {Object} request - Objeto de requisição do DataTables
 * @returns {Object} Dados formatados para o DataTables
 */
function formatForDataTables(data, total, request) {
  return {
    draw: parseInt(request.draw || 1),
    recordsTotal: total,
    recordsFiltered: data.length,
    data: data
  };
}

/**
 * Gera breadcrumbs para navegação
 * @param {string} path - Caminho atual
 * @param {Object} labels - Rótulos personalizados para os itens do breadcrumb
 * @returns {Array} Array de objetos com texto e URL
 */
function generateBreadcrumbs(path, labels = {}) {
  const parts = path.split('/').filter(Boolean);
  let breadcrumbs = [];
  let url = '';
  
  // Adiciona o item inicial
  breadcrumbs.push({
    text: labels[''] || 'Dashboard',
    url: '/admin',
    active: parts.length === 0
  });
  
  // Adiciona os itens do caminho
  parts.forEach((part, index) => {
    url += `/${part}`;
    const isLast = index === parts.length - 1;
    
    // Obtém o rótulo personalizado ou formata o padrão
    let text = labels[part] || part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      text,
      url: isLast ? null : url,
      active: isLast
    });
  });
  
  return breadcrumbs;
}

/**
 * Formata mensagens de erro para exibição
 * @param {Error|string|Object} error - Erro a ser formatado
 * @returns {string} Mensagem de erro formatada
 */
function formatError(error) {
  if (!error) return 'Ocorreu um erro desconhecido';
  
  // Se for uma string, retorna como está
  if (typeof error === 'string') return error;
  
  // Se for um objeto de erro do Express Validator
  if (Array.isArray(error)) {
    return error.map(e => e.msg).join('<br>');
  }
  
  // Se for um objeto de erro do Sequelize
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map(e => e.message).join('<br>');
  }
  
  // Se for um erro HTTP
  if (error.statusCode) {
    return error.message || `Erro ${error.statusCode}`;
  }
  
  // Se for um erro padrão
  return error.message || 'Ocorreu um erro inesperado';
}

module.exports = {
  generateUniqueId,
  processFileUpload,
  formatForDataTables,
  generateBreadcrumbs,
  formatError
};
