const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const SiteSettingsController = require('../../controllers/SiteSettingsController');
const { adminSessionRequired } = require('../../middleware/authMiddleware');

// Protect all routes in this file - only require admin session
router.use(adminSessionRequired);

// Upload de novas imagens para a galeria (usadas, entre outros, como fundo do hero)
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/media/gallery');
    fs.mkdir(uploadPath, { recursive: true }, (err) => cb(err, uploadPath));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const galleryImageUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB — imagens de hero tendem a ser maiores
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Tipo de ficheiro inválido. Apenas imagens são permitidas.'));
  }
});

// GET route to display the settings form
router.get('/', SiteSettingsController.showSettingsForm);

// POST route to save the settings
router.post('/', SiteSettingsController.updateSettings);

// POST route to choose/upload the hero background image
router.post('/hero-image', galleryImageUpload.single('hero_image_file'), SiteSettingsController.updateHeroImage);

module.exports = router;
