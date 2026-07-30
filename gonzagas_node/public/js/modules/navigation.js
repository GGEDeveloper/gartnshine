/**
 * Navigation Module
 * Gonzaga's Art & Shine
 */

window.GonzagaNavigation = (function() {
  'use strict';

  const MODULE_NAME = 'Navigation';
  let isInitialized = false;

  /**
   * Highlight active navigation item (desktop + mobile drawer)
   */
  /**
   * O item activo do menu é decidido no servidor (views/partials/header.ejs),
   * que conhece a rota real.
   *
   * Havia aqui uma segunda implementação que recalculava tudo no cliente a
   * partir de window.location e limpava a classe `active` das ligações que não
   * reconhecia. Como era uma lista fixa de endereços, qualquer página nova
   * ficava sem item activo — foi o que aconteceu com /colecoes. Duas fontes de
   * verdade para a mesma coisa; ficou só a do servidor.
   *
   * O site faz navegação com carregamento completo de página, por isso o
   * servidor sabe sempre onde estamos e não é preciso recalcular no cliente.
   */
  function highlightActiveNav() {
    const activos = document.querySelectorAll('.nav-menu a.active, .mobile-nav-link.active');
    GonzagaUtils.log(MODULE_NAME, `Active nav from server: ${activos.length} item(s)`);
  }

  /**
   * Initialize scroll effects for navigation
   */
  function initScrollEffects() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;

      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      if (scrollY > lastScrollY && scrollY > 200) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestTick);
    GonzagaUtils.log(MODULE_NAME, 'Scroll effects initialized');
  }

  /**
   * Initialize all navigation functionality
   */
  function init() {
    if (isInitialized) {
      GonzagaUtils.log(MODULE_NAME, 'Already initialized');
      return;
    }

    try {
      highlightActiveNav();
      initScrollEffects();

      isInitialized = true;
      GonzagaUtils.log(MODULE_NAME, 'Navigation module initialized successfully');
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Initialization failed');
    }
  }

  /**
   * Destroy navigation (cleanup)
   */
  function destroy() {
    isInitialized = false;
    GonzagaUtils.log(MODULE_NAME, 'Navigation module destroyed');
  }

  return {
    init,
    destroy,
    highlightActiveNav,
    isInitialized: () => isInitialized
  };
})();
