using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Theory;

/// <summary>One chord recipe: its quality, and each tone as (semitones from root, degree).</summary>
public sealed record ChordFormula(ChordQuality Quality, IReadOnlyList<(int Semitones, ChordDegree Degree)> Tones);

/// <summary>
/// Maps a chord symbol's suffix (the part after the root letter/accidental, matched exactly
/// and case-insensitively) to its formula. This is the single place to touch to support a new
/// chord quality — add one entry, no parser changes needed.
/// 4th/11th and 2nd/9th and 6th/13th share a pitch class an octave apart, so they're bucketed
/// under the same ChordDegree (and therefore the same highlight color).
/// </summary>
public static class ChordFormulaLibrary
{
    /// <summary>
    /// Qualities whose characteristic intervals (b3, b5 and/or b7) are conventionally spelled
    /// as flats — e.g. Cm is "C Eb G", never "C D# G" — used when the root itself is natural
    /// and gives no spelling preference of its own.
    /// </summary>
    private static readonly HashSet<ChordQuality> FlatLeaningQualities = new()
    {
        ChordQuality.Minor,
        ChordQuality.Minor7,
        ChordQuality.Diminished,
        ChordQuality.Diminished7,
        ChordQuality.HalfDiminished7,
        ChordQuality.MinorMajor7,
        ChordQuality.Minor6,
        ChordQuality.Minor9,
    };

    public static bool IsFlatLeaning(ChordQuality quality) => FlatLeaningQualities.Contains(quality);

    public static readonly IReadOnlyDictionary<string, ChordFormula> Formulas =
        new Dictionary<string, ChordFormula>(StringComparer.OrdinalIgnoreCase)
        {
            [""] = Major(),
            ["maj"] = Major(),
            ["m"] = Minor(),
            ["min"] = Minor(),
            ["-"] = Minor(),
            ["7"] = Dominant7(),
            ["maj7"] = Major7(),
            ["m7"] = Minor7(),
            ["min7"] = Minor7(),
            ["dim"] = Diminished(),
            ["°"] = Diminished(),
            ["dim7"] = Diminished7(),
            ["°7"] = Diminished7(),
            ["m7b5"] = HalfDiminished7(),
            ["m7-5"] = HalfDiminished7(),
            ["ø"] = HalfDiminished7(),
            ["ø7"] = HalfDiminished7(),
            ["aug"] = Augmented(),
            ["+"] = Augmented(),
            ["mmaj7"] = MinorMajor7(),
            ["minmaj7"] = MinorMajor7(),
            ["6"] = Major6(),
            ["m6"] = Minor6(),
            ["min6"] = Minor6(),
            ["9"] = Dominant9(),
            ["maj9"] = Major9(),
            ["m9"] = Minor9(),
            ["min9"] = Minor9(),
            ["sus2"] = Sus2(),
            ["sus4"] = Sus4(),
            ["sus"] = Sus4(),
            ["add9"] = AddNine(),
            ["11"] = Dominant11(),
            ["13"] = Dominant13(),
        };

    private static ChordFormula Major() => new(ChordQuality.Major, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth),
    });

    private static ChordFormula Minor() => new(ChordQuality.Minor, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (7, ChordDegree.Fifth),
    });

    private static ChordFormula Dominant7() => new(ChordQuality.Dominant7, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth), (10, ChordDegree.Seventh),
    });

    private static ChordFormula Major7() => new(ChordQuality.Major7, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth), (11, ChordDegree.Seventh),
    });

    private static ChordFormula Minor7() => new(ChordQuality.Minor7, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (7, ChordDegree.Fifth), (10, ChordDegree.Seventh),
    });

    private static ChordFormula Diminished() => new(ChordQuality.Diminished, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (6, ChordDegree.Fifth),
    });

    private static ChordFormula Diminished7() => new(ChordQuality.Diminished7, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (6, ChordDegree.Fifth), (9, ChordDegree.Seventh),
    });

    private static ChordFormula HalfDiminished7() => new(ChordQuality.HalfDiminished7, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (6, ChordDegree.Fifth), (10, ChordDegree.Seventh),
    });

    private static ChordFormula Augmented() => new(ChordQuality.Augmented, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (8, ChordDegree.Fifth),
    });

    private static ChordFormula MinorMajor7() => new(ChordQuality.MinorMajor7, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (7, ChordDegree.Fifth), (11, ChordDegree.Seventh),
    });

    private static ChordFormula Major6() => new(ChordQuality.Major6, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth), (9, ChordDegree.Thirteenth),
    });

    private static ChordFormula Minor6() => new(ChordQuality.Minor6, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (7, ChordDegree.Fifth), (9, ChordDegree.Thirteenth),
    });

    private static ChordFormula Dominant9() => new(ChordQuality.Dominant9, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth),
        (10, ChordDegree.Seventh), (14, ChordDegree.Ninth),
    });

    private static ChordFormula Major9() => new(ChordQuality.Major9, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth),
        (11, ChordDegree.Seventh), (14, ChordDegree.Ninth),
    });

    private static ChordFormula Minor9() => new(ChordQuality.Minor9, new[]
    {
        (0, ChordDegree.Root), (3, ChordDegree.Third), (7, ChordDegree.Fifth),
        (10, ChordDegree.Seventh), (14, ChordDegree.Ninth),
    });

    private static ChordFormula Sus2() => new(ChordQuality.Sus2, new[]
    {
        (0, ChordDegree.Root), (2, ChordDegree.Ninth), (7, ChordDegree.Fifth),
    });

    private static ChordFormula Sus4() => new(ChordQuality.Sus4, new[]
    {
        (0, ChordDegree.Root), (5, ChordDegree.Eleventh), (7, ChordDegree.Fifth),
    });

    private static ChordFormula AddNine() => new(ChordQuality.AddNine, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth), (14, ChordDegree.Ninth),
    });

    private static ChordFormula Dominant11() => new(ChordQuality.Dominant11, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth),
        (10, ChordDegree.Seventh), (14, ChordDegree.Ninth), (17, ChordDegree.Eleventh),
    });

    private static ChordFormula Dominant13() => new(ChordQuality.Dominant13, new[]
    {
        (0, ChordDegree.Root), (4, ChordDegree.Third), (7, ChordDegree.Fifth), (10, ChordDegree.Seventh),
        (14, ChordDegree.Ninth), (17, ChordDegree.Eleventh), (21, ChordDegree.Thirteenth),
    });
}
