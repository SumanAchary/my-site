/**
 * Apple-inspired Fluid Scroll Effects
 * Handles parallax, smooth reveals, and dynamic glass effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('#hero');
    const heroContainer = document.querySelector('#hero .hero-container');
    const sections = document.querySelectorAll('section');
    const scrollDown = document.querySelector('.scroll-down');

    // 1. Initial Styles for Reveal
    sections.forEach(section => {
        if (section.id !== 'hero') {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px) scale(0.98)';
            section.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        }
    });

    // 2. Intersection Observer for Fluid Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';

                // Stagger children if any
                const children = entry.target.querySelectorAll('.resume-item, .portfolio-item, .progress');
                children.forEach((child, index) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(20px)';
                    child.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 * index}s`;
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';

                        // CLEAR INLINE STYLES after transition to allow hover CSS to work
                        setTimeout(() => {
                            child.style.transform = '';
                            child.style.transition = '';
                        }, 1200);
                    }, 50);
                });

                // Clear section inline style too
                setTimeout(() => {
                    entry.target.style.transform = '';
                }, 1500);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => revealObserver.observe(section));

    // 3. Smooth Parallax & Sidebar Glass Logic
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (scrolled / scrollHeight) * 100;

        // Update Scroll Progress Bar
        const progressBar = document.querySelector('#scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${scrollProgress}%`;
        }

        // Hero fade on scroll (opacity only — NO transform, because a
        // transform on this container becomes a containing block and
        // disables the .hero-content backdrop-filter glass blur).
        if (heroContainer && scrolled < window.innerHeight) {
            heroContainer.style.opacity = `${1 - scrolled / (window.innerHeight * 0.8)}`;
        }

        // Hide the scroll-down hint once the user starts scrolling.
        if (scrollDown) {
            scrollDown.classList.toggle('hidden', scrolled > 60);
        }

        // NOTE: The old "Sidebar Glass Pulse" was removed — it forced the
        // header back to a blue glass look via inline styles on scroll,
        // overriding the flat Material sidebar CSS.
    });

    // 4. Subtle Smooth Scrolling Momentum logic (Simplified)
    // This adds a slight "elastic" feel to the smooth scroll links
    const scrollLinks = document.querySelectorAll('.scrollto');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});
