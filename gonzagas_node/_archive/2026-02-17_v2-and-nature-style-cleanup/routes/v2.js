const express = require('express');
const router = express.Router();
const v2Routes = require('./v2');

// Todas as rotas v2 serão prefixadas com /api/v2
router.use('/api/v2', v2Routes);

module.exports = router;
