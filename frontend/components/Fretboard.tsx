"use client";

import { usePlayback } from "@/context/PlaybackContext";
import {
  FRET_LABEL_Y,
  INTERIOR_FRET_WIRE_X_POSITIONS,
  MARKER_CENTER_Y,
  MARKER_FRETS,
  NECK_HEIGHT,
  NECK_WIDTH,
  NUT_MARGIN,
  STRING_AREA_HEIGHT,
  STRING_AREA_TOP,
  getNoteX,
  getStringY,
} from "@/lib/fretboardGeometry";
import { highlightColors } from "@/lib/highlightColors";
import styles from "./Fretboard.module.css";

const STRING_NUMBERS = [1, 2, 3, 4];

export function Fretboard() {
  const { fretboardPositions, highlights } = usePlayback();

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${NECK_WIDTH} ${NECK_HEIGHT}`}
        role="img"
        aria-label="Diapasón"
      >
        <defs>
          {/* Diapasón de ébano: casi negro, frío, para integrarse al chasis de grafito. */}
          <linearGradient id="neck-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#26292c" />
            <stop offset="0.5" stopColor="#1a1c1e" />
            <stop offset="1" stopColor="#141618" />
          </linearGradient>
          <radialGradient id="position-marker" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#dfe3e6" />
            <stop offset="1" stopColor="#a9afb4" />
          </radialGradient>
        </defs>

        <rect width={NECK_WIDTH} height={NECK_HEIGHT} fill="url(#neck-wood)" />

        {/* Cejilla */}
        <rect
          x={NUT_MARGIN}
          y={STRING_AREA_TOP}
          width={6}
          height={STRING_AREA_HEIGHT}
          fill="#c9ced2"
        />

        {/* Trastes */}
        {INTERIOR_FRET_WIRE_X_POSITIONS.map((x, index) => (
          <rect
            key={`fretwire-${index}`}
            x={x - 1}
            y={STRING_AREA_TOP}
            width={2}
            height={STRING_AREA_HEIGHT}
            fill="#767c82"
          />
        ))}

        {/* Marcadores de posición */}
        {MARKER_FRETS.map((fret) => (
          <circle
            key={`marker-${fret}`}
            cx={getNoteX(fret)}
            cy={MARKER_CENTER_Y}
            r={5}
            fill="url(#position-marker)"
          />
        ))}

        {/* Números de traste */}
        {MARKER_FRETS.map((fret) => (
          <text
            key={`fretlabel-${fret}`}
            x={getNoteX(fret)}
            y={FRET_LABEL_Y}
            className={styles.fretLabel}
          >
            {fret}
          </text>
        ))}

        {/* Cuerdas */}
        {STRING_NUMBERS.map((stringNumber) => (
          <line
            key={`string-${stringNumber}`}
            x1={NUT_MARGIN}
            x2={NECK_WIDTH}
            y1={getStringY(stringNumber)}
            y2={getStringY(stringNumber)}
            stroke="#9aa0a6"
            strokeWidth={2}
          />
        ))}

        {/* Notas */}
        {fretboardPositions.map((position) => {
          const highlightType = highlights[position.note.pitchClass] ?? "None";
          const isHighlighted = highlightType !== "None";
          const cx = getNoteX(position.fret);
          const cy = getStringY(position.stringNumber);

          return (
            <g key={`${position.stringNumber}-${position.fret}`}>
              <circle cx={cx} cy={cy} r={10} fill="#3a3f43" opacity={0.65} />
              <text x={cx} y={cy} className={styles.noteLabel}>
                {position.note.name}
              </text>

              {isHighlighted && (
                <>
                  <circle cx={cx} cy={cy} r={14} fill={highlightColors[highlightType]} />
                  <text x={cx} y={cy} className={`${styles.noteLabel} ${styles.noteLabelHighlighted}`}>
                    {position.note.name}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
