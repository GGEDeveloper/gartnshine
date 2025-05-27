# Guia do Administrador - Painel de Controle

## Índice

1. [Introdução](#introdução)
2. [Acesso ao Painel e Visão Geral](#acesso-ao-painel-e-visão-geral)
   - [2.1 Acesso ao Painel](#21-acesso-ao-painel)
   - [2.2 Login](#22-login)
   - [2.3 Logout](#23-logout)
   - [2.4 Visão Geral do Painel (Dashboard)](#24-visão-geral-do-painel-dashboard)
3. [Gerenciamento de Estoque](#gerenciamento-de-estoque)
   - [3.1 Visualizar Transações de Estoque](#31-visualizar-transações-de-estoque)
   - [3.2 Ajustes Manuais de Estoque](#32-ajustes-manuais-de-estoque)
   - [3.3 Implicações dos Ajustes de Estoque](#33-implicações-dos-ajustes-de-estoque)
4. [Gerenciamento de Produtos](#gerenciamento-de-produtos)
   - [4.1 Listar Produtos](#41-listar-produtos)
   - [4.2 Adicionar Novo Produto](#42-adicionar-novo-produto)
   - [4.3 Editar Produto Existente](#43-editar-produto-existente)
   - [4.4 Excluir Produto](#44-excluir-produto)
   - [4.5 Gerenciamento de Famílias de Produtos](#45-gerenciamento-de-famílias-de-produtos)
     - [4.5.1 Listar Famílias](#451-listar-famílias)
     - [4.5.2 Adicionar Nova Família](#452-adicionar-nova-família)
     - [4.5.3 Editar Família](#453-editar-família)
     - [4.5.4 Excluir Família](#454-excluir-família)
5. [Relatórios](#5-relatórios)
6. [Configurações do Sistema](#6-configurações-do-sistema)
7. [Solução de Problemas Comuns e Erros Esperados (Perspectiva Técnica)](#7-solução-de-problemas-comuns-e-erros-esperados-perspectiva-técnica)
8. [Gerenciamento de Checkpoints (Backup e Restauração)](#8-gerenciamento-de-checkpoints-backup-e-restauração)
   - [8.1 Listar Checkpoints](#81-listar-checkpoints)
   - [8.2 Criar Novo Checkpoint](#82-criar-novo-checkpoint)
   - [8.3 Restaurar a partir de um Checkpoint](#83-restaurar-a-partir-de-um-checkpoint)
   - [8.4 Excluir um Checkpoint](#84-excluir-um-checkpoint)

## Introdução

O painel administrativo oferece ferramentas completas para gerenciar seu inventário, produtos, pedidos e configurações do sistema. Esta documentação fornece um guia detalhado sobre como utilizar cada funcionalidade.

## Acesso ao Painel e Visão Geral

### 2.1 Acesso ao Painel

1. Acesse o painel administrativo através da URL: `https://seu-dominio.com/admin`
2. Faça login com suas credenciais de administrador
3. Após o login, você será redirecionado para o painel principal

### 2.2 Login

1. Insira seu nome de usuário e senha nos campos correspondentes
2. Clique no botão "Entrar"

### 2.3 Logout

1. Clique no botão "Sair" no canto superior direito da tela
2. Você será redirecionado para a página de login

### 2.4 Visão Geral do Painel (Dashboard)

O dashboard é a primeira tela que você vê após o login bem-sucedido. Ele foi projetado para fornecer um resumo conciso e visual das principais métricas e atividades recentes do seu catálogo digital, permitindo uma rápida avaliação do estado atual do sistema.

As informações tipicamente apresentadas no dashboard incluem:

- **Estatísticas Chave (Cards de Resumo):**
    - **Total de Produtos**: Número total de produtos cadastrados no sistema.
    - **Total de Famílias**: Número total de famílias (ou categorias) de produtos criadas.
    - **Produtos com Baixo Estoque**: Contagem de produtos cujo estoque atual está acima de zero, mas abaixo de um limite pré-definido (por exemplo, menos de 5 unidades). Isso ajuda a identificar itens que podem precisar de reposição em breve.
    - **Produtos Fora de Estoque**: Contagem de produtos com estoque zero ou negativo, indicando indisponibilidade imediata.

- **Listas de Atividades Recentes:**
    - **Produtos Recentes**: Uma lista dos últimos produtos que foram adicionados ou atualizados no sistema (geralmente os 5 mais recentes). Para cada produto, são exibidos detalhes como imagem, nome, referência, preço de venda e estoque atual.
    - **Transações de Inventário Recentes**: Uma lista das últimas movimentações de estoque registradas (geralmente as 5 mais recentes), incluindo o tipo de transação, produto afetado, quantidade e data.

O dashboard serve como um ponto de partida central para navegar para outras seções do painel de administração, como gerenciamento de produtos ou inventário, para ações mais detalhadas.

## Gerenciamento de Estoque

O gerenciamento eficaz do estoque é crucial para garantir que os produtos certos estejam disponíveis para os clientes (no contexto de um catálogo digital, para exibição) e para otimizar os custos. O painel de administração oferece ferramentas para rastrear e ajustar os níveis de estoque.

### 3.1 Visualizar Transações de Estoque

A seção de inventário (geralmente acessível através de um link como "Inventário" ou "Estoque" no menu lateral) exibe uma lista dos seus produtos juntamente com suas quantidades de estoque atuais, preços e outras informações relevantes. Isso permite uma rápida verificação dos níveis de estoque de todos os itens.

### 3.2 Ajustes Manuais de Estoque

Esta é a principal funcionalidade para atualizar manualmente os níveis de estoque no sistema. É acessada através de uma opção como "Ajustar Estoque" ou "Nova Movimentação" dentro da seção de Inventário.

Ao realizar um ajuste manual, você normalmente precisará fornecer as seguintes informações:

- **Produto**: Selecione o produto cujo estoque será ajustado.
- **Tipo de Transação**: Este campo é crucial e define a natureza da movimentação. Exemplos comuns que podem estar disponíveis incluem:
  - `Entrada por Compra`: Use este tipo para registrar o recebimento de novos produtos de um fornecedor. A quantidade informada será somada ao estoque atual.
  - `Saída por Venda`: Use este tipo para registrar uma venda que ocorreu (por exemplo, offline ou em outro canal). A quantidade informada será subtraída do estoque atual.
  - `Ajuste de Inventário (Positivo ou Negativo)`: Para correções de contagem, perdas, danos, ou outras discrepâncias.
  - `Devolução de Cliente`: Para registrar o retorno de um produto vendido, aumentando o estoque.
  - `Devolução a Fornecedor`: Para registrar o envio de um produto de volta ao fornecedor, diminuindo o estoque.
- **Quantidade**: O número de unidades a serem adicionadas ou removidas do estoque. Para saídas ou ajustes negativos, informe um valor positivo e o tipo de transação cuidará da subtração.
- **Preço de Custo/Venda (Opcional)**: Dependendo da configuração, pode ser solicitado o preço de custo (para entradas) ou o preço de venda (para saídas) para fins de relatório.
- **Notas/Observações**: Um campo para adicionar qualquer informação relevante sobre a transação (ex: "Contagem de inventário anual", "Venda para cliente X", "Recebimento NF Y").

**Como Funciona:**

1. Ao submeter um ajuste de estoque, o sistema cria um novo registro na tabela `inventory_transactions` com todos os detalhes fornecidos.
2. Simultaneamente, a quantidade em estoque do produto (`stock_quantity` na tabela `products`, ou `current_stock` conforme o modelo) é atualizada para refletir a movimentação.

**Importante sobre `product_sales` e `product_purchases`:**

As tabelas `product_sales` (para registrar detalhes de vendas individuais) e `product_purchases` (para registrar detalhes de compras de fornecedores) existem no banco de dados. No entanto, a funcionalidade de "Ajuste Manual de Estoque" descrita acima, ao usar tipos como `Saída por Venda` ou `Entrada por Compra`, **atualiza diretamente o inventário e registra a transação de estoque, mas não cria automaticamente um registro correspondente e detalhado nas tabelas `product_sales` ou `product_purchases` através desta interface do painel de admin.**

Se a sua operação requer o registro detalhado em `product_sales` ou `product_purchases` (por exemplo, para contabilidade detalhada, informações do cliente na venda, dados do fornecedor na compra), essa funcionalidade pode precisar ser acessada por outros meios (se implementada, por exemplo, através de uma seção "Pedidos" ou "Compras" dedicada que ainda não está totalmente operacional) ou gerenciada externamente ao fluxo de ajuste de estoque.

## Gerenciamento de Produtos

A seção de gerenciamento de produtos permite controlar todos os aspectos dos itens do seu catálogo.

### 4.1 Listagem de Produtos

A página principal de produtos (acessível por "Produtos" no menu) exibe uma tabela com todos os itens cadastrados. As informações geralmente incluem:

- **Imagem Principal**
- **Nome do Produto**
- **Referência** (código único)
- **Família/Categoria**
- **Preço de Venda**
- **Estoque Atual**
- **Status** (Ativo/Inativo)
- **Ações** (Editar, Excluir)

A listagem suporta paginação para facilitar a navegação entre um grande número de produtos.

### 4.2 Adicionar Novo Produto

Para adicionar um novo produto ao catálogo:

1. Navegue até "Produtos" e clique no botão "Adicionar Novo" (ou similar).
2. Você será direcionado para um formulário onde deverá preencher as seguintes informações:
    - **Nome do Produto**: O nome comercial do item (obrigatório).
    - **Referência**: Um código único para identificar o produto (SKU, código de barras, etc.).
    - **Família/Categoria**: Selecione a qual família (categoria) o produto pertence. As famílias devem ser cadastradas previamente (ver seção 4.5).
    - **Descrição**: Uma descrição detalhada do produto, que pode incluir características, benefícios, etc. Este campo geralmente suporta formatação rica.
    - **Preço de Venda**: O preço pelo qual o produto será vendido ao cliente.
    - **Preço de Custo/Compra**: O custo de aquisição do produto. Usado para cálculos de margem e relatórios (pode não ser visível para todos os usuários admin).
    - **Estoque Atual (Quantidade Inicial)**: A quantidade deste produto que você possui em estoque no momento do cadastro. Se um valor maior que zero for inserido aqui, uma transação de inventário do tipo "Entrada por Compra" (ou "Estoque Inicial") será automaticamente registrada com a nota "Initial stock".
    - **Estoque Mínimo**: (Campo presente na documentação anterior, verificar se existe no formulário/modelo `Product.js`. Se não, remover esta linha.)
    - **Imagem Principal**: Faça o upload da imagem principal do produto. Formatos comuns como JPG, PNG são aceitos.
    - **Estilo**: Informações sobre o estilo do produto (ex: Moderno, Clássico, Rústico).
    - **Material**: O material principal de fabricação do produto (ex: Madeira, Metal, Cerâmica).
    - **Peso**: O peso do produto (ex: em kg ou g). Pode ser usado para cálculo de frete.
    - **Dimensões**: As dimensões físicas do produto (ex: Altura x Largura x Profundidade, em cm ou m).
    - **Ativo?**: Marque esta opção para que o produto seja visível no catálogo do site. Desmarque para ocultá-lo sem excluí-lo.
    - **Em Destaque?**: Marque esta opção se desejar que o produto apareça em seções de destaque no site (ex: página inicial).
3. Após preencher todos os campos obrigatórios, clique em "Salvar".

### 4.3 Editar Produto Existente

Para modificar um produto já cadastrado:

1. Na lista de produtos, localize o item desejado e clique no ícone de "Editar" (geralmente um lápis).
2. O formulário de edição será carregado com os dados atuais do produto. Todos os campos mencionados na seção "Adicionar Novo Produto" estarão disponíveis para alteração.
3. **Nota sobre Estoque**: Ao editar o campo "Estoque Atual", o sistema pode ou não criar uma nova transação de ajuste. A documentação da seção "Gerenciamento de Estoque" explica como fazer ajustes pontuais. A alteração direta aqui deve ser usada com cautela, preferencialmente para correções iniciais.
4. Faça as alterações necessárias e clique em "Atualizar" (ou "Salvar") para aplicar as modificações.

### 4.4 Excluir Produto

Para remover um produto do catálogo:

1. Na lista de produtos, localize o item que deseja excluir.
2. Clique no ícone de "Excluir" (geralmente uma lixeira).
3. Uma mensagem de confirmação será exibida para evitar exclusões acidentais.
4. Confirme a exclusão. O produto será removido permanentemente do sistema.
   **Atenção**: A exclusão de um produto pode afetar dados históricos de vendas ou movimentações de estoque se não houver um sistema de "arquivamento" ou "desativação soft". Verifique o comportamento do sistema.

### 4.5 Gerenciamento de Famílias de Produtos (Categorias)

As famílias de produtos ajudam a organizar seu catálogo em categorias, facilitando a navegação tanto para administradores quanto para clientes no front-end.

1.  **Listar Famílias**: Acesse a seção "Famílias" (ou "Categorias") no menu do admin. Você verá uma lista das famílias existentes, possivelmente com a contagem de produtos em cada uma.
2.  **Adicionar Nova Família**:
    *   Geralmente há um botão "Adicionar Nova Família".
    *   Você precisará fornecer um **Nome** para a família.
    *   Pode haver campos adicionais como descrição da família, imagem, ou família pai (para subcategorias), dependendo da complexidade do sistema.
    *   Clique em "Salvar".
3.  **Editar Família Existente**:
    *   Na lista de famílias, clique em "Editar" ao lado da família desejada.
    *   Altere os campos necessários e salve.
4.  **Excluir Família**:
    *   Na lista de famílias, clique em "Excluir".
    *   **Atenção**: Excluir uma família pode exigir que os produtos atualmente nela sejam reatribuídos a outra família ou fiquem sem categoria. Verifique o comportamento do sistema.

### 4.6 Gerenciamento de Imagens de Produtos

Conforme visto no código, um produto pode ter uma imagem principal (definida no formulário de adição/edição) e potencialmente imagens adicionais.

- **Imagem Principal**: Gerenciada diretamente no formulário do produto.
- **Imagens Adicionais**: Se a interface do painel de administração permitir, pode haver uma seção específica na página de edição do produto para fazer upload, ordenar ou remover imagens secundárias. Se essa funcionalidade não estiver explícita na UI do admin, pode ser uma limitação atual ou uma funcionalidade a ser desenvolvida.

## 5. Relatórios

O painel oferece diversos relatórios para auxiliar na gestão:

- **Movimentação de Estoque**: Histórico completo de entradas e saídas
- **Produtos Mais Vendidos**: Ranking dos produtos por volume de vendas
- **Estoque Crítico**: Lista de produtos com estoque abaixo do mínimo
- **Vendas por Período**: Análise de vendas por dia, semana ou mês

## 6. Configurações do Sistema

### Parâmetros Gerais

1. Acesse "Configurações" > "Geral"
2. Configure:
   - Dados da empresa
   - Moeda padrão
   - Unidades de medida
   - Impostos

### Usuários e Permissões

1. Acesse "Configurações" > "Usuários"
2. Para adicionar um novo usuário:
   - Clique em "Novo Usuário"
   - Preencha os dados básicos
   - Defina o perfil de acesso (Administrador, Gerente, Operador)
   - Envie o convite por e-mail

### Notificações

Configure alertas automáticos para:
- Estoque baixo
- Vendas acima da média
- Novos pedidos recebidos
- Atualizações do sistema

## 7. Solução de Problemas Comuns e Erros Esperados (Perspectiva Técnica)

Esta seção é direcionada a desenvolvedores e IAs de codificação para auxiliar no diagnóstico e resolução de problemas relacionados ao código-fonte do painel de administração.

1.  **Erro ao Salvar Produto: Referência Única Violada (Constraint Violation)**
    *   **Sintoma Comum**: Mensagem de erro indicando que a referência do produto já existe (ex: `ER_DUP_ENTRY`).
    *   **Ponteiro de Código**: Métodos `Product.create` ou `Product.update` em `gonzagas_node/models/Product.js`. Rota `POST /admin/products/add` ou `POST /admin/products/edit/:id` em `gonzagas_node/routes/admin.js`.
    *   **Banco de Dados**: Constraint `UNIQUE` na coluna `products.reference`.
    *   **Debugging/Análise**:
        *   Verifique os blocos `try...catch` no backend (ex: no `ProductController.js` ou diretamente nas rotas) para captura específica de códigos de erro SQL (ex: MySQL error code `1062` para entrada duplicada).
        *   Analise se há validação no frontend para verificar a unicidade da referência *antes* da submissão para melhorar a UX. Se não, considere adicionar.
        *   Considere logs detalhados da query SQL e dos dados (`req.body`) enviados ao backend.
        *   Inspecione o `Product.js` para garantir que a lógica de inserção/atualização não esteja tentando inserir uma referência duplicada sob certas condições (ex: lógica de upsert falha).

2.  **Falha ao Ajustar Estoque: Produto Não Encontrado ou ID Inválido**
    *   **Sintoma Comum**: Operação de ajuste de estoque (`POST /admin/inventory/adjust`) falha com erro específico de tipo ou tamanho, ou um erro genérico se não tratado.
    *   **Ponteiro de Código**: Middleware de upload de arquivos (ex: Multer) configurado nas rotas de produto em `admin.js`. Configurações em `config/config.js` (`site.maxFileSize`, `site.allowedFileTypes`, `upload.allowedMimeTypes`). Lógica de tratamento de arquivo no `ProductController.js` ou na rota.
    *   **Debugging/Análise**:
        *   Logue o `req.file` ou `req.files` no backend para ver o que o Multer processou. Verifique `mimetype` e `size`.
        *   Assegure que o middleware de tratamento de erros do Multer (ex: `upload.single('imageFieldName')` ou `upload.array()`) está implementado e que seus erros específicos (ex: `LIMIT_FILE_SIZE`, `LIMIT_UNEXPECTED_FILE`) são capturados e retornam respostas HTTP adequadas (ex: 400 Bad Request, 413 Payload Too Large).
        *   Verifique se os valores em `config.js` para limites de tamanho e tipos MIME são os esperados e se estão sendo corretamente aplicados na configuração do Multer.
        *   Confirme se o nome do campo no formulário HTML (`<input type="file" name="imageFieldName">`) corresponde ao esperado pelo Multer no backend.

3.  **Erro de Conexão com o Banco de Dados (Específico do Admin)**
    *   **Sintoma Comum**: Seções específicas do admin que dependem intensamente do banco (listar produtos, famílias, transações) falham ou retornam erros 500, enquanto outras partes da aplicação (se houver front-end público) podem funcionar se usarem cache ou menos queries.
    *   **Ponteiro de Código**: Configuração do pool de conexões em `gonzagas_node/config/database.js`. Uso do `pool.query` ou `connection.query` em todos os modelos (`Product.js`, `Inventory.js`, `ProductFamily.js`, etc.) e controladores.
    *   **Debugging/Análise**:
        *   Verifique se as variáveis de ambiente (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`) estão corretamente carregadas pela aplicação Node.js (use `console.log(process.env)` no início da aplicação para depurar, mas remova em produção).
        *   Teste a conectividade de rede entre o servidor da aplicação e o servidor do banco de dados usando as credenciais fornecidas.
        *   Examine o tratamento de erros do pool de conexões. O pool está se esgotando devido a conexões não liberadas (`connection.release()`) nos modelos ou controladores? Há erros de autenticação específicos para o usuário do banco configurado?
        *   Aumente o nível de log do driver do banco de dados (se suportado) para obter mais detalhes sobre as falhas de conexão.

4.  **Problemas de Autenticação/Autorização em Rotas Admin**
    *   **Sintoma Comum**: Acesso negado (401 Unauthorized ou 403 Forbidden) a rotas do admin, ou, pior, acesso permitido indevidamente.
    *   **Ponteiro de Código**: Middleware de autenticação (ex: `adminSessionRequired` ou similar) aplicado às rotas em `admin.js`. Lógica de verificação de token/sessão.
    *   **Debugging/Análise**:
        *   Verifique se o middleware `adminSessionRequired` está corretamente aplicado a TODAS as rotas que exigem privilégios de administrador.
        *   Inspecione a lógica dentro do middleware: como a sessão/token é validada? O `userId` ou `role` do usuário está sendo corretamente recuperado e verificado?
        *   Para erros 401/403, verifique se o token/cookie de sessão está sendo enviado corretamente pelo cliente (navegador/ferramenta de API).
        *   Se houver diferentes níveis de admin, certifique-se de que a lógica de autorização (além da autenticação) está correta.

5.  **Inconsistência de Dados entre Tabelas (Ex: Estoque e Transações)**
    *   **Sintoma Comum**: O `current_stock` na tabela `products` não reflete a soma das `inventory_transactions` para aquele produto.
    *   **Ponteiro de Código**: Lógica de atualização de estoque em `Inventory.js` (ex: `createTransaction`) e `Product.js` (ex: `updateStock`). Qualquer lugar que modifique `products.current_stock` diretamente.
    *   **Debugging/Análise**:
        *   Revise se todas as operações que alteram o estoque (ajustes manuais, e potencialmente futuras vendas/compras) estão utilizando transações de banco de dados (BEGIN, COMMIT, ROLLBACK) para garantir atomicidade ao atualizar `products.current_stock` E inserir um registro em `inventory_transactions`.
        *   Verifique se há cenários onde `products.current_stock` é modificado sem a correspondente `inventory_transactions` ou vice-versa.
        *   Considere adicionar triggers no banco de dados para manter a sincronia, ou um job de reconciliação periódico (embora a lógica da aplicação deva ser a principal responsável pela consistência).
        *   Analise a lógica de cálculo do estoque: está somando/subtraindo corretamente com base no tipo de transação?

6.  **Erro ao Fazer Upload de Imagem: Formato Inválido ou Arquivo Muito Grande**
    *   **Sintoma Comum**: Upload de imagem para um produto (`POST /admin/products/add` ou `POST /admin/products/edit/:id` com `multipart/form-data`) falha com erro específico de tipo ou tamanho, ou um erro genérico se não tratado.
    *   **Ponteiro de Código**: Middleware de upload de arquivos (ex: Multer) configurado nas rotas de produto em `admin.js`. Configurações em `config/config.js` (`site.maxFileSize`, `site.allowedFileTypes`, `upload.allowedMimeTypes`). Lógica de tratamento de arquivo no `ProductController.js` ou na rota.
    *   **Debugging/Análise**:
        *   Logue o `req.file` ou `req.files` no backend para ver o que o Multer processou. Verifique `mimetype` e `size`.
        *   Assegure que o middleware de tratamento de erros do Multer (ex: `upload.single('imageFieldName')` ou `upload.array()`) está implementado e que seus erros específicos (ex: `LIMIT_FILE_SIZE`, `LIMIT_UNEXPECTED_FILE`) são capturados e retornam respostas HTTP adequadas (ex: 400 Bad Request, 413 Payload Too Large).
        *   Verifique se os valores em `config.js` para limites de tamanho e tipos MIME são os esperados e se estão sendo corretamente aplicados na configuração do Multer.
        *   Confirme se o nome do campo no formulário HTML (`<input type="file" name="imageFieldName">`) corresponde ao esperado pelo Multer no backend.

Lembre-se que as credenciais de acesso direto ao banco de dados (`DB_HOST=localhost`, `DB_PORT=3306`, `DB_USER=admin`, `DB_PASSWORD=****`, `DB_NAME=gonzagas_db`) podem ser usadas por um desenvolvedor ou administrador de banco de dados para diagnósticos avançados, caso suspeitem de problemas de integridade de dados ou para executar consultas de verificação diretamente no `gonzagas_db`.

## 8. Gerenciamento de Checkpoints (Backup e Restauração)

A funcionalidade de checkpoints permite criar e restaurar backups completos do banco de dados do sistema. Isso é essencial para a recuperação de dados em caso de falhas críticas, erros de operação ou para retornar o sistema a um estado anterior conhecido.

**O que é um Checkpoint?**

Um checkpoint é um arquivo de backup (em formato SQL) que contém toda a estrutura e os dados do seu banco de dados (`gonzagas_db`) em um momento específico.

**Acesso à Funcionalidade:**

Normalmente, você encontrará uma seção chamada "Checkpoints" ou "Backup/Restauração" no menu do painel de administração.

### 8.1 Listar Checkpoints

Ao acessar a seção de checkpoints, você verá uma lista dos backups previamente criados, geralmente ordenados do mais recente para o mais antigo. As informações exibidas podem incluir:

- **Nome do Checkpoint**: Um nome descritivo fornecido no momento da criação.
- **Descrição**: Detalhes adicionais sobre o checkpoint.
- **Data de Criação**: Quando o backup foi realizado.
- **Criado Por**: O usuário que iniciou a criação do checkpoint.
- **Ações**: Opções para Restaurar ou Excluir o checkpoint.

### 8.2 Criar Novo Checkpoint

1.  Clique no botão "Criar Novo Checkpoint" (ou similar).
2.  Você será solicitado a fornecer:
    *   **Nome do Checkpoint**: Um nome significativo para identificar este backup (ex: "Antes da atualização de produtos de Natal").
    *   **Descrição**: Notas adicionais sobre o motivo da criação ou o estado do sistema (opcional).
3.  Clique em "Salvar" ou "Criar".
4.  O sistema executará o processo de backup, que pode levar alguns momentos dependendo do tamanho do banco de dados.
    *   **Importante (Configuração do Servidor)**: Para que a criação de checkpoints funcione, as variáveis de ambiente `DB_USER`, `DB_PASS` (senha do banco) e `DB_NAME` devem estar corretamente configuradas no servidor onde a aplicação está rodando. Essas credenciais são usadas pelos comandos `mysqldump` para acessar o banco.
5.  Após a conclusão, o novo checkpoint aparecerá na lista.

**Gerenciamento Automático de Checkpoints Antigos:**
O sistema pode estar configurado para manter apenas um número máximo de checkpoints recentes (definido em `config.checkpoint.maxCheckpoints`). Quando um novo checkpoint é criado e o limite é excedido, o checkpoint mais antigo é automaticamente excluído (tanto o arquivo físico quanto o registro no sistema).

### 8.3 Restaurar a partir de um Checkpoint

**ATENÇÃO: ESTA É UMA OPERAÇÃO DE ALTO RISCO. RESTAURAR UM CHECKPOINT SUBSTITUIRÁ TODO O ESTADO ATUAL DO BANCO DE DADOS PELO CONTEÚDO DO BACKUP. TODOS OS DADOS ADICIONADOS OU MODIFICADOS DESDE A CRIAÇÃO DO CHECKPOINT SELECIONADO SERÃO PERDIDOS.**

1.  Na lista de checkpoints, localize o backup para o qual você deseja retornar o sistema.
2.  Clique no botão "Restaurar" associado a esse checkpoint.
3.  **Uma mensagem de confirmação crítica será exibida, alertando sobre a perda de dados recentes.** Leia com atenção.
4.  Se você tem certeza absoluta de que deseja prosseguir, confirme a restauração.
5.  O sistema executará o processo de restauração, que pode levar alguns momentos.
    *   **Importante (Configuração do Servidor)**: Assim como na criação, a restauração depende das variáveis de ambiente `DB_USER`, `DB_PASS` e `DB_NAME` corretamente configuradas no servidor da aplicação para que o comando `mysql` possa acessar e restaurar o banco.
6.  Após a conclusão, o sistema estará no estado em que se encontrava quando o checkpoint foi criado.

**Quando Usar a Restauração?**
-   Após um erro grave de sistema que corrompeu os dados.
-   Após uma operação em massa que resultou em dados incorretos e é mais fácil reverter do que corrigir manualmente.
-   Em situações de desastre para recuperar o sistema.

**Sempre crie um checkpoint do estado atual ANTES de tentar restaurar um checkpoint anterior, se possível, para ter um ponto de retorno caso a restauração não saia como esperado ou se você mudar de ideia.**

### 8.4 Excluir um Checkpoint

Se você deseja remover um checkpoint específico (por exemplo, para liberar espaço ou porque não é mais relevante):

1.  Na lista de checkpoints, localize o backup que deseja remover.
2.  Clique no botão "Excluir".
3.  Confirme a exclusão.
4.  O arquivo de backup físico será removido do servidor e o registro será excluído do sistema.

---
Última atualização: Maio 2025
