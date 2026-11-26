// Progressive enhancement for a real-image gallery; cards remain visible without JavaScript.
(() => {
  'use strict';
  const gallery = document.querySelector('.rrs-visual-gallery--archive');
  if (gallery) {
    const filters = gallery.querySelector('[data-visual-filters]');
    const cards = [...gallery.querySelectorAll('[data-visual-category]')];
    const status = gallery.querySelector('[data-visual-status]');
    if (filters) filters.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-visual-filter]');
      if (!button || !filters.contains(button)) return;
      const category = button.dataset.visualFilter;
      let shown = 0;
      for (const card of cards) {
        const visible = category === 'all' || category === card.dataset.visualCategory;
        card.hidden = !visible;
        if (visible) shown++;
      }
      for (const choice of filters.querySelectorAll('button[data-visual-filter]')) {
        const active = choice === button;
        choice.classList.toggle('is-active', active);
        choice.setAttribute('aria-pressed', String(active));
      }
      if (status) status.textContent = `${shown} visual ${shown === 1 ? 'story' : 'stories'} in this selection`;
    });
  }

  if (!('HTMLDialogElement' in window)) return;
  const links = [...document.querySelectorAll('a.rrs-visual-card__media')];
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'rrs-photo-dialog';
  dialog.setAttribute('aria-label', 'Full-resolution visual archive image');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'rrs-photo-dialog__close';
  close.setAttribute('aria-label', 'Close image');
  close.textContent = '×';
  const image = document.createElement('img');
  image.className = 'rrs-photo-dialog__image';
  const caption = document.createElement('p');
  caption.className = 'rrs-photo-dialog__caption';
  const source = document.createElement('a');
  source.className = 'rrs-photo-dialog__source';
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Open original image ↗';
  dialog.append(close, image, caption, source);
  document.body.append(dialog);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  for (const link of links) {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
      event.preventDefault();
      const card = link.closest('.rrs-visual-card');
      const original = link.querySelector('img');
      if (!original) return;
      image.src = link.href;
      image.alt = original.alt;
      caption.textContent = card?.querySelector('figcaption h3')?.textContent || original.alt;
      source.href = link.href;
      dialog.showModal();
      close.focus();
    });
  }
})();
