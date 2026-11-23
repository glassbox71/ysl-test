'use strict';

document.documentElement.classList.add('js');

const assetNames = new Set(window.yslAssets ?? []);
for (const slot of document.querySelectorAll('[data-image]')) {
  const filename = slot.dataset.image;
  if (!assetNames.has(filename)) continue;

  const image = document.createElement('img');
  image.alt = '';
  image.decoding = 'async';
  image.loading = filename === 'hero-poster.png' ? 'eager' : 'lazy';
  image.src = 'assets/' + encodeURIComponent(filename);
  image.addEventListener('error', () => image.remove(), { once: true });
  slot.append(image);
}

const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
function updateHeader() {
  header.classList.toggle('over-hero', hero.getBoundingClientRect().bottom > header.offsetHeight);
}
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader);
updateHeader();

const nav = document.querySelector('#main-nav');
const menu = document.querySelector('.menu-toggle');
const mobile = window.matchMedia('(max-width: 840px)');

function closeMenu(restoreFocus = false) {
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menu.focus();
}

function updateMenu() {
  const moveFocus = mobile.matches && nav.contains(document.activeElement);
  menu.hidden = !mobile.matches;
  closeMenu(moveFocus);
}

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
  if (open) nav.querySelector('a').focus();
});
nav.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || !mobile.matches) return;
  closeMenu();
  const target = document.querySelector(link.hash);
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
});
header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
});
header.addEventListener('focusout', event => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
mobile.addEventListener('change', updateMenu);
updateMenu();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
for (const section of document.querySelectorAll('[data-carousel]')) {
  const rail = section.querySelector('.rail');
  const controls = section.querySelector('[data-controls]');
  const [previous, next] = controls.querySelectorAll('button');

  function updateControls() {
    const end = rail.scrollWidth - rail.clientWidth;
    controls.hidden = end < 2;
    previous.setAttribute('aria-disabled', String(rail.scrollLeft < 2));
    next.setAttribute('aria-disabled', String(rail.scrollLeft >= end - 2));
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    const step = rail.firstElementChild.getBoundingClientRect().width + gap;
    rail.scrollBy({
      left: Number(button.dataset.step) * step,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  });
  rail.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(rail);
  updateControls();
}

const tablist = document.querySelector('#service-tabs');
const tabs = Array.from(tablist.querySelectorAll('button'));
tablist.setAttribute('role', 'tablist');
tablist.setAttribute('aria-label', '한정 서비스');

function selectTab(activeTab, moveFocus = false) {
  for (const tab of tabs) {
    const active = tab === activeTab;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = !active;
    panel.tabIndex = 0;
  }
  if (moveFocus) activeTab.focus();
}

tablist.addEventListener('click', event => {
  const tab = event.target.closest('button');
  if (tab) selectTab(tab);
});
tablist.addEventListener('keydown', event => {
  const current = tabs.indexOf(event.target);
  if (current < 0) return;
  const destinations = {
    ArrowLeft: (current + tabs.length - 1) % tabs.length,
    ArrowRight: (current + 1) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  };
  if (!Object.hasOwn(destinations, event.key)) return;
  event.preventDefault();
  selectTab(tabs[destinations[event.key]], true);
});
selectTab(tabs[0]);
tablist.hidden = false;

const search = document.querySelector('#site-search');
const searchButton = document.querySelector('[data-search-open]');
const query = document.querySelector('#search-query');
const status = document.querySelector('#search-status');
const results = document.querySelector('#search-results');
const searchTargets = Array.from(document.querySelectorAll('main section[id], .best-card[id]'), target => ({
  id: target.id,
  title: target.querySelector('h2, h3').textContent,
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
    link.href = '#' + target.id;
    link.textContent = target.title;
    item.append(link);
    results.append(item);
  }
}

if (typeof search.showModal === 'function') {
  searchButton.hidden = false;
  searchButton.addEventListener('click', () => {
    updateResults();
    search.showModal();
  });
  query.addEventListener('input', updateResults);
  results.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    search.close();
    const target = document.querySelector(link.hash);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
}

if (assetNames.has('hero-logo.svg')) {
  const logo = document.createElement('img');
  const brandText = document.querySelector('.hero-brand-text');
  logo.className = 'hero-logo';
  logo.alt = '';
  logo.addEventListener('load', () => {
    brandText.hidden = true;
    brandText.before(logo);
  }, { once: true });
  logo.src = 'assets/hero-logo.svg';
}

if (assetNames.has('hero.mp4')) {
  const video = document.createElement('video');
  const videoToggle = document.querySelector('.hero-video-toggle');
  video.className = 'hero-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.hidden = true;
  video.src = 'assets/hero.mp4';
  hero.querySelector('.media').append(video);
  videoToggle.hidden = false;

  videoToggle.addEventListener('click', async () => {
    if (!video.paused) {
      video.pause();
      return;
    }
    video.hidden = false;
    try {
      await video.play();
    } catch {
      video.hidden = true;
      videoToggle.textContent = '영상 재생 다시 시도';
    }
  });
  video.addEventListener('play', () => { videoToggle.textContent = '영상 일시 정지'; });
  video.addEventListener('pause', () => { videoToggle.textContent = '영상 재생'; });
}
