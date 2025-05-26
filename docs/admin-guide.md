# Guia do Administrador - Painel de Controle

## Índice
1. [Visão Geral](#visão-geral)
2. [Acesso ao Painel](#acesso-ao-painel)
3. [Gerenciamento de Estoque](#gerenciamento-de-estoque)
   - [Visão Geral do Estoque](#visão-geral-do-estoque)
   - [Filtros e Pesquisa](#filtros-e-pesquisa)
   - [Ajustes de Estoque](#ajustes-de-estoque)
4. [Gerenciamento de Produtos](#gerenciamento-de-produtos)
5. [Relatórios](#relatórios)
6. [Configurações do Sistema](#configurações-do-sistema)

## Visão Geral

O painel administrativo oferece ferramentas completas para gerenciar seu inventário, produtos, pedidos e configurações do sistema. Esta documentação fornece um guia detalhado sobre como utilizar cada funcionalidade.

## Acesso ao Painel

1. Acesse o painel administrativo através da URL: `https://seu-dominio.com/admin`
2. Faça login com suas credenciais de administrador
3. Após o login, você será redirecionado para o painel principal

## Gerenciamento de Estoque

### Visão Geral do Estoque

A página de estoque exibe todos os produtos cadastrados no sistema com informações importantes:

- **Produto**: Nome e imagem do produto
- **Referência**: Código único de identificação
- **Estoque Atual**: Quantidade disponível no momento
- **Estoque Mínimo**: Quantidade mínima configurada para alertas
- **Status**: Indicador visual do status do estoque
  - ✅ Em Estoque: Acima do mínimo configurado
  - ⚠️ Estoque Baixo: Próximo ao limite mínimo
  - ❌ Fora de Estoque: Sem unidades disponíveis

### Filtros e Pesquisa

A tabela de estoque inclui vários filtros para facilitar a localização de produtos:

1. **Filtro por Nome**: Pesquise produtos por nome
2. **Filtro por Referência**: Localize produtos pelo código de referência
3. **Filtro por Status**: Filtre por status de estoque (Em Estoque, Estoque Baixo, Fora de Estoque)
4. **Filtro por Categoria**: Filtre produtos por categoria

**Dica**: Pressione Enter em qualquer campo de filtro para aplicar os filtros imediatamente.

### Ajustes de Estoque

Para ajustar o estoque de um produto:

1. Localize o produto desejado usando os filtros
2. Clique no botão "Ajustar Estoque" (ícone de +)
3. No modal que abrir:
   - Selecione o tipo de movimento (Entrada/Saída)
   - Informe a quantidade
   - Adicione uma observação (opcional)
4. Clique em "Confirmar" para salvar as alterações

## Gerenciamento de Produtos

### Adicionar Novo Produto

1. Navegue até "Produtos" > "Adicionar Novo"
2. Preencha as informações básicas:
   - Nome do produto
   - Referência (código único)
   - Categoria
   - Preço de venda
   - Custo
   - Quantidade inicial em estoque
   - Estoque mínimo
3. Faça upload das imagens do produto
4. Adicione uma descrição detalhada
5. Clique em "Salvar"

### Editar Produto Existente

1. Localize o produto na lista de produtos
2. Clique no ícone de edição (lápis)
3. Faça as alterações necessárias
4. Clique em "Atualizar" para salvar

## Relatórios

O painel oferece diversos relatórios para auxiliar na gestão:

- **Movimentação de Estoque**: Histórico completo de entradas e saídas
- **Produtos Mais Vendidos**: Ranking dos produtos por volume de vendas
- **Estoque Crítico**: Lista de produtos com estoque abaixo do mínimo
- **Vendas por Período**: Análise de vendas por dia, semana ou mês

## Configurações do Sistema

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

## Dicas de Desempenho

1. Mantenha as imagens dos produtos otimizadas
2. Realize ajustes em lotes para movimentações múltiplas
3. Utilize os filtros para trabalhar com subconjuntos de dados grandes
4. Gere relatórios fora do horário de pico

## Suporte

Em caso de dúvidas ou problemas:
1. Consulte nossa base de conhecimento em [suporte.seudominio.com](https://suporte.seudominio.com)
2. Abra um chamado de suporte através do painel
3. Entre em contato pelo e-mail: suporte@seudominio.com

---
*Última atualização: Maio 2025*
