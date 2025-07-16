const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const CatalogController = require('../controllers/CatalogController');
const ProductController = require('../controllers/ProductController'); // Added for product details UC page

// Home page - Showcase page with featured products and media gallery
router.get('/', async (req, res) => {
  try {
    let featured = [];
    let families = [];
    
    try {
      featured = await Product.getFeatured();

      // Format prices for featured products
      featured = featured.map(product => ({
        ...product,
        formatted_sale_price: product.sale_price ? 
          new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.sale_price)) :
          null,
        formatted_purchase_price: product.purchase_price ?
          new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
          null
      }));

      families = await ProductFamily.getAll();
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue without database data
    }
    
    // Get media files for the gallery
    const mediaPath = path.join(__dirname, '../../media');
    let mediaFiles = [];
    
    try {
      console.log(`Reading media directory: ${mediaPath}`);
      const files = await fs.readdir(mediaPath);
      console.log(`Found ${files.length} files in media directory`);
      
      mediaFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp4'].includes(ext);
      }).map(file => ({
        filename: file,
        type: path.extname(file).toLowerCase() === '.mp4' ? 'video' : 'image',
        path: `/media/${file}`
      }));
      
      console.log(`Filtered to ${mediaFiles.length} media files`);
    } catch (error) {
      console.error(`Error reading media directory ${mediaPath}:`, error);
    }
    
    // If no media files found, try fallback path
    if (mediaFiles.length === 0) {
      try {
        const fallbackPath = path.join(__dirname, '../media');
        console.log(`Trying fallback media path: ${fallbackPath}`);
        const files = await fs.readdir(fallbackPath);
        console.log(`Found ${files.length} files in fallback media directory`);
        
        mediaFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.mp4'].includes(ext);
        }).map(file => ({
          filename: file,
          type: path.extname(file).toLowerCase() === '.mp4' ? 'video' : 'image',
          path: `/media/${file}`
        }));
        
        console.log(`Filtered to ${mediaFiles.length} media files from fallback`);
      } catch (error) {
        console.error('Error reading fallback media directory:', error);
      }
    }
    
    console.log(`Rendering index with ${mediaFiles.length} media files`);
    console.log('Featured products for template:', JSON.stringify(featured, null, 2)); // Log featured products
    res.render('index', { 
      title: 'Home',
      featured: featured || [],
      families: families || [],
      mediaFiles: mediaFiles || [],
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra'
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the homepage.'
    });
  }
});

// Collections page - Show all media images
router.get('/collections', async (req, res) => {
  try {
    // Try multiple possible media paths
    const possiblePaths = [
      path.join(__dirname, '../public/media/gallery'), // New dedicated gallery path
      path.join(__dirname, '../../media'),
      path.join(__dirname, '../public/media'),
      path.join(__dirname, '../media')
    ];
    
    let files = [];
    let mediaPath = '';
    
    // Find the first valid path
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        files = await fs.readdir(possiblePath);
        mediaPath = possiblePath;
        console.log(`Using media path: ${mediaPath}`);
        break;
      } catch (err) {
        console.log(`Path not found: ${possiblePath}`);
        continue;
      }
    }
    
    if (files.length === 0) {
      console.error('No valid media directory found');
      return res.status(500).render('error', {
        title: 'Error',
        message: 'Media directory not found.'
      });
    }
    
    // Filter only image files and exclude banner-about.jpg
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      const isNotBanner = !file.toLowerCase().includes('banner-about');
      return isImage && isNotBanner;
    }).map(file => ({
      filename: file,
      path: `/media/${file}`,
      url: `/media/${file}`
    }));
    
    res.render('collections', {
      title: 'Gallery',
      images: imageFiles,
      user: req.user || null,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading media files:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load media files.'
    });
  }
});

// Collection page - Show products by family
router.get('/collection/:familyId', async (req, res) => {
  try {
    const familyId = parseInt(req.params.familyId);
    const family = await ProductFamily.getById(familyId);
    
    if (!family) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Collection not found.'
      });
    }
    
    const products = await Product.getByFamily(familyId);
    const families = await ProductFamily.getAll();
    
    res.render('collection', {
      title: family.name,
      family,
      products,
      families
    });
  } catch (error) {
    console.error('Error loading collection:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the collection.'
    });
  }
});

// Catalog page
router.get('/catalog', CatalogController.displayCatalog);

// Product detail under construction page
router.get('/product/:id/details-uc', ProductController.showProductDetailUnderConstruction);

// Product detail page
router.get('/product/:id', ProductController.showProductDetailUnderConstruction);

// About page
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About Gonzaga\'s Art & Shine'
  });
});

// Privacy Policy page
router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', {
    title: 'Política de Privacidade'
  });
});

// Terms of Service page
router.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', {
    title: 'Termos de Serviço'
  });
});

module.exports = router; 