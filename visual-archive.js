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
        const visible = category === 'all' || (category === 'videos' ? card.dataset.visualKind === 'video' : category === card.dataset.visualCategory);
        card.hidden = !visible;
        // Filtering out a card must immediately stop its audio, too.
        if (!visible) card.querySelectorAll('video').forEach(video => video.pause());
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

  // A gallery video should never keep playing after the visitor scrolls past it.
  // Pause rather than rewind, so returning to the clip preserves their position.
  const videos = [...document.querySelectorAll('.rrs-visual-gallery video')];
  if (videos.length) {
    const minimumVisibleRatio = 0.3;
    const pauseAll = () => videos.forEach(video => {
      if (!video.paused) video.pause();
    });

    const visibleEnough = video => {
      if (video.closest('[hidden]') || document.hidden) return false;
      const bounds = video.getBoundingClientRect();
      const visibleWidth = Math.max(0, Math.min(bounds.right, window.innerWidth) - Math.max(bounds.left, 0));
      const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
      const area = bounds.width * bounds.height;
      return area > 0 && (visibleWidth * visibleHeight) / area >= minimumVisibleRatio;
    };

    // Starting a new clip also silences the previously playing one.
    for (const video of videos) {
      video.addEventListener('play', () => {
        videos.forEach(other => {
          if (other !== video && !other.paused) other.pause();
        });
        if (!visibleEnough(video)) video.pause();
      });
    }

    const pauseOutOfView = () => {
      videos.forEach(video => {
        if (!video.paused && !visibleEnough(video)) video.pause();
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if ((!entry.isIntersecting || entry.intersectionRatio < minimumVisibleRatio) && !entry.target.paused) {
            entry.target.pause();
          }
        });
      }, { threshold: [0, minimumVisibleRatio, 1] });
      videos.forEach(video => observer.observe(video));
    } else {
      // Older browsers still get pause-on-scroll behavior.
      window.addEventListener('scroll', pauseOutOfView, { passive: true });
    }
    window.addEventListener('resize', pauseOutOfView, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseAll();
    });
    window.addEventListener('pagehide', pauseAll);
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
  source.textContent = 'View full-size image ↗';
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
