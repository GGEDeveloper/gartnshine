/**
 * Editor de enquadramento das imagens de categoria.
 *
 * Arrastar para mover, roda do rato ou slider para aproximar. A moldura tem
 * proporção fixa (16:9 na faixa da página, 4:5 no cartão da loja) e o que
 * sair daqui é o rectângulo em pixeis do ORIGINAL, que o servidor recorta com
 * sharp — não é um recorte no browser.
 *
 * Escrito em JavaScript simples de propósito: a CSP do site só autoriza
 * scripts do próprio domínio e de três CDNs, e não vale a pena trazer uma
 * biblioteca de recorte (e o seu peso) para duas caixas de imagem no admin.
 */
(function () {
  'use strict';

  var ZOOM_MAX = 6;

  function criar(painel) {
    var tipo = painel.dataset.tipo;                       // 'hero' | 'card'
    var ratio = parseFloat(painel.dataset.ratio) || 1;    // largura / altura
    var palco = painel.querySelector('[data-palco]');
    var img = painel.querySelector('[data-imagem]');
    var campoCrop = painel.querySelector('[data-campo-crop]');
    var campoOrigem = painel.querySelector('[data-campo-origem]');
    var slider = painel.querySelector('[data-zoom]');
    var btnCentrar = painel.querySelector('[data-centrar]');
    var aviso = painel.querySelector('[data-aviso]');

    if (!palco || !img || !campoCrop) return;

    // Estado em coordenadas do ORIGINAL.
    var origem = { w: 0, h: 0 };
    var vista = { x: 0, y: 0, w: 0, h: 0 };  // rectângulo visível = recorte
    var arrastar = null;

    function limites() {
      // O recorte nunca pode sair da imagem nem ser maior do que ela.
      var maxW = origem.w;
      var maxH = origem.h;
      if (maxW / ratio > maxH) maxW = maxH * ratio;
      else maxH = maxW / ratio;
      return { maxW: maxW, maxH: maxH, minW: maxW / ZOOM_MAX, minH: maxH / ZOOM_MAX };
    }

    function aplicar() {
      if (!origem.w || !palco.clientWidth) return;
      // A imagem é posicionada e escalada para que `vista` preencha o palco.
      var escala = palco.clientWidth / vista.w;
      img.style.width = (origem.w * escala) + 'px';
      img.style.height = 'auto';
      img.style.transform = 'translate(' + (-vista.x * escala) + 'px,' + (-vista.y * escala) + 'px)';

      campoCrop.value = JSON.stringify({
        x: Math.round(vista.x),
        y: Math.round(vista.y),
        w: Math.round(vista.w),
        h: Math.round(vista.h)
      });

      var l = limites();
      if (slider) {
        var z = l.maxW / vista.w;
        slider.value = String(Math.round(z * 100));
      }
      if (aviso) {
        // Avisa quando o recorte é mais pequeno do que a saída: a partir daí
        // está a esticar-se a fotografia e o resultado sai molhado.
        var larguraSaida = tipo === 'hero' ? 1920 : 800;
        aviso.hidden = vista.w >= larguraSaida;
      }
    }

    function encaixar() {
      var l = limites();
      vista.w = Math.max(l.minW, Math.min(vista.w, l.maxW));
      vista.h = vista.w / ratio;
      vista.x = Math.max(0, Math.min(vista.x, origem.w - vista.w));
      vista.y = Math.max(0, Math.min(vista.y, origem.h - vista.h));
    }

    function centrar() {
      var l = limites();
      vista.w = l.maxW;
      vista.h = l.maxH;
      vista.x = (origem.w - vista.w) / 2;
      vista.y = (origem.h - vista.h) / 2;
      aplicar();
    }

    function carregar(src, cropInicial) {
      if (!src) return;
      painel.hidden = false;
      img.src = src;
      if (campoOrigem) campoOrigem.value = src;

      var pronto = function () {
        origem.w = img.naturalWidth;
        origem.h = img.naturalHeight;
        if (!origem.w || !origem.h) return;
        if (cropInicial && cropInicial.w > 0 && cropInicial.h > 0) {
          vista.x = cropInicial.x;
          vista.y = cropInicial.y;
          vista.w = cropInicial.w;
          vista.h = cropInicial.h;
          encaixar();
          aplicar();
        } else {
          centrar();
        }
      };

      if (img.complete && img.naturalWidth) pronto();
      else img.addEventListener('load', pronto, { once: true });
    }

    // ----- Arrastar -----
    palco.addEventListener('pointerdown', function (e) {
      if (!origem.w) return;
      palco.setPointerCapture(e.pointerId);
      arrastar = { x: e.clientX, y: e.clientY, vx: vista.x, vy: vista.y };
      palco.classList.add('is-arrastar');
    });

    palco.addEventListener('pointermove', function (e) {
      if (!arrastar) return;
      var escala = palco.clientWidth / vista.w;
      vista.x = arrastar.vx - (e.clientX - arrastar.x) / escala;
      vista.y = arrastar.vy - (e.clientY - arrastar.y) / escala;
      encaixar();
      aplicar();
    });

    ['pointerup', 'pointercancel'].forEach(function (ev) {
      palco.addEventListener(ev, function () {
        arrastar = null;
        palco.classList.remove('is-arrastar');
      });
    });

    // ----- Zoom com a roda, ancorado no ponteiro -----
    palco.addEventListener('wheel', function (e) {
      if (!origem.w) return;
      e.preventDefault();
      var r = palco.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1 dentro do palco
      var py = (e.clientY - r.top) / r.height;
      var alvoX = vista.x + vista.w * px;        // ponto do original sob o rato
      var alvoY = vista.y + vista.h * py;

      var factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
      vista.w *= factor;
      encaixar();
      // Mantém o ponto sob o rato no mesmo sítio depois do zoom.
      vista.x = alvoX - vista.w * px;
      vista.y = alvoY - vista.h * py;
      encaixar();
      aplicar();
    }, { passive: false });

    // ----- Slider -----
    if (slider) {
      slider.addEventListener('input', function () {
        if (!origem.w) return;
        var l = limites();
        var cx = vista.x + vista.w / 2;
        var cy = vista.y + vista.h / 2;
        vista.w = l.maxW / (Number(slider.value) / 100);
        encaixar();
        vista.x = cx - vista.w / 2;
        vista.y = cy - vista.h / 2;
        encaixar();
        aplicar();
      });
    }

    if (btnCentrar) {
      btnCentrar.addEventListener('click', function (e) {
        e.preventDefault();
        centrar();
      });
    }

    // ----- Teclado: o editor tem de ser utilizável sem rato -----
    palco.setAttribute('tabindex', '0');
    palco.addEventListener('keydown', function (e) {
      if (!origem.w) return;
      var passo = vista.w * (e.shiftKey ? 0.1 : 0.02);
      var tratado = true;
      switch (e.key) {
        case 'ArrowLeft':  vista.x -= passo; break;
        case 'ArrowRight': vista.x += passo; break;
        case 'ArrowUp':    vista.y -= passo; break;
        case 'ArrowDown':  vista.y += passo; break;
        case '+': case '=': vista.w /= 1.1; break;
        case '-': case '_': vista.w *= 1.1; break;
        default: tratado = false;
      }
      if (!tratado) return;
      e.preventDefault();
      encaixar();
      aplicar();
    });

    window.addEventListener('resize', aplicar);

    // ----- Escolher origem: galeria ou upload -----
    painel.querySelectorAll('[data-escolher]').forEach(function (botao) {
      botao.addEventListener('click', function (e) {
        e.preventDefault();
        painel.querySelectorAll('[data-escolher]').forEach(function (b) {
          b.classList.toggle('is-activo', b === botao);
        });
        carregar(botao.dataset.escolher, null);
      });
    });

    var input = painel.querySelector('[data-ficheiro]');
    if (input) {
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        if (!f) return;
        // Pré-visualiza o ficheiro local antes de existir no servidor; o
        // campo `origem` fica vazio e o servidor usa o upload.
        if (campoOrigem) campoOrigem.value = '';
        carregar(URL.createObjectURL(f), null);
      });
    }

    // ----- Estado inicial -----
    var srcInicial = painel.dataset.origem || '';
    var cropInicial = null;
    if (painel.dataset.crop) {
      try { cropInicial = JSON.parse(painel.dataset.crop); } catch (err) { cropInicial = null; }
    }
    if (srcInicial) carregar(srcInicial, cropInicial);
    else painel.hidden = false;
  }

  function iniciar() {
    document.querySelectorAll('[data-cropper]').forEach(criar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
