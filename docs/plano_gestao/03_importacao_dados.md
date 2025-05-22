# Importação de Dados Iniciais

## Visão Geral

Este documento descreve o processo de importação dos dados iniciais a partir do arquivo `excel1.csv` para o sistema. A importação será feita em etapas para garantir a integridade dos dados.

## Estrutura do Arquivo CSV

O arquivo `excel1.csv` contém as seguintes colunas relevantes:

| Nome da Coluna | Descrição | Exemplo |
|----------------|-----------|---------|
| REF | Código de referência do produto | PAN0001 |
| Preço V € Unit | Preço de venda | 10.00 |
| Vendas Unit | Quantidade vendida | 1 |
| Vendas € | Total de vendas em € | 10.00 |
| Valor C € Unit | Custo unitário | 5.18 |
| Compra STK | Quantidade em estoque | 1 |
| Compras € | Valor total de compras | 5.18 |
| STK Atual Unit | Estoque atual em unidades | 1 |
| STK Atual € | Valor do estoque atual | 5.18 |
| STK Vendas € | Valor de venda do estoque | 10.00 |
| FAM | Categoria/Família | PAN |
| image | Nome do arquivo de imagem | IMG_7797.jpg |
| Etiq. | Status/Etiqueta | ok/repair |

## Fluxo de Importação

### 1. Pré-processamento

1. **Limpeza dos Dados**
   - Remover linhas vazias ou inválidas
   - Padronizar formatos numéricos (substituir vírgulas por pontos)
   - Tratar valores nulos ou vazios

2. **Mapeamento de Categorias**
   - Criar dicionário de mapeamento de códigos para nomes de categorias
   - Exemplo: PAN → "Panos", PPU → "Produtos Prontos a Usar"

3. **Preparação de Imagens**
   - Verificar existência dos arquivos de imagem
   - Padronizar nomes de arquivos
   - Mover para diretório de uploads

### 2. Script de Importação

```python
import csv
import os
from datetime import datetime
from pathlib import Path

# Configurações
CSV_FILE = 'excel1.csv'
UPLOAD_FOLDER = 'static/uploads/products'

# Mapeamento de categorias
CATEGORIES = {
    'PAN': 'Panos',
    'PPU': 'Produtos Prontos a Usar'
    # Adicionar outras categorias conforme necessário
}

def import_products(csv_file):
    """Importa produtos do arquivo CSV para o banco de dados."""
    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=',')
        
        for row in reader:
            # Pular linhas vazias
            if not row.get('REF'):
                continue
                
            # Processar dados
            reference = row['REF'].strip()
            price = float(row['Preço V € Unit'].replace('€', '').strip() or 0)
            cost_price = float((row['Valor C € Unit'] or '0').replace('€', '').strip() or 0)
            stock = int(row['STK Atual Unit'] or 0)
            category = CATEGORIES.get(row['FAM'].strip(), 'Outros')
            image = row['image'].strip() if row.get('image') else None
            status = 'active' if (row.get('Etiq.') or '').strip().lower() == 'ok' else 'inactive'
            
            # Verificar se o produto já existe
            product = Product.query.filter_by(reference=reference).first()
            
            if product:
                # Atualizar produto existente
                product.price = price
                product.cost_price = cost_price
                product.category = category
                if image:
                    product.image_path = process_image(image)
                product.status = status
            else:
                # Criar novo produto
                product = Product(
                    reference=reference,
                    name=f"Produto {reference}",  # Nome provisório
                    description=f"Descrição para {reference}",
                    price=price,
                    cost_price=cost_price,
                    stock_quantity=stock,
                    category=category,
                    image_path=process_image(image) if image else None,
                    status=status,
                    created_at=datetime.utcnow()
                )
                
                db.session.add(product)
            
            # Registrar movimentação de estoque inicial
            if stock > 0:
                movement = StockMovement(
                    product_id=product.id,
                    movement_type='purchase',
                    quantity=stock,
                    unit_price=cost_price,
                    total_value=cost_price * stock,
                    reference='Importação inicial',
                    notes='Importado do arquivo CSV',
                    created_at=datetime.utcnow()
                )
                db.session.add(movement)
        
        # Salvar todas as alterações
        db.session.commit()

def process_image(filename):
    """Processa o upload da imagem para o diretório correto."""
    if not filename:
        return None
        
    # Criar diretório se não existir
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Verificar se o arquivo existe no diretório de origem
    src_path = os.path.join('path/to/original/images', filename)
    if not os.path.exists(src_path):
        print(f"Aviso: Arquivo de imagem não encontrado: {filename}")
        return None
    
    # Definir caminho de destino
    ext = Path(filename).suffix.lower()
    new_filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(UPLOAD_FOLDER, new_filename)
    
    # Copiar e processar imagem (redimensionar, otimizar, etc.)
    # Aqui você pode adicionar processamento de imagem se necessário
    import shutil
    shutil.copy2(src_path, dest_path)
    
    return os.path.join('uploads/products', new_filename)

if __name__ == '__main__':
    from app import create_app, db
    from models import Product, StockMovement
    
    app = create_app()
    with app.app_context():
        import_products(CSV_FILE)
```

### 3. Pós-importação

1. **Verificação de Dados**
   - Gerar relatório de itens importados
   - Identificar e corrigir possíveis erros
   - Validar totais e consistência

2. **Atualização de Imagens**
   - Verificar se todas as imagens foram processadas corretamente
   - Atribuir imagens padrão para itens sem imagem
   - Otimizar imagens para web

3. **Backup**
   - Criar backup do banco de dados pós-importação
   - Documentar o processo realizado

## Considerações Importantes

1. **Tratamento de Erros**
   - Registrar todos os erros durante a importação
   - Permitir continuar o processo mesmo com erros parciais
   - Gerar relatório detalhado de erros

2. **Desempenho**
   - Processar em lotes para grandes volumes de dados
   - Usar transações para garantir a integridade
   - Otimizar consultas ao banco de dados

3. **Segurança**
   - Validar todos os dados de entrada
   - Não confiar nos dados do arquivo CSV
   - Usar consultas parametrizadas

## Próximos Passos

1. Executar o script em ambiente de teste
2. Validar os dados importados
3. Corrigir possíveis problemas
4. Realizar a importação em produção

---
[Voltar ao Ínicio](00_plano_principal.md)
