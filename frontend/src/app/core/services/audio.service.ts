import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCtx: AudioContext | null = null;
  private isEnabled = true;

  private init() {
    if (!this.isEnabled) return;
    if (!this.audioCtx) {
      // AudioContext needs user interaction to resume in many browsers
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTypeSound() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  playDeleteSound() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.06);
  }

  playErrorSound() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.2);
  }

  playRevealSound(status: 'CORRECT' | 'PRESENT' | 'ABSENT', index: number) {
    this.init();
    if (!this.audioCtx) return;
    
    const delay = index * 0.08; // 80ms delay per index to match CSS
    const startTime = this.audioCtx.currentTime + delay;
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    if (status === 'CORRECT') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 + (index * 110), startTime); // Pitch goes up
    } else if (status === 'PRESENT') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + (index * 55), startTime); // Lower pitch
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, startTime); // Dull thud
    }
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  playWinSound() {
    this.init();
    if (!this.audioCtx) return;
    
    // Play a triumphant C major arpeggio
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startTime = this.audioCtx!.currentTime + (i * 0.1);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  playLevelUpSound() {
    this.init();
    if (!this.audioCtx) return;
    
    // Play a grand fanfare
    const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    
    frequencies.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startTime = this.audioCtx!.currentTime + (i * 0.15);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      
      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);
      osc.start(startTime);

      if (i === frequencies.length - 1) {
        // Last note sustains longer
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
        osc.stop(startTime + 1.0);
      } else {
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.stop(startTime + 0.3);
      }
    });
  }
}
