/* Portfolio V2: mobile native-scroll visual parity and live rubric finishing. */
(() => {
  'use strict';

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const phone = '+639451973528';
  const hasPhone = '0945 197 3528';
  const motionOK = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const storyMode = () => window.innerWidth <= 1023 && window.innerHeight >= 560 && motionOK();
  const mobileMode = () => window.innerWidth <= 1023 && motionOK();
  const viewTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
  let pending = false;

  function completeRubric() {
    document.querySelectorAll('.ct-direct').forEach((contact) => {
      if (contact.querySelector('a[href="tel:' + phone + '"]')) return;
      const link = document.createElement('a');
      link.href = 'tel:' + phone;
      link.className = 'ct-mail rubric-phone';
      link.setAttribute('aria-label', 'Call ' + hasPhone);
      link.textContent = '☎ ' + hasPhone;
      const social = contact.querySelector('[class*="social"]');
      contact.insertBefore(link, social || null);
    });
    document.querySelectorAll('.site-foot > p').forEach((paragraph) => {
      if (paragraph.textContent && !paragraph.textContent.includes('All Rights Reserved')) {
        paragraph.textContent = '© ' + new Date().getFullYear() + ' Carl Anthony Eguizabal. All Rights Reserved.';
      }
    });
  }

  function manifesto() {
    if (!storyMode()) return;
    const section = document.querySelector('.ms');
    if (!section) return;
    const bounds = section.getBoundingClientRect();
    if (bounds.bottom < -80 || bounds.top > window.innerHeight + 80) return;
    const win = section.querySelector('[data-ms-window]');
    const text = section.querySelector('[data-ms-text]');
    const lines = Array.from(section.querySelectorAll('[data-line]'));
    const progress = section.querySelector('[data-ms-progress]');
    if (!win || !text || !lines.length) return;
    const distance = Math.max(1, bounds.height - window.innerHeight + 56);
    const p = clamp((56 - bounds.top) / distance);
    const last = Math.max(0, lines.length - 1);
    const c = clamp((p - 0.06) / 0.84) * last;
    const i = Math.floor(c);
    const centers = lines.map((l) => l.offsetTop + l.offsetHeight / 2);
    const a = centers[i] || 0;
    const b = centers[Math.min(last, i + 1)] || a;
    text.style.transform = 'translate3d(0, ' + (win.clientHeight / 2 - (a + (b - a) * (c - i))) + 'px, 0)';
    lines.forEach((line, k) => line.style.setProperty('--f', String(clamp(1 - Math.abs(k - c)))));
    if (progress) progress.style.transform = 'scaleX(' + p + ')';
  }

  function skillStack() {
    if (!storyMode()) return;
    const section = document.querySelector('.sv');
    if (!section) return;
    const bounds = section.getBoundingClientRect();
    if (bounds.bottom < -120 || bounds.top > window.innerHeight + 120) return;
    const items = Array.from(section.querySelectorAll('.sv__item:not(.sv__tail)'));
    const landed = items.map((item) => {
      const top = item.getBoundingClientRect().top;
      const stick = parseFloat(getComputedStyle(item).top) || 0;
      return clamp((window.innerHeight - top) / Math.max(1, window.innerHeight - stick));
    });
    items.forEach((item, i) => {
      const covered = landed.slice(i + 1).reduce((n, x) => n + x, 0);
      const card = item.querySelector('.sv__card');
      const dim = item.querySelector('.sv__dim');
      if (card) card.style.transform = covered > 0 ? 'scale(' + (1 - 0.035 * Math.min(covered, 4)) + ')' : '';
      if (dim) dim.style.opacity = String(Math.min(1, covered) * 0.48);
    });
    const fill = section.querySelector('[data-sv-rule]');
    if (fill && landed.length) fill.style.transform = 'scaleX(' + (landed.reduce((n, x) => n + x, 0) / landed.length) + ')';
  }

  function heroFallback() {
    if (!mobileMode() || viewTimeline) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = clamp(-r.top / Math.max(1, r.height));
    const title = hero.querySelector('.hero__title');
    const foot = hero.querySelector('.hero__foot');
    const thin = hero.querySelector('.hero__layer--thin');
    const bold = hero.querySelector('.hero__layer--bold');
    if (title) {
      title.style.transform = 'translate3d(0,' + (p * 24) + 'svh,0) scale(' + (1 - p * 0.08) + ')';
      title.style.opacity = String(1 - p);
    }
    if (foot) {
      foot.style.transform = 'translate3d(0,' + (-p * 38) + 'px,0)';
      foot.style.opacity = String(1 - clamp(p * 2.5));
    }
    if (thin) thin.style.translate = (-p * 5) + '% 0';
    if (bold) bold.style.translate = (p * 5) + '% 0';
  }

  /* React's select control is changed only when the reader reaches another stage;
     the original prev/next buttons and direct project picker continue to work. */
  const setNativeSelectValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  let lastRoomScroll = window.scrollY;
  function projectStory() {
    if (!storyMode()) return;
    const section = document.querySelector('.kt-rooms');
    if (!section) return;
    const select = section.querySelector('#showcase-project');
    if (!select || !select.options.length) return;
    const bounds = section.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    if (Math.abs(window.scrollY - lastRoomScroll) < 3) return;
    lastRoomScroll = window.scrollY;
    const p = clamp((62 - bounds.top) / Math.max(1, bounds.height - window.innerHeight + 92));
    const index = Math.min(select.options.length - 1, Math.floor(p * select.options.length));
    if (select.selectedIndex !== index) {
      setNativeSelectValue.call(select, String(index));
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function render() {
    pending = false;
    manifesto();
    skillStack();
    heroFallback();
    projectStory();
  }
  function tick() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(render);
  }

  const initialize = () => {
    completeRubric();
    tick();
    const root = document.getElementById('root');
    if (root) {
      const observer = new MutationObserver(() => {
        completeRubric();
        tick();
      });
      observer.observe(root, { childList: true, subtree: true });
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    window.addEventListener('orientationchange', tick, { passive: true });
    window.addEventListener('pageshow', tick);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tick);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
