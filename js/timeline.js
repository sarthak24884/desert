/**
 * Interactive Timeline & Scroll Progress Engine
 * Tracks national milestones from ISRO 2003 Atlas to 2030 LDN Target
 */

(function () {
  'use strict';

  function initTimeline() {
    const timelineSection = document.querySelector('.timeline-section');
    const progressBar = document.querySelector('.timeline-progress-bar');
    const nodes = document.querySelectorAll('.timeline-node');

    if (!timelineSection || !progressBar) return;

    function handleScroll() {
      const rect = timelineSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress percentage inside timeline section
      const start = rect.top - windowHeight * 0.5;
      const total = rect.height;
      const progress = Math.max(0, Math.min(1, -start / total));

      progressBar.style.height = `${(progress * 100).toFixed(1)}%`;

      // Activate nodes as progress line reaches them
      nodes.forEach((node) => {
        const nodeRect = node.getBoundingClientRect();
        if (nodeRect.top < windowHeight * 0.65) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  document.addEventListener('DOMContentLoaded', initTimeline);
})();
