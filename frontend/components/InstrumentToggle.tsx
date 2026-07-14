"use client";

import { usePlayback } from "@/context/PlaybackContext";
import styles from "./InstrumentToggle.module.css";

export function InstrumentToggle() {
  const { instrument, setInstrument } = usePlayback();
  const isGuitar = instrument === "guitar";

  return (
    <div className={styles.wrapper}>
      <span className={styles.eyebrow}>Instrumento</span>

      {/* Interruptor de palanca de amplificador visto de frente: placa vertical con Bajo arriba
          (encendido = palanca hacia arriba) y Guitarra abajo, con el bat-handle cromado pivotando. */}
      <button
        type="button"
        role="switch"
        aria-checked={isGuitar}
        aria-label="Alternar entre bajo y guitarra"
        className={styles.toggle}
        onClick={() => setInstrument(isGuitar ? "bass" : "guitar")}
      >
        <span className={styles.faceplate}>
          <span className={`${styles.label} ${styles.labelTop} ${!isGuitar ? styles.labelOn : ""}`}>
            Bajo
          </span>

          <span className={styles.bezel}>
            <span className={`${styles.lever} ${isGuitar ? styles.leverDown : styles.leverUp}`}>
              <span className={styles.leverTip} />
            </span>
          </span>

          <span
            className={`${styles.label} ${styles.labelBottom} ${isGuitar ? styles.labelOn : ""}`}
          >
            Guitarra
          </span>
        </span>
      </button>
    </div>
  );
}
