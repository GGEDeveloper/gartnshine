/**
 * Melhora os botões "voltar".
 *
 * O link já funciona sem JavaScript: aponta para o sítio acima desta página.
 * O que este módulo faz é, **quando a página anterior foi mesmo deste site**,
 * passar a recuar no histórico em vez de navegar — o que preserva a posição
 * de scroll e os filtros do catálogo, e é o que uma pessoa espera.
 *
 * Quando não há histórico interno (chegou do Google, abriu num separador
 * novo, escreveu o endereço), não se toca em nada e o link leva ao destino
 * escrito no HTML. Nunca fica um botão que não faz nada.
 *
 * PORQUE NÃO USA `document.referrer`:
 * o site serve `Referrer-Policy: no-referrer`, por isso o referrer vem
 * **sempre vazio**, mesmo em navegação interna — foi medido. A primeira
 * versão deste módulo dependia dele e portanto nunca chegava a melhorar
 * nada: clicar em "voltar" seguia o link em vez de recuar. Baixar a política
 * para `same-origin` resolveria, mas seria enfraquecer um cabeçalho de
 * privacidade por causa de uma conveniência.
 *
 * Em vez disso guarda-se o percurso em `sessionStorage`, que é por separador
 * e sobrevive à navegação dentro do mesmo separador.
 */
(function () {
  'use strict';

  var CHAVE_ACTUAL = 'voltar:actual';

  /**
   * Regista a página actual e devolve a anterior deste separador.
   *
   * Recarregar a mesma página não conta: aí anterior === actual, e recuar no
   * histórico levaria para fora do site.
   */
  function paginaAnterior() {
    try {
      var actual = window.location.href;
      var anterior = window.sessionStorage.getItem(CHAVE_ACTUAL);
      window.sessionStorage.setItem(CHAVE_ACTUAL, actual);
      return anterior && anterior !== actual ? anterior : null;
    } catch (e) {
      // sessionStorage pode estar indisponível (cookies bloqueados, modo
      // privado antigo). Sem ele fica o link normal, que funciona sempre.
      return null;
    }
  }

  function init() {
    // Correr sempre, mesmo sem botão na página: é assim que o percurso fica
    // registado para a página seguinte.
    var anterior = paginaAnterior();

    var links = document.querySelectorAll('[data-voltar]');
    if (links.length === 0 || !anterior) return;

    // `history.length > 1` sozinho não chega — um separador novo já começa a
    // 1 — mas junto com o percurso guardado evita chamar `back()` quando não
    // há para onde recuar.
    if (window.history.length <= 1) return;

    Array.prototype.forEach.call(links, function (a) {
      a.addEventListener('click', function (e) {
        // Ctrl/Cmd/shift e o botão do meio abrem noutro sítio: aí o link tem
        // de continuar a ser um link normal.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        window.history.back();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
