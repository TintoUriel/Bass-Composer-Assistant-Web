using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Services.Interfaces;

namespace BassComposerAssistant.Services.Implementations;

/// <inheritdoc cref="IFretboardHighlightService"/>
public sealed class FretboardHighlightService : IFretboardHighlightService
{
    private static readonly IReadOnlyDictionary<ChordDegree, HighlightType> ChordDegreeHighlights = new Dictionary<ChordDegree, HighlightType>
    {
        [ChordDegree.Root] = HighlightType.ChordRoot,
        [ChordDegree.Third] = HighlightType.ChordThird,
        [ChordDegree.Fifth] = HighlightType.ChordFifth,
        [ChordDegree.Seventh] = HighlightType.ChordSeventh,
        [ChordDegree.Ninth] = HighlightType.ChordNinth,
        [ChordDegree.Eleventh] = HighlightType.ChordEleventh,
        [ChordDegree.Thirteenth] = HighlightType.ChordThirteenth,
    };

    private static readonly IReadOnlyDictionary<ScaleDegree, HighlightType> ScaleDegreeHighlights = new Dictionary<ScaleDegree, HighlightType>
    {
        [ScaleDegree.Tonic] = HighlightType.ScaleTonic,
        [ScaleDegree.Second] = HighlightType.ScaleSecond,
        [ScaleDegree.Third] = HighlightType.ScaleThird,
        [ScaleDegree.Fourth] = HighlightType.ScaleFourth,
        [ScaleDegree.Fifth] = HighlightType.ScaleFifth,
        [ScaleDegree.Sixth] = HighlightType.ScaleSixth,
        [ScaleDegree.Seventh] = HighlightType.ScaleSeventh,
    };

    public IReadOnlyDictionary<int, HighlightType> BuildChordHighlightMap(Chord chord)
    {
        var map = new Dictionary<int, HighlightType>();
        foreach (var tone in chord.Notes)
            map[tone.Note.PitchClass] = ChordDegreeHighlights[tone.Degree];
        return map;
    }

    private static readonly HashSet<ChordDegree> TriadDegrees = new() { ChordDegree.Root, ChordDegree.Third, ChordDegree.Fifth };

    public IReadOnlyDictionary<int, HighlightType> BuildTriadHighlightMap(Chord chord)
    {
        var map = new Dictionary<int, HighlightType>();
        foreach (var tone in chord.Notes)
            if (TriadDegrees.Contains(tone.Degree))
                map[tone.Note.PitchClass] = ChordDegreeHighlights[tone.Degree];
        return map;
    }

    public IReadOnlyDictionary<int, HighlightType> BuildScaleHighlightMap(Scale scale)
    {
        var map = new Dictionary<int, HighlightType>();
        foreach (var tone in scale.Notes)
            map[tone.Note.PitchClass] = ScaleDegreeHighlights[tone.Degree];
        return map;
    }

    public IReadOnlyDictionary<int, HighlightType> BuildCommonTonesHighlightMap(IReadOnlyList<Chord> chords)
    {
        if (chords.Count == 0)
            return new Dictionary<int, HighlightType>();

        var commonPitchClasses = chords
            .Select(chord => chord.Notes.Select(tone => tone.Note.PitchClass).ToHashSet())
            .Aggregate((a, b) => { a.IntersectWith(b); return a; });

        var map = new Dictionary<int, HighlightType>();
        foreach (var pitchClass in commonPitchClasses)
            map[pitchClass] = HighlightType.CommonTone;
        return map;
    }
}
