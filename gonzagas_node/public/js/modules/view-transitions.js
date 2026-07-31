/**
 * Transições com elemento partilhado.
 *
 * Quando se clica num cartão de produto, a fotografia desse cartão
 * transforma-se na fotografia grande da ficha, em vez de a página trocar
 * inteira. O mesmo entre um cartão de categoria e o cabeçalho da categoria.
 *
 * Como funciona: a View Transitions API liga dois elementos de documentos
 * diferentes quando ambos têm o mesmo `view-transition-name`. Do lado do
 * destino o nome está fixo no CSS; do lado de origem tem de ser posto no
 * momento do clique, porque só aí se sabe *qual* dos 24 cartões foi
 * escolhido — e os nomes têm de ser únicos dentro do documento.
 *
 * Se este ficheiro falhar ou o browser não suportar, não acontece nada de
 * mau: fica a transição normal de página, definida só em CSS.
 */
(function () {
  'use strict';

  // Sem suporte a transições entre documentos não há nada a fazer aqui.
  if (!('startViewTransition' in document)) return;

  var NOME_PRODUTO = 'media-produto';
  var NOME_CATEGORIA = 'media-categoria';

  function semMovimento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Liberta o nome de quem já o tenha neste documento.
   *
   * Sem isto, clicar numa peça relacionada dentro de uma ficha de produto
   * marcaria o cartão com `media-produto` enquanto a fotografia grande dessa
   * mesma ficha já o tinha pelo CSS — dois elementos com o mesmo nome fazem a
   * API desistir da transição toda, sem erro visível.
   */
  function libertarNome(nome) {
    var fixos = { 'media-produto': '#mainProductImage',
                  'media-categoria': '.collection-header.has-background' };
    var sel = fixos[nome];
    if (!sel) return;
    document.querySelectorAll(sel).forEach(function (el) {
      el.style.viewTransitionName = 'none';
    });
  }

  /** Marca o elemento e desmarca-o se a navegação não chegar a acontecer. */
  function marcar(el, nome) {
    if (!el) return;
    libertarNome(nome);
    el.style.viewTransitionName = nome;

    // Se o utilizador voltar atrás (bfcache) ou a navegação for cancelada, o
    // nome tem de sair: dois elementos com o mesmo nome no mesmo documento
    // fazem a API desistir da transição toda.
    var limpar = function () {
      el.style.viewTransitionName = '';
      var fixos = { 'media-produto': '#mainProductImage',
                    'media-categoria': '.collection-header.has-background' };
      if (fixos[nome]) {
        document.querySelectorAll(fixos[nome]).forEach(function (f) {
          f.style.viewTransitionName = '';
        });
      }
    };
    window.addEventListener('pageshow', limpar, { once: true });
    setTimeout(limpar, 3000);
  }

  function aoClicar(e) {
    if (semMovimento()) return;
    // Só cliques simples navegam; com Ctrl/Cmd/shift abre-se noutro sítio.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var alvo = e.target.closest('a');
    if (!alvo || alvo.target === '_blank') return;

    var href = alvo.getAttribute('href') || '';
    if (!href.startsWith('/')) return;

    if (href.startsWith('/loja/produto/')) {
      // Setas anterior/seguinte: a direcção do clique decide o lado por onde
      // a página nova entra, para as setas parecerem percorrer uma sequência
      // em vez de saltar entre páginas soltas.
      var direccao = alvo.getAttribute('data-direccao');
      if (direccao) {
        // A direcção tem de viajar para o documento de DESTINO: numa
        // transição entre documentos, os pseudo-elementos (tanto o
        // `-old` como o `-new`) são desenhados no contexto da página que
        // entra, por isso uma classe posta aqui no <html> não teria efeito
        // nenhum. Vai por sessionStorage e é aplicada no `pagereveal`.
        try { sessionStorage.setItem('vt-direccao', direccao); } catch (_) {}
        // Sem elemento partilhado nesta navegação: a fotografia nova não vem
        // de nenhuma miniatura, e forçá-la daria um salto estranho.
        return;
      }

      var cartao = alvo.closest('.product-card') || alvo;
      marcar(cartao.querySelector('img'), NOME_PRODUTO);
      return;
    }

    if (href.startsWith('/categoria/')) {
      var cat = alvo.closest('.catalog-category-card, .collection-tile');
      if (cat) {
        // Nestes cartões a fotografia é um fundo, não um <img>: marca-se o
        // próprio cartão, que é o que se transforma no cabeçalho da categoria.
        marcar(cat.querySelector('.catalog-category-media') || cat, NOME_CATEGORIA);
      }
    }
  }

  document.addEventListener('click', aoClicar, true);
})();
