using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Theory;

/// <summary>One scale recipe: its type, Spanish display name, and (semitones, degree) tones.</summary>
public sealed record ScaleFormula(
    ScaleType Type,
    string SpanishName,
    IReadOnlyList<(int Semitones, ScaleDegree Degree)> Tones);

/// <summary>
/// Interval formulas for every supported ScaleType, computed from scratch. Includes the full
/// set of Greek modes (some aren't wired into ChordScaleMap yet) so a future manual scale
/// picker or "modos griegos completos" feature has the data ready.
/// </summary>
public static class ScaleFormulaLibrary
{
    private static readonly ScaleDegree[] DiatonicDegrees =
    {
        ScaleDegree.Tonic, ScaleDegree.Second, ScaleDegree.Third, ScaleDegree.Fourth,
        ScaleDegree.Fifth, ScaleDegree.Sixth, ScaleDegree.Seventh,
    };

    public static readonly IReadOnlyDictionary<ScaleType, ScaleFormula> Formulas = new Dictionary<ScaleType, ScaleFormula>
    {
        [ScaleType.Ionian] = Diatonic(ScaleType.Ionian, "Jónico", 0, 2, 4, 5, 7, 9, 11),
        [ScaleType.Dorian] = Diatonic(ScaleType.Dorian, "Dórico", 0, 2, 3, 5, 7, 9, 10),
        [ScaleType.Phrygian] = Diatonic(ScaleType.Phrygian, "Frigio", 0, 1, 3, 5, 7, 8, 10),
        [ScaleType.Lydian] = Diatonic(ScaleType.Lydian, "Lidio", 0, 2, 4, 6, 7, 9, 11),
        [ScaleType.Mixolydian] = Diatonic(ScaleType.Mixolydian, "Mixolidio", 0, 2, 4, 5, 7, 9, 10),
        [ScaleType.Aeolian] = Diatonic(ScaleType.Aeolian, "Eólico", 0, 2, 3, 5, 7, 8, 10),
        [ScaleType.Locrian] = Diatonic(ScaleType.Locrian, "Locrio", 0, 1, 3, 5, 6, 8, 10),
        [ScaleType.MelodicMinor] = Diatonic(ScaleType.MelodicMinor, "Menor Melódica", 0, 2, 3, 5, 7, 9, 11),
        [ScaleType.WholeTone] = WholeTone(),
    };

    private static ScaleFormula Diatonic(ScaleType type, string name, params int[] semitones)
    {
        var tones = semitones.Select((s, i) => (s, DiatonicDegrees[i])).ToList();
        return new ScaleFormula(type, name, tones);
    }

    private static ScaleFormula WholeTone()
    {
        int[] semitones = { 0, 2, 4, 6, 8, 10 };
        var tones = semitones.Select((s, i) => (s, DiatonicDegrees[i])).ToList();
        return new ScaleFormula(ScaleType.WholeTone, "Tonos Enteros", tones);
    }
}
