// Shared entry for the static landing/blog pages.
// Content lives in the HTML (so it is fully crawlable without JS).
// This script pulls in the shared stylesheet, runs Vercel Analytics +
// Speed Insights, and replicates the home header behavior (scroll + menu).
import '../styles.css';
import '../blog-cards.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Vercel Web Analytics + Speed Insights for every static page.
// (The home React SPA uses the <Analytics/> and <SpeedInsights/> components.)
inject();
injectSpeedInsights();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const header = document.querySelector('.site-header');
if (header) {
  const syncHeaderState = () => header.classList.toggle('scrolled', window.scrollY > 12);
  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
}

const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Scroll reveal for any element opting in via [data-reveal].
const revealTargets = document.querySelectorAll('[data-reveal]');
if (revealTargets.length) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => revealObserver.observe(el));
  }
}

// Blog topic filters (blog index only).
const filterButtons = document.querySelectorAll('.blog-filter');
if (filterButtons.length) {
  const posts = document.querySelectorAll('[data-cat]');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      const want = btn.dataset.filter;
      posts.forEach((post) => {
        post.classList.toggle('blog-hidden', want !== 'all' && post.dataset.cat !== want);
      });
    });
  });
}

// Catalog physics (blog index, mouse devices only): each entry tilts in 3D
// toward the pointer with a glare sheen tracking across its surface, and the
// section's blueprint grid is lit by a spotlight that follows the cursor.
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.cat-card').forEach((card) => {
    let raf = 0;
    let px = 0.5;
    let py = 0.5;

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width;
      py = (event.clientY - rect.top) / rect.height;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        card.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((py - 0.5) * -8).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      });
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  const catalog = document.querySelector('.blog-index');
  if (catalog) {
    let spotRaf = 0;
    let sx = 0;
    let sy = 0;
    catalog.addEventListener('pointermove', (event) => {
      const rect = catalog.getBoundingClientRect();
      sx = event.clientX - rect.left;
      sy = event.clientY - rect.top;
      if (spotRaf) return;
      spotRaf = window.requestAnimationFrame(() => {
        spotRaf = 0;
        catalog.style.setProperty('--sx', `${sx.toFixed(0)}px`);
        catalog.style.setProperty('--sy', `${sy.toFixed(0)}px`);
      });
    });
  }
}
