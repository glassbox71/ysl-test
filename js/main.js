'use strict';

const assetNames = new Set(window.yslAssets ?? []);

const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
function updateHeader() {
  header.classList.toggle('over-hero', hero.getBoundingClientRect().bottom > header.offsetHeight);
}
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader);
updateHeader();

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
document.addEventListener('site:search-select', event => revealBanner(event.detail));
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

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    for (const section of document.querySelectorAll('main > section:not(.hero)')) {
      gsap.from(Array.from(section.children).filter(child => !child.classList.contains('media')), {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          once: true,
        },
      });
    }
  });
}
