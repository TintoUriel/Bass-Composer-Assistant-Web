"use client";

import { useState } from "react";
import { usePlayback } from "@/context/PlaybackContext";
import { QUALITY_OPTIONS, ROOT_OPTIONS } from "@/lib/chordPalette";
import { PROGRESSION_PRESETS } from "@/lib/presets";
import { CircleOfFifths } from "./CircleOfFifths";
import styles from "./ChordPalette.module.css";

export function ChordPalette() {
  const {
    progressionText,
    invalidTokens,
    selectedRootName,
    selectedRootPitchClass,
    selectRoot,
    addChord,
    applyPreset,
    removeLastChord,
    clearProgression,
  } = usePlayback();

  const [showCircle, setShowCircle] = useState(false);

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
          <span className={styles.eyebrow}>Raíz</span>
          <div className={styles.rootGrid}>
            {ROOT_OPTIONS.map((root) => (
              <button
                key={root.pitchClass}
                type="button"
                className={`${styles.rootButton} ${
                  root.pitchClass === selectedRootPitchClass ? styles.rootButtonActive : ""
                }`}
                onClick={() => selectRoot(root.pitchClass)}
              >
                {root.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.circleToggle}
            aria-expanded={showCircle}
            onClick={() => setShowCircle((prev) => !prev)}
          >
            {showCircle ? "▾" : "▸"} Círculo de quintas
          </button>

          {showCircle && (
            <div className={styles.circlePanel}>
              <p className={styles.circleHelp}>
                Herramienta para componer: la nota <strong>ámbar</strong> es tu tonalidad. Los dos
                gajos vecinos resaltados son los acordes que mejor suenan con ella —{" "}
                <strong>V</strong> (a la derecha) y <strong>IV</strong> (a la izquierda). La nota
                chica dentro de cada gajo es su relativo menor.
              </p>
              <CircleOfFifths />
            </div>
          )}
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
