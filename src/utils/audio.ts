// Web Audio API helper for login and logout sounds
// This plays programmatic notes without requiring external file downloads.

export const playLoginSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      // Gentle volume control to avoid popping clicks
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
      gain.gain.linearRampToValueAtTime(0, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // An upbeat, ascending major arpeggio
    playTone(261.63, now, 0.18);        // C4
    playTone(329.63, now + 0.08, 0.18); // E4
    playTone(392.00, now + 0.16, 0.18); // G4
    playTone(523.25, now + 0.24, 0.40); // C5
  } catch (e) {
    console.warn('Audio Context failed to play login sound:', e);
  }
};

export const playLogoutSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      // Gentle volume control
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
      gain.gain.linearRampToValueAtTime(0, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // A relaxing, descending warm melody
    playTone(392.00, now, 0.18);        // G4
    playTone(329.63, now + 0.08, 0.18); // E4
    playTone(261.63, now + 0.16, 0.45); // C4
  } catch (e) {
    console.warn('Audio Context failed to play logout sound:', e);
  }
};
