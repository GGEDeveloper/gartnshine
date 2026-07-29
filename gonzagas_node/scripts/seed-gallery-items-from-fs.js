/**
 * Popula gallery_items a partir dos ficheiros já existentes em
 * public/media/gallery/, preservando o comportamento que a página /collections
 * tinha quando lia o filesystem diretamente.
 *
 * Correr UMA vez, no deploy em que /collections passa a ler da BD — sem isto a
 * galeria pública apareceria vazia.
 *
 * É idempotente: ficheiros já presentes na tabela são ignorados, por isso pode
 * ser corrido novamente sem duplicar.
 *
 *   node scripts/seed-gallery-items-from-fs.js
 */
require('dotenv').config();
const { pool } = require('../config/database');
const GalleryItem = require('../models/GalleryItem');
const { listGalleryImages } = require('../utils/galleryLibrary');

async function seed() {
  const images = await listGalleryImages();
  if (images.length === 0) {
    console.log('Nenhuma imagem encontrada em public/media/gallery — nada a fazer.');
    return;
  }

  const used = new Set(await GalleryItem.getUsedFilenames());

  // Mesma exclusão que a rota antiga aplicava.
  const candidates = images.filter((img) => !img.filename.toLowerCase().includes('banner-about'));

  let added = 0;
  let skipped = 0;
  for (const img of candidates) {
    if (used.has(img.filename)) {
      skipped++;
      continue;
    }
    await GalleryItem.create({ filename: img.filename });
    added++;
  }

  console.log(`Galeria semeada: ${added} adicionada(s), ${skipped} já existente(s), de ${candidates.length} ficheiro(s).`);
}

let failed = false;
seed()
  .catch((error) => {
    console.error('Erro ao semear a galeria:', error);
    failed = true;
  })
  .finally(async () => {
    await pool.end();
    // config/database.js mantém um setInterval de health-check que segura o
    // event loop; sem saída explícita o script nunca terminava.
    process.exit(failed ? 1 : 0);
  });
