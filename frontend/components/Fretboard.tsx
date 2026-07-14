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

/** Texto oscuro sobre dots claros (dorado/coral), blanco sobre los oscuros (escala). */
function labelColorFor(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? "#20180d" : "#fff";
}

export function Fretboard() {
  const { fretboardPositions, highlights } = usePlayback();

  return (
    <div className={styles.board}>
      <div className={styles.wrapper}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${NECK_WIDTH} ${NECK_HEIGHT}`}
          role="img"
          aria-label="Diapasón"
        >
          <defs>
            {/* Diapasón de madera clara, cálido. */}
            <linearGradient id="neck-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6bd83" />
              <stop offset="0.46" stopColor="#d6a768" />
              <stop offset="1" stopColor="#c69350" />
            </linearGradient>
            <radialGradient id="position-marker" cx="0.35" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#3a2a18" />
              <stop offset="1" stopColor="#2e2013" />
            </radialGradient>
          </defs>

          <rect width={NECK_WIDTH} height={NECK_HEIGHT} fill="url(#neck-wood)" rx={6} />

          {/* Cejilla */}
          <rect
            x={NUT_MARGIN}
            y={STRING_AREA_TOP}
            width={6}
            height={STRING_AREA_HEIGHT}
            fill="#efe9db"
          />

          {/* Trastes */}
          {INTERIOR_FRET_WIRE_X_POSITIONS.map((x, index) => (
            <rect
              key={`fretwire-${index}`}
              x={x - 1}
              y={STRING_AREA_TOP}
              width={2}
              height={STRING_AREA_HEIGHT}
              fill="rgba(60,50,42,0.85)"
            />
          ))}

          {/* Marcadores de posición (inlays) */}
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
              stroke="#d8ccb2"
              strokeWidth={1.5 + stringNumber * 0.6}
            />
          ))}

          {/* Notas */}
          {fretboardPositions.map((position) => {
            const highlightType = highlights[position.note.pitchClass] ?? "None";
            const isHighlighted = highlightType !== "None";
            const cx = getNoteX(position.fret);
            const cy = getStringY(position.stringNumber);

            if (!isHighlighted) {
              return (
                <text
                  key={`${position.stringNumber}-${position.fret}`}
                  x={cx}
                  y={cy}
                  className={styles.faintNote}
                >
                  {position.note.name}
                </text>
              );
            }

            const color = highlightColors[highlightType];
            return (
              <g key={`${position.stringNumber}-${position.fret}`}>
                <circle cx={cx} cy={cy} r={13} fill={color} className={styles.dot} />
                {/* Brillo cenital que da volumen al dot. */}
                <circle cx={cx - 3.5} cy={cy - 4} r={4.5} fill="rgba(255,255,255,0.5)" />
                <text
                  x={cx}
                  y={cy}
                  className={styles.dotLabel}
                  fill={labelColorFor(color)}
                >
                  {position.note.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: highlightColors.ChordRoot }} />
          Fundamental
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: highlightColors.ChordThird }} />
          Tercera
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: highlightColors.ChordFifth }} />
          Quinta
        </span>
      </div>
    </div>
  );
}
