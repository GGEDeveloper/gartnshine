const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createGonzagaAdmin() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    console.log('🔄 Configurando usuário admin "gonzaga"...');
    
    // Dados do admin conforme especificado no projeto
    const adminData = {
      name: 'Gonzaga',
      email: 'gonzaga@artnshine.pt',
      password: 'covil',
      role: 'admin'
    };
    
    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    // Verificar se o usuário já existe
    const [existingUser] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [adminData.email]
    );
    
    if (existingUser.length > 0) {
      console.log('🔧 Usuário já existe. Atualizando senha...');
      
      // Atualizar senha do usuário existente
      await connection.execute(
        'UPDATE users SET name = ?, password = ?, role = ?, updated_at = NOW() WHERE email = ?',
        [adminData.name, hashedPassword, adminData.role, adminData.email]
      );
      
      console.log('✅ Usuário atualizado com sucesso!');
    } else {
      console.log('🔧 Criando novo usuário admin...');
      
      // Criar novo usuário
      await connection.execute(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [adminData.name, adminData.email, hashedPassword, adminData.role]
      );
      
      console.log('✅ Usuário criado com sucesso!');
    }
    
    console.log('📋 CREDENCIAIS DE ACESSO:');
    console.log('🌐 URL: http://localhost:3000/admin/login');
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Senha:', adminData.password);
    console.log('👤 Nome:', adminData.name);
    console.log('🎭 Role:', adminData.role);
    
    // Listar todos os usuários admin
    console.log('\n👥 USUÁRIOS ADMIN EXISTENTES:');
    const [allAdmins] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE role = "admin"'
    );
    
    allAdmins.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar usuário admin:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Executar o script
createGonzagaAdmin()
  .then(() => {
    console.log('\n🎉 Configuração de admin concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na configuração:', error);
    process.exit(1);
  }); 