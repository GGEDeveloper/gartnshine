#!/usr/bin/env python3
"""
GONZAGA'S ART & SHINE - Asset Downloader
Downloads product images and backgrounds from S3
Preserves originals in aa-temporary/
"""

import requests
import os
from urllib.parse import urlparse
from datetime import datetime

# URLs das imagens (substituir pelos URLs reais)
images = {
    # Backgrounds
    'public/images/backgrounds/onyx-hero-bg.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/284ad94f-2ead-4e79-af36-0148feb12785.png',
    'public/images/backgrounds/tiger-eye-hero-bg.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/3edac26b-122c-4016-86f4-1273e7c6112f.png',
    'public/images/backgrounds/amethyst-hero-bg.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8c3961db-9dfd-44cc-8119-b468d8c4f38d.png',
    'public/images/backgrounds/turquoise-hero-bg.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/1b3183a5-f9e2-4a04-b586-68e2d7e03277.png',
    
    # Produtos Ónix
    'public/uploads/products/ONIX-002.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/64550e71-64ff-480a-a6a0-8384d6983380.png',
    'public/uploads/products/ONIX-003.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/a325efb9-f989-448b-8ee9-7c35c843a844.png',
    'public/uploads/products/ONIX-004.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/b5279893-0755-490c-a33d-f89b511c9db9.png',
    
    # Produtos Olho-de-tigre
    'public/uploads/products/TIGER-002.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/eeaa90be-1ce0-47f7-8d95-6c80c8d6fb50.png',
    'public/uploads/products/TIGER-003.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/08391044-b06e-4477-8ca8-3da0d776b779.png',
    'public/uploads/products/TIGER-004.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/48f04756-35f7-4cfe-9786-7b502a596d79.png',
    
    # Produtos Ametista
    'public/uploads/products/AMETHYST-001.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/c6cd53bd-5987-40cb-9c4c-1739ffb250b7.png',
    'public/uploads/products/AMETHYST-002.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/ab56af89-f927-4264-9510-91080aa4fc4f.png',
    'public/uploads/products/AMETHYST-003.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/a9c8e5e7-837e-4740-a15e-1c003e33e96c.png',
    'public/uploads/products/AMETHYST-004.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/c1c9cde0-2e8b-4214-a507-5b7ecf81d24b.png',
    
    # Produtos Turquesa
    'public/uploads/products/TURQUOISE-001.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/cc93535c-4cb1-49fb-9d48-938ad1849223.png',
    'public/uploads/products/TURQUOISE-002.jpg': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8062e2d8-1f09-43f8-a91b-68c184ba24e3.png'
}

def download_images():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M')
    stats = {
        'success': 0,
        'failed': 0,
        'total': len(images)
    }
    
    print("🚀 GONZAGA'S ART & SHINE - Asset Downloader")
    print("=" * 60)
    print(f"📦 Total assets to download: {len(images)}")
    print(f"📁 Timestamp: {timestamp}")
    print("")
    
    for local_path, url in images.items():
        # Criar diretório se não existir
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # Também salvar em aa-temporary (backup/original)
        backup_path = f"aa-temporary/assets-{timestamp}/{local_path.split('/')[-1]}"
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        
        try:
            # Download
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                # Salvar no destino
                with open(local_path, 'wb') as f:
                    f.write(response.content)
                
                # Salvar backup em aa-temporary
                with open(backup_path, 'wb') as f:
                    f.write(response.content)
                
                size_kb = len(response.content) / 1024
                print(f"✅ {local_path}")
                print(f"   Size: {size_kb:.1f}KB | Backup: {backup_path}")
                stats['success'] += 1
            else:
                print(f"❌ {local_path}")
                print(f"   HTTP {response.status_code}")
                stats['failed'] += 1
                
        except Exception as e:
            print(f"❌ {local_path}")
            print(f"   Error: {str(e)}")
            stats['failed'] += 1
        
        print("")
    
    print("=" * 60)
    print(f"✅ Success: {stats['success']}/{stats['total']}")
    print(f"❌ Failed: {stats['failed']}/{stats['total']}")
    print(f"📁 Backups saved to: aa-temporary/assets-{timestamp}/")
    print("")
    
    if stats['success'] == stats['total']:
        print("🎉 All assets downloaded successfully!")
    elif stats['success'] > 0:
        print("⚠️  Some assets downloaded, check failed items above")
    else:
        print("❌ All downloads failed, check network connection")
    
    return stats

if __name__ == "__main__":
    download_images()

