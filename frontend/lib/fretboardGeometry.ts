// Portado de Converters/FretboardGeometry.cs (repo desktop, commit 8692c71). Trastes con
// espaciado real de escala (longitud de cuerda / 2^(traste/12)), no espaciado uniforme.
export const SCALE_LENGTH = 1500;
export const NUT_MARGIN = 40;
export const TOP_MARGIN = 30;
export const ROW_HEIGHT = 50;
export const FRET_COUNT = 24;

export const MARKER_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export function getFretWireX(fret: number): number {
  return NUT_MARGIN + SCALE_LENGTH - SCALE_LENGTH / Math.pow(2, fret / 12);
}

export const FRET_WIRE_X_POSITIONS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) =>
  getFretWireX(fret),
);

export const INTERIOR_FRET_WIRE_X_POSITIONS = FRET_WIRE_X_POSITIONS.slice(1);

export const NECK_WIDTH = getFretWireX(FRET_COUNT) + NUT_MARGIN;

export const STRING_AREA_TOP = TOP_MARGIN - 10;

// El eje vertical depende de la cantidad de cuerdas (bajo = 4, guitarra = 6), así que estas
// medidas se calculan por afinación en vez de fijarse a un layout de 4 cuerdas.
export function getNeckHeight(stringCount: number): number {
  return TOP_MARGIN * 2 + (stringCount - 1) * ROW_HEIGHT;
}

export function getStringAreaHeight(stringCount: number): number {
  return (stringCount - 1) * ROW_HEIGHT + 20;
}

export function getMarkerCenterY(stringCount: number): number {
  return TOP_MARGIN + ((stringCount - 1) * ROW_HEIGHT) / 2;
}

export function getFretLabelY(stringCount: number): number {
  return STRING_AREA_TOP + getStringAreaHeight(stringCount) + 4;
}

// Las notas se dibujan en el punto medio de su segmento de traste (la cuerda al aire va en la cejilla).
export function getNoteX(fret: number): number {
  return fret === 0 ? getFretWireX(0) : (getFretWireX(fret - 1) + getFretWireX(fret)) / 2;
}

export function getStringY(stringNumber: number): number {
  return TOP_MARGIN + (stringNumber - 1) * ROW_HEIGHT;
}
