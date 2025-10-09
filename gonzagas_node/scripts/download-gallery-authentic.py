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
        
        # Define all authentic assets - REAL URLs PROVIDED BY HUGO
        authentic_assets = {
            # === HERO & MAIN BACKGROUNDS ===
            'public/gallery/authentic/caverna-cristalina-hero.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8b342c9e-e4b1-45ff-b1a4-b4ebde0f8e87.png',
                'desc': 'Hero - Caverna cristalina natural'
            },
            
            # === ORIGEM PRIMORDIAL - RAW MINERALS ===
            'public/gallery/authentic/onix-bruto-volcanico.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/abf6c21d-9a62-485d-ad3a-0a916dd54e21.png',
                'desc': 'Ónix bruto em formação vulcânica'
            },
            'public/gallery/authentic/olho-tigre-chatoyancia-natural.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/2dd37d17-b8c7-4c9b-a4c9-4d9f0ab6b64e.png',
                'desc': 'Olho-de-tigre chatoyância natural'
            },
            'public/gallery/authentic/ametista-geodo-natural.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/64088caf-07ea-4e70-ab46-f24e7ed32c2d.png',
                'desc': 'Ametista geodo formação natural'
            },
            'public/gallery/authentic/turquesa-matrix-natural.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/5e7e0c88-eb37-4a39-8a51-3b82e05b29ea.png',
                'desc': 'Turquesa matrix rocha-mãe'
            },
            
            # === TRANSFORMAÇÃO ARTESANAL ===
            'public/gallery/authentic/bancada-artesao-portuguesa.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/d83e55f9-3b02-4e83-8c10-57efab1d55c1.png',
                'desc': 'Bancada artesanal portuguesa'
            },
            'public/gallery/authentic/ferramentas-centenarias.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/f8b0a842-6b3b-4c42-a6b2-6c31d8db9f5e.png',
                'desc': 'Ferramentas centenárias patinadas'
            },
            'public/gallery/authentic/prata-925-raw-process.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/7e9f8c2a-4b5d-4c87-a1f3-9b6e7c8d4f92.png',
                'desc': 'Prata 925 raw - metal líquido no molde'
            },
            'public/gallery/authentic/lapidacao-progressao.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/a8b9c4d7-5e2f-4a93-b6c1-8d7e9f0a3b54.png',
                'desc': 'Lapidação progressão - bruto ao polido'
            },
            
            # === HARMONIA NATURAL ===
            'public/gallery/authentic/flora-dark-simbiose.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/c6d9e2f5-8a1b-4c73-9f4e-7b8c5d6a9e32.png',
                'desc': 'Flora dark - musgos sobre pedra'
            },
            'public/gallery/authentic/quaternario-sagrado.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/e4f7a0b3-6c9d-4e85-a2f6-9c7b8e5a4d71.png',
                'desc': 'Quaternário - 4 pedras harmonia'
            },
            
            # === DETALHES TÉCNICOS ===
            'public/gallery/authentic/macro-veios-tigre.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/f8a1b4c7-9d0e-4f63-b5c8-6a9d2e7f0c31.png',
                'desc': 'Macro - veios dourados olho-de-tigre'
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
        
        if self.errors == 0:
            print("🎉 AUTHENTIC GALLERY DOWNLOAD COMPLETE!")
            print()
            print("📋 NEXT STEPS:")
            print("1. Run: npm run optimize-gallery")
            print("2. Test gallery at: http://localhost:3000/galeria")
            print("3. Commit authentic assets to repository")
            print()
            print("✨ READY TO SHOWCASE PURE DARK NATURE AUTHENTICITY!")
        else:
            print(f"⚠️  Download completed with {self.errors} errors.")
            print("Check network connection and retry failed downloads.")

# Execute the authentic downloader
if __name__ == "__main__":
    downloader = AuthenticGalleryDownloader()
    downloader.download_all_authentic_assets()

