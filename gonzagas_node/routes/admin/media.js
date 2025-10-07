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
router.get('/media/library', async (req, res) => {
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
        const uploadErrors = [];
        
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
                uploadErrors.push({
                    filename: file.originalname,
                    error: uploadError.message
                });
            }
        }
        
        if (uploadedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Falha no upload de todos os ficheiros',
                errors: uploadErrors
            });
        }
        
        const response = {
            success: true,
            message: `${uploadedFiles.length} ficheiro(s) enviado(s) com sucesso`,
            media: uploadedFiles
        };
        
        if (uploadErrors.length > 0) {
            response.partial = true;
            response.errors = uploadErrors;
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

