const express = require('express');
const router = express.Router();
const SiteSettingsController = require('../../controllers/SiteSettingsController');
const { adminSessionRequired } = require('../../middleware/authMiddleware');

// Protect all routes in this file - only require admin session
router.use(adminSessionRequired);

// GET route to display the settings form
router.get('/', SiteSettingsController.showSettingsForm);

// POST route to save the settings
router.post('/', SiteSettingsController.updateSettings);

module.exports = router;
