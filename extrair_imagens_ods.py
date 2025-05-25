#!/usr/bin/env python3
import os
import sys
import shutil
import zipfile
import tempfile
from xml.etree import ElementTree as ET

def extrair_imagens_ods(arquivo_ods, pasta_saida='imagens_produtos'):
    """
    Extrai imagens de um arquivo ODS e as salva com base na referência da coluna B.
    """
    # Cria diretório de saída se não existir
    os.makedirs(pasta_saida, exist_ok=True)
    
    # Cria um diretório temporário para extrair o conteúdo do ODS
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Extraindo {arquivo_ods}...")
        
        # Extrai o conteúdo do arquivo ODS (que é um ZIP)
        with zipfile.ZipFile(arquivo_ods, 'r') as zip_ref:
            zip_ref.extractall(tmpdir)
        
        # Lê o arquivo content.xml que contém os dados da planilha
        content_path = os.path.join(tmpdir, 'content.xml')
        
        # Analisa o XML para encontrar as referências das imagens
        print("Processando referências das imagens...")
        
        # Dicionário para mapear posições das células para nomes de arquivo de imagem
        celulas_imagens = {}
        
        # Pasta onde as imagens extraídas estão
        imagens_dir = os.path.join(tmpdir, 'Pictures')
        
        # Se não existir a pasta de imagens, tenta encontrar em outro local
        if not os.path.exists(imagens_dir):
            for root, dirs, files in os.walk(tmpdir):
                if 'Pictures' in dirs:
                    imagens_dir = os.path.join(root, 'Pictures')
                    break
        
        if not os.path.exists(imagens_dir):
            print("Erro: Pasta 'Pictures' não encontrada no arquivo ODS.")
            return
        
        # Lê o content.xml para mapear as imagens
        try:
            tree = ET.parse(content_path)
            root = tree.getroot()
            
            # Define os namespaces XML
            namespaces = {
                'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
                'draw': 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
                'office': 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
                'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
            }
            
            # Encontra todas as células com imagens
            for cell in root.findall('.//table:table-cell', namespaces):
                # Verifica se a célula contém uma imagem
                image = cell.find('.//draw:image', namespaces)
                if image is not None:
                    # Obtém a posição da célula
                    col = cell.get('{%s}number-columns-repeated' % namespaces['table'], 1)
                    # Obtém a referência da coluna B (índice 1)
                    # Precisa encontrar a linha pai para obter a referência
                    row = cell.find('..')
                    if row is not None:
                        # Encontra todas as células da linha
                        cells_in_row = row.findall('table:table-cell', namespaces)
                        if len(cells_in_row) > 1:  # Pelo menos coluna B existe
                            ref_cell = cells_in_row[1]  # Coluna B (índice 1)
                            # Obtém o texto da célula de referência
                            ref_text = ''
                            p = ref_cell.find('text:p', namespaces)
                            if p is not None and p.text:
                                ref_text = p.text.strip()
                            
                            if ref_text:  # Só processa se houver uma referência
                                # Obtém o nome do arquivo de imagem
                                href = image.get('{%s}href' % namespaces['xlink'])
                                if href:
                                    img_name = os.path.basename(href)
                                    celulas_imagens[img_name] = ref_text
            
            # Copia as imagens para a pasta de saída com o nome da referência
            print(f"Copiando imagens para {pasta_saida}...")
            for img_file in os.listdir(imagens_dir):
                if img_file in celulas_imagens:
                    ref = celulas_imagens[img_file]
                    src_path = os.path.join(imagens_dir, img_file)
                    ext = os.path.splitext(img_file)[1]
                    dest_path = os.path.join(pasta_saida, f"{ref}{ext}")
                    shutil.copy2(src_path, dest_path)
                    print(f"Copiado: {img_file} -> {ref}{ext}")
                
            print(f"\nExtração concluída! Imagens salvas em: {os.path.abspath(pasta_saida)}")
            
        except Exception as e:
            print(f"Erro ao processar o arquivo ODS: {e}")
            print("Certifique-se de que o arquivo não está corrompido e tente novamente.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python extrair_imagens_ods.py <caminho_para_arquivo.ods> [pasta_saida]")
        sys.exit(1)
    
    arquivo_ods = sys.argv[1]
    pasta_saida = sys.argv[2] if len(sys.argv) > 2 else 'imagens_produtos'
    
    if not os.path.exists(arquivo_ods):
        print(f"Erro: O arquivo '{arquivo_ods}' não foi encontrado.")
        sys.exit(1)
    
    extrair_imagens_ods(arquivo_ods, pasta_saida)
