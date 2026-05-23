/* ═══════════════════════════════════════════
   SOBRAL MEMÓRIA — Script
   XMB Canvas · Theme Toggle · Scroll Logic
   ═══════════════════════════════════════════ */

// ── THEME TOGGLE ──
(function initTheme() {
  const stored = localStorage.getItem('sobral-theme');
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  }
  // If no stored preference, let CSS prefers-color-scheme handle it
})();

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let next;
  if (!current) {
    // No override — toggle away from system default
    next = systemDark ? 'light' : 'dark';
  } else {
    next = current === 'dark' ? 'light' : 'dark';
  }

  html.setAttribute('data-theme', next);
  localStorage.setItem('sobral-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const isDark = theme === 'dark' ||
    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  btn.innerHTML = isDark
    ? '<i class="fi fi-rr-sun"></i>'
    : '<i class="fi fi-rr-moon"></i>';
  btn.setAttribute('aria-label', isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro');
}

// Init icon on load
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('sobral-theme');
  updateThemeIcon(stored);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('sobral-theme')) {
    updateThemeIcon(null);
  }
});

// ── XMB CANVAS BACKGROUND ──
const canvas = document.getElementById('xmb-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, time = 0;
  let animId;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Ribbon configs — silk-like flowing waves
  const ribbons = [
    { y: 0.22, amp: 70,  freq: 0.0028, speed: 0.007, hue1: [32,75,55], hue2: [350,55,55], thick: 200 },
    { y: 0.42, amp: 90,  freq: 0.0018, speed: 0.005, hue1: [270,45,55], hue2: [180,45,50], thick: 260 },
    { y: 0.62, amp: 55,  freq: 0.0035, speed: 0.009, hue1: [350,55,55], hue2: [32,75,55],  thick: 180 },
    { y: 0.78, amp: 80,  freq: 0.0022, speed: 0.006, hue1: [180,45,50], hue2: [270,45,55], thick: 240 },
    { y: 0.33, amp: 45,  freq: 0.0042, speed: 0.011, hue1: [42,80,65],  hue2: [340,50,60], thick: 140 },
    { y: 0.88, amp: 60,  freq: 0.003,  speed: 0.008, hue1: [200,40,50], hue2: [30,65,55],  thick: 180 },
  ];

  function getRibbonOpacity() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ribbon-opacity')) || 0.1;
  }

  function getBgColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      a: style.getPropertyValue('--bg-canvas-a').trim() || '#E8DFD4',
      b: style.getPropertyValue('--bg-canvas-b').trim() || '#F5EDE2',
      c: style.getPropertyValue('--bg-canvas-c').trim() || '#EDE4D8',
    };
  }

  function drawRibbon(r, t) {
    const opacity = getRibbonOpacity();
    const baseY = H * r.y;

    ctx.beginPath();
    ctx.moveTo(-60, baseY + Math.sin(t * r.speed) * r.amp);

    for (let x = -60; x <= W + 60; x += 3) {
      const w1 = Math.sin(x * r.freq + t * r.speed) * r.amp;
      const w2 = Math.sin(x * r.freq * 1.7 + t * r.speed * 0.65 + 1.4) * (r.amp * 0.38);
      const w3 = Math.cos(x * r.freq * 0.45 + t * r.speed * 1.2 + 2.8) * (r.amp * 0.18);
      ctx.lineTo(x, baseY + w1 + w2 + w3);
    }
    ctx.lineTo(W + 60, H + 60);
    ctx.lineTo(-60, H + 60);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, baseY - r.thick, 0, baseY + r.thick);
    const [h1,s1,l1] = r.hue1;
    const [h2,s2,l2] = r.hue2;
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.25, `hsla(${h1},${s1}%,${l1}%,${opacity})`);
    grad.addColorStop(0.5, `hsla(${h2},${s2}%,${l2}%,${opacity * 0.7})`);
    grad.addColorStop(0.75, `hsla(${h1},${s1}%,${l1}%,${opacity})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    const bg = getBgColors();
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, bg.a);
    bgGrad.addColorStop(0.45, bg.b);
    bgGrad.addColorStop(1, bg.c);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    time += 1;
    ribbons.forEach(r => drawRibbon(r, time));

    // Ambient glow
    const opacity = getRibbonOpacity();
    const glows = [
      { x: W * 0.18, y: H * 0.28, r: 280, h: 32 },
      { x: W * 0.72, y: H * 0.58, r: 320, h: 270 },
      { x: W * 0.48, y: H * 0.82, r: 260, h: 350 },
    ];
    glows.forEach(g => {
      const gx = g.x + Math.sin(time * 0.004) * 35;
      const gy = g.y + Math.cos(time * 0.003) * 25;
      const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.r);
      rg.addColorStop(0, `hsla(${g.h},50%,55%,${opacity * 0.5})`);
      rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    });

    animId = requestAnimationFrame(animate);
  }

  // Respect reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate();
  } else {
    // Draw static frame
    time = 0;
    const bg = getBgColors();
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, bg.a);
    bgGrad.addColorStop(0.45, bg.b);
    bgGrad.addColorStop(1, bg.c);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    ribbons.forEach(r => drawRibbon(r, 0));
  }
}

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 70);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(r => revealObs.observe(r));

// ── ACTIVE NAV ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });
