"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./Knob.module.css";

const START_ANGLE = -135;
const SWEEP = 270;
const BODY_RADIUS = 27;
const ARC_RADIUS = 40;

/** Punto sobre el dial: ángulo 0 = arriba, sentido horario positivo (igual que la aguja). */
function pointOnDial(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + radius * Math.sin(rad), y: 50 - radius * Math.cos(rad) };
}

function describeArc(startAngle: number, endAngle: number, radius: number) {
  const start = pointOnDial(startAngle, radius);
  const end = pointOnDial(endAngle, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

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
  // Un arco de longitud ~0 no se dibuja: aseguramos un mínimo visible cuando hay algo de valor.
  const valueEndAngle = fraction > 0 ? angle : START_ANGLE;

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
            {/* Tapa de la perilla: metal cálido oscuro con luz cenital tenue. */}
            <radialGradient id={`${gradientId}-cap`} cx="38%" cy="30%" r="82%">
              <stop offset="0%" stopColor="#4c463d" />
              <stop offset="72%" stopColor="#211d18" />
              <stop offset="100%" stopColor="#141009" />
            </radialGradient>
            {/* Bisel de metal maquinado cálido: reflejo sutil. */}
            <linearGradient id={`${gradientId}-chrome`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6f6656" />
              <stop offset="45%" stopColor="#2b261f" />
              <stop offset="100%" stopColor="#544c3f" />
            </linearGradient>
          </defs>

          {/* Riel de fondo con la extensión total del recorrido */}
          <path
            d={describeArc(START_ANGLE, START_ANGLE + SWEEP, ARC_RADIUS)}
            className={styles.arcTrack}
          />
          {/* Arco de nivel: crece con el valor (indicador retroiluminado ámbar) */}
          <path d={describeArc(START_ANGLE, valueEndAngle, ARC_RADIUS)} className={styles.arcValue} />

          {/* Bisel cromado + tapa de la perilla */}
          <circle
            cx={50}
            cy={50}
            r={BODY_RADIUS + 2.5}
            fill={`url(#${gradientId}-chrome)`}
            className={styles.bezel}
          />
          <circle cx={50} cy={50} r={BODY_RADIUS} fill={`url(#${gradientId}-cap)`} className={styles.cap} />

          {/* Aguja indicadora blanca */}
          <g transform={`rotate(${angle} 50 50)`}>
            <line
              x1={50}
              y1={50 - BODY_RADIUS + 2}
              x2={50}
              y2={50 - BODY_RADIUS + 13}
              className={styles.pointer}
            />
          </g>
        </svg>
      </div>
      <span className={styles.value}>{displayValue ?? value}</span>
    </div>
  );
}
