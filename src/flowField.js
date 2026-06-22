// Interactive WebGL flow-field nebula for the /concept/ hero background.
// A single fragment shader: domain-warped fbm noise, brand-coloured, that
// drifts slowly and gently swirls toward the cursor. No external libs.
// Tuned to be subtle so the headline stays the focus.
// Returns false if WebGL is unavailable so the caller can fall back.

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const FRAG = [
  'precision highp float;',
  'uniform float u_time;',
  'uniform vec2 u_res;',
  'uniform vec2 u_mouse;',
  'uniform float u_swirl;',
  'float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }',
  'float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);',
  '  float a=hash(i); float b=hash(i+vec2(1.0,0.0)); float c=hash(i+vec2(0.0,1.0)); float d=hash(i+vec2(1.0,1.0));',
  '  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }',
  'float fbm(vec2 p){ float v=0.0; float a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);',
  '  for(int i=0;i<5;i++){ v += a*noise(p); p = m*p; a *= 0.5; } return v; }',
  'void main(){',
  '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
  '  float aspect = u_res.x / u_res.y;',
  '  vec2 auv = vec2((uv.x-0.5)*aspect+0.5, uv.y);',
  '  vec2 m = vec2((u_mouse.x-0.5)*aspect+0.5, u_mouse.y);',
  '  vec2 d = auv - m;',
  '  float dist = length(d);',
  '  float ang = (u_swirl*0.8 + 0.04) * exp(-dist*3.4);',
  '  float cs = cos(ang); float sn = sin(ang);',
  '  vec2 sw = m + mat2(cs,-sn,sn,cs)*d;',
  '  float t = u_time*0.028;',
  '  vec2 p = sw*2.7;',
  '  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));',
  '  vec2 r = vec2(fbm(p + 3.0*q + vec2(1.7,9.2) + 0.5*t), fbm(p + 3.0*q + vec2(8.3,2.8) - 0.4*t));',
  '  float f = fbm(p + 3.0*r);',
  '  f = clamp(f*1.1, 0.0, 1.0);',
  '  float rl = clamp(length(r), 0.0, 1.0);',
  '  vec3 deep = vec3(0.014,0.021,0.041);',
  '  vec3 cyan = vec3(0.22,0.74,0.97);',
  '  vec3 purple = vec3(0.655,0.545,0.98);',
  '  vec3 ember = vec3(0.98,0.45,0.18);',
  '  vec3 col = deep;',
  '  col = mix(col, cyan*0.30, smoothstep(0.46,0.74,f));',
  '  col = mix(col, purple*0.34, clamp(smoothstep(0.62,0.9,f)*rl*0.5, 0.0, 1.0));',
  '  col += ember*0.14*smoothstep(0.82,0.99,f);',
  '  col += (cyan*0.08 + purple*0.05)*pow(f,4.0);',
  '  col += cyan*0.045*exp(-dist*4.6)*(0.3 + u_swirl*0.6);',
  '  col *= 0.62;',
  '  float vig = smoothstep(1.18, 0.30, length((uv-0.5)*vec2(aspect,1.0)));',
  '  col *= vig;',
  '  col = col/(col+0.8);',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n');

export function initFlowField(canvas, opts) {
  if (!canvas) return false;
  opts = opts || {};
  let gl;
  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, depth: false }) || canvas.getContext('experimental-webgl');
  } catch (e) { gl = null; }
  if (!gl) return false;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return false;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uSwirl = gl.getUniformLocation(prog, 'u_swirl');

  const renderScale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.62;
  let W = 1, H = 1;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width * renderScale));
    H = Math.max(1, Math.floor(r.height * renderScale));
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = [0.5, 0.5];
  let target = [0.5, 0.5];
  let swirl = 0;
  let lastX = 0.5, lastY = 0.5;
  if (fine) {
    window.addEventListener('mousemove', (e) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      const dx = nx - lastX, dy = ny - lastY;
      swirl = Math.min(0.4, swirl + Math.sqrt(dx * dx + dy * dy) * 4.0);
      lastX = nx; lastY = ny;
      target = [nx, 1.0 - ny];
    }, { passive: true });
  }

  const t0 = (window.performance && performance.now) ? performance.now() : Date.now();
  let raf = 0;
  let visible = true;
  const render = (now) => {
    mouse[0] += (target[0] - mouse[0]) * 0.05;
    mouse[1] += (target[1] - mouse[1]) * 0.05;
    swirl *= 0.9;
    const time = reduced ? 6.0 : (now - t0) * 0.001;
    gl.uniform1f(uTime, time);
    gl.uniform2f(uRes, W, H);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform1f(uSwirl, swirl);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = (!reduced && visible) ? window.requestAnimationFrame(render) : 0;
  };
  raf = window.requestAnimationFrame(render);

  try {
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !raf && !reduced) raf = window.requestAnimationFrame(render);
    }, { rootMargin: '50px' });
    io.observe(canvas);
  } catch (e) { /* no-op */ }

  return true;
}
