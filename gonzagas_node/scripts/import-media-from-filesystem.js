#!/usr/bin/env node
/**
 * Import media files from public/media (gallery, products, root) into media_files table.
 * Run after run-media-migration.js. Files appear in Media Library admin panel.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

const MEDIA_BASE = path.join(__dirname, '../public/media');
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function scanDir(dir, basePath = '') {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const relPath = basePath ? `${basePath}/${item.name}` : item.name;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await scanDir(fullPath, relPath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (IMAGE_EXT.includes(ext)) {
        files.push({ relPath, fullPath, name: item.name });
      }
    }
  }
  return files;
}

async function getFileSize(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch { return 0; }
}

function getMimeType(ext) {
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  return map[ext] || 'image/jpeg';
}

async function run() {
  console.log('Scanning public/media...');
  const allFiles = await scanDir(MEDIA_BASE);
  console.log(`Found ${allFiles.length} image files`);

  // Ensure Gallery folder exists
  await pool.query(`INSERT IGNORE INTO media_folders (name, path, description, icon, color) VALUES ('Gallery', '/gallery/', 'Galeria do frontend', 'images', '#4ecdc4')`);

  let imported = 0;
  let skipped = 0;

  for (const file of allFiles) {
    const parts = file.relPath.split(path.sep).filter(Boolean);
    const folderPath = parts.length > 1 ? `/${parts[0]}/` : '/';
    const filename = file.relPath.replace(/\\/g, '/'); // e.g. gallery/foo.jpg or products/bar.jpg
    const urlPath = `/media/${filename}`;

    // Check if already exists (by file_path)
    const [existing] = await pool.query('SELECT id FROM media_files WHERE file_path = ?', [urlPath]);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const fileSize = await getFileSize(file.fullPath);
    const ext = path.extname(file.name).toLowerCase();
    const mimeType = getMimeType(ext);

    try {
      await pool.query(
        `INSERT INTO media_files (filename, original_name, file_path, file_size, mime_type, folder_path, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [filename, file.name, urlPath, fileSize, mimeType, folderPath]
      );
      imported++;
      if (imported % 50 === 0) console.log(`  Imported ${imported}...`);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') skipped++;
      else console.error(`Error importing ${file.relPath}:`, e.message);
    }
  }

  console.log(`Done. Imported: ${imported}, Skipped: ${skipped}`);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
