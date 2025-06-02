const express = require('express');
const router = express.Router();
const SiteSettingsController = require('../../controllers/SiteSettingsController');
const { adminSessionRequired, roleRequired } = require('../../middleware/authMiddleware'); // Assuming your auth middleware

// Protect all routes in this file
router.use(adminSessionRequired);
router.use(roleRequired(['admin', 'superadmin'])); // Adjust roles as needed

// GET route to display the settings form
router.get('/', SiteSettingsController.showSettingsForm);

// POST route to save the settings
router.post('/', SiteSettingsController.saveSettings);

module.exports = router;
