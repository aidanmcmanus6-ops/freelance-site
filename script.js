// ── Logo intro animation ──
(function () {
  const overlay = document.getElementById('introOverlay');
  const introCanvas = document.getElementById('introCanvas');
  if (!overlay || !introCanvas) return;

  const ctx = introCanvas.getContext('2d');
  const rect = introCanvas.parentElement.getBoundingClientRect();
  introCanvas.width = rect.width;
  introCanvas.height = rect.height;

  const w = introCanvas.width;
  const h = introCanvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Create nodes spread around the logo
  const nodes = [];
  const NODE_COUNT = 40;
  for (let i = 0; i < NODE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 180 + 60;
    nodes.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: Math.random() * 2.5 + 1.2,
      pulse: Math.random() * Math.PI * 2,
      glowDelay: Math.random() * 1.5,
      alpha: 0,
    });
  }

  const startTime = performance.now();
  const GLOW_DURATION = 2200; // ms for nodes to fully glow
  const HOLD_DURATION = 1000; // ms to hold after full glow
  const DISSOLVE_DURATION = 600; // ms for dissolve

  let phase = 'glow'; // glow -> hold -> dissolve

  function drawIntro(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, w, h);

    if (phase === 'glow') {
      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const lineAlpha = Math.min(nodes[i].alpha, nodes[j].alpha) * (1 - dist / 140) * 0.5;
            ctx.strokeStyle = `rgba(96, 165, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update nodes
      for (const n of nodes) {
        const nodeElapsed = Math.max(0, elapsed - n.glowDelay * 1000);
        n.alpha = Math.min(1, nodeElapsed / 800);
        n.pulse += 0.04;
        const glow = (Math.sin(n.pulse) + 1) * 0.5;
        const r = n.r + glow * 2;
        const alpha = n.alpha * (0.5 + glow * 0.5);

        // Glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${alpha * 0.15})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.fill();
      }

      if (elapsed > GLOW_DURATION) {
        phase = 'hold';
      }
      requestAnimationFrame(drawIntro);
    } else if (phase === 'hold') {
      // Keep drawing at full brightness briefly
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.5;
            ctx.strokeStyle = `rgba(96, 165, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        n.pulse += 0.04;
        const glow = (Math.sin(n.pulse) + 1) * 0.5;
        const r = n.r + glow * 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${(0.5 + glow * 0.5) * 0.15})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${0.5 + glow * 0.5})`;
        ctx.fill();
      }

      if (elapsed > GLOW_DURATION + HOLD_DURATION) {
        phase = 'dissolve';
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.classList.add('hidden');
        }, DISSOLVE_DURATION + 200);
      } else {
        requestAnimationFrame(drawIntro);
      }
    }
  }

  // Start the animation
  requestAnimationFrame(drawIntro);
})();

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

const form = document.getElementById('contactForm');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Thanks! Your message is ready to send. Replace this with your contact backend or email integration.');
  form.reset();
});

// ── Animated tech canvas background (full page, scrolls with content) ──
(function () {
  const canvas = document.getElementById('techCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, animId;
  const NODE_COUNT = 120;
  const CONNECTION_DIST = 170;

  function resize() {
    w = canvas.width = document.body.scrollWidth;
    h = canvas.height = document.body.scrollHeight;
  }

  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function update() {
    // Move nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.02;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Only draw nodes/connections near the current viewport for performance
    const scrollY = window.scrollY;
    const viewH = window.innerHeight;
    const margin = 200;
    const viewTop = scrollY - margin;
    const viewBottom = scrollY + viewH + margin;

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].y < viewTop || nodes[i].y > viewBottom) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes with glow
    for (const n of nodes) {
      if (n.y < viewTop || n.y > viewBottom) continue;
      const glow = (Math.sin(n.pulse) + 1) * 0.5;
      const alpha = 0.35 + glow * 0.45;
      const r = n.r + glow * 1.2;

      // Outer glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${alpha * 0.08})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
      ctx.fill();
    }
  }

  function animate() {
    update();
    draw();
    animId = requestAnimationFrame(animate);
  }

  // Run animation always (canvas is now full-page fixed background)
  let running = false;

  function init() {
    resize();
    createNodes();
    running = true;
    animate();
  }

  window.addEventListener('resize', () => {
    resize();
    createNodes();
  });

  init();
})();

// ── Solar system planet interaction ──
(function () {
  const planets = document.querySelectorAll('.planet-btn');
  const detail = document.getElementById('planetDetail');
  if (!planets.length || !detail) return;

  const data = [
    { icon: '↑', title: 'Ship faster, spend less', desc: 'No agency overhead, no onboarding delays. A senior engineer who moves immediately — cutting weeks off timelines and a significant fraction off typical agency costs.' },
    { icon: '⬡', title: 'One partner, full ownership', desc: 'From architecture to deployment, one person owns the outcome. No handoffs between teams, no miscommunication — just accountability and clear delivery.' },
    { icon: '⟳', title: 'Built to scale', desc: 'Every website, workflow, and system is built with your growth in mind — clean code, documented decisions, and infrastructure that doesn\'t need to be rebuilt when you scale.' },
    { icon: '◎', title: 'Reduce operational risk', desc: 'Monitoring, alerting, and resilient automation means your team spends less time firefighting and more time building. Issues get caught before they become outages.' },
    { icon: '⚡', title: 'AI that actually works', desc: 'Not AI for the sake of it — practical automation that removes repetitive work, connects your tools, and gives your team leverage.' },
    { icon: '⬤', title: 'Security built in', desc: 'Identity-aware integrations, RBAC controls, and secure workflows from day one — not bolted on after the fact. Your data stays protected as you grow.' },
  ];

  function openPlanet(index) {
    const d = data[index];
    detail.querySelector('.planet-detail-icon').textContent = d.icon;
    detail.querySelector('.planet-detail-title').textContent = d.title;
    detail.querySelector('.planet-detail-desc').textContent = d.desc;
    detail.classList.add('active');
  }

  function closePlanet() {
    detail.classList.remove('active');
  }

  planets.forEach((btn) => {
    btn.addEventListener('click', () => openPlanet(parseInt(btn.dataset.index)));
  });

  detail.querySelector('.planet-detail-close').addEventListener('click', closePlanet);

  // Close on click outside
  detail.addEventListener('click', (e) => {
    if (e.target === detail) closePlanet();
  });
})();

// Scroll reveal — each element observed individually so it only triggers when scrolled into view
const revealTargets = document.querySelectorAll(
  '.section:not(.hero) .section-heading, ' +
  '.service-card, .portfolio-card, .testimonial-card, ' +
  '.solar-system, .about-grid > div, .contact-grid > div'
);

revealTargets.forEach((el) => {
  el.classList.add('reveal-item');
  // Stagger siblings within the same grid container
  const gridParent = el.closest('.service-grid, .portfolio-grid, .testimonial-grid');
  if (gridParent) {
    const index = Array.from(gridParent.children).indexOf(el);
    if (index > 0) {
      el.style.transitionDelay = `${index * 0.12}s`;
      el.dataset.staggerDelay = index * 0.12;
    }
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
        // Clear stagger delay after reveal so hover transitions aren't affected
        const stagger = parseFloat(entry.target.dataset.staggerDelay || 0) * 1000;
        setTimeout(() => {
          entry.target.style.transitionDelay = '';
        }, stagger + 900);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
);

revealTargets.forEach((el) => revealObserver.observe(el));
