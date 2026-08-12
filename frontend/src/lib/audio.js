// Suara Nusantara — procedural ambient audio engine (Web Audio API).
// No external assets: each region gets a distinct gamelan/pentatonic-flavoured
// ambience so every perjalanan terasa berbeda. Respects a global on/off toggle.

const SOUND_KEY = "jn_sound_enabled";

// Musical profile per region slug: root frequency, scale (semitone offsets),
// note interval (ms), oscillator timbre.
export const AUDIO_PROFILES = {
  aceh: { root: 293.66, scale: [0, 1, 5, 7, 8], tempo: 1500, wave: "triangle" },
  "sumatera-barat": { root: 261.63, scale: [0, 2, 4, 7, 9], tempo: 1250, wave: "triangle" },
  "dki-jakarta": { root: 329.63, scale: [0, 2, 4, 7, 9], tempo: 950, wave: "square" },
  yogyakarta: { root: 246.94, scale: [0, 2, 5, 7, 9], tempo: 1800, wave: "sine" },
  bali: { root: 277.18, scale: [0, 1, 5, 7, 8], tempo: 1050, wave: "triangle" },
  "kalimantan-barat": { root: 220.0, scale: [0, 3, 5, 7, 10], tempo: 1400, wave: "sine" },
  "sulawesi-selatan": { root: 293.66, scale: [0, 2, 5, 7, 9], tempo: 1200, wave: "triangle" },
  papua: { root: 196.0, scale: [0, 3, 5, 7, 10], tempo: 900, wave: "sine" },
};

class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.delay = null;
    this.enabled = this._readEnabled();
    this.profile = null;
    this.timer = null;
    this.padNodes = [];
    this.listeners = new Set();
  }

  _readEnabled() {
    try {
      return localStorage.getItem(SOUND_KEY) === "1";
    } catch {
      return false;
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  _ensureContext() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0;
    // simple echo for space
    this.delay = this.ctx.createDelay();
    this.delay.delayTime.value = 0.34;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.32;
    const wet = this.ctx.createGain();
    wet.gain.value = 0.35;
    this.delay.connect(fb);
    fb.connect(this.delay);
    this.delay.connect(wet);
    wet.connect(this.master);
    this.master.connect(this.ctx.destination);
  }

  setEnabled(v) {
    this.enabled = v;
    try {
      localStorage.setItem(SOUND_KEY, v ? "1" : "0");
    } catch {}
    if (v) {
      this._ensureContext();
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      if (this.master) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.2);
      }
      if (this.profile) this._run();
    } else {
      this._fadeOutStop();
    }
    this._notify();
  }

  isEnabled() {
    return this.enabled;
  }

  start(slug) {
    this.profile = AUDIO_PROFILES[slug] || AUDIO_PROFILES.bali;
    if (this.enabled) {
      this._ensureContext();
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      if (this.master) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.0);
      }
      this._run();
    }
  }

  stop() {
    this._fadeOutStop();
    this.profile = null;
  }

  _fadeOutStop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(0.0, t + 0.6);
    }
    this._stopPad();
  }

  _stopPad() {
    this.padNodes.forEach((n) => {
      try {
        n.stop ? n.stop() : n.disconnect();
      } catch {}
    });
    this.padNodes = [];
  }

  _freq(semi, octave = 0) {
    return this.profile.root * Math.pow(2, (semi + octave * 12) / 12);
  }

  _run() {
    if (!this.ctx || !this.profile) return;
    if (this.timer) clearInterval(this.timer);
    this._startPad();
    const play = () => this._pluck();
    play();
    this.timer = setInterval(play, this.profile.tempo);
  }

  _startPad() {
    this._stopPad();
    const now = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.05;
    filter.connect(padGain);
    padGain.connect(this.master);
    [this._freq(0, -1), this._freq(7, -1)].forEach((f) => {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(filter);
      osc.start(now);
      this.padNodes.push(osc);
    });
    this.padNodes.push(padGain, filter);
  }

  _pluck() {
    if (!this.ctx || !this.profile) return;
    const now = this.ctx.currentTime;
    const scale = this.profile.scale;
    const semi = scale[Math.floor(Math.random() * scale.length)];
    const octave = Math.random() < 0.35 ? 1 : 0;
    const freq = this._freq(semi, octave);

    const osc = this.ctx.createOscillator();
    osc.type = this.profile.wave;
    osc.frequency.value = freq;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    osc.connect(g);
    g.connect(this.master);
    g.connect(this.delay);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  // short celebratory chime when a collectible is earned
  chime() {
    this._ensureContext();
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.master && this.master.gain.value < 0.05) {
      this.master.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.3);
    }
    const base = (this.profile && this.profile.root) || 523.25;
    [0, 4, 7, 12].forEach((semi, idx) => {
      const now = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = base * Math.pow(2, semi / 12);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc.connect(g);
      g.connect(this.master);
      g.connect(this.delay);
      osc.start(now);
      osc.stop(now + 1.0);
    });
  }
}

const audioEngine = new AmbientEngine();
export default audioEngine;
