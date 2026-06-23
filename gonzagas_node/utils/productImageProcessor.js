const fs = require('fs').promises;
const path = require('path');
const { Jimp } = require('jimp');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  sharp = null; // cPanel pode falhar - usa Jimp
}

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'media', 'products');

// [suffix, maxDimension, quality, fit]
// 'inside' preserva proporção sem cortar (usado em 'full'); 'cover' corta para preencher o quadrado (thumbs/grid)
const VARIANTS = [
  { suffix: 'full', size: 1600, quality: 85, fit: 'inside' },
  { suffix: 'medium', size: 800, quality: 85, fit: 'cover' },
  { suffix: 'small', size: 400, quality: 85, fit: 'cover' },
  { suffix: 'thumb', size: 160, quality: 80, fit: 'cover' }
];

function variantPath(filename, suffix, ext) {
  const base = filename.replace(/\.[^.]+$/, '');
  return `${base}-${suffix}.${ext}`;
}

/** Gera um buffer JPEG redimensionado - Sharp (rápido) ou Jimp (fallback puro JS para cPanel/dominios.pt) */
async function resizeToJpeg(absolutePath, size, quality, fit) {
  if (sharp) {
    try {
      const pipeline = sharp(absolutePath, { failOnError: false });
      const resizeOpts = fit === 'cover'
        ? { width: size, height: size, fit: 'cover' }
        : { width: size, height: size, fit: 'inside', withoutEnlargement: true };
      return await pipeline.resize(resizeOpts).jpeg({ quality }).toBuffer();
    } catch (sharpErr) {
      console.warn('Sharp falhou ao redimensionar, a usar Jimp:', sharpErr.message);
    }
  }
  const image = await Jimp.read(absolutePath);
  if (fit === 'cover') {
    image.cover({ w: size, h: size });
  } else {
    image.scaleToFit({ w: size, h: size });
  }
  return await image.getBuffer('image/jpeg', { quality });
}

/** Gera um buffer WebP a partir do original - requer Sharp; sem fallback Jimp (sem encoder WebP fiável em puro JS) */
async function resizeToWebp(absolutePath, size, quality, fit) {
  if (!sharp) return null;
  try {
    const pipeline = sharp(absolutePath, { failOnError: false });
    const resizeOpts = fit === 'cover'
      ? { width: size, height: size, fit: 'cover' }
      : { width: size, height: size, fit: 'inside', withoutEnlargement: true };
    return await pipeline.resize(resizeOpts).webp({ quality }).toBuffer();
  } catch (err) {
    console.warn('Sharp falhou ao gerar WebP:', err.message);
    return null;
  }
}

/**
 * Gera as variantes (full/medium/small/thumb, em JPEG + WebP) de uma imagem de produto.
 * NUNCA escreve no ficheiro original - apenas lê dele. Idempotente (sobrescreve variantes existentes).
 * @param {string} filename - nome do ficheiro original tal como guardado em product_images.image_filename
 * @returns {Promise<{ok: boolean, generated: string[], errors: string[]}>}
 */
async function processProductImage(filename) {
  const absolutePath = path.join(PRODUCTS_DIR, filename);
  const generated = [];
  const errors = [];

  try {
    await fs.access(absolutePath);
  } catch (e) {
    return { ok: false, generated, errors: [`Original não encontrado: ${filename}`] };
  }

  for (const variant of VARIANTS) {
    const jpgName = variantPath(filename, variant.suffix, 'jpg');
    try {
      const buf = await resizeToJpeg(absolutePath, variant.size, variant.quality, variant.fit);
      await fs.writeFile(path.join(PRODUCTS_DIR, jpgName), buf);
      generated.push(jpgName);
    } catch (err) {
      errors.push(`${jpgName}: ${err.message}`);
    }

    const webpName = variantPath(filename, variant.suffix, 'webp');
    try {
      const webpBuf = await resizeToWebp(absolutePath, variant.size, variant.quality, variant.fit);
      if (webpBuf) {
        await fs.writeFile(path.join(PRODUCTS_DIR, webpName), webpBuf);
        generated.push(webpName);
      }
    } catch (err) {
      errors.push(`${webpName}: ${err.message}`);
    }
  }

  return { ok: errors.length === 0, generated, errors };
}

/** Remove todas as variantes (jpg+webp, 4 tamanhos) associadas a um ficheiro original. Ignora ficheiros inexistentes. */
async function deleteProductImageVariants(filename) {
  for (const variant of VARIANTS) {
    for (const ext of ['jpg', 'webp']) {
      const name = variantPath(filename, variant.suffix, ext);
      try {
        await fs.unlink(path.join(PRODUCTS_DIR, name));
      } catch (e) {
        if (e.code !== 'ENOENT') console.warn('Não foi possível remover variante:', name, e.message);
      }
    }
  }
}

/**
 * Devolve os URLs públicos (jpg + webp) de uma variante para usar nas views.
 * @param {string|null|undefined} filename
 * @param {'full'|'medium'|'small'|'thumb'} size
 */
function productImg(filename, size) {
  const placeholder = '/images/imagem-nao-disponivel.svg';
  if (!filename) return { jpg: placeholder, webp: null };
  const variant = VARIANTS.find(v => v.suffix === size) || VARIANTS.find(v => v.suffix === 'small');
  return {
    jpg: `/media/products/${variantPath(filename, variant.suffix, 'jpg')}`,
    webp: `/media/products/${variantPath(filename, variant.suffix, 'webp')}`
  };
}

module.exports = {
  processProductImage,
  deleteProductImageVariants,
  productImg,
  VARIANTS
};
