# Handoff: Bass Composer — Editor de acordes para bajo

## Overview
Panel tipo "hardware/rack" para construir y visualizar acordes sobre un diapasón de bajo de 4 cuerdas (24 trastes), con transporte (BPM/VOL), selector de raíz/calidad de acorde, progresión y estado del acorde actual.

## About the Design Files
Los archivos de este paquete son **referencias de diseño creadas en HTML** (prototipo visual e interactivo), no código de producción para copiar tal cual. La tarea es **recrear este diseño en React** usando los patrones y librerías existentes del proyecto (o, si no hay ninguno establecido, elegir el stack más adecuado).

## Fidelity
**Alta fidelidad (hifi)**: colores, tipografía, espaciados e interacciones están definidos y deben respetarse con precisión.

## Screens / Views
Una sola vista ("Bass Composer"), estructura de arriba a abajo:

### 1. Header
- Flex row, `justify-content:space-between`.
- Izquierda: título "BASS COMPOSER" (Oswald 700, 30px, letter-spacing .06em, color #f2e9d8) + "ASSISTANT" (JetBrains Mono 500, 11px, letter-spacing .42em, color #f0a52f).
- Derecha: pill de estado con LED verde pulsante (`#48e080`, animación `ledPulse` 2.4s) + texto "Backend conectado" (JetBrains Mono 11px, #9c9284).

### 2. Transport Panel (rack unit)
Fondo `linear-gradient(180deg,#262017,#191410)`, borde `#0a0806`, radius 13px, 4 tornillos decorativos en las esquinas.
Contiene, en fila con gap 28px:
- **Transporte**: 3 botones (play/pause/stop), 46x46px, radius 9px.
- **Tiempo**: 4 dots de compás (14px, el activo en dorado con glow).
- **Knobs BPM (145) y VOL (80)**: perilla circular 76px con arco `conic-gradient` dorado indicando valor (rango BPM 40–240, VOL 0–100, barrido de 270°) y aguja rotada.
- **Botones de acción**: "Metrónomo", "Tocar acorde" — dorado outline sobre fondo oscuro.
- **Modo**: tabs "Acorde / Triadas / Escala / Notas comunes", el activo con fondo dorado sólido.

### 3. Main grid (340px | 1fr)
**Panel izquierdo — Chord Builder:**
- Display de acorde actual (grande, dorado).
- Grid de RAÍZ: 12 notas cromáticas (C, C#, D…B), 6 columnas, botón activo dorado sólido.
- Link "▸ CÍRCULO DE QUINTAS" (colapsable, no implementado en el prototipo).
- Grid de CALIDAD: 12 calidades de acorde (Mayor, Menor, 7, Maj7, m7, Dim, m7b5, Aug, Sus4, 6, m6, 9), 4 columnas.
- Botones "Quitar último" y "✕ Limpiar".

**Panel derecho — Diapasón + Info:**
- **Diapasón**: 4 cuerdas (G, D, A, E de arriba a abajo), 24 trastes (0–23, incluyendo cuerda al aire).
  - El espaciado de trastes usa la fórmula real de temperamento: `pos(f) = 1 - 2^(-f/12)`, ancho de cada traste = diferencia entre posiciones consecutivas, normalizado para sumar exactamente el ancho disponible (evita huecos sin cubrir a la derecha).
  - Incrustaciones (inlays) en trastes 3,5,7,9,15,17,19,21 (una) y 12 (doble), alineadas a la misma cuadrícula de columnas que los trastes (no a un porcentaje uniforme).
  - Dots de nota: **root** (dorado), **tercera** (verde azulado/teal), **quinta** (coral) — coloreados según el rol de la nota en el acorde activo; el resto de notas se muestran tenues como texto.
  - Fondo de madera: gradiente + textura de grano diagonal sutil.
- **Leyenda**: Fundamental / Tercera / Quinta con swatches de color.
- **Info strip**: Progresión (chips de acordes + botón "+"), Acorde actual (nombre grande + notas individuales C/Eb/G), y contadores Compás / Tiempo / Modo / Próximo.

## Interactions & Behavior
- Selección de raíz y calidad → recalcula acorde activo, notas resaltadas en el diapasón y en el info strip.
- Knobs BPM/VOL: arrastrables (implementar como drag vertical/circular), actualizan el arco y el valor numérico.
- Botones Metrónomo / Tocar acorde: disparan reproducción de audio (no implementado en el prototipo, es visual).
- Progresión: "+" agrega el acorde actual a la secuencia; cada chip debería ser clickeable/eliminable.
- Tabs de MODO cambian la visualización del diapasón (acorde vs triadas vs escala vs notas comunes) — lógica de cada modo no implementada en el prototipo, solo el estado "Acorde".

## State Management
- `rootNote`: nota raíz seleccionada (una de las 12 cromáticas).
- `quality`: calidad de acorde seleccionada.
- `mode`: modo de visualización activo.
- `bpm`, `volume`: valores numéricos de los knobs.
- `progression`: array de acordes en la secuencia.
- `activeChordNotes`: derivado de rootNote + quality, usado para colorear el diapasón.

## Design Tokens
**Colores:**
- Fondo general: `#0a0908`, paneles `linear-gradient(180deg,#262017,#191410)`, bordes `#0a0806`.
- Acento dorado: `#f0a52f` (glow `rgba(240,165,47,.4-.7)`), dorado claro `#ffce78` / `#ffd88a`.
- Texto principal: `#f2e9d8` / `#eadfce`; texto secundario/labels: `#8a8072` / `#9c9284`.
- Dots: root `#e79a2a`→`#ffd787`; tercera `#3ea699`→`#8fe0d3`; quinta `#cf6b48`→`#f2ab8f`.
- Verde LED: `#48e080`.

**Tipografía:**
- Oswald 400/500/600/700 — títulos y valores grandes.
- Barlow Semi Condensed 500/600/700 — botones y etiquetas de UI.
- JetBrains Mono 400/500/700 — labels técnicos, valores numéricos, texto de traste.

**Radios:** paneles 13px, botones 6–9px, pills 20px.
**Sombras:** `inset` sutiles para relieve + `box-shadow` externo para profundidad de rack.

## Assets
Ninguna imagen externa; toda la textura (madera, ruido, grano) es CSS (gradientes + SVG turbulence inline como data URI de fondo).
Fuentes vía Google Fonts: Oswald, Barlow Semi Condensed, JetBrains Mono.

## Files
- `Bass Composer.dc.html` — diseño completo (markup + lógica de generación de estilos/datos).
