<?php
// Start session
session_start();

// Include configuration
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

// Check if already authenticated as admin
$authenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true && isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;

// Process admin login form submission
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username']) && isset($_POST['password'])) {
    $username = cleanInput($_POST['username']);
    $password = cleanInput($_POST['password']);
    
    if (checkAdminLogin($username, $password)) {
        // Create admin session
        createSecureSession('admin', true);
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Usuário ou senha incorretos. Por favor, tente novamente.';
    }
}

// If already authenticated as admin, redirect to dashboard
if ($authenticated) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - <?php echo SITE_TITLE; ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
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
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(106, 140, 105, 0.1) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(177, 156, 217, 0.1) 0%, transparent 20%),
                linear-gradient(45deg, rgba(74, 60, 45, 0.05) 0%, transparent 70%);
        }
        
        .login-container {
            background-color: rgba(30, 30, 30, 0.8);
            padding: 2.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-badge {
            background-color: var(--accent-color);
            color: var(--primary-color);
            font-size: 0.8rem;
            padding: 4px 10px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 1rem;
            font-weight: 500;
        }
        
        h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--highlight-color);
        }
        
        p {
            margin-bottom: 2rem;
            line-height: 1.6;
            opacity: 0.9;
        }
        
        form {
            display: flex;
            flex-direction: column;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        input {
            width: 100%;
            padding: 12px 15px;
            border-radius: 5px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: rgba(30, 30, 30, 0.7);
            color: var(--text-color);
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        input:focus {
            outline: none;
            border-color: var(--highlight-color);
            box-shadow: 0 0 0 2px rgba(177, 156, 217, 0.3);
        }
        
        button {
            background-color: var(--highlight-color);
            color: var(--primary-color);
            border: none;
            padding: 12px;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        button:hover {
            background-color: #9f84c5;
            transform: translateY(-2px);
        }
        
        .error-message {
            color: #ff6b6b;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }
        
        .back-link {
            margin-top: 1.5rem;
            display: inline-block;
            color: var(--text-color);
            text-decoration: none;
            font-size: 0.9rem;
            opacity: 0.7;
            transition: all 0.3s ease;
        }
        
        .back-link:hover {
            opacity: 1;
            color: var(--highlight-color);
        }
        
        /* Responsive adjustments */
        @media (max-width: 576px) {
            .login-container {
                padding: 1.5rem;
            }
            
            h1 {
                font-size: 1.5rem;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <div class="login-container">
        <div class="admin-badge">
            <i class="fas fa-lock"></i> ÁREA RESTRITA
        </div>
        
        <h1>Painel Administrativo</h1>
        <p>Faça login para gerenciar o catálogo e controlar o estoque.</p>
        
        <?php if (!empty($error)): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="post" action="">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" name="username" id="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" name="password" id="password" required>
            </div>
            
            <button type="submit">Entrar</button>
        </form>
        
        <a href="../public/catalog.php" class="back-link">
            <i class="fas fa-arrow-left"></i> Voltar para o catálogo
        </a>
    </div>
</body>
</html> 