// Progresiones predefinidas: cada paso es un offset en semitonos desde la raíz elegida (grado de
// la escala mayor) + el sufijo de calidad de ChordFormulaLibrary (mismo vocabulario que QUALITY_OPTIONS).
export interface ProgressionPreset {
  id: string;
  label: string;
  steps: { semitonesFromRoot: number; suffix: string }[];
}

export const PROGRESSION_PRESETS: ProgressionPreset[] = [
  {
    id: "blues",
    label: "Blues (I7-IV7-I7-V7)",
    steps: [
      { semitonesFromRoot: 0, suffix: "7" },
      { semitonesFromRoot: 5, suffix: "7" },
      { semitonesFromRoot: 0, suffix: "7" },
      { semitonesFromRoot: 7, suffix: "7" },
    ],
  },
  {
    id: "pop",
    label: "Pop (I-V-vi-IV)",
    steps: [
      { semitonesFromRoot: 0, suffix: "" },
      { semitonesFromRoot: 7, suffix: "" },
      { semitonesFromRoot: 9, suffix: "m" },
      { semitonesFromRoot: 5, suffix: "" },
    ],
  },
  {
    id: "jazz",
    label: "Jazz (I-vi-ii-V)",
    steps: [
      { semitonesFromRoot: 0, suffix: "maj7" },
      { semitonesFromRoot: 9, suffix: "m7" },
      { semitonesFromRoot: 2, suffix: "m7" },
      { semitonesFromRoot: 7, suffix: "7" },
    ],
  },
];
