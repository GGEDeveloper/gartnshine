const { runCatalogQuery } = require('./services/catalogQueryService');

async function testPerformance() {
  console.log('=== Teste de Performance do Catálogo ===\n');
  
  const testConfig = {
    hideOutOfStock: false,
    expandedFamilyIds: [],
    price_range: null,
    search: null,
    colorsNormalized: [],
    materialsNormalized: [],
    stylesNormalized: [],
    sortType: 'default',
    page: 1,
    perPage: 24,
    settings: { prices_include_tax: true, tax_rate: 23 }
  };

  console.log('Executando query do catálogo...');
  const start = Date.now();
  
  try {
    const result = await runCatalogQuery(testConfig);
    const duration = Date.now() - start;
    
    console.log(`✅ Query executada com sucesso em ${duration}ms`);
    console.log(`📦 Produtos retornados: ${result.products.length}`);
    console.log(`📄 Página: ${result.page}/${result.total_pages}`);
    console.log(`🔢 Total filtrado: ${result.count}`);
    
    // Verificar se imagens foram carregadas
    const productsWithImages = result.products.filter(p => p.image_url);
    console.log(`🖼️ Produtos com imagens: ${productsWithImages.length}/${result.products.length}`);
    
    // Verificar estrutura dos dados
    if (result.products.length > 0) {
      const sampleProduct = result.products[0];
      console.log('\n📋 Produto de exemplo:');
      console.log(`   - ID: ${sampleProduct.id}`);
      console.log(`   - Nome: ${sampleProduct.name}`);
      console.log(`   - Referência: ${sampleProduct.reference}`);
      console.log(`   - Imagem: ${sampleProduct.image_url || 'Sem imagem'}`);
      console.log(`   - Slug: ${sampleProduct.slug}`);
    }
    
    // Testar cache de imagens (segunda chamada deve ser mais rápida)
    console.log('\n🔄 Testando cache de imagens (segunda chamada)...');
    const start2 = Date.now();
    const result2 = await runCatalogQuery(testConfig);
    const duration2 = Date.now() - start2;
    
    console.log(`✅ Segunda query executada em ${duration2}ms`);
    if (duration2 < duration) {
      console.log(`🚀 Melhoria de performance: ${duration - duration2}ms (${((duration - duration2) / duration * 100).toFixed(1)}%)`);
    } else {
      console.log(`⚠️ Segunda chamada não foi mais rápida (pode ser devido a cache frio ou variações de rede)`);
    }
    
    console.log('\n✅ Validação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    console.error(error.stack);
  }
}

testPerformance();
