#!/usr/bin/env node
/**
 * Run media management migrations - creates media_files, media_usage, media_folders, media_tags, etc.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../config/database').pool;

async function run() {
  try {
    // 1. media_files (without FK to users if users might not exist)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id INT NOT NULL AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) DEFAULT NULL,
        file_size INT DEFAULT NULL,
        mime_type VARCHAR(100) DEFAULT NULL,
        width INT DEFAULT NULL,
        height INT DEFAULT NULL,
        has_thumbnail BOOLEAN DEFAULT 0,
        has_medium BOOLEAN DEFAULT 0,
        has_large BOOLEAN DEFAULT 0,
        has_webp BOOLEAN DEFAULT 0,
        uploaded_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_filename (filename),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('media_files OK');

    // 2. media_usage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_usage (
        id INT NOT NULL AUTO_INCREMENT,
        media_id INT NOT NULL,
        used_in_table VARCHAR(100) NOT NULL,
        used_in_id INT NOT NULL,
        usage_type VARCHAR(50) DEFAULT NULL,
        usage_context VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_media_id (media_id),
        FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('media_usage OK');
  } catch (e) {
    if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.message?.includes('already exists')) {
      console.log('Tables exist');
    } else {
      console.error('Error:', e.message);
      process.exit(1);
    }
  }

  // Add columns to media_files if missing
  const alterCols = [
    ['folder_path', "VARCHAR(500) DEFAULT '/'"],
    ['original_name', 'VARCHAR(255)'],
    ['file_path', 'VARCHAR(500)'],
    ['alt_text', 'VARCHAR(500)'],
    ['title', 'VARCHAR(255)'],
    ['description', 'TEXT'],
    ['dominant_color', 'VARCHAR(7)'],
    ['dimensions', 'JSON'],
    ['file_hash', 'VARCHAR(64)'],
    ['processed_variants', 'JSON'],
    ['upload_source', "VARCHAR(50) DEFAULT 'web'"],
  ];
  for (const [col, def] of alterCols) {
    try {
      await pool.query(`ALTER TABLE media_files ADD COLUMN ${col} ${def}`);
      console.log('Added column', col);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {}
    }
  }

  // 3. media_folders
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_folders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      path VARCHAR(500) NOT NULL UNIQUE,
      parent_id INT NULL,
      description TEXT NULL,
      color VARCHAR(7) DEFAULT '#667eea',
      icon VARCHAR(50) DEFAULT 'folder',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_path (path)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('media_folders OK');

  // 4. media_tags
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      color VARCHAR(7) DEFAULT '#c0a080',
      usage_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('media_tags OK');

  // 5. media_file_tags
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_file_tags (
      media_file_id INT NOT NULL,
      tag_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (media_file_id, tag_id),
      FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES media_tags(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('media_file_tags OK');

  // Add usage_type, usage_context to media_usage if Media model needs them
  try {
    await pool.query('ALTER TABLE media_usage ADD COLUMN usage_type VARCHAR(50)');
  } catch (e) {}
  try {
    await pool.query('ALTER TABLE media_usage ADD COLUMN usage_context VARCHAR(100)');
  } catch (e) {}

  // Insert default folders
  await pool.query(`
    INSERT IGNORE INTO media_folders (name, path, description, icon, color) VALUES
    ('Root', '/', 'Pasta principal', 'folder', '#667eea'),
    ('Gallery', '/gallery/', 'Galeria do frontend', 'images', '#4ecdc4'),
    ('Products', '/products/', 'Imagens de produtos', 'gem', '#c0a080'),
    ('Categories', '/categories/', 'Imagens de categorias', 'tags', '#4ecdc4'),
    ('Blog', '/blog/', 'Imagens para blog', 'edit', '#f59e0b'),
    ('Marketing', '/marketing/', 'Material de marketing', 'bullhorn', '#ef4444'),
    ('Temp', '/temp/', 'Ficheiros temporários', 'clock', '#9ca3af')
  `);
  console.log('Default folders OK');

  // Insert default tags
  await pool.query(`
    INSERT IGNORE INTO media_tags (name, slug, color) VALUES
    ('Produto', 'produto', '#c0a080'),
    ('Destaque', 'destaque', '#f59e0b'),
    ('Categoria', 'categoria', '#4ecdc4'),
    ('Marketing', 'marketing', '#ef4444'),
    ('Blog', 'blog', '#8b5cf6'),
    ('Temporário', 'temporario', '#9ca3af')
  `);
  console.log('Default tags OK');

  console.log('Media migration complete.');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
