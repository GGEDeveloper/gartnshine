const express = require('express');
const router = express.Router();
const Collection = require('../../models/Collection');
const ProductFamily = require('../../models/ProductFamily');
const { listGalleryImages, resolveImageFromRequest } = require('../../utils/galleryLibrary');
const { adminSessionRequired } = require('../../middleware/authMiddleware');
const { createGalleryUpload } = require('../../middleware/galleryUpload');

router.use(adminSessionRequired);

const galleryUpload = createGalleryUpload('colecao');

/** GET /admin/collections — lista das coleções curadas. */
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.getAllForAdmin();
    res.render('admin/collections/index', {
      layout: 'admin/layouts/main',
      title: 'Coleções',
      collections,
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading curated collections:', error);
    req.flash('error_msg', 'Falha ao carregar as coleções.');
    res.redirect('/admin/dashboard');
  }
});

/** POST /admin/collections/create */
router.post('/create', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      req.flash('error_msg', 'Dê um nome à coleção.');
      return res.redirect('/admin/collections');
    }
    const id = await Collection.create({ name });
    req.flash('success_msg', 'Coleção criada. Escolha agora as peças.');
    res.redirect(`/admin/collections/${id}`);
  } catch (error) {
    console.error('Error creating collection:', error);
    req.flash('error_msg', 'Falha ao criar a coleção. ' + (error.message || ''));
    res.redirect('/admin/collections');
  }
});

/** GET /admin/collections/:id — editor: peças, textos, SEO e imagens. */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const collection = await Collection.getById(id);
    if (!collection) {
      req.flash('error_msg', 'Coleção não encontrada.');
      return res.redirect('/admin/collections');
    }

    const q = (req.query.q || '').trim();
    const familyId = req.query.family || '';

    const [products, candidates, families, galleryImages] = await Promise.all([
      Collection.getProducts(id, { activeOnly: false }),
      Collection.getCandidateProducts(id, { q, familyId: familyId || null }),
      ProductFamily.getAllWithProductCount(),
      listGalleryImages()
    ]);

    res.render('admin/collections/edit', {
      layout: 'admin/layouts/main',
      title: 'Coleção: ' + collection.name,
      collection,
      products,
      candidates,
      families: families.filter((f) => Number(f.product_count) > 0),
      galleryImages,
      filters: { q, familyId },
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading collection editor:', error);
    req.flash('error_msg', 'Falha ao carregar a coleção.');
    res.redirect('/admin/collections');
  }
});

/** POST /admin/collections/:id/content — nome, descrição, SEO e visibilidade. */
router.post('/:id/content', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const back = `/admin/collections/${id}`;
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      req.flash('error_msg', 'O nome é obrigatório.');
      return res.redirect(back);
    }
    await Collection.updateContent(id, {
      name,
      description: (req.body.description || '').trim(),
      seoTitle: (req.body.seo_title || '').trim(),
      seoDescription: (req.body.seo_description || '').trim(),
      isActive: req.body.is_active === '1'
    });
    req.flash('success_msg', 'Coleção atualizada.');
  } catch (error) {
    console.error('Error updating collection:', error);
    req.flash('error_msg', 'Falha ao atualizar. ' + (error.message || ''));
  }
  res.redirect(back);
});

/** POST /admin/collections/:id/products/add — acrescentar peças escolhidas. */
router.post('/:id/products/add', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const back = `/admin/collections/${id}`;
  try {
    const raw = req.body.product_ids;
    const ids = (Array.isArray(raw) ? raw : (raw ? [raw] : []))
      .map((v) => parseInt(v, 10))
      .filter((v) => Number.isInteger(v));

    if (ids.length === 0) {
      req.flash('error_msg', 'Selecione pelo menos uma peça.');
      return res.redirect(back);
    }

    const added = await Collection.addProducts(id, ids);
    req.flash('success_msg', `${added} peça(s) acrescentada(s) à coleção.`);
  } catch (error) {
    console.error('Error adding products to collection:', error);
    req.flash('error_msg', 'Falha ao acrescentar peças. ' + (error.message || ''));
  }
  res.redirect(back);
});

/** POST /admin/collections/:id/products/:productId/remove */
router.post('/:id/products/:productId/remove', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await Collection.removeProduct(id, parseInt(req.params.productId, 10));
    req.flash('success_msg', 'Peça retirada da coleção (o produto não foi apagado).');
  } catch (error) {
    console.error('Error removing product from collection:', error);
    req.flash('error_msg', 'Falha ao retirar a peça.');
  }
  res.redirect(`/admin/collections/${id}`);
});

/** POST /admin/collections/:id/products/:productId/move */
router.post('/:id/products/:productId/move', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const direction = req.body.direction === 'up' ? 'up' : 'down';
    await Collection.moveProduct(id, parseInt(req.params.productId, 10), direction);
  } catch (error) {
    console.error('Error moving product in collection:', error);
    req.flash('error_msg', 'Falha ao reordenar.');
  }
  res.redirect(`/admin/collections/${id}`);
});

/** Handler partilhado pelas duas imagens da coleção. */
function imageHandler(field, existingField, removeField, nome) {
  return async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const back = `/admin/collections/${id}`;
    try {
      const resolved = await resolveImageFromRequest(req, { existingField, removeField });
      if (resolved.error) {
        req.flash('error_msg', resolved.error);
        return res.redirect(back);
      }
      await Collection.updateImage(id, field, resolved.path);
      req.flash('success_msg', resolved.path ? `${nome} atualizada.` : `${nome} removida.`);
    } catch (error) {
      console.error(`Error updating collection ${field}:`, error);
      req.flash('error_msg', `Falha ao atualizar a ${nome.toLowerCase()}.`);
    }
    res.redirect(back);
  };
}

router.post('/:id/hero-image', galleryUpload.single('hero_image_file'),
  imageHandler('hero_image', 'hero_image_existing', 'remove_hero_image', 'Imagem do cabeçalho'));
router.post('/:id/card-image', galleryUpload.single('card_image_file'),
  imageHandler('card_image', 'card_image_existing', 'remove_card_image', 'Imagem do cartão'));

/** POST /admin/collections/:id/delete */
router.post('/:id/delete', async (req, res) => {
  try {
    await Collection.delete(parseInt(req.params.id, 10));
    req.flash('success_msg', 'Coleção apagada. Os produtos não foram afetados.');
  } catch (error) {
    console.error('Error deleting collection:', error);
    req.flash('error_msg', 'Falha ao apagar a coleção.');
  }
  res.redirect('/admin/collections');
});

module.exports = router;
