// Shared entry for the static landing/blog pages.
// Content lives in the HTML (so it is fully crawlable without JS).
// This script pulls in the shared stylesheet, runs Vercel Analytics +
// Speed Insights, and replicates the home header behavior (scroll + menu).
import '../styles.css';
import '../blog-cards.css';
import '../svc-scenes.css';
import '../site-v2.css';
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

// New shared "v2" design system. Applied to every static page EXCEPT the blog
// (the blog keeps its bespoke magazine design). Rolling out in waves: enabled
// here for the three service pages first.
const isBlog = servicePath.startsWith('/blog');
const v2Paths = ['/web-design', '/ai-automation', '/monitoring'];
const useV2 = !isBlog && v2Paths.some((p) => servicePath.startsWith(p));
if (useV2) {
  document.body.classList.add('site-v2');
  const f = document.createElement('link');
  f.rel = 'stylesheet';
  f.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(f);

  // Living flow-field nebula behind the hero (same effect as the home page),
  // tinted by the page accent. Loaded only on v2 pages.
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.classList.add('hero-v2');
    heroEl.insertAdjacentHTML('afterbegin', '<canvas id="flow" aria-hidden="true"></canvas><div class="hero-aura" aria-hidden="true"></div><div class="hero-vign" aria-hidden="true"></div>');
    const fc = heroEl.querySelector('#flow');
    import('./flowField.js')
      .then((m) => { try { if (!m.initFlowField(fc, {})) fc.style.display = 'none'; } catch (e) { fc.style.display = 'none'; } })
      .catch(() => { fc.style.display = 'none'; });
  }
}

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
// Header parity: every static (non-home) page shows the same full nav so you
// can reach any page from anywhere, kept consistent sitewide without editing
// each page (future blog posts inherit it too). The home SPA renders its own
// matching nav from App.jsx.
if (nav) {
  nav.innerHTML = '<a href=\"/\">Home</a><a href=\"/web-design/\">Web Design</a><a href=\"/ai-automation/\">AI Automation</a><a href=\"/monitoring/\">Monitoring</a><a href=\"/work/\">Work</a><a href=\"/about/\">About</a><a href=\"/blog/\">Blog</a><a href=\"/#contact\" class=\"button button-secondary\">Contact</a>';
}
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

// Card physics for service-page surfaces + magnetic CTAs. The 3D card tilt is
// disabled on v2 pages (it read as "bendy"); the subtle button magnet stays.
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
    const hitCard = (origin && !useV2) ? origin.closest(tiltSelector) : null;
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

// ── Service-page hero scenes ────────────────────────
// Living dioramas for each service hero (web rebuild, ai pipeline, mon heal).
// They play inside the hero card, with the flow-field nebula behind.
const sceneKind = document.body.classList.contains('page-web') ? 'web'
  : document.body.classList.contains('page-ai') ? 'ai'
  : document.body.classList.contains('page-mon') ? 'mon'
  : null;

if (sceneKind && !reduceMotion) {
  const visual = document.querySelector('.hero-visual');
  if (visual) {
    const mockup = visual.querySelector('.hero-mockup');
    if (mockup) mockup.style.display = 'none';
    visual.querySelectorAll('.hero-chip').forEach((chip) => { chip.style.display = 'none'; });
    const scene = document.createElement('div');
    scene.className = `svc-scene svc-${sceneKind}`;
    scene.setAttribute('aria-hidden', 'true');
    visual.appendChild(scene);
    if (sceneKind === 'web') initWebScene(scene);
    else if (sceneKind === 'ai') initAiScene(scene);
    else initMonScene(scene);
  }
}

function initWebScene(scene) {
  scene.innerHTML = `
    <div class="svc-browser">
      <div class="svc-bar"><span class="svc-dot"></span><span class="svc-dot"></span><span class="svc-dot"></span><span class="svc-url">yourbusiness.com</span></div>
      <div class="svc-viewport">
        <div class="svc-new">
          <div class="svc-new-nav"><span class="svc-new-logo"></span><span class="svc-new-links"><i></i><i></i><i></i></span><span class="svc-new-cta"></span></div>
          <div class="svc-new-hero"><span class="svc-new-h1"></span><span class="svc-new-h1 short"></span><span class="svc-new-p"></span><span class="svc-new-btn"></span></div>
          <div class="svc-new-cards"><i></i><i></i><i></i></div>
        </div>
        <div class="svc-old">
          <div class="svc-old-banner">~*~ WELCOME TO OUR HOMEPAGE!!! ~*~</div>
          <div class="svc-old-nav"><u>Home</u>|<u>About Us</u>|<u>Photos</u>|<u>Guestbook</u></div>
          <div class="svc-old-marquee"><span>*** Best viewed in Internet Explorer 6 at 800x600 *** Thanks for visiting!!! *** Sign our guestbook! ***</span></div>
          <div class="svc-old-body">
            <p>We are a family owned business serving the area since 1987. Please excuse our dust, this site is UNDER CONSTRUCTION.</p>
            <div class="svc-old-imgs"><span class="svc-old-img">[ img ]</span><span class="svc-old-img">[ img ]</span></div>
            <span class="svc-old-btn">Click Here!</span>
            <p class="svc-old-meta">Visitor #004,217 &middot; Last updated 2014</p>
          </div>
        </div>
        <div class="svc-scan"></div>
        <div class="svc-badge">&#9650; 100 &middot; Performance</div>
      </div>
    </div>
    <div class="svc-caption"><span class="svc-cap-text">Before &middot; legacy build, last touched 2014</span></div>`;

  const cap = scene.querySelector('.svc-cap-text');
  const phases = [
    ['old', 3600, 'Before · legacy build, last touched 2014'],
    ['kick', 1050, 'Out with the old…'],
    ['build', 2700, 'Rebuilding · nav → hero → sections'],
    ['new', 5200, 'After · modern build · fast on every device'],
    ['reset', 900, 'Next redesign queued…'],
  ];
  let i = 0;
  const step = () => {
    const [phase, hold, label] = phases[i];
    scene.dataset.phase = phase;
    cap.textContent = label;
    i = (i + 1) % phases.length;
    window.setTimeout(step, hold);
  };
  step();
}

function initAiScene(scene) {
  scene.innerHTML = `
    <svg viewBox="0 0 440 360" xmlns="http://www.w3.org/2000/svg">
      <path class="svc-wire" style="--wd: 0.9s" d="M130,166 L183,166"/>
      <path class="svc-wire" style="--wd: 1.15s" d="M257,166 C300,166 296,56 318,56"/>
      <path class="svc-wire" style="--wd: 1.3s" d="M257,166 L318,166"/>
      <path class="svc-wire" style="--wd: 1.45s" d="M257,166 C300,166 296,276 318,276"/>
      <path class="svc-wire svc-x svc-x-wire" d="M220,203 C220,250 248,256 248,292"/>
      <circle class="svc-pkt" r="4"><animateMotion dur="2.7s" repeatCount="indefinite" begin="0s" path="M130,166 L183,166 L257,166 C300,166 296,56 318,56"/></circle>
      <circle class="svc-pkt" r="4"><animateMotion dur="2.7s" repeatCount="indefinite" begin="0.9s" path="M130,166 L183,166 L257,166 L318,166"/></circle>
      <circle class="svc-pkt" r="4"><animateMotion dur="2.7s" repeatCount="indefinite" begin="1.8s" path="M130,166 L183,166 L257,166 C300,166 296,276 318,276"/></circle>
      <circle class="svc-pkt svc-x svc-x-pkt" r="4"><animateMotion dur="3s" repeatCount="indefinite" begin="1.4s" path="M130,166 L220,166 L220,203 C220,250 248,256 248,292"/></circle>
      <circle class="svc-core-ring" cx="220" cy="166" r="48"/>
      <circle class="svc-core-ring" cx="220" cy="166" r="48"/>
      <g class="svc-node" style="--nd: 0.1s">
        <rect x="18" y="140" width="112" height="52" rx="9"/>
        <text x="74" y="162" text-anchor="middle">New lead</text>
        <text x="74" y="178" text-anchor="middle" class="svc-sub">form / missed call</text>
      </g>
      <g class="svc-node svc-core" style="--nd: 0.35s">
        <rect x="183" y="129" width="74" height="74" rx="14"/>
        <text x="220" y="173" text-anchor="middle">AI</text>
      </g>
      <g class="svc-node" style="--nd: 0.6s" data-act="0">
        <rect x="318" y="33" width="104" height="46" rx="9"/>
        <text x="370" y="52" text-anchor="middle">Reply sent</text>
        <text x="370" y="68" text-anchor="middle" class="svc-count">&#215;0</text>
      </g>
      <g class="svc-node" style="--nd: 0.72s" data-act="1">
        <rect x="318" y="143" width="104" height="46" rx="9"/>
        <text x="370" y="162" text-anchor="middle">CRM updated</text>
        <text x="370" y="178" text-anchor="middle" class="svc-count">&#215;0</text>
      </g>
      <g class="svc-node" style="--nd: 0.84s" data-act="2">
        <rect x="318" y="253" width="104" height="46" rx="9"/>
        <text x="370" y="272" text-anchor="middle">Owner pinged</text>
        <text x="370" y="288" text-anchor="middle" class="svc-count">&#215;0</text>
      </g>
      <g class="svc-node svc-x svc-x-node" data-act="3">
        <rect x="176" y="292" width="144" height="44" rx="9"/>
        <text x="248" y="310" text-anchor="middle">After-hours? SMS</text>
        <text x="248" y="326" text-anchor="middle" class="svc-count">&#215;0</text>
      </g>
    </svg>
    <div class="svc-caption"><span class="svc-cap-text">Compiling workflow · lead-intake.flow</span></div>`;

  const cap = scene.querySelector('.svc-cap-text');
  scene.dataset.phase = 'build';

  const acts = [
    scene.querySelector('[data-act="0"]'),
    scene.querySelector('[data-act="1"]'),
    scene.querySelector('[data-act="2"]'),
    scene.querySelector('[data-act="3"]'),
  ];
  const counts = [0, 0, 0, 0];
  const land = (idx) => {
    const node = acts[idx];
    if (!node) return;
    counts[idx] += 1;
    node.querySelector('.svc-count').textContent = `×${counts[idx]}`;
    node.classList.add('svc-hit');
    window.setTimeout(() => node.classList.remove('svc-hit'), 380);
  };

  window.setTimeout(() => {
    scene.dataset.phase = 'run';
    cap.textContent = 'Live · lead-intake.flow · 0 errors';
    [0, 1, 2].forEach((idx) => {
      window.setTimeout(() => {
        land(idx);
        window.setInterval(() => land(idx), 2700);
      }, 2700 + idx * 900);
    });
  }, 3000);

  window.setTimeout(() => {
    scene.classList.add('svc-extended');
    cap.textContent = 'Live · new route added itself · 0 errors';
    window.setTimeout(() => {
      land(3);
      window.setInterval(() => land(3), 3000);
    }, 4400);
  }, 12500);
}

function initMonScene(scene) {
  const bars = Array.from({ length: 26 }, () => '<i></i>').join('');
  scene.innerHTML = `
    <div class="svc-browser">
      <div class="svc-bar"><span class="svc-dot"></span><span class="svc-dot"></span><span class="svc-dot"></span><span class="svc-url">yourbusiness.com</span></div>
      <div class="svc-viewport">
        <div class="svc-site-ok">
          <div class="svc-ok-nav"><span class="svc-ok-logo"></span><span class="svc-ok-links"><i></i><i></i><i></i></span><span class="svc-ok-pill">&#9679; Online</span></div>
          <span class="svc-ok-h1"></span>
          <span class="svc-ok-p"></span>
          <span class="svc-ok-btn"></span>
        </div>
        <div class="svc-site-err"><span><span class="svc-err-code">503</span><span class="svc-err-sub">Service unavailable</span></span></div>
        <div class="svc-site-fix"><span><span class="svc-spinner"></span>Auto-restart in progress</span></div>
      </div>
    </div>
    <div class="svc-monitor">
      <div class="svc-mon-row"><span class="svc-mon-status">&#9679; All systems operational</span><span class="svc-mon-lat">142 ms</span></div>
      <div class="svc-chart">${bars}</div>
      <div class="svc-toast">&#9888; Site down &middot; SMS + email sent in 4s</div>
      <div class="svc-banner">&#10003; Recovered in 38s &mdash; before anyone noticed</div>
    </div>
    <div class="svc-caption"><span class="svc-cap-text">Live drill · watch the save</span></div>`;

  const cap = scene.querySelector('.svc-cap-text');
  const statusEl = scene.querySelector('.svc-mon-status');
  const latEl = scene.querySelector('.svc-mon-lat');
  const chartBars = scene.querySelectorAll('.svc-chart i');

  const states = [
    ['up', 5200, '● All systems operational', 'Live · every check green'],
    ['down', 900, '● Outage · 503 detected in 0.8s', 'Crash · caught in under a second'],
    ['alert', 1600, '● Outage · alerting…', 'Alert · SMS + email already out'],
    ['fix', 2500, '● Auto-heal · restarting service', 'Auto-heal · restart triggered'],
    ['recovered', 4400, '● All systems operational', 'Recovered · total downtime 38s'],
  ];
  let i = 0;
  let state = 'up';
  const step = () => {
    const [name, hold, status, label] = states[i];
    state = name;
    scene.dataset.state = name;
    statusEl.textContent = status;
    cap.textContent = label;
    i = (i + 1) % states.length;
    window.setTimeout(step, hold);
  };
  step();

  window.setInterval(() => {
    const healthy = state === 'up' || state === 'recovered';
    chartBars.forEach((bar) => {
      const h = state === 'fix'
        ? 8 + Math.random() * 26
        : healthy
          ? 32 + Math.random() * 58
          : 4 + Math.random() * 7;
      bar.style.height = `${h.toFixed(0)}%`;
    });
    latEl.textContent = healthy
      ? `${Math.round(118 + Math.random() * 64)} ms`
      : state === 'fix' ? 'rebooting…' : '— ms';
  }, 340);
}
