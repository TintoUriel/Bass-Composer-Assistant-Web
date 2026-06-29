namespace BassComposerAssistant.Core.Enums;

/// <summary>
/// Catalog of supported chord qualities. Adding a new quality requires a new value here
/// plus one entry in ChordFormulaLibrary (intervals) and ChordScaleMap (suggested scale).
/// </summary>
public enum ChordQuality
{
    Major,
    Minor,
    Dominant7,
    Major7,
    Minor7,
    Diminished,
    Diminished7,
    HalfDiminished7,
    Augmented,
    MinorMajor7,
    Major6,
    Minor6,
    Dominant9,
    Major9,
    Minor9,
    Sus2,
    Sus4,
    AddNine,
    Dominant11,
    Dominant13,
}
