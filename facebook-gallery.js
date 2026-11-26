// Read-only, progressive-enhancement archive gallery. No tokens or raw exports reach the browser.
(() => {
  'use strict';
  const root = document.getElementById('facebook-gallery');
  if (!root) return;

  const grid = root.querySelector('[data-facebook-grid]');
  const count = root.querySelector('[data-facebook-count]');
  const filters = root.querySelector('[data-facebook-filters]');
  const more = root.querySelector('[data-facebook-more]');
  const notice = document.getElementById('facebook-archive-notice');
  const categoryNames = {
    'film-sets': 'Film sets', television: 'Television',
    awards: 'Awards', career: 'Career', events: 'Events'
  };
  let records = [];
  let selected = 'all';
  let visibleCount = 24;

  function mediaUrl(value) {
    if (typeof value !== 'string') return null;
    if (/^assets\/facebook\/[a-z0-9_-]+\.(?:jpg|jpeg|png|webp|gif)$/i.test(value)) return value;
    try {
      const uri = new URL(value);
      return uri.protocol === 'https:' && uri.hostname === 'res.cloudinary.com' ? uri.href : null;
    } catch { return null; }
  }
  function sourceUrl(value) {
    if (typeof value !== 'string') return null;
    try {
      const uri = new URL(value);
      return uri.protocol === 'https:' &&
        (uri.hostname === 'facebook.com' || uri.hostname.endsWith('.facebook.com') ||
         uri.hostname === 'fb.com' || uri.hostname.endsWith('.fb.com')) ? uri.href : null;
    } catch { return null; }
  }
  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }
  function formatDate(value) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  function photoCard(record) {
    const card = el('article', 'facebook-photo');
    const media = el('div', 'facebook-photo__media');
    const img = document.createElement('img');
    img.src = record.image;
    img.alt = record.alt || record.caption.slice(0, 140) || 'Photograph from Ramesh R Sharma’s archive';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      media.replaceChildren(el('span', 'facebook-photo__unavailable', 'Image temporarily unavailable'));
    }, { once: true });
    media.append(img);
    const body = el('div', 'facebook-photo__body');
    const meta = el('div', 'facebook-photo__meta');
    const tag = el('span', null, categoryNames[record.category]);
    const date = el('time', null, formatDate(record.createdAt));
    if (record.createdAt && !Number.isNaN(new Date(record.createdAt).getTime())) date.dateTime = record.createdAt;
    meta.append(tag, date);
    const caption = el('p', 'facebook-photo__caption', record.caption || 'Original Facebook caption unavailable.');
    body.append(meta, caption);
    if (record.sourceUrl) {
      const link = el('a', 'facebook-photo__source', 'Original Facebook post ↗');
      link.href = record.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'View original source on Facebook');
      body.append(link);
    }
    card.append(media, body);
    return card;
  }

  function render() {
    const current = selected === 'all' ? records : records.filter(record => record.category === selected);
    grid.replaceChildren(...current.slice(0, visibleCount).map(photoCard));
    count.textContent = `Showing ${Math.min(current.length, visibleCount)} of ${current.length} archive photographs`;
    more.hidden = current.length <= visibleCount;
    filters.querySelectorAll('button').forEach(button => {
      const active = button.dataset.category === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  async function init() {
    try {
      const response = await fetch('data/facebook-posts.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Catalogue request failed');
      const payload = await response.json();
      if (!Array.isArray(payload.items)) throw new Error('Invalid catalogue');
      const allowed = new Set(Object.keys(categoryNames));
      records = payload.items.flatMap(item => {
        if (!allowed.has(item.category) || !Array.isArray(item.images)) return [];
        return item.images.flatMap(image => {
          const src = mediaUrl(image.url);
          if (!src) return [];
          return [{
            image: src, alt: typeof image.alt === 'string' ? image.alt : '',
            caption: typeof item.caption === 'string' ? item.caption : '',
            category: item.category, createdAt: item.createdAt,
            sourceUrl: sourceUrl(item.sourceUrl)
          }];
        });
      });
      if (!records.length) return;
      root.hidden = false;
      if (notice) notice.hidden = true;
      render();
    } catch (error) {
      // Keep the existing, truthful no-posts-yet notice visible.
      console.warn('Facebook archive is not yet available:', error.message);
    }
  }

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');
    if (!button || !filters.contains(button)) return;
    selected = button.dataset.category;
    visibleCount = 24;
    render();
  });
  more.addEventListener('click', () => { visibleCount += 24; render(); });
  init();
})();
