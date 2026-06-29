namespace BassComposerAssistant.Core.Enums;

/// <summary>
/// Role a note plays inside a chord, used for "Modo Acorde" color coding.
/// Numeric value is the conventional scale-degree number (matches the user-facing label).
/// Extensions that share a pitch class with a lower degree (2nd/9th, 4th/11th, 6th/13th)
/// are bucketed under the higher degree so they reuse the same color.
/// </summary>
public enum ChordDegree
{
    Root = 1,
    Third = 3,
    Fifth = 5,
    Seventh = 7,
    Ninth = 9,
    Eleventh = 11,
    Thirteenth = 13,
}
