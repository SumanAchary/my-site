/**
 * Background Music Control
 */

const musicBtn = document.getElementById('music-toggle-btn');
const musicStatus = document.getElementById('music-status');
const bgMusic = document.getElementById('bg-music');

if (musicBtn && musicStatus && bgMusic) {
    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicStatus.textContent = 'ON';
            musicBtn.classList.remove('off');
        } else {
            bgMusic.pause();
            musicStatus.textContent = 'OFF';
            musicBtn.classList.add('off');
        }
    });
}
