import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import introVideoUrl from '../intro-animation-clean.mp4';
import '../hero-tech.css';
import planetRenderSheetUrl from './assets/planet-render-sheet-v2.webp';
import sunRenderUrl from './assets/sun-render.webp';

const calendarUrl = 'https://calendar.app.google/STcrArBdLP484i9f8';

const preferredTimes = Array.from({ length: 49 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 15;
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
});

const navItems = [
  ['Home', '#home'],
  ['Web Design', '/web-design/'],
  ['AI Automation', '/ai-automation/'],
  ['Monitoring', '/monitoring/'],
  ['About', '/about/'],
  ['Blog', '/blog/'],
];

const services = [
  {
    title: 'Modern Websites',
    body: 'Polished websites and applications, built, launched, and supported end to end.',
    bullets: ['Custom landing pages and product sites', 'Responsive UX with modern frameworks', 'Deployment, hosting, and release automation'],
    href: '/web-design/',
  },
  {
    title: 'AI & Automation',
    body: 'Practical AI workflows and integrations using Microsoft Copilot Studio, Azure Foundry, and secure toolchain orchestration.',
    bullets: ['Intelligent automation workflows', 'Azure Functions and tool connectors', 'Secure authorization and access controls'],
    href: '/ai-automation/',
  },
  {
    title: 'Monitoring & Reliability',
    body: 'Observability and alerting that keeps your team ahead of outages and reduces operational noise.',
    bullets: ['Reliable monitoring and synthetic checks', 'Custom dashboards and response workflows', 'Incident automation and deployment practices'],
    href: '/monitoring/',
  },
];

const pricing = [
  {
    label: 'Websites',
    title: 'Site Builds',
    price: 'From $1,000',
    body: 'For polished business websites that need clean design, responsive structure, and a professional launch path.',
    bullets: ['Basic 2-page website: starts at $1,000', '3-4 page website: starts at $1,750', 'Full rewrite or new site from scratch: starts at $3,000'],
  },
  {
    label: 'AI & Automation',
    title: 'Workflow Build',
    price: 'From $2,500',
    body: 'For companies ready to automate repetitive work, connect systems, or build practical AI-powered operations.',
    bullets: ['Discovery and workflow design', 'Copilot Studio, Azure, or API integrations', 'Secure handoff and documentation'],
    featured: true,
  },
  {
    label: 'Reliability',
    title: 'Monitoring Setup',
    price: '$2,000-$7,500',
    body: 'For teams that need dashboards, alerting, and operational visibility before small issues become expensive.',
    bullets: ['Dashboard and alert design', 'Synthetic checks and system visibility', 'Incident response workflow recommendations'],
  },
];

const planetData = [
  { icon: '↑', title: 'Ship faster, spend less', desc: 'No agency overhead, no onboarding delays. Two senior engineers who move immediately, cutting weeks off timelines and a significant fraction off typical agency costs.' },
  { icon: '⬡', title: 'Two senior engineers, full ownership', desc: 'From architecture to deployment, a senior team of two owns the outcome end to end. With two experienced engineers thinking through every problem, you get stronger solutions and faster answers, backed by clear accountability and direct communication.' },
  { icon: '⟳', title: 'Built to scale', desc: "Every website, workflow, and system is built with your growth in mind: clean code, documented decisions, and infrastructure that doesn't need to be rebuilt when you scale." },
  { icon: '◎', title: 'Reduce operational risk', desc: 'Monitoring, alerting, and resilient automation means your team spends less time firefighting and more time building. Issues get caught before they become outages.' },
  { icon: '⚡', title: 'AI that actually works', desc: 'Not AI for the sake of it. Just practical automation that removes repetitive work, connects your tools, and gives your team leverage.' },
  { icon: '⬤', title: 'Security built in', desc: 'Secure integrations, RBAC access controls, and hardened workflows from day one, not bolted on after the fact. Your data stays protected as you grow.' },
];

// Angles use the golden angle (~2.4 rad) for maximum spread — proven to avoid periodic bunching.
// Speeds are set to irrational ratios of each other to prevent orbital resonances.
const planetVisuals = [
  { base: '#7c3aed', light: '#f3e8ff', dark: '#1e1037', glow: 'rgba(168, 85, 247, 0.5)', size: 29, orbit: 0.52, speed: 0.161, angle: 0.50 },
  { base: '#ea580c', light: '#ffedd5', dark: '#431407', glow: 'rgba(251, 146, 60, 0.52)', size: 36, orbit: 0.61, speed: 0.117, angle: 2.90 },
  { base: '#0284c7', light: '#e0f2fe', dark: '#082f49', glow: 'rgba(56, 189, 248, 0.48)', size: 33, orbit: 0.70, speed: 0.088, angle: 5.30 },
  { base: '#0891b2', light: '#cffafe', dark: '#083344', glow: 'rgba(34, 211, 238, 0.44)', size: 39, orbit: 0.80, speed: 0.067, angle: 1.42 },
  { base: '#a16207', light: '#fef3c7', dark: '#422006', glow: 'rgba(215, 163, 95, 0.42)', size: 30, orbit: 0.90, speed: 0.051, angle: 3.82 },
  { base: '#2563eb', light: '#dbeafe', dark: '#172554', glow: 'rgba(96, 165, 250, 0.46)', size: 34, orbit: 1.00, speed: 0.039, angle: 6.22 },
];

const minorOrbitals = [
  { type: 'dwarf', orbit: 0.46, angle: 0.95, speed: 0.06, size: 9.2, color: '#d7c4a7', shade: '#4a3726', glow: 'rgba(255, 213, 148, 0.18)' },
  { type: 'ice', orbit: 0.56, angle: 5.1, speed: 0.045, size: 7.8, color: '#86d9ff', shade: '#12394b', glow: 'rgba(94, 234, 212, 0.16)' },
  { type: 'moon', orbit: 0.68, angle: 2.05, speed: 0.035, size: 6.8, color: '#c9d5df', shade: '#3a3f45', glow: 'rgba(226, 232, 240, 0.13)' },
  { type: 'dwarf', orbit: 0.82, angle: 4.25, speed: 0.028, size: 8.4, color: '#a99174', shade: '#342416', glow: 'rgba(251, 191, 36, 0.13)' },
  { type: 'ice', orbit: 0.94, angle: 3.25, speed: 0.022, size: 6.4, color: '#b7f3ff', shade: '#102a43', glow: 'rgba(125, 211, 252, 0.17)' },
  { type: 'node', orbit: 0.5, angle: 1.86, speed: 0.075, size: 2.6, color: '#7dd3fc', glow: 'rgba(56, 189, 248, 0.62)' },
  { type: 'node', orbit: 0.64, angle: 3.92, speed: 0.052, size: 2.2, color: '#fde68a', glow: 'rgba(251, 191, 36, 0.58)' },
  { type: 'node', orbit: 0.78, angle: 5.34, speed: 0.044, size: 2.8, color: '#c4b5fd', glow: 'rgba(168, 85, 247, 0.62)' },
  { type: 'node', orbit: 0.9, angle: 2.7, speed: 0.031, size: 2.4, color: '#bae6fd', glow: 'rgba(125, 211, 252, 0.56)' },
  { type: 'probe', orbit: 0.74, angle: 0.18, speed: 0.042, size: 3, color: '#f8fafc', glow: 'rgba(56, 189, 248, 0.22)' },
  { type: 'probe', orbit: 0.88, angle: 5.62, speed: 0.032, size: 2.8, color: '#fef3c7', glow: 'rgba(251, 191, 36, 0.2)' },
];

const portfolio = [
  {
    title: 'Booking Website for a Local Wellness Studio',
    body: 'A fast, mobile friendly site with class schedules and online booking, so the studio stopped fielding scheduling calls and started filling more classes.',
    tag: 'Web Design',
    art: 'web',
    accent: '#8b5cf6',
  },
  {
    title: 'Lead and Quote Automation for a Home Services Company',
    body: 'An automation that turns new inquiries into clean quotes and handles the follow up on its own, cutting hours of admin and keeping leads from slipping away.',
    tag: 'AI Automation',
    art: 'flow',
    accent: '#38bdf8',
  },
  {
    title: 'Storefront Uptime Monitoring for an Online Shop',
    body: 'Around the clock monitoring on the storefront and checkout that alerts the team the moment something breaks, so a broken payment page never costs another day of sales.',
    tag: 'Monitoring',
    art: 'pulse',
    accent: '#34d399',
  },
];

const testimonials = [
  ['“Aidan delivered dependable automation and monitoring improvements that reduced risk and improved visibility for our critical systems.”', 'Lead Engineer, Enterprise Operations'],
  ['“Their work on secure Azure integrations and AI workflows helped our organization move faster while keeping data and identity controls intact.”', 'IAM & Security Partner'],
  ['“Clear dashboards and automation reduced our ticket volume significantly and helped our team stay ahead of production issues.”', 'Monitoring Team Manager'],
];

const processSteps = [
  ['01', 'Discover', 'We define the business goal, audience, current systems, constraints, and the smallest useful launch path.'],
  ['02', 'Build', 'We design and implement the site, workflow, or monitoring setup with regular updates and visible progress.'],
  ['03', 'Launch', 'We ship cleanly with responsive polish, deployment support, handoff notes, and practical next steps.'],
  ['04', 'Support', 'After launch, we can stay involved for updates, automation improvements, monitoring, and advisory support.'],
];

const faqs = [
  ['How long does a typical website take?', 'A basic two page site can often be completed in one to two weeks once content is ready. Larger sites, rewrites, integrations, or automation work depend on scope and complexity.'],
  ['Do you work with small businesses?', 'Yes. The pricing and process are designed for small and growing businesses that need senior level execution without hiring a full time developer or agency.'],
  ['Do you work with businesses in my area?', 'Yes. We are based in Burlington County, New Jersey and work with businesses across South Jersey, including Medford, Mount Holly, Cherry Hill, Moorestown, Voorhees, and the wider Burlington, Camden, Ocean, and Mercer County area, plus fully remote clients nationwide. We can meet locally or work entirely online.'],
  ['Can you maintain the site after launch?', 'Yes. Monthly retainers start at $500 and can cover updates, monitoring, content changes, technical support, and ongoing improvements.'],
  ['What do I need before starting?', 'A clear goal, rough budget range, brand assets if you have them, and any existing website or system access. If you are not sure, the discovery call is where we sort that out.'],
  ['Can you help with AI automation even if we are early?', 'Yes. The best first step is usually mapping repetitive work, data flow, permissions, and business risk before deciding what should actually be automated.'],
];

const sectionViewport = { once: true, margin: '0px 0px -90px 0px' };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const cardGrid = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 34, scale: 0.965 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function transition(reducedMotion) {
  return reducedMotion ? { duration: 0 } : { duration: 0.82, ease: [0.16, 1, 0.3, 1] };
}

function SectionHeading({ eyebrow, title, centered = false }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`section-heading${centered ? ' why-heading' : ''}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      transition={transition(reducedMotion)}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
    </motion.div>
  );
}

function IntroOverlay({ onComplete }) {
  const reducedMotion = useReducedMotion();
  // Decide synchronously (before first paint) whether the intro should show, so
  // it never flashes on screen before being skipped. Play it only once per visit;
  // skip on mobile, on deep links, and after it has already shown this session.
  const [visible, setVisible] = useState(() => {
    try {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const deepLinked = window.location.hash.length > 1;
      const alreadySeen = sessionStorage.getItem('mcm-intro-seen') === '1';
      return !(isMobile || deepLinked || alreadySeen);
    } catch (err) {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) {
      onComplete();
      return undefined;
    }
    try {
      sessionStorage.setItem('mcm-intro-seen', '1');
    } catch (err) {
      /* sessionStorage unavailable; intro will simply play on each load */
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, reducedMotion ? 650 : 6000);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.035, filter: 'blur(8px)', transition: { duration: reducedMotion ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] } }}
        >
          <video
            className="intro-video"
            src={introVideoUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="intro-video-vignette" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TechCanvas() {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return undefined;

    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let nodes = [];
    let frameId = 0;

    function resize() {
      w = canvas.width = document.body.scrollWidth;
      h = canvas.height = document.body.scrollHeight;
    }

    function createNodes() {
      nodes = Array.from({ length: 120 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const viewTop = window.scrollY - 200;
      const viewBottom = window.scrollY + window.innerHeight + 200;

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i += 1) {
        if (nodes[i].y < viewTop || nodes[i].y > viewBottom) continue;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            const alpha = (1 - dist / 170) * 0.25;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        if (node.y < viewTop || node.y > viewBottom) return;
        const glow = (Math.sin(node.pulse) + 1) * 0.5;
        const alpha = 0.35 + glow * 0.45;
        const r = node.r + glow * 1.2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.08})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.fill();
      });

      frameId = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      createNodes();
      draw();
    }

    init();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', init);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} id="techCanvas" aria-hidden="true" />;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    function syncHeaderState() {
      setScrolled(window.scrollY > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      }
    }

    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
    window.addEventListener('resize', syncHeaderState, { passive: true });
    return () => {
      window.removeEventListener('scroll', syncHeaderState);
      window.removeEventListener('resize', syncHeaderState);
    };
  }, []);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
          <img src="/mcm-logo-transparent.png" alt="MCM Integrated logo" className="brand-logo" />
          <span className="sr-only">MCM Integrated</span>
        </a>
        <nav className={`nav-links${menuOpen ? ' open' : ''}`} id="primaryNav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a href="#contact" className="button button-secondary" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>
        <button
          className={`nav-toggle${menuOpen ? ' open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="primaryNav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
    </header>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}


const terminalScript = [
  { prompt: true, text: 'mcm deploy --site client-prod' },
  { tone: 'ok', text: '✓ build complete · 1.2s' },
  { tone: 'ok', text: '✓ live on edge network · 24 regions' },
  { prompt: true, text: 'mcm agents status' },
  { tone: 'info', text: '⬡ 3 workflows running · 0 errors' },
  { prompt: true, text: 'mcm monitor --live' },
  { tone: 'info', text: '◎ uptime 99.99% · response 84ms' },
  { tone: 'ok', text: '✓ all systems operational' },
];

function TerminalPanel({ ready }) {
  const reducedMotion = useReducedMotion();
  // [completed line count, chars typed on current line]
  const [progress, setProgress] = useState(() => (reducedMotion ? [terminalScript.length, 0] : [0, 0]));

  useEffect(() => {
    if (!ready || reducedMotion) return undefined;
    let line = 0;
    let char = 0;
    let timer = 0;
    const schedule = (fn, ms) => { timer = window.setTimeout(fn, ms); };
    const tick = () => {
      const current = terminalScript[line];
      if (char < current.text.length) {
        char += 1;
        setProgress([line, char]);
        schedule(tick, current.prompt ? 34 : 13);
        return;
      }
      line += 1;
      char = 0;
      setProgress([line, 0]);
      if (line >= terminalScript.length) {
        // Hold the finished log on screen, then replay.
        schedule(() => {
          line = 0;
          setProgress([0, 0]);
          schedule(tick, 400);
        }, 9000);
        return;
      }
      schedule(tick, current.prompt ? 160 : 420);
    };
    schedule(tick, 600);
    return () => window.clearTimeout(timer);
  }, [ready, reducedMotion]);

  const [lineCount, charCount] = progress;

  return (
    <div className="hud-terminal" role="img" aria-label="Live operations console showing deploys, AI agents, and monitoring all healthy">
      <div className="hud-terminal-bar">
        <span className="hud-dot hud-dot-red" />
        <span className="hud-dot hud-dot-amber" />
        <span className="hud-dot hud-dot-green" />
        <span className="hud-terminal-title">mcm-ops — live</span>
        <span className="hud-terminal-status"><span className="hud-status-pulse" />online</span>
      </div>
      <div className="hud-terminal-body" aria-hidden="true">
        {terminalScript.slice(0, lineCount + 1).map((line, index) => {
          const isTyping = index === lineCount;
          if (isTyping && charCount === 0 && lineCount < terminalScript.length) {
            return <div className="hud-line" key={index}>{line.prompt ? <span className="hud-prompt">$ </span> : null}<span className="hud-cursor" /></div>;
          }
          const text = isTyping ? line.text.slice(0, charCount) : line.text;
          if (index >= terminalScript.length) return null;
          return (
            <div className={`hud-line${line.tone ? ` hud-line-${line.tone}` : ''}`} key={index}>
              {line.prompt ? <span className="hud-prompt">$ </span> : null}
              {text}
              {isTyping ? <span className="hud-cursor" /> : null}
            </div>
          );
        })}
        {lineCount >= terminalScript.length ? <div className="hud-line"><span className="hud-prompt">$ </span><span className="hud-cursor" /></div> : null}
      </div>
    </div>
  );
}

function Hero({ ready }) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Mouse-reactive depth: backdrop drifts opposite the cursor, panel tilts toward it.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 55, damping: 18, mass: 0.6 };
  const backdropX = useSpring(useTransform(mouseX, [-1, 1], [16, -16]), springConfig);
  const backdropY = useSpring(useTransform(mouseY, [-1, 1], [12, -12]), springConfig);
  const cardRotateX = useSpring(useTransform(mouseY, [-1, 1], [3.5, -3.5]), springConfig);
  const cardRotateY = useSpring(useTransform(mouseX, [-1, 1], [-3.5, 3.5]), springConfig);

  const handleMouseMove = (event) => {
    if (reducedMotion || isMobile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <section className="hero section hero-immersive" id="home" onMouseMove={handleMouseMove}>
      {!isMobile && (
        <motion.div className="hero-backdrop" style={reducedMotion ? undefined : { x: backdropX, y: backdropY }} aria-hidden="true">
          <OrbitalScrollScene interactive={false} centerXFrac={0.66} activeIndex={-1} onPlanetClick={() => {}} />
        </motion.div>
      )}
      <div className="hero-backdrop-veil" aria-hidden="true" />
      <div className="container hero-grid">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transition(reducedMotion), delay: reducedMotion ? 0 : 0.02 }}
        >
          <p className="eyebrow">Senior engineering, without the full time hire or agency.</p>
          <h1>Modern websites, AI agents, and observability delivered for your business.</h1>
          <p className="lead">Work directly with two senior engineers — a New Jersey web design and automation studio building polished digital experiences, secure automation, and resilient operations for growing businesses across South Jersey and remote teams nationwide.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Start Your Project</a>
            <a className="button button-outline" href="#portfolio">View Work</a>
          </div>
        </motion.div>
        <motion.div
          className="hero-card"
          style={reducedMotion || isMobile ? undefined : { rotateX: cardRotateX, rotateY: cardRotateY, transformPerspective: 900 }}
          initial={{ opacity: 0, y: 34, scale: 0.965 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 34, scale: 0.965 }}
          transition={{ ...transition(reducedMotion), delay: reducedMotion ? 0 : 0.12 }}
        >
          <TerminalPanel ready={ready} />
        </motion.div>
      </div>
    </section>
  );
}

function CardGrid({ className, children }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={cardGrid}
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      transition={transition(reducedMotion)}
    >
      {children}
    </motion.div>
  );
}

const serviceIcons = ['◈', '⚡', '◎'];

function Services() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section services" id="services">
      <div className="container">
        <SectionHeading title="Websites, AI automation, and monitoring for growing New Jersey businesses" />
        <CardGrid className="services-list">
          {services.map((service, i) => (
            <motion.article className={`service-entry service-entry-${i + 1}`} key={service.title} variants={cardMotion} transition={transition(reducedMotion)}>
              <div className="service-entry-head">
                <span className="service-entry-icon" aria-hidden="true">{serviceIcons[i]}</span>
                <h3>{service.title}</h3>
                <a className="service-link service-entry-link" href={service.href}>Learn more →</a>
              </div>
              <p className="service-entry-body">{service.body}</p>
              <ul className="service-entry-points">
                {service.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </motion.article>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function Pricing() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <SectionHeading title="Estimated starting points for serious business outcomes" />
        <CardGrid className="pricing-grid">
          {pricing.map((item) => (
            <motion.article className={`pricing-card${item.featured ? ' pricing-card-featured' : ''}`} key={item.title} variants={cardMotion} transition={transition(reducedMotion)}>
              <p className="pricing-label">{item.label}</p>
              <h3>{item.title}</h3>
              <p className="price">{item.price}</p>
              <p>{item.body}</p>
              <ul>
                {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </motion.article>
          ))}
        </CardGrid>
        <motion.div className="pricing-note" variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} transition={transition(reducedMotion)}>
          <strong>Pricing note:</strong> These are estimated starting points. Final pricing can vary based on project complexity, content needs, integrations, platform setup, timeline, and support requirements. Monthly retainers typically start at $500 for updates, monitoring, and advisory support.
        </motion.div>
      </div>
    </section>
  );
}

function OrbitalScrollScene({ activeIndex, onPlanetClick, interactive = true, centerXFrac = 0.43, focusRef = null }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const activeIndexRef = useRef(activeIndex);
  const planetPositionsRef = useRef([]);
  const onPlanetClickRef = useRef(onPlanetClick);
  const planetSheetRef = useRef(null);
  const sunImageRef = useRef(null);
  const sunCutoutRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { onPlanetClickRef.current = onPlanetClick; }, [onPlanetClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const ctx = canvas.getContext('2d');
    let animationFrame = 0;
    let time = 0;
    let isIntersecting = true;
    const isActive = () => isIntersecting && !document.hidden;
    // Scroll-driven camera (eased every frame toward the focused planet)
    const cam = { x: 0, y: 0, z: 1 };

    const planetSheet = new Image();
    planetSheet.src = planetRenderSheetUrl;
    planetSheetRef.current = planetSheet;

    const sunImage = new Image();
    sunImage.src = sunRenderUrl;
    sunImageRef.current = sunImage;

    const pseudoRandom = (seed) => {
      const value = Math.sin(seed * 127.1) * 43758.5453;
      return value - Math.floor(value);
    };

    const buildGlowCutout = (image, options = {}) => {
      if (!image.naturalWidth || !image.naturalHeight) return null;
      const { threshold = 7, gain = 7.8, preserveFloor = 0 } = options;

      const cutout = document.createElement('canvas');
      cutout.width = image.naturalWidth;
      cutout.height = image.naturalHeight;
      const cutoutCtx = cutout.getContext('2d', { willReadFrequently: true });
      cutoutCtx.drawImage(image, 0, 0);

      const imageData = cutoutCtx.getImageData(0, 0, cutout.width, cutout.height);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        const luminance = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
        data[i + 3] = Math.max(preserveFloor, Math.min(255, (luminance - threshold) * gain));
      }

      cutoutCtx.putImageData(imageData, 0, 0);
      return cutout;
    };

    const buildSunCutout = () => {
      sunCutoutRef.current = buildGlowCutout(sunImage, { threshold: 7, gain: 7.8, preserveFloor: 0 });
    };

    sunImage.onload = buildSunCutout;
    if (sunImage.complete) buildSunCutout();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
    };

    const drawSpace = (width, height) => {
      const space = ctx.createLinearGradient(0, 0, width, height);
      space.addColorStop(0, '#020611');
      space.addColorStop(0.42, '#071322');
      space.addColorStop(1, '#02030a');
      ctx.fillStyle = space;
      ctx.fillRect(0, 0, width, height);

      const nd = time * 0.0000065;
      const nebulae = [
        [0.18 + Math.sin(nd) * 0.016,            0.30 + Math.cos(nd * 0.7) * 0.012,  0.48, 'rgba(56, 189, 248, 0.22)'],
        [0.78 + Math.sin(nd * 0.8 + 1.2) * 0.014, 0.28,                               0.50, 'rgba(168, 85, 247, 0.20)'],
        [0.50,                                    0.62 + Math.sin(nd * 0.6 + 2.4) * 0.01, 0.56, 'rgba(255, 159, 64, 0.13)'],
        [0.34 + Math.cos(nd * 1.1 + 3.6) * 0.016, 0.44,                               0.38, 'rgba(52, 211, 153, 0.08)'],
      ];

      nebulae.forEach(([x, y, scale, color]) => {
        const radius = Math.max(width, height) * scale;
        const gradient = ctx.createRadialGradient(width * x, height * y, 0, width * x, height * y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.42, color.replace(/0\.\d+\)/, '0.055)'));
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      for (let i = 0; i < 170; i += 1) {
        const x = pseudoRandom(i * 17.17) * width;
        const y = pseudoRandom(i * 31.31) * height;
        const size = 0.45 + pseudoRandom(i * 43.43) * 1.45;
        const baseAlpha = 0.16 + pseudoRandom(i * 59.59) * 0.62;
        const twinkleRate = pseudoRandom(i * 71.71) * 0.0016 + 0.0003;
        const twinkleAmt = pseudoRandom(i * 83.83) * 0.24;
        const twinkle = i % 4 === 0 ? Math.sin(time * twinkleRate + pseudoRandom(i * 97.97) * 6.28) * twinkleAmt : 0;
        const alpha = Math.max(0.05, baseAlpha + twinkle);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Brighter foreground stars with cross-glints for depth
      for (let i = 0; i < 38; i += 1) {
        const sx = pseudoRandom(i * 211.17) * width;
        const sy = pseudoRandom(i * 317.31) * height;
        const ss = 0.9 + pseudoRandom(i * 143.43) * 1.85;
        const sBase = 0.38 + pseudoRandom(i * 259.59) * 0.44;
        const sTwinkle = Math.sin(time * (pseudoRandom(i * 271.71) * 0.0018 + 0.0004) + pseudoRandom(i * 383.83) * 6.28) * 0.22;
        const sa = Math.max(0.12, sBase + sTwinkle);
        ctx.fillStyle = `rgba(255, 255, 255, ${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fill();
        if (pseudoRandom(i * 511.11) > 0.72) {
          ctx.save();
          ctx.strokeStyle = `rgba(210, 230, 255, ${sa * 0.45})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx - ss * 2.8, sy); ctx.lineTo(sx + ss * 2.8, sy);
          ctx.moveTo(sx, sy - ss * 2.8); ctx.lineTo(sx, sy + ss * 2.8);
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const drawPlanet = (planet) => {
      const { x, y, radius, base, light, dark, glow, index, depth } = planet;
      const distanceFromSun = Math.max(1, Math.hypot(x, y));
      const lightX = -x / distanceFromSun;
      const lightY = -y / distanceFromSun;

      ctx.save();
      const planetAura = ctx.createRadialGradient(x, y, radius * 0.35, x, y, radius * 1.9);
      planetAura.addColorStop(0, glow.replace(/0\.\d+\)/, depth > 0.5 ? '0.22)' : '0.12)'));
      planetAura.addColorStop(0.48, glow.replace(/0\.\d+\)/, depth > 0.5 ? '0.1)' : '0.055)'));
      planetAura.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = planetAura;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (index === 3) drawSaturnRings(x, y, radius, 'back', depth);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();

      const planetSource = planetSheetRef.current;
      if (planetSource && planetSource.width) {
        const cellWidth = planetSource.width / 3;
        const cellHeight = planetSource.height / 2;
        const sourceSize = Math.min(cellWidth, cellHeight) * 0.86;
        const column = index % 3;
        const row = Math.floor(index / 3);
        const sourceX = column * cellWidth + (cellWidth - sourceSize) / 2;
        const sourceY = row * cellHeight + (cellHeight - sourceSize) / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.drawImage(planetSource, sourceX, sourceY, sourceSize, sourceSize, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();

        // Seamless surface band animation — horizontal strips scroll at varied speeds,
        // giving impression of atmospheric rotation without any tiling seam
        const bSpeed = 0.000022 + index * 0.000005;
        const bandDefs = [
          { yOff: -0.28, h: 0.13, alpha: 0.07, dir: 1.0 },
          { yOff: 0.02,  h: 0.10, alpha: 0.05, dir: -0.6 },
          { yOff: 0.3,   h: 0.15, alpha: 0.06, dir: 1.3 },
        ];
        bandDefs.forEach((bd) => {
          const bs = ((time * bSpeed * bd.dir) % (radius * 2) + radius * 2) % (radius * 2);
          const by = y + bd.yOff * radius;
          const bh = bd.h * radius;
          const bg = ctx.createLinearGradient(0, by - bh, 0, by + bh);
          bg.addColorStop(0, 'rgba(255,255,255,0)');
          bg.addColorStop(0.5, `rgba(255,255,255,${bd.alpha})`);
          bg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = bg;
          ctx.fillRect(x - radius + bs, by - bh, radius * 2, bh * 2);
          ctx.fillRect(x - radius + bs - radius * 2, by - bh, radius * 2, bh * 2);
        });
      } else {
        const gradient = ctx.createRadialGradient(x - radius * 0.32, y - radius * 0.34, 2, x, y, radius);
        gradient.addColorStop(0, light);
        gradient.addColorStop(0.24, base);
        gradient.addColorStop(0.72, base);
        gradient.addColorStop(1, dark);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const shade = ctx.createLinearGradient(
        x + lightX * radius,
        y + lightY * radius,
        x - lightX * radius,
        y - lightY * radius,
      );
      shade.addColorStop(0, 'rgba(255, 255, 255, 0.11)');
      shade.addColorStop(0.2, 'rgba(255, 255, 255, 0.02)');
      shade.addColorStop(0.42, 'rgba(0, 0, 0, 0)');
      shade.addColorStop(0.65, 'rgba(0, 0, 0, 0.32)');
      shade.addColorStop(1, 'rgba(0, 0, 0, 0.68)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      const limb = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
      limb.addColorStop(0, 'rgba(0, 0, 0, 0)');
      limb.addColorStop(0.68, 'rgba(0, 0, 0, 0)');
      limb.addColorStop(0.86, 'rgba(0, 0, 0, 0.12)');
      limb.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
      ctx.fillStyle = limb;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      const specular = ctx.createRadialGradient(
        x + lightX * radius * 0.44,
        y + lightY * radius * 0.44,
        0,
        x + lightX * radius * 0.44,
        y + lightY * radius * 0.44,
        radius * 0.28,
      );
      specular.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
      specular.addColorStop(0.3, 'rgba(255, 255, 255, 0.18)');
      specular.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specular;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric rim — planet's own color scatters on the lit limb edge
      const rimGrad = ctx.createRadialGradient(
        x + lightX * radius * 0.7, y + lightY * radius * 0.7, radius * 0.35,
        x, y, radius * 1.01,
      );
      rimGrad.addColorStop(0, 'rgba(255,255,255,0)');
      rimGrad.addColorStop(0.74, glow.replace(/0\.\d+\)/, '0)'));
      rimGrad.addColorStop(0.9, glow.replace(/0\.\d+\)/, '0.32)'));
      rimGrad.addColorStop(1, glow.replace(/0\.\d+\)/, '0)'));
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = Math.max(0.7, radius * 0.025);
      ctx.beginPath();
      ctx.arc(x, y, radius - ctx.lineWidth, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (index === 3) drawSaturnRings(x, y, radius, 'front', depth);
      drawAurora(planet);
    };

    const drawRock = (x, y, radius, color, alpha, seed) => {
      const points = 7;
      const angleOffset = pseudoRandom(seed + 2.1) * Math.PI * 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angleOffset);
      const rockGradient = ctx.createRadialGradient(-radius * 0.28, -radius * 0.35, 0, 0, 0, radius * 1.15);
      rockGradient.addColorStop(0, `rgba(255, 244, 214, ${alpha * 0.72})`);
      rockGradient.addColorStop(0.45, color);
      rockGradient.addColorStop(1, `rgba(21, 17, 14, ${alpha})`);
      ctx.fillStyle = rockGradient;
      ctx.beginPath();
      for (let point = 0; point < points; point += 1) {
        const pointAngle = (point / points) * Math.PI * 2;
        const pointRadius = radius * (0.68 + pseudoRandom(seed + point * 4.7) * 0.58);
        const px = Math.cos(pointAngle) * pointRadius;
        const py = Math.sin(pointAngle) * pointRadius * (0.62 + pseudoRandom(seed + point * 7.3) * 0.42);
        if (point === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawMiniPlanet = (x, y, radius, body, alpha, depth) => {
      ctx.save();
      const glow = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 3.2);
      glow.addColorStop(0, body.glow);
      glow.addColorStop(0.46, body.glow.replace(/0\.\d+\)/, '0.055)'));
      glow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();

      const sphere = ctx.createRadialGradient(x - radius * 0.38, y - radius * 0.42, 0, x, y, radius);
      sphere.addColorStop(0, `rgba(255, 255, 245, ${alpha * 0.62})`);
      sphere.addColorStop(0.24, body.color);
      sphere.addColorStop(0.66, body.color);
      sphere.addColorStop(1, body.shade || 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (body.type === 'ice') {
        ctx.strokeStyle = `rgba(226, 252, 255, ${alpha * 0.2})`;
        ctx.lineWidth = Math.max(0.7, radius * 0.12);
        for (let band = -1; band <= 1; band += 1) {
          ctx.beginPath();
          ctx.ellipse(x, y + band * radius * 0.22, radius * 0.92, radius * 0.16, -0.22, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (body.type === 'moon' || body.type === 'dwarf') {
        ctx.fillStyle = `rgba(2, 6, 23, ${alpha * 0.22})`;
        for (let crater = 0; crater < 4; crater += 1) {
          const craterAngle = pseudoRandom(body.angle * 100 + crater * 9.1) * Math.PI * 2;
          const craterDistance = radius * (0.16 + pseudoRandom(body.angle * 75 + crater * 6.4) * 0.46);
          const craterX = x + Math.cos(craterAngle) * craterDistance;
          const craterY = y + Math.sin(craterAngle) * craterDistance;
          ctx.beginPath();
          ctx.arc(craterX, craterY, radius * (0.08 + pseudoRandom(body.angle * 42 + crater) * 0.08), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const limb = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      limb.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.12})`);
      limb.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      limb.addColorStop(1, `rgba(0, 0, 0, ${0.36 + (1 - depth) * 0.18})`);
      ctx.fillStyle = limb;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawOrbitalNode = (x, y, radius, body, alpha) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowColor = body.glow;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = body.glow;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.4, 0, Math.PI * 2);
      ctx.stroke();
      const nodeGlow = ctx.createRadialGradient(x, y, 0, x, y, radius * 7);
      nodeGlow.addColorStop(0, body.glow);
      nodeGlow.addColorStop(0.28, body.glow.replace(/0\.\d+\)/, '0.18)'));
      nodeGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = nodeGlow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(x, y, radius * (0.88 + alpha * 0.36), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawMinorOrbital = (body, phase) => {
      const angle = phase * body.speed + body.angle;
      const depth = (Math.sin(angle) + 1) / 2;
      const orbitRadius = body.orbitRadius;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius * body.tilt;
      const radius = body.size * (0.72 + depth * 0.38);
      const alpha = 0.38 + depth * 0.42;

      ctx.save();
      if (body.type === 'node') {
        drawOrbitalNode(x, y, radius, body, alpha);
      } else if (body.type === 'probe') {
        ctx.shadowColor = body.glow;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `rgba(226, 232, 240, ${alpha * 0.85})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - radius * 1.8, y);
        ctx.lineTo(x + radius * 1.8, y);
        ctx.moveTo(x, y - radius * 1.2);
        ctx.lineTo(x, y + radius * 1.2);
        ctx.stroke();
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.3, radius * 0.56), 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawMiniPlanet(x, y, radius, body, alpha, depth);
      }
      ctx.restore();
    };

    const drawAsteroidBelt = (maxOrbit, tilt, phase, layer, sunRadius = 0) => {
      for (let i = 0; i < 42; i += 1) {
        const seed = i * 13.37;
        const baseAngle = pseudoRandom(seed) * Math.PI * 2;
        const speed = 0.012 + pseudoRandom(seed + 3.7) * 0.02;
        const angle = baseAngle + phase * speed;
        const depth = (Math.sin(angle) + 1) / 2;
        if ((layer === 'back' && depth >= 0.5) || (layer === 'front' && depth < 0.5)) continue;

        const orbitRadius = maxOrbit * (0.66 + pseudoRandom(seed + 8.1) * 0.24);
        const drift = (pseudoRandom(seed + 10.4) - 0.5) * maxOrbit * 0.04;
        const x = Math.cos(angle) * (orbitRadius + drift);
        const y = Math.sin(angle) * (orbitRadius + drift) * tilt + (pseudoRandom(seed + 6.2) - 0.5) * 10;
        if (sunRadius && Math.hypot(x, y) < sunRadius * 1.32) continue;
        const isHeroRock = pseudoRandom(seed + 15.2) > 0.82;
        const radius = (isHeroRock ? 4.6 + pseudoRandom(seed + 12.8) * 5.8 : 1.4 + pseudoRandom(seed + 12.8) * 3.2) * (0.62 + depth * 0.5);
        const alpha = (isHeroRock ? 0.34 : 0.2) + depth * (isHeroRock ? 0.38 : 0.28);

        drawRock(x, y, radius, `rgba(154, 136, 108, ${alpha})`, alpha, seed);
      }
    };

    const drawAmbientSystemObjects = (maxOrbit, tilt, phase, layer, sunRadius = 0) => {
      drawAsteroidBelt(maxOrbit, tilt, phase, layer, sunRadius);
      minorOrbitals.forEach((body) => {
        const angle = phase * body.speed + body.angle;
        const depth = (Math.sin(angle) + 1) / 2;
        if ((layer === 'back' && depth >= 0.5) || (layer === 'front' && depth < 0.5)) return;
        const orbitRadius = maxOrbit * body.orbit;
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius * tilt;
        if (sunRadius && Math.hypot(x, y) < sunRadius * 1.34) return;
        drawMinorOrbital({ ...body, orbitRadius, tilt }, phase);
      });
    };

    const drawSun = (maxOrbit) => {
      const breathe = 1 + Math.sin(time * 0.00072) * 0.022 + Math.sin(time * 0.00131) * 0.009;
      const sunRadius = Math.min(138, maxOrbit * 0.34) * breathe;
      const coronaPulse = 1 + Math.sin(time * 0.00088) * 0.06;
      const corona = ctx.createRadialGradient(0, 0, sunRadius * 0.25, 0, 0, sunRadius * 2.45);
      corona.addColorStop(0, `rgba(255, 240, 169, ${0.72 * coronaPulse})`);
      corona.addColorStop(0.23, `rgba(249, 115, 22, ${0.35 * coronaPulse})`);
      corona.addColorStop(0.55, `rgba(249, 115, 22, ${0.11 * coronaPulse})`);
      corona.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius * 2.45, 0, Math.PI * 2);
      ctx.fill();

      const sunSource = sunCutoutRef.current || sunImageRef.current;
      if (sunSource && sunSource.width) {
        const sourceSize = Math.min(sunSource.width, sunSource.height) * 0.92;
        const sourceX = (sunSource.width - sourceSize) / 2;
        const sourceY = (sunSource.height - sourceSize) / 2;
        const renderRadius = sunRadius * 1.36;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = 'rgba(255, 164, 46, 0.78)';
        ctx.shadowBlur = 58;
        ctx.drawImage(
          sunSource,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          -renderRadius,
          -renderRadius,
          renderRadius * 2,
          renderRadius * 2,
        );
        ctx.restore();
      } else {
        const sunGradient = ctx.createRadialGradient(-34, -38, 8, 0, 0, sunRadius * 1.32);
        sunGradient.addColorStop(0, '#fff7b0');
        sunGradient.addColorStop(0.18, '#ffd166');
        sunGradient.addColorStop(0.55, '#f97316');
        sunGradient.addColorStop(1, '#7c2d12');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      const innerHeat = ctx.createRadialGradient(-sunRadius * 0.24, -sunRadius * 0.28, 0, 0, 0, sunRadius * 1.02);
      innerHeat.addColorStop(0, 'rgba(255, 255, 210, 0.42)');
      innerHeat.addColorStop(0.35, 'rgba(255, 190, 74, 0.16)');
      innerHeat.addColorStop(1, 'rgba(255, 83, 17, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = innerHeat;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius * 1.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      return sunRadius;
    };

    const drawSaturnRings = (x, y, radius, half, depth) => {
      const depthFactor = 0.55 + depth * 0.45;
      const rv = 0.27; // ring vertical squish (perspective flatten)
      const bands = [
        { r: 1.32, lw: 0.10, a: 0.26 },
        { r: 1.50, lw: 0.18, a: 0.52 },
        { r: 1.68, lw: 0.15, a: 0.46 },
        { r: 1.80, lw: 0.04, a: 0.12 }, // Cassini division gap
        { r: 1.91, lw: 0.22, a: 0.44 },
        { r: 2.14, lw: 0.14, a: 0.30 },
        { r: 2.33, lw: 0.09, a: 0.16 },
      ];
      const shadow = half === 'back' ? 0.68 : 1.0;
      const [sa, ea] = half === 'back' ? [Math.PI, Math.PI * 2] : [0, Math.PI];
      ctx.save();
      bands.forEach((b) => {
        const rx = radius * b.r;
        const ry = rx * rv;
        ctx.strokeStyle = `rgba(228, 196, 130, ${b.a * depthFactor * shadow})`;
        ctx.lineWidth = radius * b.lw;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, sa, ea);
        ctx.stroke();
      });
      ctx.restore();
    };

    const drawAurora = (planet) => {
      if (![0, 5].includes(planet.index)) return;
      const { x, y, radius, glow, depth } = planet;
      const pulse = 0.68 + Math.sin(time * 0.0014 + planet.index * 1.8) * 0.32;
      const alpha = (0.22 + depth * 0.18) * pulse;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      [[y - radius * 0.84, 0.50], [y + radius * 0.84, 0.38]].forEach(([py, pr]) => {
        const ag = ctx.createRadialGradient(x, py, 0, x, py, radius * pr);
        ag.addColorStop(0, glow.replace(/0\.\d+\)/, `${alpha * 0.8})`));
        ag.addColorStop(0.5, glow.replace(/0\.\d+\)/, `${alpha * 0.28})`));
        ag.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(x, py, radius * pr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const drawMoons = (planets) => {
      planets.forEach((planet) => {
        if (planet.index !== 1 && planet.index !== 4) return;
        const moonCount = planet.index === 1 ? 1 : 2;
        const distSun = Math.max(1, Math.hypot(planet.x, planet.y));
        const lightX = -planet.x / distSun;
        const lightY = -planet.y / distSun;

        for (let mi = 0; mi < moonCount; mi += 1) {
          const moonOrbit = planet.radius * (2.4 + mi * 1.2);
          const moonAngle = time * (0.00017 - mi * 0.00004) + mi * 2.618;
          const mx = planet.x + Math.cos(moonAngle) * moonOrbit;
          const my = planet.y + Math.sin(moonAngle) * moonOrbit * 0.44;
          const moonR = Math.max(3.5, planet.radius * (0.19 + mi * 0.06));
          const moonDepth = (Math.sin(moonAngle) + 1) / 2;
          const alpha = 0.58 + moonDepth * 0.32;

          ctx.save();

          // Ambient halo
          const halo = ctx.createRadialGradient(mx, my, moonR * 0.5, mx, my, moonR * 2.6);
          halo.addColorStop(0, `rgba(185, 192, 215, ${alpha * 0.14})`);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(mx, my, moonR * 2.6, 0, Math.PI * 2);
          ctx.fill();

          // Clip to moon disc
          ctx.beginPath();
          ctx.arc(mx, my, moonR, 0, Math.PI * 2);
          ctx.clip();

          // Rocky surface
          const surf = ctx.createRadialGradient(mx - moonR * 0.28, my - moonR * 0.32, 0, mx, my, moonR);
          surf.addColorStop(0, `rgba(224, 220, 214, ${alpha})`);
          surf.addColorStop(0.38, `rgba(168, 164, 157, ${alpha})`);
          surf.addColorStop(1, `rgba(82, 79, 74, ${alpha})`);
          ctx.fillStyle = surf;
          ctx.beginPath();
          ctx.arc(mx, my, moonR, 0, Math.PI * 2);
          ctx.fill();

          // Craters
          const baseSeed = (planet.index * 10 + mi) * 47.3;
          for (let c = 0; c < 5; c += 1) {
            const seed = baseSeed + c * 13.7;
            const ca = pseudoRandom(seed) * Math.PI * 2;
            const cd = moonR * (0.08 + pseudoRandom(seed + 3.1) * 0.54);
            const cr = moonR * (0.07 + pseudoRandom(seed + 7.4) * 0.15);
            const crx = mx + Math.cos(ca) * cd;
            const cry = my + Math.sin(ca) * cd;
            const cg = ctx.createRadialGradient(crx, cry, 0, crx, cry, cr);
            cg.addColorStop(0, `rgba(52, 49, 45, ${alpha * 0.62})`);
            cg.addColorStop(0.6, `rgba(72, 69, 65, ${alpha * 0.28})`);
            cg.addColorStop(1, 'rgba(118, 115, 110, 0)');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(crx, cry, cr, 0, Math.PI * 2);
            ctx.fill();
          }

          // Directional shading (sun-side lit, opposite dark)
          const shade = ctx.createLinearGradient(
            mx + lightX * moonR, my + lightY * moonR,
            mx - lightX * moonR, my - lightY * moonR,
          );
          shade.addColorStop(0, 'rgba(255, 252, 240, 0.1)');
          shade.addColorStop(0.28, 'rgba(0,0,0,0)');
          shade.addColorStop(0.54, 'rgba(0,0,0,0.14)');
          shade.addColorStop(1, `rgba(0,0,0,${0.58 + (1 - moonDepth) * 0.14})`);
          ctx.fillStyle = shade;
          ctx.beginPath();
          ctx.arc(mx, my, moonR, 0, Math.PI * 2);
          ctx.fill();

          // Limb darkening
          const limb = ctx.createRadialGradient(mx, my, moonR * 0.64, mx, my, moonR);
          limb.addColorStop(0, 'rgba(0,0,0,0)');
          limb.addColorStop(1, `rgba(0,0,0,${alpha * 0.3})`);
          ctx.fillStyle = limb;
          ctx.beginPath();
          ctx.arc(mx, my, moonR, 0, Math.PI * 2);
          ctx.fill();

          // Specular highlight
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const spec = ctx.createRadialGradient(
            mx + lightX * moonR * 0.44, my + lightY * moonR * 0.44, 0,
            mx + lightX * moonR * 0.44, my + lightY * moonR * 0.44, moonR * 0.28,
          );
          spec.addColorStop(0, `rgba(255,255,255,${alpha * 0.38})`);
          spec.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = spec;
          ctx.beginPath();
          ctx.arc(mx, my, moonR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.restore();
        }
      });
    };

    const drawSpaceStation = (maxOrbit, tilt, phase) => {
      const orbitR = maxOrbit * 1.15;
      const angle = phase * 0.016 + 1.2;
      const sx = Math.cos(angle) * orbitR;
      const sy = Math.sin(angle) * orbitR * tilt;
      const stDepth = (Math.sin(angle) + 1) / 2;
      if (stDepth < 0.06) return;
      const al = 0.28 + stDepth * 0.48;
      const sz = 3.5 + stDepth * 4.5;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.65)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(140, 230, 255, ${al})`;
      ctx.lineWidth = 1.4;
      // Hull
      ctx.beginPath();
      ctx.roundRect(sx - sz * 0.65, sy - sz * 0.32, sz * 1.3, sz * 0.64, sz * 0.12);
      ctx.stroke();
      // Central spine
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sz * 0.32); ctx.lineTo(sx, sy + sz * 0.32);
      ctx.moveTo(sx - sz * 0.65, sy); ctx.lineTo(sx + sz * 0.65, sy);
      ctx.stroke();
      // Solar panel arms
      ctx.strokeStyle = `rgba(100, 200, 255, ${al * 0.8})`;
      ctx.lineWidth = sz * 0.38;
      ctx.beginPath();
      ctx.moveTo(sx - sz * 2.1, sy); ctx.lineTo(sx - sz * 0.72, sy);
      ctx.moveTo(sx + sz * 0.72, sy); ctx.lineTo(sx + sz * 2.1, sy);
      ctx.stroke();
      // Panel borders
      ctx.strokeStyle = `rgba(60, 170, 255, ${al * 0.55})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.rect(sx - sz * 2.1, sy - sz * 0.22, sz * 1.4, sz * 0.44);
      ctx.rect(sx + sz * 0.72, sy - sz * 0.22, sz * 1.4, sz * 0.44);
      ctx.stroke();
      // Blinking nav light
      if (Math.sin(time * 0.0068) > 0.2) {
        ctx.fillStyle = `rgba(255, 80, 80, ${al * 0.9})`;
        ctx.beginPath();
        ctx.arc(sx, sy - sz * 0.32, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawComets = (width, height) => {
      const cometDefs = [
        { period: 24000, offset: 0,     visible: 0.38, sx: -0.08, sy: 0.18, ex: 0.75, ey: 0.56 },
        { period: 36000, offset: 11000, visible: 0.32, sx: 1.06,  sy: 0.07, ex: 0.12, ey: 0.52 },
        { period: 48000, offset: 21000, visible: 0.36, sx: 0.04,  sy: -0.05, ex: 0.82, ey: 0.62 },
      ];
      cometDefs.forEach((comet) => {
        const t = ((time + comet.offset) % comet.period) / comet.period;
        if (t > comet.visible) return;
        const progress = t / comet.visible;
        const brightness = Math.min(progress * 7, 1) * Math.min((1 - progress) * 7, 1);
        if (brightness < 0.02) return;

        const cx = (comet.sx + (comet.ex - comet.sx) * progress) * width;
        const cy = (comet.sy + (comet.ey - comet.sy) * progress) * height;
        const angle = Math.atan2((comet.ey - comet.sy) * height, (comet.ex - comet.sx) * width);
        const tailLen = width * (0.07 + brightness * 0.055);
        const tailX = cx - Math.cos(angle) * tailLen;
        const tailY = cy - Math.sin(angle) * tailLen;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const tailGrad = ctx.createLinearGradient(cx, cy, tailX, tailY);
        tailGrad.addColorStop(0,    `rgba(220, 242, 255, ${brightness * 0.92})`);
        tailGrad.addColorStop(0.1,  `rgba(180, 218, 255, ${brightness * 0.65})`);
        tailGrad.addColorStop(0.35, `rgba(140, 188, 255, ${brightness * 0.26})`);
        tailGrad.addColorStop(1,    'rgba(100, 160, 255, 0)');
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = Math.max(0.8, brightness * 2.4);
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(180, 220, 255, 0.7)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        const headR = Math.max(2, brightness * 9);
        const headGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, headR);
        headGlow.addColorStop(0,    `rgba(255, 255, 255, ${brightness})`);
        headGlow.addColorStop(0.28, `rgba(210, 235, 255, ${brightness * 0.65})`);
        headGlow.addColorStop(1,    'rgba(120, 170, 255, 0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, headR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawSunFlares = (sunRadius) => {
      const pulse = 0.78 + Math.sin(time * 0.00038) * 0.22;
      const flares = [
        { angle: 0.26,                   len: 2.2,  w: 1.5, alpha: 0.18 },
        { angle: 0.26 + Math.PI * 0.5,   len: 1.85, w: 1.1, alpha: 0.14 },
        { angle: 0.26 + Math.PI,         len: 2.2,  w: 1.5, alpha: 0.18 },
        { angle: 0.26 + Math.PI * 1.5,   len: 1.85, w: 1.1, alpha: 0.14 },
        { angle: 0.26 + Math.PI * 0.25,  len: 1.42, w: 0.7, alpha: 0.09 },
        { angle: 0.26 + Math.PI * 0.75,  len: 1.42, w: 0.7, alpha: 0.09 },
        { angle: 0.26 + Math.PI * 1.25,  len: 1.42, w: 0.7, alpha: 0.09 },
        { angle: 0.26 + Math.PI * 1.75,  len: 1.42, w: 0.7, alpha: 0.09 },
      ];
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      flares.forEach((f) => {
        const len = sunRadius * f.len * pulse;
        const ex = Math.cos(f.angle) * len;
        const ey = Math.sin(f.angle) * len;
        const grad = ctx.createLinearGradient(0, 0, ex, ey);
        grad.addColorStop(0,    'rgba(255, 235, 160, 0)');
        grad.addColorStop(0.14, `rgba(255, 235, 160, ${f.alpha * pulse})`);
        grad.addColorStop(0.44, `rgba(255, 218, 120, ${f.alpha * 0.32 * pulse})`);
        grad.addColorStop(1,    'rgba(255, 200, 100, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = f.w;
        ctx.shadowColor = 'rgba(255, 205, 80, 0.38)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      });
      ctx.restore();
    };

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width * centerXFrac;
      const centerY = height * 0.5;
      const maxOrbit = Math.min(width * 0.45, height * 0.62);
      const tilt = 0.48;
      const phase = time * 0.00052;

      ctx.clearRect(0, 0, width, height);
      drawSpace(width, height);
      drawComets(width, height);

      const planets = planetVisuals.map((planet, index) => {
        const orbitRadius = maxOrbit * planet.orbit;
        const angle = phase * planet.speed + planet.angle;
        const depth = (Math.sin(angle) + 1) / 2;
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius * tilt;
        return { ...planet, index, x, y, depth, radius: planet.size * (0.78 + depth * 0.42) };
      }).sort((a, b) => a.y - b.y);

      // Fly-through camera: track the focused planet, or glide between two
      // planets while traveling (zoom dips slightly mid-flight)
      const focus = focusRef ? focusRef.current : null;
      let targetX = 0;
      let targetY = 0;
      let targetZ = 1;
      if (focus && focus.index >= 0 && focus.strength > 0) {
        const fromPlanet = planets.find((p) => p.index === focus.index);
        const toPlanet = focus.nextIndex >= 0 ? planets.find((p) => p.index === focus.nextIndex) : null;
        if (fromPlanet) {
          const s = Math.min(1, Math.max(0, focus.strength));
          const blend = toPlanet ? Math.min(1, Math.max(0, focus.blend || 0)) : 0;
          const px = toPlanet ? fromPlanet.x + (toPlanet.x - fromPlanet.x) * blend : fromPlanet.x;
          const py = toPlanet ? fromPlanet.y + (toPlanet.y - fromPlanet.y) * blend : fromPlanet.y;
          const dip = Math.sin(Math.PI * blend) * 0.55;
          targetZ = 1 + s * (1.55 - dip);
          targetX = px * s;
          targetY = py * s;
        }
      }
      cam.x += (targetX - cam.x) * 0.1;
      cam.y += (targetY - cam.y) * 0.1;
      cam.z += (targetZ - cam.z) * 0.1;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.02);
      ctx.scale(cam.z, cam.z);
      ctx.translate(-cam.x, -cam.y);
      planetVisuals.forEach((planet, index) => {
        const orbitRadius = maxOrbit * planet.orbit;

        // Back half — solid, dim (far side, receding from viewer)
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 215, 134, 0.18)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius, orbitRadius * tilt, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Front half — always fully glowing, brightest at the sides where foreshortening is strongest
        const frontGrad = ctx.createLinearGradient(-orbitRadius, 0, orbitRadius, 0);
        frontGrad.addColorStop(0, 'rgba(255, 215, 134, 0.1)');
        frontGrad.addColorStop(0.2, 'rgba(255, 235, 160, 0.9)');
        frontGrad.addColorStop(0.5, 'rgba(255, 241, 190, 0.46)');
        frontGrad.addColorStop(0.8, 'rgba(255, 235, 160, 0.9)');
        frontGrad.addColorStop(1, 'rgba(255, 215, 134, 0.1)');
        ctx.save();
        ctx.strokeStyle = frontGrad;
        ctx.lineWidth = 2.8;
        ctx.shadowColor = 'rgba(255, 197, 94, 0.65)';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius, orbitRadius * tilt, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      });

      drawAmbientSystemObjects(maxOrbit, tilt, phase, 'back');
      planets.filter((planet) => planet.y < 0).forEach(drawPlanet);
      const sunRadius = drawSun(maxOrbit);
      drawSunFlares(sunRadius);
      drawAmbientSystemObjects(maxOrbit, tilt, phase, 'front', sunRadius);
      planets.filter((planet) => planet.y >= 0).forEach((planet) => {
        const distanceFromSun = Math.hypot(planet.x, planet.y);
        if (distanceFromSun < sunRadius * 1.32 && planet.depth < 0.72) return;
        drawPlanet(planet);
      });
      planetPositionsRef.current = planets.map((p) => ({ x: p.x, y: p.y, radius: p.radius, index: p.index }));
      drawMoons(planets);
      drawSpaceStation(maxOrbit, tilt, phase);
      ctx.restore();

      // Focus vignette: gently darken the edges while zoomed so the
      // visited planet pops without the rest of the system vanishing
      const focusAmt = Math.min(1, Math.max(0, (cam.z - 1) / 1.55));
      if (focusAmt > 0.03) {
        const spot = ctx.createRadialGradient(
          centerX, centerY, Math.min(width, height) * 0.16,
          centerX, centerY, Math.max(width, height) * 0.78,
        );
        spot.addColorStop(0, 'rgba(2, 6, 23, 0)');
        spot.addColorStop(0.55, `rgba(2, 6, 23, ${0.18 * focusAmt})`);
        spot.addColorStop(1, `rgba(2, 6, 23, ${0.6 * focusAmt})`);
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);
      }

      time += reducedMotion ? 0 : 8;
      // Pause the loop when the scene scrolls off-screen or the tab is hidden.
      animationFrame = isActive() ? window.requestAnimationFrame(draw) : 0;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - rect.left) - rect.width * centerXFrac;
      const dy = (e.clientY - rect.top) - rect.height * 0.5;
      const cos = Math.cos(0.02);
      const sin = Math.sin(0.02);
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      for (const planet of planetPositionsRef.current) {
        if (Math.hypot(rx - planet.x, ry - planet.y) <= planet.radius * 1.5) {
          onPlanetClickRef.current(planet.index);
          return;
        }
      }
      onPlanetClickRef.current(null);
    };

    if (interactive) {
      canvas.style.cursor = 'pointer';
      canvas.addEventListener('click', handleClick);
    }
    resize();
    window.addEventListener('resize', resize);
    animationFrame = window.requestAnimationFrame(draw);

    // Resume the loop when it becomes visible / the tab is shown again.
    const resumeLoop = () => {
      if (isActive() && !animationFrame) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };
    const visibilityObserver = new IntersectionObserver((entries) => {
      isIntersecting = entries[0].isIntersecting;
      resumeLoop();
    }, { rootMargin: '150px' });
    visibilityObserver.observe(wrap);
    document.addEventListener('visibilitychange', resumeLoop);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      if (interactive) canvas.removeEventListener('click', handleClick);
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', resumeLoop);
    };
  }, [reducedMotion, interactive, centerXFrac]);

  return (
    <div className="orbital-canvas-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="orbital-canvas-overlay" aria-hidden="true" />
    </div>
  );
}

function WhyItMatters() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const stageRef = useRef(null);
  const pinRef = useRef(null);
  const focusRef = useRef({ index: -1, nextIndex: -1, blend: 0, strength: 0 });
  const [activeCard, setActiveCard] = useState(-1);
  const [hintSeen, setHintSeen] = useState(false);
  const flyMode = !isMobile && !reducedMotion;

  useEffect(() => {
    if (!flyMode) return undefined;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const stage = stageRef.current;
        if (!stage) return;
        const viewHeight = window.innerHeight;
        const rect = stage.getBoundingClientRect();
        const total = Math.max(1, rect.height - viewHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / total));
        const count = planetData.length;
        const seg = Math.min(count - 0.0001, progress * count);
        const index = Math.floor(seg);
        const local = seg - index;
        const ease = (v) => v * v * (3 - 2 * v);
        // Glide directly between planets (no full zoom-out): the camera
        // leaves a planet during the last 22% of its segment and arrives
        // at the next planet right at the boundary.
        const traveling = index < count - 1 && local > 0.78;
        const blend = traveling ? ease((local - 0.78) / 0.22) : 0;
        // Zoom envelope: fly in once at the start, pull back once at the end.
        let strength = 1;
        if (index === 0 && local < 0.45) strength = ease(local / 0.45);
        else if (index === count - 1 && local > 0.85) strength = ease((1 - local) / 0.15);
        focusRef.current = { index, nextIndex: traveling ? index + 1 : -1, blend, strength };
        // Pin via position:fixed (sticky is unreliable here: ancestor overflow
        // rules on html/body can silently disable it).
        const pin = pinRef.current;
        if (pin) {
          const top = -rect.top;
          const mode = top < 0 ? 'before' : top >= total ? 'after' : 'during';
          if (pin.dataset.pin !== mode) {
            pin.dataset.pin = mode;
            if (mode === 'during') {
              pin.style.position = 'fixed';
              pin.style.top = '0px';
              pin.style.bottom = 'auto';
            } else if (mode === 'after') {
              pin.style.position = 'absolute';
              pin.style.top = 'auto';
              pin.style.bottom = '0px';
            } else {
              pin.style.position = 'absolute';
              pin.style.top = '0px';
              pin.style.bottom = 'auto';
            }
          }
        }
        const visible = progress > 0.005 && strength > 0.75 && blend < 0.25 ? index : -1;
        setActiveCard((prev) => (prev === visible ? prev : visible));
        if (visible !== -1) setHintSeen(true);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [flyMode]);

  if (!flyMode) {
    return (
      <section className="section why" id="why">
        <div className="container">
          <SectionHeading title="The difference it makes for your business" centered />
          <div className="planet-card-grid">
            {planetData.map((planet, index) => (
              <motion.article
                className={`planet-card planet-card-${index + 1}`}
                key={planet.title}
                variants={cardMotion}
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                transition={{ ...transition(reducedMotion), delay: reducedMotion ? 0 : index * 0.04 }}
              >
                <div className="planet-card-header">
                  <span className="planet-card-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="planet-card-icon">{planet.icon}</span>
                </div>
                <h3>{planet.title}</h3>
                <p>{planet.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section why why-fly" id="why">
      <div className="why-scroll-stage" ref={stageRef} style={{ height: `${planetData.length * 120}vh` }}>
        <div className="why-sticky" ref={pinRef}>
          <div className="container">
            <SectionHeading title="The difference it makes for your business" centered />
          </div>
          <div className="orbital-showcase why-showcase-full" aria-label="Scroll to fly between six business impact planets">
            <OrbitalScrollScene activeIndex={-1} onPlanetClick={() => {}} interactive={false} focusRef={focusRef} />
            <AnimatePresence>
              {!hintSeen && (
                <motion.div
                  className="planet-click-hint"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
                >
                  <span className="planet-click-hint-icon">⌄</span>
                  Keep scrolling to fly through the system
                </motion.div>
              )}
            </AnimatePresence>
            <div className="why-card-anchor">
              <AnimatePresence>
                {activeCard !== -1 && (
                  <motion.div
                    className="planet-detail-card"
                    key={activeCard}
                    initial={{ opacity: 0, scale: 0.9, x: 26 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.92, x: 26 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="planet-detail-header">
                      <span className="planet-detail-number">{String(activeCard + 1).padStart(2, '0')}</span>
                      <span className="planet-detail-icon">{planetData[activeCard].icon}</span>
                    </div>
                    <h3>{planetData[activeCard].title}</h3>
                    <p>{planetData[activeCard].desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function ProjectArt({ type }) {
  if (type === 'web') {
    return (
      <svg viewBox="0 0 320 190" aria-hidden="true">
        <rect x="22" y="20" width="276" height="150" rx="14" fill="#0b1226" stroke="rgba(139,92,246,0.4)" />
        <rect x="22" y="20" width="276" height="30" rx="14" fill="rgba(139,92,246,0.14)" />
        <rect x="22" y="40" width="276" height="10" fill="rgba(139,92,246,0.14)" />
        <circle cx="42" cy="35" r="4" fill="#8b5cf6" />
        <circle cx="58" cy="35" r="4" fill="#38bdf8" />
        <circle cx="74" cy="35" r="4" fill="#475569" />
        <rect x="42" y="70" width="120" height="14" rx="5" fill="#f8fafc" opacity="0.88" />
        <rect x="42" y="96" width="210" height="8" rx="4" fill="#94a3b8" opacity="0.45" />
        <rect x="42" y="112" width="180" height="8" rx="4" fill="#94a3b8" opacity="0.35" />
        <rect x="42" y="138" width="92" height="22" rx="9" fill="#8b5cf6" />
      </svg>
    );
  }
  if (type === 'flow') {
    return (
      <svg viewBox="0 0 320 190" aria-hidden="true">
        <g stroke="rgba(56,189,248,0.45)" strokeWidth="2">
          <line x1="160" y1="95" x2="68" y2="48" />
          <line x1="160" y1="95" x2="68" y2="142" />
          <line x1="160" y1="95" x2="252" y2="48" />
          <line x1="160" y1="95" x2="252" y2="142" />
        </g>
        <circle cx="68" cy="48" r="15" fill="#0b1226" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="68" cy="142" r="15" fill="#0b1226" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="252" cy="48" r="15" fill="#0b1226" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="252" cy="142" r="15" fill="#0b1226" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="160" cy="95" r="24" fill="#0b1226" stroke="#38bdf8" strokeWidth="2.5" />
        <circle cx="160" cy="95" r="9" fill="#38bdf8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 190" aria-hidden="true">
      <g stroke="rgba(148,163,184,0.16)" strokeWidth="1">
        <line x1="28" y1="60" x2="292" y2="60" />
        <line x1="28" y1="100" x2="292" y2="100" />
        <line x1="28" y1="140" x2="292" y2="140" />
      </g>
      <polyline points="28,140 68,116 108,128 148,86 188,100 228,58 268,74 292,52" fill="none" stroke="#34d399" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="228" cy="58" r="5" fill="#34d399" />
      <circle cx="292" cy="52" r="5" fill="#34d399" />
      <g>
        <rect x="28" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="58" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="88" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="118" y="158" width="24" height="10" rx="3" fill="#f59e0b" />
        <rect x="148" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="178" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="208" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="238" y="158" width="24" height="10" rx="3" fill="#34d399" />
        <rect x="268" y="158" width="24" height="10" rx="3" fill="#34d399" />
      </g>
    </svg>
  );
}

function Portfolio() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section portfolio" id="portfolio">
      <div className="container">
        <SectionHeading title="Selected examples of work we have delivered" />
        <CardGrid className="portfolio-showcase">
          {portfolio.map((project) => (
            <motion.article
              className="project-row"
              key={project.title}
              style={{ '--art': project.accent }}
              variants={cardMotion}
              transition={transition(reducedMotion)}
            >
              <div className="project-info">
                <span className="project-tag">{project.tag}</span>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
              </div>
              <div className="project-art">
                <ProjectArt type={project.art} />
              </div>
            </motion.article>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function Testimonials() {
  const reducedMotion = useReducedMotion();
  const [featured, ...rest] = testimonials;
  const featuredQuote = featured[0].replace(/^[“"]\s*|\s*[”"]$/g, '');

  return (
    <section className="section testimonials" id="testimonials">
      <div className="container">
        <SectionHeading title="Trusted by teams that need proactive, reliable execution" />
        <CardGrid className="testimonial-feature">
          <motion.figure className="testimonial-primary" variants={cardMotion} transition={transition(reducedMotion)}>
            <span className="testimonial-mark" aria-hidden="true">&ldquo;</span>
            <blockquote>{featuredQuote}</blockquote>
            <figcaption>{featured[1]}</figcaption>
          </motion.figure>
          <motion.div className="testimonial-secondary" variants={cardMotion} transition={transition(reducedMotion)}>
            {rest.map(([quote, author]) => (
              <figure className="testimonial-mini" key={author}>
                <blockquote>{quote}</blockquote>
                <figcaption>{author}</figcaption>
              </figure>
            ))}
          </motion.div>
        </CardGrid>
      </div>
    </section>
  );
}

function Process() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section process" id="process">
      <div className="container">
        <SectionHeading title="A straightforward path from idea to launch" />
        <CardGrid className="process-timeline">
          {processSteps.map(([number, title, body]) => (
            <motion.div className="process-step" key={title} variants={cardMotion} transition={transition(reducedMotion)}>
              <span className="process-node">{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </motion.div>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function FAQ() {
  const reducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section faq" id="faq">
      <div className="container faq-grid">
        <div>
          <SectionHeading title="Answers before we talk" />
          <p className="faq-intro">A few practical details clients usually want to know before booking a call or sending a request.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <motion.article className="faq-item" key={question} variants={cardMotion} initial="hidden" whileInView="visible" viewport={sectionViewport} transition={{ ...transition(reducedMotion), delay: reducedMotion ? 0 : index * 0.06 }}>
                <button className="faq-question" type="button" aria-expanded={isOpen} onClick={() => setOpenIndex(isOpen ? -1 : index)}>
                  <span>{question}</span>
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p>{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section final-cta" aria-label="Start a project">
      <motion.div className="container final-cta-inner" variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} transition={transition(reducedMotion)}>
        <div>
          <h2>Build something polished, useful, and reliable.</h2>
          <p>Start with a project request or book a discovery call if you want to talk through the best next move first.</p>
        </div>
        <div className="final-cta-actions">
          <a className="button button-primary" href="#contact">Start Your Project</a>
          <a className="button button-outline" href={calendarUrl} target="_blank" rel="noopener noreferrer">Book a Call</a>
        </div>
      </motion.div>
    </section>
  );
}

function About() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="section about" id="about">
      <div className="container about-grid">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} transition={transition(reducedMotion)}>
          <SectionHeading title="Enterprise systems experience, delivered directly." />
          <p>We help growing companies access senior level engineering without the overhead of a full time hire or agency. A senior team of two, focused execution, real results.</p>
          <p>MCM Integrated is a New Jersey web design and automation studio serving Burlington and Camden County and the wider South Jersey and Jersey Shore area, from Medford, Mount Holly, and Lumberton to Cherry Hill, Moorestown, Voorhees, Trenton, Ocean City, and Long Beach Island. Most of the businesses we work with are local; some are fully remote.</p>
          <ul className="experience-list-simple">
            <li>Cloud automation and tool integration for mission critical environments</li>
            <li>Observability, dashboarding, and alerting that reduce risk</li>
            <li>Secure workflows and authorization patterns that protect data and identity</li>
          </ul>
          <p className="about-cta"><a className="service-link" href="/about/">More about MCM Integrated →</a></p>
        </motion.div>
      </div>
    </section>
  );
}

function Contact() {
  const reducedMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('https://formsubmit.co/ajax/6882a8350f42f5141130704b2cfafc2b', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(event.target),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && (result.success === 'true' || result.success === true)) {
        // We own the post-submit experience: send the visitor to the
        // confirmation page (which also fires the GA4 conversion event).
        window.location.href = '/thank-you/';
        return;
      }
      throw new Error(result.message || 'Submission failed');
    } catch (err) {
      setError('Something went wrong sending your request. Please email aidan@mcm-integrated.com directly.');
      setSubmitting(false);
    }
  }

  return (
    <section className="section contact" id="contact">
      <div className="container contact-grid">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} transition={transition(reducedMotion)}>
          <div className="section-heading">
            <h2>Let's talk about your next project.</h2>
          </div>
          <p>Whether you need a website, AI automation, or improved monitoring, let's figure out the right solution together.</p>
          <ul className="contact-details">
            <li><strong>Email:</strong> <a href="mailto:aidan@mcm-integrated.com">aidan@mcm-integrated.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+16093040371">609-304-0371</a></li>
            <li><strong>Service area:</strong> Burlington, Camden, Ocean &amp; Mercer County, NJ, including Medford, Medford Lakes, Mount Holly, Lumberton, Southampton, Cherry Hill, Voorhees, Haddon Township, Berlin, Moorestown, Trenton, Ocean City, and Long Beach Island, plus the greater Philadelphia area. Remote engagements welcome.</li>
          </ul>
          <div className="contact-actions">
            <a className="button button-outline" href={calendarUrl} target="_blank" rel="noopener noreferrer">Book a Call</a>
          </div>
        </motion.div>
        <motion.div className="contact-card" variants={cardMotion} initial="hidden" whileInView="visible" viewport={sectionViewport} transition={transition(reducedMotion)}>
          <form id="contactForm" action="https://formsubmit.co/6882a8350f42f5141130704b2cfafc2b" method="POST" onSubmit={handleSubmit}>
            <input type="hidden" name="_subject" value="New MCM Integrated project request" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="text" name="_honey" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
            <input type="hidden" name="_next" value="https://www.mcm-integrated.com/thank-you/" />
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Your name" autoComplete="name" maxLength="120" required />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" maxLength="254" required />

            <label htmlFor="projectType">Project Type</label>
            <select id="projectType" name="project_type" required defaultValue="">
              <option value="">Select a project type</option>
              <option value="Modern website">Modern website</option>
              <option value="AI automation">AI automation</option>
              <option value="Monitoring and reliability">Monitoring and reliability</option>
              <option value="Secure integration">Secure integration</option>
              <option value="Ongoing support">Ongoing support</option>
              <option value="Not sure yet">Not sure yet</option>
            </select>

            <label htmlFor="budget">Budget</label>
            <select id="budget" name="budget" required defaultValue="">
              <option value="">Select a budget range</option>
              <option value="Under $1,500">Under $1,500</option>
              <option value="$1,500-$4,500">$1,500-$4,500</option>
              <option value="$4,500-$8,000">$4,500-$8,000</option>
              <option value="$8,000-$15,000">$8,000-$15,000</option>
              <option value="$15,000+">$15,000+</option>
              <option value="Monthly retainer">Monthly retainer</option>
            </select>

            <div className="form-row">
              <div>
                <label htmlFor="callDate">Preferred Call Date</label>
                <input type="date" id="callDate" name="preferred_call_date" />
              </div>
              <div>
                <label htmlFor="callTime">Preferred Time</label>
                <select id="callTime" name="preferred_call_time" defaultValue="">
                  <option value="">Select a preferred time</option>
                  {preferredTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" placeholder="Tell me about your project" maxLength="4000" required />

            <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send Request'}</button>
            {error && <p className="form-note" role="alert" style={{ color: '#fca5a5' }}>{error}</p>}
            <p className="form-note">Requests are sent directly to aidan@mcm-integrated.com. Prefer to talk first? <a href={calendarUrl} target="_blank" rel="noopener noreferrer">Book a call</a>.</p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

const tiltSelector = '.service-entry, .pricing-card, .pricing-note, .planet-card, .testimonial-primary, .testimonial-mini, .faq-item, .contact-card, .project-row';
const magnetSelector = '.button-primary, .button-outline, .button-secondary';

// Unified pointer physics, one delegated listener for the whole page:
// card surfaces tilt in 3D toward the cursor (glare position is handed to
// CSS via --gx/--gy), and CTA buttons are gently magnetic. Mouse-only;
// disabled for touch and reduced-motion users.
function CardPhysics() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return undefined;

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

    const onMove = (event) => {
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
    };

    const onLeave = () => {
      if (card) {
        releaseCard(card);
        card = null;
      }
      if (magnet) {
        magnet.style.transform = '';
        magnet = null;
      }
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      onLeave();
    };
  }, []);

  return null;
}

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  // SPA deep-link support: when arriving with a #hash (e.g. from a service
  // page's "Start Your Project" link), the browser's native scroll fires
  // before React renders the section, so do it manually once mounted.
  useEffect(() => {
    const { hash } = window.location;
    if (hash.length <= 1) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      el.scrollIntoView({ block: 'start' });
      root.style.scrollBehavior = previousBehavior;
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <IntroOverlay onComplete={() => setIntroComplete(true)} />
      <CardPhysics />
      <TechCanvas />
      <Header />
      <main>
        <Hero ready={introComplete} />
        <Services />
        <Pricing />
        <Process />
        <WhyItMatters />
        <Portfolio />
        <Testimonials />
        <About />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© 2026 MCM Integrated</p>
          <p className="footer-areas">Web design, AI automation &amp; monitoring serving Burlington, Camden, Ocean &amp; Mercer County, New Jersey, including Medford, Mount Holly, Lumberton, Cherry Hill, Moorestown, Voorhees, Berlin, Haddon Township, Trenton, Ocean City, Long Beach Island, and the greater Philadelphia area.</p>
          <nav aria-label="Footer">
            <a href="/about/">About</a> ·
            <a href="/privacy/">Privacy</a>
          </nav>
        </div>
      </footer>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
