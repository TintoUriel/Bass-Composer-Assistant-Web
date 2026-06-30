"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchChordHighlights,
  fetchCommonTonesHighlights,
  fetchFretboard,
  fetchScaleHighlights,
  fetchTriadHighlights,
  parseProgression,
} from "@/lib/api";
import { ROOT_OPTIONS } from "@/lib/chordPalette";
import { PROGRESSION_PRESETS } from "@/lib/presets";
import type { ChordDto, FretPositionDto, HighlightType, VisualizationMode } from "@/lib/types";
import { usePlaybackClock } from "@/hooks/usePlaybackClock";
import { getAudioContext } from "@/lib/audio/audioContext";
import { playChordStab } from "@/lib/audio/chordStab";
import { playMetronomeClick } from "@/lib/audio/metronomeClick";

// Repo desktop, commit 8692c71: ChordProgression.BeatsPerMeasure/MeasuresPerChord son siempre 4/1
// para progresiones armadas desde la paleta de acordes (no hay UI para cambiarlos en v1, ni el
// endpoint /api/progressions/parse los expone), así que se fijan acá en vez de pedirlos a la API.
const BEATS_PER_MEASURE = 4;
const MEASURES_PER_CHORD = 1;

interface PlaybackPosition {
  beat: number;
  measure: number;
  chordIndex: number;
}

const INITIAL_POSITION: PlaybackPosition = { beat: 1, measure: 1, chordIndex: 0 };

interface PlaybackContextValue {
  progressionText: string;
  chords: ChordDto[];
  invalidTokens: string[];
  selectedRootPitchClass: number;
  selectedRootName: string;

  bpm: number;
  volume: number;
  isMetronomeMuted: boolean;
  isChordSoundEnabled: boolean;

  isPlaying: boolean;
  selectedMode: VisualizationMode;
  beatsPerMeasure: number;
  currentBeat: number;
  currentMeasure: number;
  currentChordIndex: number;
  currentChord: ChordDto | null;
  nextChord: ChordDto | null;

  fretboardPositions: FretPositionDto[];
  highlights: Record<number, HighlightType>;

  selectRoot: (pitchClass: number) => void;
  addChord: (suffix: string) => void;
  applyPreset: (presetId: string) => void;
  removeLastChord: () => void;
  clearProgression: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  jumpToChord: (index: number) => void;
  setBpm: (bpm: number) => void;
  setVolume: (volume: number) => void;
  setMetronomeMuted: (muted: boolean) => void;
  setChordSoundEnabled: (enabled: boolean) => void;
  setSelectedMode: (mode: VisualizationMode) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [progressionText, setProgressionText] = useState("");
  const [chords, setChords] = useState<ChordDto[]>([]);
  const [invalidTokens, setInvalidTokens] = useState<string[]>([]);

  const [selectedRootPitchClass, setSelectedRootPitchClass] = useState(0);

  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(80);
  const [isMetronomeMuted, setMetronomeMuted] = useState(false);
  const [isChordSoundEnabled, setChordSoundEnabled] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<VisualizationMode>("Chord");
  const [position, setPosition] = useState<PlaybackPosition>(INITIAL_POSITION);

  const [fretboardPositions, setFretboardPositions] = useState<FretPositionDto[]>([]);
  const [highlights, setHighlights] = useState<Record<number, HighlightType>>({});

  const chordsRef = useRef(chords);
  const positionRef = useRef(position);
  const volumeRef = useRef(volume);
  const isMetronomeMutedRef = useRef(isMetronomeMuted);
  const isChordSoundEnabledRef = useRef(isChordSoundEnabled);

  useEffect(() => {
    chordsRef.current = chords;
  }, [chords]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMetronomeMutedRef.current = isMetronomeMuted;
  }, [isMetronomeMuted]);

  useEffect(() => {
    isChordSoundEnabledRef.current = isChordSoundEnabled;
  }, [isChordSoundEnabled]);

  const isFirstBeatSincePlayRef = useRef(false);

  const selectedRootName =
    ROOT_OPTIONS.find((option) => option.pitchClass === selectedRootPitchClass)?.name ?? "C";

  // Carga el grid del diapasón una sola vez: es estático para una afinación/cantidad de trastes fija.
  useEffect(() => {
    fetchFretboard(24).then((response) => setFretboardPositions(response.positions));
  }, []);

  // Reparseo de la progresión en cada cambio de texto (palette-driven, sin debounce porque no
  // hay un campo de texto libre: cada click agrega/quita un token completo). La posición apunta
  // al último acorde, no al primero: addChord/removeLastChord tocan el final de la progresión, y
  // es ese el acorde que el usuario espera escuchar al hacer click en la paleta.
  useEffect(() => {
    parseProgression(progressionText).then((result) => {
      setChords(result.chords);
      setInvalidTokens(result.invalidTokens);
      setIsPlaying(false);
      setPosition({ ...INITIAL_POSITION, chordIndex: Math.max(result.chords.length - 1, 0) });
    });
  }, [progressionText]);

  const currentChord = chords.length > 0 ? chords[position.chordIndex] ?? null : null;
  const nextChord =
    chords.length > 0 ? chords[(position.chordIndex + 1) % chords.length] : null;

  // Recalcula highlights del diapasón cada vez que cambia el acorde actual, el modo, o la
  // progresión entera (Notas Comunes depende de todos los acordes, no solo del actual).
  useEffect(() => {
    async function loadHighlights() {
      if (!currentChord) {
        setHighlights({});
        return;
      }

      const map =
        selectedMode === "Chord"
          ? await fetchChordHighlights(currentChord.name)
          : selectedMode === "Triads"
            ? await fetchTriadHighlights(currentChord.name)
            : selectedMode === "Scale"
              ? await fetchScaleHighlights(currentChord.name)
              : await fetchCommonTonesHighlights(chords.map((chord) => chord.name));

      setHighlights(map);
    }

    loadHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChord?.name, selectedMode, chords]);

  // Reproduce el chord stab cada vez que cambia el acorde actual — al avanzar durante la
  // reproducción, pero también al saltar manualmente en la timeline o al recargar la progresión
  // (mismo comportamiento que RefreshChordDisplay en MainViewModel, repo desktop commit 8692c71:
  // se dispara con el evento ChordChanged, no solo durante el playback).
  useEffect(() => {
    if (currentChord && isChordSoundEnabledRef.current) {
      playChordStab(currentChord.suggestedVoicingMidiNotes);
    }
  }, [currentChord]);

  const handleBeat = useCallback((beatInMeasure: number) => {
    if (!isMetronomeMutedRef.current) {
      playMetronomeClick(volumeRef.current / 100, beatInMeasure === 1);
    }

    const totalMeasures = chordsRef.current.length * MEASURES_PER_CHORD;
    if (totalMeasures === 0) return;

    const pos = { ...positionRef.current };

    if (isFirstBeatSincePlayRef.current) {
      isFirstBeatSincePlayRef.current = false;
      pos.beat = beatInMeasure;
      setPosition(pos);
      return;
    }

    pos.beat = beatInMeasure;

    if (beatInMeasure === 1) {
      const nextMeasure = pos.measure + 1 > totalMeasures ? 1 : pos.measure + 1;
      pos.measure = nextMeasure;
      pos.chordIndex = Math.floor((nextMeasure - 1) / MEASURES_PER_CHORD) % chordsRef.current.length;
    }

    setPosition(pos);
  }, []);

  usePlaybackClock(isPlaying, bpm, BEATS_PER_MEASURE, position.beat, handleBeat);

  const selectRoot = useCallback((pitchClass: number) => setSelectedRootPitchClass(pitchClass), []);

  const addChord = useCallback(
    (suffix: string) => {
      const token = selectedRootName + suffix;
      setProgressionText((prev) => (prev.length === 0 ? token : `${prev} ${token}`));
    },
    [selectedRootName],
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = PROGRESSION_PRESETS.find((candidate) => candidate.id === presetId);
      if (!preset) return;

      const tokens = preset.steps.map((step) => {
        const pitchClass = (selectedRootPitchClass + step.semitonesFromRoot) % 12;
        const rootName = ROOT_OPTIONS.find((option) => option.pitchClass === pitchClass)?.name ?? "C";
        return rootName + step.suffix;
      });

      setProgressionText(tokens.join(" "));
    },
    [selectedRootPitchClass],
  );

  const removeLastChord = useCallback(() => {
    setProgressionText((prev) => {
      const tokens = prev.split(/\s+/).filter((token) => token.length > 0);
      return tokens.length <= 1 ? "" : tokens.slice(0, -1).join(" ");
    });
  }, []);

  const clearProgression = useCallback(() => setProgressionText(""), []);

  const play = useCallback(() => {
    if (chordsRef.current.length === 0 || isPlaying) return;
    getAudioContext(); // desbloquea el AudioContext dentro del gesto de click del usuario
    isFirstBeatSincePlayRef.current = true;
    setIsPlaying(true);
  }, [isPlaying]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setPosition(INITIAL_POSITION);
  }, []);

  const jumpToChord = useCallback((index: number) => {
    const chordCount = chordsRef.current.length;
    if (chordCount === 0) return;

    const normalized = ((index % chordCount) + chordCount) % chordCount;
    setPosition({
      chordIndex: normalized,
      measure: normalized * MEASURES_PER_CHORD + 1,
      beat: 1,
    });
  }, []);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      progressionText,
      chords,
      invalidTokens,
      selectedRootPitchClass,
      selectedRootName,

      bpm,
      volume,
      isMetronomeMuted,
      isChordSoundEnabled,

      isPlaying,
      selectedMode,
      beatsPerMeasure: BEATS_PER_MEASURE,
      currentBeat: position.beat,
      currentMeasure: position.measure,
      currentChordIndex: position.chordIndex,
      currentChord,
      nextChord,

      fretboardPositions,
      highlights,

      selectRoot,
      addChord,
      applyPreset,
      removeLastChord,
      clearProgression,
      play,
      pause,
      stop,
      jumpToChord,
      setBpm,
      setVolume,
      setMetronomeMuted,
      setChordSoundEnabled,
      setSelectedMode,
    }),
    [
      progressionText,
      chords,
      invalidTokens,
      selectedRootPitchClass,
      selectedRootName,
      bpm,
      volume,
      isMetronomeMuted,
      isChordSoundEnabled,
      isPlaying,
      selectedMode,
      position,
      currentChord,
      nextChord,
      fretboardPositions,
      highlights,
      selectRoot,
      addChord,
      applyPreset,
      removeLastChord,
      clearProgression,
      play,
      pause,
      stop,
      jumpToChord,
    ],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext);
  if (!context) throw new Error("usePlayback must be used within a PlaybackProvider");
  return context;
}
