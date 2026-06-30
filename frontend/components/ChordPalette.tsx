"use client";

import { usePlayback } from "@/context/PlaybackContext";
import { QUALITY_OPTIONS } from "@/lib/chordPalette";
import { PROGRESSION_PRESETS } from "@/lib/presets";
import { CircleOfFifths } from "./CircleOfFifths";
import styles from "./ChordPalette.module.css";

export function ChordPalette() {
  const {
    progressionText,
    invalidTokens,
    selectedRootName,
    addChord,
    applyPreset,
    removeLastChord,
    clearProgression,
  } = usePlayback();

  return (
    <div className={styles.palette}>
      <div className={`${styles.display} ${progressionText ? "" : styles.displayEmpty}`}>
        {progressionText || "— SIN ACORDES —"}
      </div>

      {invalidTokens.length > 0 && (
        <div className={styles.invalidTokens}>
          Acordes no reconocidos: {invalidTokens.join(", ")}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.section}>
          <span className={styles.eyebrow}>Raíz — Círculo de quintas</span>
          <CircleOfFifths />
        </div>

        <div className={styles.section}>
          <span className={styles.eyebrow}>Calidad — Raíz {selectedRootName}</span>
          <div className={styles.qualityGrid}>
            {QUALITY_OPTIONS.map((quality) => (
              <button
                key={quality.suffix}
                type="button"
                className={styles.button}
                onClick={() => addChord(quality.suffix)}
              >
                {quality.label}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.actionButton} onClick={removeLastChord}>
              ⌫ Quitar último
            </button>
            <button type="button" className={styles.actionButton} onClick={clearProgression}>
              ✕ Limpiar
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.eyebrow}>Presets — Tonalidad {selectedRootName}</span>
          <div className={styles.presetList}>
            {PROGRESSION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetButton}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
