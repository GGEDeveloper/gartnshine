// =============================================
// GONZAGA ART & SHINE - AUTHENTIC GALLERY OPTIMIZER
// Optimize authentic assets for production
// =============================================

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class AuthenticGalleryOptimizer {
    constructor() {
        this.stats = {
            processed: 0,
            errors: 0,
            totalSaved: 0,
            webpCreated: 0,
            startTime: Date.now()
        };
    }

    async optimizeAllGalleryAssets() {
        console.log('🎨 GONZAGA AUTHENTIC GALLERY OPTIMIZER');
        console.log('='.repeat(50));
        console.log('🌑 Optimizing Dark Nature authentic assets');
        console.log();

        try {
            // Process by category for organized output
            await this.processCategory('Hero Background', 'public/gallery/authentic/caverna-*.jpg', {
                width: 1920, 
                height: 1080, 
                quality: 82
            });

            await this.processCategory('Origem Minerals', 'public/gallery/authentic/origem/*.jpg', {
                width: 800, 
                height: 600, 
                quality: 88
            });

            await this.processCategory('Transformação Craft', 'public/gallery/authentic/transformacao/*.jpg', {
                width: 800, 
                height: 600, 
                quality: 85
            });

            await this.processCategory('Harmonia Natural', 'public/gallery/authentic/harmonia/*.jpg', {
                width: 800, 
                height: 600, 
                quality: 88
            });

            await this.processCategory('Macro Details', 'public/gallery/authentic/macro/*.jpg', {
                width: 600, 
                height: 600, 
                quality: 90
            });

            // Create WebP versions for modern browsers
            await this.createWebPVersions();

            this.printFinalReport();

        } catch (error) {
            console.error('❌ Optimization failed:', error);
            process.exit(1);
        }
    }

    async processCategory(categoryName, globPattern, options) {
        console.log(`\n🔄 ${categoryName}:`);
        
        const glob = require('glob');
        const files = glob.sync(globPattern);
        
        if (files.length === 0) {
            console.log(`⚠️  No files found matching: ${globPattern}`);
            return;
        }

        for (const filePath of files) {
            await this.optimizeImage(filePath, options);
        }
    }

    async optimizeImage(imagePath, options) {
        try {
            if (!fs.existsSync(imagePath)) {
                console.log(`⚠️  File not found: ${path.basename(imagePath)}`);
                return;
            }

            const originalStats = fs.statSync(imagePath);
            const originalSize = originalStats.size;
            
            // Create optimized version
            const tempPath = imagePath.replace(/\.jpg$/i, '_optimized.jpg');
            
            await sharp(imagePath)
                .resize(options.width, options.height, { 
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ 
                    quality: options.quality,
                    progressive: true,
                    mozjpeg: true
                })
                .toFile(tempPath);

            // Validate optimization
            if (fs.existsSync(tempPath)) {
                const optimizedStats = fs.statSync(tempPath);
                const optimizedSize = optimizedStats.size;
                const saved = originalSize - optimizedSize;
                const savedPercent = ((saved / originalSize) * 100).toFixed(1);

                // Only replace if optimization is beneficial
                if (optimizedSize < originalSize) {
                    fs.unlinkSync(imagePath);
                    fs.renameSync(tempPath, imagePath);

                    console.log(`✅ ${path.basename(imagePath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savedPercent}% saved)`);
                    
                    this.stats.processed++;
                    this.stats.totalSaved += saved;
                } else {
                    // Keep original if it's already smaller
                    fs.unlinkSync(tempPath);
                    console.log(`⏭️  ${path.basename(imagePath)}: Already optimized (${this.formatBytes(originalSize)})`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Error optimizing ${path.basename(imagePath)}:`, error.message);
            this.stats.errors++;
        }
    }

    async createWebPVersions() {
        console.log('\n🚀 Creating WebP versions for modern browsers:');
        
        const glob = require('glob');
        const allJpgs = glob.sync('public/gallery/authentic/**/*.jpg');

        for (const jpgPath of allJpgs) {
            try {
                const webpPath = jpgPath.replace(/\.jpg$/i, '.webp');
                
                await sharp(jpgPath)
                    .webp({ 
                        quality: 85,
                        effort: 6
                    })
                    .toFile(webpPath);
                
                const webpStats = fs.statSync(webpPath);
                const originalStats = fs.statSync(jpgPath);
                const savings = originalStats.size - webpStats.size;
                const savingsPercent = ((savings / originalStats.size) * 100).toFixed(1);
                
                console.log(`✅ WebP: ${path.basename(webpPath)} (${savingsPercent}% smaller)`);
                
                this.stats.webpCreated++;
                
            } catch (error) {
                console.log(`❌ WebP creation failed for ${path.basename(jpgPath)}:`, error.message);
            }
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    printFinalReport() {
        const duration = ((Date.now() - this.stats.startTime) / 1000).toFixed(1);
        
        console.log('\n📊 AUTHENTIC GALLERY OPTIMIZATION REPORT:');
        console.log('='.repeat(50));
        console.log(`✅ Images optimized: ${this.stats.processed}`);
        console.log(`🚀 WebP versions created: ${this.stats.webpCreated}`);
        console.log(`❌ Errors: ${this.stats.errors}`);
        console.log(`💾 Total space saved: ${this.formatBytes(this.stats.totalSaved)}`);
        console.log(`⏱️  Processing time: ${duration}s`);
        console.log();
        
        if (this.stats.errors === 0 && (this.stats.processed > 0 || this.stats.webpCreated > 0)) {
            console.log('🎉 OPTIMIZATION COMPLETE!');
            console.log();
            console.log('✅ ALL AUTHENTIC GALLERY ASSETS READY FOR PRODUCTION!');
            console.log();
            console.log('📋 NEXT STEPS:');
            console.log('1. Test: http://localhost:3000/galeria');
            console.log('2. Deploy to production');
            console.log();
            console.log('🌑 DARK NATURE AUTHENTIC GALLERY IS LIVE! 💎🍃');
        } else if (this.stats.processed === 0 && this.stats.webpCreated === 0) {
            console.log('⚠️  No assets found to optimize.');
            console.log('💡 Run: npm run download-gallery first');
        } else {
            console.log(`⚠️  Optimization completed with ${this.stats.errors} errors.`);
            console.log('🔧 Review error messages and fix issues before deployment.');
        }
    }
}

// Execute optimization
const optimizer = new AuthenticGalleryOptimizer();
optimizer.optimizeAllGalleryAssets().catch(console.error);
