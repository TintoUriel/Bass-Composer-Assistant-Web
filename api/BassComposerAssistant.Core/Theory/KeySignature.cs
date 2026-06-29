using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Theory;

/// <summary>
/// Decides whether a scale's non-root degrees should be spelled with flats, using real key
/// signature logic rather than a "minor modes use flats" shortcut. Each of the 7 diatonic modes
/// is a rotation of some major scale, so its spelling follows that PARENT major key's signature
/// — e.g. A Dorian is the 2nd degree of G major (1 sharp), so it's spelled with F#, not the flat
/// Gb a naive per-mode rule would produce. This is the one place a "no full key signature engine"
/// simplification would actually look wrong, so it gets the real algorithm; chord symbols don't
/// need this (chord-chart convention spells altered chord tones as flats regardless of root —
/// see ChordFormulaLibrary.IsFlatLeaning — which is a different, simpler, equally valid rule).
/// </summary>
public static class KeySignature
{
    // Sharps (positive) or flats (negative) in each major key, indexed by its root pitch class.
    private static readonly int[] MajorKeySharps =
    {
        0,   // C
        -5,  // Db
        2,   // D
        -3,  // Eb
        4,   // E
        -1,  // F
        6,   // F#
        1,   // G
        -4,  // Ab
        3,   // A
        -2,  // Bb
        5,   // B
    };

    // Semitones from a mode's own root down to its parent major scale's root.
    private static readonly Dictionary<ScaleType, int> ParentMajorOffset = new()
    {
        [ScaleType.Ionian] = 0,
        [ScaleType.Dorian] = 2,
        [ScaleType.Phrygian] = 4,
        [ScaleType.Lydian] = 5,
        [ScaleType.Mixolydian] = 7,
        [ScaleType.Aeolian] = 9,
        [ScaleType.Locrian] = 11,
    };

    public static bool PreferFlats(int rootPitchClass, ScaleType type)
    {
        if (!ParentMajorOffset.TryGetValue(type, out var offset))
            return type == ScaleType.MelodicMinor; // not a major-scale rotation; fixed default

        var parentMajorRoot = NoteCalculator.NormalizePitchClass(rootPitchClass - offset);
        return MajorKeySharps[parentMajorRoot] < 0;
    }
}
