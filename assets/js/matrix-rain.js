/**
 * Matrix Digital Rain — themed background
 *
 * Runs continuously as a subtle background behind the hero (not gated behind
 * the old "matrix-mode"). Recoloured from green to the site's theme palette
 * (sky-blue with occasional violet + amber glyphs). Kept low-opacity so it
 * reads as ambient texture, never a distraction.
 *
 * Respects prefers-reduced-motion and pauses when the tab is hidden.
 */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme colours (sky-blue mostly, with rare violet + amber accents)
  const COLORS = [
    'rgba(56, 189, 248, ALPHA)',   // sky (primary)
    'rgba(56, 189, 248, ALPHA)',   // sky (weighted heavier)
    'rgba(125, 211, 252, ALPHA)',  // bright sky
    'rgba(167, 139, 250, ALPHA)',  // violet accent
    'rgba(251, 191, 36, ALPHA)',   // amber accent (rare)
  ];

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%<>[]{}|/\\';
  const fontSize = 16;

  let width, height, columns;
  let drops = [];
  let colColor = [];
  let animationId = null;

  function setup() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = new Array(columns);
    colColor = new Array(columns);
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -height / fontSize; // stagger starts
      colColor[i] = COLORS[(Math.random() * COLORS.length) | 0];
    }
  }

  function draw() {
    // Trailing fade uses the theme's deep-navy base instead of black,
    // so the rain blends into the background rather than dimming to black.
    ctx.fillStyle = 'rgba(13, 21, 38, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt((Math.random() * characters.length) | 0);
      // Low alpha keeps it subtle; the leading glyph is a touch brighter.
      ctx.fillStyle = colColor[i].replace('ALPHA', '0.45');
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
        // occasionally re-roll the column colour for variety
        if (Math.random() > 0.7) {
          colColor[i] = COLORS[(Math.random() * COLORS.length) | 0];
        }
      }
      drops[i]++;
    }
  }

  function animate() {
    draw();
    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (animationId == null) animationId = requestAnimationFrame(animate);
  }
  function stop() {
    if (animationId != null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  setup();

  if (reduceMotion) {
    // Draw a single static frame, no animation.
    draw();
  } else {
    start();
  }
})();
