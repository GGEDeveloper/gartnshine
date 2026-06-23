/**
 * Instagram preview page: reel autoplay (viewport) + scroll arrows.
 * Sem logs de URLs sensíveis.
 */
(function () {
  'use strict';

  function ensureSrc(video) {
    var ds = video.dataset && video.dataset.src;
    if (ds && !video.getAttribute('src')) {
      video.src = ds;
    }
  }

  function setPlayingState(video, playing) {
    var media = video.closest('.ig-reel-media');
    if (!media) return;
    media.classList.toggle('ig-is-playing', !!playing);
  }

  function clearVideoFailure(video, media) {
    if (video._igErrTimer) {
      clearTimeout(video._igErrTimer);
      video._igErrTimer = null;
    }
    media.classList.remove('ig-video-error');
    var fb = media.querySelector('.ig-reel-fallback-msg');
    if (fb) fb.setAttribute('hidden', '');
  }

  function initVideoEl(video) {
    var media = video.closest('.ig-reel-media');
    if (!media) return;

    video.addEventListener('play', function () {
      setPlayingState(video, true);
    });
    video.addEventListener('pause', function () {
      setPlayingState(video, false);
    });

    video.addEventListener('loadeddata', function () {
      clearVideoFailure(video, media);
    });
    video.addEventListener('canplay', function () {
      clearVideoFailure(video, media);
    });
    video.addEventListener('playing', function () {
      clearVideoFailure(video, media);
    });

    video.addEventListener('error', function () {
      var err = video.error;
      if (!err) return;
      if (err.code === 1) return;
      if (video._igErrTimer) clearTimeout(video._igErrTimer);
      video._igErrTimer = setTimeout(function () {
        video._igErrTimer = null;
        if (!video.error || video.error.code === 1) return;
        if (!video.paused) return;
        if (video.readyState >= 2) return;
        media.classList.add('ig-video-error');
        var fb = media.querySelector('.ig-reel-fallback-msg');
        if (fb) fb.removeAttribute('hidden');
      }, 450);
    });

    var toggle = media.querySelector('.ig-reel-play-toggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        ensureSrc(video);
        video.play().catch(function () {});
      });
    }
  }

  function initAutoplayObserver(videos) {
    var ratios = new Map();
    videos.forEach(function (v) {
      ratios.set(v, 0);
    });

    var thresholdPlay = 0.45;
    var thresholdLoad = 0.12;

    function pickAndPlay() {
      var best = null;
      var bestR = 0;
      ratios.forEach(function (r, el) {
        if (r > bestR) {
          bestR = r;
          best = el;
        }
      });
      if (bestR < thresholdPlay) {
        best = null;
      }

      videos.forEach(function (v) {
        if (v === best) {
          ensureSrc(v);
          v.play().catch(function () {});
        } else {
          v.pause();
          v.currentTime = 0;
        }
      });
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var r = e.isIntersecting ? e.intersectionRatio : 0;
          ratios.set(e.target, r);
          if (r > thresholdLoad) {
            ensureSrc(e.target);
          }
        });
        pickAndPlay();
      },
      {
        root: null,
        rootMargin: '-12% 0px -12% 0px',
        threshold: [0, 0.1, 0.25, 0.45, 0.6, 0.75, 1]
      }
    );

    videos.forEach(function (v) {
      io.observe(v);
    });
  }

  function initStripArrows() {
    var strip = document.getElementById('ig-reels-strip');
    var prev = document.getElementById('ig-reel-prev');
    var next = document.getElementById('ig-reel-next');
    if (!strip || !prev || !next) return;

    function step() {
      var card = strip.querySelector('.ig-reel-card');
      if (!card) return 200;
      var gapStr = window.getComputedStyle(strip).gap;
      var gap = 14;
      if (gapStr && gapStr !== 'normal') {
        var parts = gapStr.split(' ');
        gap = parseFloat(parts[0]) || gap;
      }
      return card.offsetWidth + gap;
    }

    prev.addEventListener('click', function () {
      strip.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      strip.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }

  var reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var videos = Array.prototype.slice.call(
    document.querySelectorAll('video.ig-reel-video')
  );

  videos.forEach(initVideoEl);

  if (videos.length && !reducedMq.matches) {
    initAutoplayObserver(videos);
  }

  initStripArrows();
})();
