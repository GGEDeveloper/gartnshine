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

// Process delete action if requested
$deleteMessage = '';
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $productId = (int)$_GET['id'];
    
    // Check if product exists
    $checkStmt = $conn->prepare("SELECT reference FROM products WHERE id = ?");
    $checkStmt->bind_param("i", $productId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        $productReference = $checkResult->fetch_assoc()['reference'];
        
        // Delete product images first
        $conn->query("DELETE FROM product_images WHERE product_id = $productId");
        
        // Delete product
        $deleteStmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $deleteStmt->bind_param("i", $productId);
        
        if ($deleteStmt->execute()) {
            $deleteMessage = "Produto $productReference excluído com sucesso.";
        } else {
            $deleteMessage = "Erro ao excluir o produto: " . $conn->error;
        }
    }
}

// Get filter parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$familyId = isset($_GET['family']) ? (int)$_GET['family'] : null;
$search = isset($_GET['search']) ? cleanInput($_GET['search']) : null;
$sortBy = isset($_GET['sort']) ? cleanInput($_GET['sort']) : 'reference';
$sortOrder = isset($_GET['order']) ? cleanInput($_GET['order']) : 'asc';
$perPage = 15;

// Validate sort column
$validSortColumns = ['reference', 'family_id', 'name', 'sale_price', 'current_stock'];
if (!in_array($sortBy, $validSortColumns)) {
    $sortBy = 'reference';
}

// Validate sort order
$validSortOrders = ['asc', 'desc'];
if (!in_array($sortOrder, $validSortOrders)) {
    $sortOrder = 'asc';
}

// Build query parts
$where = [];
$params = [];
$types = "";

if ($familyId) {
    $where[] = "p.family_id = ?";
    $params[] = $familyId;
    $types .= "i";
}

if ($search) {
    $search = "%$search%";
    $where[] = "(p.reference LIKE ? OR p.name LIKE ?)";
    $params[] = $search;
    $params[] = $search;
    $types .= "ss";
}

$whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

// Count total records
$countQuery = "SELECT COUNT(*) as total FROM products p $whereClause";

if (!empty($params)) {
    $countStmt = $conn->prepare($countQuery);
    $countStmt->bind_param($types, ...$params);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalRow = $countResult->fetch_assoc();
    $total = $totalRow['total'];
} else {
    $countResult = $conn->query($countQuery);
    $totalRow = $countResult->fetch_assoc();
    $total = $totalRow['total'];
}

$totalPages = ceil($total / $perPage);
$offset = ($page - 1) * $perPage;

// Get products
$query = "SELECT p.*, f.code as family_code, f.name as family_name 
          FROM products p 
          LEFT JOIN product_families f ON p.family_id = f.id 
          $whereClause 
          ORDER BY $sortBy $sortOrder 
          LIMIT ?, ?";

$stmt = $conn->prepare($query);

if (!empty($params)) {
    $params[] = $offset;
    $params[] = $perPage;
    $types .= "ii";
    $stmt->bind_param($types, ...$params);
} else {
    $stmt->bind_param("ii", $offset, $perPage);
}

$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

// Get product families for filter
$familiesQuery = "SELECT id, code, name FROM product_families ORDER BY name";
$familiesResult = $conn->query($familiesQuery);
$families = [];

if ($familiesResult->num_rows > 0) {
    while ($row = $familiesResult->fetch_assoc()) {
        $families[] = $row;
    }
}

// Function to generate sort URL
function getSortUrl($column, $currentSortBy, $currentSortOrder) {
    global $familyId, $search, $page;
    
    $newOrder = ($currentSortBy === $column && $currentSortOrder === 'asc') ? 'desc' : 'asc';
    $url = "products.php?sort=$column&order=$newOrder";
    
    if ($familyId) {
        $url .= "&family=$familyId";
    }
    
    if ($search) {
        $url .= "&search=" . urlencode($search);
    }
    
    if ($page > 1) {
        $url .= "&page=$page";
    }
    
    return $url;
}

// Function to get sort icon
function getSortIcon($column, $currentSortBy, $currentSortOrder) {
    if ($currentSortBy !== $column) {
        return '<i class="fas fa-sort"></i>';
    }
    
    return ($currentSortOrder === 'asc') ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Produtos - <?php echo SITE_TITLE; ?></title>
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
            text-decoration: none;
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
        
        .btn-danger {
            background-color: rgba(255, 71, 87, 0.2);
            color: #ff4757;
            border: 1px solid rgba(255, 71, 87, 0.3);
        }
        
        .btn-danger:hover {
            background-color: rgba(255, 71, 87, 0.3);
        }
        
        .btn-sm {
            padding: 0.3rem 0.6rem;
            font-size: 0.8rem;
        }
        
        .filters {
            background-color: rgba(30, 30, 30, 0.7);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: flex-end;
        }
        
        .filter-group {
            flex: 1;
            min-width: 200px;
        }
        
        .filter-label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        select, .search-input {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(20, 20, 20, 0.7);
            color: var(--text-color);
            font-size: 0.9rem;
        }
        
        select:focus, .search-input:focus {
            outline: none;
            border-color: var(--highlight-color);
        }
        
        .search-btn {
            background-color: var(--highlight-color);
            color: var(--primary-color);
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .search-btn:hover {
            background-color: #9f84c5;
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
        
        .message {
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1.5rem;
        }
        
        .message-success {
            background-color: rgba(46, 213, 115, 0.1);
            color: #2ed573;
            border-left: 4px solid #2ed573;
        }
        
        .message-error {
            background-color: rgba(255, 71, 87, 0.1);
            color: #ff4757;
            border-left: 4px solid #ff4757;
        }
        
        .table-container {
            overflow-x: auto;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            white-space: nowrap;
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
            position: relative;
        }
        
        .table th a {
            color: var(--text-color);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .table th a:hover {
            color: var(--highlight-color);
        }
        
        .table tr:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        .thumbnail {
            width: 50px;
            height: 50px;
            border-radius: 4px;
            object-fit: cover;
        }
        
        .reference {
            font-weight: 500;
            color: var(--highlight-color);
        }
        
        .stock-status {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .stock-available {
            background-color: rgba(46, 213, 115, 0.15);
            color: #2ed573;
        }
        
        .stock-low {
            background-color: rgba(255, 165, 2, 0.15);
            color: #ffa502;
        }
        
        .stock-out {
            background-color: rgba(255, 71, 87, 0.15);
            color: #ff4757;
        }
        
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            margin: 2rem 0;
            gap: 0.5rem;
        }
        
        .pagination a, .pagination span {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 5px;
            background-color: rgba(30, 30, 30, 0.7);
            color: var(--text-color);
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .pagination a:hover {
            background-color: var(--highlight-color);
            color: var(--primary-color);
        }
        
        .pagination .current {
            background-color: var(--highlight-color);
            color: var(--primary-color);
        }
        
        .pagination-info {
            text-align: center;
            margin-top: -1rem;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
        }
        
        .empty-state i {
            font-size: 3rem;
            color: var(--accent-color);
            margin-bottom: 1rem;
            opacity: 0.7;
        }
        
        .empty-state h3 {
            font-size: 1.3rem;
            margin-bottom: 1rem;
        }
        
        .empty-state p {
            opacity: 0.8;
            margin-bottom: 2rem;
        }
        
        /* Mobile Sidebar Toggle */
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
            .sidebar {
                transform: translateX(-100%);
            }
            
            .main-content {
                margin-left: 0;
            }
            
            .sidebar-toggle {
                display: flex;
            }
            
            .sidebar.show {
                transform: translateX(0);
            }
            
            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .header-actions {
                width: 100%;
                justify-content: flex-end;
            }
        }
        
        /* Delete confirmation modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background-color: var(--primary-color);
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            animation: modalIn 0.3s ease-out;
        }
        
        @keyframes modalIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-header {
            padding: 1rem 1.5rem;
            background-color: rgba(255, 71, 87, 0.2);
            color: #ff4757;
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }
        
        .modal-header i {
            font-size: 1.5rem;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-footer {
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .show-modal {
            display: flex;
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
                <a href="dashboard.php" class="menu-item">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a>
                <a href="products.php" class="menu-item active">
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
            <h1 class="page-title">Gerenciar Produtos</h1>
            <div class="header-actions">
                <a href="product_form.php" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Novo Produto
                </a>
            </div>
        </div>
        
        <?php if (!empty($deleteMessage)): ?>
            <div class="message message-success">
                <?php echo $deleteMessage; ?>
            </div>
        <?php endif; ?>
        
        <div class="filters">
            <form method="get" action="products.php" class="filter-form">
                <input type="hidden" name="sort" value="<?php echo $sortBy; ?>">
                <input type="hidden" name="order" value="<?php echo $sortOrder; ?>">
                
                <div class="filter-group">
                    <label class="filter-label">Categoria</label>
                    <select name="family" onchange="this.form.submit()">
                        <option value="">Todas as categorias</option>
                        <?php foreach ($families as $family): ?>
                            <option value="<?php echo $family['id']; ?>" <?php echo ($familyId == $family['id']) ? 'selected' : ''; ?>>
                                <?php echo $family['name']; ?> (<?php echo $family['code']; ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label class="filter-label">Buscar</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" name="search" class="search-input" placeholder="Digite referência ou nome..." value="<?php echo $search; ?>">
                        <button type="submit" class="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </form>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-list"></i>
                    Lista de Produtos
                </h2>
                <div class="total-products">
                    Total: <?php echo $total; ?> produtos
                </div>
            </div>
            <div class="card-body">
                <?php if (empty($products)): ?>
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>Nenhum produto encontrado</h3>
                        <p>Tente modificar os filtros ou adicione novos produtos ao catálogo.</p>
                        <a href="product_form.php" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Adicionar Produto
                        </a>
                    </div>
                <?php else: ?>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th width="60">Imagem</th>
                                    <th width="120">
                                        <a href="<?php echo getSortUrl('reference', $sortBy, $sortOrder); ?>">
                                            Referência <?php echo getSortIcon('reference', $sortBy, $sortOrder); ?>
                                        </a>
                                    </th>
                                    <th>
                                        <a href="<?php echo getSortUrl('name', $sortBy, $sortOrder); ?>">
                                            Produto <?php echo getSortIcon('name', $sortBy, $sortOrder); ?>
                                        </a>
                                    </th>
                                    <th>
                                        <a href="<?php echo getSortUrl('family_id', $sortBy, $sortOrder); ?>">
                                            Categoria <?php echo getSortIcon('family_id', $sortBy, $sortOrder); ?>
                                        </a>
                                    </th>
                                    <th>
                                        <a href="<?php echo getSortUrl('sale_price', $sortBy, $sortOrder); ?>">
                                            Preço <?php echo getSortIcon('sale_price', $sortBy, $sortOrder); ?>
                                        </a>
                                    </th>
                                    <th>
                                        <a href="<?php echo getSortUrl('current_stock', $sortBy, $sortOrder); ?>">
                                            Estoque <?php echo getSortIcon('current_stock', $sortBy, $sortOrder); ?>
                                        </a>
                                    </th>
                                    <th width="120">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($products as $product): ?>
                                    <tr>
                                        <td>
                                            <?php if (!empty($product['image_filename'])): ?>
                                                <img src="<?php echo MEDIA_URL . '/' . $product['image_filename']; ?>" class="thumbnail" alt="<?php echo $product['reference']; ?>">
                                            <?php else: ?>
                                                <div class="thumbnail" style="background-color: #333; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-image" style="opacity: 0.3;"></i>
                                                </div>
                                            <?php endif; ?>
                                        </td>
                                        <td class="reference"><?php echo $product['reference']; ?></td>
                                        <td><?php echo !empty($product['name']) ? $product['name'] : 'Sem nome'; ?></td>
                                        <td><?php echo $product['family_name']; ?> (<?php echo $product['family_code']; ?>)</td>
                                        <td><?php echo formatCurrency($product['sale_price']); ?></td>
                                        <td>
                                            <?php if ($product['current_stock'] <= 0): ?>
                                                <span class="stock-status stock-out">Sem estoque</span>
                                            <?php elseif ($product['current_stock'] < 5): ?>
                                                <span class="stock-status stock-low"><?php echo $product['current_stock']; ?> unid.</span>
                                            <?php else: ?>
                                                <span class="stock-status stock-available"><?php echo $product['current_stock']; ?> unid.</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <a href="product_form.php?id=<?php echo $product['id']; ?>" class="btn btn-outline btn-sm" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <button type="button" class="btn btn-danger btn-sm delete-btn" 
                                                        data-id="<?php echo $product['id']; ?>" 
                                                        data-reference="<?php echo $product['reference']; ?>"
                                                        title="Excluir">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <?php if ($totalPages > 1): ?>
                        <div class="pagination">
                            <?php if ($page > 1): ?>
                                <a href="?page=<?php echo ($page - 1); ?>&sort=<?php echo $sortBy; ?>&order=<?php echo $sortOrder; ?><?php echo ($familyId ? '&family=' . $familyId : ''); ?><?php echo ($search ? '&search=' . urlencode($search) : ''); ?>">
                                    <i class="fas fa-chevron-left"></i>
                                </a>
                            <?php endif; ?>
                            
                            <?php
                            $startPage = max(1, $page - 2);
                            $endPage = min($totalPages, $startPage + 4);
                            
                            if ($startPage > 1) {
                                echo '<a href="?page=1&sort=' . $sortBy . '&order=' . $sortOrder . ($familyId ? '&family=' . $familyId : '') . ($search ? '&search=' . urlencode($search) : '') . '">1</a>';
                                if ($startPage > 2) {
                                    echo '<span>...</span>';
                                }
                            }
                            
                            for ($i = $startPage; $i <= $endPage; $i++):
                            ?>
                                <?php if ($i == $page): ?>
                                    <span class="current"><?php echo $i; ?></span>
                                <?php else: ?>
                                    <a href="?page=<?php echo $i; ?>&sort=<?php echo $sortBy; ?>&order=<?php echo $sortOrder; ?><?php echo ($familyId ? '&family=' . $familyId : ''); ?><?php echo ($search ? '&search=' . urlencode($search) : ''); ?>">
                                        <?php echo $i; ?>
                                    </a>
                                <?php endif; ?>
                            <?php endfor;
                            
                            if ($endPage < $totalPages) {
                                if ($endPage < $totalPages - 1) {
                                    echo '<span>...</span>';
                                }
                                echo '<a href="?page=' . $totalPages . '&sort=' . $sortBy . '&order=' . $sortOrder . ($familyId ? '&family=' . $familyId : '') . ($search ? '&search=' . urlencode($search) : '') . '">' . $totalPages . '</a>';
                            }
                            ?>
                            
                            <?php if ($page < $totalPages): ?>
                                <a href="?page=<?php echo ($page + 1); ?>&sort=<?php echo $sortBy; ?>&order=<?php echo $sortOrder; ?><?php echo ($familyId ? '&family=' . $familyId : ''); ?><?php echo ($search ? '&search=' . urlencode($search) : ''); ?>">
                                    <i class="fas fa-chevron-right"></i>
                                </a>
                            <?php endif; ?>
                        </div>
                        <div class="pagination-info">
                            Mostrando <?php echo ($offset + 1); ?>-<?php echo min($offset + $perPage, $total); ?> de <?php echo $total; ?> produtos
                        </div>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Confirmar Exclusão</h3>
            </div>
            <div class="modal-body">
                <p>Tem certeza que deseja excluir o produto <strong id="deleteProductRef"></strong>?</p>
                <p>Esta ação não pode ser desfeita.</p>
            </div>
            <div class="modal-footer">
                <button id="cancelDelete" class="btn btn-outline">Cancelar</button>
                <a href="#" id="confirmDelete" class="btn btn-danger">Excluir</a>
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
        
        // Delete confirmation modal
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const deleteModal = document.getElementById('deleteModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');
        const deleteProductRef = document.getElementById('deleteProductRef');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const productRef = this.getAttribute('data-reference');
                
                deleteProductRef.textContent = productRef;
                confirmDelete.href = `products.php?action=delete&id=${productId}`;
                deleteModal.classList.add('show-modal');
            });
        });
        
        cancelDelete.addEventListener('click', function() {
            deleteModal.classList.remove('show-modal');
        });
        
        window.addEventListener('click', function(event) {
            if (event.target === deleteModal) {
                deleteModal.classList.remove('show-modal');
            }
        });
    </script>
</body>
</html> 