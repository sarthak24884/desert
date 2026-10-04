/**
 * Main Application Orchestrator
 * Coordinates Live Telemetry Counters, Multi-layer Parallax, Case Studies Canvas Art,
 * Ambient Dust Particles, and Navigation.
 */

(function () {
  'use strict';

  // 1. Live Animated Counters on Scroll
  function initCounters() {
    const counterElements = document.querySelectorAll('[data-counter-target]');
    if (!counterElements.length) return;

    let hasRun = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun) {
            hasRun = true;
            animateAllCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    const banner = document.querySelector('.telemetry-banner');
    if (banner) observer.observe(banner);

    function animateAllCounters() {
      counterElements.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-counter-target'));
        const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
        const duration = 2000;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = (ease * target).toFixed(decimals);

          el.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target.toFixed(decimals);
          }
        }

        requestAnimationFrame(update);
      });
    }
  }

  // 2. Multi-layer Parallax Engine
  function initParallax() {
    const parallaxItems = document.querySelectorAll('[data-speed]');
    if (!parallaxItems.length) return;

    function onScroll() {
      const scrollY = window.pageYOffset;
      parallaxItems.forEach((item) => {
        const speed = parseFloat(item.getAttribute('data-speed') || '0.2');
        const offset = scrollY * speed;
        item.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 3. Ambient Dust Motes Canvas
  function initAmbientDust() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const motes = [];
    const COUNT = 45;

    for (let i = 0; i < COUNT; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4 + 0.15,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? 'rgba(224, 192, 151,' : 'rgba(200, 90, 50,'
      });
    }

    function renderDust() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < COUNT; i++) {
        const m = motes[i];
        m.x += m.vx;
        m.y += m.vy;

        if (m.x < 0) m.x = w;
        if (m.x > w) m.x = 0;
        if (m.y < 0) m.y = h;
        if (m.y > h) m.y = 0;

        ctx.fillStyle = `${m.color} ${m.alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(renderDust);
    }

    renderDust();
  }

  // 4. Case Studies Tab & Canvas Art Painter
  function initCaseStudies() {
    const tabs = document.querySelectorAll('.case-tab-btn');
    const panels = document.querySelectorAll('.case-detail-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.dataset.case;
        const panel = document.getElementById(`case-${targetId}`);
        if (panel) {
          panel.classList.add('active');
          drawCaseArtwork(targetId);
        }
      });
    });

    // View Switcher (Photo vs Canvas Schematic)
    const switchBtns = document.querySelectorAll('.case-switch-btn');
    switchBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const parentSwitch = btn.closest('.case-view-switch');
        if (!parentSwitch) return;
        parentSwitch.querySelectorAll('.case-switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const imgId = btn.dataset.img;
        const img = document.getElementById(imgId);
        if (img) {
          if (btn.textContent.includes('Photo')) {
            img.classList.remove('hidden');
          } else {
            img.classList.add('hidden');
          }
        }
      });
    });


    // Draw visual backdrop canvases for each case study
    function drawCaseArtwork(caseKey) {
      if (caseKey === 'thar') drawTharArtwork();
      else if (caseKey === 'ladakh') drawLadakhArtwork();
      else if (caseKey === 'deccan') drawDeccanArtwork();
    }

    function drawTharArtwork() {
      const c = document.getElementById('canvas-case-thar');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = (c.width = 600);
      const h = (c.height = 480);

      // Sunset desert sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#1c100b');
      sky.addColorStop(0.4, '#381c10');
      sky.addColorStop(0.8, '#5d2d18');
      sky.addColorStop(1, '#8c4820');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Distant dunes
      ctx.fillStyle = '#6d3516';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      ctx.quadraticCurveTo(w * 0.3, h * 0.45, w * 0.6, h * 0.6);
      ctx.quadraticCurveTo(w * 0.85, h * 0.7, w, h * 0.55);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Foreground sand ridge
      ctx.fillStyle = '#9e4e20';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.75);
      ctx.quadraticCurveTo(w * 0.45, h * 0.65, w, h * 0.8);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Green Khejri trees & shelterbelt rows
      for (let t = 0; t < 14; t++) {
        const tx = 40 + t * 40;
        const ty = h * 0.73 + Math.sin(t) * 15;
        // Trunk
        ctx.strokeStyle = '#27170e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx, ty - 28);
        ctx.stroke();

        // Canopy
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(tx, ty - 32, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#43a047';
        ctx.beginPath();
        ctx.arc(tx - 3, ty - 34, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawLadakhArtwork() {
      const c = document.getElementById('canvas-case-ladakh');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = (c.width = 600);
      const h = (c.height = 480);

      // High altitude azure sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0c1626');
      sky.addColorStop(0.5, '#192b45');
      sky.addColorStop(1, '#2c4366');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Himalayan snow peaks
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w * 0.25, h * 0.2);
      ctx.lineTo(w * 0.5, h * 0.4);
      ctx.lineTo(w * 0.75, h * 0.15);
      ctx.lineTo(w, h * 0.38);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Cold gravel scree slope
      ctx.fillStyle = '#37474f';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.6);
      ctx.lineTo(w, h * 0.52);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // The Conical Ice Stupa!
      const stupaX = w * 0.5;
      const stupaBase = h * 0.88;
      const stupaGrad = ctx.createLinearGradient(stupaX, stupaBase - 140, stupaX, stupaBase);
      stupaGrad.addColorStop(0, '#ffffff');
      stupaGrad.addColorStop(0.6, '#b2ebf2');
      stupaGrad.addColorStop(1, '#80deea');

      ctx.fillStyle = stupaGrad;
      ctx.beginPath();
      ctx.moveTo(stupaX, stupaBase - 150); // peak
      ctx.quadraticCurveTo(stupaX + 35, stupaBase - 70, stupaX + 85, stupaBase);
      ctx.lineTo(stupaX - 85, stupaBase);
      ctx.quadraticCurveTo(stupaX - 35, stupaBase - 70, stupaX, stupaBase - 150);
      ctx.fill();

      // Tibetan prayer flags strung across
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(stupaX - 120, stupaBase - 90);
      ctx.quadraticCurveTo(stupaX, stupaBase - 130, stupaX + 120, stupaBase - 90);
      ctx.stroke();

      const flagColors = ['#1e88e5', '#ffffff', '#e53935', '#43a047', '#fbc02d'];
      for (let f = 0; f < 10; f++) {
        ctx.fillStyle = flagColors[f % 5];
        ctx.fillRect(stupaX - 110 + f * 22, stupaBase - 110 + Math.sin(f) * 8, 12, 10);
      }
    }

    function drawDeccanArtwork() {
      const c = document.getElementById('canvas-case-deccan');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = (c.width = 600);
      const h = (c.height = 480);

      // Scorched Deccan monsoon cloud sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#1a1917');
      sky.addColorStop(0.6, '#2d271f');
      sky.addColorStop(1, '#4a3824');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Terraced basalt plateau
      ctx.fillStyle = '#211c18';
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Contour Bunding & Rainwater Trenches (IWMP)
      ctx.strokeStyle = '#388e3c';
      ctx.lineWidth = 4;
      for (let step = 0; step < 5; step++) {
        const y = h * 0.5 + step * 38;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(w * 0.5, y + 15, w, y);
        ctx.stroke();

        // Small farm pond / micro catchment
        ctx.fillStyle = '#0288d1';
        ctx.beginPath();
        ctx.ellipse(w * 0.35 + step * 40, y + 18, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initial draw
    drawTharArtwork();
  }

  // 5. Navigation scroll class toggle
  function initNav() {
    const nav = document.querySelector('.nav-header');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    initParallax();
    initAmbientDust();
    initCaseStudies();
    initNav();
  });
})();
