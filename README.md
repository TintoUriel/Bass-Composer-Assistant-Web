# Bass Composer Assistant — Web

[![Deployed on Vercel](https://img.shields.io/badge/demo-bass--composer--assistant--web.vercel.app-black?logo=vercel)](https://bass-composer-assistant-web.vercel.app)

Versión web (ASP.NET Core 8 API + Next.js/React) de Bass Composer Assistant. Ver
[CLAUDE.md](CLAUDE.md) para el roadmap completo de la migración.

**Demo (solo frontend, sin backend desplegado):** https://bass-composer-assistant-web.vercel.app —
el `frontend/` se deploya automáticamente en Vercel con cada push a `master`. Como el backend
ASP.NET Core todavía no está hosteado en ningún lado, la demo va a mostrar "Backend: no
conectado" — ver la sección de hosting más abajo.

## Requisitos

- .NET SDK 8
- Node.js 18+ y npm

## 1. Levantar el backend (API)

```
cd api/BassComposerAssistant.Api.Web
dotnet run
```

Queda escuchando en `http://localhost:5163` (también `https://localhost:7202`). Probar que
responde:

```
curl http://localhost:5163/api/health
```

Debería devolver `ok`. Swagger UI disponible en `http://localhost:5163/swagger` (solo en
Development).

## 2. Levantar el frontend

En otra terminal:

```
cd frontend
npm install   # solo la primera vez
npm run dev
```

Queda en `http://localhost:3000`. Abrir esa URL en el navegador — el header de la app muestra
"Backend: ✅ conectado" si el fetch al API funcionó.

El frontend apunta a `http://localhost:5163` por defecto (`lib/api.ts`). Si corrés el backend en
otro puerto, seteá `NEXT_PUBLIC_API_BASE_URL` en `frontend/.env.local`.

> **Windows + PowerShell**: si `npm install`/`npm run dev` tira `UnauthorizedAccess` /
> "la ejecución de scripts está deshabilitada", es la política de ejecución de PowerShell, no el
> proyecto. Arreglo rápido sin tocar nada: usar `npm.cmd install` / `npm.cmd run dev`. Arreglo
> permanente: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (una vez, como usuario
> normal).

## 3. Probar la app a mano

Con ambos corriendo, en `http://localhost:3000`:

1. **Armar una progresión**: clickear una raíz (C..B) y después una calidad (Mayor, Menor, 7,
   Maj7, m7, Dim, m7b5, Aug, Sus4, 6, m6, 9) — se agrega un acorde a la vez (ej. clickear "A" +
   "Menor" agrega "Am"). "⌫ Quitar último" sacar el último, "✕ Limpiar" vacía todo.
2. **Reproducir**: ▶ arranca el metrónomo y avanza de acorde automáticamente (1 compás = 4
   tiempos), ⏸ pausa, ■ detiene y vuelve al primer acorde/tiempo 1.
3. **BPM y volumen**: sliders junto al transport (BPM 40–240, Vol 0–100). El BPM se puede cambiar
   en medio de la reproducción sin que se rompa el timing.
4. **Metrónomo / Tocar acorde**: dos botones toggle — "Metrónomo" mutea/desmutea el click sin
   tocar el slider de volumen; "Tocar acorde" prende/apaga el sonido sintetizado del acorde al
   cambiar de acorde. (El sonido en sí solo se puede verificar escuchando — necesita parlantes,
   no hay assets de audio, todo es Web Audio API sintetizado en el momento.)
5. **Modo** (Acorde / Escala / Notas comunes): cambia qué se resalta en el diapasón.
   - **Acorde**: notas del acorde actual.
   - **Escala**: escala sugerida para el acorde actual (se ve el nombre arriba a la derecha, ej.
     "A Menor Natural").
   - **Notas comunes**: intersección de las notas de *todos* los acordes de la progresión
     cargada (no solo el actual) — útil para improvisar sobre toda la progresión. Si no hay
     ninguna nota común a todos los acordes, el diapasón queda sin resaltar nada — es esperado,
     no un bug.
6. **Pasos** (timeline): clickear cualquier chip de acorde salta la reproducción a ese acorde,
   esté corriendo o en pausa.
7. **Mástil**: 24 trastes, 4 cuerdas, separación de trastes no lineal (como un bajo real),
   scrolleable si no entra en la pantalla.
8. **Panel derecho**: acorde actual + sus notas, compás, tiempo (beat dentro del compás), modo
   actual, escala sugerida (en modo Escala), próximo acorde.

### Cosas que necesitan oído/ojo humano (no automatizables)

- Si el click de metrónomo y el "stab" del acorde sintetizado suenan bien/reconocibles.
- Si el color teal de "Notas comunes" se ve bien contra el fondo oscuro del diapasón.
- Desbloqueo de `AudioContext` por gesto del usuario en distintos navegadores (algunos
  navegadores bloquean el audio hasta el primer click/tap en la página — si no se escucha nada
  al apretar play, probar clickear cualquier botón antes).

## 4. Tests automatizados

Backend (Core + Services, 68 tests):

```
cd api/tests/BassComposerAssistant.Tests
dotnet test
```

Frontend (Vitest + React Testing Library):

```
cd frontend
npm run test
```

## Estructura del repo

```
api/
  BassComposerAssistant.Api.Web/   ASP.NET Core 8 Minimal API (puerto 5163)
  BassComposerAssistant.Core/      teoría musical, copiado del repo desktop
  BassComposerAssistant.Services/  parseo/escalas/highlights, copiado del repo desktop
  tests/BassComposerAssistant.Tests/
frontend/
  app/page.tsx                     única página, "use client"
  components/                      ChordPalette, TransportControls, Fretboard, etc.
  context/PlaybackContext.tsx      estado de reproducción (BPM, beat, modo, etc.)
  hooks/usePlaybackClock.ts        reloj con drift-correction (performance.now())
  lib/audio/                       síntesis Web Audio API (metrónomo + chord stab)
  lib/api.ts                       cliente HTTP hacia el backend
```
