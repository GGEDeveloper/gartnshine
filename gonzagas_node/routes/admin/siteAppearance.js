const express = require('express');
const router = express.Router();
const ProductFamily = require('../../models/ProductFamily');
const SiteSettings = require('../../models/SiteSettings');
const { listGalleryImages, resolveImageFromRequest } = require('../../utils/galleryLibrary');
const { adminSessionRequired } = require('../../middleware/authMiddleware');
const { createGalleryUpload } = require('../../middleware/galleryUpload');

router.use(adminSessionRequired);

const galleryUpload = createGalleryUpload('colecao');

/**
 * GET /admin/site-appearance
 * Lista das coleções + fundos das secções da página inicial.
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

    res.render('admin/site-appearance/index', {
      layout: 'admin/layouts/main',
      title: 'Aspeto do Site',
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

/*
 * ===== Cartão "Ver todos" da loja =====
 * Declarado antes das rotas `/:id` de propósito: o Express serve a primeira
 * que casar, e um `/:id` colocado acima apanharia estes endereços tratando
 * "cartao-ver-todos" como o id de uma coleção.
 */

/** POST /admin/site-appearance/cartao-ver-todos/imagem */
router.post(
  '/cartao-ver-todos/imagem',
  galleryUpload.single('shop_all_card_file'),
  async (req, res) => {
    const back = '/admin/site-appearance';
    try {
      const resolved = await resolveImageFromRequest(req, {
        existingField: 'shop_all_card_existing',
        removeField: 'remove_shop_all_card_image'
      });
      if (resolved.error) {
        req.flash('error_msg', resolved.error);
        return res.redirect(back);
      }

      const r = await SiteSettings.updateShopAllCard({ image: resolved.path });
      if (!r.success) {
        req.flash('error_msg', r.message || 'Falha ao guardar a imagem.');
      } else {
        req.flash('success_msg', resolved.path
          ? 'Imagem do cartão "Ver todos" atualizada.'
          : 'Imagem do cartão "Ver todos" removida.');
      }
    } catch (error) {
      console.error('Error updating shop-all card image:', error);
      req.flash('error_msg', 'Falha ao atualizar a imagem do cartão. ' + (error.message || ''));
    }
    res.redirect(back);
  }
);

/** POST /admin/site-appearance/cartao-ver-todos/textos */
router.post('/cartao-ver-todos/textos', async (req, res) => {
  const back = '/admin/site-appearance';
  try {
    // Vazio é uma escolha válida: volta ao automático ("Ver todos" e a
    // contagem de peças), em vez de ficar um cartão sem legenda nenhuma.
    const r = await SiteSettings.updateShopAllCard({
      title: (req.body.shop_all_card_title || '').trim(),
      subtitle: (req.body.shop_all_card_subtitle || '').trim()
    });
    if (!r.success) req.flash('error_msg', r.message || 'Falha ao guardar os textos.');
    else req.flash('success_msg', 'Textos do cartão "Ver todos" atualizados.');
  } catch (error) {
    console.error('Error updating shop-all card texts:', error);
    req.flash('error_msg', 'Falha ao atualizar os textos do cartão. ' + (error.message || ''));
  }
  res.redirect(back);
});

/**
 * GET /admin/site-appearance/:id
 * Editor de uma coleção: textos, SEO e as duas imagens.
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [family, galleryImages] = await Promise.all([
      ProductFamily.getByIdWithProductCount(id),
      listGalleryImages()
    ]);

    if (!family) {
      req.flash('error_msg', 'Coleção não encontrada.');
      return res.redirect('/admin/site-appearance');
    }

    res.render('admin/site-appearance/edit', {
      layout: 'admin/layouts/main',
      title: 'Categoria: ' + family.name,
      family,
      galleryImages,
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading collection editor:', error);
    req.flash('error_msg', 'Falha ao carregar a coleção.');
    res.redirect('/admin/site-appearance');
  }
});

/** POST /admin/site-appearance/:id/content — nome, descrição e SEO. */
router.post('/:id/content', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const back = `/admin/site-appearance/${id}`;
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      req.flash('error_msg', 'O nome é obrigatório.');
      return res.redirect(back);
    }

    await ProductFamily.updateContent(id, {
      name,
      description: (req.body.description || '').trim(),
      seoTitle: (req.body.seo_title || '').trim(),
      seoDescription: (req.body.seo_description || '').trim()
    });

    req.flash('success_msg', 'Coleção atualizada.');
  } catch (error) {
    console.error('Error updating collection content:', error);
    req.flash('error_msg', 'Falha ao atualizar a coleção. ' + (error.message || ''));
  }
  res.redirect(back);
});

/**
 * Handler partilhado pelas duas imagens da coleção.
 * @param {'hero'|'card'} kind
 */
function imageHandler(kind) {
  const config = {
    hero: {
      existingField: 'hero_image_existing',
      removeField: 'remove_hero_image',
      save: ProductFamily.updateHeroImage.bind(ProductFamily),
      nome: 'Imagem do cabeçalho'
    },
    card: {
      existingField: 'card_image_existing',
      removeField: 'remove_card_image',
      save: ProductFamily.updateCardImage.bind(ProductFamily),
      nome: 'Imagem do cartão'
    }
  }[kind];

  return async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const back = `/admin/site-appearance/${id}`;
    try {
      const family = await ProductFamily.getById(id);
      if (!family) {
        req.flash('error_msg', 'Coleção não encontrada.');
        return res.redirect('/admin/site-appearance');
      }

      const resolved = await resolveImageFromRequest(req, config);
      if (resolved.error) {
        req.flash('error_msg', resolved.error);
        return res.redirect(back);
      }

      await config.save(id, resolved.path);
      req.flash('success_msg', resolved.path
        ? `${config.nome} atualizada.`
        : `${config.nome} removida.`);
    } catch (error) {
      console.error(`Error updating collection ${kind} image:`, error);
      req.flash('error_msg', `Falha ao atualizar a ${config.nome.toLowerCase()}. ` + (error.message || ''));
    }
    res.redirect(back);
  };
}

router.post('/:id/hero-image', galleryUpload.single('hero_image_file'), imageHandler('hero'));
router.post('/:id/card-image', galleryUpload.single('card_image_file'), imageHandler('card'));

module.exports = router;
