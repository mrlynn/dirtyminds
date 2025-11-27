import { Howl } from 'howler';

// Sound effect library for Dirty Minds game
class SoundManager {
  constructor() {
    this.enabled = true;
    this.sounds = {};

    // Initialize sounds (using Web Audio API tones as placeholders)
    // In production, these would be actual sound files
    this.initializeSounds();
  }

  initializeSounds() {
    // Generate simple tones using Web Audio API
    // These are lightweight and don't require external files

    // Success/Saint sound (high pitch, positive)
    this.sounds.saint = new Howl({
      src: [this.generateTone(523.25, 0.2, 'sine')], // C5 note
      volume: 0.3,
    });

    // Sinner sound (playful, lower pitch)
    this.sounds.sinner = new Howl({
      src: [this.generateTone(392.00, 0.2, 'sine')], // G4 note
      volume: 0.3,
    });

    // Buzz-in sound
    this.sounds.buzzIn = new Howl({
      src: [this.generateTone(440.00, 0.15, 'square')], // A4 note
      volume: 0.25,
    });

    // Correct answer
    this.sounds.correct = new Howl({
      src: [this.generateChord([261.63, 329.63, 392.00], 0.3, 'sine')], // C major chord
      volume: 0.3,
    });

    // Vote cast
    this.sounds.vote = new Howl({
      src: [this.generateTone(659.25, 0.1, 'sine')], // E5 note
      volume: 0.2,
    });

    // Round complete
    this.sounds.roundComplete = new Howl({
      src: [this.generateChord([523.25, 659.25, 783.99], 0.4, 'sine')], // C major chord (higher)
      volume: 0.35,
    });

    // Button click
    this.sounds.click = new Howl({
      src: [this.generateTone(800.00, 0.05, 'sine')],
      volume: 0.15,
    });

    // Join game
    this.sounds.join = new Howl({
      src: [this.generateTone(587.33, 0.2, 'sine')], // D5 note
      volume: 0.25,
    });

    // Start game
    this.sounds.start = new Howl({
      src: [this.generateChord([440.00, 554.37, 659.25], 0.5, 'sine')], // A major chord
      volume: 0.35,
    });
  }

  // Generate a simple tone using Web Audio API
  generateTone(frequency, duration, type = 'sine') {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Envelope for smoother sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    // Return a data URL (this is a placeholder - Howler expects actual audio)
    // In practice, we'll play these directly without Howler
    return '';
  }

  // Generate a chord
  generateChord(frequencies, duration, type = 'sine') {
    // Similar to generateTone but with multiple frequencies
    return '';
  }

  // Play sound by name
  play(soundName) {
    if (!this.enabled || typeof window === 'undefined') return;

    // Use Web Audio API directly for better browser compatibility
    this.playTone(soundName);
  }

  // Direct Web Audio API playback
  playTone(soundName) {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Sound configurations
    const sounds = {
      saint: { freq: 523.25, duration: 0.2, type: 'sine', volume: 0.3 },
      sinner: { freq: 392.00, duration: 0.2, type: 'sine', volume: 0.3 },
      buzzIn: { freq: 440.00, duration: 0.15, type: 'square', volume: 0.25 },
      vote: { freq: 659.25, duration: 0.1, type: 'sine', volume: 0.2 },
      click: { freq: 800.00, duration: 0.05, type: 'sine', volume: 0.15 },
      join: { freq: 587.33, duration: 0.2, type: 'sine', volume: 0.25 },
    };

    const config = sounds[soundName];
    if (!config) return;

    oscillator.frequency.value = config.freq;
    oscillator.type = config.type;

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);
  }

  // Play chord for special events
  playChord(soundName) {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    const chords = {
      correct: { freqs: [261.63, 329.63, 392.00], duration: 0.3, volume: 0.3 },
      roundComplete: { freqs: [523.25, 659.25, 783.99], duration: 0.4, volume: 0.35 },
      start: { freqs: [440.00, 554.37, 659.25], duration: 0.5, volume: 0.35 },
    };

    const config = chords[soundName];
    if (!config) return;

    config.freqs.forEach((freq) => {
      const oscillator = audioContext.createOscillator();
      oscillator.connect(gainNode);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
    });

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Enable sounds
  enable() {
    this.enabled = true;
  }

  // Disable sounds
  disable() {
    this.enabled = false;
  }
}

// Export singleton instance
let soundManager;
if (typeof window !== 'undefined') {
  soundManager = new SoundManager();
}

export default soundManager;

// Convenience functions
export const playSound = (soundName) => {
  if (soundManager) {
    if (['correct', 'roundComplete', 'start'].includes(soundName)) {
      soundManager.playChord(soundName);
    } else {
      soundManager.playTone(soundName);
    }
  }
};

export const toggleSound = () => soundManager?.toggle();
export const enableSound = () => soundManager?.enable();
export const disableSound = () => soundManager?.disable();
