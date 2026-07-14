import type {
  FretboardGridResponse,
  HighlightMapResponse,
  HighlightType,
  Instrument,
  ParseProgressionResponse,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5163";

export async function checkApiHealth(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error(`API health check failed: ${response.status}`);
  return response.text();
}

export async function parseProgression(text: string): Promise<ParseProgressionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/progressions/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(`Failed to parse progression: ${response.status}`);
  return response.json();
}

export async function fetchFretboard(
  fretCount = 24,
  instrument: Instrument = "bass",
): Promise<FretboardGridResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/fretboard?fretCount=${fretCount}&instrument=${instrument}`,
  );
  if (!response.ok) throw new Error(`Failed to fetch fretboard: ${response.status}`);
  return response.json();
}

async function fetchHighlightMap(path: string, body: unknown): Promise<Record<number, HighlightType>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Failed to fetch highlights: ${response.status}`);
  const data: HighlightMapResponse = await response.json();
  return Object.fromEntries(Object.entries(data.highlights).map(([k, v]) => [Number(k), v]));
}

export function fetchChordHighlights(chordSymbol: string) {
  return fetchHighlightMap("/api/highlights/chord", { chordSymbol });
}

export function fetchScaleHighlights(chordSymbol: string) {
  return fetchHighlightMap("/api/highlights/scale", { chordSymbol });
}

export function fetchTriadHighlights(chordSymbol: string) {
  return fetchHighlightMap("/api/highlights/triad", { chordSymbol });
}

export function fetchCommonTonesHighlights(chordSymbols: string[]) {
  return fetchHighlightMap("/api/highlights/common-tones", { chordSymbols });
}
