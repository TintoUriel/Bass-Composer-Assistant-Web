using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;
using BassComposerAssistant.Services.Interfaces;

namespace BassComposerAssistant.Services.Implementations;

/// <inheritdoc cref="IScaleService"/>
public sealed class ScaleService : IScaleService
{
    public Scale BuildScale(Note root, ScaleType type)
    {
        var formula = ScaleFormulaLibrary.Formulas[type];
        var preferFlats = ResolveStandalonePreferFlats(root, type);
        return BuildScale(root, formula, formula.SpanishName, preferFlats);
    }

    public Scale GetSuggestedScale(Note root, ChordQuality quality, Accidental rootAccidental)
    {
        var entry = ChordScaleMap.Map[quality];
        var formula = ScaleFormulaLibrary.Formulas[entry.Type];

        var preferFlats = rootAccidental switch
        {
            Accidental.Flat => true,
            Accidental.Sharp => false,
            _ => KeySignature.PreferFlats(root.PitchClass, entry.Type),
        };

        return BuildScale(root, formula, entry.NameOverride ?? formula.SpanishName, preferFlats);
    }

    /// <summary>
    /// BuildScale has no chord-parsing context to say whether the root's accidental (if any)
    /// was typed explicitly, so it infers the same thing from the root's own spelling.
    /// </summary>
    private static bool ResolveStandalonePreferFlats(Note root, ScaleType type)
    {
        if (root.Name.Contains('b'))
            return true;
        if (root.Name.Contains('#'))
            return false;
        return KeySignature.PreferFlats(root.PitchClass, type);
    }

    private static Scale BuildScale(Note root, ScaleFormula formula, string displayName, bool preferFlats)
    {
        var notes = formula.Tones
            .Select(tone => new ScaleTone(NoteCalculator.GetNote(root.PitchClass + tone.Semitones, preferFlats), tone.Degree))
            .ToList();

        return new Scale
        {
            Name = $"{root.Name} {displayName}",
            Root = root,
            Type = formula.Type,
            Notes = notes,
        };
    }
}
