using BassComposerAssistant.Core.Models;

namespace BassComposerAssistant.Services.Models;

/// <summary>
/// Result of parsing a whole progression string: the chords that parsed successfully plus
/// any tokens that didn't, so the UI can warn about them without blocking playback.
/// </summary>
public sealed record ChordParseResult(ChordProgression Progression, IReadOnlyList<string> InvalidTokens);
