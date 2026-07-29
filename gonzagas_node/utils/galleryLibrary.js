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

/**
 * Resolve, a partir de um POST do selector de imagens, qual o caminho a gravar.
 * Cobre os três casos do selector: ficheiro novo enviado, imagem já existente
 * escolhida na galeria, ou remoção.
 *
 * @returns {Promise<{ path: string|null }|{ error: string }>}
 *   `path` a gravar (null = remover), ou `error` com a mensagem para o utilizador.
 */
async function resolveImageFromRequest(req, { existingField, removeField }) {
  if (req.file) {
    return { path: `/media/gallery/${req.file.filename}` };
  }

  const chosen = req.body[existingField];
  if (chosen) {
    // Só aceita caminhos que correspondam a ficheiros realmente na galeria.
    const galleryImages = await listGalleryImages();
    const match = galleryImages.find((img) => img.path === chosen);
    if (!match) {
      return { error: 'Imagem selecionada não foi encontrada na galeria.' };
    }
    return { path: match.path };
  }

  if (removeField && req.body[removeField] === '1') {
    return { path: null };
  }

  return { error: 'Escolha uma imagem existente ou envie uma nova.' };
}

module.exports = { GALLERY_DIR, IMAGE_EXTENSIONS, listGalleryImages, resolveImageFromRequest };
