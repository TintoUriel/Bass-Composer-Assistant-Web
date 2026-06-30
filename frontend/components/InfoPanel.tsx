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
      <div>
        <span className={styles.eyebrow}>Acorde actual</span>
        <div className={styles.chordName}>{currentChord?.name ?? "-"}</div>
        <div className={styles.chordNotes}>
          {currentChord ? currentChord.notes.map((tone) => tone.note.name).join(" ") : ""}
        </div>
      </div>

      <div className={styles.row}>
        <div>
          <span className={styles.eyebrow}>Compás</span>
          <div className={styles.value}>{currentMeasure}</div>
        </div>
        <div>
          <span className={styles.eyebrow}>Tiempo</span>
          <div className={styles.value}>
            {currentBeat} de {beatsPerMeasure}
          </div>
        </div>
      </div>

      <div>
        <span className={styles.eyebrow}>Modo actual</span>
        <div className={styles.value}>{MODE_LABELS[selectedMode]}</div>
      </div>

      {selectedMode === "Scale" && currentChord && (
        <div>
          <span className={styles.eyebrow}>Escala actual</span>
          <div className={styles.scaleName}>{currentChord.suggestedScale.name}</div>
          <div className={styles.scaleNotes}>
            {currentChord.suggestedScale.notes.map((tone) => tone.note.name).join(" ")}
          </div>
        </div>
      )}

      <div>
        <span className={styles.eyebrow}>Próximo acorde</span>
        <div className={styles.nextChord}>{nextChord?.name ?? "-"}</div>
      </div>
    </div>
  );
}
