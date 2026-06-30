"use client";

import { usePlayback } from "@/context/PlaybackContext";
import { Knob } from "./Knob";
import styles from "./TransportControls.module.css";

const MIN_BPM = 40;
const MAX_BPM = 400;

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

      <Knob
        label="BPM"
        min={MIN_BPM}
        max={MAX_BPM}
        step={1}
        value={bpm}
        onChange={setBpm}
        dragRange={220}
      />

      <Knob label="Vol" min={0} max={100} step={1} value={volume} onChange={setVolume} />

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
