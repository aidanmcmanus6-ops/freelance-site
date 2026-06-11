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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
