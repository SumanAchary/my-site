/**
 * Sidebar Ambient Smoke
 * Slow, very soft wisps of haze rising through the sidebar. Deliberately
 * subtle and low-opacity — reads as premium atmosphere, not a distraction.
 * Theme-tinted (cool navy/cyan). Confined to #header via #sidebar-smoke.
 */
(function () {
  const canvas = document.getElementById('sidebar-smoke');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement; // #header

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Soft cool smoke tints (navy-cyan). Kept very faint.
  const TINTS = [
    { r: 40, g: 90, b: 140 },
    { r: 34, g: 120, b: 140 },
    { r: 60, g: 80, b: 130 },
  ];

  const PUFF_COUNT = 9;      // few large puffs = smooth haze
  const MAX_ALPHA = 0.06;    // peak opacity per puff (very subtle)

  let width = 0, height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let puffs = [];
  let rafId = null;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function makePuff(initial) {
    const tint = TINTS[(Math.random() * TINTS.length) | 0];
    return {
      x: rand(0, width),
      y: initial ? rand(0, height) : height + rand(20, 120),
      r: rand(70, 150),            // large, soft radius
      vy: rand(-0.25, -0.08),      // slow rise
      vx: rand(-0.08, 0.08),       // gentle horizontal drift
      grow: rand(0.02, 0.06),      // slowly expand as it rises
      phase: rand(0, Math.PI * 2),
      sway: rand(0.0006, 0.0016),
      swayAmp: rand(8, 20),
      alpha: rand(0.5, 1) * MAX_ALPHA,
      tint,
    };
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    puffs = [];
    for (let i = 0; i < PUFF_COUNT; i++) puffs.push(makePuff(true));
  }

  function drawPuff(p, t) {
    const x = p.x + Math.sin(t * p.sway + p.phase) * p.swayAmp;
    const { r, g, b } = p.tint;
    const grad = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha})`);
    grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.4})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  let startTime = performance.now();

  function frame(now) {
    const t = now - startTime;
    ctx.clearRect(0, 0, width, height);
    // "lighter" blending makes overlapping haze blend softly
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      p.y += p.vy;
      p.x += p.vx;
      p.r += p.grow;

      // recycle when it rises off the top
      if (p.y + p.r < -20) {
        puffs[i] = makePuff(false);
      }
      drawPuff(p, t);
    }

    ctx.globalCompositeOperation = 'source-over';
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId == null) { startTime = performance.now(); rafId = requestAnimationFrame(frame); }
  }
  function stop() {
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();

  if (reduceMotion) {
    ctx.globalCompositeOperation = 'lighter';
    puffs.forEach((p) => drawPuff(p, 0));
    ctx.globalCompositeOperation = 'source-over';
  } else {
    start();
  }
})();
