// Portado de MainViewModel (repo desktop, commit 8692c71): raíces deletreadas con sostenidos,
// y el subconjunto curado de ChordFormulaLibrary que se muestra como botones de calidad.
export const ROOT_OPTIONS: { pitchClass: number; name: string }[] = [
  { pitchClass: 0, name: "C" },
  { pitchClass: 1, name: "C#" },
  { pitchClass: 2, name: "D" },
  { pitchClass: 3, name: "D#" },
  { pitchClass: 4, name: "E" },
  { pitchClass: 5, name: "F" },
  { pitchClass: 6, name: "F#" },
  { pitchClass: 7, name: "G" },
  { pitchClass: 8, name: "G#" },
  { pitchClass: 9, name: "A" },
  { pitchClass: 10, name: "A#" },
  { pitchClass: 11, name: "B" },
];

// Orden del círculo de quintas, en sentido horario desde C (cada paso suma 7 semitonos / sube
// una quinta justa). Se deriva de ROOT_OPTIONS para no duplicar el deletreo de cada raíz.
const FIFTHS_PITCH_CLASSES = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
export const CIRCLE_OF_FIFTHS = FIFTHS_PITCH_CLASSES.map(
  (pitchClass) => ROOT_OPTIONS.find((root) => root.pitchClass === pitchClass)!,
);

export const QUALITY_OPTIONS: { suffix: string; label: string }[] = [
  { suffix: "", label: "Mayor" },
  { suffix: "m", label: "Menor" },
  { suffix: "7", label: "7" },
  { suffix: "maj7", label: "Maj7" },
  { suffix: "m7", label: "m7" },
  { suffix: "dim", label: "Dim" },
  { suffix: "m7b5", label: "m7b5" },
  { suffix: "aug", label: "Aug" },
  { suffix: "sus4", label: "Sus4" },
  { suffix: "6", label: "6" },
  { suffix: "m6", label: "m6" },
  { suffix: "9", label: "9" },
];
