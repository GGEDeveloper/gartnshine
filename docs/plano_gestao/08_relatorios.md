# Módulo de Relatórios

## Visão Geral

O módulo de relatórios fornece ferramentas para análise e tomada de decisão baseada em dados, com relatórios gerenciais e operacionais sobre todas as áreas do sistema.

## Tipos de Relatórios

### 1. Relatórios de Vendas

#### 1.1. Vendas por Período
- **Objetivo**: Analisar o desempenho das vendas ao longo do tempo
- **Filtros**:
  - Data inicial/final
  - Vendedor
  - Forma de pagamento
  - Cliente
  - Status
- **Métricas**:
  - Total de vendas
  - Quantidade de itens
  - Ticket médio
  - Comparativo com período anterior
- **Visualizações**:
  - Gráfico de linhas (evolução diária/semanal/mensal)
  - Tabela detalhada
  - Comparativo por período

#### 1.2. Produtos Mais Vendidos
- **Objetivo**: Identificar os produtos com melhor desempenho
- **Filtros**:
  - Data inicial/final
  - Categoria
  - Estoque mínimo
- **Métricas**:
  - Quantidade vendida
  - Faturamento
  - Margem de contribuição
  - Participação no faturamento
- **Visualizações**:
  - Ranking de produtos
  - Gráfico de pizza por categoria
  - Evolução temporal

#### 1.3. Vendas por Vendedor
- **Objetivo**: Avaliar desempenho da equipe comercial
- **Filtros**:
  - Data inicial/final
  - Vendedor
  - Equipe
- **Métricas**:
  - Total de vendas
  - Quantidade de pedidos
  - Ticket médio
  - Meta x Realizado
- **Visualizações**:
  - Ranking de vendedores
  - Evolução mensal
  - Comparativo entre vendedores

### 2. Relatórios de Estoque

#### 2.1. Posição de Estoque
- **Objetivo**: Visualizar a situação atual do estoque
- **Filtros**:
  - Categoria
  - Fornecedor
  - Status
  - Estoque mínimo/máximo
- **Métricas**:
  - Quantidade em estoque
  - Valor total
  - Dias de estoque
  - Itens abaixo do mínimo
- **Visualizações**:
  - Grade de produtos
  - Gráfico de valor por categoria
  - Alertas de estoque baixo

#### 2.2. Movimentações de Estoque
- **Objetivo**: Acompanhar entradas, saídas e ajustes
- **Filtros**:
  - Data inicial/final
  - Tipo de movimentação
  - Produto
  - Responsável
- **Métricas**:
  - Total de entradas/saídas
  - Valor movimentado
  - Saldo final
- **Visualizações**:
  - Linha do tempo
  - Tabela detalhada
  - Gráfico de barras comparativo

#### 2.3. Produtos em Falta
- **Objetivo**: Identificar itens que necessitam de reposição
- **Filtros**:
  - Categoria
  - Fornecedor
  - Dias sem movimentação
- **Métricas**:
  - Quantidade em estoque
  - Média de venda diária
  - Dias de estoque restantes
  - Última entrada
- **Visualizações**:
  - Lista priorizada
  - Gráfico de giro
  - Histórico de reposições

### 3. Relatórios Financeiros

#### 3.1. Contas a Receber
- **Objetivo**: Acompanhar o fluxo de recebimentos
- **Filtros**:
  - Data de vencimento
  - Status (aberto/atrasado/recebido)
  - Cliente
  - Forma de pagamento
- **Métricas**:
  - Total a receber
  - Valor vencido
  - Valor a vencer
  - Média de atraso
- **Visualizações**:
  - Calendário de vencimentos
  - Projeção de recebimentos
  - Análise de inadimplência

#### 3.2. Fluxo de Caixa
- **Objetivo**: Visualizar entradas e saídas de recursos
- **Filtros**:
  - Data inicial/final
  - Categoria financeira
  - Centro de custo
- **Métricas**:
  - Saldo inicial/final
  - Total de entradas/saídas
  - Saldo acumulado
  - Projeção futura
- **Visualizações**:
  - Gráfico de linhas
  - Demonstrativo por categoria
  - Comparativo com períodos anteriores

#### 3.3. Margem de Contribuição
- **Objetivo**: Analisar a rentabilidade dos produtos
- **Filtros**:
  - Data inicial/final
  - Categoria
  - Produto
- **Métricas**:
  - Receita bruta
  - Custo variável
  - Margem de contribuição
  - Ponto de equilíbrio
- **Visualizações**:
  - Ranking de produtos
  - Evolução mensal
  - Análise ABC

## Funcionalidades Avançadas

### 1. Agendamento de Relatórios
- **Recorrentes**: Configurar envio automático por e-mail
- **Personalizados**: Salvar configurações de filtros
- **Lembretes**: Alertas para relatórios importantes

### 2. Exportação e Compartilhamento
- **Formatos**: PDF, Excel, CSV, PNG
- **Destinos**: E-mail, Google Drive, OneDrive
- **Agendamento**: Envio automático periódico

### 3. Painéis Personalizáveis
- **Widgets**: Arrastar e soltar
- **Layouts**: Múltiplos painéis temáticos
- **Compartilhamento**: Compartilhar com outros usuários

## Implementação Técnica

### 1. Estrutura do Banco de Dados

```sql
-- Tabela para armazenar relatórios agendados
CREATE TABLE scheduled_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  parameters JSON NOT NULL,
  schedule VARCHAR(50) NOT NULL, -- daily, weekly, monthly
  recipients TEXT NOT NULL, -- emails separados por vírgula
  last_run DATETIME,
  next_run DATETIME,
  active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela para armazenar relatórios personalizados
CREATE TABLE custom_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  parameters JSON NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 2. Endpoints da API

#### 2.1. Obter Relatório

```
GET /api/reports/sales/summary
```

**Parâmetros de Consulta:**
- `start_date`: Data inicial (obrigatório)
- `end_date`: Data final (obrigatório)
- `group_by`: Agrupamento (day/week/month)
- `filters`: Filtros adicionais em JSON

**Resposta de Sucesso (200 OK):**
```json
{
  "data": {
    "labels": ["01/05", "02/05", "03/05", ...],
    "datasets": [
      {
        "label": "Vendas",
        "data": [1500, 2300, 1800, ...],
        "backgroundColor": "#4e73df"
      },
      {
        "label": "Ano Anterior",
        "data": [1200, 1900, 1500, ...],
        "borderColor": "#e74a3b",
        "fill": false
      }
    ]
  },
  "summary": {
    "total_sales": 125000,
    "growth": 15.5,
    "avg_ticket": 125.75,
    "total_orders": 994
  },
  "export_url": "/api/reports/export/abc123"
}
```

#### 2.2. Agendar Relatório

```
POST /api/reports/schedule
```

**Corpo da Requisição (JSON):**
```json
{
  "name": "Relatório Semanal de Vendas",
  "report_type": "sales_summary",
  "parameters": {
    "group_by": "week",
    "filters": {
      "seller_id": 5
    }
  },
  "schedule": "weekly",
  "recipients": "gerente@exemplo.com,equipe@exemplo.com",
  "format": "pdf",
  "active": true
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": 1,
  "name": "Relatório Semanal de Vendas",
  "next_run": "2025-05-29T09:00:00Z",
  "message": "Relatório agendado com sucesso"
}
```

## Visualização de Dados

### 1. Gráficos Interativos
- **Tipos**: Linhas, barras, pizza, rosca, radar, dispersão
- **Interatividade**: Zoom, tooltips, legenda interativa
- **Exportação**: Imagem, PDF, dados brutos

### 2. Tabelas Dinâmicas
- **Agrupamento**: Arrastar e soltar campos
- **Filtros**: Em tempo real
- **Cálculos**: Somas, médias, contagens
- **Formatação**: Células condicionais

### 3. Painéis em Tempo Real
- **Atualização**: Push de dados
- **Notificações**: Alertas configuráveis
- **KPI Cards**: Métricas-chave destacadas

## Segurança e Acesso

### 1. Controle de Acesso
- Permissões por tipo de relatório
- Compartilhamento controlado
- Logs de acesso

### 2. Proteção de Dados
- Mascaramento de informações sensíveis
- Limitação de histórico
- Exclusão segura

### 3. Auditoria
- Registro de geração de relatórios
- Histórico de acessos
- Rastreamento de alterações

## Próximos Passos

1. Desenvolver os modelos de dados
2. Implementar os endpoints da API
3. Criar os componentes de visualização
4. Implementar a exportação em múltiplos formatos
5. Desenvolver o agendamento de relatórios
6. Realizar testes de desempenho

---
[Voltar ao Ínicio](00_plano_principal.md)
