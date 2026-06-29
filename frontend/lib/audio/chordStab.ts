import { getAudioContext } from "./audioContext";

// Portado de NAudioChordSoundPlayer (repo desktop, commit 8692c71): síntesis aditiva de 6
// armónicos por nota, cada uno más débil y de decay más rápido cuanto más alto — el "stab" se
// recalcula en cada acorde (no se cachea, igual que en NAudio) porque cambia con cada acorde.
const DURATION_MS = 1800;
const ATTACK_MS = 8;
const HARMONIC_COUNT = 6;
const FIXED_VOLUME = 0.5;

function midiToFrequencyHz(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function pianoNote(frequencyHz: number, t: number): number {
  let sample = 0;

  for (let harmonic = 1; harmonic <= HARMONIC_COUNT; harmonic++) {
    const amplitude = 1 / Math.pow(harmonic, 1.5);
    const decayRate = 0.8 + 0.35 * (harmonic - 1);
    sample += amplitude * Math.sin(2 * Math.PI * frequencyHz * harmonic * t) * Math.exp(-decayRate * t);
  }

  return sample;
}

function buildChordBuffer(ctx: AudioContext, midiNotes: readonly number[]): AudioBuffer {
  const sampleCount = Math.floor((ctx.sampleRate * DURATION_MS) / 1000);
  const attackSamples = Math.floor((ctx.sampleRate * ATTACK_MS) / 1000);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const gain = 1 / midiNotes.length;
  const frequenciesHz = midiNotes.map(midiToFrequencyHz);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / ctx.sampleRate;
    const attackEnvelope = i < attackSamples ? i / attackSamples : 1;

    let sample = 0;
    for (const frequencyHz of frequenciesHz) sample += pianoNote(frequencyHz, t);

    data[i] = sample * gain * attackEnvelope;
  }

  return buffer;
}

export function playChordStab(midiNotes: readonly number[]): void {
  if (midiNotes.length === 0) return;

  const ctx = getAudioContext();
  const buffer = buildChordBuffer(ctx, midiNotes);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = FIXED_VOLUME;

  source.connect(gain).connect(ctx.destination);
  source.start();
}
