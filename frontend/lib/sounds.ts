"use client";

class SoundManager {
  private context: AudioContext | null = null;
  private enabled = true;
  private progressOscillator: OscillatorNode | null = null;
  private progressGain: GainNode | null = null;

  setEnabled(next: boolean) {
    this.enabled = next;
    if (next) {
      this.getContext();
    } else {
      this.stopProgressTone();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  private getContext() {
    if (typeof window === "undefined") return null;
    
    if (!this.context) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    }
    // Resume context if suspended (browser policy)
    if (this.context?.state === 'suspended') {
      this.context.resume().catch(() => {});
    }
    return this.context;
  }

  playTypingSound() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Tech-y click sound (square wave for "mechanical" feel)
    osc.type = 'square';
    // Randomize pitch slightly to avoid machine-gun effect
    osc.frequency.setValueAtTime(800 + Math.random() * 100, ctx.currentTime);

    // Very short envelope
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }

  playSuccessSound() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Layer 1: Rising "power up" sine
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, now); // A4
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.3);
    
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Layer 2: High "ping" for clarity
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.1); // A6
    
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.03, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  }

  playSubroutineSound() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.18);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  startProgressTone() {
    if (!this.enabled || this.progressOscillator) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    gain.gain.setValueAtTime(0.005, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    this.progressOscillator = osc;
    this.progressGain = gain;
  }

  stopProgressTone() {
    if (!this.progressOscillator || !this.progressGain) {
      return;
    }
    const ctx = this.getContext();
    const stopTime = ctx ? ctx.currentTime + 0.08 : undefined;
    if (ctx) {
      this.progressGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    }
    try {
      this.progressOscillator.stop(stopTime);
    } catch {
      // oscillator might already be stopped; ignore
    }
    this.progressOscillator.disconnect();
    this.progressGain.disconnect();
    this.progressOscillator = null;
    this.progressGain = null;
  }
}

export const soundManager = new SoundManager();
