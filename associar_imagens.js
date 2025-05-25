const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
const { promisify } = require('util');

// Configurações do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: '2585',
  database: 'gonzagas_db',
  connectionLimit: 10
};

// Caminhos
const IMAGES_DIR = path.join(__dirname, 'imagens_por_referencia');
const UPLOAD_DIR = path.join(__dirname, 'gonzagas_node', 'public', 'uploads', 'products');

async function main() {
  console.log('=== Iniciando associação de imagens aos produtos ===');
  
  // Garante que o diretório de uploads existe
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  
  // Conecta ao banco de dados
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Contadores para estatísticas
    let totalImagens = 0;
    let produtosAtualizados = 0;
    let erros = 0;
    
    // Lê o diretório de imagens
    const files = await fs.readdir(IMAGES_DIR);
    
    for (const file of files) {
      // Verifica se é um arquivo de imagem
      if (!/\.(jpg|jpeg|png|gif)$/i.test(file)) {
        continue;
      }
      
      totalImagens++;
      
      // Extrai a referência do nome do arquivo (remove a extensão)
      const referencia = path.parse(file).name;
      
      try {
        // Busca o produto no banco de dados
        const [products] = await connection.execute(
          'SELECT id FROM products WHERE reference = ?',
          [referencia]
        );
        
        if (products.length === 0) {
          console.log(`Produto não encontrado para a referência: ${referencia}`);
          erros++;
          continue;
        }
        
        const productId = products[0].id;
        
        // Caminhos de origem e destino
        const origem = path.join(IMAGES_DIR, file);
        const destino = path.join(UPLOAD_DIR, file);
        
        // Copia a imagem para o diretório de uploads
        await fs.copyFile(origem, destino);
        
        // Verifica se já existe uma imagem para este produto
        const [existingImages] = await connection.execute(
          'SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1',
          [productId]
        );
        
        if (existingImages.length > 0) {
          // Atualiza a imagem existente
          await connection.execute(
            'UPDATE product_images SET image_filename = ? WHERE product_id = ? AND is_primary = 1',
            [file, productId]
          );
        } else {
          // Insere uma nova imagem
          await connection.execute(
            'INSERT INTO product_images (product_id, image_filename, is_primary, sort_order) VALUES (?, ?, 1, 1)',
            [productId, file]
          );
        }
        
        produtosAtualizados++;
        console.log(`Imagem associada: ${file} -> Produto ID ${productId} (${referencia})`);
        
      } catch (error) {
        console.error(`Erro ao processar imagem ${file}:`, error.message);
        erros++;
      }
    }
    
    // Exibe um resumo
    console.log('\n=== Resumo da Importação ===');
    console.log(`Total de imagens processadas: ${totalImagens}`);
    console.log(`Produtos atualizados: ${produtosAtualizados}`);
    console.log(`Erros: ${erros}`);
    
  } catch (error) {
    console.error('Erro durante o processamento:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('=== Processo concluído ===');
}

// Executa o script
main().catch(console.error);
