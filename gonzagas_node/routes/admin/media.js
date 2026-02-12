const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Jimp } = require('jimp');
const { body, query, param, validationResult } = require('express-validator');
const Media = require('../../models/Media');
const { adminSessionRequired } = require('../../middleware/authMiddleware');

let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    sharp = null; // cPanel pode falhar - usa Jimp
}

const router = express.Router();
const THUMB_SIZE = 160;

/** Gera thumbnail - Sharp (rapido) ou Jimp (fallback puro JS para cPanel/dominios.pt) */
async function generateThumbnail(mediaPath) {
    if (sharp) {
        try {
            const pipeline = sharp(mediaPath, { failOnError: false });
            return await pipeline
                .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch (sharpErr) {
            console.warn('Sharp failed, using Jimp:', sharpErr.message);
        }
    }
    const image = await Jimp.read(mediaPath);
    image.cover({ w: THUMB_SIZE, h: THUMB_SIZE });
    return await image.getBuffer('image/jpeg', { quality: 80 });
}

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
router.get('/media/library', adminSessionRequired, async (req, res) => {
    try {
        // Pastas do disco (public/media)
        const folders = await Media.getFoldersFromFilesystem();
        let tags = [];
        try {
            tags = await Media.getAllTags();
        } catch (loadErr) {
            console.warn('Media tags not available:', loadErr.message);
        }
        
        res.render('admin/media/library', {
            layout: 'admin/layouts/main',
            title: 'Biblioteca de Media',
            folders,
            tags,
            page: 'media-library',
            currentPath: '/media/library'
        });
    } catch (error) {
        console.error('Media library page error:', error);
        res.status(500).render('error', {
            title: 'Erro',
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
            search,
            page = 1,
            limit = 24,
            sort = 'filename:asc'
        } = req.query;
        
        const [sortBy, sortOrder] = sort.split(':');
        const offset = (page - 1) * limit;
        
        const options = {
            folder: folder || null,
            search: search || null,
            limit: parseInt(limit),
            offset,
            sortBy: sortBy || 'filename',
            sortOrder: (sortOrder || 'ASC').toUpperCase()
        };
        
        // Sempre ler do disco (public/media) - sem scripts de import
        const { items: media, total } = await Media.getMediaFromFilesystem(options);
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
 * GET /admin/api/media/thumb
 * Serve resized thumbnail (160x160) - SEM auth (img src não envia cookies em alguns mobile)
 * Path validado - só ficheiros em public/media. Imagens originais já são públicas em /media/
 */
router.get('/api/media/thumb', [
    query('path').notEmpty().isString().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send('Invalid path');
        }
        const relPath = req.query.path.replace(/\.\./g, '').replace(/^\/+/, '');
        const mediaPath = path.join(__dirname, '../../public/media', relPath);
        const ext = path.extname(relPath).toLowerCase();
        const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedExt.includes(ext)) return res.status(400).send('Invalid image');
        const stat = await fs.stat(mediaPath).catch(() => null);
        if (!stat || !stat.isFile()) return res.status(404).send('Not found');
        const buffer = await generateThumbnail(mediaPath);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    } catch (err) {
        console.warn('Thumbnail generation failed:', relPath, err.message);
        res.status(500).send('Error generating thumbnail');
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
                    folder: folder || '/products/',
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                    title,
                    alt_text,
                    description,
                    source
                };
                
                const uploadedMedia = await Media.uploadMediaToFilesystem(file, options);
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
 * Delete media file (filesystem: use ?path=products/foo.jpg ; DB: use id)
 */
router.delete('/api/media/:id', async (req, res) => {
    try {
        const pathParam = req.query.path || req.query.fsPath;
        
        if (pathParam) {
            await Media.deleteMediaFromFilesystem(pathParam);
            return res.json({
                success: true,
                message: 'Ficheiro eliminado com sucesso'
            });
        }
        
        const mediaId = parseInt(req.params.id, 10);
        if (!mediaId || isNaN(mediaId)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido. Para ficheiros em disco, use o parâmetro path.'
            });
        }
        
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
        const folders = await Media.getFoldersFromFilesystem();
        
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

