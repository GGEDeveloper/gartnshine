/**
 * Script de diagnóstico para verificar problema de imagens no catálogo
 * Verifica: imagens físicas, registos na BD, produtos sem imagens, etc.
 */

const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');

const PRODUCTS_IMAGES_DIR = path.join(__dirname, '..', 'public', 'media', 'products');

async function diagnoseCatalogImages() {
  console.log('=== DIAGNÓSTICO: Imagens do Catálogo ===\n');
  
  try {
    // 1. Verificar imagens físicas
    console.log('📁 1. VERIFICANDO IMAGENS FÍSICAS...');
    let physicalImages = [];
    try {
      const files = await fs.readdir(PRODUCTS_IMAGES_DIR);
      physicalImages = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
      console.log(`   ✅ Total de imagens físicas: ${physicalImages.length}`);
      console.log(`   📍 Diretório: ${PRODUCTS_IMAGES_DIR}`);
    } catch (error) {
      console.log(`   ❌ Erro ao ler diretório: ${error.message}`);
    }
    
    // 2. Verificar produtos na BD
    console.log('\n📊 2. VERIFICANDO PRODUTOS NA BASE DE DADOS...');
    const [products] = await pool.query(`
      SELECT id, reference, name, is_active, is_catalog_visible 
      FROM products 
      WHERE is_active = 1 AND is_catalog_visible = 1
    `);
    console.log(`   ✅ Total de produtos ativos no catálogo: ${products.length}`);
    
    // 3. Verificar registos na tabela product_images
    console.log('\n🖼️  3. VERIFICANDO REGISTOS NA TABELA product_images...');
    const [imageRecords] = await pool.query(`
      SELECT DISTINCT product_id, COUNT(*) as image_count
      FROM product_images
      GROUP BY product_id
    `);
    console.log(`   ✅ Total de produtos com imagens na BD: ${imageRecords.length}`);
    
    // 4. Verificar produtos SEM imagens na BD
    console.log('\n⚠️  4. PRODUTOS SEM IMAGENS NA BASE DE DADOS...');
    const [productsWithoutImages] = await pool.query(`
      SELECT p.id, p.reference, p.name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.is_active = 1 
        AND p.is_catalog_visible = 1
        AND pi.id IS NULL
      ORDER BY p.reference
      LIMIT 20
    `);
    console.log(`   ⚠️  Total de produtos SEM imagens na BD: ${productsWithoutImages.length}`);
    if (productsWithoutImages.length > 0) {
      console.log('   Primeiros produtos sem imagens:');
      productsWithoutImages.slice(0, 10).forEach(p => {
        console.log(`      - ${p.reference} (ID: ${p.id}): ${p.name}`);
      });
    }
    
    // 5. Verificar produtos COM imagens na BD mas SEM arquivo físico
    console.log('\n🔍 5. VERIFICANDO IMAGENS NA BD SEM ARQUIVO FÍSICO...');
    const [imagesInDB] = await pool.query(`
      SELECT pi.product_id, pi.image_filename, p.reference
      FROM product_images pi
      INNER JOIN products p ON pi.product_id = p.id
      WHERE pi.is_primary = 1
        AND p.is_active = 1
        AND p.is_catalog_visible = 1
    `);
    
    let missingFiles = [];
    for (const img of imagesInDB) {
      const filePath = path.join(PRODUCTS_IMAGES_DIR, img.image_filename);
      try {
        await fs.access(filePath);
      } catch {
        missingFiles.push(img);
      }
    }
    
    console.log(`   ✅ Total de imagens na BD: ${imagesInDB.length}`);
    console.log(`   ❌ Imagens na BD sem arquivo físico: ${missingFiles.length}`);
    if (missingFiles.length > 0) {
      console.log('   Primeiras imagens sem arquivo:');
      missingFiles.slice(0, 10).forEach(img => {
        console.log(`      - ${img.image_filename} (Produto: ${img.reference}, ID: ${img.product_id})`);
      });
    }
    
    // 6. Verificar produtos COM arquivo físico mas SEM registo na BD
    console.log('\n🔍 6. VERIFICANDO ARQUIVOS FÍSICOS SEM REGISTO NA BD...');
    let filesWithoutDB = [];
    for (const file of physicalImages) {
      const reference = path.parse(file).name;
      const [products] = await pool.query(
        'SELECT id FROM products WHERE reference = ?',
        [reference]
      );
      
      if (products.length > 0) {
        const productId = products[0].id;
        const [images] = await pool.query(
          'SELECT id FROM product_images WHERE product_id = ? AND image_filename = ?',
          [productId, file]
        );
        
        if (images.length === 0) {
          filesWithoutDB.push({ file, reference, productId });
        }
      }
    }
    
    console.log(`   ⚠️  Arquivos físicos sem registo na BD: ${filesWithoutDB.length}`);
    if (filesWithoutDB.length > 0) {
      console.log('   Primeiros arquivos sem registo:');
      filesWithoutDB.slice(0, 10).forEach(item => {
        console.log(`      - ${item.file} (Produto: ${item.reference}, ID: ${item.productId})`);
      });
    }
    
    // 7. Verificar query do catálogo (simulação)
    console.log('\n🔍 7. SIMULANDO QUERY DO CATÁLOGO...');
    const [catalogProducts] = await pool.query(`
      SELECT 
        p.id,
        p.reference,
        p.name,
        (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
      FROM products p
      WHERE p.is_active = 1 AND p.is_catalog_visible = 1
      ORDER BY p.featured DESC, p.reference ASC
      LIMIT 20
    `);
    
    const withImages = catalogProducts.filter(p => p.image_url).length;
    const withoutImages = catalogProducts.filter(p => !p.image_url).length;
    
    console.log(`   📊 Amostra de 20 produtos do catálogo:`);
    console.log(`      ✅ Com imagem_url: ${withImages}`);
    console.log(`      ❌ Sem image_url (NULL): ${withoutImages}`);
    
    if (withoutImages > 0) {
      console.log('   Produtos sem image_url na amostra:');
      catalogProducts.filter(p => !p.image_url).slice(0, 5).forEach(p => {
        console.log(`      - ${p.reference} (ID: ${p.id}): ${p.name}`);
      });
    }
    
    // 8. Resumo final
    console.log('\n=== RESUMO DO DIAGNÓSTICO ===');
    console.log(`📁 Imagens físicas: ${physicalImages.length}`);
    console.log(`📊 Produtos ativos no catálogo: ${products.length}`);
    console.log(`🖼️  Produtos com imagens na BD: ${imageRecords.length}`);
    console.log(`⚠️  Produtos SEM imagens na BD: ${productsWithoutImages.length}`);
    console.log(`❌ Imagens na BD sem arquivo: ${missingFiles.length}`);
    console.log(`⚠️  Arquivos físicos sem registo na BD: ${filesWithoutDB.length}`);
    console.log(`\n💡 SOLUÇÃO: Executar script de associação para ${filesWithoutDB.length} arquivos`);
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
    throw error;
  }
}

// Executa o diagnóstico
if (require.main === module) {
  diagnoseCatalogImages()
    .then(() => {
      console.log('\n✅ Diagnóstico concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar diagnóstico:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseCatalogImages };

