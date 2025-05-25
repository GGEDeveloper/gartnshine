#!/usr/bin/env python3
import os
import sys
import csv
import zipfile
import tempfile
import shutil

def extrair_imagens_por_referencia(arquivo_ods, arquivo_csv, pasta_saida='imagens_por_referencia'):
    """
    Extrai imagens do ODS e as salva com o nome da referência do produto.
    """
    # Cria diretório de saída
    os.makedirs(pasta_saida, exist_ok=True)
    
    # Lê o arquivo CSV para obter as referências
    referencias = []
    with open(arquivo_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Pula o cabeçalho
        for linha in reader:
            if len(linha) > 1:  # Garante que há pelo menos 2 colunas
                ref = linha[1].strip()  # Coluna B (índice 1)
                referencias.append(ref)
    
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
                return
            
            print(f"Encontradas imagens em: {imagens_dir}")
            
            # Lista todos os arquivos de imagem
            imagens = []
            for root, dirs, files in os.walk(imagens_dir):
                for file in files:
                    if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                        imagens.append(os.path.join(root, file))
            
            # Ordena as imagens para garantir a ordem correta
            imagens.sort()
            
            # Copia as imagens com os nomes das referências
            for i, img_path in enumerate(imagens):
                if i < len(referencias):
                    ref = referencias[i]
                    ext = os.path.splitext(img_path)[1]
                    dest_path = os.path.join(pasta_saida, f"{ref}{ext}")
                    shutil.copy2(img_path, dest_path)
                    print(f"Copiado: {os.path.basename(img_path)} -> {os.path.basename(dest_path)}")
                else:
                    print(f"Aviso: Mais imagens ({len(imagens)}) do que referências ({len(referencias)}).")
                    break
            
            print(f"\nExtração concluída! {min(len(imagens), len(referencias))} imagens salvas em: {os.path.abspath(pasta_saida)}")
            
        except Exception as e:
            print(f"Erro ao processar o arquivo ODS: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python extrair_imagens_por_referencia.py <caminho_para_arquivo.ods> <caminho_para_arquivo.csv> [pasta_saida]")
        print("Exemplo: python extrair_imagens_por_referencia.py excel1.ods excel1.csv imagens_por_referencia")
        sys.exit(1)
    
    arquivo_ods = sys.argv[1]
    arquivo_csv = sys.argv[2]
    pasta_saida = sys.argv[3] if len(sys.argv) > 3 else 'imagens_por_referencia'
    
    if not os.path.exists(arquivo_ods):
        print(f"Erro: O arquivo '{arquivo_ods}' não foi encontrado.")
        sys.exit(1)
    
    if not os.path.exists(arquivo_csv):
        print(f"Erro: O arquivo '{arquivo_csv}' não foi encontrado.")
        sys.exit(1)
    
    extrair_imagens_por_referencia(arquivo_ods, arquivo_csv, pasta_saida)
