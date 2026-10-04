/**
 * Procedural Web Audio Engine: Ambient Desert Wind & Regeneration Rain Synthesizer
 * 100% offline, zero external audio assets required.
 */

(function () {
  'use strict';

  let audioCtx = null;
  let isPlaying = false;
  let noiseNode = null;
  let filterNode = null;
  let gainNode = null;
  let lfoNode = null;
  let lfoGain = null;

  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Create pink/brown noise buffer for natural desert wind
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Resonant bandpass filter to shape wind howl
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.frequency.value = 380;
    filterNode.Q.value = 2.5;

    // Low Frequency Oscillator (LFO) for wind gust swell
    lfoNode = audioCtx.createOscillator();
    lfoNode.frequency.value = 0.12; // slow gentle gusting
    lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 180; // Modulate frequency +/- 180Hz

    lfoNode.connect(lfoGain);
    lfoGain.connect(filterNode.frequency);

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start(0);
    lfoNode.start(0);
  }

  function toggleAudio() {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const btn = document.getElementById('audio-toggle');
    if (!isPlaying) {
      // Fade in
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.28, audioCtx.currentTime + 1.5);
      isPlaying = true;
      if (btn) {
        btn.classList.add('playing');
        btn.querySelector('.audio-label').textContent = 'Atmosphere: ON';
      }
    } else {
      // Fade out
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
      isPlaying = false;
      if (btn) {
        btn.classList.remove('playing');
        btn.querySelector('.audio-label').textContent = 'Atmosphere: OFF';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('audio-toggle');
    if (btn) {
      btn.addEventListener('click', toggleAudio);
    }
  });

  window.toggleDesertAudio = toggleAudio;
})();
