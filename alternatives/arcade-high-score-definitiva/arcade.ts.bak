// Versione Arcade ("High Score"): colori dei fosfori e suoni 8-bit sintetizzati (nessun file audio).

/** Un colore per posizione, come le righe delle classifiche record dei cabinati. */
export const ARCADE_COLORS = ['#ffe14d', '#00d0ff', '#ff64c4', '#39ff88', '#ffb347'];
export const arcadeColor = (index: number) => ARCADE_COLORS[((index % 5) + 5) % 5];

/** Easing a scatti: l'animazione avanza in `frames` fotogrammi, come uno sprite. */
export const pixelSteps = (frames: number) => (t: number) => Math.min(1, Math.ceil(t * frames) / frames);

const SOUND_KEY = 'gimmefive-sound';
let soundOn = (() => {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
})();
let context: AudioContext | null = null;

const audio = () => {
  if (!soundOn) return null;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
};

const tone = (frequency: number, start: number, duration: number, volume = 0.035) => {
  const ctx = audio();
  if (!ctx) return;
  const at = ctx.currentTime + start;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.02);
};

export const sound = {
  isOn: () => soundOn,
  setOn(on: boolean) {
    soundOn = on;
    try {
      localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
    } catch {
      // storage non disponibile: vale solo per questa sessione
    }
  },
  blip: () => tone(1250 + Math.random() * 200, 0, 0.035, 0.022),
  select: () => { tone(660, 0, 0.07); tone(990, 0.07, 0.12); },
  back: () => { tone(660, 0, 0.06); tone(440, 0.06, 0.1); },
  coin: () => { tone(988, 0, 0.08); tone(1319, 0.08, 0.32); },
  fanfare: () => [523, 659, 784, 1047, 784, 1047].forEach((frequency, i) => tone(frequency, i * 0.085, i === 5 ? 0.4 : 0.08, 0.04)),
};
