// Audio synthesized with Web Audio API — no external files.
// A gentle, looping, cozy melody for the radio + a soft purr for the cat.

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.playing = false;
    this.nodes = [];
    this.gain = null;
  }

  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  toggleMusic() {
    this.ensure();
    if (this.playing) this.stopMusic();
    else this.startMusic();
  }

  startMusic() {
    const ctx = this.ctx;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
    this.gain.connect(ctx.destination);

    // soft pad: two detuned oscillators
    const padGain = ctx.createGain();
    padGain.gain.value = 0.5;
    padGain.connect(this.gain);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(padGain);

    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 220;
    const o2 = ctx.createOscillator();
    o2.type = "triangle";
    o2.frequency.value = 277.18;
    o2.detune.value = 4;
    o1.connect(filter);
    o2.connect(filter);
    o1.start();
    o2.start();
    this.nodes.push(o1, o2, filter, padGain);

    // gentle melody on top
    const melGain = ctx.createGain();
    melGain.gain.value = 0.0;
    melGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
    melGain.connect(this.gain);
    const mel = ctx.createOscillator();
    mel.type = "sine";
    mel.connect(melGain);
    mel.start();
    this.nodes.push(mel, melGain);

    // melody sequence (C major-ish, cozy)
    const notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0];
    let i = 0;
    const step = () => {
      if (!this.playing) return;
      const f = notes[i % notes.length];
      mel.frequency.setValueAtTime(f, ctx.currentTime);
      mel.frequency.linearRampToValueAtTime(f * 1.01, ctx.currentTime + 0.4);
      i++;
      this.melTimer = setTimeout(step, 520);
    };
    this.playing = true;
    step();
  }

  stopMusic() {
    this.playing = false;
    clearTimeout(this.melTimer);
    if (this.gain) this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
    setTimeout(() => {
      this.nodes.forEach((n) => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch {} });
      this.nodes = [];
    }, 900);
  }

  purr() {
    this.ensure();
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.2);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.5);
    g.connect(ctx.destination);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 28;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 80;
    o.connect(lp);
    lp.connect(g);
    o.start();
    // subtle vibrato
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(o.frequency);
    lfo.start();
    setTimeout(() => { o.stop(); lfo.stop(); g.disconnect(); }, 3600);
  }
}
