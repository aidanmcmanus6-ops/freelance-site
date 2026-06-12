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

// Page identity for the service pages, derived from the URL (no HTML edits
// needed). Drives per-page accents, numbered sections, and signatures.
const servicePath = window.location.pathname;
if (servicePath.startsWith('/web-design')) document.body.classList.add('page-web');
else if (servicePath.startsWith('/ai-automation')) document.body.classList.add('page-ai');
else if (servicePath.startsWith('/monitoring')) document.body.classList.add('page-mon');

// Service pages: their building blocks stagger-reveal automatically.
if (document.body.matches('.page-web, .page-ai, .page-mon')) {
  document.querySelectorAll('main .section-heading, .service-entry, .pricing-feature, .pricing-note, .process-step, .faq-row, .related-link').forEach((el, index) => {
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--d', `${((index % 4) * 0.07).toFixed(2)}s`);
  });
}

const header = document.querySelector('.site-header');
if (header) {
  // Inject the scroll progress bar so every static page matches the home page.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.appendChild(progress);

  const syncHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
  window.addEventListener('resize', syncHeaderState, { passive: true });
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

// Card physics for service-page surfaces + magnetic CTAs on every static
// page (mirrors CardPhysics in App.jsx). Mouse-only, reduced-motion aware.
if (finePointer && !reduceMotion) {
  const tiltSelector = '.service-entry, .pricing-feature, .faq-row, .related-link';
  const magnetSelector = '.button-primary, .button-outline, .button-secondary';
  let card = null;
  let magnet = null;
  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;

  const releaseCard = (el) => {
    el.style.transition = 'transform 0.45s ease';
    el.style.transform = '';
    window.setTimeout(() => {
      if (el !== card) el.style.transition = '';
    }, 480);
  };

  const loop = () => {
    curX += (targetX - curX) * 0.16;
    curY += (targetY - curY) * 0.16;
    if (card) {
      card.style.transform = `perspective(850px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
      raf = window.requestAnimationFrame(loop);
    } else {
      raf = 0;
    }
  };

  document.addEventListener('pointermove', (event) => {
    const origin = event.target instanceof Element ? event.target : null;
    const hitCard = origin ? origin.closest(tiltSelector) : null;
    const hitMagnet = origin ? origin.closest(magnetSelector) : null;

    if (hitCard !== card) {
      if (card) releaseCard(card);
      card = hitCard;
      curX = 0;
      curY = 0;
      if (card) card.style.transition = 'none';
    }
    if (card) {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      targetX = (py - 0.5) * -5.5;
      targetY = (px - 0.5) * 5.5;
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      if (!raf) raf = window.requestAnimationFrame(loop);
    }

    if (hitMagnet !== magnet) {
      if (magnet) magnet.style.transform = '';
      magnet = hitMagnet;
    }
    if (magnet) {
      const rect = magnet.getBoundingClientRect();
      const dx = Math.max(-4, Math.min(4, (event.clientX - (rect.left + rect.width / 2)) * 0.12));
      const dy = Math.max(-3, Math.min(3, (event.clientY - (rect.top + rect.height / 2)) * 0.18));
      magnet.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    }
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    if (card) {
      releaseCard(card);
      card = null;
    }
    if (magnet) {
      magnet.style.transform = '';
      magnet = null;
    }
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
