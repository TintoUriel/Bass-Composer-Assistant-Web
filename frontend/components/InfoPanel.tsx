"use client";

import { usePlayback } from "@/context/PlaybackContext";
import type { VisualizationMode } from "@/lib/types";
import styles from "./InfoPanel.module.css";

const MODE_LABELS: Record<VisualizationMode, string> = {
  Chord: "Acorde",
  Triads: "Triadas",
  Scale: "Escala",
  CommonTones: "Notas comunes",
};

export function InfoPanel() {
  const { currentChord, nextChord, currentBeat, currentMeasure, beatsPerMeasure, selectedMode } =
    usePlayback();

  return (
    <div className={styles.panel}>
      <div className={styles.chordBlock}>
        <span className={styles.eyebrow}>Acorde actual</span>
        <div className={styles.chordRow}>
          <div className={styles.chordName}>{currentChord?.name ?? "-"}</div>
          <div className={styles.chordNotes}>
            {currentChord?.notes.map((tone) => (
              <span key={tone.note.name} className={styles.noteChip}>
                {tone.note.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.counters}>
        <div className={styles.counter}>
          <span className={styles.eyebrow}>Compás</span>
          <div className={styles.value}>{currentMeasure}</div>
        </div>
        <div className={styles.counter}>
          <span className={styles.eyebrow}>Tiempo</span>
          <div className={styles.value}>
            {currentBeat} <span className={styles.valueSub}>de {beatsPerMeasure}</span>
          </div>
        </div>
        <div className={styles.counter}>
          <span className={styles.eyebrow}>Modo</span>
          <div className={styles.value}>{MODE_LABELS[selectedMode]}</div>
        </div>
        {selectedMode === "Scale" && currentChord ? (
          <div className={styles.counter}>
            <span className={styles.eyebrow}>Escala</span>
            <div className={styles.valueScale}>{currentChord.suggestedScale.name}</div>
          </div>
        ) : (
          <div className={styles.counter}>
            <span className={styles.eyebrow}>Próximo</span>
            <div className={styles.valueMuted}>{nextChord?.name ?? "-"}</div>
          </div>
        )}
      </div>
    </div>
  );
}
