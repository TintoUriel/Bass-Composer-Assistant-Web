import { getAudioContext } from "./audioContext";

// Portado de NAudioClickSoundPlayer (repo desktop, commit 8692c71): seno con envolvente de decay
// exp(-t*35). Igual que CachedSound allá, los buffers se sintetizan una sola vez y se reusan en
// cada click — solo cambian frecuencia/duración entre el acentuado y el normal.
const ACCENT_FREQUENCY_HZ = 1500;
const ACCENT_DURATION_MS = 40;
const NORMAL_FREQUENCY_HZ = 1000;
const NORMAL_DURATION_MS = 35;
const DECAY_RATE = 35;

let accentBuffer: AudioBuffer | null = null;
let normalBuffer: AudioBuffer | null = null;

function buildClickBuffer(ctx: AudioContext, frequencyHz: number, durationMs: number): AudioBuffer {
  const sampleCount = Math.floor((ctx.sampleRate * durationMs) / 1000);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / ctx.sampleRate;
    const decayEnvelope = Math.exp(-t * DECAY_RATE);
    data[i] = Math.sin(2 * Math.PI * frequencyHz * t) * decayEnvelope;
  }

  return buffer;
}

export function playMetronomeClick(volume: number, accented: boolean): void {
  const ctx = getAudioContext();

  if (!accentBuffer) accentBuffer = buildClickBuffer(ctx, ACCENT_FREQUENCY_HZ, ACCENT_DURATION_MS);
  if (!normalBuffer) normalBuffer = buildClickBuffer(ctx, NORMAL_FREQUENCY_HZ, NORMAL_DURATION_MS);

  const source = ctx.createBufferSource();
  source.buffer = accented ? accentBuffer : normalBuffer;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(gain).connect(ctx.destination);
  source.start();
}
