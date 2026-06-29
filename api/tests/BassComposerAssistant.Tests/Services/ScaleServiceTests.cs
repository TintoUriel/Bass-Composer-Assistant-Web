using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Services.Implementations;
using Xunit;

namespace BassComposerAssistant.Tests.Services;

public class ScaleServiceTests
{
    private readonly ScaleService _sut = new();

    [Theory]
    // Am -> A Menor Natural: A B C D E F G (spec's literal example).
    [InlineData(9, "A", Accidental.Natural, ChordQuality.Minor, "A Menor Natural", "A B C D E F G")]
    // Am7 -> A Dórico: parent major is G (1 sharp), so the 6th is F#, not Gb.
    [InlineData(9, "A", Accidental.Natural, ChordQuality.Minor7, "A Dórico", "A B C D E F# G")]
    // G7 -> G Mixolidio (spec's literal example).
    [InlineData(7, "G", Accidental.Natural, ChordQuality.Dominant7, "G Mixolidio", "G A B C D E F")]
    // C7 -> C Mixolidio: parent major is F (1 flat), so the b7 is Bb, not A#.
    [InlineData(0, "C", Accidental.Natural, ChordQuality.Dominant7, "C Mixolidio", "C D E F G A Bb")]
    [InlineData(0, "C", Accidental.Natural, ChordQuality.Major7, "C Jónico", "C D E F G A B")]
    [InlineData(0, "C", Accidental.Natural, ChordQuality.Major, "C Jónico", "C D E F G A B")]
    // Cm -> C Menor Natural: parent major is Eb (3 flats).
    [InlineData(0, "C", Accidental.Natural, ChordQuality.Minor, "C Menor Natural", "C D Eb F G Ab Bb")]
    // F#m -> explicit sharp root always wins, regardless of key signature.
    [InlineData(6, "F#", Accidental.Sharp, ChordQuality.Minor, "F# Menor Natural", "F# G# A B C# D E")]
    public void GetSuggestedScale_MatchesSpecExamples(
        int rootPitchClass, string rootName, Accidental rootAccidental, ChordQuality quality,
        string expectedScaleName, string expectedNotes)
    {
        var root = new Note(rootPitchClass, rootName);

        var scale = _sut.GetSuggestedScale(root, quality, rootAccidental);

        Assert.Equal(expectedScaleName, scale.Name);
        Assert.Equal(expectedNotes, string.Join(' ', scale.Notes.Select(n => n.Note.Name)));
    }
}
