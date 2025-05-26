// Configurações de visualização
module.exports = {
  // Configuração dos layouts
  layouts: {
    // Layout padrão para o painel administrativo
    admin: {
      default: 'admin/layouts/main',
      login: 'admin/layouts/auth'
    },
    // Layout padrão para o site público
    public: {
      default: 'layouts/main',
      auth: 'layouts/auth'
    }
  },
  
  // Configurações de visualização
  views: {
    // Extensão dos arquivos de visualização
    extension: 'ejs',
    
    // Diretório base para as visualizações
    directory: 'views',
    
    // Configurações de cache
    cache: process.env.NODE_ENV === 'production',
    
    // Configurações de depuração
    debug: process.env.NODE_ENV === 'development'
  },
  
  // Configurações de assets
  assets: {
    // Diretório de arquivos estáticos
    public: 'public',
    
    // Caminho para os assets compilados (se usar webpack, gulp, etc.)
    compiled: 'public/dist'
  }
};
