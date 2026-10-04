/**
 * 3D Physics Tilt & Specular Glare Engine
 * Smooth gyro-like card tilting with mouse position calculation
 */

(function () {
  'use strict';

  function initTilt() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach((card) => {
      let bounds = card.getBoundingClientRect();
      let mouseX = 0;
      let mouseY = 0;
      let isHovered = false;

      function onMouseMove(e) {
        bounds = card.getBoundingClientRect();
        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;

        const xPct = (mouseX / bounds.width - 0.5) * 2; // -1 to 1
        const yPct = (mouseY / bounds.height - 0.5) * 2;

        const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || '12');
        const rotateX = -yPct * maxTilt;
        const rotateY = xPct * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
        card.style.setProperty('--mouse-x', `${(mouseX / bounds.width * 100).toFixed(1)}%`);
        card.style.setProperty('--mouse-y', `${(mouseY / bounds.height * 100).toFixed(1)}%`);
      }

      function onMouseEnter() {
        isHovered = true;
        card.style.transition = 'transform 0.1s ease-out';
      }

      function onMouseLeave() {
        isHovered = false;
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      }

      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mouseleave', onMouseLeave);
    });
  }

  document.addEventListener('DOMContentLoaded', initTilt);
  window.refreshTilt = initTilt;
})();
