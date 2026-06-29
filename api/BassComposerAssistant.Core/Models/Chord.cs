using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Models;

/// <summary>A parsed chord: its original symbol, root, quality, tones and suggested scale.</summary>
public sealed class Chord
{
    public required string Name { get; init; }
    public required Note Root { get; init; }
    public required ChordQuality Quality { get; init; }
    public required IReadOnlyList<ChordTone> Notes { get; init; }
    public required Scale SuggestedScale { get; init; }
}
