const path = require('path');
const fs = require('fs');
const multer = require('multer');

/**
 * Upload de imagens para public/media/gallery — partilhado pelas definições do
 * site (hero/fundos), pela imagem de destaque das famílias e pela galeria curada.
 * @param {string} prefix Prefixo do nome do ficheiro gravado (ex.: 'hero', 'family').
 */
function createGalleryUpload(prefix = 'gallery') {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../public/media/gallery');
      fs.mkdir(uploadPath, { recursive: true }, (err) => cb(err, uploadPath));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = allowedTypes.test(file.mimetype);
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) return cb(null, true);
      cb(new Error('Tipo de ficheiro inválido. Apenas imagens são permitidas.'));
    }
  });
}

module.exports = { createGalleryUpload };
