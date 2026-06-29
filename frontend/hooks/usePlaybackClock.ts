"use client";

import { useEffect, useRef } from "react";

interface ClockState {
  beatIndex: number;
  scheduleStartBeatIndex: number;
  scheduleStartMs: number;
  nextFireAtMs: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

/**
 * Reemplazo client-side de MetronomeService (repo desktop, commit 8692c71): cada beat se
 * reprograma contra un tiempo-transcurrido-esperado calculado con performance.now(), en vez de
 * limitarse a volver a armar un setTimeout de duración fija — así no se acumula drift a BPM alto.
 *
 * Un cambio de BPM a mitad de la reproducción rebasa el cálculo desde "ahora" (igual que
 * MetronomeService.SetBpm) pero sin tocar el setTimeout ya armado: ese sigue su curso con el
 * delay que ya tenía calculado bajo el BPM viejo — solo el tick SIGUIENTE usa el nuevo intervalo.
 * Por eso el loop de inicio/parada solo depende de isPlaying, y bpm/beatsPerMeasure se leen vía
 * ref dentro del propio loop en vez de ser dependencias del efecto.
 */
export function usePlaybackClock(
  isPlaying: boolean,
  bpm: number,
  beatsPerMeasure: number,
  startingBeat: number,
  onBeat: (beatInMeasure: number) => void,
) {
  const onBeatRef = useRef(onBeat);
  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);

  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  const clock = useRef<ClockState>({
    beatIndex: 0,
    scheduleStartBeatIndex: 0,
    scheduleStartMs: 0,
    nextFireAtMs: 0,
    timeoutId: null,
  });

  useEffect(() => {
    const state = clock.current;
    if (!isPlaying) return;

    const beatsPerMeasureNow = beatsPerMeasureRef.current;
    const normalized =
      (((startingBeat - 1) % beatsPerMeasureNow) + beatsPerMeasureNow) % beatsPerMeasureNow;

    state.beatIndex = normalized;
    state.scheduleStartBeatIndex = normalized;
    state.scheduleStartMs = performance.now();

    const scheduleNext = (fireImmediately: boolean) => {
      const fire = () => {
        const beatInMeasure = (state.beatIndex % beatsPerMeasureRef.current) + 1;
        state.beatIndex += 1;
        onBeatRef.current(beatInMeasure);
        scheduleNext(false);
      };

      if (fireImmediately) {
        state.nextFireAtMs = performance.now();
        state.timeoutId = setTimeout(fire, 0);
        return;
      }

      const beatIntervalMs = 60_000 / Math.max(1, bpmRef.current);
      const beatsSinceStart = state.beatIndex - state.scheduleStartBeatIndex;
      const expectedElapsedMs = state.scheduleStartMs + beatsSinceStart * beatIntervalMs;
      state.nextFireAtMs = expectedElapsedMs;
      const delay = Math.max(0, expectedElapsedMs - performance.now());
      state.timeoutId = setTimeout(fire, delay);
    };

    scheduleNext(true);

    return () => {
      if (state.timeoutId) clearTimeout(state.timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (!isPlaying) return;

    // Rebase against the in-flight tick's already-known target time, not "now": the armed
    // setTimeout keeps firing at that time regardless of this effect, so the anchor for the
    // *following* tick (computed once the in-flight one fires) must originate there too —
    // anchoring to "now" instead would make that next delay computation race against a target
    // time already in the past.
    const state = clock.current;
    state.scheduleStartMs = state.nextFireAtMs;
    state.scheduleStartBeatIndex = state.beatIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);
}
