// Shared entry for the static landing/blog pages.
// Content lives in the HTML (so it is fully crawlable without JS).
// This script pulls in the shared stylesheet, runs Vercel Analytics +
// Speed Insights, and replicates the home header behavior (scroll + menu).
import '../styles.css';
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
