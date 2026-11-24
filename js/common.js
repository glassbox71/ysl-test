'use strict';

(() => {
  document.documentElement.classList.add('js');

  function initMenu() {
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('#main-nav');
    const menu = document.querySelector('.menu-toggle');
    if (!header || !nav || !menu) return;
    const panel = document.getElementById(menu.getAttribute('aria-controls')) || nav;
    const mobile = window.matchMedia('(max-width: 1050px)');

    function closeMenu(restoreFocus = false) {
      panel.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      if (restoreFocus) menu.focus();
    }

    function updateMenu() {
      const moveFocus = mobile.matches && panel.contains(document.activeElement);
      menu.hidden = !mobile.matches;
      closeMenu(moveFocus);
    }

    menu.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
      if (open) nav.querySelector('a')?.focus();
    });
    nav.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || !mobile.matches) return;
      closeMenu();
      if (link.origin !== location.origin || link.pathname !== location.pathname || link.search !== location.search) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
    header.addEventListener('keydown', event => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) closeMenu(true);
    });
    header.addEventListener('focusout', event => {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) closeMenu();
    });
    mobile.addEventListener('change', updateMenu);
    updateMenu();
  }

  function initSearch() {
    const search = document.querySelector('#site-search');
    const searchButton = document.querySelector('[data-search-open]');
    if (!searchButton || typeof search?.showModal !== 'function') return;
    const query = document.querySelector('#search-query');
    const status = document.querySelector('#search-status');
    const results = document.querySelector('#search-results');
    if (!query || !status || !results) return;
    const searchTargets = Array.from(document.querySelectorAll('[data-search-target][id]'), target => ({
      id: target.id,
      title: target.dataset.searchTarget || target.querySelector('h1, h2, h3')?.textContent || target.id,
      text: target.textContent.toLocaleLowerCase('ko'),
    }));

    function updateResults() {
      const keyword = query.value.trim().toLocaleLowerCase('ko');
      results.replaceChildren();
      if (!keyword) {
        status.textContent = '상품명 또는 콘텐츠 이름을 입력하세요.';
        return;
      }

      const matches = searchTargets.filter(target => target.text.includes(keyword));
      status.textContent = matches.length ? '검색 결과 ' + matches.length + '건' : '검색 결과가 없습니다.';
      for (const target of matches) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + encodeURIComponent(target.id);
        link.dataset.targetId = target.id;
        link.textContent = target.title;
        item.append(link);
        results.append(item);
      }
    }

    searchButton.hidden = false;
    searchButton.addEventListener('click', () => {
      updateResults();
      search.showModal();
    });
    search.addEventListener('close', () => {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if ((active === document.body || active === searchButton || search.contains(active)) && !searchButton.getClientRects().length) {
          searchButton.closest('.site-header')?.querySelector('.menu-toggle')?.focus();
        }
      });
    });
    query.addEventListener('input', updateResults);
    results.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;
      search.close();
      document.dispatchEvent(new CustomEvent('site:search-select', { detail: link.hash }));
      const target = document.getElementById(link.dataset.targetId);
      if (!target) return;
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  }

  initMenu();
  initSearch();
})();
