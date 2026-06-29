using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Theory;

/// <summary>The suggested scale for a chord quality: its type, and an optional display-name override.</summary>
public sealed record SuggestedScaleEntry(ScaleType Type, string? NameOverride = null);

/// <summary>
/// Default chord-to-scale relationships used to suggest an improvisation scale for the
/// current chord. Reproduces the examples from the spec exactly (Major/Major7 -> Ionian,
/// Dominant7 -> Mixolydian, Minor7 -> Dorian, plain Minor -> Aeolian shown as "Menor Natural").
/// Data-driven so it's easy to extend or let a future feature override per-chord.
/// </summary>
public static class ChordScaleMap
{
    public static readonly IReadOnlyDictionary<ChordQuality, SuggestedScaleEntry> Map =
        new Dictionary<ChordQuality, SuggestedScaleEntry>
        {
            [ChordQuality.Major] = new(ScaleType.Ionian),
            [ChordQuality.Minor] = new(ScaleType.Aeolian, "Menor Natural"),
            [ChordQuality.Dominant7] = new(ScaleType.Mixolydian),
            [ChordQuality.Major7] = new(ScaleType.Ionian),
            [ChordQuality.Minor7] = new(ScaleType.Dorian),
            [ChordQuality.Diminished] = new(ScaleType.Locrian),
            [ChordQuality.Diminished7] = new(ScaleType.Locrian),
            [ChordQuality.HalfDiminished7] = new(ScaleType.Locrian),
            [ChordQuality.Augmented] = new(ScaleType.WholeTone),
            [ChordQuality.MinorMajor7] = new(ScaleType.MelodicMinor),
            [ChordQuality.Major6] = new(ScaleType.Ionian),
            [ChordQuality.Minor6] = new(ScaleType.Dorian),
            [ChordQuality.Dominant9] = new(ScaleType.Mixolydian),
            [ChordQuality.Major9] = new(ScaleType.Ionian),
            [ChordQuality.Minor9] = new(ScaleType.Dorian),
            [ChordQuality.Sus2] = new(ScaleType.Ionian),
            [ChordQuality.Sus4] = new(ScaleType.Ionian),
            [ChordQuality.AddNine] = new(ScaleType.Ionian),
            [ChordQuality.Dominant11] = new(ScaleType.Mixolydian),
            [ChordQuality.Dominant13] = new(ScaleType.Mixolydian),
        };
}
