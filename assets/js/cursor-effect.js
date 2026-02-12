/**
 * High-Performance Code Particle Effect using Canvas
 * Optimized to prevent lag and reduce CPU/GPU usage.
 */

// Toggle state
let cursorEffectEnabled = false;

// Track cursor position
let mouseX = 0;
let mouseY = 0;
let lastMoveTime = 0;
let isAnimating = false;

// Array of code symbols based on my skills
const codeSymbols = [
    'python', 'flask', 'mongodb', 'aws', 'docker', 'linux', 'bash', 'ci/cd',
    'dsa', 'sql', 'html5', 'css3', 'javascript', 'react', 'git', 'api',
    'boto3', 'lambda', 'ec2', 's3', 'pytest', 'gunicorn', 'nginx', 'postman',
    'shell', 'json', 'jwt', 'rest', 'linux', 'cloud', 'science'
];

// Initialize Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9999';
document.body.appendChild(canvas);

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = [];

// Particle Class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.text = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];

        const angle = Math.random() * Math.PI * 2;
        const velocity = 1 + Math.random() * 2;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;

        this.opacity = 1;
        this.scale = 0.8 + Math.random() * 0.4;

        const colors = ['#3498db', '#2980b9', '#0c2461', '#5dade2', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity -= 0.02; // Fade faster for better performance
        this.scale += 0.005;
        return this.opacity > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${14 * this.scale}px "Courier New", monospace`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Toggle button functionality
const toggleBtn = document.getElementById('cursor-toggle-btn');
const statusText = document.getElementById('cursor-status');

if (toggleBtn && statusText) {
    toggleBtn.addEventListener('click', () => {
        cursorEffectEnabled = !cursorEffectEnabled;

        if (cursorEffectEnabled) {
            statusText.textContent = 'ON';
            toggleBtn.classList.remove('off');
            document.body.style.cursor = 'pointer';
        } else {
            statusText.textContent = 'OFF';
            toggleBtn.classList.add('off');
            document.body.style.cursor = 'default';
            // Clear canvas immediately
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.length = 0;
            isAnimating = false;
        }
    });
}

// Update cursor position with smart throttling
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorEffectEnabled) {
        const now = performance.now();
        if (now - lastMoveTime > 40) { // Max 25 particles per second
            particles.push(new Particle(mouseX, mouseY));
            lastMoveTime = now;

            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
        }
    }
});

// Animation Loop - only runs when needed
function animate() {
    if (!cursorEffectEnabled || particles.length === 0) {
        isAnimating = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.update()) {
            p.draw();
        } else {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Initialize
if (cursorEffectEnabled) {
    document.body.style.cursor = 'pointer';
} else {
    document.body.style.cursor = 'default';
}

// Global functions for modal access
window.enableCursorEffect = function () {
    cursorEffectEnabled = true;
    document.body.style.cursor = 'pointer';
    const statusText = document.getElementById('cursor-status');
    const toggleBtn = document.getElementById('cursor-toggle-btn');
    if (statusText) statusText.textContent = 'ON';
    if (toggleBtn) toggleBtn.classList.remove('off');
};

