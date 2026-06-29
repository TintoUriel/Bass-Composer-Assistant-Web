import type { HighlightType } from "./types";

// Portado de Themes/HighlightColors.xaml (repo desktop, commit 8692c71).
export const highlightColors: Record<HighlightType, string> = {
  None: "transparent",

  ChordRoot: "#E53935",
  ChordThird: "#43A047",
  ChordFifth: "#1E88E5",
  ChordSeventh: "#FDD835",
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
