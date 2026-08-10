/**
 * Script para identificar e corrigir imagens quebradas no catálogo
 * 1. Identifica produtos com imagens na BD mas sem arquivo físico
 * 2. Verifica se existe arquivo original (sem sufixo) para reprocessar
 * 3. Reprocessa imagens quando possível
 * 4. Remove registos de imagens inexistentes (como último recurso)
 */

const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');
const { processProductImage } = require('../utils/productImageProcessor');

const PRODUCTS_IMAGES_DIR = path.join(__dirname, '..', 'public', 'media', 'products');

async function fixBrokenImages() {
  console.log('=== CORREÇÃO DE IMAGENS QUEBRADAS ===\n');
  
  try {
    // 1. Identificar produtos com imagens na BD mas sem arquivo físico
    console.log('🔍 1. IDENTIFICANDO IMAGENS QUEBRADAS...');
    const [imagesInDB] = await pool.query(`
      SELECT pi.id as image_id, pi.product_id, pi.image_filename, p.reference, p.name
      FROM product_images pi
      INNER JOIN products p ON pi.product_id = p.id
      WHERE pi.is_primary = 1
        AND p.is_active = 1
        AND p.is_catalog_visible = 1
    `);
    
    let brokenImages = [];
    for (const img of imagesInDB) {
      const filePath = path.join(PRODUCTS_IMAGES_DIR, img.image_filename);
      try {
        await fs.access(filePath);
      } catch {
        brokenImages.push(img);
      }
    }
    
    console.log(`   ✅ Total de imagens na BD: ${imagesInDB.length}`);
    console.log(`   ❌ Imagens quebradas (sem arquivo): ${brokenImages.length}`);
    
    if (brokenImages.length === 0) {
      console.log('\n✅ Nenhuma imagem quebrada encontrada. Nada a fazer.');
      return;
    }
    
    console.log('\n   Lista de imagens quebradas:');
    brokenImages.forEach(img => {
      console.log(`      - ${img.image_filename} (Produto: ${img.reference}, ID: ${img.product_id})`);
    });
    
    // 2. Verificar se existe arquivo original para reprocessar
    console.log('\n🔍 2. VERIFICANDO ARQUIVOS ORIGINAIS...');
    let canReprocess = [];
    let noOriginalFile = [];
    
    for (const img of brokenImages) {
      // Tenta encontrar arquivo original (sem sufixo de tamanho)
      const baseName = img.image_filename.replace(/-full\.(jpg|jpeg|png|webp)$/i, '.$1')
                                          .replace(/-medium\.(jpg|jpeg|png|webp)$/i, '.$1')
                                          .replace(/-small\.(jpg|jpeg|png|webp)$/i, '.$1')
                                          .replace(/-thumb\.(jpg|jpeg|png|webp)$/i, '.$1');
      
      const originalPath = path.join(PRODUCTS_IMAGES_DIR, baseName);
      
      try {
        await fs.access(originalPath);
        canReprocess.push({ ...img, originalFile: baseName });
        console.log(`      ✅ ${img.image_filename} → Original encontrado: ${baseName}`);
      } catch {
        noOriginalFile.push(img);
        console.log(`      ❌ ${img.image_filename} → Original não encontrado: ${baseName}`);
      }
    }
    
    console.log(`\n   📊 Resumo:`);
    console.log(`      ✅ Podem ser reprocessados: ${canReprocess.length}`);
    console.log(`      ❌ Sem arquivo original: ${noOriginalFile.length}`);
    
    // 3. Reprocessar imagens quando possível
    if (canReprocess.length > 0) {
      console.log('\n🔄 3. REPROCESSANDO IMAGENS...');
      
      for (const item of canReprocess) {
        try {
          console.log(`      Reprocessando ${item.originalFile} (Produto: ${item.reference})...`);
          const result = await processProductImage(item.originalFile);
          
          if (result.ok) {
            console.log(`         ✅ Sucesso! Geradas: ${result.generated.join(', ')}`);
          } else {
            console.log(`         ❌ Erro: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          console.log(`         ❌ Erro ao reprocessar: ${error.message}`);
        }
      }
    }
    
    // 4. Remover registos de imagens inexistentes (como último recurso)
    if (noOriginalFile.length > 0) {
      console.log('\n⚠️  4. REMOVENDO REGISTOS DE IMAGENS INEXISTENTES...');
      console.log('   (Apenas para produtos sem arquivo original)');
      
      for (const img of noOriginalFile) {
        try {
          console.log(`      Removendo registo: ${img.image_filename} (Produto: ${img.reference})...`);
          
          await pool.query(
            'DELETE FROM product_images WHERE id = ?',
            [img.image_id]
          );
          
          console.log(`         ✅ Registo removido`);
        } catch (error) {
          console.log(`         ❌ Erro ao remover registo: ${error.message}`);
        }
      }
    }
    
    // 5. Verificar resultado final
    console.log('\n🔍 5. VERIFICANDO RESULTADO FINAL...');
    const [finalCheck] = await pool.query(`
      SELECT pi.product_id, pi.image_filename, p.reference
      FROM product_images pi
      INNER JOIN products p ON pi.product_id = p.id
      WHERE pi.is_primary = 1
        AND p.is_active = 1
        AND p.is_catalog_visible = 1
    `);
    
    let stillBroken = [];
    for (const img of finalCheck) {
      const filePath = path.join(PRODUCTS_IMAGES_DIR, img.image_filename);
      try {
        await fs.access(filePath);
      } catch {
        stillBroken.push(img);
      }
    }
    
    console.log(`   ✅ Total de imagens após correção: ${finalCheck.length}`);
    console.log(`   ❌ Imagens ainda quebradas: ${stillBroken.length}`);
    
    if (stillBroken.length > 0) {
      console.log('\n   Imagens ainda quebradas:');
      stillBroken.forEach(img => {
        console.log(`      - ${img.image_filename} (Produto: ${img.reference})`);
      });
    }
    
    console.log('\n=== RESUMO FINAL ===');
    console.log(`🔍 Imagens quebradas inicialmente: ${brokenImages.length}`);
    console.log(`✅ Reprocessadas com sucesso: ${canReprocess.length}`);
    console.log(`🗑️  Registros removidos: ${noOriginalFile.length}`);
    console.log(`❌ Ainda quebradas: ${stillBroken.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
    throw error;
  }
}

// Executa a correção
if (require.main === module) {
  fixBrokenImages()
    .then(() => {
      console.log('\n✅ Correção concluída');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar correção:', error);
      process.exit(1);
    });
}

module.exports = { fixBrokenImages };
