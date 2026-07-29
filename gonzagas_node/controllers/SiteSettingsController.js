const fs = require('fs').promises;
const path = require('path');
const SiteSettings = require('../models/SiteSettings');

const { GALLERY_DIR, IMAGE_EXTENSIONS, listGalleryImages } = require('../utils/galleryLibrary');

/**
 * Reproduz exactamente a lógica de fallback de routes/index.js (fs.readdir
 * sem ordenação + primeiro resultado) — para o admin ver qual é mesmo o
 * ficheiro em uso quando hero_image está a null, em vez de uma suposição.
 */
async function getAutoFallbackHeroImage() {
  try {
    const files = await fs.readdir(GALLERY_DIR);
    const first = files.find((f) => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()));
    return first ? `/media/gallery/${first}` : null;
  } catch (error) {
    return null;
  }
}

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
          hide_out_of_stock: false,
          hero_image: null
        };

        req.flash('warning', 'Usando configurações padrão. Verifique a ligação à base de dados.');
      }

      const galleryImages = await listGalleryImages();
      const effectiveHeroImage = settings.hero_image || (await getAutoFallbackHeroImage());
      const effectiveFeaturedBackground = settings.featured_background || null;
      const effectiveMediaStripBackground = settings.media_strip_background || null;

      res.render('admin/settings/settings-form', {
        layout: 'admin/layouts/main', // Or your default admin layout
        title: 'Site Settings',
        settings: settings,
        galleryImages,
        effectiveHeroImage,
        effectiveFeaturedBackground,
        effectiveMediaStripBackground,
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

  /** POST /admin/settings/hero-image — escolher uma imagem já existente na galeria, ou enviar uma nova. */
  async updateHeroImage(req, res) {
    try {
      let heroImagePath = null;

      if (req.file) {
        // Novo upload — multer já gravou o ficheiro em public/media/gallery
        heroImagePath = `/media/gallery/${req.file.filename}`;
      } else if (req.body.hero_image_existing) {
        // Escolher uma imagem já existente na galeria
        const candidate = req.body.hero_image_existing;
        const galleryImages = await listGalleryImages();
        const match = galleryImages.find((img) => img.path === candidate);
        if (!match) {
          req.flash('error', 'Imagem selecionada não foi encontrada na galeria.');
          return res.redirect('/admin/settings');
        }
        heroImagePath = match.path;
      } else if (req.body.reset_to_default === '1') {
        heroImagePath = null;
      } else {
        req.flash('error', 'Escolhe uma imagem da galeria ou envia uma nova.');
        return res.redirect('/admin/settings');
      }

      await SiteSettings.updateHeroImage(heroImagePath);
      req.flash(
        'success',
        heroImagePath
          ? 'Imagem de fundo do hero atualizada com sucesso!'
          : 'Hero voltou a usar a imagem automática (primeira encontrada na pasta da galeria).'
      );
      res.redirect('/admin/settings');
    } catch (error) {
      console.error('Erro ao atualizar imagem do hero:', error);
      req.flash('error', 'Erro ao atualizar a imagem do hero. Tente novamente.');
      res.redirect('/admin/settings');
    }
  }

  /** POST /admin/settings/featured-background — escolher uma imagem já existente na galeria, ou enviar uma nova. */
  async updateFeaturedBackground(req, res) {
    try {
      let imagePath = null;

      if (req.file) {
        // Novo upload — multer já gravou o ficheiro em public/media/gallery
        imagePath = `/media/gallery/${req.file.filename}`;
      } else if (req.body.featured_background_existing) {
        // Escolher uma imagem já existente na galeria
        const candidate = req.body.featured_background_existing;
        const galleryImages = await listGalleryImages();
        const match = galleryImages.find((img) => img.path === candidate);
        if (!match) {
          req.flash('error', 'Imagem selecionada não foi encontrada na galeria.');
          return res.redirect('/admin/settings');
        }
        imagePath = match.path;
      } else if (req.body.reset_to_default === '1') {
        imagePath = null;
      } else {
        req.flash('error', 'Escolhe uma imagem da galeria ou envia uma nova.');
        return res.redirect('/admin/settings');
      }

      await SiteSettings.updateFeaturedBackground(imagePath);
      req.flash(
        'success',
        imagePath
          ? 'Imagem de fundo da secção Featured atualizada com sucesso!'
          : 'Secção Featured voltou a usar o background padrão (do body).'
      );
      res.redirect('/admin/settings');
    } catch (error) {
      console.error('Erro ao atualizar imagem da secção Featured:', error);
      req.flash('error', 'Erro ao atualizar a imagem da secção Featured. Tente novamente.');
      res.redirect('/admin/settings');
    }
  }

  /** POST /admin/settings/media-strip-background — escolher uma imagem já existente na galeria, ou enviar uma nova. */
  async updateMediaStripBackground(req, res) {
    try {
      let imagePath = null;

      if (req.file) {
        // Novo upload — multer já gravou o ficheiro em public/media/gallery
        imagePath = `/media/gallery/${req.file.filename}`;
      } else if (req.body.media_strip_background_existing) {
        // Escolher uma imagem já existente na galeria
        const candidate = req.body.media_strip_background_existing;
        const galleryImages = await listGalleryImages();
        const match = galleryImages.find((img) => img.path === candidate);
        if (!match) {
          req.flash('error', 'Imagem selecionada não foi encontrada na galeria.');
          return res.redirect('/admin/settings');
        }
        imagePath = match.path;
      } else if (req.body.reset_to_default === '1') {
        imagePath = null;
      } else {
        req.flash('error', 'Escolhe uma imagem da galeria ou envia uma nova.');
        return res.redirect('/admin/settings');
      }

      await SiteSettings.updateMediaStripBackground(imagePath);
      req.flash(
        'success',
        imagePath
          ? 'Imagem de fundo da secção Media Strip atualizada com sucesso!'
          : 'Secção Media Strip voltou a usar o background padrão (do body).'
      );
      res.redirect('/admin/settings');
    } catch (error) {
      console.error('Erro ao atualizar imagem da secção Media Strip:', error);
      req.flash('error', 'Erro ao atualizar a imagem da secção Media Strip. Tente novamente.');
      res.redirect('/admin/settings');
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
