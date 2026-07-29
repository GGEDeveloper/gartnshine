const express = require('express');
const router = express.Router();
const ProductFamily = require('../../models/ProductFamily');
const SiteSettings = require('../../models/SiteSettings');
const { listGalleryImages } = require('../../utils/galleryLibrary');
const { adminSessionRequired } = require('../../middleware/authMiddleware');

router.use(adminSessionRequired);

/**
 * GET /admin/collections-admin
 * Painel único para o aspecto das coleções: capa de cada coleção + fundos das
 * secções da página inicial. Junta o que antes obrigava a saltar entre o
 * formulário de cada categoria e as Definições.
 */
router.get('/', async (req, res) => {
  try {
    const [families, settings, galleryImages] = await Promise.all([
      ProductFamily.getAllWithProductCount(),
      SiteSettings.getSettings(),
      listGalleryImages()
    ]);

    // Só coleções com produtos — as outras não têm página pública com conteúdo.
    const withProducts = families.filter((f) => Number(f.product_count) > 0);

    res.render('admin/collections/index', {
      layout: 'admin/layouts/main',
      title: 'Coleções',
      families: withProducts,
      settings,
      galleryImages,
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading collections admin:', error);
    req.flash('error_msg', 'Falha ao carregar as coleções.');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;
