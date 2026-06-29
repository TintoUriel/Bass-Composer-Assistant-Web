"use client";

import { usePlayback } from "@/context/PlaybackContext";
import styles from "./ProgressionTimeline.module.css";

export function ProgressionTimeline() {
  const { chords, currentChordIndex, jumpToChord } = usePlayback();

  if (chords.length === 0) {
    return <div className={styles.empty}>— Sin progresión —</div>;
  }

  return (
    <div className={styles.timeline}>
      {chords.map((chord, index) => (
        <button
          key={`${chord.name}-${index}`}
          type="button"
          title="Saltar a este acorde"
          className={`${styles.step} ${index === currentChordIndex ? styles.stepCurrent : ""}`}
          onClick={() => jumpToChord(index)}
        >
          {chord.name}
        </button>
      ))}
    </div>
  );
}
