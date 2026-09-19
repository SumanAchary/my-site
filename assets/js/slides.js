/**
 * Deck / Slideshow navigation  (slides.html only)
 *
 * Turns #hero and each <section> inside #main into full-screen slides.
 * Navigate with the on-screen arrows, the keyboard (← →, PageUp/PageDown,
 * Home/End), swipe gestures, the progress dots, or the existing sidebar
 * nav links (which now jump to the matching slide instead of scrolling).
 *
 * This file only activates on pages that include the deck controls, so it
 * has no effect on the original index.html.
 */
(function () {
  "use strict";

  // Only run the deck if its controls exist (i.e. we're on slides.html).
  const prevBtn = document.getElementById("deck-prev");
  const nextBtn = document.getElementById("deck-next");
  if (!prevBtn || !nextBtn) return;

  const html = document.documentElement;
  html.classList.add("deck");

  // Collect slides in visual order: hero first, then each section of #main.
  const hero = document.getElementById("hero");
  const sections = Array.from(document.querySelectorAll("#main > section"));
  const slides = [hero, ...sections].filter(Boolean);

  if (!slides.length) return;

  const dotsWrap = document.getElementById("deck-dots");
  const curEl = document.getElementById("deck-current");
  const totalEl = document.getElementById("deck-total");
  const hint = document.getElementById("deck-hint");

  let index = 0;
  let hintDismissed = false;

  // Map each slide's id -> its index, so #hash links can target it.
  const idToIndex = {};
  slides.forEach((s, i) => {
    if (s.id) idToIndex["#" + s.id] = i;
  });

  // ---- Build progress dots ------------------------------------------------
  const labels = slides.map((s) => {
    // Try to use the sidebar label for this section, else the id.
    const link = document.querySelector('#navbar a[href="#' + s.id + '"] span');
    if (link) return link.textContent.trim();
    return s.id || "Slide";
  });

  const dots = labels.map((label, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Go to " + label);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  if (totalEl) totalEl.textContent = String(slides.length);

  // Detect whether slides.css loaded (its rules set position:fixed on slides).
  // If not, JS applies the base layout as a fallback (stale cache / bad path).
  let cssLoaded = null;
  function isCssLoaded() {
    if (cssLoaded !== null) return cssLoaded;
    const pos = window.getComputedStyle
      ? window.getComputedStyle(slides[0]).position
      : "";
    cssLoaded = pos === "fixed";
    return cssLoaded;
  }

  const isNarrow =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 1200px)").matches
      : window.innerWidth <= 1200;
  const SIDEBAR = isNarrow ? 0 : 300;

  // Fallback base layout when the stylesheet didn't load.
  function ensureBaseLayout() {
    if (isCssLoaded()) return;
    slides.forEach((slide) => {
      slide.style.position = "fixed";
      slide.style.top = "0";
      slide.style.bottom = "0";
      slide.style.left = SIDEBAR + "px";
      slide.style.right = "0";
      slide.style.margin = "0";
      slide.style.height = "100vh";
      slide.style.overflowY = "auto";
      slide.style.display = "flex";
      slide.style.flexDirection = "column";
      slide.style.justifyContent = slide.id === "hero" ? "center" : "flex-start";
      slide.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    });
  }

  // ---- Core: position the filmstrip --------------------------------------
  function render() {
    ensureBaseLayout();

    slides.forEach((slide, i) => {
      const isActive = i === index;
      // Each slide offset horizontally by its distance from the active one.
      slide.style.setProperty("--deck-x", (i - index) * 100 + "%");
      // Fallback also needs the raw transform when CSS var support/rules absent.
      if (!isCssLoaded()) {
        slide.style.transform = "translateX(" + (i - index) * 100 + "%)";
      }
      slide.classList.toggle("slide-active", isActive);
      slide.style.zIndex = isActive ? "6" : "5";
      slide.style.pointerEvents = isActive ? "" : "none";
    });

    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

    // Matrix rain is a hero-only background: mark when the hero slide is active
    // so CSS can fade the rain down on content slides.
    var activeSlide = slides[index];
    document.body.classList.toggle("on-hero", !!activeSlide && activeSlide.id === "hero");

    if (curEl) curEl.textContent = String(index + 1);

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;

    updateNavActive();

    // Reset internal scroll of the newly active slide to the top.
    if (slides[index]) slides[index].scrollTop = 0;
  }

  function updateNavActive() {
    const activeId = "#" + (slides[index] && slides[index].id);
    document.querySelectorAll("#navbar .scrollto").forEach((link) => {
      link.classList.toggle("active", link.hash === activeId);
    });
  }

  function goTo(i) {
    const target = Math.max(0, Math.min(slides.length - 1, i));
    if (target === index) return;
    index = target;
    dismissHint();
    render();
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function dismissHint() {
    if (hintDismissed || !hint) return;
    hintDismissed = true;
    hint.classList.add("is-hidden");
  }

  // ---- Arrow buttons ------------------------------------------------------
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  // ---- Keyboard -----------------------------------------------------------
  window.addEventListener("keydown", (e) => {
    // Ignore when typing in a field.
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        goTo(0);
        break;
      case "End":
        e.preventDefault();
        goTo(slides.length - 1);
        break;
    }
  });

  // ---- Sidebar nav + hero scroll-down: jump to slides --------------------
  // Intercept in the capture phase so main.js's scrollto handler doesn't run.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const target = link.getAttribute("href");
    if (!(target in idToIndex)) return; // only links that map to a slide
    link.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(idToIndex[target]);
        // On mobile, close the open nav drawer if present.
        document.body.classList.remove("mobile-nav-active");
        const toggle = document.querySelector(".mobile-nav-toggle");
        if (toggle) {
          toggle.classList.add("bi-list");
          toggle.classList.remove("bi-x");
        }
      },
      true // capture
    );
  });

  // ---- Swipe (touch) ------------------------------------------------------
  let touchX = null;
  let touchY = null;
  const SWIPE = 55; // px threshold

  window.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      touchX = touchY = null;
      // Horizontal swipe only (ignore vertical scrolls within a slide).
      if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  // ---- Mouse wheel: horizontal-style paging (debounced) ------------------
  let wheelLock = false;
  window.addEventListener(
    "wheel",
    (e) => {
      const slide = slides[index];
      // If the current slide can scroll internally and isn't at an edge,
      // let it scroll normally instead of paging.
      if (slide) {
        const canScroll = slide.scrollHeight > slide.clientHeight + 2;
        const atTop = slide.scrollTop <= 0;
        const atBottom =
          slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2;
        if (canScroll && !((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom))) {
          return;
        }
      }
      if (wheelLock) return;
      if (Math.abs(e.deltaY) < 20) return;
      wheelLock = true;
      if (e.deltaY > 0) next();
      else prev();
      setTimeout(() => (wheelLock = false), 700);
    },
    { passive: true }
  );

  // ---- Deep-link support: open on the slide named in the URL hash --------
  if (window.location.hash && window.location.hash in idToIndex) {
    index = idToIndex[window.location.hash];
  }

  render();

  // main.js runs its own scroll-based active-link logic on `load`, which in
  // a locked deck would wrongly reset the highlight to "Home". Re-assert the
  // deck's state after load so the correct slide stays highlighted.
  window.addEventListener("load", () => {
    render();
  });
})();
