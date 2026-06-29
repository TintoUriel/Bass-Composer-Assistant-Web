using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;

namespace BassComposerAssistant.Services.Interfaces;

/// <summary>Builds scales and relates chords to their suggested improvisation scale.</summary>
public interface IScaleService
{
    /// <summary>Builds any scale directly from a root and type (e.g. for a future manual picker).</summary>
    Scale BuildScale(Note root, ScaleType type);

    /// <summary>
    /// Builds the default suggested scale for a chord root + quality. <paramref name="rootAccidental"/>
    /// is whatever accidental the user actually typed on the root (Natural if none) — an explicit
    /// accidental is respected as-is, otherwise the scale picks its own correct key-signature
    /// spelling (see KeySignature), which is independent of the chord's own spelling convention.
    /// </summary>
    Scale GetSuggestedScale(Note root, ChordQuality quality, Accidental rootAccidental);
}
