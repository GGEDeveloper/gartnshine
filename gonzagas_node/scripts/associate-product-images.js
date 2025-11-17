/**
 * Script para associar imagens de produtos à base de dados
 * Lê todas as imagens da pasta public/media/products/ e associa aos produtos pela referência
 */

const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');

const PRODUCTS_IMAGES_DIR = path.join(__dirname, '..', 'public', 'media', 'products');

async function associateProductImages() {
  console.log('=== Iniciando associação de imagens aos produtos ===');
  console.log(`Diretório de imagens: ${PRODUCTS_IMAGES_DIR}`);
  
  let totalImages = 0;
  let productsUpdated = 0;
  let productsCreated = 0;
  let errors = 0;
  let notFound = 0;
  
  try {
    // Verifica se o diretório existe
    try {
      await fs.access(PRODUCTS_IMAGES_DIR);
    } catch (error) {
      console.error(`❌ Diretório não encontrado: ${PRODUCTS_IMAGES_DIR}`);
      return;
    }
    
    // Lê todos os arquivos do diretório
    const files = await fs.readdir(PRODUCTS_IMAGES_DIR);
    
    // Filtra apenas arquivos de imagem
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    console.log(`\n📁 Total de imagens encontradas: ${imageFiles.length}`);
    
    // Processa cada imagem
    for (const file of imageFiles) {
      totalImages++;
      
      // Extrai a referência do nome do arquivo (remove a extensão)
      const reference = path.parse(file).name;
      
      try {
        // Busca o produto no banco de dados pela referência
        const [products] = await pool.query(
          'SELECT id FROM products WHERE reference = ?',
          [reference]
        );
        
        if (products.length === 0) {
          console.log(`⚠️  Produto não encontrado para a referência: ${reference} (${file})`);
          notFound++;
          continue;
        }
        
        const productId = products[0].id;
        
        // Verifica se já existe uma imagem primária para este produto
        const [existingImages] = await pool.query(
          'SELECT id, image_filename FROM product_images WHERE product_id = ? AND is_primary = 1',
          [productId]
        );
        
        if (existingImages.length > 0) {
          // Atualiza a imagem existente se o nome do arquivo for diferente
          if (existingImages[0].image_filename !== file) {
            await pool.query(
              'UPDATE product_images SET image_filename = ? WHERE product_id = ? AND is_primary = 1',
              [file, productId]
            );
            console.log(`✅ Imagem atualizada: ${file} -> Produto ID ${productId} (${reference})`);
            productsUpdated++;
          } else {
            // Imagem já está correta, não precisa atualizar
            console.log(`ℹ️  Imagem já associada: ${file} -> Produto ID ${productId} (${reference})`);
          }
        } else {
          // Verifica se existe alguma imagem (não primária) para este produto
          const [anyImages] = await pool.query(
            'SELECT id FROM product_images WHERE product_id = ?',
            [productId]
          );
          
          if (anyImages.length > 0) {
            // Existe imagem mas não é primária, atualiza para primária
            await pool.query(
              'UPDATE product_images SET is_primary = 1, image_filename = ? WHERE product_id = ? LIMIT 1',
              [file, productId]
            );
            console.log(`✅ Imagem atualizada para primária: ${file} -> Produto ID ${productId} (${reference})`);
            productsUpdated++;
          } else {
            // Não existe nenhuma imagem, insere uma nova como primária
            await pool.query(
              'INSERT INTO product_images (product_id, image_filename, is_primary, sort_order) VALUES (?, ?, 1, 1)',
              [productId, file]
            );
            console.log(`✨ Imagem criada: ${file} -> Produto ID ${productId} (${reference})`);
            productsCreated++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar imagem ${file}:`, error.message);
        errors++;
      }
    }
    
    // Exibe resumo
    console.log('\n=== Resumo da Associação ===');
    console.log(`📊 Total de imagens processadas: ${totalImages}`);
    console.log(`✨ Produtos com nova imagem criada: ${productsCreated}`);
    console.log(`✅ Produtos com imagem atualizada: ${productsUpdated}`);
    console.log(`⚠️  Produtos não encontrados: ${notFound}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`\n✅ Total de produtos com imagens associadas: ${productsCreated + productsUpdated}`);
    
  } catch (error) {
    console.error('❌ Erro durante o processamento:', error);
    throw error;
  }
  
  console.log('\n=== Processo concluído ===');
}

// Executa o script
if (require.main === module) {
  associateProductImages()
    .then(() => {
      console.log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

module.exports = { associateProductImages };

