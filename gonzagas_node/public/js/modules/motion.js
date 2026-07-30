/**
 * Motion Module — parallax de fundos e revelação de elementos ao scroll
 * Gonzaga's Art & Shine
 *
 * Substitui os IntersectionObserver inline que estavam duplicados em
 * collections.ejs e collection.ejs. Desliga-se por completo quando o
 * utilizador pede menos movimento (prefers-reduced-motion) e o parallax
 * não corre em ecrãs pequenos, onde tende a ficar irregular.
 */
window.GonzagaMotion = (function () {
  'use strict';

  const MODULE_NAME = 'Motion';
  let isInitialized = false;

  // Elementos com fundo que acompanha o scroll, e a respetiva intensidade.
  const PARALLAX_TARGETS = [
    { selector: '.hero-image-backdrop', factor: 0.28 },
    { selector: '.collection-header.has-background', factor: 0.2 }
  ];

  // Elementos que aparecem quando entram no viewport. Deliberadamente
  // específico: o catálogo (.catalog-main) já tem a sua própria animação de
  // entrada e não deve ser tocado aqui.
  const REVEAL_SELECTOR = [
    '.gallery-grid .gallery-item',
    '.collection-page .product-card',
    '.category-page .product-card',
    '.collections-showcase .collection-tile',
    // Secções que entravam de repente, sem qualquer transição:
    '.manifesto-list li',
    '.closing-band .closing-title',
    '.collection-index-card',
    '.ig-feed-section .ig-feed-item',
    '.catalog-categories .catalog-category-card',
    '.category-group-header'
  ].join(', ');
  const REVEAL_STAGGER_MS = 50;
  const REVEAL_STAGGER_MAX = 6; // além disto o atraso acumulado seria notório

  let parallaxNodes = [];
  let revealObserver = null;
  let onScroll = null;
  let ticking = false;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobileViewport() {
    const breakpoint = window.GonzagaConfig?.ui?.breakpoints?.mobile || 768;
    return window.innerWidth < breakpoint;
  }

  /* ---------------------------------------------------------------- parallax */

  function applyParallax() {
    const scrollY = window.pageYOffset;

    parallaxNodes.forEach(({ el, factor }) => {
      const rect = el.getBoundingClientRect();
      const elTop = rect.top + scrollY;
      // Só mexe no que está (ou está quase) visível.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      const offset = (scrollY - elTop) * factor;
      el.style.backgroundPosition = `center calc(50% + ${offset.toFixed(1)}px)`;
    });

    ticking = false;
  }

  function requestParallaxFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(applyParallax);
  }

  function initParallax() {
    if (isMobileViewport()) {
      GonzagaUtils.log(MODULE_NAME, 'Parallax ignorado em viewport pequeno');
      return;
    }

    parallaxNodes = [];
    PARALLAX_TARGETS.forEach(({ selector, factor }) => {
      document.querySelectorAll(selector).forEach((el) => {
        // Sem imagem de fundo não há nada para deslocar.
        if (getComputedStyle(el).backgroundImage === 'none') return;
        el.style.backgroundSize = 'cover';
        parallaxNodes.push({ el, factor });
      });
    });

    if (parallaxNodes.length === 0) return;

    onScroll = requestParallaxFrame;
    window.addEventListener('scroll', onScroll, { passive: true });
    applyParallax();

    GonzagaUtils.log(MODULE_NAME, `Parallax activo em ${parallaxNodes.length} elemento(s)`);
  }

  /* ------------------------------------------------------------------ reveal */

  function initReveal() {
    const items = document.querySelectorAll(REVEAL_SELECTOR);
    if (items.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      // Sem suporte, mostra tudo de imediato em vez de esconder conteúdo.
      items.forEach((item) => item.classList.add('is-revealed'));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        const delay = Math.min(index, REVEAL_STAGGER_MAX) * REVEAL_STAGGER_MS;
        setTimeout(() => entry.target.classList.add('is-revealed'), delay);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    items.forEach((item) => {
      item.classList.add('will-reveal');
      revealObserver.observe(item);
    });

    GonzagaUtils.log(MODULE_NAME, `Reveal activo em ${items.length} elemento(s)`);
  }

  /* -------------------------------------------------------------------- API */

  function init() {
    if (isInitialized) {
      GonzagaUtils.log(MODULE_NAME, 'Already initialized');
      return;
    }

    try {
      if (prefersReducedMotion()) {
        // Nada de animações — o conteúdo fica simplesmente visível.
        document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => el.classList.add('is-revealed'));
        isInitialized = true;
        GonzagaUtils.log(MODULE_NAME, 'Movimento reduzido pedido pelo utilizador — efeitos desligados');
        return;
      }

      initReveal();
      initParallax();

      isInitialized = true;
      GonzagaUtils.log(MODULE_NAME, 'Motion module initialized successfully');
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Initialization failed');
      // Falhar aqui nunca pode esconder conteúdo.
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => el.classList.add('is-revealed'));
    }
  }

  function destroy() {
    if (onScroll) {
      window.removeEventListener('scroll', onScroll);
      onScroll = null;
    }
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
    parallaxNodes.forEach(({ el }) => { el.style.backgroundPosition = ''; });
    parallaxNodes = [];
    isInitialized = false;
    GonzagaUtils.log(MODULE_NAME, 'Motion module destroyed');
  }

  return {
    init,
    destroy,
    isInitialized: () => isInitialized
  };
})();
