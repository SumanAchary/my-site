/**
 * Hero Summary Dashboard — animations
 *
 * Animates the dashboard on load:
 *  - stat count-ups (0 -> target)
 *  - donut chart segments (stroke-dasharray reveal)
 *  - skill bars (width fill)
 *
 * Pure vanilla JS + SVG. No chart library. Safe if elements are missing.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var started = false;

    function animateStats() {
      var nums = document.querySelectorAll(".stat-card .metric-num, .hero-metrics .metric-num");
      nums.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-target")) || 0;
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1400;
        var start = performance.now();
        function tick(now) {
          var t = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(tick);
      });
    }

    function animateDonut() {
      var segs = document.querySelectorAll(".donut-seg");
      var gap = 1;                 // small visual gap between segments (in %)
      var cumulative = 0;          // running start position of each segment (%)

      segs.forEach(function (seg, i) {
        var value = parseFloat(seg.getAttribute("data-value")) || 0;
        var len = Math.max(value - gap, 0);           // arc length drawn
        // dashoffset positions the arc's start. With the circle rotated -90deg
        // in CSS, offset 25 = 12 o'clock. Each segment starts where the
        // previous one ended: offset = 25 - cumulative (wrapped to 0..100).
        var start = cumulative;
        var offset = (100 - start + 25) % 100;

        setTimeout(function () {
          seg.setAttribute("stroke-dasharray", len + " " + (100 - len));
          seg.setAttribute("stroke-dashoffset", offset);
        }, 200 + i * 180);

        cumulative += value;       // advance by the FULL value (gap is visual)
      });
    }

    function animateBars() {
      document.querySelectorAll(".sb-fill, .exp-fill").forEach(function (bar, i) {
        var pct = parseFloat(bar.getAttribute("data-pct")) || 0;
        setTimeout(function () { bar.style.width = pct + "%"; }, 250 + (i % 5) * 120);
      });
    }

    function runAll() {
      if (started) return;
      started = true;
      animateStats();
      animateDonut();
      animateBars();
    }

    // Kick off shortly after load.
    setTimeout(runAll, 300);

  });
})();
