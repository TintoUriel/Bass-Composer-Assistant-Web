"use client";

import { usePlayback } from "@/context/PlaybackContext";
import styles from "./TransportControls.module.css";

export function TransportControls() {
  const {
    isPlaying,
    chords,
    bpm,
    volume,
    isMetronomeMuted,
    isChordSoundEnabled,
    currentBeat,
    beatsPerMeasure,
    play,
    pause,
    stop,
    setBpm,
    setVolume,
    setMetronomeMuted,
    setChordSoundEnabled,
  } = usePlayback();

  return (
    <div className={styles.transport}>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.transportButton}
          title="Play"
          disabled={isPlaying || chords.length === 0}
          onClick={play}
        >
          ▶
        </button>
        <button
          type="button"
          className={styles.transportButton}
          title="Pause"
          disabled={!isPlaying}
          onClick={pause}
        >
          ⏸
        </button>
        <button type="button" className={styles.transportButton} title="Stop" onClick={stop}>
          ■
        </button>
      </div>

      <div className={styles.faderGroup}>
        <span className={styles.eyebrow}>Tiempo</span>
        <div className={styles.beatLamps}>
          {Array.from({ length: beatsPerMeasure }, (_, index) => index + 1).map((beat) => (
            <span
              key={`${beat}-${currentBeat}`}
              className={`${styles.beatLamp} ${beat === currentBeat ? styles.beatLampLit : ""}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.faderGroup}>
        <span className={styles.eyebrow}>BPM</span>
        <div className={styles.faderRow}>
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
          />
          <span className={styles.faderValue}>{bpm}</span>
        </div>
      </div>

      <div className={styles.faderGroup}>
        <span className={styles.eyebrow}>Vol</span>
        <div className={styles.faderRow}>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
          <span className={styles.faderValue}>{volume}</span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.toggle} ${!isMetronomeMuted ? styles.toggleActive : ""}`}
        title="Silenciar/activar el click del metrónomo"
        onClick={() => setMetronomeMuted(!isMetronomeMuted)}
      >
        Metrónomo
      </button>

      <button
        type="button"
        className={`${styles.toggle} ${isChordSoundEnabled ? styles.toggleActive : ""}`}
        title="Activar/desactivar que se escuche el acorde actual"
        onClick={() => setChordSoundEnabled(!isChordSoundEnabled)}
      >
        Tocar acorde
      </button>
    </div>
  );
}
