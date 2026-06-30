"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./Knob.module.css";

const START_ANGLE = -135;
const SWEEP = 270;
const BODY_RADIUS = 32;

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue?: string;
  onChange: (value: number) => void;
  size?: number;
  /** Píxeles de arrastre vertical que cubren el recorrido completo de la perilla. */
  dragRange?: number;
}

export function Knob({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  onChange,
  size = 72,
  dragRange = 160,
}: KnobProps) {
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gradientId = useId();

  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, v)), [min, max]);
  const roundToStep = useCallback((v: number) => Math.round(v / step) * step, [step]);

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(event: PointerEvent) {
      if (!dragState.current) return;
      const deltaY = dragState.current.startY - event.clientY;
      const range = event.shiftKey ? dragRange * 4 : dragRange;
      const sensitivity = (max - min) / range;
      onChange(clamp(roundToStep(dragState.current.startValue + deltaY * sensitivity)));
    }

    function handleUp() {
      dragState.current = null;
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging, max, min, dragRange, clamp, roundToStep, onChange]);

  function handlePointerDown(event: React.PointerEvent) {
    event.preventDefault();
    dragState.current = { startY: event.clientY, startValue: value };
    setIsDragging(true);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const bigStep = step * 10;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        event.preventDefault();
        onChange(clamp(roundToStep(value + step)));
        break;
      case "ArrowDown":
      case "ArrowLeft":
        event.preventDefault();
        onChange(clamp(roundToStep(value - step)));
        break;
      case "PageUp":
        event.preventDefault();
        onChange(clamp(roundToStep(value + bigStep)));
        break;
      case "PageDown":
        event.preventDefault();
        onChange(clamp(roundToStep(value - bigStep)));
        break;
      case "Home":
        event.preventDefault();
        onChange(min);
        break;
      case "End":
        event.preventDefault();
        onChange(max);
        break;
    }
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    onChange(clamp(roundToStep(value + direction * step)));
  }

  const fraction = (clamp(value) - min) / (max - min);
  const angle = START_ANGLE + fraction * SWEEP;

  return (
    <div className={styles.knobControl} style={{ width: size }}>
      <span className={styles.label}>{label}</span>
      <div
        className={`${styles.dialWrapper} ${isDragging ? styles.dialWrapperActive : ""}`}
        style={{ width: size, height: size }}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue ?? String(value)}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
      >
        <svg viewBox="0 0 100 100" className={styles.dialSvg}>
          <defs>
            <radialGradient id={gradientId} cx="35%" cy="28%" r="75%">
              <stop offset="0%" stopColor="#2c2c2c" />
              <stop offset="55%" stopColor="#161616" />
              <stop offset="100%" stopColor="#050505" />
            </radialGradient>
          </defs>
          <circle cx={50} cy={50} r={BODY_RADIUS} fill={`url(#${gradientId})`} />
          <g transform={`rotate(${angle} 50 50)`}>
            <line
              x1={50}
              y1={36}
              x2={50}
              y2={16}
              stroke="#f1ecdf"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      <span className={styles.value}>{displayValue ?? value}</span>
    </div>
  );
}
