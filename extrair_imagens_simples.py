#!/usr/bin/env python3
import os
import sys
import shutil
import zipfile
import tempfile

def extrair_imagens(arquivo_ods, pasta_saida='imagens_produtos'):
    """
    Extrai imagens de um arquivo ODS de forma simples.
    """
    # Cria diretório de saída se não existir
    os.makedirs(pasta_saida, exist_ok=True)
    
    # Cria um diretório temporário para extrair o conteúdo do ODS
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Extraindo {arquivo_ods}...")
        
        try:
            # Extrai o conteúdo do arquivo ODS (que é um ZIP)
            with zipfile.ZipFile(arquivo_ods, 'r') as zip_ref:
                zip_ref.extractall(tmpdir)
            
            # Encontra a pasta de imagens
            imagens_dir = None
            for root, dirs, files in os.walk(tmpdir):
                if 'Pictures' in dirs:
                    imagens_dir = os.path.join(root, 'Pictures')
                    break
            
            if not imagens_dir or not os.path.exists(imagens_dir):
                print("Procurando por imagens em todo o diretório...")
                # Se não encontrar a pasta Pictures, procura por arquivos de imagem
                for root, dirs, files in os.walk(tmpdir):
                    for file in files:
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                            imagens_dir = root
                            break
                    if imagens_dir:
                        break
            
            if not imagens_dir or not os.path.exists(imagens_dir):
                print("Erro: Nenhuma imagem encontrada no arquivo ODS.")
                print("Estrutura do arquivo:")
                for root, dirs, files in os.walk(tmpdir):
                    level = root.replace(tmpdir, '').count(os.sep)
                    indent = ' ' * 4 * (level)
                    print('{}{}/'.format(indent, os.path.basename(root)))
                    subindent = ' ' * 4 * (level + 1)
                    for f in files[:5]:  # Mostra apenas os primeiros 5 arquivos
                        print('{}{}'.format(subindent, f))
                    if len(files) > 5:
                        print('{}... e mais {} arquivos'.format(subindent, len(files) - 5))
                return
            
            print(f"Encontradas imagens em: {imagens_dir}")
            
            # Copia todas as imagens para a pasta de saída
            contador = 0
            for root, dirs, files in os.walk(imagens_dir):
                for file in files:
                    if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                        src_path = os.path.join(root, file)
                        dest_path = os.path.join(pasta_saida, f"imagem_{contador:03d}_{file}")
                        shutil.copy2(src_path, dest_path)
                        print(f"Copiado: {file} -> {os.path.basename(dest_path)}")
                        contador += 1
            
            if contador == 0:
                print("Nenhuma imagem encontrada no diretório de imagens.")
            else:
                print(f"\nExtração concluída! {contador} imagens salvas em: {os.path.abspath(pasta_saida)}")
                
        except Exception as e:
            print(f"Erro ao processar o arquivo ODS: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python extrair_imagens_simples.py <caminho_para_arquivo.ods> [pasta_saida]")
        sys.exit(1)
    
    arquivo_ods = sys.argv[1]
    pasta_saida = sys.argv[2] if len(sys.argv) > 2 else 'imagens_produtos'
    
    if not os.path.exists(arquivo_ods):
        print(f"Erro: O arquivo '{arquivo_ods}' não foi encontrado.")
        sys.exit(1)
    
    extrair_imagens(arquivo_ods, pasta_saida)
