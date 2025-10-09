// =============================================
// GONZAGA ART & SHINE - AUTHENTIC GALLERY OPTIMIZER
// Optimize authentic assets for production
// =============================================

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class GalleryAuthenticOptimizer {
    constructor() {
        this.stats = { 
            processed: 0, 
            errors: 0, 
            saved: 0,
            webpCreated: 0
        };
    }

    async optimizeAll() {
        console.log('🎨 OPTIMIZING AUTHENTIC GALLERY ASSETS...');
        console.log('='.repeat(50));
        
        const galleryDir = 'public/gallery/authentic/';
        
        if (!fs.existsSync(galleryDir)) {
            console.log('❌ Gallery directory not found!');
            console.log('   Run: npm run download-gallery first');
            return;
        }
        
        const files = fs.readdirSync(galleryDir)
            .filter(file => file.match(/\.(jpg|jpeg|png)$/i));
        
        console.log(`\n📸 Found ${files.length} images to optimize\n`);
        
        for (const file of files) {
            await this.optimizeImage(path.join(galleryDir, file));
        }
        
        await this.createWebPVersions(galleryDir);
        
        console.log('\n📊 OPTIMIZATION COMPLETE:');
        console.log('='.repeat(30));
        console.log(`✅ Processed: ${this.stats.processed}`);
        console.log(`🚀 WebP created: ${this.stats.webpCreated}`);
        console.log(`❌ Errors: ${this.stats.errors}`);
        console.log(`💾 Saved: ${this.formatBytes(this.stats.saved)}`);
        console.log('\n🎉 Gallery ready for production!');
    }

    async optimizeImage(imagePath) {
        try {
            const originalStats = fs.statSync(imagePath);
            const originalSize = originalStats.size;
            
            const tempPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_optimized.jpg');
            
            // Hero images: larger size (1920x1080)
            // Other images: gallery size (800x600)
            const isHero = path.basename(imagePath).includes('hero');
            const width = isHero ? 1920 : 800;
            const height = isHero ? 1080 : 600;
            const quality = isHero ? 85 : 90;
            
            await sharp(imagePath)
                .resize(width, height, { 
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ 
                    quality,
                    progressive: true,
                    mozjpeg: true
                })
                .toFile(tempPath);

            const optimizedStats = fs.statSync(tempPath);
            const optimizedSize = optimizedStats.size;
            const saved = originalSize - optimizedSize;
            const savedPercent = ((saved / originalSize) * 100).toFixed(1);
            
            // Replace original
            fs.unlinkSync(imagePath);
            fs.renameSync(tempPath, imagePath);
            
            console.log(`✅ ${path.basename(imagePath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savedPercent}% menor)`);
            
            this.stats.processed++;
            this.stats.saved += saved;
            
        } catch (error) {
            console.log(`❌ Error optimizing ${path.basename(imagePath)}: ${error.message}`);
            this.stats.errors++;
        }
    }

    async createWebPVersions(directory) {
        console.log('\n🚀 Creating WebP versions...');
        
        const files = fs.readdirSync(directory)
            .filter(file => file.match(/\.jpg$/i));

        for (const file of files) {
            try {
                const inputPath = path.join(directory, file);
                const webpPath = inputPath.replace(/\.jpg$/i, '.webp');
                
                await sharp(inputPath)
                    .webp({ 
                        quality: 85, 
                        effort: 6 
                    })
                    .toFile(webpPath);
                
                const webpStats = fs.statSync(webpPath);
                console.log(`✅ WebP: ${path.basename(webpPath)} (${this.formatBytes(webpStats.size)})`);
                
                this.stats.webpCreated++;
                
            } catch (error) {
                console.log(`❌ WebP failed for ${file}: ${error.message}`);
            }
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Execute
new GalleryAuthenticOptimizer().optimizeAll().catch(console.error);

