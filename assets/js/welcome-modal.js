document.addEventListener('DOMContentLoaded', () => {
    const vibeFeature = document.getElementById('vibe-control');
    const vibeToggle = document.getElementById('vibe-toggle');
    const vibeClose = document.getElementById('vibe-close');
    const musicToggle = document.getElementById('music-vibe-toggle');
    const cursorToggle = document.getElementById('cursor-vibe-toggle');

    if (!vibeFeature) return;

    // Show feature automatically after a slight delay (2 seconds)
    setTimeout(() => {
        vibeFeature.classList.add('active');
    }, 2000);

    // Toggle button logic
    if (vibeToggle) {
        vibeToggle.addEventListener('click', () => {
            vibeFeature.classList.toggle('active');
        });
    }

    // Close button logic
    if (vibeClose) {
        vibeClose.addEventListener('click', () => {
            vibeFeature.classList.remove('active');
        });
    }

    // Music Toggle Logic
    if (musicToggle) {
        musicToggle.addEventListener('change', (e) => {
            const bgMusic = document.getElementById('bg-music');
            if (!bgMusic) return;

            if (e.target.checked) {
                bgMusic.play();
            } else {
                bgMusic.pause();
            }
        });
    }

    // Cursor Toggle Logic
    if (cursorToggle) {
        cursorToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (window.enableCursorEffect) window.enableCursorEffect();
            } else {
                if (window.disableCursorEffect) window.disableCursorEffect();
            }
        });
    }
});
