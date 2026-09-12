/**
 * Background Music + Mute Button
 * On by default at 60% volume. Browsers block autoplay-with-sound until the
 * user interacts with the page, so if the initial play() is blocked we retry
 * on the first user gesture (click / key / scroll / touch / pointer / move).
 * The button reflects the user's intent (on unless they toggle it off).
 */
document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');

    if (!bgMusic || !musicBtn) return;

    // Set volume once metadata/element is ready.
    bgMusic.volume = 0.6;

    // User intent: ON by default. (Actual audio may wait for a gesture.)
    let wantOn = true;

    const GESTURES = ['pointerdown', 'click', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    const reflectState = () => {
        const muted = !wantOn;
        musicBtn.classList.toggle('is-muted', muted);
        musicBtn.setAttribute('aria-pressed', String(muted));
        musicBtn.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
        const label = musicBtn.querySelector('.music-fab-label');
        if (label) label.textContent = muted ? 'Music off' : 'Music on';
    };

    const tryPlay = () => {
        if (!wantOn) return Promise.resolve();
        bgMusic.volume = 0.6;
        const p = bgMusic.play();
        return p && typeof p.then === 'function' ? p : Promise.resolve();
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

    // Attempt autoplay immediately; if blocked, arm the gesture fallback.
    tryPlay().catch(addGestureListeners);
    // Arm anyway in case the promise resolved without actually starting.
    addGestureListeners();

    // Manual toggle.
    musicBtn.addEventListener('click', () => {
        wantOn = !wantOn;
        if (wantOn) {
            tryPlay().catch(() => {});
        } else {
            bgMusic.pause();
        }
        reflectState();
    });

    // Slide the button in shortly after load.
    setTimeout(() => musicBtn.classList.add('visible'), 900);

    reflectState();
});
