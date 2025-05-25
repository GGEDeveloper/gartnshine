#!/usr/bin/env python3
import os
import shutil
import pymysql
from pathlib import Path

def conectar_banco():
    """Estabelece conexão com o banco de dados."""
    try:
        conexao = pymysql.connect(
            host='localhost',
            user='admin',
            password='2585',
            database='gonzagas_db',
            cursorclass=pymysql.cursors.DictCursor
        )
        return conexao
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

def associar_imagens():
    # Caminhos
    dir_imagens = 'imagens_por_referencia'
    dir_destino = 'gonzagas_node/public/uploads/products/'
    
    # Garante que o diretório de destino existe
    os.makedirs(dir_destino, exist_ok=True)
    
    # Conecta ao banco de dados
    conexao = conectar_banco()
    if not conexao:
        return
    
    cursor = conexao.cursor()
    
    try:
        # Contadores para estatísticas
        total_imagens = 0
        produtos_atualizados = 0
        erros = 0
        
        # Para cada imagem no diretório
        for arquivo in os.listdir(dir_imagens):
            if not arquivo.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                continue
                
            # Extrai a referência do nome do arquivo (remove a extensão)
            referencia = os.path.splitext(arquivo)[0]
            total_imagens += 1
            
            try:
                # Busca o ID do produto com esta referência
                cursor.execute("SELECT id FROM products WHERE reference = %s", (referencia,))
                produto = cursor.fetchone()
                
                if not produto:
                    print(f"Produto não encontrado para a referência: {referencia}")
                    erros += 1
                    continue
                
                produto_id = produto['id']
                
                # Caminho de origem e destino da imagem
                origem = os.path.join(dir_imagens, arquivo)
                destino = os.path.join(dir_destino, arquivo)
                
                # Copia a imagem para o diretório de uploads
                shutil.copy2(origem, destino)
                
                # Verifica se já existe uma imagem para este produto
                cursor.execute("""
                    SELECT id FROM product_images 
                    WHERE product_id = %s AND is_primary = 1
                """, (produto_id,))
                
                if cursor.fetchone():
                    # Atualiza a imagem existente
                    cursor.execute("""
                        UPDATE product_images 
                        SET image_filename = %s 
                        WHERE product_id = %s AND is_primary = 1
                    """, (arquivo, produto_id))
                else:
                    # Insere uma nova imagem
                    cursor.execute("""
                        INSERT INTO product_images 
                        (product_id, image_filename, is_primary, sort_order) 
                        VALUES (%s, %s, 1, 1)
                    """, (produto_id, arquivo))
                
                produtos_atualizados += 1
                print(f"Imagem associada: {arquivo} -> Produto ID {produto_id} ({referencia})")
                
            except Exception as e:
                print(f"Erro ao processar imagem {arquivo}: {e}")
                erros += 1
                
        # Confirma as alterações no banco de dados
        conexao.commit()
        
        # Exibe um resumo
        print("\n=== Resumo da Importação ===")
        print(f"Total de imagens processadas: {total_imagens}")
        print(f"Produtos atualizados: {produtos_atualizados}")
        print(f"Erros: {erros}")
        
    except Exception as e:
        print(f"Erro ao acessar o banco de dados: {e}")
        conexao.rollback()
    finally:
        cursor.close()
        conexao.close()

if __name__ == "__main__":
    print("=== Iniciando associação de imagens aos produtos ===")
    associar_imagens()
    print("=== Processo concluído ===")
