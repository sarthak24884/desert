/**
 * GIS Heatmap Overlay & Interactive India Vector Map Controller
 * Features state spotlighting, layer toggling (Wind, Water, Vegetation, Salinity),
 * and dynamic ISRO SAC telemetric data inspection.
 */

(function () {
  'use strict';

  // Comprehensive Dataset based on ISRO SAC Desertification & Land Degradation Atlas
  const stateData = {
    RJ: {
      name: "Rajasthan (Thar Desert Basin)",
      tag: "Arid Western Zone & Aravalli Fringe",
      tga: "34.22 Million ha",
      degradedHa: "21.53 Million ha",
      degradedPct: "62.92%",
      primaryDriver: "Wind Erosion (Dune Drift) & Salinity",
      severity: "Critical / High",
      windPct: 71,
      waterPct: 14,
      vegPct: 10,
      salinePct: 5,
      initiatives: "Great Green Wall of Aravalli (1,400km belt), CAZRI shelterbelts, Khejri agroforestry, sand dune fixation using Cenchrus ciliaris."
    },
    LA: {
      name: "Ladakh (Trans-Himalayan Cold Desert)",
      tag: "High-Altitude Arid Cryosphere",
      tga: "5.91 Million ha",
      degradedHa: "3.42 Million ha",
      degradedPct: "57.87%",
      primaryDriver: "Frost Weathering, Alpine Wind & Glacial Recession",
      severity: "Severe High-Altitude",
      windPct: 45,
      waterPct: 30,
      vegPct: 20,
      salinePct: 5,
      initiatives: "Artificial Glaciers & Ice Stupas (HIAL / Sonam Wangchuk), Seabuckthorn (Hippophae) bio-hedges, High-altitude drip irrigation."
    },
    MH: {
      name: "Maharashtra (Deccan Rainshadow)",
      tag: "Semi-Arid Marathwada & Vidarbha",
      tga: "30.77 Million ha",
      degradedHa: "13.81 Million ha",
      degradedPct: "44.88%",
      primaryDriver: "Water Sheet Erosion & Sugarcane Salinization",
      severity: "Moderate to High",
      windPct: 8,
      waterPct: 62,
      vegPct: 22,
      salinePct: 8,
      initiatives: "Integrated Watershed Management Programme (IWMP), Jalyukt Shivar Abhiyan, Continuous Contour Trenching (CCT), Farm Ponds."
    },
    GJ: {
      name: "Gujarat (Rann & Saurashtra)",
      tag: "Coastal & Saline Mudflats",
      tga: "19.60 Million ha",
      degradedHa: "10.23 Million ha",
      degradedPct: "52.20%",
      primaryDriver: "Saline Ingress & Wind Scouring",
      severity: "High",
      windPct: 38,
      waterPct: 24,
      vegPct: 12,
      salinePct: 26,
      initiatives: "Mangrove restoration in Gulf of Kutch, Banni grassland bio-restoration, Subsurface drainage for saline land reclamation."
    },
    KA: {
      name: "Karnataka (North Deccan Plateau)",
      tag: "Semi-Arid Black & Red Soils",
      tga: "19.18 Million ha",
      degradedHa: "7.15 Million ha",
      degradedPct: "37.28%",
      primaryDriver: "Water Erosion & Soil Hardpan Compaction",
      severity: "Moderate",
      windPct: 6,
      waterPct: 68,
      vegPct: 18,
      salinePct: 8,
      initiatives: "Sujala Watershed Project (World Bank assisted), check dams, horticulture afforestation on red gravel tracts."
    },
    MP: {
      name: "Madhya Pradesh (Central Highlands)",
      tag: "Chambal Ravines & Malwa Plateau",
      tga: "30.82 Million ha",
      degradedHa: "4.12 Million ha",
      degradedPct: "13.37%",
      primaryDriver: "Gully & Ravine Erosion (Chambal)",
      severity: "Localized Severe",
      windPct: 4,
      waterPct: 78,
      vegPct: 15,
      salinePct: 3,
      initiatives: "Chambal Ravines reclamation into arable terraces, bamboo plantation buffers, Joint Forest Management (JFM)."
    },
    JH: {
      name: "Jharkhand (Chota Nagpur Plateau)",
      tag: "Mining Belt & Degraded Deciduous Forest",
      tga: "7.97 Million ha",
      degradedHa: "5.49 Million ha",
      degradedPct: "68.88%",
      primaryDriver: "Vegetative Degradation & Open-Cast Mining",
      severity: "High / Vulnerable",
      windPct: 2,
      waterPct: 44,
      vegPct: 48,
      salinePct: 6,
      initiatives: "Mine spoil eco-restoration with native Sal & Mahua trees, community agroforestry, Birsa Harit Gram Yojana."
    },
    OD: {
      name: "Odisha (Eastern Ghats & Coastal Slopes)",
      tag: "High Monsoon Runoff & Podu Slashing",
      tga: "15.57 Million ha",
      degradedHa: "5.38 Million ha",
      degradedPct: "34.55%",
      primaryDriver: "Torrential Water Runoff & Slope Erosion",
      severity: "Moderate to High",
      windPct: 2,
      waterPct: 72,
      vegPct: 24,
      salinePct: 2,
      initiatives: "Odisha Watershed Development Mission, Vetiver grass vegetative barriers on steep hillslopes."
    },
    PB: {
      name: "Punjab & Haryana (Indo-Gangetic Plains)",
      tag: "Canal Command Basins",
      tga: "9.45 Million ha",
      degradedHa: "1.82 Million ha",
      degradedPct: "19.26%",
      primaryDriver: "Waterlogging, Excessive Pumping & Alkalinity (Kallar)",
      severity: "Moderate Salinity",
      windPct: 18,
      waterPct: 14,
      vegPct: 6,
      salinePct: 62,
      initiatives: "Gypsum soil amendment, bio-drainage using Eucalyptus plantations, laser land leveling, micro-irrigation subsidies."
    }
  };

  let activeLayer = 'all'; // all, wind, water, veg, saline
  let activeStateKey = 'RJ';

  function initMapGIS() {
    const layerButtons = document.querySelectorAll('.layer-btn');
    const statePaths = document.querySelectorAll('.state-path');
    const degradationZones = document.querySelectorAll('.degradation-zone');

    // Layer Toggle Handlers
    layerButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        layerButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        activeLayer = btn.dataset.layer;
        updateLayerVisibility(activeLayer);
      });
    });

    function updateLayerVisibility(layer) {
      degradationZones.forEach((zone) => {
        if (layer === 'all') {
          zone.style.opacity = '0.85';
        } else {
          const zoneType = zone.dataset.type;
          if (zoneType === layer) {
            zone.style.opacity = '0.95';
            zone.style.filter = 'drop-shadow(0 0 10px rgba(224, 192, 151, 0.7))';
          } else {
            zone.style.opacity = '0.08';
            zone.style.filter = 'none';
          }
        }
      });
    }

    // State Path Click & Hover
    statePaths.forEach((path) => {
      path.addEventListener('click', () => {
        statePaths.forEach((p) => p.classList.remove('selected'));
        path.classList.add('selected');

        const stateId = path.dataset.state;
        if (stateData[stateId]) {
          activeStateKey = stateId;
          updateInspector(stateData[stateId]);
        }
      });

      path.addEventListener('mouseenter', () => {
        const stateId = path.dataset.state;
        if (stateData[stateId]) {
          updateInspector(stateData[stateId]);
        }
      });

      path.addEventListener('mouseleave', () => {
        // Revert to active selected state
        if (stateData[activeStateKey]) {
          updateInspector(stateData[activeStateKey]);
        }
      });
    });

    // Inspector UI update
    function updateInspector(data) {
      const titleEl = document.getElementById('inspector-title');
      const tagEl = document.getElementById('inspector-tag');
      const tgaEl = document.getElementById('inspector-tga');
      const degradedEl = document.getElementById('inspector-degraded');
      const driverEl = document.getElementById('inspector-driver');
      const severityEl = document.getElementById('inspector-severity');
      const initiativesEl = document.getElementById('inspector-initiatives');

      const barWater = document.getElementById('bar-water');
      const barWind = document.getElementById('bar-wind');
      const barVeg = document.getElementById('bar-veg');
      const barSaline = document.getElementById('bar-saline');

      const valWater = document.getElementById('val-water');
      const valWind = document.getElementById('val-wind');
      const valVeg = document.getElementById('val-veg');
      const valSaline = document.getElementById('val-saline');

      if (titleEl) titleEl.textContent = data.name;
      if (tagEl) tagEl.textContent = data.tag;
      if (tgaEl) tgaEl.textContent = data.tga;
      if (degradedEl) degradedEl.textContent = `${data.degradedPct} (${data.degradedHa})`;
      if (driverEl) driverEl.textContent = data.primaryDriver;
      if (severityEl) {
        severityEl.textContent = data.severity;
        if (data.severity.includes('Critical') || data.severity.includes('Severe')) {
          severityEl.style.color = '#FF7043';
        } else {
          severityEl.style.color = 'var(--sand-gold)';
        }
      }
      if (initiativesEl) initiativesEl.textContent = data.initiatives;

      // Update Breakdown Bars
      if (barWater) barWater.style.width = `${data.waterPct}%`;
      if (barWind) barWind.style.width = `${data.windPct}%`;
      if (barVeg) barVeg.style.width = `${data.vegPct}%`;
      if (barSaline) barSaline.style.width = `${data.salinePct}%`;

      if (valWater) valWater.textContent = `${data.waterPct}%`;
      if (valWind) valWind.textContent = `${data.windPct}%`;
      if (valVeg) valVeg.textContent = `${data.vegPct}%`;
      if (valSaline) valSaline.textContent = `${data.salinePct}%`;
    }

    // Set initial state
    updateInspector(stateData['RJ']);
    const initialPath = document.querySelector('.state-path[data-state="RJ"]');
    if (initialPath) initialPath.classList.add('selected');
  }

  document.addEventListener('DOMContentLoaded', initMapGIS);
})();
