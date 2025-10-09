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
        
        # Definir todos os assets NOVOS (apenas os que ainda não existem)
        assets = {
            # === PRODUTOS AMETISTA NOVOS ===
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
            
            # === PRODUTOS TURQUESA NOVO ===
            'public/uploads/products/TURQUOISE-RING-001.jpg': {
                'url': 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/6c63501f-2070-485b-97c1-ea1c3af17a73.png',
                'desc': 'Anel Turquesa Proteção - Principal'
            }
        }
        
        # Criar diretórios
        self.create_directories()
        print()
        
        # Download todos os assets
        print("🖼️  INICIANDO DOWNLOAD DOS NOVOS ASSETS...")
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
            print("1. Inserir produtos no DB")
            print("2. Adicionar CSS refinements")
            print("3. Testar URLs dos produtos no browser")
            print("4. Commit e push para repositório")
        else:
            print(f"⚠️  Download completo com {self.errors} erros.")
            print("Verificar conectividade e tentar novamente.")

# Executar o downloader
if __name__ == "__main__":
    downloader = DarkNatureAssetsDownloader()
    downloader.download_all_assets()

