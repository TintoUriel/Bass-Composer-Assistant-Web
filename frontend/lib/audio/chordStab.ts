import * as Tone from "tone";
import { getAudioContext } from "./audioContext";

// Sampler con grabaciones reales de un piano (Salamander Grand Piano, el set de muestras que
// el propio Tone.js usa en sus ejemplos oficiales) en vez de osciladores sintetizados — un
// sintetizador nunca va a sonar "como un piano real", una muestra grabada sí.
const DURATION_S = 1.8;
const VOLUME_DB = -6;

let sampler: Tone.Sampler | null = null;
let loaded: Promise<void> | null = null;

function getSampler(): { sampler: Tone.Sampler; ready: Promise<void> } {
  if (!sampler) {
    Tone.setContext(getAudioContext());
    let resolveLoaded!: () => void;
    loaded = new Promise<void>((resolve) => (resolveLoaded = resolve));

    const newSampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
        A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
        A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
        A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
        A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
        A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
        A7: "A7.mp3", C8: "C8.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: resolveLoaded,
    }).toDestination();
    newSampler.volume.value = VOLUME_DB;

    sampler = newSampler;
  }

  return { sampler, ready: loaded! };
}

function midiToNoteName(midiNote: number): string {
  return Tone.Frequency(midiNote, "midi").toNote();
}

export function playChordStab(midiNotes: readonly number[]): void {
  if (midiNotes.length === 0) return;

  const { sampler, ready } = getSampler();
  const notes = midiNotes.map(midiToNoteName);

  if (sampler.loaded) sampler.triggerAttackRelease(notes, DURATION_S);
  else ready.then(() => sampler.triggerAttackRelease(notes, DURATION_S));
}
