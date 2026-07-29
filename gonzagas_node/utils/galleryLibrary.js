const fs = require('fs').promises;
const path = require('path');

const GALLERY_DIR = path.join(__dirname, '../public/media/gallery');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/** Lista as imagens disponíveis em public/media/gallery, mais recentes primeiro (para o admin escolher). */
async function listGalleryImages() {
  try {
    const files = await fs.readdir(GALLERY_DIR);
    const withStats = await Promise.all(
      files
        .filter((f) => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
        .map(async (f) => {
          const stat = await fs.stat(path.join(GALLERY_DIR, f));
          return { filename: f, path: `/media/gallery/${f}`, mtime: stat.mtimeMs };
        })
    );
    return withStats.sort((a, b) => b.mtime - a.mtime);
  } catch (error) {
    console.error('Erro ao listar imagens da galeria:', error);
    return [];
  }
}

module.exports = { GALLERY_DIR, IMAGE_EXTENSIONS, listGalleryImages };
