/**
 * Painel admin: carrinhos dos clientes em tempo real.
 *
 * Rotas só de leitura. A página faz polling a /admin/carrinhos/dados, que
 * devolve o mesmo parcial já renderizado (evita duplicar o template em JS).
 */

const express = require('express');
const router = express.Router();
const liveCarts = require('../services/liveCartsService');
const { adminSessionRequired } = require('../../../../middleware/authMiddleware');

router.use(adminSessionRequired);

function parseOpts(query) {
  return {
    search: query.search || '',
    filter: ['active', 'identified', 'abandoned'].includes(query.filter) ? query.filter : 'all',
  };
}

async function buildViewData(query) {
  const opts = parseOpts(query);
  const data = await liveCarts.getLiveCarts(opts);
  return {
    carts: data.carts,
    stats: data.stats,
    missingTable: data.missingTable,
    generatedAt: data.generatedAt,
    activeWindowMinutes: data.activeWindowMinutes || liveCarts.ACTIVE_WINDOW_MINUTES,
    abandonedAfterHours: liveCarts.ABANDONED_AFTER_HOURS,
    filters: opts,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const data = await buildViewData(req.query);
    res.render('admin/carts/index', { title: 'Carrinhos em tempo real', ...data });
  } catch (err) {
    next(err);
  }
});

// Fragmento HTML usado pelo auto-refresh da página
router.get('/dados', async (req, res, next) => {
  try {
    const data = await buildViewData(req.query);
    res.set('Cache-Control', 'no-store');
    res.render('admin/carts/_content', { ...data, layout: false });
  } catch (err) {
    next(err);
  }
});

// Versão JSON, útil para integrações ou debugging
router.get('/dados.json', async (req, res) => {
  try {
    const data = await buildViewData(req.query);
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
