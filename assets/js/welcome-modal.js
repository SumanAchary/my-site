/**
 * Background Music + Mute Button
 *
 * On by default. Browsers block autoplay-*with-sound* until the user
 * interacts with the page, so if the initial play() is blocked we retry on
 * the first user gesture (scroll / click / key / touch / pointer / move).
 * When playback starts, the volume fades in smoothly instead of jumping.
 * The button reflects the user's intent (on unless they toggle it off).
 */
document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');

    if (!bgMusic || !musicBtn) return;

    const TARGET_VOLUME = 0.6;   // final volume when on
    const FADE_MS = 1500;        // fade-in / fade-out duration

    // User intent: ON by default. (Actual audio may wait for a gesture.)
    let wantOn = true;
    let fadeTimer = null;

    // Start silent so the very first frames of audio don't blast at full volume.
    bgMusic.volume = 0;

    const GESTURES = ['pointerdown', 'click', 'keydown', 'scroll', 'touchstart', 'mousemove', 'wheel'];

    const reflectState = () => {
        const muted = !wantOn;
        musicBtn.classList.toggle('is-muted', muted);
        musicBtn.setAttribute('aria-pressed', String(muted));
        musicBtn.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
        const label = musicBtn.querySelector('.music-fab-label');
        if (label) label.textContent = muted ? 'Music off' : 'Music on';
    };

    // Smoothly ramp bgMusic.volume from its current value to `to` over FADE_MS.
    const fadeTo = (to, onDone) => {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }
        const from = bgMusic.volume;
        const start = performance.now();
        fadeTimer = setInterval(() => {
            const t = Math.min((performance.now() - start) / FADE_MS, 1);
            bgMusic.volume = from + (to - from) * t;
            if (t >= 1) {
                clearInterval(fadeTimer);
                fadeTimer = null;
                if (typeof onDone === 'function') onDone();
            }
        }, 30);
    };

    // Attempt to start playback and fade the volume in. Returns the play promise.
    const tryPlay = () => {
        if (!wantOn) return Promise.resolve();
        const p = bgMusic.play();
        const started = p && typeof p.then === 'function' ? p : Promise.resolve();
        return started.then(() => fadeTo(TARGET_VOLUME));
    };

    // Retry playback on the first user gesture, then stop listening.
    const onGesture = () => {
        if (!wantOn) return removeGestureListeners();
        tryPlay().then(removeGestureListeners).catch(() => {});
    };
    const removeGestureListeners = () => {
        GESTURES.forEach((evt) => window.removeEventListener(evt, onGesture));
    };
    const addGestureListeners = () => {
        GESTURES.forEach((evt) =>
            window.addEventListener(evt, onGesture, { passive: true })
        );
    };

    // No intro popup — try to autoplay, and if the browser blocks it, start
    // the music on the visitor's first natural interaction (scroll/click/etc).
    tryPlay().catch(addGestureListeners);
    addGestureListeners();

    // Manual toggle — fade in when turning on, fade out then pause when off.
    musicBtn.addEventListener('click', () => {
        wantOn = !wantOn;
        if (wantOn) {
            tryPlay().catch(() => {});
        } else {
            fadeTo(0, () => bgMusic.pause());
        }
        reflectState();
    });

    // Slide the button in shortly after load.
    setTimeout(() => musicBtn.classList.add('visible'), 900);

    reflectState();
});
