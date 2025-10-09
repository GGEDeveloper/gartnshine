#!/usr/bin/env python3
"""
GONZAGA ART & SHINE - DARK NATURE ASSETS LOTE 1
Download dos primeiros 4 assets validados
"""

import requests
import os
from pathlib import Path
import time

class DarkNatureAssetsLote1:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.downloaded = 0
        self.errors = 0
        self.total_size = 0
    
    def create_structure(self):
        """Criar estrutura para assets Lote 1"""
        directories = [
            'public/gallery/dark-nature/lote1',
            'public/gallery/dark-nature/hero',
            'public/gallery/dark-nature/transformacao',
            'public/gallery/dark-nature/natureza'
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"📁 Estrutura criada: {directory}")
    
    def download_asset(self, url, filepath, description):
        """Download individual asset com validação"""
        try:
            print(f"⬇️  {description}")
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Validar tamanho
            content_length = len(response.content)
            if content_length < 10240:  # Mínimo 10KB
                raise ValueError(f"Asset muito pequeno: {content_length} bytes")
            
            # Salvar asset
            Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            self.total_size += content_length
            self.downloaded += 1
            
            print(f"✅ {Path(filepath).name}: {self.format_bytes(content_length)}")
            return True
            
        except Exception as e:
            self.errors += 1
            print(f"❌ Erro: {str(e)}")
            return False
    
    def format_bytes(self, bytes_size):
        """Formatar bytes para leitura"""
        for unit in ['B', 'KB', 'MB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} GB"
    
    def download_lote1_assets(self):
        """Download completo Lote 1"""
        
        print("🌑 GONZAGA ART & SHINE - DARK NATURE ASSETS LOTE 1")
        print("=" * 60)
        print("📸 Download dos primeiros 4 assets validados")
        print()
        
        # Assets Lote 1 confirmados
        assets_lote1 = {
            'public/gallery/dark-nature/hero/caverna-primordial-hero.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/e3a26d7d-0c13-4bbd-820a-de58a3c8d14f.png',
                'desc': 'Hero Caverna - Interior natural cristais sombras'
            },
            'public/gallery/dark-nature/transformacao/prata-abracando-onix.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/f13462db-6f5a-4bd7-9664-4b9704f894f0.png',
                'desc': 'Prata Líquida - Metal abraçando ónix alquímico'
            },
            'public/gallery/dark-nature/transformacao/bancada-artesao-penumbra.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/d84a5cb7-babb-445e-ace8-70d6fd82dcb4.png',
                'desc': 'Bancada Artesão - Mesa ancestral sombras atelier'
            },
            'public/gallery/dark-nature/natureza/quaternario-natural-organic.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/b20c9a65-169d-4f55-9c92-af0f6650fe8a.png',
                'desc': 'Quaternário Natural - 4 pedras orgânico musgo'
            }
        }
        
        # Criar estrutura
        self.create_structure()
        print()
        
        # Download assets
        print("📥 INICIANDO DOWNLOAD ASSETS LOTE 1...")
        print()
        
        start_time = time.time()
        
        for filepath, asset_data in assets_lote1.items():
            success = self.download_asset(
                asset_data['url'],
                filepath,
                asset_data['desc']
            )
            
            if success:
                time.sleep(1)  # Rate limiting respeitoso
        
        duration = time.time() - start_time
        
        # Relatório final
        print()
        print("📊 RELATÓRIO DOWNLOAD LOTE 1:")
        print("=" * 40)
        print(f"✅ Assets descarregados: {self.downloaded}/4")
        print(f"❌ Erros: {self.errors}")
        print(f"💾 Tamanho total: {self.format_bytes(self.total_size)}")
        print(f"⏱️  Tempo: {duration:.1f}s")
        print()
        
        if self.errors == 0:
            print("🎉 LOTE 1 COMPLETO!")
            print()
            print("📋 PRÓXIMOS PASSOS:")
            print("1. Criar próximos 4 assets (Lote 2)")
            print("2. Implementar na galeria")
            print("3. Testar visual no site")
            print()
            print("🌑 DARK NATURE ASSETS LOTE 1 PRONTOS! 💎")
        else:
            print(f"⚠️  {self.errors} assets falharam. Verificar e tentar novamente.")

# Executar download Lote 1
if __name__ == "__main__":
    downloader = DarkNatureAssetsLote1()
    downloader.download_lote1_assets()

