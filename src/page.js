// Shared entry for the static service landing pages.
// Content lives in the HTML (so it is fully crawlable without JS).
// This script only pulls in the shared stylesheet and replicates the
// home page header behavior (scroll state + mobile menu toggle).
import '../styles.css';

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
