-- Enhanced Media Management Schema
-- Building on existing media_files and media_usage tables

-- Add columns to existing media_files table
ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS folder_path VARCHAR(500) DEFAULT '/',
ADD COLUMN IF NOT EXISTS tags JSON,
ADD COLUMN IF NOT EXISTS alt_text VARCHAR(500),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS dominant_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS dimensions JSON,
ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS edit_history JSON,
ADD COLUMN IF NOT EXISTS upload_source ENUM('web', 'mobile', 'api', 'bulk') DEFAULT 'web',
ADD COLUMN IF NOT EXISTS processed_variants JSON,
ADD COLUMN IF NOT EXISTS seo_optimized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP NULL;

-- Create media_folders table
CREATE TABLE IF NOT EXISTS media_folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL UNIQUE,
    parent_id INT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#4f5b66',
    icon VARCHAR(50) DEFAULT 'folder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES media_folders(id) ON DELETE CASCADE,
    INDEX idx_media_folders_path (path),
    INDEX idx_media_folders_parent (parent_id)
);

-- Create media_tags table  
CREATE TABLE IF NOT EXISTS media_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#c0a080',
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_media_tags_slug (slug),
    INDEX idx_media_tags_usage (usage_count)
);

-- Create media_file_tags junction table
CREATE TABLE IF NOT EXISTS media_file_tags (
    media_file_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (media_file_id, tag_id),
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES media_tags(id) ON DELETE CASCADE
);

-- Create media_collections table
CREATE TABLE IF NOT EXISTS media_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    thumbnail_id INT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (thumbnail_id) REFERENCES media_files(id) ON DELETE SET NULL,
    INDEX idx_media_collections_slug (slug)
);

-- Create media_collection_items junction table
CREATE TABLE IF NOT EXISTS media_collection_items (
    collection_id INT NOT NULL,
    media_file_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (collection_id, media_file_id),
    FOREIGN KEY (collection_id) REFERENCES media_collections(id) ON DELETE CASCADE,
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_collection_items_order (collection_id, sort_order)
);

-- Create media_processing_jobs table
CREATE TABLE IF NOT EXISTS media_processing_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    media_file_id INT NOT NULL,
    job_type ENUM('resize', 'compress', 'watermark', 'convert', 'seo_optimize') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    parameters JSON,
    result JSON,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_processing_jobs_status (status),
    INDEX idx_processing_jobs_type (job_type)
);

-- Insert default folders
INSERT IGNORE INTO media_folders (name, path, description, icon, color) VALUES
('Root', '/', 'Pasta principal', 'folder', '#4f5b66'),
('Products', '/products/', 'Imagens de produtos', 'gem', '#c0a080'),
('Categories', '/categories/', 'Imagens de categorias', 'tags', '#4b6854'),
('Blog', '/blog/', 'Imagens para blog', 'edit', '#f59e0b'),
('Marketing', '/marketing/', 'Material de marketing', 'bullhorn', '#ef4444'),
('Logos', '/logos/', 'Logos e branding', 'copyright', '#10b981'),
('Temp', '/temp/', 'Ficheiros temporários', 'clock', '#9ca3af');

-- Insert common tags
INSERT IGNORE INTO media_tags (name, slug, color) VALUES
('Produto', 'produto', '#c0a080'),
('Destaque', 'destaque', '#f59e0b'),
('Categoria', 'categoria', '#4b6854'),
('Marketing', 'marketing', '#ef4444'),
('Blog', 'blog', '#4b6854'),
('Social Media', 'social-media', '#8f846a'),
('Print', 'print', '#059669'),
('Web', 'web', '#dc2626'),
('Mobile', 'mobile', '#4f5b66'),
('Temporário', 'temporario', '#9ca3af');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_files_folder ON media_files(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_files_size ON media_files(file_size);
CREATE INDEX IF NOT EXISTS idx_media_files_created ON media_files(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_hash ON media_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_media_usage_type ON media_usage(usage_type);

-- Create view for media files with complete info
CREATE OR REPLACE VIEW media_files_complete AS
SELECT 
    mf.*,
    mf2.name as folder_name,
    GROUP_CONCAT(mt.name) as tag_names,
    GROUP_CONCAT(mt.color) as tag_colors,
    COUNT(DISTINCT mu.id) as usage_count
FROM media_files mf
LEFT JOIN media_folders mf2 ON mf.folder_path = mf2.path
LEFT JOIN media_file_tags mft ON mf.id = mft.media_file_id
LEFT JOIN media_tags mt ON mft.tag_id = mt.id
LEFT JOIN media_usage mu ON mf.id = mu.media_id
GROUP BY mf.id;

