const SiteSettings = require('../models/SiteSettings');

class SiteSettingsController {
  async showSettingsForm(req, res) {
    try {
      const settings = await SiteSettings.getSettings();
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
        // Add any other variables your layout might need
      });
    } catch (error) {
      console.error('Error showing site settings form:', error);
      req.flash('error_msg', 'Failed to load site settings.');
      res.redirect('/admin'); // Or an appropriate error page
    }
  }

  async saveSettings(req, res) {
    try {
      const { featured_carousel_enabled, catalog_page_enabled } = req.body;

      // Convert checkbox values (which might be 'on' or undefined) to boolean
      const settingsData = {
        featured_carousel_enabled: featured_carousel_enabled === 'on' || featured_carousel_enabled === 'true' || featured_carousel_enabled === true,
        catalog_page_enabled: catalog_page_enabled === 'on' || catalog_page_enabled === 'true' || catalog_page_enabled === true,
      };

      const result = await SiteSettings.updateSettings(settingsData);

      if (result.success) {
        req.flash('success_msg', result.message);
      } else {
        req.flash('error_msg', result.message);
      }
      res.redirect('/admin/settings');
    } catch (error) {
      console.error('Error saving site settings:', error);
      req.flash('error_msg', 'Failed to save site settings: ' + error.message);
      res.redirect('/admin/settings');
    }
  }
}

module.exports = new SiteSettingsController();
