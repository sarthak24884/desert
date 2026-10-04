/**
 * Flow Effects Engine:
 * 1. Opening Sand Flow Storm Transition & Hero Dune Wind Stream
 * 2. Ending Leaf Flow in Air (Foliage & Tree Cover Regeneration Breeze)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. OPENING SAND FLOW EFFECT (INTRO CURTAIN & HERO STREAM)
  // =========================================================================
  const SandFlowEngine = {
    introCanvas: null,
    introCtx: null,
    heroCanvas: null,
    heroCtx: null,
    overlay: null,
    particles: [],
    heroParticles: [],
    animId: null,
    heroAnimId: null,
    progress: 0,
    isActive: true,
    isDismissed: false,

    init() {
      this.overlay = document.getElementById('sand-intro-overlay');
      this.introCanvas = document.getElementById('sand-intro-canvas');
      this.heroCanvas = document.getElementById('hero-sand-canvas');

      if (!this.overlay || !this.introCanvas) return;
      this.introCtx = this.introCanvas.getContext('2d');

      if (this.heroCanvas) {
        this.heroCtx = this.heroCanvas.getContext('2d');
      }

      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Create Intro Sand Particles (500 grains)
      this.particles = [];
      const count = window.innerWidth < 768 ? 260 : 550;
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(true));
      }

      // Create Continuous Hero Sand Particles (120 grains)
      if (this.heroCanvas) {
        this.heroParticles = [];
        const hCount = window.innerWidth < 768 ? 60 : 130;
        for (let i = 0; i < hCount; i++) {
          this.heroParticles.push(this.createHeroParticle());
        }
        this.startHeroLoop();
      }

      // Bind Skip / Enter button
      const skipBtn = document.getElementById('skip-intro-btn');
      if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dismiss();
        });
      }

      // Clicking anywhere on the intro overlay smoothly dismisses it
      this.overlay.addEventListener('click', () => {
        this.dismiss();
      });

      // Bind Replay Button if present
      const replayBtn = document.getElementById('replay-sand-btn');
      if (replayBtn) {
        replayBtn.addEventListener('click', () => this.replay());
      }

      // Start intro animation
      this.startIntroLoop();
      this.simulateLoading();
    },

    resize() {
      if (this.introCanvas) {
        this.introCanvas.width = window.innerWidth;
        this.introCanvas.height = window.innerHeight;
      }
      if (this.heroCanvas && this.heroCanvas.parentElement) {
        this.heroCanvas.width = this.heroCanvas.parentElement.clientWidth || window.innerWidth;
        this.heroCanvas.height = this.heroCanvas.parentElement.clientHeight || window.innerHeight;
      }
    },

    createParticle(randomX = false) {
      const w = this.introCanvas ? this.introCanvas.width : window.innerWidth;
      const h = this.introCanvas ? this.introCanvas.height : window.innerHeight;

      // Color palette of authentic desert sands:
      // Gold, light sand, terracotta dust, deep amber dune
      const colors = [
        'rgba(224, 192, 151, ', // Sand gold
        'rgba(247, 231, 206, ', // Sunlit bleached sand
        'rgba(200, 90, 50, ',   // Terracotta dust
        'rgba(212, 163, 115, ', // Warm dune
        'rgba(255, 217, 102, '  // Desert sun glow
      ];

      return {
        x: randomX ? Math.random() * w : -Math.random() * 80 - 10,
        y: Math.random() * h,
        vx: Math.random() * 8 + 6, // fast horizontal stream
        vy: (Math.random() - 0.5) * 2.5 + Math.sin(Math.random() * Math.PI) * 0.8,
        length: Math.random() * 24 + 8, // grain streak length
        thickness: Math.random() * 2.2 + 0.8,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.75 + 0.25,
        waveFreq: Math.random() * 0.03 + 0.01,
        waveAmp: Math.random() * 2.5 + 0.8
      };
    },

    createHeroParticle() {
      const w = this.heroCanvas ? this.heroCanvas.width : window.innerWidth;
      const h = this.heroCanvas ? this.heroCanvas.height : 600;

      const colors = [
        'rgba(224, 192, 151, ',
        'rgba(247, 231, 206, ',
        'rgba(200, 90, 50, '
      ];

      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.random() * 3.5 + 2.0,
        vy: (Math.random() - 0.5) * 1.2,
        length: Math.random() * 14 + 5,
        thickness: Math.random() * 1.8 + 0.6,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.35 + 0.1,
        waveFreq: Math.random() * 0.02 + 0.008,
        waveAmp: Math.random() * 1.5 + 0.5
      };
    },

    startIntroLoop() {
      let t = 0;
      const render = () => {
        if (!this.isActive) return;
        t += 0.05;

        const ctx = this.introCtx;
        const w = this.introCanvas.width;
        const h = this.introCanvas.height;

        // Semi-transparent clearing for motion streak blur
        ctx.fillStyle = 'rgba(12, 14, 18, 0.28)';
        ctx.fillRect(0, 0, w, h);

        // Draw flowing wind currents (harmonic undulating stream bands)
        ctx.lineWidth = 1;
        for (let b = 0; b < 4; b++) {
          ctx.beginPath();
          const bandY = (h * (b + 1)) / 5;
          ctx.strokeStyle = `rgba(224, 192, 151, ${0.05 + b * 0.02})`;
          ctx.moveTo(0, bandY + Math.sin(t + b) * 35);
          for (let x = 0; x <= w; x += 40) {
            const y = bandY + Math.sin(x * 0.004 + t * 1.5 + b) * (30 + b * 10);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Draw and update sand particles
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];

          p.x += p.vx;
          p.y += p.vy + Math.sin(p.x * p.waveFreq + t) * p.waveAmp;

          // Draw sand grain streak
          ctx.strokeStyle = `${p.colorBase}${p.alpha})`;
          ctx.lineWidth = p.thickness;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.length, p.y - p.vy * 1.5);
          ctx.stroke();

          // Reset if beyond screen
          if (p.x > w + 40) {
            p.x = -p.length - Math.random() * 50;
            p.y = Math.random() * h;
            p.vx = Math.random() * 9 + 6;
          }
        }

        this.animId = requestAnimationFrame(render);
      };

      this.animId = requestAnimationFrame(render);
    },

    startHeroLoop() {
      let t = 0;
      const render = () => {
        if (!this.heroCtx || !this.heroCanvas) return;
        t += 0.03;

        const ctx = this.heroCtx;
        const w = this.heroCanvas.width;
        const h = this.heroCanvas.height;

        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < this.heroParticles.length; i++) {
          const p = this.heroParticles[i];

          p.x += p.vx;
          p.y += p.vy + Math.sin(p.x * p.waveFreq + t) * p.waveAmp;

          ctx.strokeStyle = `${p.colorBase}${p.alpha})`;
          ctx.lineWidth = p.thickness;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.length, p.y);
          ctx.stroke();

          if (p.x > w + 20) {
            p.x = -p.length - 10;
            p.y = Math.random() * h;
          }
        }

        this.heroAnimId = requestAnimationFrame(render);
      };

      this.heroAnimId = requestAnimationFrame(render);
    },

    simulateLoading() {
      const progressBar = document.getElementById('sand-progress-fill');
      const statusText = document.getElementById('sand-status-text');

      const statuses = [
        "Streaming Thar wind vectors...",
        "Calibrating ISRO SAC multi-spectral bands...",
        "Mapping shifting barchan dunes...",
        "Synthesizing soil erosion indices...",
        "Desert telemetry online. Unveiling portal..."
      ];

      const interval = setInterval(() => {
        if (this.isDismissed) {
          clearInterval(interval);
          return;
        }

        this.progress += Math.floor(Math.random() * 14) + 8;
        if (this.progress > 100) this.progress = 100;

        if (progressBar) {
          progressBar.style.width = `${this.progress}%`;
        }

        const statusIdx = Math.min(
          statuses.length - 1,
          Math.floor((this.progress / 100) * statuses.length)
        );
        if (statusText) {
          statusText.textContent = statuses[statusIdx];
        }

        if (this.progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            this.dismiss();
          }, 400);
        }
      }, 140);
    },

    dismiss() {
      if (this.isDismissed) return;
      this.isDismissed = true;

      if (this.overlay) {
        this.overlay.classList.add('fade-out');
        setTimeout(() => {
          this.overlay.style.display = 'none';
          this.isActive = false;
          if (this.animId) cancelAnimationFrame(this.animId);
        }, 850);
      }
    },

    replay() {
      if (!this.overlay) return;
      this.isDismissed = false;
      this.isActive = true;
      this.progress = 0;
      this.overlay.style.display = 'flex';
      this.overlay.classList.remove('fade-out');

      this.resize();
      this.startIntroLoop();
      this.simulateLoading();
    }
  };

  // =========================================================================
  // 2. ENDING LEAF FLOW IN AIR EFFECT (RESTORATION & GREENING BREEZE)
  // =========================================================================
  const LeafFlowEngine = {
    canvas: null,
    ctx: null,
    leaves: [],
    animId: null,
    isActive: false,
    mouse: { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 },
    windForce: 1.0,

    // Species color & geometry templates
    LEAF_PRESETS: [
      {
        name: 'Neem (Azadirachta indica)',
        type: 'lanceolate',
        colorFront: '#2E7D32',
        colorBack: '#43A047',
        veinColor: '#A5D6A7',
        sizeBase: 26,
        ratio: 0.38
      },
      {
        name: 'Khejri (Prosopis cineraria)',
        type: 'elliptic',
        colorFront: '#4CAF50',
        colorBack: '#81C784',
        veinColor: '#C8E6C9',
        sizeBase: 22,
        ratio: 0.44
      },
      {
        name: 'Fresh Sprout Foliage',
        type: 'broad',
        colorFront: '#388E3C',
        colorBack: '#66BB6A',
        veinColor: '#DCEDC8',
        sizeBase: 28,
        ratio: 0.52
      },
      {
        name: 'Willow (Salix alba)',
        type: 'slender',
        colorFront: '#1B5E20',
        colorBack: '#2E7D32',
        veinColor: '#81C784',
        sizeBase: 32,
        ratio: 0.28
      }
    ],

    init() {
      this.canvas = document.getElementById('leaf-flow-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Track mouse breeze interaction
      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.vx = (e.clientX - this.mouse.lastX) * 0.15;
        this.mouse.vy = (e.clientY - this.mouse.lastY) * 0.15;
        this.mouse.lastX = e.clientX;
        this.mouse.lastY = e.clientY;
      });

      // Spawn initial floating leaves (40 leaves)
      const count = window.innerWidth < 768 ? 22 : 46;
      this.leaves = [];
      for (let i = 0; i < count; i++) {
        this.leaves.push(this.createLeaf(true));
      }

      // Check scroll position to activate leaves gracefully as user approaches end
      this.setupScrollTrigger();

      // Flurry / Gust Button
      const gustBtn = document.getElementById('leaf-gust-btn');
      if (gustBtn) {
        gustBtn.addEventListener('click', () => this.triggerGust());
      }

      this.startLoop();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createLeaf(randomPosition = false) {
      const w = this.canvas ? this.canvas.width : window.innerWidth;
      const h = this.canvas ? this.canvas.height : window.innerHeight;

      const preset = this.LEAF_PRESETS[Math.floor(Math.random() * this.LEAF_PRESETS.length)];
      const scale = Math.random() * 0.6 + 0.7;

      return {
        preset: preset,
        x: randomPosition ? Math.random() * w : -50 - Math.random() * 100,
        y: randomPosition ? Math.random() * h : Math.random() * (h * 0.9),
        // Horizontal drift + subtle downward gravity
        vx: Math.random() * 2.2 + 1.2,
        vy: Math.random() * 0.9 + 0.4,
        size: preset.sizeBase * scale,
        ratio: preset.ratio,
        // 3D rotation & flutter tumbling angles
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.04,
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: Math.random() * 0.05 + 0.02,
        // Harmonic wind wave parameters
        swayFreq: Math.random() * 0.03 + 0.015,
        swayAmp: Math.random() * 1.8 + 0.8,
        swayPhase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.45 + 0.55
      };
    },

    setupScrollTrigger() {
      // Monitor scroll position: when in lower 50% of the document (Restoration, Eco-game, Footer),
      // the leaf canvas opacity ramps up smoothly.
      const updateLeafVisibility = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPct = scrollY / Math.max(1, totalHeight);

        // Turn on when scrolled past 45% of page (restoration & eco-game onwards)
        if (scrollPct > 0.42) {
          if (!this.isActive) {
            this.isActive = true;
            this.canvas.style.opacity = '1';
          }
        } else {
          if (this.isActive) {
            this.isActive = false;
            this.canvas.style.opacity = '0';
          }
        }
      };

      window.addEventListener('scroll', updateLeafVisibility, { passive: true });
      updateLeafVisibility();
    },

    triggerGust() {
      this.windForce = 2.8;
      this.leaves.forEach((l) => {
        l.vx += Math.random() * 4 + 2;
        l.vy -= Math.random() * 2.5 + 1; // updraft
        l.flipSpeed *= 1.8;
      });

      setTimeout(() => {
        this.windForce = 1.0;
      }, 1500);
    },

    drawLeaf(leaf, ctx) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);

      // 3D Flip effect (scale Y or X according to cosine of flip angle)
      const flipFactor = Math.cos(leaf.flipAngle);
      const isBack = flipFactor < 0;
      ctx.scale(1, flipFactor);

      const color = isBack ? leaf.preset.colorBack : leaf.preset.colorFront;
      const length = leaf.size;
      const width = leaf.size * leaf.ratio;

      // Soft leaf drop shadow
      ctx.shadowColor = 'rgba(0, 30, 10, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      // Leaf Blade Path (Bezier curves)
      ctx.beginPath();
      ctx.moveTo(-length * 0.4, 0); // stem base
      // Top curved contour
      ctx.bezierCurveTo(
        -length * 0.1, -width,
        length * 0.35, -width * 0.9,
        length * 0.6, 0 // tip
      );
      // Bottom curved contour
      ctx.bezierCurveTo(
        length * 0.35, width * 0.9,
        -length * 0.1, width,
        -length * 0.4, 0
      );
      ctx.closePath();

      // Leaf Gradient Fill (sunlit chlorophyll)
      const grad = ctx.createLinearGradient(-length * 0.4, 0, length * 0.6, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(0.6, isBack ? '#81C784' : '#4CAF50');
      grad.addColorStop(1, '#81C784');

      ctx.fillStyle = grad;
      ctx.globalAlpha = leaf.opacity;
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Central Leaf Midrib Vein
      ctx.strokeStyle = leaf.preset.veinColor;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-length * 0.45, 0);
      ctx.quadraticCurveTo(0, -width * 0.05, length * 0.58, 0);
      ctx.stroke();

      // Subtle lateral veins
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      for (let v = 0.2; v <= 0.8; v += 0.25) {
        const vx = -length * 0.4 + length * v;
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.lineTo(vx + length * 0.08, -width * 0.45);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.lineTo(vx + length * 0.08, width * 0.45);
        ctx.stroke();
      }

      ctx.restore();
    },

    startLoop() {
      let t = 0;
      const render = () => {
        t += 0.04;

        if (this.ctx && this.canvas && this.isActive) {
          const w = this.canvas.width;
          const h = this.canvas.height;

          this.ctx.clearRect(0, 0, w, h);

          for (let i = 0; i < this.leaves.length; i++) {
            const l = this.leaves[i];

            // Wind & sway physics
            const sway = Math.sin(t * l.swayFreq * 60 + l.swayPhase) * l.swayAmp;
            l.x += l.vx * this.windForce + sway * 0.5;
            l.y += l.vy + sway * 0.6;

            // Rotation updates
            l.angle += l.angleSpeed;
            l.flipAngle += l.flipSpeed;

            // Mouse breeze interaction (leaves swerve around cursor)
            const dx = l.x - this.mouse.x;
            const dy = l.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              l.x += (dx / dist) * force * 5 + this.mouse.vx;
              l.y += (dy / dist) * force * 5 + this.mouse.vy;
              l.angleSpeed += 0.02;
            }

            // Draw the leaf
            this.drawLeaf(l, this.ctx);

            // Recycle leaf when it travels past right edge or off bottom
            if (l.x > w + 60 || l.y > h + 60) {
              l.x = -60 - Math.random() * 80;
              l.y = Math.random() * (h * 0.95);
              l.vx = Math.random() * 2.2 + 1.2;
              l.vy = Math.random() * 0.9 + 0.4;
            }
          }
        }

        this.animId = requestAnimationFrame(render);
      };

      this.animId = requestAnimationFrame(render);
    }
  };

  // Expose triggers globally for testing and interactive controls
  window.SandFlowEngine = SandFlowEngine;
  window.LeafFlowEngine = LeafFlowEngine;

  // Initialize both engines when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    SandFlowEngine.init();
    LeafFlowEngine.init();
  });
})();
