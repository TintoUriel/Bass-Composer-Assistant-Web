using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Models;

/// <summary>A scale: a root, its type, and the resulting notes (each tagged with its degree).</summary>
public sealed class Scale
{
    public required string Name { get; init; }
    public required Note Root { get; init; }
    public required ScaleType Type { get; init; }
    public required IReadOnlyList<ScaleTone> Notes { get; init; }
}
