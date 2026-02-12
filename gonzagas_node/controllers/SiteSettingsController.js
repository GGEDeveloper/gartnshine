const SiteSettings = require('../models/SiteSettings');

class SiteSettingsController {
  async showSettingsForm(req, res) {
    try {
      let settings;
      
      // Tentar obter configurações da BD
      try {
        settings = await SiteSettings.getSettings();
        console.log('Settings carregadas com sucesso:', settings);
      } catch (dbError) {
        console.error('Erro na base de dados ao carregar configurações:', dbError);
        
        // Usar configurações padrão se há problema com a BD
        settings = {
          id: 1,
          featured_carousel_enabled: true,
          catalog_page_enabled: true,
          hide_catalog_prices: false,
          hide_out_of_stock: false
        };
        
        req.flash('warning', 'Usando configurações padrão. Verifique a ligação à base de dados.');
      }
      
      res.render('admin/settings/settings-form', {
        layout: 'admin/layouts/main', // Or your default admin layout
        title: 'Site Settings',
        settings: settings,
        csrfToken: req.csrfToken ? req.csrfToken() : null, // Pass CSRF token if you use csurf
        breadcrumbs: [ // Example breadcrumbs
            { name: 'Admin', url: '/admin' },
            { name: 'Site Settings', url: '/admin/settings' }
        ],
        user: req.session.user, // Pass user for layout
        messages: req.flash() // Pass flash messages
      });
    } catch (error) {
      console.error('Erro crítico ao carregar página de configurações:', error);
      req.flash('error', 'Erro interno do servidor ao carregar configurações. Contacte o administrador.');
      res.redirect('/admin/dashboard');
    }
  }

  async updateSettings(req, res) {
    try {
      const {
        featured_carousel_enabled,
        catalog_page_enabled,
        hide_catalog_prices,
        hide_out_of_stock
      } = req.body;

      const updates = {
        featured_carousel_enabled: featured_carousel_enabled === 'on' ? 1 : 0,
        catalog_page_enabled: catalog_page_enabled === 'on' ? 1 : 0,
        hide_catalog_prices: hide_catalog_prices === 'on' ? 1 : 0,
        hide_out_of_stock: hide_out_of_stock === 'on' ? 1 : 0
      };

      console.log('Atualizando configurações com dados:', updates);

      await SiteSettings.updateSettings(updates);

      req.flash('success', 'Configurações do site atualizadas com sucesso!');
      res.redirect('/admin/settings');

    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      req.flash('error', 'Erro ao salvar as configurações. Tente novamente.');
      res.redirect('/admin/settings');
    }
  }
}

module.exports = new SiteSettingsController();
