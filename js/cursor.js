/**
 * Fluid Magnetic Cursor & Sand Ripple Particle Engine
 * Creates custom cursor with trailing physics and sand dust ripple particle canvas
 */

(function () {
  'use strict';

  // Elements
  const cursorRing = document.createElement('div');
  cursorRing.className = 'custom-cursor';
  document.body.appendChild(cursorRing);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  document.body.appendChild(cursorDot);

  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Cursor state
  let mouse = { x: width / 2, y: height / 2, prevX: width / 2, prevY: height / 2, speed: 0 };
  let ring = { x: width / 2, y: height / 2 };
  let dot = { x: width / 2, y: height / 2 };

  // Sand Particles Array
  const particles = [];
  const MAX_PARTICLES = 160;

  // Particle colors (sand gold, terracotta dust, subtle amber)
  const colors = [
    'rgba(224, 192, 151, ', // Sand gold
    'rgba(247, 231, 206, ', // Sand light
    'rgba(200, 90, 50, ',   // Terracotta rust
    'rgba(212, 163, 115, '  // Warm dune
  ];

  class SandParticle {
    constructor(x, y, vx, vy) {
      this.x = x + (Math.random() - 0.5) * 8;
      this.y = y + (Math.random() - 0.5) * 8;
      // Slight outward drift plus mouse momentum
      this.vx = (vx * 0.15) + (Math.random() - 0.5) * 1.5;
      this.vy = (vy * 0.15) + (Math.random() - 0.5) * 1.5 - 0.2; // slight upward drift
      this.size = Math.random() * 2.5 + 1.0;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.015;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.life -= this.decay;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.colorBase + (this.life * 0.7) + ')';
      ctx.beginPath();
      // Irregular micro sand grain polygon
      ctx.moveTo(-this.size, -this.size * 0.5);
      ctx.lineTo(this.size * 0.8, -this.size * 0.8);
      ctx.lineTo(this.size, this.size * 0.6);
      ctx.lineTo(-this.size * 0.6, this.size);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Mouse move handler
  window.addEventListener('mousemove', (e) => {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const dx = mouse.x - mouse.prevX;
    const dy = mouse.y - mouse.prevY;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);

    // Spawn sand ripple particles on move
    const count = Math.min(Math.floor(mouse.speed * 0.35) + 1, 4);
    if (particles.length < MAX_PARTICLES) {
      for (let i = 0; i < count; i++) {
        particles.push(new SandParticle(mouse.x, mouse.y, dx, dy));
      }
    }
  });

  // Interactive element magnetic attraction & cursor expansion
  function setupHoverEffects() {
    const interactives = document.querySelectorAll(
      'a, button, input, .driver-card, .sat-tab-btn, .case-tab-btn, .option-radio-btn, .state-path, .layer-btn'
    );

    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('active');
        if (el.classList.contains('btn-rust') || el.dataset.cursor === 'rust') {
          cursorRing.classList.add('danger');
        } else if (el.classList.contains('btn-green') || el.dataset.cursor === 'green') {
          cursorRing.classList.add('green');
        }
      });

      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('active', 'danger', 'green');
      });
    });
  }

  // Animation Loop
  function render() {
    // Smooth magnetic lag for ring
    ring.x += (mouse.x - ring.x) * 0.16;
    ring.y += (mouse.y - ring.y) * 0.16;

    // Instant/tight tracking for dot
    dot.x += (mouse.x - dot.x) * 0.65;
    dot.y += (mouse.y - dot.y) * 0.65;

    cursorRing.style.left = `${ring.x}px`;
    cursorRing.style.top = `${ring.y}px`;

    cursorDot.style.left = `${dot.x}px`;
    cursorDot.style.top = `${dot.y}px`;

    // Clear Canvas & Draw Particles
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupHoverEffects();
    render();
  });

  // Expose re-bind for dynamically generated elements
  window.refreshCursorHover = setupHoverEffects;
})();
