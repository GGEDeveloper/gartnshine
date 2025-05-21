<?php
// Start session
session_start();

// Include configuration
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

// Check if authenticated as admin
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    header('Location: index.php');
    exit;
}

// Get summary data for dashboard
// Total products
$productQuery = "SELECT COUNT(*) as total FROM products";
$productResult = $conn->query($productQuery);
$totalProducts = $productResult->fetch_assoc()['total'];

// Total products in stock
$stockQuery = "SELECT COUNT(*) as total FROM products WHERE current_stock > 0";
$stockResult = $conn->query($stockQuery);
$totalInStock = $stockResult->fetch_assoc()['total'];

// Total products out of stock
$outOfStockQuery = "SELECT COUNT(*) as total FROM products WHERE current_stock = 0";
$outOfStockResult = $conn->query($outOfStockQuery);
$totalOutOfStock = $outOfStockResult->fetch_assoc()['total'];

// Total stock value
$stockValueQuery = "SELECT SUM(current_stock * purchase_price) as total_value FROM products";
$stockValueResult = $conn->query($stockValueQuery);
$stockValue = $stockValueResult->fetch_assoc()['total_value'] ?? 0;

// Get recent inventory transactions
$transactionsQuery = "SELECT t.*, p.reference 
                    FROM inventory_transactions t
                    JOIN products p ON t.product_id = p.id
                    ORDER BY t.transaction_date DESC
                    LIMIT 10";
$transactionsResult = $conn->query($transactionsQuery);
$recentTransactions = [];

if ($transactionsResult->num_rows > 0) {
    while ($row = $transactionsResult->fetch_assoc()) {
        $recentTransactions[] = $row;
    }
}

// Get low stock products (less than 5 items)
$lowStockQuery = "SELECT p.*, f.name as family_name 
                 FROM products p
                 JOIN product_families f ON p.family_id = f.id
                 WHERE p.current_stock > 0 AND p.current_stock < 5
                 ORDER BY p.current_stock ASC
                 LIMIT 10";
$lowStockResult = $conn->query($lowStockQuery);
$lowStockProducts = [];

if ($lowStockResult->num_rows > 0) {
    while ($row = $lowStockResult->fetch_assoc()) {
        $lowStockProducts[] = $row;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - <?php echo SITE_TITLE; ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        :root {
            --primary-color: <?php echo THEME_COLOR_PRIMARY; ?>;
            --secondary-color: <?php echo THEME_COLOR_SECONDARY; ?>;
            --accent-color: <?php echo THEME_COLOR_ACCENT; ?>;
            --text-color: <?php echo THEME_COLOR_TEXT; ?>;
            --highlight-color: <?php echo THEME_COLOR_HIGHLIGHT; ?>;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }
        
        body {
            background-color: var(--primary-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
        }
        
        .sidebar {
            width: 250px;
            background-color: rgba(20, 20, 20, 0.95);
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            overflow-y: auto;
            transition: all 0.3s ease;
            z-index: 100;
        }
        
        .sidebar-header {
            padding: 1.5rem;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sidebar-logo {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--highlight-color);
        }
        
        .admin-label {
            font-size: 0.8rem;
            opacity: 0.7;
            margin-top: 0.3rem;
        }
        
        .sidebar-menu {
            padding: 1.5rem 0;
        }
        
        .menu-section {
            margin-bottom: 1.5rem;
        }
        
        .menu-title {
            padding: 0.5rem 1.5rem;
            font-size: 0.8rem;
            text-transform: uppercase;
            opacity: 0.6;
            letter-spacing: 1px;
        }
        
        .menu-item {
            padding: 0.8rem 1.5rem;
            display: flex;
            align-items: center;
            color: var(--text-color);
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .menu-item:hover, .menu-item.active {
            background-color: rgba(177, 156, 217, 0.1);
            color: var(--highlight-color);
        }
        
        .menu-item i {
            margin-right: 0.8rem;
            font-size: 1.1rem;
        }
        
        .main-content {
            flex: 1;
            margin-left: 250px;
            padding: 2rem;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--highlight-color);
        }
        
        .header-actions {
            display: flex;
            gap: 1rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            border-radius: 5px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary {
            background-color: var(--highlight-color);
            color: var(--primary-color);
        }
        
        .btn-primary:hover {
            background-color: #9f84c5;
        }
        
        .btn-outline {
            background-color: transparent;
            color: var(--text-color);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-outline:hover {
            border-color: var(--highlight-color);
            color: var(--highlight-color);
        }
        
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background-color: rgba(30, 30, 30, 0.7);
            padding: 1.5rem;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .stat-title {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-bottom: 0.5rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .stat-icon {
            margin-top: auto;
            align-self: flex-end;
            font-size: 2rem;
            opacity: 0.2;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
        }
        
        .card {
            background-color: rgba(30, 30, 30, 0.7);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
            overflow: hidden;
        }
        
        .card-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .card-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--highlight-color);
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th, .table td {
            padding: 0.8rem 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .table th {
            font-weight: 500;
            opacity: 0.7;
            font-size: 0.9rem;
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        .table-responsive {
            overflow-x: auto;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .badge-success {
            background-color: rgba(46, 213, 115, 0.15);
            color: #2ed573;
        }
        
        .badge-danger {
            background-color: rgba(255, 71, 87, 0.15);
            color: #ff4757;
        }
        
        .badge-warning {
            background-color: rgba(255, 165, 2, 0.15);
            color: #ffa502;
        }
        
        @media (max-width: 992px) {
            .sidebar {
                transform: translateX(-100%);
            }
            
            .main-content {
                margin-left: 0;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }
        
        /* Toggle sidebar for mobile */
        .sidebar-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--highlight-color);
            color: var(--primary-color);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: none;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            z-index: 101;
        }
        
        @media (max-width: 992px) {
            .sidebar-toggle {
                display: flex;
            }
            
            .sidebar.show {
                transform: translateX(0);
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">Gonzaga's Art & Shine</div>
            <div class="admin-label">Painel Administrativo</div>
        </div>
        
        <nav class="sidebar-menu">
            <div class="menu-section">
                <div class="menu-title">Menu Principal</div>
                <a href="dashboard.php" class="menu-item active">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a>
                <a href="products.php" class="menu-item">
                    <i class="fas fa-gem"></i>
                    Produtos
                </a>
                <a href="inventory.php" class="menu-item">
                    <i class="fas fa-box"></i>
                    Estoque
                </a>
                <a href="catalog_manager.php" class="menu-item">
                    <i class="fas fa-book-open"></i>
                    Catálogo
                </a>
            </div>
            
            <div class="menu-section">
                <div class="menu-title">Gestão</div>
                <a href="categories.php" class="menu-item">
                    <i class="fas fa-tag"></i>
                    Categorias
                </a>
                <a href="reports.php" class="menu-item">
                    <i class="fas fa-chart-bar"></i>
                    Relatórios
                </a>
                <a href="checkpoints.php" class="menu-item">
                    <i class="fas fa-save"></i>
                    Checkpoints
                </a>
            </div>
            
            <div class="menu-section">
                <div class="menu-title">Conta</div>
                <a href="settings.php" class="menu-item">
                    <i class="fas fa-cog"></i>
                    Configurações
                </a>
                <a href="logout.php" class="menu-item">
                    <i class="fas fa-sign-out-alt"></i>
                    Sair
                </a>
            </div>
        </nav>
    </aside>
    
    <!-- Main Content -->
    <div class="main-content">
        <div class="page-header">
            <h1 class="page-title">Dashboard</h1>
            <div class="header-actions">
                <a href="products.php" class="btn btn-outline">
                    <i class="fas fa-th-list"></i>
                    Ver Produtos
                </a>
                <a href="product_form.php" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Novo Produto
                </a>
            </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-title">Total de Produtos</div>
                <div class="stat-value"><?php echo $totalProducts; ?></div>
                <div class="stat-icon">
                    <i class="fas fa-gem"></i>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">Em Estoque</div>
                <div class="stat-value"><?php echo $totalInStock; ?></div>
                <div class="stat-icon">
                    <i class="fas fa-box-open"></i>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">Sem Estoque</div>
                <div class="stat-value"><?php echo $totalOutOfStock; ?></div>
                <div class="stat-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">Valor em Estoque</div>
                <div class="stat-value"><?php echo formatCurrency($stockValue); ?></div>
                <div class="stat-icon">
                    <i class="fas fa-euro-sign"></i>
                </div>
            </div>
        </div>
        
        <!-- Dashboard Content -->
        <div class="dashboard-grid">
            <div class="left-column">
                <!-- Recent Transactions -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-exchange-alt"></i>
                            Transações Recentes
                        </h2>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Quantidade</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($recentTransactions)): ?>
                                        <tr>
                                            <td colspan="5" style="text-align: center;">Nenhuma transação recente</td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($recentTransactions as $transaction): ?>
                                            <tr>
                                                <td><?php echo date('d/m/Y', strtotime($transaction['transaction_date'])); ?></td>
                                                <td><?php echo $transaction['reference']; ?></td>
                                                <td>
                                                    <?php if ($transaction['transaction_type'] == 'purchase'): ?>
                                                        <span class="badge badge-success">Compra</span>
                                                    <?php elseif ($transaction['transaction_type'] == 'sale'): ?>
                                                        <span class="badge badge-warning">Venda</span>
                                                    <?php else: ?>
                                                        <span class="badge badge-danger">Ajuste</span>
                                                    <?php endif; ?>
                                                </td>
                                                <td><?php echo $transaction['quantity']; ?></td>
                                                <td><?php echo formatCurrency($transaction['total_amount']); ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="right-column">
                <!-- Low Stock Alert -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-exclamation-triangle"></i>
                            Estoque Baixo
                        </h2>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Estoque</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($lowStockProducts)): ?>
                                        <tr>
                                            <td colspan="2" style="text-align: center;">Nenhum produto com estoque baixo</td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($lowStockProducts as $product): ?>
                                            <tr>
                                                <td>
                                                    <div><?php echo $product['reference']; ?></div>
                                                    <small style="opacity: 0.7;"><?php echo $product['family_name']; ?></small>
                                                </td>
                                                <td>
                                                    <span class="badge badge-danger"><?php echo $product['current_stock']; ?> unid.</span>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-bolt"></i>
                            Ações Rápidas
                        </h2>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; gap: 1rem;">
                            <a href="product_form.php" class="btn btn-primary" style="width: 100%;">
                                <i class="fas fa-plus"></i>
                                Adicionar Produto
                            </a>
                            <a href="inventory_transaction.php" class="btn btn-outline" style="width: 100%;">
                                <i class="fas fa-exchange-alt"></i>
                                Nova Transação
                            </a>
                            <a href="create_checkpoint.php" class="btn btn-outline" style="width: 100%;">
                                <i class="fas fa-save"></i>
                                Criar Checkpoint
                            </a>
                            <a href="../public/catalog.php" class="btn btn-outline" style="width: 100%;" target="_blank">
                                <i class="fas fa-eye"></i>
                                Ver Catálogo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Mobile Sidebar Toggle -->
    <div class="sidebar-toggle" id="sidebar-toggle">
        <i class="fas fa-bars"></i>
    </div>
    
    <script>
        // Toggle sidebar for mobile
        document.getElementById('sidebar-toggle').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('show');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            
            if (window.innerWidth <= 992 && 
                !sidebar.contains(event.target) && 
                !sidebarToggle.contains(event.target) &&
                sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        });
    </script>
</body>
</html> 