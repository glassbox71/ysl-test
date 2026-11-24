'use strict';

document.documentElement.classList.add('js');

const assetNames = new Set(window.yslAssets ?? []);

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
const mobile = window.matchMedia('(max-width: 1050px)');

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
function slideSpeed() {
  return reducedMotion.matches ? 0 : 360;
}

if (window.Swiper) {
  const carousels = document.querySelectorAll('[data-carousel]');
  for (const section of carousels) {
    const rail = section.querySelector('.rail');
    const autoAdvance = section.id === 'best-items';
    const controls = section.querySelector('[data-controls]');
    const [prevEl, nextEl] = controls.querySelectorAll('button');
    const viewport = document.createElement('div');
    viewport.className = 'swiper rail-viewport';
    rail.before(viewport);
    viewport.append(rail);
    if (rail.classList.contains('wrap')) {
      rail.classList.remove('wrap');
      viewport.classList.add('wrap');
    }
    rail.classList.add('swiper-wrapper');
    for (const slide of rail.children) slide.classList.add('swiper-slide');

    function gap() {
      return autoAdvance ? 0 : Math.max(12, Math.min(innerWidth / 64, 30));
    }

    new Swiper(viewport, {
      slidesPerView: 'auto',
      spaceBetween: gap(),
      speed: slideSpeed(),
      grabCursor: true,
      watchSlidesProgress: true,
      loop: autoAdvance,
      autoplay: autoAdvance && {
        enabled: !reducedMotion.matches,
        delay: 3000,
        waitForTransition: false,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: { prevEl, nextEl },
      a11y: { enabled: false },
      on: {
        beforeResize(swiper) { swiper.params.spaceBetween = gap(); },
      },
    });
    controls.hidden = false;

    rail.addEventListener('keydown', event => {
      if (event.target !== rail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') viewport.swiper.slidePrev();
      else viewport.swiper.slideNext();
    });
  }
}

function revealBanner(hash = location.hash) {
  const slide = document.getElementById(hash.slice(1));
  if (!slide?.classList.contains('swiper-slide')) return;
  const swiper = slide.closest('.swiper').swiper;
  const index = swiper.slides.indexOf(slide);
  if (index < 0 || slide.classList.contains('swiper-slide-visible')) return;
  if (swiper.params.loop) swiper.slideToLoop(Number(slide.dataset.swiperSlideIndex), 0);
  else swiper.slideTo(index, 0);
}

window.addEventListener('hashchange', () => revealBanner());
revealBanner();

const categoryViewport = document.querySelector('.category-carousel');
const category = categoryViewport.querySelector('.category-grid');
const categoryButtons = Array.from(category.querySelectorAll('.category-trigger'));

function expandCategory(selected) {
  for (const button of categoryButtons) {
    const expanded = button === selected;
    button.setAttribute('aria-expanded', String(expanded));
    document.getElementById(button.getAttribute('aria-controls')).inert = !expanded;
  }
}

for (const button of categoryButtons) button.hidden = false;
category.classList.add('is-accordion');
expandCategory(categoryButtons[0]);

const categorySwiper = window.Swiper ? new Swiper(categoryViewport, {
  // Swiper selects the item while CSS animates the accordion dimensions.
  virtualTranslate: true,
  followFinger: false,
  speed: 0,
  rewind: true,
  touchStartPreventDefault: false,
  grabCursor: true,
  a11y: { enabled: false },
  on: {
    slideChange(swiper) { expandCategory(categoryButtons[swiper.activeIndex]); },
  },
}) : null;

function selectCategory(button) {
  if (categorySwiper) categorySwiper.slideTo(categoryButtons.indexOf(button), 0);
  else expandCategory(button);
}

category.addEventListener('click', event => {
  const button = event.target.closest('.category-trigger');
  if (button) selectCategory(button);
});
function syncCategory() {
  const item = document.getElementById(location.hash.slice(1));
  if (item?.parentElement === category) selectCategory(item.querySelector('.category-trigger'));
}
window.addEventListener('hashchange', syncCategory);
syncCategory();

const tablist = document.querySelector('#service-tabs');
const tabs = Array.from(tablist.querySelectorAll('button'));
tablist.setAttribute('role', 'tablist');
tablist.setAttribute('aria-label', '한정 서비스');

const serviceSlider = document.querySelector('.service-slider');
const servicePanels = serviceSlider.querySelector('.service-panels');

function updateTabs(activeTab) {
  for (const tab of tabs) {
    const active = tab === activeTab;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.inert = !active;
    panel.hidden = !serviceSwiper && !active;
    panel.tabIndex = active ? 0 : -1;
  }

}

let serviceSwiper;
if (window.Swiper) {
  serviceSlider.classList.add('swiper');
  servicePanels.classList.add('swiper-wrapper');
  for (const panel of servicePanels.children) panel.classList.add('swiper-slide');
  serviceSwiper = new Swiper(serviceSlider, {
    effect: 'fade',
    fadeEffect: { crossFade: true },
    grabCursor: true,
    autoHeight: true,
    speed: slideSpeed(),
    a11y: { enabled: false },
    on: {
      slideChange(swiper) { updateTabs(tabs[swiper.activeIndex]); },
    },
  });
}

reducedMotion.addEventListener('change', () => {
  for (const slider of document.querySelectorAll('.rail-viewport.swiper-initialized, .service-slider.swiper-initialized')) {
    const swiper = slider.swiper;
    swiper.params.speed = slideSpeed();
    if (slider.closest('#best-items')) {
      if (reducedMotion.matches) swiper.autoplay.stop();
      else swiper.autoplay.start();
    }
  }
});

function selectTab(activeTab, moveFocus = false) {
  serviceSwiper?.slideTo(tabs.indexOf(activeTab));
  updateTabs(activeTab);
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
    revealBanner(link.hash);
    const target = document.querySelector(link.hash);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
}

const brandText = document.querySelector('.hero-brand-text');
if (brandText && assetNames.has('hero-logo.svg')) {
  const logo = document.createElement('img');
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
  const toggle = document.querySelector('.hero-video-toggle');
  video.className = 'hero-video';
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = !reducedMotion.matches;
  video.preload = video.autoplay ? 'auto' : 'none';
  video.src = 'assets/hero.mp4';
  video.addEventListener('playing', () => {
    video.classList.add('is-playing');
    toggle.textContent = '영상 일시 정지';
  });
  video.addEventListener('pause', () => { toggle.textContent = '영상 재생'; });
  video.addEventListener('error', () => {
    video.classList.remove('is-playing');
    toggle.hidden = true;
  });
  toggle.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => { toggle.textContent = '영상 재생 다시 시도'; });
    } else {
      video.pause();
    }
  });
  reducedMotion.addEventListener('change', () => {
    video.autoplay = !reducedMotion.matches;
    if (reducedMotion.matches) video.pause();
  });
  hero.querySelector('.media').append(video);
  toggle.hidden = false;
}
