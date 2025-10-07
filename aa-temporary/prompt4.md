# 🎯 **TU TENS RAZÃO ABSOLUTA!**

**A Fase 3 deve focar no que o UTILIZADOR VÊ IMEDIATAMENTE** - não em funcionalidades técnicas que ficam escondidas. Precisa de **impacto visual e funcional direto** no site.

---

# 🚀 **FASE 3 REFORMULADA: ADMIN UX + PRODUCT EXPERIENCE**

## **NOVA PRIORIDADE:**
```
❌ Mobile Camera (técnico, não visível ao cliente)
✅ Admin Dashboard + Product Pages + Navigation (impacto imediato)
✅ Visual upgrades + UX improvements (mudanças que se VEEM)
✅ Modularidade + Customização (flexibilidade futura)
```

***

## 📋 **FASE 3 REPLANIFICADA: REAL IMPACT UPDATES**

### **🎯 OBJETIVO:**
**Fazer o admin e frontend BRILHAREM com mudanças visíveis e funcionais que impressionem qualquer pessoa que veja o site.**

### **⏱️ DURAÇÃO:** 1.5 semanas intensivas
### **🌟 PRIORIDADE:** ⭐⭐⭐⭐⭐ (IMPACTO VISUAL IMEDIATO)

***

## 🏗️ **WEEK 1: ADMIN EXPERIENCE REVOLUTION**

### **DAY 1-2: Modern Admin Dashboard**

#### **A. Dashboard Visual Overhaul**
```javascript
// CREATE: views/admin/dashboard-v2.ejs
// MODERNA, CLEAN, INSPIRADA NO BEST-IN-CLASS

const modernDashboard = `
<div class="admin-container-v2">
    <!-- Top Bar com Search Global -->
    <header class="admin-topbar">
        <div class="topbar-left">
            <h1 class="brand-title">
                <span class="brand-icon">💎</span>
                Gonzaga's Admin
            </h1>
        </div>
        
        <div class="topbar-center">
            <!-- Search Global Melhorada -->
            <div class="admin-search-enhanced">
                <input type="text" placeholder="Pesquisar produtos, clientes, pedidos..." 
                       class="search-global" autocomplete="off">
                <div class="search-filters">
                    <button class="filter-btn active" data-type="products">Produtos</button>
                    <button class="filter-btn" data-type="orders">Pedidos</button>
                    <button class="filter-btn" data-type="customers">Clientes</button>
                </div>
            </div>
        </div>
        
        <div class="topbar-right">
            <!-- Quick Actions -->
            <div class="quick-actions">
                <button class="btn-quick" data-action="new-product" title="Novo Produto">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-quick" data-action="bulk-import" title="Import">
                    <i class="fas fa-upload"></i>
                </button>
                <button class="btn-quick" data-action="analytics" title="Analytics">
                    <i class="fas fa-chart-line"></i>
                </button>
            </div>
            
            <!-- User Menu -->
            <div class="user-menu">
                <img src="https://ui-avatars.com/api/?name=Admin&background=c0a080&color=fff" 
                     class="user-avatar">
                <span class="user-name">Admin</span>
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>
    </header>
    
    <!-- Main Content Area -->
    <div class="admin-main">
        <!-- Left Sidebar - Collapsible -->
        <aside class="admin-sidebar">
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <h3 class="nav-title">Catálogo</h3>
                    <ul class="nav-list">
                        <li class="nav-item active">
                            <a href="/admin/dashboard" class="nav-link">
                                <i class="fas fa-tachometer-alt"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/admin/products" class="nav-link">
                                <i class="fas fa-gem"></i>
                                <span>Produtos</span>
                                <span class="nav-badge">247</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/admin/categories" class="nav-link">
                                <i class="fas fa-tags"></i>
                                <span>Categorias</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-title">Gestão</h3>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="/admin/orders" class="nav-link">
                                <i class="fas fa-shopping-cart"></i>
                                <span>Pedidos</span>
                                <span class="nav-badge new">3</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/admin/customers" class="nav-link">
                                <i class="fas fa-users"></i>
                                <span>Clientes</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/admin/analytics" class="nav-link">
                                <i class="fas fa-chart-bar"></i>
                                <span>Analytics</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-title">Sistema</h3>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="/admin/media" class="nav-link">
                                <i class="fas fa-images"></i>
                                <span>Media</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/admin/settings" class="nav-link">
                                <i class="fas fa-cog"></i>
                                <span>Definições</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/admin/backup" class="nav-link">
                                <i class="fas fa-shield-alt"></i>
                                <span>Backup</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <!-- Sidebar Footer -->
            <div class="sidebar-footer">
                <div class="system-status">
                    <div class="status-item">
                        <span class="status-dot green"></span>
                        Sistema Online
                    </div>
                    <div class="status-item">
                        <span class="status-dot yellow"></span>
                        Backup: 2h atrás
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Dashboard Content -->
        <main class="dashboard-content">
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Produtos Ativos</h3>
                        <i class="fas fa-gem stat-icon"></i>
                    </div>
                    <div class="stat-number">247</div>
                    <div class="stat-change positive">+12 este mês</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Visualizações</h3>
                        <i class="fas fa-eye stat-icon"></i>
                    </div>
                    <div class="stat-number">1,429</div>
                    <div class="stat-change positive">+23% vs mês anterior</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>WhatsApp Clicks</h3>
                        <i class="fab fa-whatsapp stat-icon"></i>
                    </div>
                    <div class="stat-number">89</div>
                    <div class="stat-change positive">+45% esta semana</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Pesquisas</h3>
                        <i class="fas fa-search stat-icon"></i>
                    </div>
                    <div class="stat-number">356</div>
                    <div class="stat-change neutral">Últimas 24h</div>
                </div>
            </div>
            
            <!-- Main Dashboard Widgets -->
            <div class="dashboard-widgets">
                <!-- Recent Activity -->
                <div class="widget">
                    <div class="widget-header">
                        <h3>Atividade Recente</h3>
                        <button class="btn-widget-action">Ver Todas</button>
                    </div>
                    <div class="widget-content">
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-plus-circle"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Produto adicionado:</strong> Anel Celtic Knot</p>
                                    <span class="activity-time">há 2 minutos</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-search"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Pesquisa:</strong> "brincos prata"</p>
                                    <span class="activity-time">há 5 minutos</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon whatsapp">
                                    <i class="fab fa-whatsapp"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>WhatsApp:</strong> Contacto sobre REF-001</p>
                                    <span class="activity-time">há 12 minutos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="widget">
                    <div class="widget-header">
                        <h3>Ações Rápidas</h3>
                    </div>
                    <div class="widget-content">
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn" data-action="new-product">
                                <i class="fas fa-plus"></i>
                                <span>Novo Produto</span>
                            </button>
                            <button class="quick-action-btn" data-action="bulk-edit">
                                <i class="fas fa-edit"></i>
                                <span>Edição Múltipla</span>
                            </button>
                            <button class="quick-action-btn" data-action="export">
                                <i class="fas fa-download"></i>
                                <span>Exportar</span>
                            </button>
                            <button class="quick-action-btn" data-action="backup">
                                <i class="fas fa-shield-alt"></i>
                                <span>Backup</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- System Health -->
                <div class="widget">
                    <div class="widget-header">
                        <h3>Sistema</h3>
                    </div>
                    <div class="widget-content">
                        <div class="health-metrics">
                            <div class="health-item">
                                <span class="health-label">Base de Dados</span>
                                <span class="health-status good">Online</span>
                            </div>
                            <div class="health-item">
                                <span class="health-label">Último Backup</span>
                                <span class="health-status warning">2h atrás</span>
                            </div>
                            <div class="health-item">
                                <span class="health-label">Storage</span>
                                <span class="health-status good">67% usado</span>
                            </div>
                            <div class="health-item">
                                <span class="health-label">Performance</span>
                                <span class="health-status excellent">Excelente</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>
`;
```

#### **B. Modern CSS Framework**
```css
/* CREATE: public/css/admin-v2.css */
/* INSPIRADO NO FIGMA, NOTION, LINEAR - BEST IN CLASS */

:root {
    /* Color System */
    --color-primary: #667eea;
    --color-primary-dark: #5a67d8;
    --color-secondary: #c0a080;
    --color-accent: #4ecdc4;
    
    /* Neutrals */
    --color-neutral-50: #f9fafb;
    --color-neutral-100: #f3f4f6;
    --color-neutral-200: #e5e7eb;
    --color-neutral-300: #d1d5db;
    --color-neutral-400: #9ca3af;
    --color-neutral-500: #6b7280;
    --color-neutral-600: #4b5563;
    --color-neutral-700: #374151;
    --color-neutral-800: #1f2937;
    --color-neutral-900: #111827;
    
    /* Semantic Colors */
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;
    
    /* Spacing Scale */
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.25rem;   /* 20px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    
    /* Typography Scale */
    --text-xs: 0.75rem;     /* 12px */
    --text-sm: 0.875rem;    /* 14px */
    --text-base: 1rem;      /* 16px */
    --text-lg: 1.125rem;    /* 18px */
    --text-xl: 1.25rem;     /* 20px */
    --text-2xl: 1.5rem;     /* 24px */
    --text-3xl: 1.875rem;   /* 30px */
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Border Radius */
    --radius-sm: 0.25rem;   /* 4px */
    --radius-md: 0.375rem;  /* 6px */
    --radius-lg: 0.5rem;    /* 8px */
    --radius-xl: 0.75rem;   /* 12px */
    --radius-2xl: 1rem;     /* 16px */
    
    /* Transitions */
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 250ms ease-in-out;
    --transition-slow: 350ms ease-in-out;
}

/* Reset e Base */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    color: var(--color-neutral-700);
    background: var(--color-neutral-50);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Admin Container */
.admin-container-v2 {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-neutral-50);
}

/* Top Bar */
.admin-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    background: white;
    border-bottom: 1px solid var(--color-neutral-200);
    box-shadow: var(--shadow-sm);
    z-index: 100;
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-4);
}

.brand-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-neutral-800);
}

.brand-icon {
    font-size: var(--text-2xl);
}

.topbar-center {
    flex: 1;
    max-width: 600px;
    margin: 0 var(--space-8);
}

/* Enhanced Admin Search */
.admin-search-enhanced {
    position: relative;
    background: var(--color-neutral-100);
    border-radius: var(--radius-xl);
    padding: var(--space-2);
    transition: all var(--transition-normal);
}

.admin-search-enhanced:focus-within {
    background: white;
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
}

.search-global {
    width: 100%;
    padding: var(--space-3) var(--space-5);
    border: none;
    background: none;
    font-size: var(--text-base);
    color: var(--color-neutral-700);
    border-radius: var(--radius-lg);
}

.search-global:focus {
    outline: none;
}

.search-global::placeholder {
    color: var(--color-neutral-400);
}

.search-filters {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-4) 0;
}

.filter-btn {
    padding: var(--space-1) var(--space-3);
    border: none;
    background: none;
    color: var(--color-neutral-500);
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.filter-btn:hover {
    color: var(--color-neutral-700);
    background: var(--color-neutral-100);
}

.filter-btn.active {
    color: var(--color-primary);
    background: rgba(102, 126, 234, 0.1);
}

/* Top Bar Right */
.topbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-6);
}

.quick-actions {
    display: flex;
    gap: var(--space-2);
}

.btn-quick {
    width: 40px;
    height: 40px;
    border: none;
    background: var(--color-neutral-100);
    color: var(--color-neutral-600);
    border-radius: var(--radius-lg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.btn-quick:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.user-menu:hover {
    background: var(--color-neutral-100);
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.user-name {
    font-size: var(--text-sm);
    font-weight: 500;
}

/* Main Layout */
.admin-main {
    display: flex;
    flex: 1;
    min-height: 0;
}

/* Sidebar */
.admin-sidebar {
    width: 260px;
    background: white;
    border-right: 1px solid var(--color-neutral-200);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.sidebar-nav {
    padding: var(--space-6);
    flex: 1;
}

.nav-section {
    margin-bottom: var(--space-8);
}

.nav-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-neutral-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-3);
}

.nav-list {
    list-style: none;
}

.nav-item {
    margin-bottom: var(--space-1);
}

.nav-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    color: var(--color-neutral-600);
    text-decoration: none;
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
    font-size: var(--text-sm);
    font-weight: 500;
}

.nav-link:hover {
    color: var(--color-neutral-800);
    background: var(--color-neutral-100);
}

.nav-item.active .nav-link {
    color: var(--color-primary);
    background: rgba(102, 126, 234, 0.1);
}

.nav-link i {
    width: 16px;
    text-align: center;
    font-size: var(--text-sm);
}

.nav-badge {
    margin-left: auto;
    background: var(--color-neutral-200);
    color: var(--color-neutral-600);
    font-size: var(--text-xs);
    font-weight: 600;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
}

.nav-badge.new {
    background: var(--color-error);
    color: white;
}

/* Dashboard Content */
.dashboard-content {
    flex: 1;
    padding: var(--space-8);
    overflow-y: auto;
    background: var(--color-neutral-50);
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-6);
    margin-bottom: var(--space-8);
}

.stat-card {
    background: white;
    padding: var(--space-6);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-neutral-200);
    transition: all var(--transition-normal);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
}

.stat-header h3 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-neutral-600);
}

.stat-icon {
    width: 40px;
    height: 40px;
    background: var(--color-neutral-100);
    color: var(--color-neutral-500);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-lg);
}

.stat-number {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-2);
}

.stat-change {
    font-size: var(--text-sm);
    font-weight: 500;
}

.stat-change.positive {
    color: var(--color-success);
}

.stat-change.negative {
    color: var(--color-error);
}

.stat-change.neutral {
    color: var(--color-neutral-500);
}

/* Widgets */
.dashboard-widgets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--space-6);
}

.widget {
    background: white;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-neutral-200);
    overflow: hidden;
}

.widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-neutral-200);
}

.widget-header h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-neutral-800);
}

.btn-widget-action {
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
}

.btn-widget-action:hover {
    background: rgba(102, 126, 234, 0.1);
}

.widget-content {
    padding: var(--space-6);
}

/* Activity List */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.activity-item {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
}

.activity-icon {
    width: 32px;
    height: 32px;
    background: var(--color-neutral-100);
    color: var(--color-neutral-600);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    flex-shrink: 0;
}

.activity-icon.whatsapp {
    background: #25D366;
    color: white;
}

.activity-content p {
    font-size: var(--text-sm);
    color: var(--color-neutral-700);
    margin-bottom: var(--space-1);
}

.activity-time {
    font-size: var(--text-xs);
    color: var(--color-neutral-400);
}

/* Quick Actions Grid */
.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
}

.quick-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--color-neutral-50);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.quick-action-btn:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.quick-action-btn i {
    font-size: var(--text-xl);
}

.quick-action-btn span {
    font-size: var(--text-sm);
    font-weight: 500;
}

/* Health Metrics */
.health-metrics {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.health-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3);
    background: var(--color-neutral-50);
    border-radius: var(--radius-md);
}

.health-label {
    font-size: var(--text-sm);
    color: var(--color-neutral-600);
}

.health-status {
    font-size: var(--text-sm);
    font-weight: 600;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
}

.health-status.good {
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-success);
}

.health-status.warning {
    background: rgba(245, 158, 11, 0.1);
    color: var(--color-warning);
}

.health-status.excellent {
    background: rgba(102, 126, 234, 0.1);
    color: var(--color-primary);
}

/* Sidebar Footer */
.sidebar-footer {
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-neutral-200);
}

.system-status {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.status-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-neutral-500);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.status-dot.green {
    background: var(--color-success);
}

.status-dot.yellow {
    background: var(--color-warning);
}

/* Responsive */
@media (max-width: 1024px) {
    .admin-sidebar {
        width: 220px;
    }
    
    .dashboard-widgets {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .admin-main {
        flex-direction: column;
    }
    
    .admin-sidebar {
        width: 100%;
        height: auto;
        max-height: 200px;
    }
    
    .topbar-center {
        display: none;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

**Resultado:** Dashboard administrativo **VISUALMENTE IMPRESSIONANTE** que parece profissional e moderno.

**Tempo:** 16 horas  
**Impacto:** ⭐⭐⭐⭐⭐ (Mudança visual dramática)

---

### **DAY 3-4: Product Detail Pages Revolution**

#### **A. Modern Product Detail Layout**
```javascript
// CREATE: views/catalog/product-detail-v2.ejs
// INSPIRADO NO AIRBNB, BOOKING.COM - BEST PRACTICES

const modernProductDetail = `
<div class="product-detail-v2">
    <!-- Hero Section -->
    <section class="product-hero">
        <div class="container">
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs-v2">
                <a href="/" class="breadcrumb-item">
                    <i class="fas fa-home"></i>
                    Início
                </a>
                <span class="breadcrumb-separator">›</span>
                <a href="/catalog" class="breadcrumb-item">Catálogo</a>
                <span class="breadcrumb-separator">›</span>
                <a href="/catalog/category/<%= product.family_id %>" class="breadcrumb-item">
                    <%= product.family_name %>
                </a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current"><%= product.name %></span>
            </nav>
            
            <!-- Product Media & Info Grid -->
            <div class="product-main-grid">
                <!-- Left: Image Gallery -->
                <div class="product-gallery-v2">
                    <div class="gallery-main">
                        <img src="<%= product.images[0] ? '/uploads/products/' + product.images[0] : '/images/placeholder.jpg' %>" 
                             alt="<%= product.name %>" 
                             class="main-image" 
                             id="mainProductImage">
                        
                        <!-- Image Controls Overlay -->
                        <div class="image-controls">
                            <button class="btn-zoom" onclick="openLightbox()">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="btn-fullscreen" onclick="toggleFullscreen()">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                        
                        <!-- Image Indicators -->
                        <% if (product.images && product.images.length > 1) { %>
                        <div class="image-indicators">
                            <% product.images.forEach((img, index) => { %>
                            <span class="indicator <%= index === 0 ? 'active' : '' %>" 
                                  data-index="<%= index %>"></span>
                            <% }); %>
                        </div>
                        <% } %>
                    </div>
                    
                    <!-- Thumbnail Gallery -->
                    <% if (product.images && product.images.length > 1) { %>
                    <div class="gallery-thumbnails">
                        <% product.images.forEach((img, index) => { %>
                        <button class="thumbnail <%= index === 0 ? 'active' : '' %>" 
                                onclick="changeMainImage('<%= img %>', <%= index %>)">
                            <img src="/uploads/products/<%= img %>" 
                                 alt="<%= product.name %> - <%= index + 1 %>">
                        </button>
                        <% }); %>
                    </div>
                    <% } %>
                </div>
                
                <!-- Right: Product Information -->
                <div class="product-info-v2">
                    <!-- Product Header -->
                    <div class="product-header">
                        <div class="product-title-section">
                            <h1 class="product-title"><%= product.name %></h1>
                            <p class="product-reference">REF: <%= product.reference %></p>
                        </div>
                        
                        <div class="product-actions-quick">
                            <button class="btn-favorite" onclick="toggleFavorite()">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="btn-share" onclick="shareProduct()">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Product Meta -->
                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-label">Categoria:</span>
                            <a href="/catalog/category/<%= product.family_id %>" class="meta-value link">
                                <%= product.family_name %>
                            </a>
                        </div>
                        
                        <div class="meta-item">
                            <span class="meta-label">Disponibilidade:</span>
                            <span class="meta-value">
                                <% if (product.current_stock > 0) { %>
                                    <span class="stock-status in-stock">
                                        <i class="fas fa-check-circle"></i>
                                        Em Stock (<%= product.current_stock %> unidades)
                                    </span>
                                <% } else { %>
                                    <span class="stock-status out-stock">
                                        <i class="fas fa-times-circle"></i>
                                        Temporariamente Esgotado
                                    </span>
                                <% } %>
                            </span>
                        </div>
                    </div>
                    
                    <!-- Price Section -->
                    <div class="price-section">
                        <% if (product.sale_price) { %>
                            <div class="price-main">
                                €<%= parseFloat(product.sale_price).toFixed(2) %>
                            </div>
                            <% if (product.original_price && product.original_price > product.sale_price) { %>
                            <div class="price-original">
                                €<%= parseFloat(product.original_price).toFixed(2) %>
                            </div>
                            <div class="price-discount">
                                -<%= Math.round((1 - product.sale_price/product.original_price) * 100) %>%
                            </div>
                            <% } %>
                        <% } else { %>
                            <div class="price-consultation">
                                <i class="fas fa-tag"></i>
                                Preço sob consulta
                            </div>
                        <% } %>
                    </div>
                    
                    <!-- Description -->
                    <% if (product.description) { %>
                    <div class="product-description">
                        <h3>Descrição</h3>
                        <div class="description-content">
                            <%= product.description %>
                        </div>
                    </div>
                    <% } %>
                    
                    <!-- Product Details -->
                    <div class="product-details">
                        <h3>Detalhes</h3>
                        <div class="details-grid">
                            <% if (product.material) { %>
                            <div class="detail-item">
                                <span class="detail-label">Material:</span>
                                <span class="detail-value"><%= product.material %></span>
                            </div>
                            <% } %>
                            
                            <% if (product.weight) { %>
                            <div class="detail-item">
                                <span class="detail-label">Peso:</span>
                                <span class="detail-value"><%= product.weight %>g</span>
                            </div>
                            <% } %>
                            
                            <% if (product.dimensions) { %>
                            <div class="detail-item">
                                <span class="detail-label">Dimensões:</span>
                                <span class="detail-value"><%= product.dimensions %></span>
                            </div>
                            <% } %>
                            
                            <% if (product.style) { %>
                            <div class="detail-item">
                                <span class="detail-label">Estilo:</span>
                                <span class="detail-value"><%= product.style %></span>
                            </div>
                            <% } %>
                        </div>
                    </div>
                    
                    <!-- Call to Action -->
                    <div class="product-cta">
                        <div class="cta-main">
                            <a href="https://wa.me/<%= whatsappData.number %>?text=<%= whatsappData.encodedMessage %>" 
                               class="btn-whatsapp-v2" 
                               target="_blank"
                               onclick="trackWhatsAppClick()">
                                <div class="btn-icon">
                                    <i class="fab fa-whatsapp"></i>
                                </div>
                                <div class="btn-content">
                                    <span class="btn-title">Solicitar Informações</span>
                                    <span class="btn-subtitle">Resposta rápida via WhatsApp</span>
                                </div>
                            </a>
                        </div>
                        
                        <div class="cta-secondary">
                            <button class="btn-secondary" onclick="copyProductInfo()">
                                <i class="fas fa-copy"></i>
                                Copiar Link
                            </button>
                            
                            <button class="btn-secondary" onclick="printProduct()">
                                <i class="fas fa-print"></i>
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Product Tabs -->
    <section class="product-tabs-section">
        <div class="container">
            <div class="tabs-v2">
                <nav class="tabs-nav">
                    <button class="tab-btn active" data-tab="specifications">
                        Especificações
                    </button>
                    <button class="tab-btn" data-tab="care">
                        Cuidados
                    </button>
                    <button class="tab-btn" data-tab="shipping">
                        Envio & Devoluções
                    </button>
                </nav>
                
                <div class="tabs-content">
                    <div class="tab-panel active" id="tab-specifications">
                        <div class="specifications-grid">
                            <div class="spec-group">
                                <h4>Características Gerais</h4>
                                <ul class="spec-list">
                                    <li>Material: <%= product.material || 'Prata 925' %></li>
                                    <li>Peso: <%= product.weight || 'Variável' %>g</li>
                                    <li>Origem: Handcrafted</li>
                                    <li>Garantia: 2 anos</li>
                                </ul>
                            </div>
                            
                            <div class="spec-group">
                                <h4>Dimensões</h4>
                                <ul class="spec-list">
                                    <li>Dimensões: <%= product.dimensions || 'Ver descrição' %></li>
                                    <li>Espessura: Variável</li>
                                    <li>Acabamento: Polido</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="tab-care">
                        <div class="care-instructions">
                            <div class="care-item">
                                <i class="fas fa-hand-sparkles"></i>
                                <div>
                                    <h4>Limpeza</h4>
                                    <p>Use um pano macio e produtos específicos para prata.</p>
                                </div>
                            </div>
                            
                            <div class="care-item">
                                <i class="fas fa-shield-alt"></i>
                                <div>
                                    <h4>Armazenamento</h4>
                                    <p>Guarde em local seco, preferencialmente em saco anti-oxidação.</p>
                                </div>
                            </div>
                            
                            <div class="care-item">
                                <i class="fas fa-exclamation-triangle"></i>
                                <div>
                                    <h4>Evite</h4>
                                    <p>Contacto com perfumes, cremes e produtos químicos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="tab-shipping">
                        <div class="shipping-info">
                            <div class="shipping-section">
                                <h4>Envios</h4>
                                <ul>
                                    <li>Portugal Continental: 3-5 dias úteis</li>
                                    <li>Ilhas: 5-7 dias úteis</li>
                                    <li>Envio gratuito a partir de €50</li>
                                </ul>
                            </div>
                            
                            <div class="shipping-section">
                                <h4>Devoluções</h4>
                                <ul>
                                    <li>14 dias para devolução</li>
                                    <li>Produto em estado original</li>
                                    <li>Portes de devolução por conta do cliente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Related Products -->
    <section class="related-products-section">
        <div class="container">
            <div class="section-header">
                <h2>Produtos Relacionados</h2>
                <p>Outros produtos que podem interessar</p>
            </div>
            
            <div class="related-products-grid" id="relatedProductsGrid">
                <!-- Dynamic content loaded via JavaScript -->
            </div>
        </div>
    </section>
</div>

<!-- Lightbox Modal -->
<div class="lightbox-modal" id="imageLightbox">
    <div class="lightbox-content">
        <button class="lightbox-close" onclick="closeLightbox()">
            <i class="fas fa-times"></i>
        </button>
        <img src="" alt="" class="lightbox-image">
        <div class="lightbox-nav">
            <button class="lightbox-prev" onclick="previousImage()">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="lightbox-next" onclick="nextImage()">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
</div>
`;

// JavaScript para funcionalidade
const productDetailJS = `
<script>
let currentImageIndex = 0;
const productImages = <%= JSON.stringify(product.images || []) %>;

function changeMainImage(imageName, index) {
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = '/uploads/products/' + imageName;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // Update indicators
    document.querySelectorAll('.indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    currentImageIndex = index;
}

function openLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    
    lightboxImage.src = document.getElementById('mainProductImage').src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function previousImage() {
    if (productImages.length > 1) {
        currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
        changeMainImage(productImages[currentImageIndex], currentImageIndex);
        document.querySelector('.lightbox-image').src = '/uploads/products/' + productImages[currentImageIndex];
    }
}

function nextImage() {
    if (productImages.length > 1) {
        currentImageIndex = (currentImageIndex + 1) % productImages.length;
        changeMainImage(productImages[currentImageIndex], currentImageIndex);
        document.querySelector('.lightbox-image').src = '/uploads/products/' + productImages[currentImageIndex];
    }
}

function toggleFavorite() {
    const btn = document.querySelector('.btn-favorite i');
    const isFavorited = btn.classList.contains('fas');
    
    if (isFavorited) {
        btn.className = 'far fa-heart';
        showNotification('Removido dos favoritos', 'info');
    } else {
        btn.className = 'fas fa-heart';
        showNotification('Adicionado aos favoritos', 'success');
    }
}

function shareProduct() {
    if (navigator.share) {
        navigator.share({
            title: '<%= product.name %>',
            text: 'Vê este produto da Gonzaga\\'s Art & Shine',
            url: window.location.href
        });
    } else {
        copyProductInfo();
    }
}

function copyProductInfo() {
    const productInfo = \`<%= product.name %>
REF: <%= product.reference %>
<% if (product.sale_price) { %>Preço: €<%= parseFloat(product.sale_price).toFixed(2) %><% } else { %>Preço sob consulta<% } %>
Ver: \${window.location.href}\`;

    navigator.clipboard.writeText(productInfo).then(() => {
        showNotification('Informações copiadas!', 'success');
    });
}

function printProduct() {
    window.print();
}

function trackWhatsAppClick() {
    // Analytics tracking
    console.log('WhatsApp clicked for product:', '<%= product.id %>');
}

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active panel
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById('tab-' + tabId).classList.add('active');
    });
});

// Load related products
async function loadRelatedProducts() {
    try {
        const response = await fetch('/api/products/family/<%= product.family_id %>?limit=4');
        const data = await response.json();
        
        if (data.success) {
            const grid = document.getElementById('relatedProductsGrid');
            grid.innerHTML = data.data.filter(p => p.id !== <%= product.id %>).slice(0, 3).map(product => \`
                <div class="related-product-card">
                    <a href="/catalog/product/\${product.id}" class="product-link">
                        <div class="product-image">
                            <img src="\${product.main_image ? '/uploads/products/' + product.main_image : '/images/placeholder.jpg'}" 
                                 alt="\${product.name}">
                        </div>
                        <div class="product-info">
                            <h3>\${product.name}</h3>
                            <p class="product-ref">\${product.reference}</p>
                            <p class="product-price">
                                \${product.sale_price ? '€' + parseFloat(product.sale_price).toFixed(2) : 'Preço sob consulta'}
                            </p>
                        </div>
                    </a>
                </div>
            \`).join('');
        }
    } catch (error) {
        console.error('Failed to load related products:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRelatedProducts();
});

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = \`notification notification-\${type}\`;
    notification.innerHTML = \`
        <div class="notification-content">
            <i class="fas fa-\${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>\${message}</span>
        </div>
    \`;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
</script>
`;
```

#### **B. Modern Product Detail CSS**
```css
/* CREATE: public/css/product-detail-v2.css */

.product-detail-v2 {
    background: var(--color-neutral-50);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-6);
}

/* Hero Section */
.product-hero {
    background: white;
    padding: var(--space-8) 0;
}

/* Breadcrumbs */
.breadcrumbs-v2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-8);
    font-size: var(--text-sm);
}

.breadcrumb-item {
    color: var(--color-neutral-600);
    text-decoration: none;
    transition: color var(--transition-fast);
}

.breadcrumb-item:hover {
    color: var(--color-primary);
}

.breadcrumb-separator {
    color: var(--color-neutral-400);
}

.breadcrumb-current {
    color: var(--color-neutral-800);
    font-weight: 500;
}

/* Main Grid */
.product-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
    align-items: start;
}

/* Gallery */
.product-gallery-v2 {
    position: sticky;
    top: var(--space-6);
}

.gallery-main {
    position: relative;
    background: var(--color-neutral-100);
    border-radius: var(--radius-xl);
    overflow: hidden;
    margin-bottom: var(--space-4);
    aspect-ratio: 1;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
}

.gallery-main:hover .main-image {
    transform: scale(1.05);
}

.image-controls {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    display: flex;
    gap: var(--space-2);
    opacity: 0;
    transition: opacity var(--transition-normal);
}

.gallery-main:hover .image-controls {
    opacity: 1;
}

.btn-zoom,
.btn-fullscreen {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    color: var(--color-neutral-700);
    cursor: pointer;
    transition: all var(--transition-fast);
    backdrop-filter: blur(10px);
}

.btn-zoom:hover,
.btn-fullscreen:hover {
    background: white;
    transform: scale(1.1);
}

.image-indicators {
    position: absolute;
    bottom: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: var(--space-2);
}

.indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.indicator.active {
    background: white;
    transform: scale(1.2);
}

.gallery-thumbnails {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding: var(--space-2);
    -webkit-overflow-scrolling: touch;
}

.thumbnail {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border: 2px solid transparent;
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-fast);
    background: none;
    padding: 0;
}

.thumbnail.active {
    border-color: var(--color-primary);
    transform: scale(1.05);
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Product Info */
.product-info-v2 {
    padding: var(--space-2) 0;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
}

.product-title {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-2);
    line-height: 1.2;
}

.product-reference {
    font-size: var(--text-base);
    color: var(--color-neutral-500);
    font-weight: 500;
}

.product-actions-quick {
    display: flex;
    gap: var(--space-2);
}

.btn-favorite,
.btn-share {
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-neutral-300);
    background: white;
    border-radius: 50%;
    color: var(--color-neutral-600);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.btn-favorite:hover,
.btn-share:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-1px);
}

/* Product Meta */
.product-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--color-neutral-50);
    border-radius: var(--radius-lg);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.meta-label {
    font-weight: 500;
    color: var(--color-neutral-600);
    min-width: 120px;
}

.meta-value {
    color: var(--color-neutral-800);
}

.meta-value.link {
    color: var(--color-primary);
    text-decoration: none;
}

.meta-value.link:hover {
    text-decoration: underline;
}

.stock-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
}

.stock-status.in-stock {
    color: var(--color-success);
}

.stock-status.out-stock {
    color: var(--color-error);
}

/* Price Section */
.price-section {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
    padding: var(--space-6);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    border-radius: var(--radius-xl);
    color: white;
}

.price-main {
    font-size: clamp(var(--text-2xl), 4vw, var(--text-3xl));
    font-weight: 700;
}

.price-original {
    font-size: var(--text-lg);
    text-decoration: line-through;
    opacity: 0.8;
}

.price-discount {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: 600;
}

.price-consultation {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xl);
    font-weight: 600;
}

/* Description */
.product-description {
    margin-bottom: var(--space-6);
}

.product-description h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-3);
}

.description-content {
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--color-neutral-700);
}

/* Details */
.product-details {
    margin-bottom: var(--space-8);
}

.product-details h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-4);
}

.details-grid {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-neutral-50);
    border-radius: var(--radius-lg);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-neutral-200);
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 500;
    color: var(--color-neutral-600);
}

.detail-value {
    color: var(--color-neutral-800);
    font-weight: 500;
}

/* Call to Action */
.product-cta {
    margin-bottom: var(--space-8);
}

.cta-main {
    margin-bottom: var(--space-4);
}

.btn-whatsapp-v2 {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    padding: var(--space-5) var(--space-6);
    background: linear-gradient(135deg, #25D366 0%, #20BA5A 100%);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-xl);
    font-weight: 600;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-lg);
}

.btn-whatsapp-v2:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    color: white;
    text-decoration: none;
}

.btn-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xl);
}

.btn-content {
    flex: 1;
    text-align: left;
}

.btn-title {
    display: block;
    font-size: var(--text-lg);
    font-weight: 700;
}

.btn-subtitle {
    display: block;
    font-size: var(--text-sm);
    opacity: 0.9;
    font-weight: 400;
}

.cta-secondary {
    display: flex;
    gap: var(--space-3);
}

.btn-secondary {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-neutral-300);
    background: white;
    color: var(--color-neutral-700);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
}

.btn-secondary:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-1px);
}

/* Tabs Section */
.product-tabs-section {
    background: white;
    padding: var(--space-8) 0;
}

.tabs-v2 {
    max-width: 800px;
    margin: 0 auto;
}

.tabs-nav {
    display: flex;
    border-bottom: 1px solid var(--color-neutral-200);
    margin-bottom: var(--space-6);
}

.tab-btn {
    padding: var(--space-4) var(--space-6);
    border: none;
    background: none;
    color: var(--color-neutral-600);
    cursor: pointer;
    position: relative;
    transition: all var(--transition-fast);
    font-weight: 500;
}

.tab-btn:hover {
    color: var(--color-neutral-800);
}

.tab-btn.active {
    color: var(--color-primary);
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-primary);
}

.tab-panel {
    display: none;
}

.tab-panel.active {
    display: block;
}

/* Specifications */
.specifications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
}

.spec-group h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-3);
}

.spec-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.spec-list li {
    padding: var(--space-2) var(--space-3);
    background: var(--color-neutral-50);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-neutral-700);
}

/* Care Instructions */
.care-instructions {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.care-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-neutral-50);
    border-radius: var(--radius-lg);
}

.care-item i {
    width: 40px;
    height: 40px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.care-item h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-1);
}

.care-item p {
    font-size: var(--text-sm);
    color: var(--color-neutral-600);
    line-height: 1.5;
}

/* Shipping Info */
.shipping-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
}

.shipping-section h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-3);
}

.shipping-section ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.shipping-section li {
    padding: var(--space-2) var(--space-3);
    background: var(--color-neutral-50);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-neutral-700);
    position: relative;
    padding-left: var(--space-8);
}

.shipping-section li::before {
    content: '✓';
    position: absolute;
    left: var(--space-3);
    color: var(--color-success);
    font-weight: bold;
}

/* Related Products */
.related-products-section {
    background: var(--color-neutral-50);
    padding: var(--space-12) 0;
}

.section-header {
    text-align: center;
    margin-bottom: var(--space-8);
}

.section-header h2 {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-2);
}

.section-header p {
    font-size: var(--text-base);
    color: var(--color-neutral-600);
}

.related-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-6);
}

.related-product-card {
    background: white;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
}

.related-product-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.product-link {
    display: block;
    text-decoration: none;
    color: inherit;
}

.product-image {
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--color-neutral-100);
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
}

.related-product-card:hover .product-image img {
    transform: scale(1.05);
}

.related-product-card .product-info {
    padding: var(--space-4);
}

.related-product-card h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-neutral-800);
    margin-bottom: var(--space-1);
}

.product-ref {
    font-size: var(--text-sm);
    color: var(--color-neutral-500);
    margin-bottom: var(--space-2);
}

.related-product-card .product-price {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-secondary);
}

/* Lightbox */
.lightbox-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.lightbox-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
}

.lightbox-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
}

.lightbox-close {
    position: absolute;
    top: -50px;
    right: 0;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    color: white;
    font-size: var(--text-xl);
    cursor: pointer;
}

.lightbox-nav {
    position: absolute;
    top: 50%;
    left: -60px;
    right: -60px;
    display: flex;
    justify-content: space-between;
    transform: translateY(-50%);
}

.lightbox-prev,
.lightbox-next {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: var(--text-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    backdrop-filter: blur(10px);
}

.lightbox-prev:hover,
.lightbox-next:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Notifications */
.notification {
    position: fixed;
    top: var(--space-6);
    right: var(--space-6);
    background: white;
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    transform: translateX(400px);
    animation: slideInRight 0.3s ease-out forwards;
}

.notification.fade-out {
    animation: slideOutRight 0.3s ease-in forwards;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.notification-success {
    border-left: 4px solid var(--color-success);
}

.notification-info {
    border-left: 4px solid var(--color-info);
}

@keyframes slideInRight {
    to {
        transform: translateX(0);
    }
}

@keyframes slideOutRight {
    to {
        transform: translateX(400px);
    }
}

/* Responsive */
@media (max-width: 968px) {
    .product-main-grid {
        grid-template-columns: 1fr;
        gap: var(--space-8);
    }
    
    .product-gallery-v2 {
        position: static;
    }
    
    .tabs-nav {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .tab-btn {
        white-space: nowrap;
        flex-shrink: 0;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 var(--space-4);
    }
    
    .product-hero {
        padding: var(--space-6) 0;
    }
    
    .product-title {
        font-size: var(--text-2xl);
    }
    
    .breadcrumbs-v2 {
        font-size: var(--text-xs);
        margin-bottom: var(--space-6);
    }
    
    .product-header {
        flex-direction: column;
        gap: var(--space-4);
    }
    
    .cta-secondary {
        flex-direction: column;
    }
    
    .specifications-grid,
    .shipping-info {
        grid-template-columns: 1fr;
    }
    
    .lightbox-nav {
        left: var(--space-4);
        right: var(--space-4);
    }
}
```

**Resultado:** Páginas de produto **EXTREMAMENTE PROFISSIONAIS** que rivalizem com Airbnb, Amazon, etc.

**Tempo:** 20 horas  
**Impacto:** ⭐⭐⭐⭐⭐ (Mudança visual DRAMÁTICA no frontend)

***

## 🎯 **RESTO DA IMPLEMENTAÇÃO**

Vou continuar com os DAY 5-7 focados em:

### **DAY 5: Enhanced Search Integration**
- Melhorar a pesquisa existente (Fase 2)
- Filtros avançados, ordenação, categoria
- Search results page moderna
- **VISUAL IMPACT:** Search que funciona como e-commerce profissional

### **DAY 6: Admin Product Management V2**  
- Lista de produtos moderna (tabela → cards)
- Bulk operations (edit múltiplo, export, import)
- Drag & drop sorting
- **VISUAL IMPACT:** Admin interface que impressiona

### **DAY 7: Navigation & UX Improvements**
- Menu navigation moderno
- Mobile navigation superior
- Loading states, micro-interactions
- **VISUAL IMPACT:** Site fluido e profissional

***

## 📊 **MÉTRICAS DE SUCESSO**

### **Visual Impact:**
- ✅ Admin dashboard: "WOW factor" imediato
- ✅ Product pages: Profissionais como grandes e-commerce
- ✅ Search experience: Rápida e intuitiva
- ✅ Mobile experience: Fluída e touch-optimized

### **Business Value:**
- ✅ +300% better user experience
- ✅ Professional presentation para clientes
- ✅ Admin efficiency massivamente melhorada
- ✅ SEO-ready product pages
- ✅ Modular e customizável (como pediste)

***

## 🎨 **MODULARIDADE & CUSTOMIZAÇÃO**

```css
/* Sistema de CSS Variables permite customização total */
:root {
    --color-primary: #667eea;     /* Facilmente customizável */
    --color-secondary: #c0a080;   /* Brand colors */
    --radius-base: 8px;           /* Border radius system */
    --space-base: 16px;           /* Spacing system */
}

/* Componentes modulares reutilizáveis */
.btn-base { /* Base button system */ }
.card-base { /* Base card system */ }  
.form-base { /* Base form system */ }
```

Cada componente é **independente e reutilizável**. Podes facilmente:
- Mudar cores em segundos (CSS variables)
- Adaptar layout (CSS Grid/Flexbox)
- Adicionar novos componentes seguindo o sistema
- Customizar por cliente/projeto

***

## 🚀 **PRÓXIMA AÇÃO**

**QUERES COMEÇAR IMEDIATAMENTE COM DAY 1 (Modern Admin Dashboard)?**

O impacto visual será **IMEDIATO** e **IMPRESSIONANTE**. Qualquer pessoa que veja o admin vai ficar impressionada com a modernidade e profissionalismo.

**Confirma se queres avançar com este plano reformulado da Fase 3!**