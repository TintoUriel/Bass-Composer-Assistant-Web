using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;

namespace BassComposerAssistant.Services.Interfaces;

/// <summary>
/// Builds pitch-class -> HighlightType maps for the 3 visualization modes. Trimmed down from
/// the desktop app's IFretboardService: the desktop version also builds and mutates FretPosition
/// objects (ObservableObject-based, for WPF binding) via BuildFretboard/ApplyHighlights/
/// ClearHighlights — those don't apply to a stateless API, so only the pure mapping methods
/// (which already returned plain dictionaries) made the trip here. The web API builds its own
/// fretboard grid as FretPositionDto directly in Api.Web.
/// </summary>
public interface IFretboardHighlightService
{
    /// <summary>Builds the pitch-class -> HighlightType map for "Modo Acorde" (one color per chord degree).</summary>
    IReadOnlyDictionary<int, HighlightType> BuildChordHighlightMap(Chord chord);

    /// <summary>
    /// Builds the pitch-class -> HighlightType map for "Modo Triadas": only root/third/fifth,
    /// even when the chord itself carries a 7th/9th/11th/13th (e.g. a C7 still highlights just C-E-G).
    /// </summary>
    IReadOnlyDictionary<int, HighlightType> BuildTriadHighlightMap(Chord chord);

    /// <summary>Builds the pitch-class -> HighlightType map for "Modo Escala" (one color per scale degree).</summary>
    IReadOnlyDictionary<int, HighlightType> BuildScaleHighlightMap(Scale scale);

    /// <summary>
    /// Builds the pitch-class -> HighlightType map for "Modo Notas Comunes": every pitch class
    /// shared by all chords in the progression, for improvising over the whole progression at once.
    /// </summary>
    IReadOnlyDictionary<int, HighlightType> BuildCommonTonesHighlightMap(IReadOnlyList<Chord> chords);
}
