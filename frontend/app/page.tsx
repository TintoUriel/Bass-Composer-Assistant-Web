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
          <h1>
            BASS COMPOSER<span className={styles.brandAccent}> · ASSISTANT</span>
          </h1>
          <span className={styles.apiStatus}>
            Backend:{" "}
            {apiStatus === "checking" && "comprobando..."}
            {apiStatus === "ok" && "✅ conectado"}
            {apiStatus === "error" && "❌ sin conexión"}
          </span>
        </header>

        <main className={styles.main}>
          <div className={styles.center}>
            <div className={styles.panel}>
              <ChordPalette />
            </div>

            <div className={styles.panel}>
              <div className={styles.transportRow}>
                <TransportControls />
                <ModeSelector />
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelRow}>
                <span className={styles.eyebrow}>Pasos</span>
                <ProgressionTimeline />
              </div>
            </div>

            <span className={styles.sectionLabel}>Mástil</span>
            <div className={styles.panel}>
              <Fretboard />
            </div>
          </div>

          <div className={styles.panel}>
            <InfoPanel />
          </div>
        </main>
      </div>
    </PlaybackProvider>
  );
}
