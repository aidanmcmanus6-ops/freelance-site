// Vanilla port of the homepage OrbitalScrollScene renderer, for use on the
// static /concept/ page. Same drawing routines and image assets as App.jsx,
// including the scroll-driven fly camera (drive it via the returned setFocus).
import planetRenderSheetUrl from './assets/planet-render-sheet-v2.webp';
import sunRenderUrl from './assets/sun-render.webp';

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

export function initSolarScene(canvas, opts) {
  if (!canvas) return { setFocus: function () {} };
  opts = opts || {};
  const centerXFrac = opts.centerXFrac != null ? opts.centerXFrac : 0.5;
  const scale = opts.scale != null ? opts.scale : 1;
  const interactive = opts.interactive !== false;
  const onSelect = opts.onSelect || function () {};
  const dprCap = opts.dprCap != null ? opts.dprCap : Infinity;
  const cam = { x: 0, y: 0, z: 1 };
  let focus = { index: -1, nextIndex: -1, blend: 0, strength: 0 };
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let time = 0;
  let animationFrame = 0;
  let isIntersecting = true;
  const isActive = () => isIntersecting && !document.hidden;

  const planetSheet = new Image();
  planetSheet.src = planetRenderSheetUrl;
  const sunImage = new Image();
  sunImage.src = sunRenderUrl;
  let sunCutout = null;

  const pseudoRandom = (seed) => {
    const value = Math.sin(seed * 127.1) * 43758.5453;
    return value - Math.floor(value);
  };

  const buildGlowCutout = (image, options) => {
    options = options || {};
    if (!image.naturalWidth || !image.naturalHeight) return null;
    const threshold = options.threshold != null ? options.threshold : 7;
    const gain = options.gain != null ? options.gain : 7.8;
    const preserveFloor = options.preserveFloor != null ? options.preserveFloor : 0;
    const cutout = document.createElement('canvas');
    cutout.width = image.naturalWidth;
    cutout.height = image.naturalHeight;
    const cutoutCtx = cutout.getContext('2d', { willReadFrequently: true });
    cutoutCtx.drawImage(image, 0, 0);
    const imageData = cutoutCtx.getImageData(0, 0, cutout.width, cutout.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      data[i + 3] = Math.max(preserveFloor, Math.min(255, (luminance - threshold) * gain));
    }
    cutoutCtx.putImageData(imageData, 0, 0);
    return cutout;
  };
  const buildSunCutout = () => { sunCutout = buildGlowCutout(sunImage, { threshold: 7, gain: 7.8, preserveFloor: 0 }); };
  sunImage.onload = buildSunCutout;
  if (sunImage.complete) buildSunCutout();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
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
      [0.18 + Math.sin(nd) * 0.016, 0.30 + Math.cos(nd * 0.7) * 0.012, 0.48, 'rgba(56, 189, 248, 0.22)'],
      [0.78 + Math.sin(nd * 0.8 + 1.2) * 0.014, 0.28, 0.50, 'rgba(168, 85, 247, 0.20)'],
      [0.50, 0.62 + Math.sin(nd * 0.6 + 2.4) * 0.01, 0.56, 'rgba(255, 159, 64, 0.13)'],
      [0.34 + Math.cos(nd * 1.1 + 3.6) * 0.016, 0.44, 0.38, 'rgba(52, 211, 153, 0.08)'],
    ];
    nebulae.forEach((nb) => {
      const x = nb[0], y = nb[1], scl = nb[2], color = nb[3];
      const radius = Math.max(width, height) * scl;
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
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 38; i += 1) {
      const sx = pseudoRandom(i * 211.17) * width;
      const sy = pseudoRandom(i * 317.31) * height;
      const ss = 0.9 + pseudoRandom(i * 143.43) * 1.85;
      const sBase = 0.38 + pseudoRandom(i * 259.59) * 0.44;
      const sTwinkle = Math.sin(time * (pseudoRandom(i * 271.71) * 0.0018 + 0.0004) + pseudoRandom(i * 383.83) * 6.28) * 0.22;
      const sa = Math.max(0.12, sBase + sTwinkle);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + sa + ')';
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fill();
      if (pseudoRandom(i * 511.11) > 0.72) {
        ctx.save();
        ctx.strokeStyle = 'rgba(210, 230, 255, ' + (sa * 0.45) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(sx - ss * 2.8, sy); ctx.lineTo(sx + ss * 2.8, sy);
        ctx.moveTo(sx, sy - ss * 2.8); ctx.lineTo(sx, sy + ss * 2.8);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const drawSaturnRings = (x, y, radius, half, depth) => {
    const depthFactor = 0.55 + depth * 0.45;
    const rv = 0.27;
    const bands = [
      { r: 1.32, lw: 0.10, a: 0.26 }, { r: 1.50, lw: 0.18, a: 0.52 }, { r: 1.68, lw: 0.15, a: 0.46 },
      { r: 1.80, lw: 0.04, a: 0.12 }, { r: 1.91, lw: 0.22, a: 0.44 }, { r: 2.14, lw: 0.14, a: 0.30 }, { r: 2.33, lw: 0.09, a: 0.16 },
    ];
    const shadow = half === 'back' ? 0.68 : 1.0;
    const sa = half === 'back' ? Math.PI : 0;
    const ea = half === 'back' ? Math.PI * 2 : Math.PI;
    ctx.save();
    bands.forEach((b) => {
      const rx = radius * b.r;
      const ry = rx * rv;
      ctx.strokeStyle = 'rgba(228, 196, 130, ' + (b.a * depthFactor * shadow) + ')';
      ctx.lineWidth = radius * b.lw;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, sa, ea);
      ctx.stroke();
    });
    ctx.restore();
  };

  const drawAurora = (planet) => {
    if (planet.index !== 0 && planet.index !== 5) return;
    const x = planet.x, y = planet.y, radius = planet.radius, glow = planet.glow, depth = planet.depth;
    const pulse = 0.68 + Math.sin(time * 0.0014 + planet.index * 1.8) * 0.32;
    const alpha = (0.22 + depth * 0.18) * pulse;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    [[y - radius * 0.84, 0.50], [y + radius * 0.84, 0.38]].forEach((pp) => {
      const py = pp[0], pr = pp[1];
      const ag = ctx.createRadialGradient(x, py, 0, x, py, radius * pr);
      ag.addColorStop(0, glow.replace(/0\.\d+\)/, (alpha * 0.8) + ')'));
      ag.addColorStop(0.5, glow.replace(/0\.\d+\)/, (alpha * 0.28) + ')'));
      ag.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(x, py, radius * pr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const drawPlanet = (planet) => {
    const x = planet.x, y = planet.y, radius = planet.radius, base = planet.base, light = planet.light, dark = planet.dark, glow = planet.glow, index = planet.index, depth = planet.depth;
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
    const planetSource = planetSheet;
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
      const bSpeed = 0.000022 + index * 0.000005;
      const bandDefs = [
        { yOff: -0.28, h: 0.13, alpha: 0.07, dir: 1.0 },
        { yOff: 0.02, h: 0.10, alpha: 0.05, dir: -0.6 },
        { yOff: 0.3, h: 0.15, alpha: 0.06, dir: 1.3 },
      ];
      bandDefs.forEach((bd) => {
        const bs = ((time * bSpeed * bd.dir) % (radius * 2) + radius * 2) % (radius * 2);
        const by = y + bd.yOff * radius;
        const bh = bd.h * radius;
        const bg = ctx.createLinearGradient(0, by - bh, 0, by + bh);
        bg.addColorStop(0, 'rgba(255,255,255,0)');
        bg.addColorStop(0.5, 'rgba(255,255,255,' + bd.alpha + ')');
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
    const shade = ctx.createLinearGradient(x + lightX * radius, y + lightY * radius, x - lightX * radius, y - lightY * radius);
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
    const specular = ctx.createRadialGradient(x + lightX * radius * 0.44, y + lightY * radius * 0.44, 0, x + lightX * radius * 0.44, y + lightY * radius * 0.44, radius * 0.28);
    specular.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
    specular.addColorStop(0.3, 'rgba(255, 255, 255, 0.18)');
    specular.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specular;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    const rimGrad = ctx.createRadialGradient(x + lightX * radius * 0.7, y + lightY * radius * 0.7, radius * 0.35, x, y, radius * 1.01);
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
    rockGradient.addColorStop(0, 'rgba(255, 244, 214, ' + (alpha * 0.72) + ')');
    rockGradient.addColorStop(0.45, color);
    rockGradient.addColorStop(1, 'rgba(21, 17, 14, ' + alpha + ')');
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
    sphere.addColorStop(0, 'rgba(255, 255, 245, ' + (alpha * 0.62) + ')');
    sphere.addColorStop(0.24, body.color);
    sphere.addColorStop(0.66, body.color);
    sphere.addColorStop(1, body.shade || 'rgba(2, 6, 23, 0.95)');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (body.type === 'ice') {
      ctx.strokeStyle = 'rgba(226, 252, 255, ' + (alpha * 0.2) + ')';
      ctx.lineWidth = Math.max(0.7, radius * 0.12);
      for (let band = -1; band <= 1; band += 1) {
        ctx.beginPath();
        ctx.ellipse(x, y + band * radius * 0.22, radius * 0.92, radius * 0.16, -0.22, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (body.type === 'moon' || body.type === 'dwarf') {
      ctx.fillStyle = 'rgba(2, 6, 23, ' + (alpha * 0.22) + ')';
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
    limb.addColorStop(0, 'rgba(255, 255, 255, ' + (alpha * 0.12) + ')');
    limb.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    limb.addColorStop(1, 'rgba(0, 0, 0, ' + (0.36 + (1 - depth) * 0.18) + ')');
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

  const drawMinorOrbital = (body) => {
    const phase = time * 0.00052;
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
      ctx.strokeStyle = 'rgba(226, 232, 240, ' + (alpha * 0.85) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - radius * 1.8, y); ctx.lineTo(x + radius * 1.8, y);
      ctx.moveTo(x, y - radius * 1.2); ctx.lineTo(x, y + radius * 1.2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, ' + (alpha * 0.75) + ')';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.3, radius * 0.56), 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawMiniPlanet(x, y, radius, body, alpha, depth);
    }
    ctx.restore();
  };

  const drawAsteroidBelt = (maxOrbit, tilt, phase, layer, sunRadius) => {
    sunRadius = sunRadius || 0;
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
      drawRock(x, y, radius, 'rgba(154, 136, 108, ' + alpha + ')', alpha, seed);
    }
  };

  const drawAmbientSystemObjects = (maxOrbit, tilt, phase, layer, sunRadius) => {
    sunRadius = sunRadius || 0;
    drawAsteroidBelt(maxOrbit, tilt, phase, layer, sunRadius);
    minorOrbitals.forEach((body) => {
      const angle = phase * body.speed + body.angle;
      const depth = (Math.sin(angle) + 1) / 2;
      if ((layer === 'back' && depth >= 0.5) || (layer === 'front' && depth < 0.5)) return;
      const orbitRadius = maxOrbit * body.orbit;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius * tilt;
      if (sunRadius && Math.hypot(x, y) < sunRadius * 1.34) return;
      drawMinorOrbital(Object.assign({}, body, { orbitRadius: orbitRadius, tilt: tilt }));
    });
  };

  const drawSun = (maxOrbit) => {
    const breathe = 1 + Math.sin(time * 0.00072) * 0.022 + Math.sin(time * 0.00131) * 0.009;
    const sunRadius = Math.min(138, maxOrbit * 0.34) * breathe;
    const coronaPulse = 1 + Math.sin(time * 0.00088) * 0.06;
    const corona = ctx.createRadialGradient(0, 0, sunRadius * 0.25, 0, 0, sunRadius * 2.45);
    corona.addColorStop(0, 'rgba(255, 240, 169, ' + (0.72 * coronaPulse) + ')');
    corona.addColorStop(0.23, 'rgba(249, 115, 22, ' + (0.35 * coronaPulse) + ')');
    corona.addColorStop(0.55, 'rgba(249, 115, 22, ' + (0.11 * coronaPulse) + ')');
    corona.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius * 2.45, 0, Math.PI * 2);
    ctx.fill();
    const sunSource = sunCutout || sunImage;
    if (sunSource && sunSource.width) {
      const sourceSize = Math.min(sunSource.width, sunSource.height) * 0.92;
      const sourceX = (sunSource.width - sourceSize) / 2;
      const sourceY = (sunSource.height - sourceSize) / 2;
      const renderRadius = sunRadius * 1.36;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowColor = 'rgba(255, 164, 46, 0.78)';
      ctx.shadowBlur = 58;
      ctx.drawImage(sunSource, sourceX, sourceY, sourceSize, sourceSize, -renderRadius, -renderRadius, renderRadius * 2, renderRadius * 2);
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

  const drawSunFlares = (sunRadius) => {
    const pulse = 0.78 + Math.sin(time * 0.00038) * 0.22;
    const flares = [
      { angle: 0.26, len: 2.2, w: 1.5, alpha: 0.18 },
      { angle: 0.26 + Math.PI * 0.5, len: 1.85, w: 1.1, alpha: 0.14 },
      { angle: 0.26 + Math.PI, len: 2.2, w: 1.5, alpha: 0.18 },
      { angle: 0.26 + Math.PI * 1.5, len: 1.85, w: 1.1, alpha: 0.14 },
      { angle: 0.26 + Math.PI * 0.25, len: 1.42, w: 0.7, alpha: 0.09 },
      { angle: 0.26 + Math.PI * 0.75, len: 1.42, w: 0.7, alpha: 0.09 },
      { angle: 0.26 + Math.PI * 1.25, len: 1.42, w: 0.7, alpha: 0.09 },
      { angle: 0.26 + Math.PI * 1.75, len: 1.42, w: 0.7, alpha: 0.09 },
    ];
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    flares.forEach((f) => {
      const len = sunRadius * f.len * pulse;
      const ex = Math.cos(f.angle) * len;
      const ey = Math.sin(f.angle) * len;
      const grad = ctx.createLinearGradient(0, 0, ex, ey);
      grad.addColorStop(0, 'rgba(255, 235, 160, 0)');
      grad.addColorStop(0.14, 'rgba(255, 235, 160, ' + (f.alpha * pulse) + ')');
      grad.addColorStop(0.44, 'rgba(255, 218, 120, ' + (f.alpha * 0.32 * pulse) + ')');
      grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
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
        const halo = ctx.createRadialGradient(mx, my, moonR * 0.5, mx, my, moonR * 2.6);
        halo.addColorStop(0, 'rgba(185, 192, 215, ' + (alpha * 0.14) + ')');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(mx, my, moonR * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, moonR, 0, Math.PI * 2);
        ctx.clip();
        const surf = ctx.createRadialGradient(mx - moonR * 0.28, my - moonR * 0.32, 0, mx, my, moonR);
        surf.addColorStop(0, 'rgba(224, 220, 214, ' + alpha + ')');
        surf.addColorStop(0.38, 'rgba(168, 164, 157, ' + alpha + ')');
        surf.addColorStop(1, 'rgba(82, 79, 74, ' + alpha + ')');
        ctx.fillStyle = surf;
        ctx.beginPath();
        ctx.arc(mx, my, moonR, 0, Math.PI * 2);
        ctx.fill();
        const baseSeed = (planet.index * 10 + mi) * 47.3;
        for (let cc = 0; cc < 5; cc += 1) {
          const seed = baseSeed + cc * 13.7;
          const ca = pseudoRandom(seed) * Math.PI * 2;
          const cd = moonR * (0.08 + pseudoRandom(seed + 3.1) * 0.54);
          const cr = moonR * (0.07 + pseudoRandom(seed + 7.4) * 0.15);
          const crx = mx + Math.cos(ca) * cd;
          const cry = my + Math.sin(ca) * cd;
          const cg = ctx.createRadialGradient(crx, cry, 0, crx, cry, cr);
          cg.addColorStop(0, 'rgba(52, 49, 45, ' + (alpha * 0.62) + ')');
          cg.addColorStop(0.6, 'rgba(72, 69, 65, ' + (alpha * 0.28) + ')');
          cg.addColorStop(1, 'rgba(118, 115, 110, 0)');
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(crx, cry, cr, 0, Math.PI * 2);
          ctx.fill();
        }
        const shade = ctx.createLinearGradient(mx + lightX * moonR, my + lightY * moonR, mx - lightX * moonR, my - lightY * moonR);
        shade.addColorStop(0, 'rgba(255, 252, 240, 0.1)');
        shade.addColorStop(0.28, 'rgba(0,0,0,0)');
        shade.addColorStop(0.54, 'rgba(0,0,0,0.14)');
        shade.addColorStop(1, 'rgba(0,0,0,' + (0.58 + (1 - moonDepth) * 0.14) + ')');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(mx, my, moonR, 0, Math.PI * 2);
        ctx.fill();
        const limb = ctx.createRadialGradient(mx, my, moonR * 0.64, mx, my, moonR);
        limb.addColorStop(0, 'rgba(0,0,0,0)');
        limb.addColorStop(1, 'rgba(0,0,0,' + (alpha * 0.3) + ')');
        ctx.fillStyle = limb;
        ctx.beginPath();
        ctx.arc(mx, my, moonR, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const spec = ctx.createRadialGradient(mx + lightX * moonR * 0.44, my + lightY * moonR * 0.44, 0, mx + lightX * moonR * 0.44, my + lightY * moonR * 0.44, moonR * 0.28);
        spec.addColorStop(0, 'rgba(255,255,255,' + (alpha * 0.38) + ')');
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
    ctx.strokeStyle = 'rgba(140, 230, 255, ' + al + ')';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(sx - sz * 0.65, sy - sz * 0.32, sz * 1.3, sz * 0.64, sz * 0.12);
    else ctx.rect(sx - sz * 0.65, sy - sz * 0.32, sz * 1.3, sz * 0.64);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(sx, sy - sz * 0.32); ctx.lineTo(sx, sy + sz * 0.32);
    ctx.moveTo(sx - sz * 0.65, sy); ctx.lineTo(sx + sz * 0.65, sy);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(100, 200, 255, ' + (al * 0.8) + ')';
    ctx.lineWidth = sz * 0.38;
    ctx.beginPath();
    ctx.moveTo(sx - sz * 2.1, sy); ctx.lineTo(sx - sz * 0.72, sy);
    ctx.moveTo(sx + sz * 0.72, sy); ctx.lineTo(sx + sz * 2.1, sy);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60, 170, 255, ' + (al * 0.55) + ')';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.rect(sx - sz * 2.1, sy - sz * 0.22, sz * 1.4, sz * 0.44);
    ctx.rect(sx + sz * 0.72, sy - sz * 0.22, sz * 1.4, sz * 0.44);
    ctx.stroke();
    if (Math.sin(time * 0.0068) > 0.2) {
      ctx.fillStyle = 'rgba(255, 80, 80, ' + (al * 0.9) + ')';
      ctx.beginPath();
      ctx.arc(sx, sy - sz * 0.32, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawComets = (width, height) => {
    const cometDefs = [
      { period: 24000, offset: 0, visible: 0.38, sx: -0.08, sy: 0.18, ex: 0.75, ey: 0.56 },
      { period: 36000, offset: 11000, visible: 0.32, sx: 1.06, sy: 0.07, ex: 0.12, ey: 0.52 },
      { period: 48000, offset: 21000, visible: 0.36, sx: 0.04, sy: -0.05, ex: 0.82, ey: 0.62 },
    ];
    cometDefs.forEach((comet) => {
      const tt = ((time + comet.offset) % comet.period) / comet.period;
      if (tt > comet.visible) return;
      const progress = tt / comet.visible;
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
      tailGrad.addColorStop(0, 'rgba(220, 242, 255, ' + (brightness * 0.92) + ')');
      tailGrad.addColorStop(0.1, 'rgba(180, 218, 255, ' + (brightness * 0.65) + ')');
      tailGrad.addColorStop(0.35, 'rgba(140, 188, 255, ' + (brightness * 0.26) + ')');
      tailGrad.addColorStop(1, 'rgba(100, 160, 255, 0)');
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
      headGlow.addColorStop(0, 'rgba(255, 255, 255, ' + brightness + ')');
      headGlow.addColorStop(0.28, 'rgba(210, 235, 255, ' + (brightness * 0.65) + ')');
      headGlow.addColorStop(1, 'rgba(120, 170, 255, 0)');
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, headR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  let planetPositions = [];
  const draw = () => {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width * centerXFrac;
    const centerY = height * 0.5;
    const maxOrbit = Math.min(width * 0.45, height * 0.62) * scale;
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
      return Object.assign({}, planet, { index: index, x: x, y: y, depth: depth, radius: planet.size * (0.78 + depth * 0.42) * scale });
    }).sort((a, b) => a.y - b.y);
    let targetX = 0, targetY = 0, targetZ = 1;
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
    planetVisuals.forEach((planet) => {
      const orbitRadius = maxOrbit * planet.orbit;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 134, 0.18)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbitRadius, orbitRadius * tilt, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
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
    planetPositions = planets.map((p) => ({ x: p.x, y: p.y, radius: p.radius, index: p.index }));
    drawMoons(planets);
    drawSpaceStation(maxOrbit, tilt, phase);
    ctx.restore();
    const focusAmt = Math.min(1, Math.max(0, (cam.z - 1) / 1.55));
    if (focusAmt > 0.03) {
      const spot = ctx.createRadialGradient(centerX, centerY, Math.min(width, height) * 0.16, centerX, centerY, Math.max(width, height) * 0.78);
      spot.addColorStop(0, 'rgba(2, 6, 23, 0)');
      spot.addColorStop(0.55, 'rgba(2, 6, 23, ' + (0.18 * focusAmt) + ')');
      spot.addColorStop(1, 'rgba(2, 6, 23, ' + (0.6 * focusAmt) + ')');
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, width, height);
    }
    time += reducedMotion ? 0 : 8;
    animationFrame = isActive() ? window.requestAnimationFrame(draw) : 0;
  };

  const handleClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const dx = (e.clientX - rect.left) - rect.width * centerXFrac;
    const dy = (e.clientY - rect.top) - rect.height * 0.5;
    const cos = Math.cos(0.02);
    const sin = Math.sin(0.02);
    // Map the screen point back through the live fly-camera (rotation, then
    // zoom + pan) so taps land on the right planet even while zoomed into one.
    const rx = (dx * cos - dy * sin) / cam.z + cam.x;
    const ry = (dx * sin + dy * cos) / cam.z + cam.y;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < planetPositions.length; i += 1) {
      const planet = planetPositions[i];
      const d = Math.hypot(rx - planet.x, ry - planet.y);
      if (d <= planet.radius * 1.6 && d < bestDist) { best = planet.index; bestDist = d; }
    }
    onSelect(best >= 0 ? best : null);
  };

  if (interactive) {
    canvas.style.cursor = 'pointer';
    canvas.addEventListener('click', handleClick);
  }
  resize();
  window.addEventListener('resize', resize);
  animationFrame = window.requestAnimationFrame(draw);
  const resume = () => { if (isActive() && !animationFrame) animationFrame = window.requestAnimationFrame(draw); };
  const io = new IntersectionObserver((entries) => { isIntersecting = entries[0].isIntersecting; resume(); }, { rootMargin: '150px' });
  io.observe(canvas);
  document.addEventListener('visibilitychange', resume);

  return {
    setFocus: function (f) { focus = f || { index: -1, nextIndex: -1, blend: 0, strength: 0 }; },
    resize: resize,
  };
}
