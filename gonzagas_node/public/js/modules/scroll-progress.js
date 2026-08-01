/**
 * Barra de progresso da página.
 *
 * Uma linha fina colada por baixo do cabeçalho, que mostra quanto falta da
 * página. É decoração — não é navegação.
 *
 * As MARCAS DE SECÇÃO foram removidas. Eram pontos de 7px, sem rótulo
 * visível, espalhados por uma linha de 2px por baixo do header, e falhavam
 * em tudo o que se pede a um elemento de navegação:
 *
 *   - não se percebia o que eram (só tinham `title`, que nem sequer aparece
 *     em ecrã táctil, onde está a maior parte do tráfego);
 *   - não se percebia para onde levavam nem quantas havia;
 *   - eram `<button>` dentro de um contentor `aria-hidden="true"` — ou seja,
 *     focáveis por teclado mas invisíveis para leitores de ecrã, que é
 *     exactamente a combinação que as normas de acessibilidade proíbem;
 *   - em páginas como a loja resolviam para duas marcas, a saltar entre dois
 *     blocos da mesma página, o que não é navegação nenhuma.
 *
 * A navegação da página já é feita pelo header, pelas migalhas, pelo índice
 * lateral das categorias e pelo botão de voltar ao topo. Isto era uma quinta
 * camada, mais fraca do que as quatro.
 */
(function () {
  'use strict';

  var ALTURA_MINIMA = 1.6; // só vale a pena acima de ~1,6 ecrãs de conteúdo

  function construir() {
    var doc = document.documentElement;
    if (doc.scrollHeight < window.innerHeight * ALTURA_MINIMA) return;

    var barra = document.createElement('div');
    barra.className = 'scroll-progress';
    // Puramente decorativa: não tem conteúdo nem controlos, por isso o
    // `aria-hidden` aqui é correcto (ao contrário de quando tinha botões).
    barra.setAttribute('aria-hidden', 'true');

    var linha = document.createElement('span');
    linha.className = 'scroll-progress-line';
    barra.appendChild(linha);

    document.body.appendChild(barra);

    var pendente = false;
    function actualizar() {
      pendente = false;
      var total = doc.scrollHeight - window.innerHeight;
      var pct = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      linha.style.transform = 'scaleX(' + pct + ')';
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
