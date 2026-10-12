// Cinematic portfolio interactions — lightweight, accessible, and progressive-enhancement first.
(() => {
  'use strict';

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('primary-navigation');
    const navLinks = Array.from(document.querySelectorAll('.nav__link'));

    const closeMenu = () => {
      if (!navToggle || !navMenu) return;
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      navToggle.querySelectorAll('span').forEach((span) => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    };

    const openMenu = () => {
      if (!navToggle || !navMenu) return;
      navMenu.classList.add('active');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation menu');
      const spans = navToggle.querySelectorAll('span');
      if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      if (spans[1]) spans[1].style.opacity = '0';
      if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    };

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.contains('active') ? closeMenu() : openMenu();
      });

      navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          const target = document.querySelector(link.getAttribute('href'));
          if (!target) return;
          event.preventDefault();
          closeMenu();
          const headerOffset = header ? header.getBoundingClientRect().height : 0;
          const top = window.scrollY + target.getBoundingClientRect().top - headerOffset - 8;
          window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
          if (history.replaceState) history.replaceState(null, '', link.getAttribute('href'));
        });
      });

      document.addEventListener('click', (event) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(event.target) &&
            !navToggle.contains(event.target)) closeMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
          closeMenu();
          navToggle.focus();
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
      });
    }

    // Smooth-scroll buttons retain native behavior when motion is reduced.
    document.querySelectorAll('[onclick*="scrollToSection"]').forEach((button) => {
      button.removeAttribute('onclick');
      button.addEventListener('click', () => {
        const destination = button.classList.contains('btn--outline') ? 'contact' : 'filmography';
        const target = document.getElementById(destination);
        if (!target) return;
        const offset = header ? header.getBoundingClientRect().height : 0;
        window.scrollTo({
          top: window.scrollY + target.getBoundingClientRect().top - offset - 8,
          behavior: reducedMotion.matches ? 'auto' : 'smooth'
        });
      });
    });

    // Header state and current chapter update in one throttled scroll pass.
    let scrollPending = false;
    const updateScrollState = () => {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
      const marker = window.scrollY + (header ? header.getBoundingClientRect().height : 0) + 100;
      let currentId = 'home';
      document.querySelectorAll('main section[id]').forEach((section) => {
        if (section.offsetTop <= marker) currentId = section.id;
      });
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      scrollPending = false;
    };

    window.addEventListener('scroll', () => {
      if (scrollPending) return;
      scrollPending = true;
      window.requestAnimationFrame(updateScrollState);
    }, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    updateScrollState();

    // Reveal content only when it can be observed; without support, content stays visible.
    const revealTargets = document.querySelectorAll(
      '.section__title, .directors-cut__visual, .directors-cut__copy, .featured-serial, ' +
      '.film-reel__item, .highlight-card, .film-card, .ad-card, .timeline__item, ' +
      '.detail-card, .contact__info, .contact__social'
    );

    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      revealTargets.forEach((element, index) => {
        element.classList.add('cinema-reveal');
        if (element.matches('.film-reel__item, .featured-serial')) {
          element.style.setProperty('--reveal-delay', (index % 3) * 80 + 'ms');
        }
      });
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
      revealTargets.forEach((element) => revealObserver.observe(element));
    } else {
      revealTargets.forEach((element) => element.classList.add('is-in-view'));
    }

    // Accessible archive filters.
    const filters = Array.from(document.querySelectorAll('[data-film-filter]'));
    const categories = Array.from(document.querySelectorAll('[data-film-category]'));
    const status = document.getElementById('filmography-status');

    filters.forEach((button) => {
      button.addEventListener('click', () => {
        const selected = button.dataset.filmFilter;
        let visibleCount = 0;
        filters.forEach((filter) => {
          const active = filter === button;
          filter.classList.toggle('is-active', active);
          filter.setAttribute('aria-pressed', String(active));
        });
        categories.forEach((category) => {
          const visible = selected === 'all' || category.dataset.filmCategory === selected;
          category.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        if (status) {
          status.textContent = selected === 'all'
            ? 'Showing all ' + visibleCount + ' categories'
            : 'Showing ' + visibleCount + ' ' + (visibleCount === 1 ? 'category' : 'categories');
        }
      });
    });

    // Keep remote artwork failures graceful and the year current.
    document.querySelectorAll('.featured-serial__image').forEach((frame) => {
      const image = frame.querySelector('img');
      if (!image) return;
      const markUnavailable = () => frame.classList.add('poster-unavailable');
      image.addEventListener('error', markUnavailable, { once: true });
      if (image.complete && image.naturalWidth === 0) markUnavailable();
    });
    const year = document.getElementById('copyright-year');
    if (year) year.textContent = String(new Date().getFullYear());

    // A short, silent camera-gate accent; it never blocks or hides the page.
    if (!reducedMotion.matches && !document.querySelector('.cinema-gate')) {
      const gate = document.createElement('div');
      gate.className = 'cinema-gate';
      gate.setAttribute('aria-hidden', 'true');
      const mark = document.createElement('span');
      mark.className = 'cinema-gate__mark';
      mark.textContent = 'CAMERA ROLLING  ·  RAMESH R SHARMA';
      gate.appendChild(mark);
      document.body.appendChild(gate);
      window.setTimeout(() => gate.remove(), 1100);
    }
  });
})();
