-- Enhanced Media Management Schema (Safe version)

-- Check and add columns to media_files one by one
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'media_files'
        AND table_schema = DATABASE()
        AND column_name = 'folder_path'
    ) > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN folder_path VARCHAR(500) DEFAULT '/'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'tags') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN tags JSON"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'alt_text') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN alt_text VARCHAR(500)"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'title') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN title VARCHAR(255)"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'description') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN description TEXT"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'dominant_color') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN dominant_color VARCHAR(7)"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'dimensions') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN dimensions JSON"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'file_hash') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN file_hash VARCHAR(64)"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'edit_history') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN edit_history JSON"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'upload_source') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN upload_source ENUM('web', 'mobile', 'api', 'bulk') DEFAULT 'web'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'processed_variants') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN processed_variants JSON"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'seo_optimized') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN seo_optimized BOOLEAN DEFAULT FALSE"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'media_files' AND table_schema = DATABASE() AND column_name = 'last_accessed_at') > 0,
    "SELECT 1",
    "ALTER TABLE media_files ADD COLUMN last_accessed_at TIMESTAMP NULL"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Rest of the tables (these support IF NOT EXISTS)
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
    FOREIGN KEY (parent_id) REFERENCES media_folders(id) ON DELETE CASCADE,
    INDEX idx_path (path),
    INDEX idx_parent (parent_id)
);

CREATE TABLE IF NOT EXISTS media_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#4facfe',
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_file_tags (
    file_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (file_id, tag_id),
    FOREIGN KEY (file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES media_tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    cover_image_id INT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cover_image_id) REFERENCES media_files(id) ON DELETE SET NULL,
    INDEX idx_slug (slug)
);

CREATE TABLE IF NOT EXISTS media_collection_items (
    collection_id INT NOT NULL,
    file_id INT NOT NULL,
    position INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, file_id),
    FOREIGN KEY (collection_id) REFERENCES media_collections(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES media_files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_processing_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    job_type ENUM('resize', 'optimize', 'convert', 'watermark', 'ai_tag') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    progress INT DEFAULT 0,
    error_message TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_file (file_id)
);

-- Insert default folders
INSERT IGNORE INTO media_folders (name, path, parent_id, description, color, icon) VALUES
('Products', '/products', NULL, 'Product images', '#667eea', 'box'),
('Banners', '/banners', NULL, 'Hero and promotional banners', '#f093fb', 'image'),
('Icons', '/icons', NULL, 'System icons and badges', '#4facfe', 'star'),
('Documents', '/documents', NULL, 'PDFs and documents', '#43e97b', 'file');

-- Insert default tags
INSERT IGNORE INTO media_tags (name, slug, description, color) VALUES
('Featured', 'featured', 'Highlighted content', '#667eea'),
('New', 'new', 'Recently added', '#43e97b'),
('Sale', 'sale', 'On sale items', '#f5576c'),
('Trending', 'trending', 'Popular items', '#f093fb'),
('Handmade', 'handmade', 'Artisan products', '#4facfe');

-- Create indexes
CREATE INDEX idx_media_files_folder ON media_files(folder_path);
CREATE INDEX idx_media_files_hash ON media_files(file_hash);
CREATE INDEX idx_media_files_source ON media_files(upload_source);
CREATE INDEX idx_media_files_accessed ON media_files(last_accessed_at);

-- Create optimized view
CREATE OR REPLACE VIEW media_files_complete AS
SELECT 
    mf.*,
    GROUP_CONCAT(DISTINCT mt.name SEPARATOR ', ') as tag_names,
    mfd.name as folder_name,
    mfd.color as folder_color
FROM media_files mf
LEFT JOIN media_file_tags mft ON mf.id = mft.file_id
LEFT JOIN media_tags mt ON mft.tag_id = mt.id
LEFT JOIN media_folders mfd ON mf.folder_path = mfd.path
GROUP BY mf.id;
