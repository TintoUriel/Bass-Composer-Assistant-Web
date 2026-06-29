import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePlaybackClock } from "./usePlaybackClock";

describe("usePlaybackClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires beats 1..beatsPerMeasure in order, then wraps", () => {
    const onBeat = vi.fn();
    renderHook(() => usePlaybackClock(true, 60, 4, 1, onBeat));

    act(() => vi.advanceTimersByTime(0));
    expect(onBeat).toHaveBeenLastCalledWith(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(onBeat).toHaveBeenLastCalledWith(2);

    act(() => vi.advanceTimersByTime(1000));
    expect(onBeat).toHaveBeenLastCalledWith(3);

    act(() => vi.advanceTimersByTime(1000));
    expect(onBeat).toHaveBeenLastCalledWith(4);

    act(() => vi.advanceTimersByTime(1000));
    expect(onBeat).toHaveBeenLastCalledWith(1);
  });

  it("does not tick while not playing", () => {
    const onBeat = vi.fn();
    renderHook(() => usePlaybackClock(false, 60, 4, 1, onBeat));

    act(() => vi.advanceTimersByTime(5000));
    expect(onBeat).not.toHaveBeenCalled();
  });

  it("a BPM change mid-playback doesn't disturb the in-flight tick, only the next one", () => {
    // Igual que MetronomeService.SetBpm (repo desktop): el Timer ya armado sigue su curso con el
    // delay calculado bajo el BPM viejo; el nuevo BPM solo aplica a la programación siguiente.
    const onBeat = vi.fn();
    const { rerender } = renderHook(
      ({ bpm }) => usePlaybackClock(true, bpm, 4, 1, onBeat),
      { initialProps: { bpm: 60 } }, // 1000ms/beat
    );

    act(() => vi.advanceTimersByTime(0)); // beat 1
    act(() => vi.advanceTimersByTime(1000)); // beat 2
    expect(onBeat).toHaveBeenLastCalledWith(2);

    rerender({ bpm: 120 }); // 500ms/beat de ahora en más

    act(() => vi.advanceTimersByTime(500));
    expect(onBeat).toHaveBeenLastCalledWith(2); // el tick en vuelo todavía no llegó a su delay viejo (1000ms)

    act(() => vi.advanceTimersByTime(500)); // se completan los 1000ms originales -> beat 3
    expect(onBeat).toHaveBeenLastCalledWith(3);

    act(() => vi.advanceTimersByTime(500)); // ahora sí, el siguiente intervalo ya es de 500ms -> beat 4
    expect(onBeat).toHaveBeenLastCalledWith(4);
  });

  it("stops ticking once isPlaying flips back to false", () => {
    const onBeat = vi.fn();
    const { rerender } = renderHook(
      ({ isPlaying }) => usePlaybackClock(isPlaying, 60, 4, 1, onBeat),
      { initialProps: { isPlaying: true } },
    );

    act(() => vi.advanceTimersByTime(0));
    rerender({ isPlaying: false });
    onBeat.mockClear();

    act(() => vi.advanceTimersByTime(5000));
    expect(onBeat).not.toHaveBeenCalled();
  });
});
