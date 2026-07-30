/**
 * Índice lateral das páginas de categoria.
 *
 * Nas categorias de topo (Prata, Latão...) a página junta os produtos de
 * todas as subcategorias e chega a ter 25.000px de altura. O índice fixa-se
 * ao lado, salta para cada bloco e marca em qual estamos.
 *
 * O botão "voltar ao topo" NÃO é criado aqui — já existe em ui.js.
 */
(function () {
  'use strict';

  function init() {
    const index = document.querySelector('.category-index');
    if (!index) return;

    const links = Array.from(index.querySelectorAll('[data-index-link]'));
    if (links.length === 0) return;

    const secoes = links
      .map(function (link) {
        const el = document.getElementById(link.getAttribute('data-index-link'));
        return el ? { link: link, el: el } : null;
      })
      .filter(Boolean);
    if (secoes.length === 0) return;

    function marcar(activo) {
      secoes.forEach(function (s) {
        const on = s === activo;
        s.link.classList.toggle('is-active', on);
        // aria-current diz a um leitor de ecrã onde estamos, o que a classe
        // sozinha não comunica.
        if (on) s.link.setAttribute('aria-current', 'true');
        else s.link.removeAttribute('aria-current');
      });
    }

    // IntersectionObserver não serve bem aqui: com secções muito altas há
    // sempre várias visíveis ao mesmo tempo. Escolhe-se a última secção cujo
    // topo já passou a linha de referência.
    const OFFSET = 140;
    let pendente = false;

    function actualizar() {
      pendente = false;
      let activo = secoes[0];
      for (let i = 0; i < secoes.length; i += 1) {
        if (secoes[i].el.getBoundingClientRect().top - OFFSET <= 0) activo = secoes[i];
        else break;
      }
      marcar(activo);
    }

    window.addEventListener('scroll', function () {
      if (pendente) return;
      pendente = true;
      window.requestAnimationFrame(actualizar);
    }, { passive: true });

    window.addEventListener('resize', actualizar, { passive: true });

    // Scroll suave, respeitando quem pediu menos movimento no sistema.
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const alvo = document.getElementById(link.getAttribute('data-index-link'));
        if (!alvo) return;
        e.preventDefault();
        const y = alvo.getBoundingClientRect().top + window.scrollY - (OFFSET - 40);
        window.scrollTo({ top: y, behavior: semMovimento.matches ? 'auto' : 'smooth' });
        // Mantém o endereço partilhável sem provocar o salto do browser.
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + alvo.id);
        }
      });
    });

    actualizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
