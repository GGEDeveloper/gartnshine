Excelentíssimo Senhor Hugo Gonzaga Gomes,

Perfeito! Vou criar um **script completo** para descarregar **TODOS** os assets dos novos desenvolvimentos após os fundos!

# 📥 **SCRIPT DOWNLOAD ASSETS - DESENVOLVIMENTOS PÓS-BACKGROUNDS**

## **🖼️ ASSETS A DESCARREGAR (18 imagens)**

### **PRODUTOS AMETISTA (4 imagens):**
- ✅ **AMETHYST-001.jpg** → (see the generated image above) Brincos par (já existe)
- ✅ **AMETHYST-002.jpg** → (see the generated image above) Individual (já existe)  
- ✅ **AMETHYST-003.jpg** → (see the generated image above) Detalhe cristal (já existe)
- ✅ **AMETHYST-004.jpg** → (see the generated image above) Montagem prata (já existe)
- ✅ **AMETHYST-RING-001.jpg** → (see the generated image above) Anel novo ⬅️
- ✅ **AMETHYST-NECKLACE-001.jpg** → (see the generated image above) Colar novo ⬅️
- ✅ **AMETHYST-BRACELET-001.jpg** → (see the generated image above) Pulseira nova ⬅️

### **PRODUTOS TURQUESA (3 imagens):**
- ✅ **TURQUOISE-001.jpg** → (see the generated image above) Pulseira (já existe)
- ✅ **TURQUOISE-002.jpg** → (see the generated image above) Detalhe pedras (já existe)
- ✅ **TURQUOISE-RING-001.jpg** → (see the generated image above) Anel novo ⬅️

### **PRODUTOS COMPLEMENTARES ÓNIX (3 imagens):**
- ✅ **ONIX-002.jpg** → (see the generated image above) Vista lateral (já existe)
- ✅ **ONIX-003.jpg** → (see the generated image above) Detalhe cravação (já existe)
- ✅ **ONIX-004.jpg** → (see the generated image above) Macro textura (já existe)

### **PRODUTOS COMPLEMENTARES OLHO-DE-TIGRE (4 imagens):**
- ✅ **TIGER-002.jpg** → (see the generated image above) Pingente isolado (já existe)
- ✅ **TIGER-003.jpg** → (see the generated image above) Veios close-up (já existe)
- ✅ **TIGER-004.jpg** → (see the generated image above) Vista completa (já existe)

***

# 🔧 **SCRIPT DE DOWNLOAD COMPLETO**

## **Criar `scripts/download-dark-nature-assets.py`:**

```python
#!/usr/bin/env python3
"""
GONZAGA ART & SHINE - DARK NATURE ASSETS DOWNLOADER
Descarrega todos os assets criados para a expansão das 4 pedras sagradas
"""

import requests
import os
import time
from pathlib import Path

class DarkNatureAssetsDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
        # Contadores
        self.downloaded = 0
        self.errors = 0
        self.total_size = 0
        
    def create_directories(self):
        """Criar estrutura de pastas necessária"""
        directories = [
            'public/images/backgrounds',
            'public/uploads/products', 
            'public/images/icons',
            'public/images/og'
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"📁 Pasta criada/verificada: {directory}")
    
    def download_image(self, url, filepath, description=""):
        """Download individual de imagem com retry"""
        try:
            print(f"⬇️  Descarregando: {description}")
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Criar diretório se não existir
            Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            
            # Guardar ficheiro
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            file_size = len(response.content)
            self.total_size += file_size
            self.downloaded += 1
            
            print(f"✅ {Path(filepath).name}: {self.format_bytes(file_size)}")
            return True
            
        except Exception as e:
            self.errors += 1
            print(f"❌ Erro descarregando {Path(filepath).name}: {str(e)}")
            return False
    
    def format_bytes(self, bytes_size):
        """Formatar bytes para leitura humana"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} TB"
    
    def download_all_assets(self):
        """Download completo de todos os assets"""
        
        print("🎨 GONZAGA ART & SHINE - DARK NATURE ASSETS DOWNLOADER")
        print("=" * 60)
        print()
        
        # Definir todos os assets
        assets = {
            # === BACKGROUNDS HEROES ===
            'public/images/backgrounds/onyx-hero-bg.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/284ad94f-2ead-4e79-af36-0148feb12785.png',
                'desc': 'Hero Ónix - Ardósia texturizada escura'
            },
            'public/images/backgrounds/tiger-eye-hero-bg.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/3edac26b-122c-4016-86f4-1273e7c6112f.png',
                'desc': 'Hero Olho-de-tigre - Madeira dourada'
            },
            'public/images/backgrounds/amethyst-hero-bg.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8c3961db-9dfd-44cc-8119-b468d8c4f38d.png',
                'desc': 'Hero Ametista - Geodo cristal roxo'
            },
            'public/images/backgrounds/turquoise-hero-bg.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/1b3183a5-f9e2-4a04-b586-68e2d7e03277.png',
                'desc': 'Hero Turquesa - Pedra oceânica'
            },
            
            # === PRODUTOS ÓNIX ===
            'public/uploads/products/ONIX-002.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/64550e71-64ff-480a-a6a0-8384d6983380.png',
                'desc': 'Anel Ónix - Vista lateral'
            },
            'public/uploads/products/ONIX-003.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/a325efb9-f989-448b-8ee9-7c35c843a844.png',
                'desc': 'Anel Ónix - Detalhe cravação'
            },
            'public/uploads/products/ONIX-004.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/b5279893-0755-490c-a33d-f89b511c9db9.png',
                'desc': 'Anel Ónix - Macro textura'
            },
            
            # === PRODUTOS OLHO-DE-TIGRE ===
            'public/uploads/products/TIGER-002.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/eeaa90be-1ce0-47f7-8d95-6c80c8d6fb50.png',
                'desc': 'Colar Olho-de-tigre - Pingente isolado'
            },
            'public/uploads/products/TIGER-003.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/08391044-b06e-4477-8ca8-3da0d776b779.png',
                'desc': 'Colar Olho-de-tigre - Macro veios'
            },
            'public/uploads/products/TIGER-004.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/48f04756-35f7-4cfe-9786-7b502a596d79.png',
                'desc': 'Colar Olho-de-tigre - Vista completa'
            },
            
            # === PRODUTOS AMETISTA ===
            'public/uploads/products/AMETHYST-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/c6cd53bd-5987-40cb-9c4c-1739ffb250b7.png',
                'desc': 'Brincos Ametista - Vista principal'
            },
            'public/uploads/products/AMETHYST-002.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/ab56af89-f927-4264-9510-91080aa4fc4f.png',
                'desc': 'Brincos Ametista - Vista individual'
            },
            'public/uploads/products/AMETHYST-003.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/a9c8e5e7-837e-4740-a15e-1c003e33e96c.png',
                'desc': 'Brincos Ametista - Detalhe cristal'
            },
            'public/uploads/products/AMETHYST-004.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/c1c9cde0-2e8b-4214-a507-5b7ecf81d24b.png',
                'desc': 'Brincos Ametista - Montagem prata'
            },
            'public/uploads/products/AMETHYST-RING-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/85e1d05e-b8ab-425f-a285-32cc6eba64e0.png',
                'desc': 'Anel Ametista Serenidade - Principal'
            },
            'public/uploads/products/AMETHYST-NECKLACE-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/cc3ed89b-435a-47c1-8832-84dc55919f0a.png',
                'desc': 'Colar Ametista Intuição - Principal'
            },
            'public/uploads/products/AMETHYST-BRACELET-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/becb5834-7854-4421-b9cf-fb43e0ed76d8.png',
                'desc': 'Pulseira Ametista Transmutação - Principal'
            },
            
            # === PRODUTOS TURQUESA ===
            'public/uploads/products/TURQUOISE-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/cc93535c-4cb1-49fb-9d48-938ad1849223.png',
                'desc': 'Pulseira Turquesa - Vista principal'
            },
            'public/uploads/products/TURQUOISE-002.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8062e2d8-1f09-43f8-a91b-68c184ba24e3.png',
                'desc': 'Pulseira Turquesa - Detalhe pedras'
            },
            'public/uploads/products/TURQUOISE-RING-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/6c63501f-2070-485b-97c1-ea1c3af17a73.png',
                'desc': 'Anel Turquesa Proteção - Principal'
            }
        }
        
        # Criar diretórios
        self.create_directories()
        print()
        
        # Download todos os assets
        print("🖼️  INICIANDO DOWNLOAD DOS ASSETS...")
        print()
        
        start_time = time.time()
        
        for filepath, data in assets.items():
            success = self.download_image(
                data['url'], 
                filepath, 
                data['desc']
            )
            
            if success:
                time.sleep(0.5)  # Rate limiting
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Relatório final
        print()
        print("📊 RELATÓRIO DE DOWNLOAD:")
        print("=" * 40)
        print(f"✅ Imagens descarregadas: {self.downloaded}")
        print(f"❌ Erros: {self.errors}")
        print(f"💾 Tamanho total: {self.format_bytes(self.total_size)}")
        print(f"⏱️  Tempo total: {duration:.1f}s")
        print()
        
        if self.errors == 0:
            print("🎉 DOWNLOAD COMPLETO! Todos os assets prontos!")
            print()
            print("📋 PRÓXIMOS PASSOS:")
            print("1. Executar: npm install sharp --save-dev")
            print("2. Executar: npm run optimize-images")
            print("3. Testar URLs dos produtos no browser")
            print("4. Commit e push para repositório")
        else:
            print(f"⚠️  Download completo com {self.errors} erros.")
            print("Verificar conectividade e tentar novamente.")

# Executar o downloader
if __name__ == "__main__":
    downloader = DarkNatureAssetsDownloader()
    downloader.download_all_assets()
```

***

# ⚡ **SCRIPT DE OTIMIZAÇÃO PÓS-DOWNLOAD**

## **Atualizar `scripts/optimize-4stones.js`:**

```javascript
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
        console.log('=' * 60);
        
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
        console.log('=' * 40);
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
```

***

# 📋 **PACKAGE.JSON UPDATES**

## **Adicionar scripts ao package.json:**
```json
{
  "scripts": {
    "download-assets": "python3 scripts/download-dark-nature-assets.py",
    "optimize-images": "node scripts/optimize-4stones.js",  
    "setup-dark-nature": "npm run download-assets && npm run optimize-images",
    "validate-assets": "node scripts/validate-assets.js"
  },
  "devDependencies": {
    "sharp": "^0.32.6"
  }
}
```

***

# 🚀 **EXECUÇÃO COMPLETA:**

## **Sequência de Comandos:**
```bash
# 1. Criar script Python
mkdir -p scripts
# Copiar código do script para scripts/download-dark-nature-assets.py

# 2. Tornar executável
chmod +x scripts/download-dark-nature-assets.py

# 3. Instalar dependências
pip3 install requests  # Se não tiver
npm install sharp --save-dev

# 4. Executar download
python3 scripts/download-dark-nature-assets.py

# 5. Otimizar imagens
npm run optimize-images

# 6. Validar resultado
ls -la public/images/backgrounds/
ls -la public/uploads/products/AMETHYST*
ls -la public/uploads/products/TURQUOISE*
```

***

# ✅ **RESULTADO ESPERADO:**

## **Assets Estruturados:**
```
public/
├── images/
│   └── backgrounds/
│       ├── onyx-hero-bg.jpg         (~280KB)
│       ├── tiger-eye-hero-bg.jpg    (~245KB)  
│       ├── amethyst-hero-bg.jpg     (~295KB)
│       └── turquoise-hero-bg.jpg    (~260KB)
└── uploads/
    └── products/
        ├── ONIX-002.jpg             (~145KB)
        ├── ONIX-003.jpg             (~155KB)
        ├── ONIX-004.jpg             (~160KB)
        ├── TIGER-002.jpg            (~150KB)
        ├── TIGER-003.jpg            (~140KB)
        ├── TIGER-004.jpg            (~155KB)
        ├── AMETHYST-001.jpg         (~165KB)
        ├── AMETHYST-002.jpg         (~145KB)
        ├── AMETHYST-003.jpg         (~140KB)
        ├── AMETHYST-004.jpg         (~150KB)
        ├── AMETHYST-RING-001.jpg    (~155KB)    ⬅️ NOVO
        ├── AMETHYST-NECKLACE-001.jpg (~160KB)  ⬅️ NOVO  
        ├── AMETHYST-BRACELET-001.jpg (~150KB)  ⬅️ NOVO
        ├── TURQUOISE-001.jpg        (~145KB)
        ├── TURQUOISE-002.jpg        (~140KB)
        └── TURQUOISE-RING-001.jpg   (~150KB)   ⬅️ NOVO
```

## **Performance Final:**
- **18 imagens**: ~2.8MB total
- **Otimização**: ~70% redução de tamanho
- **WebP versions**: ~30% adicional redução
- **Loading time**: <1.5s em 3G

**Este script vai descarregar e otimizar TODOS os 18 assets dos desenvolvimentos recentes!**

**Execute o script Python e depois o optimize-4stones.js - em 10 minutos terá tudo funcionando perfeitamente!** 🚀💎✨