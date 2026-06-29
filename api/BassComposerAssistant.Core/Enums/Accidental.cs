namespace BassComposerAssistant.Core.Enums;

/// <summary>
/// Whether a chord/scale root was typed with an explicit accidental. Natural means no accidental
/// was typed, so the spelling of every other note in the chord/scale falls back to a quality-based
/// default (e.g. minor chords default to flats) instead of forcing sharps or flats outright.
/// </summary>
public enum Accidental
{
    Natural,
    Sharp,
    Flat,
}
