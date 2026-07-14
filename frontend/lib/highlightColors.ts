import type { HighlightType } from "./types";

// Portado de Themes/HighlightColors.xaml (repo desktop, commit 8692c71).
export const highlightColors: Record<HighlightType, string> = {
  None: "transparent",

  // Roles principales del acorde alineados al handoff de Claude Design:
  // fundamental dorada, tercera teal, quinta coral.
  ChordRoot: "#e79a2a",
  ChordThird: "#3ea699",
  ChordFifth: "#cf6b48",
  ChordSeventh: "#e5c24a",
  ChordNinth: "#FB8C00",
  ChordEleventh: "#4DD0E1",
  ChordThirteenth: "#8E24AA",

  ScaleTonic: "#E53935",
  ScaleSecond: "#FB8C00",
  ScaleThird: "#43A047",
  ScaleFourth: "#4DD0E1",
  ScaleFifth: "#1E88E5",
  ScaleSixth: "#8E24AA",
  ScaleSeventh: "#FDD835",

  CommonTone: "#26A69A",
};
