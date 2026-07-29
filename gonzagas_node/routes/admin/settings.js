const express = require('express');
const router = express.Router();
const SiteSettingsController = require('../../controllers/SiteSettingsController');
const { adminSessionRequired } = require('../../middleware/authMiddleware');
const { createGalleryUpload } = require('../../middleware/galleryUpload');

// Protect all routes in this file - only require admin session
router.use(adminSessionRequired);

// Upload de novas imagens para a galeria (usadas, entre outros, como fundo do hero)
const galleryImageUpload = createGalleryUpload('hero');

// GET route to display the settings form
router.get('/', SiteSettingsController.showSettingsForm);

// POST route to save the settings
router.post('/', SiteSettingsController.updateSettings);

// POST route to choose/upload the hero background image
router.post('/hero-image', galleryImageUpload.single('hero_image_file'), SiteSettingsController.updateHeroImage);

// POST route to choose/upload the featured section background image
router.post('/featured-background', galleryImageUpload.single('featured_bg_file'), SiteSettingsController.updateFeaturedBackground);

// POST route to choose/upload the media strip section background image
router.post('/media-strip-background', galleryImageUpload.single('media_strip_bg_file'), SiteSettingsController.updateMediaStripBackground);

module.exports = router;
