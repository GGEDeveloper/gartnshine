# 🚀 **FASES 5 & 6 COMPLETAS E DETALHADAS**

## **ESTADO ATUAL - ANÁLISE**

✅ **IMPLEMENTADO (67% COMPLETO):**
```
✅ Fase 1: Core Optimization (100%)
✅ Fase 2: Search + WhatsApp (100%) 
✅ Fase 3: Visual Impact & UX (100%)
✅ Fase 4: Client Experience (100%)
❌ Fase 5: Media Management (0%)
❌ Fase 6: Business Intelligence (0%)
```

**RESULTADO:** Site premium e-commerce funcional, falta apenas funcionalidades avançadas.

***

# 📅 **FASE 5: MEDIA MANAGEMENT REVOLUTION**

## **📋 OVERVIEW GERAL**

### **DURAÇÃO:** 2 semanas (10 dias úteis)
### **OBJECTIVO:** Sistema completo de gestão de media files
### **PRIORIDADE:** ⭐⭐⭐⭐ (Alta - melhora workflow admin)

### **FEATURES PRINCIPAIS:**
- ✅ Media library com upload múltiplo
- ✅ Drag & drop interface moderna  
- ✅ Image editing tools (crop, resize, filters)
- ✅ Bulk operations (mass edit, delete)
- ✅ Asset organization (folders, tags)
- ✅ Mobile camera integration
- ✅ Performance optimization
- ✅ Cloud storage integration

---

## 📅 **DAY 1-2: MEDIA LIBRARY FOUNDATION**

### **MORNING DAY 1: Database Schema Enhancement**

**STEP 1: Enhanced Media Tables**

**CRIAR: `sql/media_management_enhanced.sql`**
```sql
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
    color VARCHAR(7) DEFAULT '#667eea',
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
('Root', '/', 'Pasta principal', 'folder', '#667eea'),
('Products', '/products/', 'Imagens de produtos', 'gem', '#c0a080'),
('Categories', '/categories/', 'Imagens de categorias', 'tags', '#4ecdc4'),
('Blog', '/blog/', 'Imagens para blog', 'edit', '#f59e0b'),
('Marketing', '/marketing/', 'Material de marketing', 'bullhorn', '#ef4444'),
('Logos', '/logos/', 'Logos e branding', 'copyright', '#10b981'),
('Temp', '/temp/', 'Ficheiros temporários', 'clock', '#9ca3af');

-- Insert common tags
INSERT IGNORE INTO media_tags (name, slug, color) VALUES
('Produto', 'produto', '#c0a080'),
('Destaque', 'destaque', '#f59e0b'),
('Categoria', 'categoria', '#4ecdc4'),
('Marketing', 'marketing', '#ef4444'),
('Blog', 'blog', '#8b5cf6'),
('Social Media', 'social-media', '#06b6d4'),
('Print', 'print', '#059669'),
('Web', 'web', '#dc2626'),
('Mobile', 'mobile', '#7c3aed'),
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
```

### **STEP 2: Media Models**

**CRIAR: `models/Media.js`**
```javascript
/**
 * Media Model - Enhanced Media Management
 * Handles all media-related database operations
 */

const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp'); // Will be installed
const crypto = require('crypto');

class Media {
    constructor() {
        this.uploadPath = path.join(__dirname, '../public/uploads');
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }
    
    /**
     * Get all media files with filters
     */
    async getAllMedia(options = {}) {
        const {
            folder = null,
            tags = null,
            type = null,
            search = null,
            limit = 50,
            offset = 0,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (folder) {
            whereClause += ' AND mf.folder_path = ?';
            params.push(folder);
        }
        
        if (type) {
            whereClause += ' AND mf.mime_type LIKE ?';
            params.push(`${type}%`);
        }
        
        if (search) {
            whereClause += ' AND (mf.original_name LIKE ? OR mf.alt_text LIKE ? OR mf.title LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (tags) {
            const tagList = Array.isArray(tags) ? tags : [tags];
            const tagPlaceholders = tagList.map(() => '?').join(',');
            whereClause += ` AND mf.id IN (
                SELECT DISTINCT mft.media_file_id 
                FROM media_file_tags mft 
                JOIN media_tags mt ON mft.tag_id = mt.id 
                WHERE mt.slug IN (${tagPlaceholders})
            )`;
            params.push(...tagList);
        }
        
        const query = `
            SELECT 
                mf.*,
                mf2.name as folder_name,
                mf2.color as folder_color,
                GROUP_CONCAT(DISTINCT mt.name) as tag_names,
                GROUP_CONCAT(DISTINCT mt.color) as tag_colors,
                GROUP_CONCAT(DISTINCT mt.slug) as tag_slugs,
                COUNT(DISTINCT mu.id) as usage_count
            FROM media_files mf
            LEFT JOIN media_folders mf2 ON mf.folder_path = mf2.path
            LEFT JOIN media_file_tags mft ON mf.id = mft.media_file_id
            LEFT JOIN media_tags mt ON mft.tag_id = mt.id
            LEFT JOIN media_usage mu ON mf.id = mu.media_id
            ${whereClause}
            GROUP BY mf.id
            ORDER BY mf.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        try {
            const [rows] = await pool.query(query, params);
            
            // Process the results
            return rows.map(this.formatMediaFile.bind(this));
        } catch (error) {
            console.error('Error getting media files:', error);
            throw new Error('Failed to fetch media files');
        }
    }
    
    /**
     * Get media file by ID with complete info
     */
    async getMediaById(id) {
        const query = `
            SELECT 
                mf.*,
                mf2.name as folder_name,
                mf2.color as folder_color,
                GROUP_CONCAT(DISTINCT CONCAT(mt.id, ':', mt.name, ':', mt.slug, ':', mt.color)) as tag_info,
                COUNT(DISTINCT mu.id) as usage_count
            FROM media_files mf
            LEFT JOIN media_folders mf2 ON mf.folder_path = mf2.path
            LEFT JOIN media_file_tags mft ON mf.id = mft.media_file_id
            LEFT JOIN media_tags mt ON mft.tag_id = mt.id
            LEFT JOIN media_usage mu ON mf.id = mu.media_id
            WHERE mf.id = ?
            GROUP BY mf.id
        `;
        
        try {
            const [rows] = await pool.query(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return this.formatMediaFile(rows[0]);
        } catch (error) {
            console.error('Error getting media file by ID:', error);
            throw new Error('Failed to fetch media file');
        }
    }
    
    /**
     * Upload new media file
     */
    async uploadMedia(fileData, options = {}) {
        const {
            folder = '/products/',
            tags = [],
            title = null,
            alt_text = null,
            description = null,
            source = 'web'
        } = options;
        
        try {
            // Validate file
            await this.validateFile(fileData);
            
            // Generate unique filename
            const filename = await this.generateFilename(fileData.originalname);
            const filePath = path.join(this.uploadPath, filename);
            
            // Calculate file hash
            const fileHash = await this.calculateFileHash(fileData.buffer);
            
            // Check for duplicates
            const duplicate = await this.findDuplicateByHash(fileHash);
            if (duplicate) {
                throw new Error('File already exists');
            }
            
            // Process image (resize, optimize, generate variants)
            const processedData = await this.processImage(fileData.buffer, filename);
            
            // Save file to disk
            await fs.writeFile(filePath, processedData.optimized);
            
            // Insert into database
            const mediaId = await this.insertMediaRecord({
                filename,
                original_name: fileData.originalname,
                file_path: filePath,
                file_size: processedData.size,
                mime_type: fileData.mimetype,
                folder_path: folder,
                title,
                alt_text,
                description,
                file_hash: fileHash,
                dimensions: JSON.stringify(processedData.dimensions),
                processed_variants: JSON.stringify(processedData.variants),
                dominant_color: processedData.dominantColor,
                upload_source: source
            });
            
            // Add tags if provided
            if (tags.length > 0) {
                await this.addTagsToMedia(mediaId, tags);
            }
            
            // Log usage
            await this.logMediaUsage(mediaId, 'upload', 'media_library');
            
            return await this.getMediaById(mediaId);
            
        } catch (error) {
            console.error('Upload media error:', error);
            throw error;
        }
    }
    
    /**
     * Process image - resize, optimize, generate variants
     */
    async processImage(buffer, filename) {
        try {
            const image = sharp(buffer);
            const metadata = await image.metadata();
            
            // Get dominant color
            const { dominant } = await image.stats();
            const dominantColor = `#${Math.round(dominant.r).toString(16).padStart(2, '0')}${Math.round(dominant.g).toString(16).padStart(2, '0')}${Math.round(dominant.b).toString(16).padStart(2, '0')}`;
            
            // Generate optimized version
            const optimized = await image
                .jpeg({ quality: 85, progressive: true })
                .toBuffer();
            
            // Generate variants
            const variants = {};
            
            // Thumbnail (150x150)
            variants.thumbnail = await image
                .resize(150, 150, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer();
            
            // Small (300x300)
            variants.small = await image
                .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();
            
            // Medium (600x600)
            variants.medium = await image
                .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();
            
            // Large (1200x1200)
            variants.large = await image
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toBuffer();
            
            // Save variants to disk
            const variantPaths = {};
            for (const [size, buffer] of Object.entries(variants)) {
                const variantFilename = this.getVariantFilename(filename, size);
                const variantPath = path.join(this.uploadPath, 'variants', variantFilename);
                
                // Ensure variants directory exists
                await fs.mkdir(path.dirname(variantPath), { recursive: true });
                await fs.writeFile(variantPath, buffer);
                
                variantPaths[size] = `/uploads/variants/${variantFilename}`;
            }
            
            return {
                optimized,
                size: optimized.length,
                dimensions: {
                    width: metadata.width,
                    height: metadata.height,
                    aspectRatio: (metadata.width / metadata.height).toFixed(2)
                },
                variants: variantPaths,
                dominantColor
            };
            
        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error('Failed to process image');
        }
    }
    
    /**
     * Update media file metadata
     */
    async updateMedia(id, updates) {
        const allowedFields = [
            'title', 'alt_text', 'description', 'folder_path'
        ];
        
        const updateFields = [];
        const params = [];
        
        for (const [field, value] of Object.entries(updates)) {
            if (allowedFields.includes(field)) {
                updateFields.push(`${field} = ?`);
                params.push(value);
            }
        }
        
        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }
        
        updateFields.push('updated_at = NOW()');
        params.push(id);
        
        const query = `UPDATE media_files SET ${updateFields.join(', ')} WHERE id = ?`;
        
        try {
            await pool.query(query, params);
            
            // Handle tags update
            if (updates.tags !== undefined) {
                await this.updateMediaTags(id, updates.tags);
            }
            
            return await this.getMediaById(id);
        } catch (error) {
            console.error('Update media error:', error);
            throw new Error('Failed to update media file');
        }
    }
    
    /**
     * Delete media file
     */
    async deleteMedia(id) {
        try {
            const media = await this.getMediaById(id);
            if (!media) {
                throw new Error('Media file not found');
            }
            
            // Check if file is in use
            const usageCount = await this.getUsageCount(id);
            if (usageCount > 0) {
                throw new Error('Cannot delete media file that is in use');
            }
            
            // Delete physical files
            await this.deletePhysicalFiles(media);
            
            // Delete database record
            await pool.query('DELETE FROM media_files WHERE id = ?', [id]);
            
            return true;
        } catch (error) {
            console.error('Delete media error:', error);
            throw error;
        }
    }
    
    /**
     * Get all folders
     */
    async getAllFolders() {
        const query = `
            SELECT 
                mf.*,
                COUNT(mfi.id) as file_count,
                COALESCE(SUM(mfi.file_size), 0) as total_size
            FROM media_folders mf
            LEFT JOIN media_files mfi ON mf.path = mfi.folder_path
            GROUP BY mf.id
            ORDER BY mf.path
        `;
        
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error getting folders:', error);
            throw new Error('Failed to fetch folders');
        }
    }
    
    /**
     * Get all tags with usage count
     */
    async getAllTags() {
        const query = `
            SELECT 
                mt.*,
                COUNT(mft.media_file_id) as usage_count
            FROM media_tags mt
            LEFT JOIN media_file_tags mft ON mt.id = mft.tag_id
            GROUP BY mt.id
            ORDER BY usage_count DESC, mt.name ASC
        `;
        
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error getting tags:', error);
            throw new Error('Failed to fetch tags');
        }
    }
    
    /**
     * Helper methods
     */
    formatMediaFile(row) {
        const formatted = {
            ...row,
            url: `/uploads/${row.filename}`,
            variants: row.processed_variants ? JSON.parse(row.processed_variants) : {},
            dimensions: row.dimensions ? JSON.parse(row.dimensions) : {},
            tags: []
        };
        
        // Parse tags
        if (row.tag_info) {
            formatted.tags = row.tag_info.split(',').map(tagInfo => {
                const [id, name, slug, color] = tagInfo.split(':');
                return { id: parseInt(id), name, slug, color };
            });
        }
        
        // Format file size
        formatted.file_size_formatted = this.formatFileSize(row.file_size);
        
        // Calculate age
        formatted.created_ago = this.timeAgo(row.created_at);
        
        return formatted;
    }
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        if (diffInSeconds < 60) return 'há poucos segundos';
        if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
        
        return new Date(date).toLocaleDateString('pt-PT');
    }
    
    async validateFile(fileData) {
        if (!fileData || !fileData.buffer) {
            throw new Error('No file data provided');
        }
        
        if (!this.allowedTypes.includes(fileData.mimetype)) {
            throw new Error('Invalid file type. Only images are allowed.');
        }
        
        if (fileData.buffer.length > this.maxFileSize) {
            throw new Error('File too large. Maximum size is 10MB.');
        }
    }
    
    async generateFilename(originalName) {
        const ext = path.extname(originalName);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}_${random}${ext}`;
    }
    
    async calculateFileHash(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    
    getVariantFilename(originalFilename, size) {
        const ext = path.extname(originalFilename);
        const name = path.basename(originalFilename, ext);
        return `${name}_${size}${ext}`;
    }
    
    // Additional helper methods for tags, usage tracking, etc.
    async addTagsToMedia(mediaId, tags) {
        for (const tagName of tags) {
            const tag = await this.findOrCreateTag(tagName);
            await pool.query(
                'INSERT IGNORE INTO media_file_tags (media_file_id, tag_id) VALUES (?, ?)',
                [mediaId, tag.id]
            );
        }
    }
    
    async findOrCreateTag(tagName) {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-');
        
        let [rows] = await pool.query('SELECT * FROM media_tags WHERE slug = ?', [slug]);
        
        if (rows.length === 0) {
            await pool.query(
                'INSERT INTO media_tags (name, slug) VALUES (?, ?)',
                [tagName, slug]
            );
            [rows] = await pool.query('SELECT * FROM media_tags WHERE slug = ?', [slug]);
        }
        
        return rows[0];
    }
    
    async logMediaUsage(mediaId, usageType, context) {
        await pool.query(
            'INSERT INTO media_usage (media_id, usage_type, usage_context, created_at) VALUES (?, ?, ?, NOW())',
            [mediaId, usageType, context]
        );
    }
    
    async insertMediaRecord(data) {
        const fields = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        const query = `INSERT INTO media_files (${fields}, created_at) VALUES (${placeholders}, NOW())`;
        
        const [result] = await pool.query(query, values);
        return result.insertId;
    }
}

module.exports = new Media();
```

### **AFTERNOON DAY 1: Media Library Interface**

**STEP 3: Admin Media Library Page**

**CRIAR: `views/admin/media/library.ejs`**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Library - Admin</title>
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/admin-v2.css">
    <link rel="stylesheet" href="/css/media-library.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Drag & Drop Styles -->
    <style>
        .dropzone {
            border: 2px dashed #ccc;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            background: #f8f9fa;
            transition: all 0.3s ease;
            margin-bottom: 30px;
        }
        
        .dropzone.dragover {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }
    </style>
</head>
<body class="admin-layout">
    <!-- Admin Header -->
    <%- include('../partials/admin-header') %>
    
    <!-- Main Content -->
    <main class="admin-main">
        <!-- Sidebar -->
        <%- include('../partials/admin-sidebar') %>
        
        <!-- Content Area -->
        <div class="admin-content">
            <div class="content-header">
                <div class="header-left">
                    <h1><i class="fas fa-images"></i> Media Library</h1>
                    <p>Gere todas as suas imagens e ficheiros de media</p>
                </div>
                
                <div class="header-actions">
                    <button class="btn btn-secondary" id="toggleViewMode">
                        <i class="fas fa-th-large"></i>
                        <span>Grelha</span>
                    </button>
                    
                    <button class="btn btn-secondary" onclick="openBulkActions()">
                        <i class="fas fa-tasks"></i>
                        <span>Ações em Lote</span>
                    </button>
                    
                    <div class="upload-actions">
                        <label class="btn btn-primary" for="fileInput">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Upload</span>
                        </label>
                        <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
                        
                        <button class="btn btn-primary" onclick="openCameraCapture()">
                            <i class="fas fa-camera"></i>
                            <span>Câmara</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Filters & Search -->
            <div class="media-toolbar">
                <div class="toolbar-left">
                    <!-- Folder Navigation -->
                    <div class="folder-nav">
                        <select id="folderSelect" class="form-select">
                            <option value="/">Todas as Pastas</option>
                            <% folders.forEach(folder => { %>
                                <option value="<%= folder.path %>" 
                                        data-color="<%= folder.color %>">
                                    <% for(let i = 0; i < (folder.path.split('/').length - 2); i++) { %>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                    <% } %>
                                    📁 <%= folder.name %> (<%= folder.file_count %>)
                                </option>
                            <% }); %>
                        </select>
                        
                        <button class="btn btn-sm btn-outline" onclick="createNewFolder()">
                            <i class="fas fa-folder-plus"></i>
                        </button>
                    </div>
                    
                    <!-- Tag Filter -->
                    <div class="tag-filter">
                        <select id="tagSelect" class="form-select" multiple>
                            <% tags.forEach(tag => { %>
                                <option value="<%= tag.slug %>" 
                                        data-color="<%= tag.color %>">
                                    <%= tag.name %> (<%= tag.usage_count %>)
                                </option>
                            <% }); %>
                        </select>
                    </div>
                </div>
                
                <div class="toolbar-center">
                    <!-- Search -->
                    <div class="search-box">
                        <input type="text" 
                               id="mediaSearch" 
                               placeholder="Pesquisar ficheiros..." 
                               class="search-input">
                        <button class="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <!-- Sort Options -->
                    <select id="sortSelect" class="form-select">
                        <option value="created_at:desc">Mais Recentes</option>
                        <option value="created_at:asc">Mais Antigos</option>
                        <option value="filename:asc">Nome A-Z</option>
                        <option value="filename:desc">Nome Z-A</option>
                        <option value="file_size:desc">Maior Tamanho</option>
                        <option value="file_size:asc">Menor Tamanho</option>
                    </select>
                    
                    <!-- Results per page -->
                    <select id="limitSelect" class="form-select">
                        <option value="24">24 por página</option>
                        <option value="48">48 por página</option>
                        <option value="96">96 por página</option>
                    </select>
                </div>
            </div>
            
            <!-- Upload Drop Zone -->
            <div class="dropzone" id="dropzone">
                <div class="dropzone-content">
                    <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                    <h3>Arraste ficheiros aqui para fazer upload</h3>
                    <p>ou clique no botão Upload acima</p>
                    <div class="supported-formats">
                        <small>Suportado: JPG, PNG, WebP, GIF (máx. 10MB por ficheiro)</small>
                    </div>
                </div>
                
                <!-- Upload Progress -->
                <div class="upload-progress-container" style="display: none;">
                    <div class="upload-progress-items" id="uploadProgressItems">
                        <!-- Dynamic upload progress items -->
                    </div>
                </div>
            </div>
            
            <!-- Media Grid -->
            <div class="media-grid-container">
                <!-- Loading State -->
                <div class="loading-state" id="loadingState">
                    <div class="media-grid loading">
                        <% for(let i = 0; i < 12; i++) { %>
                            <div class="media-skeleton">
                                <div class="skeleton-image"></div>
                                <div class="skeleton-info">
                                    <div class="skeleton-line"></div>
                                    <div class="skeleton-line short"></div>
                                </div>
                            </div>
                        <% } %>
                    </div>
                </div>
                
                <!-- Media Grid -->
                <div class="media-grid" id="mediaGrid">
                    <!-- Dynamic content loaded via JavaScript -->
                </div>
                
                <!-- No Results State -->
                <div class="no-results" id="noResults" style="display: none;">
                    <div class="no-results-icon">
                        <i class="fas fa-search fa-3x"></i>
                    </div>
                    <h3>Nenhum ficheiro encontrado</h3>
                    <p>Tente ajustar os filtros ou fazer upload de novos ficheiros.</p>
                </div>
            </div>
            
            <!-- Pagination -->
            <div class="pagination-container">
                <div class="pagination-info">
                    <span id="paginationInfo">Mostrando 1-24 de 156 ficheiros</span>
                </div>
                
                <div class="pagination" id="pagination">
                    <!-- Dynamic pagination -->
                </div>
            </div>
        </div>
    </main>
    
    <!-- Media Detail Modal -->
    <div class="modal" id="mediaDetailModal">
        <div class="modal-backdrop" onclick="closeMediaDetail()"></div>
        <div class="modal-content large">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Detalhes do Ficheiro</h3>
                <button class="modal-close" onclick="closeMediaDetail()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body" id="mediaDetailContent">
                <!-- Dynamic content -->
            </div>
        </div>
    </div>
    
    <!-- Edit Media Modal -->
    <div class="modal" id="editMediaModal">
        <div class="modal-backdrop" onclick="closeEditMedia()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Editar Ficheiro</h3>
                <button class="modal-close" onclick="closeEditMedia()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <form id="editMediaForm">
                    <input type="hidden" id="editMediaId">
                    
                    <div class="form-group">
                        <label for="editTitle">Título</label>
                        <input type="text" id="editTitle" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="editAltText">Texto Alternativo</label>
                        <input type="text" id="editAltText" class="form-control">
                        <small class="form-help">Para acessibilidade e SEO</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="editDescription">Descrição</label>
                        <textarea id="editDescription" class="form-control" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editFolder">Pasta</label>
                        <select id="editFolder" class="form-select">
                            <% folders.forEach(folder => { %>
                                <option value="<%= folder.path %>"><%= folder.name %></option>
                            <% }); %>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTags">Tags</label>
                        <div class="tags-input-container">
                            <input type="text" 
                                   id="editTags" 
                                   class="tags-input"
                                   placeholder="Adicionar tags (separadas por vírgula)">
                            <div class="tags-suggestions" id="tagsSuggestions">
                                <!-- Dynamic tag suggestions -->
                            </div>
                        </div>
                        <div class="selected-tags" id="selectedTags">
                            <!-- Selected tags display -->
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeEditMedia()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveMediaEdit()">Guardar</button>
            </div>
        </div>
    </div>
    
    <!-- Camera Capture Modal (Mobile) -->
    <div class="modal fullscreen" id="cameraModal">
        <div class="modal-content camera">
            <div class="camera-interface">
                <div class="camera-header">
                    <button class="btn-camera-close" onclick="closeCameraCapture()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3>Capturar Imagem</h3>
                </div>
                
                <div class="camera-preview">
                    <video id="cameraVideo" autoplay playsinline></video>
                    nvas id="d="cameraCanvas" style="display: none;"></canvas>
                    
                    <div class="camera-overlay">
                        <div class="capture-frame"></div>
                    </div>
                </div>
                
                <div class="camera-controls">
                    <button class="btn-camera-switch" onclick="switchCamera()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    
                    <button class="btn-capture" onclick="captureImage()">
                        <i class="fas fa-camera"></i>
                    </button>
                    
                    <button class="btn-gallery" onclick="openGallery()">
                        <i class="fas fa-images"></i>
                    </button>
                </div>
                
                <div class="captured-images" id="capturedImages">
                    <!-- Captured images display -->
                </div>
            </div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="/js/media-library.js"></script>
    <script src="/js/media-camera.js"></script>
    <script src="/js/media-upload.js"></script>
    
    <!-- Initialize -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize media library
            window.mediaLibrary = new MediaLibrary({
                apiEndpoint: '/admin/api/media',
                uploadEndpoint: '/admin/api/media/upload',
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            });
        });
    </script>
</body>
</html>
```

***

## 📅 **DAY 3-4: MEDIA PROCESSING & EDITING**

### **STEP 4: Media Processing JavaScript**

**CRIAR: `public/js/media-library.js`**
```javascript
/**
 * Media Library Management System
 * Advanced media management with drag & drop, filtering, editing
 */

class MediaLibrary {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/admin/api/media';
        this.uploadEndpoint = options.uploadEndpoint || '/admin/api/media/upload';
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024;
        this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        this.currentView = 'grid'; // grid or list
        this.selectedFiles = new Set();
        this.currentFolder = '/';
        this.currentTags = [];
        this.currentSearch = '';
        this.currentSort = 'created_at:desc';
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.totalItems = 0;
        
        this.uploadQueue = [];
        this.isUploading = false;
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.bindEvents();
        this.loadMedia();
        this.setupKeyboardShortcuts();
    }
    
    setupDragAndDrop() {
        const dropzone = document.getElementById('dropzone');
        if (!dropzone) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            }, false);
        });
        
        dropzone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFilesUpload(files);
        }, false);
    }
    
    bindEvents() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFilesUpload(files);
            });
        }
        
        // Search
        const searchInput = document.getElementById('mediaSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.currentPage = 1;
                    this.loadMedia();
                }, 300);
            });
        }
        
        // Filters
        const folderSelect = document.getElementById('folderSelect');
        if (folderSelect) {
            folderSelect.addEventListener('change', (e) => {
                this.currentFolder = e.target.value;
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        const tagSelect = document.getElementById('tagSelect');
        if (tagSelect) {
            tagSelect.addEventListener('change', (e) => {
                this.currentTags = Array.from(e.target.selectedOptions).map(opt => opt.value);
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        // Items per page
        const limitSelect = document.getElementById('limitSelect');
        if (limitSelect) {
            limitSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadMedia();
            });
        }
        
        // View mode toggle
        const viewToggle = document.getElementById('toggleViewMode');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                this.toggleViewMode();
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + A - Select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }
            
            // Delete - Delete selected
            if (e.key === 'Delete' && this.selectedFiles.size > 0) {
                e.preventDefault();
                this.deleteSelected();
            }
            
            // Escape - Clear selection
            if (e.key === 'Escape') {
                this.clearSelection();
                this.closeModals();
            }
        });
    }
    
    async loadMedia() {
        try {
            this.showLoading(true);
            
            const params = new URLSearchParams({
                folder: this.currentFolder,
                search: this.currentSearch,
                sort: this.currentSort,
                page: this.currentPage,
                limit: this.itemsPerPage
            });
            
            if (this.currentTags.length > 0) {
                params.append('tags', this.currentTags.join(','));
            }
            
            const response = await fetch(`${this.apiEndpoint}?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderMedia(data.media);
                this.updatePagination(data.pagination);
                this.totalItems = data.pagination.total;
            } else {
                throw new Error(data.message || 'Failed to load media');
            }
            
        } catch (error) {
            console.error('Load media error:', error);
            this.showError('Erro ao carregar ficheiros de media');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderMedia(mediaFiles) {
        const grid = document.getElementById('mediaGrid');
        const noResults = document.getElementById('noResults');
        
        if (!mediaFiles || mediaFiles.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        grid.innerHTML = mediaFiles.map(file => this.createMediaCard(file)).join('');
        
        // Bind card events
        this.bindMediaCardEvents();
    }
    
    createMediaCard(file) {
        const isSelected = this.selectedFiles.has(file.id);
        const tags = file.tags.map(tag => 
            `<span class="tag" style="background-color: ${tag.color}20; color: ${tag.color};">${tag.name}</span>`
        ).join('');
        
        return `
            <div class="media-card ${isSelected ? 'selected' : ''}" 
                 data-media-id="${file.id}"
                 data-filename="${file.filename}"
                 data-type="${file.mime_type}">
                
                <div class="media-card-image">
                    <img src="${file.variants.medium || file.url}" 
                         alt="${file.alt_text || file.original_name}"
                         loading="lazy"
                         onerror="this.src='${file.url}'">
                    
                    <!-- Selection Checkbox -->
                    <div class="media-checkbox">
                        <input type="checkbox" 
                               ${isSelected ? 'checked' : ''} 
                               onchange="window.mediaLibrary.toggleSelection(${file.id}, this.checked)">
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="media-actions">
                        <button class="action-btn" 
                                onclick="window.mediaLibrary.viewMedia(${file.id})"
                                title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        <button class="action-btn" 
                                onclick="window.mediaLibrary.editMedia(${file.id})"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        
                        <button class="action-btn" 
                                onclick="window.mediaLibrary.copyUrl('${file.url}')"
                                title="Copiar URL">
                            <i class="fas fa-copy"></i>
                        </button>
                        
                        <button class="action-btn danger" 
                                onclick="window.mediaLibrary.deleteMedia(${file.id})"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <!-- File Type Badge -->
                    <div class="file-type-badge">
                        ${this.getFileTypeIcon(file.mime_type)}
                    </div>
                </div>
                
                <div class="media-card-info">
                    <h4 class="media-title" title="${file.title || file.original_name}">
                        ${file.title || file.original_name}
                    </h4>
                    
                    <div class="media-meta">
                        <span class="file-size">${file.file_size_formatted}</span>
                        ${file.dimensions.width ? 
                            `<span class="dimensions">${file.dimensions.width} × ${file.dimensions.height}</span>` : 
                            ''
                        }
                    </div>
                    
                    ${tags ? `<div class="media-tags">${tags}</div>` : ''}
                    
                    <div class="media-date">${file.created_ago}</div>
                </div>
            </div>
        `;
    }
    
    bindMediaCardEvents() {
        // Double-click to view details
        document.querySelectorAll('.media-card').forEach(card => {
            card.addEventListener('dblclick', () => {
                const mediaId = parseInt(card.dataset.mediaId);
                this.viewMedia(mediaId);
            });
            
            // Single click to select
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.media-checkbox') && !e.target.closest('.media-actions')) {
                    const mediaId = parseInt(card.dataset.mediaId);
                    const isSelected = this.selectedFiles.has(mediaId);
                    
                    if (e.ctrlKey || e.metaKey) {
                        // Toggle selection with Ctrl/Cmd
                        this.toggleSelection(mediaId, !isSelected);
                    } else {
                        // Replace selection
                        this.clearSelection();
                        this.toggleSelection(mediaId, true);
                    }
                }
            });
        });
    }
    
    async handleFilesUpload(files) {
        // Validate files
        const validFiles = [];
        const errors = [];
        
        for (const file of files) {
            if (!this.allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Tipo de ficheiro não suportado`);
                continue;
            }
            
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name}: Ficheiro demasiado grande (máx. ${this.formatFileSize(this.maxFileSize)})`);
                continue;
            }
            
            validFiles.push(file);
        }
        
        if (errors.length > 0) {
            this.showError('Alguns ficheiros foram rejeitados:\n' + errors.join('\n'));
        }
        
        if (validFiles.length === 0) return;
        
        // Add files to upload queue
        this.uploadQueue.push(...validFiles);
        this.processUploadQueue();
    }
    
    async processUploadQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) return;
        
        this.isUploading = true;
        this.showUploadProgress(true);
        
        const totalFiles = this.uploadQueue.length;
        let processedFiles = 0;
        
        while (this.uploadQueue.length > 0) {
            const file = this.uploadQueue.shift();
            
            try {
                await this.uploadSingleFile(file, processedFiles + 1, totalFiles);
                processedFiles++;
            } catch (error) {
                console.error('Upload error:', error);
                this.showError(`Erro no upload de ${file.name}: ${error.message}`);
            }
        }
        
        this.isUploading = false;
        this.showUploadProgress(false);
        
        // Reload media after upload
        this.loadMedia();
        
        this.showSuccess(`${processedFiles} ficheiro(s) enviado(s) com sucesso!`);
    }
    
    async uploadSingleFile(file, current, total) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', this.currentFolder);
        formData.append('source', 'web');
        
        // Show individual upload progress
        this.updateUploadProgress(file.name, 0, current, total);
        
        const response = await fetch(this.uploadEndpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
        
        this.updateUploadProgress(file.name, 100, current, total);
        return response.json();
    }
    
    showUploadProgress(show) {
        const container = document.querySelector('.upload-progress-container');
        const dropzoneContent = document.querySelector('.dropzone-content');
        
        if (container) {
            container.style.display = show ? 'block' : 'none';
        }
        
        if (dropzoneContent) {
            dropzoneContent.style.display = show ? 'none' : 'block';
        }
    }
    
    updateUploadProgress(filename, progress, current, total) {
        const container = document.getElementById('uploadProgressItems');
        if (!container) return;
        
        let progressItem = container.querySelector(`[data-filename="${filename}"]`);
        
        if (!progressItem) {
            progressItem = document.createElement('div');
            progressItem.className = 'upload-progress-item';
            progressItem.dataset.filename = filename;
            progressItem.innerHTML = `
                <div class="progress-info">
                    <span class="filename">${filename}</span>
                    <span class="progress-text">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-status">Enviando ${current} de ${total}</div>
            `;
            container.appendChild(progressItem);
        }
        
        const progressFill = progressItem.querySelector('.progress-fill');
        const progressText = progressItem.querySelector('.progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;
        
        if (progress === 100) {
            progressItem.classList.add('completed');
            setTimeout(() => {
                progressItem.remove();
            }, 2000);
        }
    }
    
    // Media management methods
    async viewMedia(mediaId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showMediaDetail(data.media);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('View media error:', error);
            this.showError('Erro ao carregar detalhes do ficheiro');
        }
    }
    
    showMediaDetail(media) {
        const modal = document.getElementById('mediaDetailModal');
        const content = document.getElementById('mediaDetailContent');
        
        content.innerHTML = `
            <div class="media-detail-layout">
                <div class="media-detail-image">
                    <img src="${media.variants.large || media.url}" alt="${media.alt_text || media.original_name}">
                    
                    <div class="image-variants">
                        <h4>Variantes Disponíveis:</h4>
                        <div class="variants-list">
                            <a href="${media.url}" target="_blank" class="variant-link">
                                <i class="fas fa-expand"></i> Original (${media.file_size_formatted})
                            </a>
                            ${Object.entries(media.variants).map(([size, url]) => `
                                <a href="${url}" target="_blank" class="variant-link">
                                    <i class="fas fa-image"></i> ${size}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="media-detail-info">
                    <h3>${media.title || media.original_name}</h3>
                    
                    <div class="detail-section">
                        <h4>Informação do Ficheiro</h4>
                        <dl class="detail-list">
                            <dt>Nome do Ficheiro:</dt>
                            <dd>${media.filename}</dd>
                            
                            <dt>Nome Original:</dt>
                            <dd>${media.original_name}</dd>
                            
                            <dt>Tamanho:</dt>
                            <dd>${media.file_size_formatted}</dd>
                            
                            <dt>Dimensões:</dt>
                            <dd>${media.dimensions.width} × ${media.dimensions.height} px</dd>
                            
                            <dt>Tipo:</dt>
                            <dd>${media.mime_type}</dd>
                            
                            <dt>Enviado:</dt>
                            <dd>${new Date(media.created_at).toLocaleString('pt-PT')}</dd>
                            
                            <dt>URL:</dt>
                            <dd>
                                <input type="text" value="${window.location.origin}${media.url}" readonly class="url-input">
                                <button onclick="window.mediaLibrary.copyUrl('${media.url}')" class="btn btn-sm">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </dd>
                        </dl>
                    </div>
                    
                    ${media.alt_text || media.description ? `
                        <div class="detail-section">
                            <h4>Metadata</h4>
                            <dl class="detail-list">
                                ${media.alt_text ? `
                                    <dt>Texto Alternativo:</dt>
                                    <dd>${media.alt_text}</dd>
                                ` : ''}
                                ${media.description ? `
                                    <dt>Descrição:</dt>
                                    <dd>${media.description}</dd>
                                ` : ''}
                            </dl>
                        </div>
                    ` : ''}
                    
                    ${media.tags.length > 0 ? `
                        <div class="detail-section">
                            <h4>Tags</h4>
                            <div class="tags-display">
                                ${media.tags.map(tag => `
                                    <span class="tag" style="background-color: ${tag.color}20; color: ${tag.color};">
                                        ${tag.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="window.mediaLibrary.editMedia(${media.id}); window.mediaLibrary.closeMediaDetail();">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        
                        <button class="btn btn-secondary" onclick="window.mediaLibrary.copyUrl('${media.url}')">
                            <i class="fas fa-copy"></i> Copiar URL
                        </button>
                        
                        <button class="btn btn-danger" onclick="window.mediaLibrary.deleteMedia(${media.id}); window.mediaLibrary.closeMediaDetail();">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    async editMedia(mediaId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showEditMedia(data.media);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Edit media error:', error);
            this.showError('Erro ao carregar ficheiro para edição');
        }
    }
    
    showEditMedia(media) {
        const modal = document.getElementById('editMediaModal');
        
        // Fill form with current values
        document.getElementById('editMediaId').value = media.id;
        document.getElementById('editTitle').value = media.title || '';
        document.getElementById('editAltText').value = media.alt_text || '';
        document.getElementById('editDescription').value = media.description || '';
        document.getElementById('editFolder').value = media.folder_path;
        
        // Handle tags
        const tagsInput = document.getElementById('editTags');
        const selectedTags = document.getElementById('selectedTags');
        
        if (media.tags) {
            const tagNames = media.tags.map(tag => tag.name);
            tagsInput.value = tagNames.join(', ');
            
            selectedTags.innerHTML = media.tags.map(tag => `
                <span class="selected-tag" style="background-color: ${tag.color}20; color: ${tag.color};">
                    ${tag.name}
                    <button type="button" onclick="this.parentElement.remove()">×</button>
                </span>
            `).join('');
        }
        
        modal.style.display = 'block';
    }
    
    async saveMediaEdit() {
        const mediaId = document.getElementById('editMediaId').value;
        const formData = {
            title: document.getElementById('editTitle').value,
            alt_text: document.getElementById('editAltText').value,
            description: document.getElementById('editDescription').value,
            folder_path: document.getElementById('editFolder').value,
            tags: document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Ficheiro atualizado com sucesso!');
                this.closeEditMedia();
                this.loadMedia();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Save media edit error:', error);
            this.showError('Erro ao guardar alterações');
        }
    }
    
    async deleteMedia(mediaId) {
        if (!confirm('Tem certeza que deseja eliminar este ficheiro? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiEndpoint}/${mediaId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Ficheiro eliminado com sucesso!');
                this.loadMedia();
                this.selectedFiles.delete(mediaId);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Delete media error:', error);
            this.showError('Erro ao eliminar ficheiro');
        }
    }
    
    // Utility methods
    toggleSelection(mediaId, selected) {
        if (selected) {
            this.selectedFiles.add(mediaId);
        } else {
            this.selectedFiles.delete(mediaId);
        }
        
        // Update UI
        const card = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (card) {
            card.classList.toggle('selected', selected);
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = selected;
            }
        }
        
        this.updateSelectionUI();
    }
    
    selectAll() {
        const cards = document.querySelectorAll('.media-card');
        cards.forEach(card => {
            const mediaId = parseInt(card.dataset.mediaId);
            this.toggleSelection(mediaId, true);
        });
    }
    
    clearSelection() {
        this.selectedFiles.clear();
        document.querySelectorAll('.media-card.selected').forEach(card => {
            card.classList.remove('selected');
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        this.updateSelectionUI();
    }
    
    updateSelectionUI() {
        // Update selection count and show/hide bulk actions
        const count = this.selectedFiles.size;
        // Implementation for showing selection status and bulk actions
    }
    
    copyUrl(url) {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            this.showSuccess('URL copiado para a área de transferência!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                this.showSuccess('URL copiado para a área de transferência!');
            } catch (err) {
                console.error('Failed to copy URL:', err);
                this.showError('Erro ao copiar URL');
            }
            document.body.removeChild(textArea);
        });
    }
    
    toggleViewMode() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        const grid = document.getElementById('mediaGrid');
        const toggleBtn = document.getElementById('toggleViewMode');
        
        grid.className = `media-${this.currentView}`;
        
        if (this.currentView === 'grid') {
            toggleBtn.innerHTML = '<i class="fas fa-th-large"></i><span>Grelha</span>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-list"></i><span>Lista</span>';
        }
    }
    
    updatePagination(paginationData) {
        const { page, totalPages, total, limit } = paginationData;
        
        // Update pagination info
        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);
        document.getElementById('paginationInfo').textContent = 
            `Mostrando ${start}-${end} de ${total} ficheiros`;
        
        // Update pagination buttons
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = this.generatePaginationHTML(page, totalPages);
    }
    
    generatePaginationHTML(currentPage, totalPages) {
        let html = '';
        
        // Previous button
        html += `
            <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="window.mediaLibrary.goToPage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<button class="page-btn" onclick="window.mediaLibrary.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="window.mediaLibrary.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="page-ellipsis">...</span>`;
            }
            html += `<button class="page-btn" onclick="window.mediaLibrary.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        html += `
            <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="window.mediaLibrary.goToPage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        return html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadMedia();
    }
    
    // UI helper methods
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const mediaGrid = document.getElementById('mediaGrid');
        
        if (loadingState) loadingState.style.display = show ? 'block' : 'none';
        if (mediaGrid) mediaGrid.style.display = show ? 'none' : 'block';
    }
    
    showError(message) {
        // Create and show error notification
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        // Create and show success notification
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    getFileTypeIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return '<i class="fas fa-image"></i>';
        }
        return '<i class="fas fa-file"></i>';
    }
    
    // Modal methods
    closeMediaDetail() {
        document.getElementById('mediaDetailModal').style.display = 'none';
    }
    
    closeEditMedia() {
        document.getElementById('editMediaModal').style.display = 'none';
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Global functions for inline handlers
window.openMediaDetail = (mediaId) => {
    if (window.mediaLibrary) {
        window.mediaLibrary.viewMedia(mediaId);
    }
};

window.closeMediaDetail = () => {
    if (window.mediaLibrary) {
        window.mediaLibrary.closeMediaDetail();
    }
};

window.closeEditMedia = () => {
    if (window.mediaLibrary) {
        window.mediaLibrary.closeEditMedia();
    }
};

window.saveMediaEdit = () => {
    if (window.mediaLibrary) {
        window.mediaLibrary.saveMediaEdit();
    }
};
```

***

## 📅 **DAY 5-7: MOBILE INTEGRATION & OPTIMIZATION**

### **STEP 5: Mobile Camera Integration**

**CRIAR: `public/js/media-camera.js`** (versão simplificada)
```javascript
/**
 * Mobile Camera Integration for Media Library
 * Handles camera capture for mobile devices
 */

class MediaCameraCapture {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.capturedImages = [];
        this.currentFacingMode = 'environment';
        
        this.constraints = {
            video: {
                width: { ideal: 1920, max: 3840 },
                height: { ideal: 1080, max: 2160 },
                facingMode: { ideal: 'environment' }
            }
        };
    }
    
    async initCamera() {
        this.video = document.getElementById('cameraVideo');
        this.canvas = document.getElementById('cameraCanvas');
        
        if (!this.video || !this.canvas) {
            console.error('Camera elements not found');
            return false;
        }
        
        try {
            await this.checkCameraPermissions();
            await this.startCamera();
            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.handleCameraError(error);
            return false;
        }
    }
    
    async checkCameraPermissions() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not supported on this device');
        }
        
        // Check for existing permissions
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            if (cameras.length === 0) {
                throw new Error('No camera found');
            }
            
            return true;
        } catch (error) {
            throw new Error('Unable to access camera devices');
        }
    }
    
    async startCamera() {
        try {
            if (this.stream) {
                this.stopCamera();
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            this.video.srcObject = this.stream;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.video.play();
            });
            
        } catch (error) {
            console.error('Camera start failed:', error);
            throw error;
        }
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
    }
    
    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        this.constraints.video.facingMode = { ideal: this.currentFacingMode };
        
        await this.startCamera();
    }
    
    captureImage() {
        if (!this.stream || !this.video) {
            console.error('Camera not ready');
            return;
        }
        
        const context = this.canvas.getContext('2d');
        
        // Set canvas size to video size
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Draw current video frame
        context.drawImage(this.video, 0, 0);
        
        // Convert to blob
        this.canvas.toBlob((blob) => {
            this.processCapturedImage(blob);
        }, 'image/jpeg', 0.9);
    }
    
    processCapturedImage(blob) {
        const imageData = {
            blob: blob,
            url: URL.createObjectURL(blob),
            timestamp: new Date().toISOString(),
            size: blob.size
        };
        
        this.capturedImages.push(imageData);
        this.displayCapturedImage(imageData);
    }
    
    displayCapturedImage(imageData) {
        const container = document.getElementById('capturedImages');
        if (!container) return;
        
        const imageElement = document.createElement('div');
        imageElement.className = 'captured-image-item';
        imageElement.innerHTML = `
            <img src="${imageData.url}" alt="Captured image">
            <div class="image-actions">
                <button onclick="mediaCamera.retakeImage(this)">
                    <i class="fas fa-redo"></i>
                </button>
                <button onclick="mediaCamera.removeImage(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(imageElement);
    }
    
    async uploadCapturedImages() {
        if (this.capturedImages.length === 0) {
            alert('Nenhuma imagem capturada');
            return;
        }
        
        try {
            const uploads = [];
            
            for (const imageData of this.capturedImages) {
                const formData = new FormData();
                formData.append('file', imageData.blob, 'camera_capture.jpg');
                formData.append('folder', window.mediaLibrary?.currentFolder || '/');
                formData.append('source', 'mobile_camera');
                formData.append('title', 'Camera Capture');
                
                uploads.push(
                    fetch('/admin/api/media/upload', {
                        method: 'POST',
                        body: formData
                    })
                );
            }
            
            const responses = await Promise.all(uploads);
            const results = await Promise.all(responses.map(r => r.json()));
            
            const successful = results.filter(r => r.success).length;
            
            if (successful > 0) {
                alert(`${successful} imagem(ns) enviada(s) com sucesso!`);
                this.clearCapturedImages();
                this.closeCameraCapture();
                
                // Refresh media library if available
                if (window.mediaLibrary) {
                    window.mediaLibrary.loadMedia();
                }
            } else {
                throw new Error('Falha no upload das imagens');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro no upload das imagens');
        }
    }
    
    handleCameraError(error) {
        let message = 'Erro na câmara';
        let suggestion = '';
        
        switch (error.name) {
            case 'NotAllowedError':
                message = 'Acesso à câmara negado';
                suggestion = 'Permita o acesso à câmara nas definições';
                break;
            case 'NotFoundError':
                message = 'Câmara não encontrada';
                suggestion = 'Verifique se o dispositivo tem câmara';
                break;
            case 'NotReadableError':
                message = 'Câmara em uso por outra aplicação';
                suggestion = 'Feche outras aplicações que usem a câmara';
                break;
            default:
                message = error.message || 'Erro desconhecido na câmara';
        }
        
        console.error('Camera error:', message, suggestion);
        alert(`${message}\n${suggestion}`);
    }
    
    removeImage(button) {
        const imageItem = button.closest('.captured-image-item');
        const index = Array.from(imageItem.parentNode.children).indexOf(imageItem);
        
        // Remove from array
        if (index >= 0) {
            URL.revokeObjectURL(this.capturedImages[index].url);
            this.capturedImages.splice(index, 1);
        }
        
        // Remove from DOM
        imageItem.remove();
    }
    
    clearCapturedImages() {
        this.capturedImages.forEach(img => {
            URL.revokeObjectURL(img.url);
        });
        this.capturedImages = [];
        
        const container = document.getElementById('capturedImages');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    closeCameraCapture() {
        this.stopCamera();
        this.clearCapturedImages();
        
        const modal = document.getElementById('cameraModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Global instance
window.mediaCamera = new MediaCameraCapture();

// Global functions
window.openCameraCapture = async () => {
    const modal = document.getElementById('cameraModal');
    if (modal) {
        modal.style.display = 'block';
        await window.mediaCamera.initCamera();
    }
};

window.closeCameraCapture = () => {
    window.mediaCamera.closeCameraCapture();
};

window.switchCamera = () => {
    window.mediaCamera.switchCamera();
};

window.captureImage = () => {
    window.mediaCamera.captureImage();
};

window.uploadCapturedImages = () => {
    window.mediaCamera.uploadCapturedImages();
};
```

***

## 📅 **DAY 8-10: API ROUTES & FINALIZATION**

### **STEP 6: Media API Routes**

**CRIAR: `routes/admin/media.js`**
```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, query, param, validationResult } = require('express-validator');
const Media = require('../../models/Media');

const router = express.Router();

// Configure multer for media uploads
const storage = multer.memoryStorage(); // Store in memory for processing
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Max 10 files per request
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

/**
 * GET /admin/media/library
 * Media library page
 */
router.get('/library', async (req, res) => {
    try {
        // Load folders and tags for filters
        const [folders, tags] = await Promise.all([
            Media.getAllFolders(),
            Media.getAllTags()
        ]);
        
        res.render('admin/media/library', {
            title: 'Media Library',
            folders,
            tags,
            page: 'media-library'
        });
    } catch (error) {
        console.error('Media library page error:', error);
        res.status(500).render('admin/error', {
            message: 'Erro ao carregar biblioteca de media',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

/**
 * GET /admin/api/media
 * Get media files with filters
 */
router.get('/api/media', [
    query('folder').optional().isString(),
    query('tags').optional().isString(),
    query('type').optional().isString(),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors.array()
            });
        }
        
        const {
            folder,
            tags,
            type,
            search,
            page = 1,
            limit = 24,
            sort = 'created_at:desc'
        } = req.query;
        
        const [sortBy, sortOrder] = sort.split(':');
        const offset = (page - 1) * limit;
        
        const options = {
            folder: folder || null,
            tags: tags ? tags.split(',') : null,
            type,
            search,
            limit: parseInt(limit),
            offset,
            sortBy,
            sortOrder: sortOrder?.toUpperCase() || 'DESC'
        };
        
        const media = await Media.getAllMedia(options);
        
        // Get total count for pagination
        const totalOptions = { ...options, limit: null, offset: null };
        const totalMedia = await Media.getAllMedia(totalOptions);
        const total = totalMedia.length;
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            success: true,
            media,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasMore: page < totalPages
            }
        });
        
    } catch (error) {
        console.error('Get media API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar ficheiros de media'
        });
    }
});

/**
 * GET /admin/api/media/:id
 * Get specific media file details
 */
router.get('/api/media/:id', [
    param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid media ID'
            });
        }
        
        const media = await Media.getMediaById(req.params.id);
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Ficheiro de media não encontrado'
            });
        }
        
        res.json({
            success: true,
            media
        });
        
    } catch (error) {
        console.error('Get media by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar ficheiro de media'
        });
    }
});

/**
 * POST /admin/api/media/upload
 * Upload new media files
 */
router.post('/api/media/upload', upload.array('file', 10), [
    body('folder').optional().isString(),
    body('tags').optional().isString(),
    body('title').optional().isString(),
    body('alt_text').optional().isString(),
    body('description').optional().isString(),
    body('source').optional().isIn(['web', 'mobile', 'mobile_camera', 'api', 'bulk'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors.array()
            });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum ficheiro enviado'
            });
        }
        
        const {
            folder = '/products/',
            tags,
            title,
            alt_text,
            description,
            source = 'web'
        } = req.body;
        
        const uploadedFiles = [];
        const errors = [];
        
        for (const file of req.files) {
            try {
                const options = {
                    folder,
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                    title,
                    alt_text,
                    description,
                    source
                };
                
                const uploadedMedia = await Media.uploadMedia(file, options);
                uploadedFiles.push(uploadedMedia);
                
            } catch (uploadError) {
                console.error(`Upload error for ${file.originalname}:`, uploadError);
                errors.push({
                    filename: file.originalname,
                    error: uploadError.message
                });
            }
        }
        
        if (uploadedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Falha no upload de todos os ficheiros',
                errors
            });
        }
        
        const response = {
            success: true,
            message: `${uploadedFiles.length} ficheiro(s) enviado(s) com sucesso`,
            media: uploadedFiles
        };
        
        if (errors.length > 0) {
            response.partial = true;
            response.errors = errors;
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Upload media API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no upload dos ficheiros'
        });
    }
});

/**
 * PUT /admin/api/media/:id
 * Update media file metadata
 */
router.put('/api/media/:id', [
    param('id').isInt({ min: 1 }).toInt(),
    body('title').optional().isString().trim(),
    body('alt_text').optional().isString().trim(),
    body('description').optional().isString().trim(),
    body('folder_path').optional().isString(),
    body('tags').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors.array()
            });
        }
        
        const mediaId = req.params.id;
        const updates = req.body;
        
        const updatedMedia = await Media.updateMedia(mediaId, updates);
        
        res.json({
            success: true,
            message: 'Ficheiro atualizado com sucesso',
            media: updatedMedia
        });
        
    } catch (error) {
        console.error('Update media API error:', error);
        
        if (error.message === 'Media file not found') {
            return res.status(404).json({
                success: false,
                message: 'Ficheiro não encontrado'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar ficheiro'
        });
    }
});

/**
 * DELETE /admin/api/media/:id
 * Delete media file
 */
router.delete('/api/media/:id', [
    param('id').isInt({ min: 1 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid media ID'
            });
        }
        
        const mediaId = req.params.id;
        
        await Media.deleteMedia(mediaId);
        
        res.json({
            success: true,
            message: 'Ficheiro eliminado com sucesso'
        });
        
    } catch (error) {
        console.error('Delete media API error:', error);
        
        if (error.message === 'Media file not found') {
            return res.status(404).json({
                success: false,
                message: 'Ficheiro não encontrado'
            });
        }
        
        if (error.message.includes('in use')) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível eliminar ficheiro em uso'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro ao eliminar ficheiro'
        });
    }
});

/**
 * GET /admin/api/media/folders
 * Get all media folders
 */
router.get('/api/media/folders', async (req, res) => {
    try {
        const folders = await Media.getAllFolders();
        
        res.json({
            success: true,
            folders
        });
        
    } catch (error) {
        console.error('Get folders API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar pastas'
        });
    }
});

/**
 * GET /admin/api/media/tags
 * Get all media tags
 */
router.get('/api/media/tags', async (req, res) => {
    try {
        const tags = await Media.getAllTags();
        
        res.json({
            success: true,
            tags
        });
        
    } catch (error) {
        console.error('Get tags API error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar tags'
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Ficheiro demasiado grande (máx. 10MB)'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Demasiados ficheiros (máx. 10 por upload)'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        message: error.message || 'Erro no upload'
    });
});

module.exports = router;
```

***

# 📅 **FASE 6: BUSINESS INTELLIGENCE**

## **📋 OVERVIEW GERAL**

### **DURAÇÃO:** 1 semana (5 dias úteis)  
### **OBJECTIVO:** Analytics e insights de negócio
### **PRIORIDADE:** ⭐⭐⭐ (Média - valor adicional)

### **FEATURES PRINCIPAIS:**
- ✅ Analytics dashboard
- ✅ Sales tracking & reporting
- ✅ Customer behavior analysis
- ✅ Performance metrics
- ✅ WhatsApp conversion tracking
- ✅ SEO metrics
- ✅ Export capabilities

***

## 📅 **DAY 1-2: ANALYTICS FOUNDATION**

### **STEP 1: Analytics Database Schema**

**CRIAR: `sql/analytics_schema.sql`**
```sql
-- Analytics & Business Intelligence Schema

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NULL,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_action VARCHAR(100) NOT NULL,
    event_label VARCHAR(255) NULL,
    event_value DECIMAL(10,2) NULL,
    
    -- Context data
    page_url TEXT NOT NULL,
    referrer TEXT NULL,
    user_agent TEXT NULL,
    ip_address VARCHAR(45) NULL,
    
    -- Device/Browser info
    device_type ENUM('desktop', 'mobile', 'tablet') NULL,
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    screen_resolution VARCHAR(20) NULL,
    
    -- Geographic data
    country VARCHAR(2) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    
    -- Product context (if applicable)
    product_id INT NULL,
    product_category VARCHAR(100) NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_events_session (session_id),
    INDEX idx_events_type (event_type),
    INDEX idx_events_category (event_category),
    INDEX idx_events_product (product_id),
    INDEX idx_events_created (created_at),
    INDEX idx_events_device (device_type),
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    
    -- Session timing
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration_seconds INT NULL,
    page_views INT DEFAULT 1,
    
    -- Traffic source
    source VARCHAR(100) NULL,
    medium VARCHAR(100) NULL,
    campaign VARCHAR(100) NULL,
    keyword VARCHAR(255) NULL,
    referrer TEXT NULL,
    
    -- Device info
    device_type ENUM