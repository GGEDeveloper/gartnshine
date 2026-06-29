/**
 * Header interactions — pesquisa expansível (mobile) e dropdown admin
 * Gonzaga's Art & Shine
 */
(function () {
  'use strict';

  function initHeaderSearch() {
    var searchToggle = document.getElementById('mobile-search-toggle');
    var searchClose = document.getElementById('mobile-search-close');
    var headerSearch = document.getElementById('header-search');
    if (!headerSearch) return;

    function getSearchInput() {
      return headerSearch.querySelector('.search-input, input[name="search"], input[type="search"]');
    }

    function expandSearch() {
      headerSearch.classList.add('expanded');
      if (searchToggle) searchToggle.setAttribute('aria-expanded', 'true');
      var inp = getSearchInput();
      if (inp) inp.focus();
      document.body.classList.add('mobile-search-expanded');
    }

    function collapseSearch() {
      headerSearch.classList.remove('expanded');
      if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
      var inp = getSearchInput();
      if (inp) inp.blur();
      document.body.classList.remove('mobile-search-expanded');
    }

    if (searchToggle) {
      searchToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        expandSearch();
      });
    }

    if (searchClose) {
      searchClose.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        collapseSearch();
      });
    }

    document.addEventListener('click', function (e) {
      if (window.innerWidth > 768) return;
      if (!headerSearch.classList.contains('expanded')) return;
      if (headerSearch.contains(e.target) || (searchToggle && searchToggle.contains(e.target))) return;
      collapseSearch();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && headerSearch.classList.contains('expanded')) {
        collapseSearch();
      }
    });
  }

  function initAdminDropdown() {
    var adminMenus = document.querySelectorAll('.admin-menu');
    if (!adminMenus.length) return;

    adminMenus.forEach(function (menu) {
      var toggle = menu.querySelector('.dropdown-toggle');
      if (!toggle) return;

      toggle.addEventListener('click', function (e) {
        if (window.innerWidth > 768) return;
        e.preventDefault();
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.admin-menu.open').forEach(function (m) {
          if (m !== menu) m.classList.remove('open');
        });
        menu.classList.toggle('open', !isOpen);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.admin-menu')) {
        document.querySelectorAll('.admin-menu.open').forEach(function (m) {
          m.classList.remove('open');
        });
      }
    });
  }

  function init() {
    initHeaderSearch();
    initAdminDropdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
