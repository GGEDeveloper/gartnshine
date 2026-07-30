const express = require('express');
const router = express.Router();
const InstagramAccount = require('../../models/InstagramAccount');
const InstagramMedia = require('../../models/InstagramMedia');
const syncService = require('../../services/instagramSyncService');
const { adminSessionRequired } = require('../../middleware/authMiddleware');

router.use(adminSessionRequired);

/** GET /admin/instagram — estado da ligação e moderação dos posts. */
router.get('/', async (req, res) => {
  try {
    const estado = (req.query.estado || 'todos');
    const [status, media, stats] = await Promise.all([
      InstagramAccount.status(),
      InstagramMedia.getForAdmin({ estado }),
      InstagramMedia.stats()
    ]);

    res.render('admin/instagram/index', {
      layout: 'admin/layouts/main',
      title: 'Instagram',
      status,
      media,
      stats,
      estado,
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading instagram admin:', error);
    req.flash('error_msg', 'Falha ao carregar a área do Instagram.');
    res.redirect('/admin/dashboard');
  }
});

/** POST /admin/instagram/token — ligar a conta com um token novo. */
router.post('/token', async (req, res) => {
  try {
    const { perfil } = await syncService.ligarComToken(req.body.token);
    req.flash('success_msg', `Conta @${perfil.username} ligada. A sincronizar…`);
    try {
      const r = await syncService.sincronizar();
      req.flash('success_msg',
        `Conta @${perfil.username} ligada. ${r.total} publicações sincronizadas.`);
    } catch (_) {
      // A ligação ficou feita; a sincronização pode ser repetida à mão.
    }
  } catch (error) {
    console.error('Instagram: ligar falhou:', error.message);
    req.flash('error_msg', `Não foi possível ligar: ${error.message}`);
  }
  res.redirect('/admin/instagram');
});

/** POST /admin/instagram/sync — ir buscar publicações novas. */
router.post('/sync', async (req, res) => {
  try {
    const r = await syncService.sincronizar();
    req.flash('success_msg',
      `Sincronizado: ${r.total} publicações lidas, ${r.inseridos} novas.`);
  } catch (error) {
    req.flash('error_msg', `Sincronização falhou: ${error.message}`);
  }
  res.redirect('/admin/instagram');
});

/** POST /admin/instagram/refresh — forçar renovação do token. */
router.post('/refresh', async (req, res) => {
  try {
    const r = await syncService.renovarSeNecessario({ forcar: true });
    if (r.renovado) req.flash('success_msg', 'Token renovado por mais 60 dias.');
    else req.flash('error_msg', `Não foi renovado: ${r.motivo}`);
  } catch (error) {
    req.flash('error_msg', `Renovação falhou: ${error.message}`);
  }
  res.redirect('/admin/instagram');
});

/** POST /admin/instagram/disconnect — esquecer o token guardado. */
router.post('/disconnect', async (req, res) => {
  try {
    await InstagramAccount.clear();
    req.flash('success_msg',
      'Conta desligada. As publicações já sincronizadas continuam guardadas.');
  } catch (error) {
    req.flash('error_msg', 'Falha ao desligar a conta.');
  }
  res.redirect('/admin/instagram');
});

/** POST /admin/instagram/:id/visibilidade — esconder ou mostrar. */
router.post('/:id/visibilidade', async (req, res) => {
  try {
    const esconder = req.body.acao === 'esconder';
    await InstagramMedia.setHidden(req.params.id, esconder);
    req.flash('success_msg', esconder ? 'Publicação escondida do site.' : 'Publicação visível no site.');
  } catch (error) {
    req.flash('error_msg', 'Falha ao alterar a visibilidade.');
  }
  res.redirect('/admin/instagram' + (req.body.estado ? `?estado=${req.body.estado}` : ''));
});

/** POST /admin/instagram/:id/destaque — destacar ou retirar destaque. */
router.post('/:id/destaque', async (req, res) => {
  try {
    const destacar = req.body.acao === 'destacar';
    await InstagramMedia.setFeatured(req.params.id, destacar);
    req.flash('success_msg', destacar ? 'Publicação destacada.' : 'Destaque retirado.');
  } catch (error) {
    req.flash('error_msg', 'Falha ao alterar o destaque.');
  }
  res.redirect('/admin/instagram' + (req.body.estado ? `?estado=${req.body.estado}` : ''));
});

/** POST /admin/instagram/:id/remover — apagar da base local. */
router.post('/:id/remover', async (req, res) => {
  try {
    await InstagramMedia.delete(req.params.id);
    req.flash('success_msg',
      'Publicação removida. Volta a aparecer na próxima sincronização — para a tirar do site em definitivo, esconda-a.');
  } catch (error) {
    req.flash('error_msg', 'Falha ao remover.');
  }
  res.redirect('/admin/instagram');
});

module.exports = router;
