namespace BassComposerAssistant.Core.Models;

/// <summary>
/// An ordered set of open-string MIDI note numbers, index 0 = string 1 (highest/thinnest)
/// through index N-1 = string N (lowest/thickest). Generic over string count so 5/6-string
/// basses are just additional presets, with no changes needed in FretboardService.
/// </summary>
public sealed record BassTuning(string Name, IReadOnlyList<int> OpenStringMidiNotes)
{
    public int StringCount => OpenStringMidiNotes.Count;

    /// <summary>Standard 4-string bass: string 1 = G2, string 2 = D2, string 3 = A1, string 4 = E1.</summary>
    public static BassTuning Standard4String { get; } = new(
        "Bajo 4 cuerdas (E-A-D-G)",
        new[] { 43, 38, 33, 28 });

    /// <summary>Standard 5-string bass: adds a low B below the 4-string tuning.</summary>
    public static BassTuning Standard5String { get; } = new(
        "Bajo 5 cuerdas (B-E-A-D-G)",
        new[] { 43, 38, 33, 28, 23 });

    /// <summary>Standard 6-string bass: adds a low B and a high C around the 4-string tuning.</summary>
    public static BassTuning Standard6String { get; } = new(
        "Bajo 6 cuerdas (B-E-A-D-G-C)",
        new[] { 48, 43, 38, 33, 28, 23 });
}
