"use client";

import { usePlayback } from "@/context/PlaybackContext";
import type { VisualizationMode } from "@/lib/types";
import styles from "./ModeSelector.module.css";

const MODES: { value: VisualizationMode; label: string }[] = [
  { value: "Chord", label: "Acorde" },
  { value: "Scale", label: "Escala" },
  { value: "CommonTones", label: "Notas comunes" },
];

export function ModeSelector() {
  const { selectedMode, setSelectedMode } = usePlayback();

  return (
    <div className={styles.wrapper}>
      <span className={styles.eyebrow}>Modo</span>
      <div className={styles.options}>
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`${styles.option} ${mode.value === selectedMode ? styles.optionSelected : ""}`}
            onClick={() => setSelectedMode(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
