const express = require('express');
const router = express.Router();
const GalleryItem = require('../../models/GalleryItem');
const { listGalleryImages } = require('../../utils/galleryLibrary');
const { adminSessionRequired } = require('../../middleware/authMiddleware');
const { createGalleryUpload } = require('../../middleware/galleryUpload');

router.use(adminSessionRequired);

const galleryUpload = createGalleryUpload('galeria');

/** GET /admin/gallery — gerir os itens da galeria pública. */
router.get('/', async (req, res) => {
  try {
    const items = await GalleryItem.getAllForAdmin();
    const used = new Set(items.map((i) => i.filename));
    const available = (await listGalleryImages()).filter((img) => !used.has(img.filename));

    res.render('admin/gallery/index', {
      layout: 'admin/layouts/main',
      title: 'Galeria',
      items,
      available,
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading gallery admin:', error);
    req.flash('error_msg', 'Falha ao carregar a galeria.');
    res.redirect('/admin/dashboard');
  }
});

/** POST /admin/gallery/add — adicionar imagens já existentes na pasta da galeria. */
router.post('/add', async (req, res) => {
  try {
    const raw = req.body.filenames;
    const filenames = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    if (filenames.length === 0) {
      req.flash('error_msg', 'Selecione pelo menos uma imagem.');
      return res.redirect('/admin/gallery');
    }

    // Só aceita ficheiros que existam mesmo na pasta da galeria.
    const galleryImages = await listGalleryImages();
    const valid = new Set(galleryImages.map((img) => img.filename));
    const used = new Set(await GalleryItem.getUsedFilenames());

    let added = 0;
    for (const filename of filenames) {
      if (!valid.has(filename) || used.has(filename)) continue;
      await GalleryItem.create({ filename });
      added++;
    }

    req.flash(added > 0 ? 'success_msg' : 'error_msg',
      added > 0 ? `${added} imagem(ns) adicionada(s) à galeria.` : 'Nenhuma imagem válida para adicionar.');
    res.redirect('/admin/gallery');
  } catch (error) {
    console.error('Error adding gallery items:', error);
    req.flash('error_msg', 'Falha ao adicionar imagens.');
    res.redirect('/admin/gallery');
  }
});

/** POST /admin/gallery/upload — enviar uma imagem nova e adicioná-la já à galeria. */
router.post('/upload', galleryUpload.single('gallery_file'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error_msg', 'Nenhum ficheiro enviado.');
      return res.redirect('/admin/gallery');
    }
    await GalleryItem.create({
      filename: req.file.filename,
      caption: req.body.caption?.trim() || null
    });
    req.flash('success_msg', 'Imagem enviada e adicionada à galeria.');
    res.redirect('/admin/gallery');
  } catch (error) {
    console.error('Error uploading gallery item:', error);
    req.flash('error_msg', 'Falha ao enviar imagem.');
    res.redirect('/admin/gallery');
  }
});

/** POST /admin/gallery/:id/edit — legenda e visibilidade. */
router.post('/:id/edit', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await GalleryItem.update(id, {
      caption: req.body.caption?.trim() || null,
      isActive: req.body.is_active === '1'
    });
    req.flash('success_msg', 'Item atualizado.');
  } catch (error) {
    console.error('Error updating gallery item:', error);
    req.flash('error_msg', 'Falha ao atualizar o item.');
  }
  res.redirect('/admin/gallery');
});

/** POST /admin/gallery/:id/move — reordenar (cima/baixo). */
router.post('/:id/move', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const direction = req.body.direction === 'up' ? 'up' : 'down';
    await GalleryItem.move(id, direction);
  } catch (error) {
    console.error('Error moving gallery item:', error);
    req.flash('error_msg', 'Falha ao reordenar.');
  }
  res.redirect('/admin/gallery');
});

/** POST /admin/gallery/:id/delete — remove só da galeria; o ficheiro fica no disco. */
router.post('/:id/delete', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await GalleryItem.delete(id);
    req.flash('success_msg', 'Item removido da galeria (o ficheiro foi mantido).');
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    req.flash('error_msg', 'Falha ao remover o item.');
  }
  res.redirect('/admin/gallery');
});

module.exports = router;
