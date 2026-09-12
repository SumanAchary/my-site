/**
 * Spark Emitter (fireflies / embers)
 * - Particles are EMITTED from the center of the screen.
 * - Each has a short lifetime (~1s) then dies; new ones spawn continuously.
 * - Fade in at birth, fade out at death (glowing spark bursts).
 * - Physics: outward launch velocity + Brownian wander + mouse attraction
 *   + scroll/resize repulsion.
 *
 * Lightweight: capped live count, respects reduced-motion, pauses when hidden,
 * sits behind content (see #sparks-canvas CSS).
 */
(function () {
  const canvas = document.getElementById('sparks-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme colors (gold + cyan)
  const COLORS = [
    { r: 212, g: 175, b: 55 },
    { r: 242, g: 209, b: 107 },
    { r: 34, g: 224, b: 224 },
    { r: 120, g: 240, b: 255 },
  ];

  // Emitter / lifetime tuning
  const LIFETIME = 2000;         // ms — how long each spark lives (~2s)
  const LIFETIME_VAR = 600;      // ms — random +/- so they don't die in sync
  const MAX_PARTICLES = 70;      // hard cap on live particles
  const EMIT_PER_SEC = 22;       // spawn rate (slower, calmer)
  const DRIFT_SPEED = 0.5;       // initial gentle drift speed

  // Physics tuning
  const ATTRACT_RADIUS = 180;
  const ATTRACT_FORCE = 0.14;
  const REPEL_FORCE = 0.9;
  const DAMPING = 0.95;
  const MAX_SPEED = 4.0;
  const BROWNIAN = 0.05;

  let width = 0, height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rafId = null;

  const mouse = { x: -9999, y: -9999, active: false };
  let disturb = 0;
  let lastScrollY = window.scrollY;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function spawnParticle() {
    const color = COLORS[(Math.random() * COLORS.length) | 0];
    // Appear at a RANDOM position anywhere on screen, with a gentle
    // random drift — then live ~1s and fade out.
    const angle = rand(0, Math.PI * 2);
    const speed = DRIFT_SPEED * rand(0.3, 1);
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: rand(1.0, 2.8),
      color,
      age: 0,
      life: LIFETIME + rand(-LIFETIME_VAR, LIFETIME_VAR),
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    disturb = Math.min(disturb + 6, 16);
  }

  function clampSpeed(p) {
    const s = Math.hypot(p.vx, p.vy);
    if (s > MAX_SPEED) {
      p.vx = (p.vx / s) * MAX_SPEED;
      p.vy = (p.vy / s) * MAX_SPEED;
    }
  }

  // life fraction 0..1 -> opacity: quick fade-in, gentle fade-out
  function lifeOpacity(f) {
    if (f < 0.15) return f / 0.15;          // fade in
    if (f > 0.6) return (1 - f) / 0.4;      // fade out
    return 1;                                // full glow mid-life
  }

  function drawSpark(p) {
    const f = p.age / p.life;
    // Soft, faded specks — low peak opacity, diffuse glow, no hard core.
    const opacity = Math.max(0, lifeOpacity(f)) * 0.4;
    const { r, g, b } = p.color;
    const glow = p.size * 6; // larger + softer falloff

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
    grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${opacity * 0.28})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, glow, 0, Math.PI * 2);
    ctx.fill();

    // very faint soft center (no sharp white dot)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  let lastTime = performance.now();
  let emitAccumulator = 0;

  function frame(now) {
    const dt = Math.min(now - lastTime, 50); // ms, clamp big gaps
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // --- Emit new particles at a steady rate ---
    emitAccumulator += (EMIT_PER_SEC * dt) / 1000;
    while (emitAccumulator >= 1 && particles.length < MAX_PARTICLES) {
      particles.push(spawnParticle());
      emitAccumulator -= 1;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // age & death
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }

      // Brownian wander
      p.vx += (Math.random() - 0.5) * BROWNIAN;
      p.vy += (Math.random() - 0.5) * BROWNIAN;

      // Attraction to mouse
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < ATTRACT_RADIUS && dist > 1) {
          const pull = (1 - dist / ATTRACT_RADIUS) * ATTRACT_FORCE;
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
        }
      }

      // Repulsion from screen movement (outward from center)
      if (disturb > 0.2) {
        const dx = p.x - width / 2;
        const dy = p.y - height / 2;
        const dist = Math.hypot(dx, dy) || 1;
        const push = (disturb / 16) * REPEL_FORCE;
        p.vx += (dx / dist) * push;
        p.vy += (dy / dist) * push;
      }

      p.vx *= DAMPING;
      p.vy *= DAMPING;
      clampSpeed(p);
      p.x += p.vx;
      p.y += p.vy;

      drawSpark(p);
    }

    // disturbance decays
    disturb *= 0.9;

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId == null) { lastTime = performance.now(); rafId = requestAnimationFrame(frame); }
  }
  function stop() {
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // Pointer tracking (attraction)
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { mouse.active = false; });
  window.addEventListener('blur', () => { mouse.active = false; });

  // Screen movement -> repulsion impulse
  window.addEventListener('scroll', () => {
    const dy = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    disturb = Math.min(disturb + Math.min(dy * 0.15, 8), 16);
  }, { passive: true });

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
    // static: a few faint specks near center, no animation
    for (let i = 0; i < 12; i++) {
      const p = spawnParticle();
      p.age = p.life * 0.4;
      particles.push(p);
    }
    particles.forEach(drawSpark);
  } else {
    start();
  }
})();
