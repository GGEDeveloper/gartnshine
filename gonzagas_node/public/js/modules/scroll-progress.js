/**
 * Barra de progresso da página, com marcas nas secções.
 *
 * Uma linha fina colada por baixo do cabeçalho mostra quanto falta da
 * página. Nas páginas com secções identificáveis aparecem marcas que
 * permitem saltar directamente para cada uma.
 *
 * Não se sobrepõe ao índice lateral das categorias: aí a navegação por
 * subcategoria já existe e é melhor, por isso a barra fica só com o
 * progresso e sem marcas.
 */
(function () {
  'use strict';

  var ALTURA_MINIMA = 1.6; // só vale a pena acima de ~1,6 ecrãs de conteúdo

  function semMovimento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Secções a marcar. Deliberadamente só as que têm um título visível — uma
   * marca que salta para um sítio sem cabeçalho deixa quem clica sem saber
   * onde caiu.
   */
  function recolherSeccoes() {
    var candidatos = document.querySelectorAll(
      'main section[aria-labelledby], main section > h2, .category-group, ' +
      '.brand-manifesto, .collections-showcase, .featured-section, ' +
      '.ig-feed-section, .closing-band, ' +
      // Secções destas páginas não tinham nem `aria-labelledby` nem um <h2>
      // directo, e ficavam de fora — o catálogo e o "Sobre" apareciam sem
      // marca nenhuma.
      '.catalog-categories, .catalog-content, .collections-index-grid, ' +
      '.about-story, .about-connect, .gallery-grid'
    );

    var vistos = [];
    Array.prototype.forEach.call(candidatos, function (el) {
      var seccao = el.tagName === 'H2' ? el.parentElement : el;
      if (!seccao || vistos.indexOf(seccao) !== -1) return;

      var titulo = seccao.querySelector('h2, h3, .section-eyebrow, h1');
      var rotulo = titulo ? titulo.textContent.trim().replace(/\s+/g, ' ') : '';
      // Sem título visível usa-se um rótulo conhecido; sem nenhum dos dois a
      // secção não é marcada, porque saltar para um sítio sem cabeçalho deixa
      // quem clica sem perceber onde caiu.
      if (!rotulo) {
        var conhecidos = {
          'catalog-content': 'Peças',
          'gallery-grid': 'Galeria',
          'collections-index-grid': 'Coleções'
        };
        rotulo = conhecidos[seccao.className.split(' ')[0]] || '';
      }
      if (!rotulo) return;

      vistos.push(seccao);
      seccao.__rotulo = rotulo.length > 26 ? rotulo.slice(0, 25) + '…' : rotulo;
    });

    return vistos;
  }

  function construir() {
    var doc = document.documentElement;
    if (doc.scrollHeight < window.innerHeight * ALTURA_MINIMA) return;

    // Nas categorias o índice lateral já faz a navegação por secção.
    var temIndiceLateral = !!document.querySelector('.category-index');
    var seccoes = temIndiceLateral ? [] : recolherSeccoes();

    var barra = document.createElement('div');
    barra.className = 'scroll-progress';
    // É decoração: quem usa leitor de ecrã navega pelos cabeçalhos.
    barra.setAttribute('aria-hidden', 'true');

    var linha = document.createElement('span');
    linha.className = 'scroll-progress-line';
    barra.appendChild(linha);

    var marcas = [];
    seccoes.forEach(function (sec) {
      var m = document.createElement('button');
      m.type = 'button';
      m.className = 'scroll-progress-mark';
      m.title = sec.__rotulo;
      m.addEventListener('click', function () {
        sec.scrollIntoView({
          behavior: semMovimento() ? 'auto' : 'smooth',
          block: 'start'
        });
      });
      barra.appendChild(m);
      marcas.push({ el: m, sec: sec });
    });

    document.body.appendChild(barra);

    var pendente = false;
    function actualizar() {
      pendente = false;
      var total = doc.scrollHeight - window.innerHeight;
      var pct = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      linha.style.transform = 'scaleX(' + pct + ')';

      // Posicionar as marcas e assinalar em qual estamos.
      var activo = null;
      marcas.forEach(function (m) {
        var topo = m.sec.getBoundingClientRect().top + window.scrollY;
        var pos = doc.scrollHeight > 0 ? (topo / doc.scrollHeight) * 100 : 0;
        m.el.style.left = Math.min(99, Math.max(0, pos)) + '%';
        if (m.sec.getBoundingClientRect().top - 140 <= 0) activo = m;
      });
      marcas.forEach(function (m) {
        m.el.classList.toggle('is-active', m === activo);
      });
    }

    window.addEventListener('scroll', function () {
      if (pendente) return;
      pendente = true;
      window.requestAnimationFrame(actualizar);
    }, { passive: true });

    window.addEventListener('resize', actualizar, { passive: true });
    actualizar();
  }

  function iniciar() {
    try {
      construir();
    } catch (err) {
      // Uma barra decorativa nunca pode partir a página.
      if (window.console) console.warn('scroll-progress:', err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
