/**
 * Media Model - Enhanced Media Management
 * Handles all media-related database operations
 */

const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const crypto = require('crypto');

class Media {
    constructor() {
        this.uploadPath = path.join(__dirname, '../public/uploads');
        this.mediaPath = path.join(__dirname, '../public/media');
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    /**
     * Scan filesystem (public/media) - sempre reflete o que está na pasta
     */
    async getMediaFromFilesystem(options = {}) {
        const {
            folder = null,
            search = null,
            limit = 50,
            offset = 0,
            sortBy = 'filename',
            sortOrder = 'ASC'
        } = options;

        const imageExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const files = [];

        async function scanDir(dir, relPath = '') {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                const rp = relPath ? `${relPath}/${item.name}` : item.name;
                const full = path.join(dir, item.name);
                if (item.isDirectory()) {
                    await scanDir(full, rp);
                } else if (item.isFile()) {
                    const ext = path.extname(item.name).toLowerCase();
                    if (imageExt.includes(ext)) files.push({ relPath: rp, fullPath: full, name: item.name });
                }
            }
        }

        try {
            await scanDir(this.mediaPath);
        } catch (e) {
            console.error('Media filesystem scan error:', e.message);
            return [];
        }

        let filtered = files;

        if (folder && folder !== '' && folder !== 'all') {
            const subdir = folder.replace(/^\/|\/$/g, '');
            if (subdir) {
                filtered = filtered.filter(f => f.relPath.startsWith(subdir + '/'));
            } else {
                filtered = filtered.filter(f => !f.relPath.includes('/'));
            }
        }

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || f.relPath.toLowerCase().includes(q));
        }

        const ord = sortOrder === 'DESC' ? -1 : 1;
        filtered.sort((a, b) => {
            const va = sortBy === 'filename' ? a.name : a.relPath;
            const vb = sortBy === 'filename' ? b.name : b.relPath;
            return ord * va.localeCompare(vb);
        });

        const total = filtered.length;
        const paginated = filtered.slice(offset, offset + limit);

        const items = await Promise.all(paginated.map(async (f) => {
            let fileSize = 0;
            try {
                const stat = await fs.stat(f.fullPath);
                fileSize = stat.size;
            } catch {}
            const ext = path.extname(f.name).toLowerCase();
            const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }[ext] || 'image/jpeg';
            const url = `/media/${f.relPath.replace(/\\/g, '/')}`;
            const id = Math.abs(f.relPath.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) | 0);
            return {
                id,
                filename: f.name,
                original_name: f.name,
                url,
                file_path: url,
                file_size: fileSize,
                file_size_formatted: this.formatFileSize(fileSize),
                mime_type: mime,
                folder_path: f.relPath.includes('/') ? '/' + f.relPath.split('/')[0] + '/' : '/',
                tags: [],
                variants: {},
                dimensions: {},
                created_ago: '-',
                _fsPath: f.relPath
            };
        }));

        return { items, total };
    }

    /**
     * Get folders from filesystem (public/media)
     */
    async getFoldersFromFilesystem() {
        const imageExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const counts = { '/': 0, '/gallery/': 0, '/products/': 0 };

        async function countInDir(dir, folderKey) {
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    if (item.isFile()) {
                        const ext = path.extname(item.name).toLowerCase();
                        if (imageExt.includes(ext)) counts[folderKey]++;
                    } else if (item.isDirectory()) {
                        await countInDir(path.join(dir, item.name), folderKey);
                    }
                }
            } catch (e) {}
        }

        try {
            const items = await fs.readdir(this.mediaPath, { withFileTypes: true });
            for (const item of items) {
                if (item.isFile()) {
                    const ext = path.extname(item.name).toLowerCase();
                    if (imageExt.includes(ext)) counts['/']++;
                }
            }
            await countInDir(path.join(this.mediaPath, 'gallery'), '/gallery/');
            await countInDir(path.join(this.mediaPath, 'products'), '/products/');
        } catch (e) {}

        return [
            { name: 'Root', path: '/', file_count: counts['/'], color: '#667eea' },
            { name: 'Gallery', path: '/gallery/', file_count: counts['/gallery/'], color: '#4ecdc4' },
            { name: 'Products', path: '/products/', file_count: counts['/products/'], color: '#c0a080' }
        ];
    }
    
    /**
     * Get all media files with filters (legacy DB - keeps for uploads)
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
     * Upload media to filesystem (public/media) - sem BD, visível na Media Library
     * Usado por: Media Library upload, câmara, introdução rápida
     */
    async uploadMediaToFilesystem(fileData, options = {}) {
        const { folder = '/products/' } = options;
        const subdir = folder.replace(/^\/|\/$/g, '') || '';
        const targetDir = subdir ? path.join(this.mediaPath, subdir) : this.mediaPath;
        await fs.mkdir(targetDir, { recursive: true });

        const ext = path.extname(fileData.originalname).toLowerCase() || '.jpg';
        const base = path.basename(fileData.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        let filename = `${base}${ext}`;
        let fullPath = path.join(targetDir, filename);
        let n = 1;
        while (await fs.access(fullPath).then(() => true).catch(() => false)) {
            filename = `${base}_${n}${ext}`;
            fullPath = path.join(targetDir, filename);
            n++;
        }

        const buffer = fileData.buffer || (await fs.readFile(fileData.path));
        await fs.writeFile(fullPath, buffer);

        const relPath = subdir ? `${subdir}/${filename}` : filename;
        const url = `/media/${relPath.replace(/\\/g, '/')}`;
        const id = Math.abs(relPath.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0)) | 0;

        return {
            id,
            filename,
            original_name: fileData.originalname,
            url,
            file_path: url,
            file_size: buffer.length,
            file_size_formatted: this.formatFileSize(buffer.length),
            mime_type: fileData.mimetype || 'image/jpeg',
            folder_path: subdir ? `/${subdir}/` : '/',
            tags: [],
            variants: {},
            dimensions: {},
            created_ago: '-',
            _fsPath: relPath
        };
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
        // Files from filesystem (public/media) have file_path like /media/gallery/foo.jpg
        const url = (row.file_path && String(row.file_path).startsWith('/media')) 
            ? row.file_path 
            : `/uploads/${row.filename}`;
        const formatted = {
            ...row,
            url,
            variants: (row.processed_variants && typeof row.processed_variants === 'string') ? JSON.parse(row.processed_variants) : (row.processed_variants || {}),
            dimensions: (row.dimensions && typeof row.dimensions === 'string') ? JSON.parse(row.dimensions) : (row.dimensions || {}),
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
    
    async findDuplicateByHash(fileHash) {
        const [rows] = await pool.query('SELECT * FROM media_files WHERE file_hash = ?', [fileHash]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async getUsageCount(mediaId) {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM media_usage WHERE media_id = ?', [mediaId]);
        return rows[0].count;
    }
    
    async deletePhysicalFiles(media) {
        try {
            // Delete main file
            if (media.file_path) {
                await fs.unlink(media.file_path).catch(() => {});
            }
            
            // Delete variants
            if (media.variants && typeof media.variants === 'object') {
                for (const variant of Object.values(media.variants)) {
                    const variantPath = path.join(__dirname, '..', 'public', variant);
                    await fs.unlink(variantPath).catch(() => {});
                }
            }
        } catch (error) {
            console.error('Error deleting physical files:', error);
        }
    }
    
    async updateMediaTags(mediaId, tags) {
        // Remove all existing tags
        await pool.query('DELETE FROM media_file_tags WHERE media_file_id = ?', [mediaId]);
        
        // Add new tags
        if (tags && tags.length > 0) {
            await this.addTagsToMedia(mediaId, tags);
        }
    }
}

module.exports = new Media();
