/**
 * Background Music Control
 *
 * The core music logic (autoplay attempt, gesture fallback, fade-in, mute
 * button) lives in welcome-modal.js. This file just exposes a global that
 * the welcome modal can call to kick playback off from a user click, which
 * counts as a valid gesture and reliably starts audio with a fade-in.
 */
window.enableMusic = function () {
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    if (!bgMusic) return;

    const TARGET_VOLUME = 0.6;
    const FADE_MS = 1500;

    const play = bgMusic.play();
    const started = play && typeof play.then === 'function' ? play : Promise.resolve();

    started
        .then(() => {
            // Fade the volume in smoothly from its current level.
            const from = bgMusic.volume;
            const start = performance.now();
            const timer = setInterval(() => {
                const t = Math.min((performance.now() - start) / FADE_MS, 1);
                bgMusic.volume = from + (TARGET_VOLUME - from) * t;
                if (t >= 1) clearInterval(timer);
            }, 30);

            if (musicBtn) {
                musicBtn.classList.remove('is-muted');
                musicBtn.setAttribute('aria-pressed', 'false');
            }
        })
        .catch(() => {});
};
