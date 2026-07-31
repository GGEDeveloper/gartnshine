const { pool } = require('../config/database');

class SiteSettings {
  static async getSettings() {
    try {
      let [rows] = await pool.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1');
      if (rows.length > 0) {
        return {
          ...rows[0],
          featured_carousel_enabled: !!rows[0].featured_carousel_enabled,
          catalog_page_enabled: !!rows[0].catalog_page_enabled,
          hide_catalog_prices: !!rows[0].hide_catalog_prices,
          hide_out_of_stock: !!(rows[0].hide_out_of_stock != null ? rows[0].hide_out_of_stock : 0),
        };
      }
      console.warn('SiteSettings.getSettings: No settings found in database, returning defaults.');
      return { id: 1, featured_carousel_enabled: true, catalog_page_enabled: true, hide_catalog_prices: false, hide_out_of_stock: false };
    } catch (error) {
      console.error('Error fetching site settings:', error);
      throw error;
    }
  }

  static async updateSettings(settingsData) {
    const { featured_carousel_enabled, catalog_page_enabled, hide_catalog_prices, hide_out_of_stock } = settingsData;
    try {
      const featuredCarousel = featured_carousel_enabled ? 1 : 0;
      const catalogPage = catalog_page_enabled ? 1 : 0;
      const hideCatalogPrices = hide_catalog_prices ? 1 : 0;
      const hideOutOfStock = hide_out_of_stock ? 1 : 0;

      let result;
      try {
        [result] = await pool.query(
          'UPDATE site_settings SET featured_carousel_enabled = ?, catalog_page_enabled = ?, hide_catalog_prices = ?, hide_out_of_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
          [featuredCarousel, catalogPage, hideCatalogPrices, hideOutOfStock]
        );
      } catch (colErr) {
        if (colErr.code === 'ER_BAD_FIELD_ERROR' && colErr.message && colErr.message.includes('hide_out_of_stock')) {
          const [r] = await pool.query(
            'UPDATE site_settings SET featured_carousel_enabled = ?, catalog_page_enabled = ?, hide_catalog_prices = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
            [featuredCarousel, catalogPage, hideCatalogPrices]
          );
          result = r;
        } else throw colErr;
      }

      if (result && result.affectedRows > 0) {
        return { success: true, message: 'Site settings updated successfully.' };
      } else {
        // This might happen if the row with id=1 doesn't exist, which should be handled by initialization.
        // Or if the values provided were the same as existing ones (some DBs report 0 affectedRows).
        // For robustness, we can try to re-fetch to confirm.
        const currentSettings = await this.getSettings();
        if (currentSettings.featured_carousel_enabled === featured_carousel_enabled &&
            currentSettings.catalog_page_enabled === catalog_page_enabled &&
            currentSettings.hide_catalog_prices === hide_catalog_prices &&
            (currentSettings.hide_out_of_stock === undefined || currentSettings.hide_out_of_stock === hide_out_of_stock)) {
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

  /** Define a imagem de fundo do hero (caminho público, ex: /media/gallery/x.jpg). null = volta ao fallback automático. */
  static async updateHeroImage(heroImagePath) {
    await pool.query(
      'UPDATE site_settings SET hero_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [heroImagePath || null]
    );
    return { success: true };
  }

  /** Define a imagem de fundo da secção Featured (caminho público, ex: /media/gallery/x.jpg). null = usa background do body. */
  static async updateFeaturedBackground(imagePath) {
    await pool.query(
      'UPDATE site_settings SET featured_background = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [imagePath || null]
    );
    return { success: true };
  }

  /** Define a imagem de fundo da secção Media Strip (caminho público, ex: /media/gallery/x.jpg). null = usa background do body. */
  static async updateMediaStripBackground(imagePath) {
    await pool.query(
      'UPDATE site_settings SET media_strip_background = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [imagePath || null]
    );
    return { success: true };
  }

  /**
   * Cartão "Ver todos" da loja: imagem, título e legenda.
   *
   * Recebe só os campos a mudar — a imagem e os textos são geridos por dois
   * formulários separados no admin, e escrever sempre os três apagaria o que
   * o outro formulário tinha acabado de gravar. Um campo a `null` limpa-o de
   * propósito (volta ao automático); um campo ausente fica como está.
   *
   * A tolerância ao `ER_BAD_FIELD_ERROR` existe porque as colunas vêm da
   * migração 012 — numa base onde ela ainda não correu, o admin mostra o
   * aviso em vez de rebentar.
   */
  static async updateShopAllCard(campos = {}) {
    const colunas = {
      image: 'shop_all_card_image',
      title: 'shop_all_card_title',
      subtitle: 'shop_all_card_subtitle'
    };

    const sets = [];
    const valores = [];
    Object.keys(colunas).forEach((chave) => {
      if (!(chave in campos)) return;
      const bruto = campos[chave];
      const limpo = typeof bruto === 'string' ? bruto.trim() : bruto;
      sets.push(`${colunas[chave]} = ?`);
      valores.push(limpo || null);
    });

    if (sets.length === 0) return { success: true };

    try {
      await pool.query(
        `UPDATE site_settings SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
        valores
      );
      return { success: true };
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return {
          success: false,
          message: 'Falta correr a migração 012 (colunas do cartão "Ver todos").'
        };
      }
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
