const { pool } = require('../config/database');

class SiteSettings {
  static async getSettings() {
    try {
      const [rows] = await pool.query('SELECT id, featured_carousel_enabled, catalog_page_enabled FROM site_settings WHERE id = 1 LIMIT 1');
      if (rows.length > 0) {
        // Convert TINYINT(1) to boolean
        return {
          ...rows[0],
          featured_carousel_enabled: !!rows[0].featured_carousel_enabled,
          catalog_page_enabled: !!rows[0].catalog_page_enabled,
        };
      }
      // This case should ideally not happen if the table is initialized correctly
      console.warn('SiteSettings.getSettings: No settings found in database, returning defaults.');
      return { id: 1, featured_carousel_enabled: true, catalog_page_enabled: true };
    } catch (error) {
      console.error('Error fetching site settings:', error);
      throw error;
    }
  }

  static async updateSettings(settingsData) {
    const { featured_carousel_enabled, catalog_page_enabled } = settingsData;
    try {
      // Ensure boolean values are converted to 0 or 1 for MySQL
      const featuredCarousel = featured_carousel_enabled ? 1 : 0;
      const catalogPage = catalog_page_enabled ? 1 : 0;

      const [result] = await pool.query(
        'UPDATE site_settings SET featured_carousel_enabled = ?, catalog_page_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [featuredCarousel, catalogPage]
      );

      if (result.affectedRows > 0) {
        return { success: true, message: 'Site settings updated successfully.' };
      } else {
        // This might happen if the row with id=1 doesn't exist, which should be handled by initialization.
        // Or if the values provided were the same as existing ones (some DBs report 0 affectedRows).
        // For robustness, we can try to re-fetch to confirm.
        const currentSettings = await this.getSettings();
        if (currentSettings.featured_carousel_enabled === featured_carousel_enabled &&
            currentSettings.catalog_page_enabled === catalog_page_enabled) {
             return { success: true, message: 'Site settings are already up to date.' };
        }
        console.warn('SiteSettings.updateSettings: Update reported 0 affected rows, but settings might not have changed or row id=1 missing.');
        return { success: false, message: 'Failed to update site settings or no changes made.' };
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
  }

  // Optional: Method to ensure the settings row exists
  static async initializeSettings() {
    try {
      const [rows] = await pool.query('SELECT id FROM site_settings WHERE id = 1 LIMIT 1');
      if (rows.length === 0) {
        await pool.query(
          'INSERT INTO site_settings (id, featured_carousel_enabled, catalog_page_enabled) VALUES (1, TRUE, TRUE)'
        );
        console.log('SiteSettings.initializeSettings: Default settings initialized.');
      }
    } catch (error) {
      console.error('Error initializing site settings:', error);
      // Depending on application startup, might want to handle this more gracefully or throw
    }
  }
}

module.exports = SiteSettings;
