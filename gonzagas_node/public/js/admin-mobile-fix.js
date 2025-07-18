/**
 * Admin Mobile Navigation Fix
 * Gonzaga's Art & Shine
 * CORREÇÃO: Botão hamburger/X invertido e funcionalidade de sidebar mobile
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Admin Mobile Fix: Initializing...');
  
  // Elementos principais
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const body = document.body;
  
  if (!sidebar || !sidebarToggle) {
    console.warn('🔧 Admin Mobile Fix: Sidebar ou toggle não encontrados');
    return;
  }
  
  // ===== CORRIGIR ÍCONE DO BOTÃO =====
  function updateToggleIcon() {
    const isSidebarOpen = body.classList.contains('sidebar-open');
    
    // Remove ícones existentes
    const existingIcons = sidebarToggle.querySelectorAll('i');
    existingIcons.forEach(icon => icon.remove());
    
    // Cria o ícone correto
    const icon = document.createElement('i');
    
    if (isSidebarOpen) {
      // Sidebar aberta: mostra X
      icon.className = 'fas fa-times';
    } else {
      // Sidebar fechada: mostra hamburger
      icon.className = 'fas fa-bars';
    }
    
    sidebarToggle.appendChild(icon);
    
    console.log(`🔧 Toggle icon updated: ${isSidebarOpen ? 'X (close)' : 'Hamburger (open)'}`);
  }
  
  // ===== FUNÇÃO DE TOGGLE =====
  function toggleSidebar() {
    const isCurrentlyOpen = body.classList.contains('sidebar-open');
    
    if (isCurrentlyOpen) {
      // Fechar sidebar
      body.classList.remove('sidebar-open');
      console.log('🔧 Sidebar: FECHADA');
    } else {
      // Abrir sidebar
      body.classList.add('sidebar-open');
      console.log('🔧 Sidebar: ABERTA');
    }
    
    // Atualizar ícone
    updateToggleIcon();
  }
  
  // ===== EVENT LISTENERS =====
  
  // Click no botão toggle
  sidebarToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  });
  
  // Click no overlay (fora da sidebar) para fechar em mobile
  document.addEventListener('click', function(e) {
    // Só funciona em mobile
    if (window.innerWidth >= 992) return;
    
    const isClickInsideSidebar = sidebar.contains(e.target);
    const isClickOnToggle = sidebarToggle.contains(e.target);
    const isSidebarOpen = body.classList.contains('sidebar-open');
    
    // Se clicou fora da sidebar e ela está aberta, fecha
    if (!isClickInsideSidebar && !isClickOnToggle && isSidebarOpen) {
      body.classList.remove('sidebar-open');
      updateToggleIcon();
      console.log('🔧 Sidebar fechada por click externo');
    }
  });
  
  // Fechar sidebar ao clicar em links (navegação)
  const sidebarLinks = sidebar.querySelectorAll('.nav-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Só em mobile
      if (window.innerWidth < 992) {
        setTimeout(() => {
          body.classList.remove('sidebar-open');
          updateToggleIcon();
          console.log('🔧 Sidebar fechada após navegação');
        }, 100);
      }
    });
  });
  
  // ===== RESIZE HANDLER =====
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
      // Desktop: remove classe mobile
      body.classList.remove('sidebar-open');
      console.log('🔧 Desktop mode: sidebar reset');
    }
    updateToggleIcon();
  });
  
  // ===== ESCAPE KEY =====
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && body.classList.contains('sidebar-open')) {
      body.classList.remove('sidebar-open');
      updateToggleIcon();
      console.log('🔧 Sidebar fechada por ESC');
    }
  });
  
  // ===== TOUCH GESTURES =====
  let touchStartX = 0;
  let touchEndX = 0;
  
  // Touch start
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  // Touch end
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    // Só em mobile
    if (window.innerWidth >= 992) return;
    
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 100; // Aumentei para evitar ativação acidental
    
    const isSidebarOpen = body.classList.contains('sidebar-open');
    
    // Swipe right para abrir (se fechada)
    if (swipeDistance > minSwipeDistance && !isSidebarOpen && touchStartX < 50) {
      body.classList.add('sidebar-open');
      updateToggleIcon();
      console.log('🔧 Sidebar aberta por swipe right');
    }
    
    // Swipe left para fechar (se aberta)
    if (swipeDistance < -minSwipeDistance && isSidebarOpen) {
      body.classList.remove('sidebar-open');
      updateToggleIcon();
      console.log('🔧 Sidebar fechada por swipe left');
    }
  }
  
  // ===== INICIALIZAÇÃO =====
  function initMobileSidebar() {
    // Em mobile, sidebar sempre começa fechada
    if (window.innerWidth < 992) {
      body.classList.remove('sidebar-open');
    }
    updateToggleIcon();
    console.log('🔧 Admin Mobile Fix: Inicializado com sucesso');
  }
  
  // ===== DEBUGGING =====
  function debugInfo() {
    if (window.location.search.includes('debug=admin')) {
      console.log('🔧 Debug Info:', {
        windowWidth: window.innerWidth,
        sidebarOpen: body.classList.contains('sidebar-open'),
        sidebarElement: !!sidebar,
        toggleElement: !!sidebarToggle,
        adminLayoutFixed: body.classList.contains('admin-layout-fixed')
      });
    }
  }
  
  // ===== MUTATION OBSERVER PARA MUDANÇAS DE CLASSE =====
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const isSidebarOpen = body.classList.contains('sidebar-open');
        
        // Previne scroll do body quando sidebar aberta em mobile
        if (window.innerWidth < 992) {
          if (isSidebarOpen) {
            body.style.overflow = 'hidden';
            body.style.paddingRight = '0px'; // Evita jump do scrollbar
          } else {
            body.style.overflow = '';
            body.style.paddingRight = '';
          }
        }
      }
    });
  });
  
  observer.observe(body, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // ===== EXECUTAR INICIALIZAÇÃO =====
  initMobileSidebar();
  debugInfo();
  
  // Debug info a cada resize
  window.addEventListener('resize', debugInfo);
  
  console.log('✅ Admin Mobile Fix: Carregado com sucesso');
}); 