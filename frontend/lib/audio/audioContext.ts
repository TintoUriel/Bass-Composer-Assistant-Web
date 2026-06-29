let sharedContext: AudioContext | null = null;

/**
 * AudioContext único y diferido: los navegadores no permiten crear/arrancar uno antes de un gesto
 * del usuario (riesgo nuevo de la versión web, sin equivalente en el desktop — ver CLAUDE.md).
 * resume() es inofensivo si el contexto ya está corriendo, así que se llama en cada acceso.
 */
export function getAudioContext(): AudioContext {
  if (!sharedContext) sharedContext = new AudioContext();
  if (sharedContext.state === "suspended") sharedContext.resume();
  return sharedContext;
}
