using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Services.Implementations;
using Xunit;

namespace BassComposerAssistant.Tests.Services;

public class ChordParserServiceTests
{
    private readonly ChordParserService _sut = new(new ScaleService());

    [Theory]
    [InlineData("C", "Major", "C E G")]
    [InlineData("Cm", "Minor", "C Eb G")]
    [InlineData("Am", "Minor", "A C E")]
    [InlineData("Dm7", "Minor7", "D F A C")]
    [InlineData("G7", "Dominant7", "G B D F")]
    [InlineData("Cmaj7", "Major7", "C E G B")]
    [InlineData("F#m", "Minor", "F# A C#")]
    [InlineData("Bb", "Major", "Bb D F")]
    [InlineData("Ebmaj7", "Major7", "Eb G Bb D")]
    [InlineData("A7", "Dominant7", "A C# E G")]
    public void TryParseChord_ParsesAllSpecExamples(string symbol, string expectedQuality, string expectedNotes)
    {
        var success = _sut.TryParseChord(symbol, out var chord);

        Assert.True(success);
        Assert.NotNull(chord);
        Assert.Equal(symbol, chord!.Name);
        Assert.Equal(expectedQuality, chord.Quality.ToString());
        Assert.Equal(expectedNotes, string.Join(' ', chord.Notes.Select(n => n.Note.Name)));
    }

    [Fact]
    public void TryParseChord_RootDegreeIsAlwaysFirstNote()
    {
        _sut.TryParseChord("Am7", out var chord);

        Assert.NotNull(chord);
        Assert.Equal(ChordDegree.Root, chord!.Notes[0].Degree);
        Assert.Equal("A", chord.Notes[0].Note.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("H")]
    [InlineData("Cxyz")]
    public void TryParseChord_RejectsInvalidSymbols(string symbol)
    {
        var success = _sut.TryParseChord(symbol, out var chord);

        Assert.False(success);
        Assert.Null(chord);
    }

    [Fact]
    public void ParseProgression_CollectsInvalidTokensWithoutThrowing()
    {
        var result = _sut.ParseProgression("Am F Xyz C");

        Assert.Equal(3, result.Progression.Chords.Count);
        Assert.Equal(new[] { "Xyz" }, result.InvalidTokens);
    }

    [Fact]
    public void ParseProgression_AttachesSuggestedScaleToEveryChord()
    {
        var result = _sut.ParseProgression("Am F C E");

        Assert.All(result.Progression.Chords, chord => Assert.NotNull(chord.SuggestedScale));
    }

    /// <summary>
    /// Mirrors MainViewModel's root buttons (C..B, sharp-spelled) and quality buttons (the
    /// curated subset of ChordFormulaLibrary.Formulas in MainViewModel.QualityOptionsList) —
    /// every button combination the chord-builder palette can produce must parse cleanly,
    /// since the palette has no way to type an invalid token. Keep this suffix list in sync
    /// with MainViewModel.QualityOptionsList if either one changes.
    /// </summary>
    [Theory]
    [InlineData("")]
    [InlineData("m")]
    [InlineData("7")]
    [InlineData("maj7")]
    [InlineData("m7")]
    [InlineData("dim")]
    [InlineData("m7b5")]
    [InlineData("aug")]
    [InlineData("sus4")]
    [InlineData("6")]
    [InlineData("m6")]
    [InlineData("9")]
    public void ParseProgression_EveryPaletteRootAndQualityCombinationParsesWithNoInvalidTokens(string suffix)
    {
        var roots = new[] { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" };
        var progressionText = string.Join(' ', roots.Select(root => root + suffix));

        var result = _sut.ParseProgression(progressionText);

        Assert.Empty(result.InvalidTokens);
        Assert.Equal(roots.Length, result.Progression.Chords.Count);
    }
}
