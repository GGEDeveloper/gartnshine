# Gonzaga's Art & Shine

Sistema de gestão para a loja Gonzaga's Art & Shine, especializada em artigos de decoração e presentes.

## Recursos Principais

- **Painel Administrativo**: Interface moderna e intuitiva para gerenciamento completo da loja
- **Gestão de Produtos**: Cadastro, edição e remoção de produtos com categorias e estoque
- **Vendas**: Controle de pedidos, orçamentos e histórico de vendas
- **Clientes**: Cadastro e histórico de compras
- **Fornecedores**: Cadastro e histórico de compras
- **Relatórios**: Gráficos e relatórios de desempenho
- **Multi-usuário**: Sistema de permissões baseado em papéis (RBAC)

## Requisitos

- Node.js 16+
- MySQL 8.0+
- NPM ou Yarn

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/gonzagas-art-shine.git
   cd gonzagas-art-shine
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações de banco de dados e outras variáveis.

4. Inicialize o banco de dados:

   ```bash
   node scripts/init-db.js
   ```

5. Inicie o servidor:

   ```bash
   npm start
   ```

6. Acesse o sistema:
   - Painel administrativo: http://localhost:3000/admin
   - Usuário padrão: admin@example.com / admin123

## Estrutura do Projeto

```
gonzagas_node/
├── config/              # Configurações do sistema
├── controllers/         # Lógica de controle
├── middlewares/         # Middlewares do Express
├── models/              # Modelos do banco de dados
├── modules/             # Módulos do sistema
├── public/              # Arquivos estáticos
├── routes/              # Definições de rotas
├── scripts/             # Scripts utilitários
├── services/            # Serviços de negócio
├── uploads/             # Uploads de arquivos
└── views/               # Templates EJS
```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

## Testes

Para executar os testes:

```bash
npm test
```

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
