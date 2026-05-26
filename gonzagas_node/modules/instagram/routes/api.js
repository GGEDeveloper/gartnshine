/**
 * API REST do módulo Instagram (caso de estudo).
 * Em produção: restringir (auth, rate limit agressivo, ou só admin).
 */

const express = require('express');
const router = express.Router();
const capabilities = require('../services/capabilities');
const engagement = require('../services/engagementService');

router.get('/capabilities', (req, res) => {
  res.json({ ok: true, data: capabilities.getCapabilities() });
});

router.get('/media/:id/comments', async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit || '25'), 10) || 25, 1),
      50
    );
    const data = await engagement.fetchCommentsForMedia(req.params.id, {
      limit
    });
    res.json({ ok: true, data });
  } catch (err) {
    const status = err.code === 'FB_NO_PAGE_TOKEN' ? 503 : err.status || 400;
    res.status(status).json({
      ok: false,
      code: err.code || 'ERROR',
      message: err.message
    });
  }
});

router.get('/media/:id/summary', async (req, res) => {
  try {
    const fields = req.query.fields || engagement.FACEBOOK_IG_MEDIA_OPTIONAL_FIELDS;
    const data = await engagement.fetchMediaEngagementSummary(
      req.params.id,
      fields
    );
    res.json({ ok: true, data });
  } catch (err) {
    const status = err.code === 'FB_NO_PAGE_TOKEN' ? 503 : err.status || 400;
    res.status(status).json({
      ok: false,
      code: err.code || 'ERROR',
      message: err.message
    });
  }
});

router.get('/media/:id/insights', async (req, res) => {
  try {
    const metrics = req.query.metrics;
    if (!metrics) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_METRICS',
        message: 'Query parameter metrics is required (comma-separated)'
      });
    }
    const data = await engagement.fetchMediaInsights(req.params.id, metrics);
    res.json({ ok: true, data });
  } catch (err) {
    const status = err.code === 'FB_NO_PAGE_TOKEN' ? 503 : err.status || 400;
    res.status(status).json({
      ok: false,
      code: err.code || 'ERROR',
      message: err.message
    });
  }
});

module.exports = router;
