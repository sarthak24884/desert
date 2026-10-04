/**
 * Tech & Restoration Simulator: Interactive Tree Cover & Eco-Restoration Calculator
 * Calculates sapling counts, carbon sequestration, soil loss averted, and native species
 * based on Indian agro-climatic zones and ISRO/ICAR forestry metrics.
 */

(function () {
  'use strict';

  // Zone specific species & constants
  const zoneConfig = {
    thar: {
      name: "Thar Arid Desert",
      soilLossBaseline: 18.5, // tonnes/ha/year
      waterInfiltrationFactor: 1.2, // lakh L/ha/yr
      species: [
        { name: "Prosopis cineraria (Khejri)", desc: "State tree of Rajasthan, deep taproot up to 35m, fixes nitrogen" },
        { name: "Tecomella undulata (Rohida)", desc: "Desert teak, extreme drought tolerance, binds sand dunes" },
        { name: "Acacia senegal (Kumat)", desc: "Gum arabic producer, stabilizes shifting barchan dunes" },
        { name: "Cenchrus ciliaris (Dhaman Grass)", desc: "Perennial pasture grass, rapid ground carpet protection" }
      ]
    },
    deccan: {
      name: "Deccan Semi-Arid Plateau",
      soilLossBaseline: 24.0,
      waterInfiltrationFactor: 2.8,
      species: [
        { name: "Azadirachta indica (Neem)", desc: "Universal bio-pesticide, deep root net stops regur cracking" },
        { name: "Pongamia pinnata (Karanj)", desc: "Nitrogen fixer tolerant to salinity and seasonal waterlogging" },
        { name: "Hardwickia binata (Anjan)", desc: "High-density drought timber, excellent contour bund anchor" },
        { name: "Vetiveria zizanioides (Vetiver)", desc: "Massive spongy root network, cuts runoff velocity by 70%" }
      ]
    },
    ladakh: {
      name: "Ladakh Cold Cryosphere",
      soilLossBaseline: 14.0,
      waterInfiltrationFactor: 0.9,
      species: [
        { name: "Hippophae rhamnoides (Seabuckthorn)", desc: "'Wonder plant of Ladakh', fixes nitrogen in sub-zero frost" },
        { name: "Populus alba (White Poplar)", desc: "Rapid biomass builder along meltwater channels" },
        { name: "Salix alba (Willow)", desc: "Stabilizes fragile scree riverbanks and provides cricket bat willow" },
        { name: "Caragana versicolor", desc: "Thorny alpine dwarf shrub preventing scree slope sliding" }
      ]
    },
    plains: {
      name: "Indo-Gangetic Alluvial & Saline",
      soilLossBaseline: 12.0,
      waterInfiltrationFactor: 3.5,
      species: [
        { name: "Dalbergia sissoo (Shisham)", desc: "Premium timber with deep soil stabilization root mantle" },
        { name: "Butea monosperma (Palash)", desc: "'Flame of the forest', hyper-tolerant to sodic / alkaline soils" },
        { name: "Terminalia arjuna (Arjun)", desc: "Exceptional riparian filter preventing bank erosion" },
        { name: "Tamarix aphylla (Farash)", desc: "Halophyte that absorbs excess surface salts through leaf glands" }
      ]
    }
  };

  // Technique Density & Multipliers
  const techConfig = {
    shelterbelt: {
      name: "Windbreak & Shelterbelt Rows",
      densityPerHa: 1000,
      carbonPerTreeYr: 0.022, // tonnes CO2e/tree/yr
      erosionReductionPct: 0.72,
      yearsToLDN: 6
    },
    miyawaki: {
      name: "Miyawaki Ultra-Dense Forest",
      densityPerHa: 25000,
      carbonPerTreeYr: 0.015,
      erosionReductionPct: 0.92,
      yearsToLDN: 3
    },
    agroforestry: {
      name: "Silvopasture & Agroforestry",
      densityPerHa: 650,
      carbonPerTreeYr: 0.028,
      erosionReductionPct: 0.65,
      yearsToLDN: 8
    },
    halophyte: {
      name: "Halophyte Bio-Drainage",
      densityPerHa: 1800,
      carbonPerTreeYr: 0.019,
      erosionReductionPct: 0.58,
      yearsToLDN: 7
    }
  };

  let currentHectares = 250;
  let currentZone = 'thar';
  let currentTech = 'shelterbelt';

  function initCalculator() {
    const slider = document.getElementById('calc-area-slider');
    const areaDisplay = document.getElementById('calc-area-val');
    const zoneOptions = document.querySelectorAll('[data-zone]');
    const techOptions = document.querySelectorAll('[data-tech]');
    const exportBtn = document.getElementById('calc-export-btn');

    function recalculate() {
      const zone = zoneConfig[currentZone];
      const tech = techConfig[currentTech];

      // Total saplings
      const totalTrees = Math.round(currentHectares * tech.densityPerHa);
      
      // Carbon sequestration (tCO2e / year)
      const carbonYearly = (totalTrees * tech.carbonPerTreeYr).toFixed(1);
      
      // Soil loss averted (tonnes / year)
      const soilSaved = Math.round(currentHectares * zone.soilLossBaseline * tech.erosionReductionPct);
      
      // Water recharge (Lakh Liters / year)
      const waterRecharged = (currentHectares * zone.waterInfiltrationFactor * 1.6).toFixed(1);

      // DOM Updates
      const totalTreesEl = document.getElementById('calc-result-trees');
      const carbonEl = document.getElementById('calc-result-carbon');
      const soilEl = document.getElementById('calc-result-soil');
      const waterEl = document.getElementById('calc-result-water');
      const yearsEl = document.getElementById('calc-result-years');
      const speciesListEl = document.getElementById('calc-species-list');

      if (totalTreesEl) {
        totalTreesEl.textContent = totalTrees.toLocaleString('en-IN');
      }
      if (carbonEl) {
        carbonEl.textContent = `${Number(carbonYearly).toLocaleString('en-IN')} t`;
      }
      if (soilEl) {
        soilEl.textContent = `${soilSaved.toLocaleString('en-IN')} t/yr`;
      }
      if (waterEl) {
        waterEl.textContent = `${waterRecharged} L L/yr`;
      }
      if (yearsEl) {
        yearsEl.textContent = `~${tech.yearsToLDN} Years`;
      }

      // Render recommended species
      if (speciesListEl) {
        speciesListEl.innerHTML = '';
        zone.species.forEach((sp) => {
          const pill = document.createElement('span');
          pill.className = 'species-pill';
          pill.textContent = sp.name;
          pill.title = sp.desc;
          speciesListEl.appendChild(pill);
        });
      }
    }

    // Slider Event
    if (slider) {
      slider.addEventListener('input', (e) => {
        currentHectares = parseInt(e.target.value, 10);
        if (areaDisplay) {
          areaDisplay.textContent = `${currentHectares.toLocaleString('en-IN')} Hectares`;
        }
        recalculate();
      });
    }

    // Zone Option Click
    zoneOptions.forEach((btn) => {
      btn.addEventListener('click', () => {
        zoneOptions.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentZone = btn.dataset.zone;
        recalculate();
      });
    });

    // Technique Option Click
    techOptions.forEach((btn) => {
      btn.addEventListener('click', () => {
        techOptions.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentTech = btn.dataset.tech;
        recalculate();
      });
    });

    // Export Action Brief (Print / PDF View)
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const zone = zoneConfig[currentZone];
        const tech = techConfig[currentTech];
        const totalTrees = (currentHectares * tech.densityPerHa).toLocaleString('en-IN');

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Action Brief - Land Degradation Neutrality (LDN) Plan</title>
            <style>
              body { font-family: -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              h1 { color: #2E7D32; border-bottom: 2px solid #C85A32; padding-bottom: 10px; }
              .meta-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
              .meta-table th, .meta-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              .meta-table th { background: #f5f5f5; }
              .highlight { font-size: 1.4em; font-weight: bold; color: #2E7D32; }
              .stamp { margin-top: 40px; font-size: 0.85em; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>🌿 LDN ECO-RESTORATION ACTION BRIEF</h1>
            <p><strong>Framework:</strong> UNCCD COP14 Target 15.3 & ISRO SAC Atlas Guidelines</p>
            
            <table class="meta-table">
              <tr><th>Target Land Area</th><td>${currentHectares.toLocaleString('en-IN')} Hectares</td></tr>
              <tr><th>Agro-Climatic Biome</th><td>${zone.name}</td></tr>
              <tr><th>Restoration Technique</th><td>${tech.name}</td></tr>
              <tr><th>Required Tree Saplings</th><td class="highlight">${totalTrees} Saplings</td></tr>
              <tr><th>Target Horizon to Neutrality</th><td>~${tech.yearsToLDN} Years</td></tr>
            </table>

            <h3>Recommended Native Species:</h3>
            <ul>
              ${zone.species.map(s => `<li><strong>${s.name}</strong>: ${s.desc}</li>`).join('')}
            </ul>

            <div class="stamp">
              Generated via Desertification in India Interactive Platform • SAC / ISRO Aligned Model
            </div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
          </html>
        `);
        printWindow.document.close();
      });
    }

    // Initial run
    recalculate();
  }

  document.addEventListener('DOMContentLoaded', initCalculator);
})();
