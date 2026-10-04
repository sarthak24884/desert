/**
 * Decadal Land Degradation & Geospatial Trends Graph
 * Replaces the slider with an interactive scientific multi-series analytics dashboard.
 */

(function () {
  'use strict';

  const datasets = {
    thar: {
      title: "Thar Desert Fringe (Jodhpur–Bikaner Corridor)",
      coords: "27.18° N, 72.82° E • ISRO SAC & Landsat Time-Series",
      image: "assets/satellite_thar_greening.jpg",
      imageCaption: "Orbital Multi-Spectral View: Indira Gandhi Canal Green Belt vs Shifting Dunes",
      years: ['2000', '2004', '2008', '2012', '2016', '2020', '2024'],
      // Degraded Area in 10,000 Hectares
      degradedArea: [182, 194, 205, 214, 218, 222, 226],
      // NDVI Vegetation Health (0 to 1 scale)
      ndvi: [0.38, 0.40, 0.43, 0.49, 0.53, 0.58, 0.62],
      // Land Surface Temp Anomaly (°C above baseline)
      tempAnomaly: [0.0, 0.8, 1.4, 1.9, 2.7, 3.2, 3.8],
      metrics: [
        { label: "Total Degraded Area", val: "2.26M ha", change: "+24.1% since 2000" },
        { label: "Canopy NDVI (Canal Belt)", val: "0.62", change: "+63% recovered" },
        { label: "Dune Migration Rate", val: "3.2 km", change: "Eastward drift" },
        { label: "Groundwater Table", val: "-18.5m", change: "Critical over-draft" }
      ],
      narrative: "Multi-decadal satellite telemetry reveals a persistent eastward expansion of shifting barchan sand dunes along non-sheltered tracts. However, shelterbelt afforestation along the Indira Gandhi Canal has successfully stabilized over 180,000 hectares of previously active dune corridors."
    },
    sambhar: {
      title: "Sambhar Salt Lake Basin (Rajasthan)",
      coords: "26.90° N, 75.05° E • Hydro-Spectral Satellite Radar",
      image: "assets/thar_shelterbelt.jpg",
      imageCaption: "Saline Basin & Lake Shoreline Desiccation Zone",
      years: ['2000', '2004', '2008', '2012', '2016', '2020', '2024'],
      degradedArea: [48, 56, 64, 71, 78, 83, 89],
      ndvi: [0.32, 0.29, 0.26, 0.23, 0.21, 0.19, 0.17],
      tempAnomaly: [0.0, 0.6, 1.2, 2.1, 2.9, 3.6, 4.2],
      metrics: [
        { label: "Wetland Area Loss", val: "-42.4%", change: "Since 2000" },
        { label: "Halite Crust Area", val: "89,000 ha", change: "+85% expansion" },
        { label: "Vegetation Index", val: "0.17", change: "-46% decline" },
        { label: "Surface Temperature", val: "+4.2°C", change: "Thermal elevation" }
      ],
      narrative: "Uncontrolled groundwater extraction for commercial salt pans combined with hydrological stream bunding has reduced the natural wetland by 42% since 2000, leaving extensive hyper-saline crusts that generate alkaline dust storms."
    },
    deccan: {
      title: "Deccan Plateau (Marathwada Rainshadow)",
      coords: "19.03° N, 75.78° E • Resourcesat-2A & LISS-III Time-Series",
      image: "assets/deccan_watershed.jpg",
      imageCaption: "Deccan Plateau: Contour Trenching & Regur Soil Conservation",
      years: ['2000', '2004', '2008', '2012', '2016', '2020', '2024'],
      degradedArea: [112, 126, 134, 148, 155, 142, 138],
      ndvi: [0.44, 0.41, 0.38, 0.35, 0.32, 0.46, 0.51],
      tempAnomaly: [0.0, 0.5, 1.1, 1.8, 2.4, 2.1, 1.9],
      metrics: [
        { label: "Sheet Erosion Rate", val: "24 t/ha/yr", change: "Severe runoff" },
        { label: "IWMP Interventions", val: "138,000 ha", change: "Treated basins" },
        { label: "Soil Carbon (SOC)", val: "0.48%", change: "+35% in CCT plots" },
        { label: "Water Recharge", val: "+2.8m", change: "In pond micro-zones" }
      ],
      narrative: "Successive drought cycles and sugarcane water depletion accelerated topsoil sheet wash. The implementation of Integrated Watershed Management (IWMP), continuous contour trenches, and farm ponds reversed degradation across 138,000 hectares."
    },
    ladakh: {
      title: "Ladakh Cold Desert (Phyang & Leh Valleys)",
      coords: "34.18° N, 77.49° E • Cryospheric Satellite Observation",
      image: "assets/ladakh_ice_stupa.jpg",
      imageCaption: "Phyang Valley: Artificial Glacier Ice Stupa & High-Altitude Oases",
      years: ['2000', '2004', '2008', '2012', '2016', '2020', '2024'],
      degradedArea: [28, 31, 33, 35, 37, 36, 34],
      ndvi: [0.12, 0.13, 0.14, 0.15, 0.17, 0.22, 0.26],
      tempAnomaly: [0.0, 0.7, 1.3, 2.0, 2.6, 3.1, 3.6],
      metrics: [
        { label: "Glacial Snout Retreat", val: "280 meters", change: "Since 2000" },
        { label: "Ice Stupa Water Storage", val: "4.5M Liters", change: "Per cone" },
        { label: "Willow/Seabuckthorn", val: "150,000 trees", change: "Afforested" },
        { label: "Spring Water Deficit", val: "-65% solved", change: "Via micro-glaciers" }
      ],
      narrative: "Glacial snout retreat of up to 280m severely cut early spring meltwater for barley farming. Pioneer deployment of conical Ice Stupas has stored millions of liters of winter stream runoff, establishing thriving green oases across barren gravel moraines."
    }
  };

  let activeRegionKey = 'thar';

  function initAnalyticsGraph() {
    const canvas = document.getElementById('trends-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tabBtns = document.querySelectorAll('.trends-tab-btn');

    function renderChart(regionKey) {
      const data = datasets[regionKey];
      if (!data) return;

      const w = (canvas.width = canvas.parentElement.clientWidth || 750);
      const h = (canvas.height = 420);

      // Deep dark charcoal card canvas
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#131822');
      bg.addColorStop(1, '#0c0f16');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const xPad = 65;
      const yPad = 60;
      const plotW = w - xPad * 2;
      const plotH = h - yPad * 2;

      // Draw Grid & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      // 5 Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = yPad + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(xPad, y);
        ctx.lineTo(w - xPad, y);
        ctx.stroke();

        // Left Y-axis label: Degraded Area index
        ctx.fillStyle = 'rgba(200, 90, 50, 0.8)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        const degMax = Math.max(...data.degradedArea) * 1.15;
        const degVal = Math.round(degMax * (1 - i / 4));
        ctx.fillText(`${degVal}k ha`, xPad - 8, y + 4);

        // Right Y-axis label: NDVI
        ctx.fillStyle = 'rgba(129, 199, 132, 0.8)';
        ctx.textAlign = 'left';
        const ndviVal = (1.0 - i * 0.25).toFixed(2);
        ctx.fillText(`NDVI ${ndviVal}`, w - xPad + 8, y + 4);
      }

      // Vertical year lines
      for (let j = 0; j < data.years.length; j++) {
        const x = xPad + (plotW / (data.years.length - 1)) * j;
        ctx.beginPath();
        ctx.moveTo(x, yPad);
        ctx.lineTo(x, h - yPad);
        ctx.stroke();

        ctx.fillStyle = 'rgba(160, 174, 192, 0.8)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(data.years[j], x, h - yPad + 22);
      }

      // Title & Telemetry info
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Syne", sans-serif';
      ctx.fillText(`📊 DECADAL DEGRADATION & CANOPY TRENDS (${data.title})`, xPad, 28);

      ctx.fillStyle = 'rgba(224, 192, 151, 0.85)';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText(`${data.coords}`, xPad, 46);

      // Curve 1: Degraded Area (Terracotta Rust with shaded area)
      const degMax = Math.max(...data.degradedArea) * 1.15;
      const degPoints = data.degradedArea.map((val, idx) => ({
        x: xPad + (plotW / (data.years.length - 1)) * idx,
        y: yPad + plotH * (1 - val / degMax)
      }));

      // Shaded area
      const degAreaGrad = ctx.createLinearGradient(0, yPad, 0, h - yPad);
      degAreaGrad.addColorStop(0, 'rgba(200, 90, 50, 0.35)');
      degAreaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = degAreaGrad;
      ctx.beginPath();
      ctx.moveTo(degPoints[0].x, h - yPad);
      ctx.lineTo(degPoints[0].x, degPoints[0].y);
      for (let i = 1; i < degPoints.length; i++) {
        const xc = (degPoints[i].x + degPoints[i - 1].x) / 2;
        const yc = (degPoints[i].y + degPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(degPoints[i - 1].x, degPoints[i - 1].y, xc, yc);
      }
      ctx.lineTo(degPoints[degPoints.length - 1].x, degPoints[degPoints.length - 1].y);
      ctx.lineTo(degPoints[degPoints.length - 1].x, h - yPad);
      ctx.closePath();
      ctx.fill();

      // Line
      ctx.strokeStyle = '#FF7043';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#FF7043';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(degPoints[0].x, degPoints[0].y);
      for (let i = 1; i < degPoints.length; i++) {
        const xc = (degPoints[i].x + degPoints[i - 1].x) / 2;
        const yc = (degPoints[i].y + degPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(degPoints[i - 1].x, degPoints[i - 1].y, xc, yc);
      }
      ctx.lineTo(degPoints[degPoints.length - 1].x, degPoints[degPoints.length - 1].y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Curve 2: NDVI Vegetation Canopy Index (Green)
      const ndviPoints = data.ndvi.map((val, idx) => ({
        x: xPad + (plotW / (data.years.length - 1)) * idx,
        y: yPad + plotH * (1 - val)
      }));

      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#81C784';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(ndviPoints[0].x, ndviPoints[0].y);
      for (let i = 1; i < ndviPoints.length; i++) {
        const xc = (ndviPoints[i].x + ndviPoints[i - 1].x) / 2;
        const yc = (ndviPoints[i].y + ndviPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(ndviPoints[i - 1].x, ndviPoints[i - 1].y, xc, yc);
      }
      ctx.lineTo(ndviPoints[ndviPoints.length - 1].x, ndviPoints[ndviPoints.length - 1].y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Data Points & Metric Tags
      degPoints.forEach((p, idx) => {
        // Rust points
        ctx.fillStyle = '#b71c1c';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF7043';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Green points
        const gp = ndviPoints[idx];
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.arc(gp.x, gp.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.arc(gp.x, gp.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Badge at end point
        if (idx === degPoints.length - 1) {
          ctx.fillStyle = 'rgba(18, 20, 24, 0.9)';
          ctx.fillRect(p.x - 45, p.y - 28, 90, 20);
          ctx.strokeStyle = '#FF7043';
          ctx.strokeRect(p.x - 45, p.y - 28, 90, 20);
          ctx.fillStyle = '#FFAB91';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${data.degradedArea[idx]}k ha`, p.x, p.y - 14);

          ctx.fillStyle = 'rgba(18, 20, 24, 0.9)';
          ctx.fillRect(gp.x - 40, gp.y - 28, 80, 20);
          ctx.strokeStyle = '#81C784';
          ctx.strokeRect(gp.x - 40, gp.y - 28, 80, 20);
          ctx.fillStyle = '#A5D6A7';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(`NDVI ${data.ndvi[idx]}`, gp.x, gp.y - 14);
        }
      });

      // Chart Legend
      ctx.textAlign = 'right';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FF7043';
      ctx.fillText('━ Degraded Land Area', w - xPad, 28);
      ctx.fillStyle = '#4CAF50';
      ctx.fillText('━ Canopy NDVI Index', w - xPad, 46);

      // Update Side Panel (Image, Metrics Grid, Narrative)
      updateSidePanel(data);
    }

    function updateSidePanel(data) {
      const imgEl = document.getElementById('trends-meta-img');
      const captionEl = document.getElementById('trends-img-caption');
      const narrativeEl = document.getElementById('trends-narrative-text');
      const metricsContainer = document.getElementById('trends-metrics-grid');

      if (imgEl) imgEl.src = data.image;
      if (captionEl) captionEl.textContent = data.imageCaption;
      if (narrativeEl) narrativeEl.textContent = data.narrative;

      if (metricsContainer) {
        metricsContainer.innerHTML = '';
        data.metrics.forEach((m) => {
          const box = document.createElement('div');
          box.className = 'trends-metric-box';
          box.innerHTML = `
            <div class="trends-metric-label">${m.label}</div>
            <div class="trends-metric-val">${m.val}</div>
            <div class="trends-metric-sub">${m.change}</div>
          `;
          metricsContainer.appendChild(box);
        });
      }
    }

    // Tab buttons event
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeRegionKey = btn.dataset.region;
        renderChart(activeRegionKey);
      });
    });

    window.addEventListener('resize', () => {
      renderChart(activeRegionKey);
    });

    // Initial render
    renderChart('thar');
  }

  document.addEventListener('DOMContentLoaded', initAnalyticsGraph);
})();
