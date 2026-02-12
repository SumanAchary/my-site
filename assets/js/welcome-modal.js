document.addEventListener('DOMContentLoaded', () => {
    const toast = document.getElementById('welcome-modal');
    const btnFunky = document.getElementById('btn-funky');
    const btnStandard = document.getElementById('btn-standard');

    if (!toast) return;

    // Show toast after a slight delay (2 seconds)
    setTimeout(() => {
        toast.classList.add('show');
    }, 2000);

    // Function to hide toast
    const hideToast = () => {
        toast.classList.remove('show');
        // Optional: remove from DOM after transition
        setTimeout(() => {
            toast.style.display = 'none';
        }, 800);
    };

    // 1. Funky (Music + Effects) - triggered if user says "Yes"
    if (btnFunky) {
        btnFunky.addEventListener('click', () => {
            if (window.enableMusic) window.enableMusic();
            if (window.enableCursorEffect) window.enableCursorEffect();
            hideToast();
        });
    }

    // 2. Regular (Standard) - triggered if user says "No"
    if (btnStandard) {
        btnStandard.addEventListener('click', () => {
            hideToast();
        });
    }
});
