# Bass Composer Assistant — Web

Versión web (ASP.NET Core 8 API + Next.js/React frontend) de
[Bass Composer Assistant](https://github.com/) (app de escritorio WPF/.NET 8 para bajistas:
armar progresiones de acordes a clicks, tocarlas contra un metrónomo, y ver qué notas tocar en
un diapasón de 24 trastes en 3 modos — Acorde / Escala / Notas Comunes).

Este documento es el **roadmap de migración**, escrito antes de tocar código. Es la base para
revisar el enfoque antes de empezar a implementar — no un commit final.

## Decisiones ya tomadas

- **Repo separado** del proyecto desktop (no un monorepo) — decisión explícita del usuario.
- **Backend: ASP.NET Core 8 Minimal API.** **Frontend: Next.js (App Router) + React + TypeScript.**
- **Estado de reproducción 100% en el cliente.** BPM, beat actual, acorde actual, medida actual
  viven en React. El backend es completamente *stateless*: solo parsea progresiones y calcula
  teoría musical / mapas de highlights por request. Sin sesiones, sin WebSockets, sin metrónomo
  corriendo en el servidor.
- **El código de `Core`/`Services` se copia, no se referencia**, porque ya no hay
  `ProjectReference` posible entre repos distintos. Es una copia congelada en el momento de
  hacerla:
  - **Origen de la copia:** repo `Bass-Composer-Assistant`, commit `8692c71`, 2026-06-26.
  - Si más adelante se corrige un bug de teoría musical en uno de los dos repos, no se propaga
    solo — hay que volver a copiar/parchear a mano en el otro lado.
  - Se descartaron deliberadamente: paquete NuGet privado (agrega infraestructura de
    publicación/versionado que hoy no existe) y git submodule (incómodo de mantener).

## Resumen de reutilización (auditoría del repo desktop)

### 100% reusable, copiar tal cual

- `Core/Enums/*` — 7 enums: `Accidental`, `ChordQuality`, `ChordDegree`, `ScaleDegree`,
  `ScaleType`, `VisualizationMode`, `HighlightType`.
- `Core/Theory/*` — matemática pura de teoría musical, sin dependencias externas:
  `NoteCalculator`, `ChordFormulaLibrary`, `ScaleFormulaLibrary`, `ChordScaleMap`,
  `KeySignature` (lógica real de círculo de quintas para deletreo enarmónico correcto),
  `ChordVoicing` (`ToCloseVoicingMidiNotes`).
- `Core/Models/*` (salvo las dos excepciones de abajo) — `Chord`, `ChordProgression`,
  `ChordTone`, `Note`, `BassTuning`, `Scale`, `ScaleTone`. Son POCOs/records, listos para JSON.
- `Services/ChordParserService` + `IChordParserService` — parseo de progresiones, sin estado.
- `Services/ScaleService` + `IScaleService` — construcción de escalas, sin estado.
- De `Services/FretboardService`: solo los métodos puros `BuildChordHighlightMap`,
  `BuildScaleHighlightMap`, `BuildCommonTonesHighlightMap` (devuelven
  `IReadOnlyDictionary<int, HighlightType>`).
- `Services/Models/ChordParseResult`.

### Necesita DTO nuevo o reescritura

- `Core/Models/FretPosition.cs` y `PlaybackState.cs` extienden `ObservableObject`
  (CommunityToolkit.Mvvm) para binding de WPF — son de UI desktop. Reemplazo:
  `FretPositionDto` inmutable (`StringNumber`, `Fret`, `Note`, `Octave`). `PlaybackState` **no
  tiene equivalente en el backend** — ese estado vive entero en React.
- `IFretboardService.ApplyHighlights`/`ClearHighlights` mutan objetos `FretPosition` — se
  descartan sin más, no se llaman desde la API.
- `IPlaybackService`/`PlaybackService`, `IMetronomeService` — con estado, atados a timers de
  fondo y al `Dispatcher` de WPF. No se usan en absoluto en la versión web.

### No reusable (0%)

- `Infrastructure/Audio/*` (NAudio) — se reemplaza con **Web Audio API** en el frontend. Las
  fórmulas de síntesis quedan documentadas para portar tal cual:
  - **Click de metrónomo:** seno 1500 Hz (acentuado) / 1000 Hz (normal), envolvente de decay
    `exp(-t * 35)`, duración 40ms / 35ms.
  - **Chord stab:** síntesis aditiva, 6 armónicos, amplitud por armónico `1 / armónico^1.5`,
    decay por armónico `0.8 + 0.35 * (armónico - 1)`, attack de 8ms, voces vía
    `ChordVoicing.ToCloseVoicingMidiNotes` con raíz en MIDI 45 (A2), duración total 1800ms.
  - `MidiToFrequencyHz`: `440 * 2^((midi-69)/12)`.
- `Wpf/*` (todas las Views/ViewModels/Converters) — se reemplaza íntegramente por componentes
  React. Responsabilidades a replicar como UI/estado de React (no como llamadas a la API):
  paleta de acordes (root + calidad), slider de BPM, slider de volumen, mute, toggle de sonido
  de acorde, selector de modo, timeline de progresión con click-to-jump, render del diapasón.

## Estructura del repo

```
bass-composer-assistant-web/
  CLAUDE.md
  api/
    BassComposerAssistant.Api.Web/        (ASP.NET Core 8 Minimal API)
    BassComposerAssistant.Core/            (copiado del repo desktop)
    BassComposerAssistant.Services/        (copiado del repo desktop, solo partes reusables)
  frontend/                                 (Next.js App Router, TypeScript, un solo page.tsx)
```

(Todavía no creados — ver "Próximo paso" abajo.)

## Diseño de la API

Minimal API, DTOs como `record`, `JsonStringEnumConverter` global para que los enums serialicen
como string, CORS habilitado para `http://localhost:3000` (origen configurable en
`appsettings.Development.json`, no hardcodeado).

- `POST /api/progressions/parse` `{ text }` → `{ chords: ChordDto[], invalidTokens: string[] }`
- `GET /api/scales/build?root={pitchClass}&type={ScaleType}` → `ScaleDto`
- `GET /api/fretboard?tuning=4&fretCount=24` → `{ positions: FretPositionDto[] }`
- `POST /api/highlights/chord` `{ chordSymbol }` → `{ highlights: Dictionary<int,string> }`
- `POST /api/highlights/scale` `{ chordSymbol }` (usa la escala sugerida del acorde) → idem
- `POST /api/highlights/common-tones` `{ chordSymbols: string[] }` → idem

`ChordDto` debería incluir `suggestedVoicingMidiNotes: int[]` (de `ChordVoicing`) para que el
frontend nunca tenga que reimplementar esa matemática en TypeScript — una sola fuente de verdad
para la teoría musical.

## Arquitectura del frontend

Next.js App Router, una sola página (`app/page.tsx`, `"use client"` — es una herramienta de una
pantalla, no necesita rutas ni server components para la parte interactiva).

Componentes, 1:1 con las Views WPF actuales:

| WPF View | Componente Next.js |
|---|---|
| `ChordInputView` | `ChordPalette` |
| `TransportView` + `MetronomeView` | `TransportControls` |
| `ModeSelectorView` | `ModeSelector` |
| `ProgressionTimelineView` | `ProgressionTimeline` |
| `FretboardView` | `Fretboard` (SVG, no Canvas — declarativo, más fácil de testear) |
| `InfoPanelView` | `InfoPanel` |

Estado: `PlaybackContext` (un solo Context + `useState`/`useReducer`, sin Redux) con `bpm`,
`isPlaying`, `currentBeat`, `currentMeasure`, `currentChordIndex`, `volume`, `isMuted`,
`chordSoundEnabled`, `selectedMode`. Hook `usePlaybackClock`: reemplazo client-side de
`MetronomeService`/`PlaybackService`, con corrección de drift basada en `performance.now()`
(tiempo transcurrido real, no solo contar ticks de `setInterval`).

Motor de audio (`lib/audio/`): `metronomeClick.ts` y `chordStab.ts`, portando las fórmulas de
NAudio documentadas arriba a `OscillatorNode`/`GainNode` de Web Audio API.

## Fuera de alcance v1

Heredado del `CLAUDE.md` del repo desktop (no tocado por esta migración): 5/6 cuerdas, MIDI
in/out, backing tracks, grabación, export de progresión, detección automática de tonalidad,
grooves/líneas de bajo con IA, soporte de guitarra, selector manual de escala con UI.

Específico de la versión web: autenticación/cuentas/persistencia de progresiones guardadas (el
backend es stateless por diseño — persistencia real es v2), rediseño mobile-first (v1 apunta a
paridad de escritorio con la app WPF, no mobile-first), SSR/SEO, testing visual automatizado
(pixel diffing), WebSocket/SignalR (descartado por la decisión de estado client-side).

## Fases de trabajo

0. **Scaffolding** — crear `api/BassComposerAssistant.Api.Web` (.NET 8) y copiar
   `Core`/`Services` desde el commit de origen anotado arriba; crear `frontend` con
   `create-next-app` (TypeScript, App Router). Verificar que ambos corren independientes y que
   un `fetch` de prueba desde el frontend llega al backend con CORS funcionando.
1. **Backend** — DTOs, mapeo, los 6 endpoints de arriba, Swagger/OpenAPI para probar a mano.
   Portar los tests existentes de `Core`/`Services` (eran 78 en el repo desktop) sin cambios.
2. **Frontend skeleton** — componentes estáticos, `PlaybackContext`, conectar a la API real
   (parseo, grid del diapasón, highlights) — sin audio todavía. Hito clave: la app es "jugable"
   sin sonido.
3. **Motor de audio** — Web Audio API para metrónomo y chord stab. Mismo caveat que en la app
   desktop: necesita oídos humanos para verificar que suena bien, no solo que es matemáticamente
   correcto.
4. **Paridad / pulido** — comparar lado a lado con la app WPF corriendo: rango/default de BPM,
   click-to-jump, independencia mute/volumen, semántica de Notas Comunes (intersección de toda
   la progresión), espaciado no lineal de trastes, color de highlights. Verificación cruzada de
   navegadores para el desbloqueo de audio por gesto del usuario (riesgo nuevo que no existía en
   desktop).

## Testing

- Los tests de `Core`/`Services` del repo desktop se portan sin modificar — cubren exactamente
  la lógica que el backend referencia.
- Tests de integración livianos para los endpoints nuevos (`WebApplicationFactory`).
- Tests de componentes en el frontend (Vitest/Jest + React Testing Library) para lógica pura:
  clicks de paleta generan el token correcto, avance de beat de `usePlaybackClock` con tiempos
  simulados, etc.
- **Necesita verificación humana, no automatizable** (mismo principio que en el `CLAUDE.md` del
  repo desktop):
  1. Si el color de highlight de Notas Comunes se ve bien contra el fondo del diapasón.
  2. Si el click de metrónomo y el chord stab sintetizados suenan bien/reconocibles.
  3. **Nuevo en la versión web:** comportamiento de desbloqueo de `AudioContext` por gesto del
     usuario en distintos navegadores (Chrome/Firefox/Safari) — jsdom no tiene Web Audio real,
     así que esto es irreductiblemente manual.

## Próximo paso

Repo creado e inicializado con `git init`. Todavía no existen los proyectos `api/`/`frontend` ni
se copió código de `Core`/`Services` — eso es la Fase 0, a discutir/ajustar antes de arrancar.
