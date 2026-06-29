using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Theory;
using Xunit;

namespace BassComposerAssistant.Tests.Core;

public class NoteCalculatorTests
{
    [Theory]
    [InlineData("C", 0, Accidental.Natural, 1)]
    [InlineData("C#", 1, Accidental.Sharp, 2)]
    [InlineData("Db", 1, Accidental.Flat, 2)]
    [InlineData("F#", 6, Accidental.Sharp, 2)]
    [InlineData("Bb", 10, Accidental.Flat, 2)]
    [InlineData("Eb", 3, Accidental.Flat, 2)]
    [InlineData("A", 9, Accidental.Natural, 1)]
    public void TryParseRootLetter_ParsesRootAndAccidental(string text, int expectedPitchClass, Accidental expectedAccidental, int expectedConsumed)
    {
        var success = NoteCalculator.TryParseRootLetter(text, out var pitchClass, out var accidental, out var consumed);

        Assert.True(success);
        Assert.Equal(expectedPitchClass, pitchClass);
        Assert.Equal(expectedAccidental, accidental);
        Assert.Equal(expectedConsumed, consumed);
    }

    [Fact]
    public void TryParseRootLetter_RejectsInvalidLetter()
    {
        var success = NoteCalculator.TryParseRootLetter("H", out _, out _, out _);
        Assert.False(success);
    }

    [Theory]
    [InlineData(28, "E", 1)]
    [InlineData(33, "A", 1)]
    [InlineData(38, "D", 2)]
    [InlineData(43, "G", 2)]
    [InlineData(60, "C", 4)]
    public void MidiToNote_ComputesNoteAndOctave(int midi, string expectedName, int expectedOctave)
    {
        var (note, octave) = NoteCalculator.MidiToNote(midi, preferFlats: false);

        Assert.Equal(expectedName, note.Name);
        Assert.Equal(expectedOctave, octave);
    }

    [Theory]
    [InlineData(Accidental.Flat, true, true)]
    [InlineData(Accidental.Sharp, true, false)]
    [InlineData(Accidental.Natural, true, true)]
    [InlineData(Accidental.Natural, false, false)]
    public void ResolvePreferFlats_ExplicitAccidentalOverridesDefault(Accidental accidental, bool defaultValue, bool expected)
    {
        Assert.Equal(expected, NoteCalculator.ResolvePreferFlats(accidental, defaultValue));
    }
}
