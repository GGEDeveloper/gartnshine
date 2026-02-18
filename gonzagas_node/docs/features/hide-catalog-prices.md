# Funcionalidade: Ocultar Preços no Catálogo

## Descrição
Esta funcionalidade permite ao administrador configurar o site para ocultar todos os preços dos produtos no catálogo público, exibindo "Preço sob consulta" em vez dos valores reais.

## Como Usar

### 1. Acessar Configurações
1. Faça login no painel administrativo (`/admin/login`)
2. Navegue para **Configurações** (`/admin/settings`)

### 2. Configurar Ocultação de Preços
1. Na seção **Site Features**, localize a opção **"Hide Catalog Prices"**
2. Ative o switch **"Show 'Price on Request' Instead of Prices"**
3. Clique em **"Save Settings"**

### 3. Resultado
- **Quando ATIVADO**: Todos os produtos no catálogo público mostrarão "Preço sob consulta"
- **Quando DESATIVADO**: Os preços reais dos produtos serão exibidos normalmente

## Onde Afeta

### Áreas que mostram "Preço sob consulta":
- ✅ Catálogo público (`/catalog`)
- ✅ Página inicial (produtos em destaque)
- ✅ Cartões de produto em todas as views públicas

### Áreas que NÃO são afetadas:
- ❌ Painel administrativo (sempre mostra preços reais)
- ❌ Relatórios internos
- ❌ Gestão de inventário

## Implementação Técnica

### Banco de Dados
- **Tabela**: `site_settings`
- **Campo**: `hide_catalog_prices` (TINYINT(1), padrão: 0)

### Arquivos Modificados
1. **Model**: `models/SiteSettings.js`
2. **Controller**: `controllers/SiteSettingsController.js`
3. **View Admin**: `views/admin/settings/settings-form.ejs`
4. **View Pública**: `views/partials/_productCard.ejs`
5. **Migração**: `scripts/add_hide_catalog_prices_migration.js`

### Lógica de Exibição
```javascript
// No partial _productCard.ejs
if (siteSettings.hide_catalog_prices) {
    // Mostra "Preço sob consulta"
} else {
    // Mostra o preço real formatado
}
```

## Casos de Uso
- **Loja B2B**: Preços personalizados por cliente
- **Produtos sob encomenda**: Preços variáveis conforme especificações
- **Período de ajuste**: Temporariamente ocultar preços durante reajustes
- **Estratégia comercial**: Forçar contato direto com vendedor

## Benefícios
1. **Flexibilidade comercial**: Controle total sobre quando mostrar preços
2. **Geração de leads**: Clientes precisam entrar em contato
3. **Segmentação**: Diferentes preços para diferentes perfis
4. **Proteção competitiva**: Evita comparação direta de preços

## Ativação/Desativação Instantânea
A configuração é aplicada imediatamente após salvar, sem necessidade de:
- Reiniciar o servidor
- Limpar cache
- Aguardar propagação 