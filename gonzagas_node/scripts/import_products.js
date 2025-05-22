const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
const path = require('path');

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: '2585',
  database: 'gonzagas_db',
  multipleStatements: true
};

// Caminho para o arquivo CSV
const csvFilePath = path.join(__dirname, '../../excel1.csv');

async function importProducts() {
  let connection;
  
  try {
    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado ao banco de dados MySQL');
    
    // Criar array para armazenar os produtos
    const products = [];
    
    // Ler o arquivo CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({
          separator: ',',
          skipLines: 1, // Pular cabeçalho se necessário
          headers: [
            'Index', 'Reference', 'PrecoVenda', 'VendasUnit', 'VendasEuros', 
            'PrecoCompra', 'Peso', 'CompraSTK', 'ComprasEuros', 'Peso2', 
            'Tamanho', 'STKAtualUnit', 'STKAtualEuros', 'STKVendasEuros', 
            'Familia', 'Imagem', 'Foto', 'Etiqueta'
          ]
        }))
        .on('data', (row) => {
          // Mapear os dados do CSV para o formato do banco de dados
          const product = {
            reference: row.Reference || '',
            name: `Produto ${row.Reference}`,
            description: `Produto ${row.Reference} - ${row.Familia || ''}`,
            purchase_price: parseFloat(row.PrecoCompra?.replace(',', '.') || '0'),
            sale_price: parseFloat(row.PrecoVenda?.replace(',', '.') || '0'),
            current_stock: parseInt(row.STKAtualUnit || '0', 10),
            min_stock: 0,
            weight: parseFloat(row.Peso?.replace(',', '.') || '0'),
            material: 'Prata 925',
            style: row.Familia || 'Geral',
            barcode: row.Reference,
            family_id: null,
            weight_unit: 'g',
            dimensions: row.Tamanho || '',
            is_active: 1,
            min_stock_level: 0,
            max_stock_level: 0,
            location: '',
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            created_by: 1,
            updated_by: 1
          };
          
          // Adicionar à lista de produtos
          products.push(product);
        })
        .on('end', () => {
          console.log(`Total de produtos lidos: ${products.length}`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Erro ao ler o arquivo CSV:', error);
          reject(error);
        });
    });
    
    // Iniciar transação
    await connection.beginTransaction();
    
    try {
      // Inserir produtos
      for (const product of products) {
        // Verificar se o produto já existe
        const [existingProducts] = await connection.query(
          'SELECT id FROM products WHERE reference = ?',
          [product.reference]
        );
        
        if (existingProducts.length > 0) {
          // Atualizar produto existente
          const productId = existingProducts[0].id;
          await connection.query(
            `UPDATE products SET 
              name = ?, 
              description = ?, 
              purchase_price = ?, 
              sale_price = ?, 
              current_stock = ?, 
              weight = ?,
              updated_at = ?,
              updated_by = ?
            WHERE id = ?`,
            [
              product.name,
              product.description,
              product.purchase_price,
              product.sale_price,
              product.current_stock,
              product.weight,
              product.updated_at,
              product.updated_by,
              productId
            ]
          );
          console.log(`Produto atualizado: ${product.reference}`);
        } else {
          // Inserir novo produto
          await connection.query(
            `INSERT INTO products (
              reference, name, description, purchase_price, sale_price, 
              current_stock, min_stock, weight, material, style, barcode,
              family_id, weight_unit, dimensions, is_active, min_stock_level,
              max_stock_level, location, created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.reference, product.name, product.description, 
              product.purchase_price, product.sale_price, product.current_stock,
              product.min_stock, product.weight, product.material, product.style,
              product.barcode, product.family_id, product.weight_unit, 
              product.dimensions, product.is_active, product.min_stock_level,
              product.max_stock_level, product.location, product.created_at, 
              product.updated_at, product.created_by, product.updated_by
            ]
          );
          console.log(`Novo produto adicionado: ${product.reference}`);
        }
      }
      
      // Confirmar transação
      await connection.commit();
      console.log('Importação concluída com sucesso!');
      
    } catch (error) {
      // Reverter transação em caso de erro
      await connection.rollback();
      console.error('Erro durante a importação:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Erro na importação de produtos:', error);
  } finally {
    // Fechar conexão com o banco de dados
    if (connection) {
      await connection.end();
      console.log('Conexão com o banco de dados encerrada');
    }
  }
}

// Executar a importação
importProducts().catch(console.error);
