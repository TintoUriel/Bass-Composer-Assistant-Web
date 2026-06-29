using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Services.Implementations;
using Xunit;

namespace BassComposerAssistant.Tests.Services;

public class FretboardHighlightServiceTests
{
    private readonly FretboardHighlightService _sut = new();

    [Fact]
    public void BuildChordHighlightMap_MapsEachChordToneToItsDegreeColor()
    {
        var chord = new Chord
        {
            Name = "Am",
            Root = new Note(9, "A"),
            Quality = ChordQuality.Minor,
            Notes = new[]
            {
                new ChordTone(new Note(9, "A"), ChordDegree.Root),
                new ChordTone(new Note(0, "C"), ChordDegree.Third),
                new ChordTone(new Note(4, "E"), ChordDegree.Fifth),
            },
            SuggestedScale = new Scale { Name = "A Menor Natural", Root = new Note(9, "A"), Type = ScaleType.Aeolian, Notes = Array.Empty<ScaleTone>() },
        };

        var map = _sut.BuildChordHighlightMap(chord);

        Assert.Equal(HighlightType.ChordRoot, map[9]);
        Assert.Equal(HighlightType.ChordThird, map[0]);
        Assert.Equal(HighlightType.ChordFifth, map[4]);
    }

    [Fact]
    public void BuildScaleHighlightMap_MapsEachScaleToneToItsDegreeColor()
    {
        var scale = new Scale
        {
            Name = "A Menor Natural",
            Root = new Note(9, "A"),
            Type = ScaleType.Aeolian,
            Notes = new[]
            {
                new ScaleTone(new Note(9, "A"), ScaleDegree.Tonic),
                new ScaleTone(new Note(11, "B"), ScaleDegree.Second),
                new ScaleTone(new Note(0, "C"), ScaleDegree.Third),
            },
        };

        var map = _sut.BuildScaleHighlightMap(scale);

        Assert.Equal(HighlightType.ScaleTonic, map[9]);
        Assert.Equal(HighlightType.ScaleSecond, map[11]);
        Assert.Equal(HighlightType.ScaleThird, map[0]);
    }

    [Fact]
    public void BuildCommonTonesHighlightMap_OnlyKeepsPitchClassesSharedByEveryChord()
    {
        var am = ChordWithTones("Am", 9, new[] { 9, 0, 4 });   // A C E
        var f = ChordWithTones("F", 5, new[] { 5, 9, 0 });     // F A C
        var c = ChordWithTones("C", 0, new[] { 0, 4, 7 });     // C E G

        var map = _sut.BuildCommonTonesHighlightMap(new[] { am, f, c });

        Assert.Equal(new[] { 0 }, map.Keys.OrderBy(k => k)); // C is the only note common to all 3 chords
        Assert.Equal(HighlightType.CommonTone, map[0]);
    }

    [Fact]
    public void BuildCommonTonesHighlightMap_EmptyChordList_ReturnsEmptyMap()
    {
        var map = _sut.BuildCommonTonesHighlightMap(Array.Empty<Chord>());

        Assert.Empty(map);
    }

    private static Chord ChordWithTones(string name, int rootPitchClass, IEnumerable<int> pitchClasses) => new()
    {
        Name = name,
        Root = new Note(rootPitchClass, name),
        Quality = ChordQuality.Major,
        Notes = pitchClasses.Select(pc => new ChordTone(new Note(pc, pc.ToString()), ChordDegree.Root)).ToArray(),
        SuggestedScale = new Scale { Name = name, Root = new Note(rootPitchClass, name), Type = ScaleType.Ionian, Notes = Array.Empty<ScaleTone>() },
    };
}
