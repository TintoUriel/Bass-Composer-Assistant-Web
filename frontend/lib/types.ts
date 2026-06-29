export type VisualizationMode = "Chord" | "Scale" | "CommonTones";

export type HighlightType =
  | "None"
  | "ChordRoot"
  | "ChordThird"
  | "ChordFifth"
  | "ChordSeventh"
  | "ChordNinth"
  | "ChordEleventh"
  | "ChordThirteenth"
  | "ScaleTonic"
  | "ScaleSecond"
  | "ScaleThird"
  | "ScaleFourth"
  | "ScaleFifth"
  | "ScaleSixth"
  | "ScaleSeventh"
  | "CommonTone";

export interface NoteDto {
  pitchClass: number;
  name: string;
}

export interface ChordToneDto {
  note: NoteDto;
  degree: string;
}

export interface ScaleToneDto {
  note: NoteDto;
  degree: string;
}

export interface ScaleDto {
  name: string;
  root: NoteDto;
  type: string;
  notes: ScaleToneDto[];
}

export interface ChordDto {
  name: string;
  root: NoteDto;
  quality: string;
  notes: ChordToneDto[];
  suggestedScale: ScaleDto;
  suggestedVoicingMidiNotes: number[];
}

export interface FretPositionDto {
  stringNumber: number;
  fret: number;
  note: NoteDto;
  octave: number;
}

export interface ParseProgressionResponse {
  chords: ChordDto[];
  invalidTokens: string[];
}

export interface HighlightMapResponse {
  highlights: Record<string, HighlightType>;
}

export interface FretboardGridResponse {
  positions: FretPositionDto[];
}
