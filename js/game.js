/**
 * Eco-Restoration Strategy Game: "Mission LDN 2030"
 * Interactive tactical simulation to combat desertification in India with real-time scoreboard.
 */

(function () {
  'use strict';

  // Game Constants & Configuration
  const GRID_SIZE = 6; // 6x6 grid = 36 territory tiles
  const TOTAL_TURNS = 12; // 12 action cycles representing months/years
  const INITIAL_BUDGET = 1200; // Eco-credits

  // Tile Types
  const TILE_TYPES = {
    DUNE: { id: 'dune', name: 'Shifting Dune', icon: '🌪️', color: '#8d6e63', degraded: true, severity: 3, label: 'Wind Scour' },
    CRACKED: { id: 'cracked', name: 'Cracked Gully', icon: '🪨', color: '#5d4037', degraded: true, severity: 2, label: 'Water Runoff' },
    SALINE: { id: 'saline', name: 'Saline Crust', icon: '🧂', color: '#78909c', degraded: true, severity: 3, label: 'Salt Hardpan' },
    SCRUB: { id: 'scrub', name: 'Degraded Scrub', icon: '🍂', color: '#6d4c41', degraded: true, severity: 1, label: 'Vegetation Loss' },
    // Restored States
    SHELTERBELT: { id: 'shelterbelt', name: 'Khejri Shelterbelt', icon: '🌳', color: '#2e7d32', restored: true, bonus: 150 },
    BUND: { id: 'bund', name: 'Vetiver Contour Bund', icon: '🌾', color: '#388e3c', restored: true, bonus: 120 },
    STUPA: { id: 'stupa', name: 'Ice Stupa / Farm Pond', icon: '💧', color: '#0288d1', restored: true, bonus: 180 },
    HALOPHYTE: { id: 'halophyte', name: 'Halophyte Bio-Drainage', icon: '🌿', color: '#43a047', restored: true, bonus: 140 }
  };

  // Restoration Tools
  const TOOLS = [
    {
      id: 'shelterbelt',
      name: 'Khejri Shelterbelt',
      icon: '🌳',
      cost: 100,
      effectiveOn: ['dune', 'scrub'],
      carbonPerTurn: 25,
      waterRecharge: 15,
      desc: 'Deep roots halt barchan dune drift & fix nitrogen.'
    },
    {
      id: 'bund',
      name: 'Contour Bund & Vetiver',
      icon: '🌾',
      cost: 80,
      effectiveOn: ['cracked', 'scrub'],
      carbonPerTurn: 18,
      waterRecharge: 35,
      desc: 'Stops sheet wash & traps topsoil moisture.'
    },
    {
      id: 'stupa',
      name: 'Farm Pond / Ice Stupa',
      icon: '💧',
      cost: 140,
      effectiveOn: ['cracked', 'dune'],
      carbonPerTurn: 30,
      waterRecharge: 60,
      desc: 'Stores millions of liters for deep aquifer recharge.'
    },
    {
      id: 'halophyte',
      name: 'Halophyte Bio-Drainage',
      icon: '🌿',
      cost: 90,
      effectiveOn: ['saline'],
      carbonPerTurn: 20,
      waterRecharge: 20,
      desc: 'Specialized plants extract salts and soften hardpan.'
    }
  ];

  // Game State
  let state = {
    turn: 1,
    budget: INITIAL_BUDGET,
    score: 0,
    carbonTotal: 0,
    waterTotal: 0,
    selectedTool: TOOLS[0],
    grid: [],
    gameOver: false,
    history: []
  };

  // Sound Synth (Web Audio API)
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'plant') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.15);
        osc.frequency.setValueAtTime(659.25, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.52);
      }
    } catch (e) {
      // Ignore audio failure
    }
  }

  // Initialize Game Grid
  function initGrid() {
    state.grid = [];
    const pool = ['dune', 'dune', 'cracked', 'cracked', 'saline', 'scrub'];

    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const typeKey = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
        row.push({
          type: TILE_TYPES[typeKey],
          origType: TILE_TYPES[typeKey],
          row: r,
          col: c,
          restored: false,
          plantedTurn: 0
        });
      }
    }
    return row;
  }

  // Generate Leaderboard default seeds if empty
  function getLeaderboard() {
    const defaultScores = [
      { name: "Pooja Sharma (CAZRI)", score: 4820, rank: "Bonn Champion", date: "2026-09-28" },
      { name: "Sonam Wangchuk (HIAL)", score: 4450, rank: "Ice Architect", date: "2026-09-29" },
      { name: "Rajendra Singh (TBS)", score: 4120, rank: "Waterman of India", date: "2026-09-30" },
      { name: "Arun Verma (IWMP)", score: 3650, rank: "Eco Pioneer", date: "2026-10-01" },
      { name: "Meera Kulkarni", score: 3200, rank: "Green Guardian", date: "2026-10-02" }
    ];

    try {
      const stored = localStorage.getItem('bhumi_ldn_leaderboard');
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return defaultScores;
  }

  function saveScore(name, finalScore) {
    const scores = getLeaderboard();
    let rankTitle = "Eco Guardian";
    if (finalScore >= 4500) rankTitle = "Bonn Champion 🏆";
    else if (finalScore >= 3800) rankTitle = "Restoration Pioneer 🌿";
    else if (finalScore >= 3000) rankTitle = "Green Architect 🌳";
    else rankTitle = "Soil Defender 🛡️";

    const newEntry = {
      name: name.trim() || "Anonymous Pioneer",
      score: finalScore,
      rank: rankTitle,
      date: new Date().toISOString().split('T')[0]
    };

    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 8); // Keep top 8

    try {
      localStorage.setItem('bhumi_ldn_leaderboard', JSON.stringify(topScores));
    } catch (e) {}

    renderLeaderboard();
  }

  // Calculate restoration statistics
  function getStats() {
    let restoredCount = 0;
    let totalDegraded = 0;

    state.grid.forEach((row) => {
      row.forEach((tile) => {
        if (tile.restored) restoredCount++;
        else totalDegraded++;
      });
    });

    const totalTiles = GRID_SIZE * GRID_SIZE;
    const ldnPct = Math.round((restoredCount / totalTiles) * 100);
    return { restoredCount, totalDegraded, totalTiles, ldnPct };
  }

  // Game UI Renderer
  function renderGame() {
    const gridEl = document.getElementById('game-grid');
    const budgetEl = document.getElementById('game-budget');
    const turnEl = document.getElementById('game-turn');
    const scoreEl = document.getElementById('game-score');
    const ldnEl = document.getElementById('game-ldn-pct');
    const carbonEl = document.getElementById('game-carbon');
    const waterEl = document.getElementById('game-water');

    if (!gridEl) return;

    const stats = getStats();

    if (budgetEl) budgetEl.textContent = `₹ ${state.budget.toLocaleString()}`;
    if (turnEl) turnEl.textContent = `Cycle ${state.turn} / ${TOTAL_TURNS}`;
    if (scoreEl) scoreEl.textContent = state.score.toLocaleString();
    if (ldnEl) ldnEl.textContent = `${stats.ldnPct}%`;
    if (carbonEl) carbonEl.textContent = `${state.carbonTotal} t`;
    if (waterEl) waterEl.textContent = `${state.waterTotal} kL`;

    // Render Grid Tiles
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

    state.grid.forEach((row, r) => {
      row.forEach((tile, c) => {
        const tileBtn = document.createElement('button');
        tileBtn.className = `game-tile ${tile.restored ? 'restored' : 'degraded'} type-${tile.type.id}`;
        tileBtn.setAttribute('data-row', r);
        tileBtn.setAttribute('data-col', c);

        tileBtn.innerHTML = `
          <span class="tile-icon">${tile.type.icon}</span>
          <span class="tile-label">${tile.type.name}</span>
        `;

        tileBtn.addEventListener('click', () => handleTileClick(r, c));
        gridEl.appendChild(tileBtn);
      });
    });
  }

  // Handle Planting on Tile
  function handleTileClick(r, c) {
    if (state.gameOver) return;

    const tile = state.grid[r][c];
    const tool = state.selectedTool;

    // Check if already restored
    if (tile.restored) {
      playSound('error');
      showGameToast("⚠️ Tile already restored!", "warning");
      return;
    }

    // Check budget
    if (state.budget < tool.cost) {
      playSound('error');
      showGameToast("❌ Insufficient Eco-Budget!", "danger");
      return;
    }

    // Check compatibility
    const isEffective = tool.effectiveOn.includes(tile.type.id);
    const cost = tool.cost;
    state.budget -= cost;

    // Restore tile
    const newTypeKey = tool.id.toUpperCase();
    tile.type = TILE_TYPES[newTypeKey];
    tile.restored = true;
    tile.plantedTurn = state.turn;

    // Base score reward
    let gainScore = isEffective ? 250 : 120;
    state.score += gainScore;
    state.carbonTotal += tool.carbonPerTurn;
    state.waterTotal += tool.waterRecharge;

    playSound('plant');

    if (isEffective) {
      showGameToast(`🌱 Perfect Intervention! +${gainScore} pts`, "success");
    } else {
      showGameToast(`🌿 Sub-optimal Match (+${gainScore} pts)`, "info");
    }

    renderGame();
    checkGameProgress();
  }

  // End of Turn / Cycle advance
  function advanceTurn() {
    if (state.gameOver) return;

    // Produce passive carbon & water from existing restored tiles
    let turnCarbon = 0;
    let turnWater = 0;
    state.grid.forEach((row) => {
      row.forEach((tile) => {
        if (tile.restored) {
          turnCarbon += 5;
          turnWater += 8;
        }
      });
    });

    state.carbonTotal += turnCarbon;
    state.waterTotal += turnWater;
    state.score += turnCarbon * 2 + turnWater;

    // Replenish small seasonal grant
    state.budget += 150;

    // Trigger Random Monsoon / Drought Event
    triggerWeatherEvent();

    state.turn++;
    if (state.turn > TOTAL_TURNS) {
      finishGame();
    } else {
      renderGame();
    }
  }

  function triggerWeatherEvent() {
    const events = [
      { name: "🌧️ Favorable Western Monsoon", desc: "Abundant rainfall boosts vegetative growth (+₹180 grant)!", budget: 180, score: 200 },
      { name: "☀️ Severe Heatwave (Loo Gales)", desc: "High evaporation strains water buffer (-₹60 maintenance).", budget: -60, score: 0 },
      { name: "🌪️ Barchan Sandstorm Warning", desc: "Dune drift test: Shelterbelts held the perimeter (+150 pts)!", budget: 0, score: 150 },
      { name: "🌱 Community Van Mahotsav", desc: "Local youth volunteer in tree planting (+₹200 grant)!", budget: 200, score: 250 }
    ];

    const ev = events[Math.floor(Math.random() * events.length)];
    state.budget = Math.max(0, state.budget + ev.budget);
    state.score += ev.score;

    const eventEl = document.getElementById('game-weather-banner');
    if (eventEl) {
      eventEl.innerHTML = `<strong>${ev.name}:</strong> ${ev.desc}`;
      eventEl.classList.add('pulse');
      setTimeout(() => eventEl.classList.remove('pulse'), 1200);
    }
  }

  function checkGameProgress() {
    const stats = getStats();
    if (stats.ldnPct === 100) {
      finishGame(true);
    }
  }

  function finishGame(isPerfect = false) {
    state.gameOver = true;
    playSound('win');

    const stats = getStats();
    // Final score calculation with budget efficiency multiplier
    const efficiencyBonus = Math.round(state.budget * 1.5);
    const finalScore = state.score + (stats.ldnPct * 20) + efficiencyBonus;
    state.score = finalScore;

    const modal = document.getElementById('game-modal');
    const modalScore = document.getElementById('modal-final-score');
    const modalStats = document.getElementById('modal-stats-summary');

    if (modal && modalScore && modalStats) {
      modalScore.textContent = finalScore.toLocaleString();
      modalStats.innerHTML = `
        <div class="modal-stat-pill"><strong>LDN Neutrality:</strong> ${stats.ldnPct}%</div>
        <div class="modal-stat-pill"><strong>Tiles Restored:</strong> ${stats.restoredCount} / 36</div>
        <div class="modal-stat-pill"><strong>Total Carbon:</strong> ${state.carbonTotal} tCO2e</div>
        <div class="modal-stat-pill"><strong>Water Table:</strong> +${state.waterTotal} kL</div>
        <div class="modal-stat-pill"><strong>Unspent Budget:</strong> ₹ ${state.budget}</div>
      `;
      modal.classList.add('active');
    }
  }

  function resetGame() {
    state.turn = 1;
    state.budget = INITIAL_BUDGET;
    state.score = 0;
    state.carbonTotal = 0;
    state.waterTotal = 0;
    state.gameOver = false;
    initGrid();
    renderGame();

    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.remove('active');
  }

  // Toast Notification
  function showGameToast(msg, type = "info") {
    const toast = document.getElementById('game-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `game-toast visible toast-${type}`;
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2000);
  }

  // Render Leaderboard Table
  function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    const scores = getLeaderboard();
    tbody.innerHTML = '';

    scores.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const medal = idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : `#${idx + 1} `;
      tr.innerHTML = `
        <td><span class="leaderboard-rank">${medal}</span></td>
        <td><strong style="color: #fff;">${entry.name}</strong></td>
        <td><span class="badge badge-gold" style="font-size: 0.72rem;">${entry.rank}</span></td>
        <td><strong style="color: var(--sand-gold); font-family: var(--font-heading); font-size: 1.05rem;">${entry.score.toLocaleString()}</strong></td>
        <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${entry.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Initialize Game Components
  function init() {
    initGrid();
    renderGame();
    renderLeaderboard();

    // Tool Selection buttons
    const toolBtns = document.querySelectorAll('.game-tool-card');
    toolBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        toolBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const toolId = btn.dataset.tool;
        state.selectedTool = TOOLS.find((t) => t.id === toolId);
      });
    });

    // Advance Cycle button
    const nextBtn = document.getElementById('game-next-turn-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', advanceTurn);
    }

    // Reset button
    const resetBtn = document.getElementById('game-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetGame);
    }

    // Modal submit score
    const submitBtn = document.getElementById('modal-submit-score-btn');
    const nameInput = document.getElementById('player-name-input');
    if (submitBtn && nameInput) {
      submitBtn.addEventListener('click', () => {
        saveScore(nameInput.value, state.score);
        const modal = document.getElementById('game-modal');
        if (modal) modal.classList.remove('active');
        showGameToast("🎉 Score saved to Leaderboard!", "success");
      });
    }

    // Modal play again
    const playAgainBtn = document.getElementById('modal-play-again-btn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', resetGame);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
