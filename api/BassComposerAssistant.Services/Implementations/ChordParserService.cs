using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;
using BassComposerAssistant.Services.Interfaces;
using BassComposerAssistant.Services.Models;

namespace BassComposerAssistant.Services.Implementations;

/// <inheritdoc cref="IChordParserService"/>
public sealed class ChordParserService : IChordParserService
{
    private readonly IScaleService _scaleService;

    public ChordParserService(IScaleService scaleService)
    {
        _scaleService = scaleService;
    }

    public bool TryParseChord(string symbol, out Chord? chord)
    {
        chord = null;

        if (string.IsNullOrWhiteSpace(symbol))
            return false;

        var trimmed = symbol.Trim();

        if (!NoteCalculator.TryParseRootLetter(trimmed, out var rootPitchClass, out var rootAccidental, out var consumed))
            return false;

        var suffix = trimmed[consumed..];

        if (!ChordFormulaLibrary.Formulas.TryGetValue(suffix, out var formula))
            return false;

        var preferFlats = NoteCalculator.ResolvePreferFlats(rootAccidental, ChordFormulaLibrary.IsFlatLeaning(formula.Quality));
        var root = NoteCalculator.GetNote(rootPitchClass, preferFlats);

        var notes = formula.Tones
            .Select(tone => new ChordTone(NoteCalculator.GetNote(rootPitchClass + tone.Semitones, preferFlats), tone.Degree))
            .ToList();

        var suggestedScale = _scaleService.GetSuggestedScale(root, formula.Quality, rootAccidental);

        chord = new Chord
        {
            Name = trimmed,
            Root = root,
            Quality = formula.Quality,
            Notes = notes,
            SuggestedScale = suggestedScale,
        };

        return true;
    }

    public ChordParseResult ParseProgression(string text)
    {
        var tokens = (text ?? string.Empty).Split(
            (char[]?)null,
            StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var chords = new List<Chord>();
        var invalidTokens = new List<string>();

        foreach (var token in tokens)
        {
            if (TryParseChord(token, out var chord) && chord is not null)
                chords.Add(chord);
            else
                invalidTokens.Add(token);
        }

        var progression = new ChordProgression { Chords = chords };
        return new ChordParseResult(progression, invalidTokens);
    }
}
