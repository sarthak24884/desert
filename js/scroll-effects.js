/**
 * Typing & Advanced Scroll Effects Engine
 * - Dynamic cyclical typewriter for hero telemetry & subtitles
 * - Scroll progress indicator at viewport top
 * - Scroll-triggered element reveal animations (IntersectionObserver)
 * - Scrollspy navigation link highlighting
 * - Floating smooth back-to-top button
 */

(function () {
  'use strict';

  // ==========================================
  // 1. DYNAMIC TYPEWRITER EFFECT
  // ==========================================
  function initTypewriter() {
    const textEl = document.getElementById('typewriter-text');
    if (!textEl) return;

    const phrases = [
      "Geographical Changes & Effects (2000–Present)",
      "97.85 Million Hectares Under Severe Degradation",
      "29.77% of National Land Surface Compromised",
      "Shifting Barchan Dunes of the Thar Basin",
      "Cryospheric Glacial Recession in Ladakh",
      "Black Soil Cracking & Salinity in the Deccan",
      "Targeting 26M Hectares Restored by 2030 (LDN)"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 65; // ms per char

    function tick() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 30; // faster delete
      } else {
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 65;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end of phrase
        isDeleting = true;
        typingSpeed = 1800;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 450;
      }

      setTimeout(tick, typingSpeed);
    }

    tick();
  }

  // ==========================================
  // 2. SCROLL PROGRESS INDICATOR
  // ==========================================
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress-bar');
    if (!progressBar) return;

    function updateProgress() {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = `${scrolled}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ==========================================
  // 3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.telemetry-card, .gis-container, .trends-dashboard, .driver-card, .soil-column-card, .table-responsive-box, .case-detail-panel, .calc-grid, .section-header'
    );

    revealElements.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      // Stagger delay for cards in same grid
      if (el.classList.contains('telemetry-card') || el.classList.contains('driver-card')) {
        el.style.transitionDelay = `${(index % 4) * 0.1}s`;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ==========================================
  // 4. SCROLLSPY (ACTIVE NAV HIGHLIGHTING)
  // ==========================================
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNav() {
      const scrollPos = window.pageYOffset + 200;

      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
  }

  // ==========================================
  // 5. BACK-TO-TOP BUTTON
  // ==========================================
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 450) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Initialize all effects
  document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initScrollProgress();
    initScrollReveal();
    initScrollSpy();
    initBackToTop();
  });
})();
