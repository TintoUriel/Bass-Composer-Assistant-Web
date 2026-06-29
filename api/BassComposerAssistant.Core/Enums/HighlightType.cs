namespace BassComposerAssistant.Core.Enums;

/// <summary>
/// Visual role of a fretboard position. Covers all 3 visualization modes in a single enum
/// so FretboardService can expose one generic ApplyHighlights method and the WPF layer can
/// map every value to a brush from a single resource dictionary.
/// </summary>
public enum HighlightType
{
    None,

    // Modo Acorde
    ChordRoot,
    ChordThird,
    ChordFifth,
    ChordSeventh,
    ChordNinth,
    ChordEleventh,
    ChordThirteenth,

    // Modo Escala
    ScaleTonic,
    ScaleSecond,
    ScaleThird,
    ScaleFourth,
    ScaleFifth,
    ScaleSixth,
    ScaleSeventh,

    // Modo Notas Comunes
    CommonTone,
}
