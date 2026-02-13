/**
 * Background Music Control
 */

// Music Control logic moved - now handled by Vibe Control on the right
// Global function for modal access
window.enableMusic = function () {
    if (bgMusic && bgMusic.paused) {
        bgMusic.play();
        if (musicStatus) musicStatus.textContent = 'ON';
        if (musicBtn) musicBtn.classList.remove('off');
    }
};
