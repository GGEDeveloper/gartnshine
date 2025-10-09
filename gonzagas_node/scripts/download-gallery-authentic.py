#!/usr/bin/env python3
"""
GONZAGA ART & SHINE - GALLERY AUTHENTIC DARK NATURE DOWNLOADER
Downloads all authentic gallery assets - no people, no fake elements
Only real minerals, authentic craftsmanship, natural environments
"""

import requests
import os
import time
from pathlib import Path

class AuthenticGalleryDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
        # Statistics
        self.downloaded = 0
        self.errors = 0
        self.total_size = 0
        
    def create_directories(self):
        """Create authentic gallery directory structure"""
        directories = [
            'public/gallery/authentic',
            'public/css',
            'public/js',
            'views/pages'
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"📁 Directory ready: {directory}")
    
    def download_image(self, url, filepath, description=""):
        """Download single authentic image"""
        try:
            print(f"⬇️  Downloading: {description}")
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Create directory if needed
            Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            
            # Save file
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            file_size = len(response.content)
            self.total_size += file_size
            self.downloaded += 1
            
            print(f"✅ {Path(filepath).name}: {self.format_bytes(file_size)}")
            return True
            
        except Exception as e:
            self.errors += 1
            print(f"❌ Error downloading {Path(filepath).name}: {str(e)}")
            return False
    
    def format_bytes(self, bytes_size):
        """Format bytes for human reading"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} TB"
    
    def download_all_authentic_assets(self):
        """Download all authentic gallery assets"""
        
        print("🎨 GONZAGA ART & SHINE - AUTHENTIC GALLERY DOWNLOADER")
        print("=" * 65)
        print("🚫 NO people, NO fake elements")
        print("✅ ONLY real minerals, authentic craftsmanship, natural environments")
        print()
        
        # Define all authentic assets
        # URLs WILL BE PROVIDED BY HUGO - Placeholder structure
        authentic_assets = {
            # === HERO & MAIN BACKGROUNDS ===
            'public/gallery/authentic/caverna-cristalina-hero.jpg': {
                'url': 'PLACEHOLDER_URL_1',
                'desc': 'Hero Caverna Cristalina - Interior natural com formações rochosas'
            },
            
            # === ORIGEM PRIMORDIAL - RAW MINERALS ===
            'public/gallery/authentic/onix-bruto-volcanico.jpg': {
                'url': 'PLACEHOLDER_URL_2',
                'desc': 'Ónix Bruto - Specimen negro sobre ardósia vulcânica'
            },
            'public/gallery/authentic/olho-tigre-chatoyancia-natural.jpg': {
                'url': 'PLACEHOLDER_URL_3',
                'desc': 'Olho-de-tigre - Chatoyância natural com veios dourados'
            },
            'public/gallery/authentic/ametista-geodo-natural.jpg': {
                'url': 'PLACEHOLDER_URL_4',
                'desc': 'Ametista - Interior geodo com cristais hexagonais'
            },
            'public/gallery/authentic/turquesa-matrix-natural.jpg': {
                'url': 'PLACEHOLDER_URL_5',
                'desc': 'Turquesa Matrix - Mineral em rocha-mãe natural'
            },
            
            # === TRANSFORMAÇÃO ARTESANAL ===
            'public/gallery/authentic/bancada-artesao-portuguesa.jpg': {
                'url': 'PLACEHOLDER_URL_6',
                'desc': 'Bancada Artesanal - Mesa trabalho com ferramentas centenárias'
            },
            'public/gallery/authentic/ferramentas-centenarias.jpg': {
                'url': 'PLACEHOLDER_URL_7',
                'desc': 'Ferramentas Ancestrais - Utensílios ourivesaria patinados'
            },
            'public/gallery/authentic/prata-925-processo.jpg': {
                'url': 'PLACEHOLDER_URL_8',
                'desc': 'Prata 925 - Processo fundição artesanal'
            },
            'public/gallery/authentic/lapidacao-manual.jpg': {
                'url': 'PLACEHOLDER_URL_9',
                'desc': 'Lapidação Manual - Progressão bruto para polido'
            },
            
            # === HARMONIA NATURAL ===
            'public/gallery/authentic/musgos-liquenes-pedra.jpg': {
                'url': 'PLACEHOLDER_URL_10',
                'desc': 'Flora Sombria - Musgos e líquenes sobre pedra'
            },
            'public/gallery/authentic/quatro-pedras-musgo.jpg': {
                'url': 'PLACEHOLDER_URL_11',
                'desc': 'Quaternário Sagrado - 4 pedras em harmonia natural'
            },
            
            # === OG SOCIAL IMAGE ===
            'public/gallery/authentic/og-gallery-authentic.jpg': {
                'url': 'PLACEHOLDER_URL_12',
                'desc': 'OG Social - Gallery preview para partilha social'
            }
        }
        
        # Create directories
        self.create_directories()
        print()
        
        # Download all authentic assets
        print("🖼️  DOWNLOADING AUTHENTIC ASSETS...")
        print()
        
        start_time = time.time()
        
        for filepath, data in authentic_assets.items():
            # Skip placeholders - wait for real URLs from Hugo
            if data['url'].startswith('PLACEHOLDER'):
                print(f"⏭️  Skipping placeholder: {Path(filepath).name}")
                continue
                
            success = self.download_image(
                data['url'], 
                filepath, 
                data['desc']
            )
            
            if success:
                time.sleep(0.8)  # Respectful rate limiting
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Final report
        print()
        print("📊 AUTHENTIC GALLERY DOWNLOAD REPORT:")
        print("=" * 45)
        print(f"✅ Images downloaded: {self.downloaded}")
        print(f"❌ Errors: {self.errors}")
        print(f"💾 Total size: {self.format_bytes(self.total_size)}")
        print(f"⏱️  Time taken: {duration:.1f}s")
        print()
        
        if self.errors == 0 and self.downloaded > 0:
            print("🎉 AUTHENTIC GALLERY DOWNLOAD COMPLETE!")
            print()
            print("📋 NEXT STEPS:")
            print("1. Run: npm install sharp --save-dev")
            print("2. Run: npm run optimize-gallery")
            print("3. Test gallery at: http://localhost:3000/galeria")
            print("4. Commit authentic assets to repository")
            print()
            print("✨ READY TO SHOWCASE PURE DARK NATURE AUTHENTICITY!")
        elif self.downloaded == 0:
            print("ℹ️  No assets downloaded - waiting for real URLs from Hugo")
            print()
            print("📝 NOTE: Update the 'authentic_assets' dictionary with real URLs")
            print("   provided by Hugo, then run this script again.")
        else:
            print(f"⚠️  Download completed with {self.errors} errors.")
            print("Check network connection and retry failed downloads.")

# Execute the authentic downloader
if __name__ == "__main__":
    downloader = AuthenticGalleryDownloader()
    downloader.download_all_authentic_assets()

