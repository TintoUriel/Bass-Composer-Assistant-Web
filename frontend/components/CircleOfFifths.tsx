"use client";

import { usePlayback } from "@/context/PlaybackContext";
import { CIRCLE_OF_FIFTHS } from "@/lib/chordPalette";
import styles from "./CircleOfFifths.module.css";

const CENTER = 50;
const MAJOR_OUTER_RADIUS = 48;
const MAJOR_INNER_RADIUS = 33;
const MINOR_LABEL_RADIUS = 24;
const SEGMENT_ANGLE = 360 / CIRCLE_OF_FIFTHS.length;

const NAME_BY_PITCH_CLASS = new Map(CIRCLE_OF_FIFTHS.map((root) => [root.pitchClass, root.name]));

// La relativa menor de cada tonalidad mayor está una tercera menor abajo (o, en semitonos
// dentro de una octava, +9): comparten armadura, por eso ocupan el mismo gajo del círculo.
function relativeMinorName(majorPitchClass: number) {
  const minorPitchClass = (majorPitchClass + 9) % 12;
  return `${NAME_BY_PITCH_CLASS.get(minorPitchClass)}m`;
}

function polarToCartesian(radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

function describeSegment(outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polarToCartesian(outerRadius, endAngle);
  const outerEnd = polarToCartesian(outerRadius, startAngle);
  const innerStart = polarToCartesian(innerRadius, endAngle);
  const innerEnd = polarToCartesian(innerRadius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function CircleOfFifths() {
  const { selectedRootPitchClass, selectedRootName, selectRoot } = usePlayback();

  const selectedIndex = CIRCLE_OF_FIFTHS.findIndex((root) => root.pitchClass === selectedRootPitchClass);
  const dominantIndex = (selectedIndex + 1) % CIRCLE_OF_FIFTHS.length;
  const subdominantIndex = (selectedIndex - 1 + CIRCLE_OF_FIFTHS.length) % CIRCLE_OF_FIFTHS.length;

  return (
    <div className={styles.wrapper}>
      <svg viewBox="0 0 100 100" role="img" aria-label="Círculo de quintas" className={styles.svg}>
        {CIRCLE_OF_FIFTHS.map((root, index) => {
          const startAngle = index * SEGMENT_ANGLE;
          const endAngle = startAngle + SEGMENT_ANGLE;
          const midAngle = startAngle + SEGMENT_ANGLE / 2;
          const majorLabelPos = polarToCartesian((MAJOR_OUTER_RADIUS + MAJOR_INNER_RADIUS) / 2, midAngle);
          const minorLabelPos = polarToCartesian(MINOR_LABEL_RADIUS, midAngle);

          const isSelected = index === selectedIndex;
          const isDominant = index === dominantIndex;
          const isSubdominant = index === subdominantIndex;
          const titleText =
            `${root.name} mayor` +
            (isSelected ? " — tonalidad actual" : "") +
            (isDominant ? " — dominante (V)" : "") +
            (isSubdominant ? " — subdominante (IV)" : "");

          return (
            <g
              key={root.pitchClass}
              className={styles.segment}
              onClick={() => selectRoot(root.pitchClass)}
            >
              <title>{titleText}</title>
              <path
                d={describeSegment(MAJOR_OUTER_RADIUS, MAJOR_INNER_RADIUS, startAngle, endAngle)}
                className={[
                  styles.wedge,
                  isSelected ? styles.wedgeSelected : "",
                  isDominant ? styles.wedgeDominant : "",
                  isSubdominant ? styles.wedgeSubdominant : "",
                ].join(" ")}
              />
              <text
                x={majorLabelPos.x}
                y={majorLabelPos.y}
                className={`${styles.label} ${isSelected ? styles.labelSelected : ""}`}
              >
                {root.name}
              </text>
              <text x={minorLabelPos.x} y={minorLabelPos.y} className={styles.minorLabel}>
                {relativeMinorName(root.pitchClass)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className={styles.center}>
        <span className={styles.centerLabel}>Tonalidad</span>
        <span className={styles.centerValue}>{selectedRootName}</span>
        <span className={styles.centerHint}>
          V {NAME_BY_PITCH_CLASS.get(CIRCLE_OF_FIFTHS[dominantIndex].pitchClass)} · IV{" "}
          {NAME_BY_PITCH_CLASS.get(CIRCLE_OF_FIFTHS[subdominantIndex].pitchClass)}
        </span>
      </div>
    </div>
  );
}
