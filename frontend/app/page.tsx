"use client";

import { useEffect, useState } from "react";
import { ChordPalette } from "@/components/ChordPalette";
import { Fretboard } from "@/components/Fretboard";
import { InfoPanel } from "@/components/InfoPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { ProgressionTimeline } from "@/components/ProgressionTimeline";
import { TransportControls } from "@/components/TransportControls";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { checkApiHealth } from "@/lib/api";
import styles from "./page.module.css";

export default function Home() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  return (
    <PlaybackProvider>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.brand}>
            BASS COMPOSER<span className={styles.brandAccent}>ASSISTANT</span>
          </h1>
          <div className={styles.status} title={`Backend: ${apiStatus}`}>
            <span
              className={`${styles.statusLed} ${
                apiStatus === "ok"
                  ? styles.statusLedOk
                  : apiStatus === "error"
                    ? styles.statusLedError
                    : ""
              }`}
            />
            <span className={styles.statusLabel}>
              {apiStatus === "checking" && "Conectando…"}
              {apiStatus === "ok" && "Backend conectado"}
              {apiStatus === "error" && "Backend sin conexión"}
            </span>
          </div>
        </header>

        <div className={`${styles.panel} ${styles.transportBar}`}>
          <TransportControls />
          <div className={styles.transportDivider} />
          <ModeSelector />
        </div>

        <main className={styles.main}>
          <div className={`${styles.panel} ${styles.paletteColumn}`}>
            <ChordPalette />
          </div>

          <div className={styles.centerColumn}>
            <div className={`${styles.panel} ${styles.fretboardPanel}`}>
              <Fretboard />
            </div>
            <div className={`${styles.panel} ${styles.infoStrip}`}>
              <div className={styles.progBlock}>
                <span className={styles.eyebrow}>Progresión</span>
                <ProgressionTimeline />
              </div>
              <div className={styles.stripDivider} />
              <InfoPanel />
            </div>
          </div>
        </main>
      </div>
    </PlaybackProvider>
  );
}
