const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ImageOptimizerComplete {
    constructor() {
        this.stats = {
            processed: 0,
            errors: 0,
            totalSaved: 0,
            webpCreated: 0
        };
    }

    async optimizeAllAssets() {
        console.log('🎨 GONZAGA DARK NATURE - OTIMIZAÇÃO COMPLETA DE ASSETS');
        console.log('='.repeat(60));
        
        const startTime = Date.now();
        
        // 1. Otimizar backgrounds heroes
        await this.optimizeBackgrounds();
        
        // 2. Otimizar produtos Ametista
        await this.optimizeAmethystProducts();
        
        // 3. Otimizar produtos Turquesa  
        await this.optimizeTurquoiseProducts();
        
        // 4. Otimizar produtos Ónix complementares
        await this.optimizeOnyxProducts();
        
        // 5. Otimizar produtos Olho-de-tigre complementares
        await this.optimizeTigerEyeProducts();
        
        // 6. Criar versões WebP de tudo
        await this.createWebPVersions();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);
        
        this.printFinalReport(duration);
    }

    async optimizeBackgrounds() {
        console.log('\n🏔️  OTIMIZANDO BACKGROUNDS HEROES...');
        
        const backgrounds = [
            'public/images/backgrounds/onyx-hero-bg.jpg',
            'public/images/backgrounds/tiger-eye-hero-bg.jpg', 
            'public/images/backgrounds/amethyst-hero-bg.jpg',
            'public/images/backgrounds/turquoise-hero-bg.jpg'
        ];

        for (const bgPath of backgrounds) {
            await this.optimizeImage(bgPath, {
                width: 1920,
                height: 1080,
                quality: 82,
                progressive: true
            });
        }
    }

    async optimizeAmethystProducts() {
        console.log('\n💜 OTIMIZANDO PRODUTOS AMETISTA...');
        
        const amethystProducts = [
            'public/uploads/products/AMETHYST-001.jpg',
            'public/uploads/products/AMETHYST-002.jpg',
            'public/uploads/products/AMETHYST-003.jpg', 
            'public/uploads/products/AMETHYST-004.jpg',
            'public/uploads/products/AMETHYST-RING-001.jpg',
            'public/uploads/products/AMETHYST-NECKLACE-001.jpg',
            'public/uploads/products/AMETHYST-BRACELET-001.jpg'
        ];

        for (const productPath of amethystProducts) {
            await this.optimizeImage(productPath, {
                width: 800,
                height: 1000,
                quality: 85,
                progressive: true
            });
        }
    }

    async optimizeTurquoiseProducts() {
        console.log('\n🔷 OTIMIZANDO PRODUTOS TURQUESA...');
        
        const turquoiseProducts = [
            'public/uploads/products/TURQUOISE-001.jpg',
            'public/uploads/products/TURQUOISE-002.jpg',
            'public/uploads/products/TURQUOISE-RING-001.jpg'
        ];

        for (const productPath of turquoiseProducts) {
            await this.optimizeImage(productPath, {
                width: 800,
                height: 1000,
                quality: 85,
                progressive: true
            });
        }
    }

    async optimizeOnyxProducts() {
        console.log('\n🖤 OTIMIZANDO PRODUTOS ÓNIX COMPLEMENTARES...');
        
        const onyxProducts = [
            'public/uploads/products/ONIX-002.jpg',
            'public/uploads/products/ONIX-003.jpg',
            'public/uploads/products/ONIX-004.jpg'
        ];

        for (const productPath of onyxProducts) {
            await this.optimizeImage(productPath, {
                width: 800,
                height: 1000,
                quality: 85,
                progressive: true
            });
        }
    }

    async optimizeTigerEyeProducts() {
        console.log('\n🟤 OTIMIZANDO PRODUTOS OLHO-DE-TIGRE COMPLEMENTARES...');
        
        const tigerProducts = [
            'public/uploads/products/TIGER-002.jpg',
            'public/uploads/products/TIGER-003.jpg',
            'public/uploads/products/TIGER-004.jpg'
        ];

        for (const productPath of tigerProducts) {
            await this.optimizeImage(productPath, {
                width: 800,
                height: 1000,
                quality: 85,
                progressive: true
            });
        }
    }

    async optimizeImage(imagePath, options) {
        try {
            if (!fs.existsSync(imagePath)) {
                console.log(`⚠️  Ficheiro não encontrado: ${path.basename(imagePath)}`);
                return;
            }

            const originalStats = fs.statSync(imagePath);
            const originalSize = originalStats.size;
            
            // Criar nome temporário
            const tempPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_optimized.$1');
            
            await sharp(imagePath)
                .resize(options.width, options.height, { 
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ 
                    quality: options.quality,
                    progressive: options.progressive || false,
                    mozjpeg: true
                })
                .toFile(tempPath);

            // Verificar se otimização funcionou
            if (fs.existsSync(tempPath)) {
                const optimizedStats = fs.statSync(tempPath);
                const optimizedSize = optimizedStats.size;
                const saved = originalSize - optimizedSize;
                const savedPercent = ((saved / originalSize) * 100).toFixed(1);

                // Substituir original
                fs.unlinkSync(imagePath);
                fs.renameSync(tempPath, imagePath);

                console.log(`✅ ${path.basename(imagePath)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savedPercent}% menor)`);
                
                this.stats.processed++;
                this.stats.totalSaved += saved;
            }
            
        } catch (error) {
            console.log(`❌ Erro otimizando ${path.basename(imagePath)}:`, error.message);
            this.stats.errors++;
        }
    }

    async createWebPVersions() {
        console.log('\n🚀 CRIANDO VERSÕES WEBP...');
        
        const directories = [
            'public/images/backgrounds/',
            'public/uploads/products/'
        ];

        for (const directory of directories) {
            if (!fs.existsSync(directory)) continue;
            
            const files = fs.readdirSync(directory)
                .filter(file => file.match(/\.(jpg|jpeg)$/i));

            for (const file of files) {
                try {
                    const inputPath = path.join(directory, file);
                    const webpPath = inputPath.replace(/\.(jpg|jpeg)$/i, '.webp');
                    
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
                    console.log(`❌ Erro criando WebP para ${file}:`, error.message);
                }
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

    printFinalReport(duration) {
        console.log('\n📊 RELATÓRIO FINAL DE OTIMIZAÇÃO:');
        console.log('='.repeat(40));
        console.log(`✅ Imagens otimizadas: ${this.stats.processed}`);
        console.log(`🚀 WebP criadas: ${this.stats.webpCreated}`);
        console.log(`❌ Erros: ${this.stats.errors}`);
        console.log(`💾 Espaço poupado: ${this.formatBytes(this.stats.totalSaved)}`);
        console.log(`⏱️  Tempo total: ${duration}s`);
        console.log();
        
        if (this.stats.errors === 0) {
            console.log('🎉 OTIMIZAÇÃO COMPLETA!');
            console.log();
            console.log('✅ TODOS OS ASSETS PRONTOS PARA PRODUÇÃO!');
            console.log();
            console.log('📋 PRÓXIMOS PASSOS:');
            console.log('1. Testar site em localhost:3000');
            console.log('2. Validar todas as 4 coleções funcionam');
            console.log('3. Verificar responsive em mobile');
            console.log('4. Fazer commit e push');
            console.log();
            console.log('🚀 DARK NATURE ESTÁ PRONTO PARA O MUNDO!');
        }
    }
}

// Executar
const optimizer = new ImageOptimizerComplete();
optimizer.optimizeAllAssets().catch(console.error);

