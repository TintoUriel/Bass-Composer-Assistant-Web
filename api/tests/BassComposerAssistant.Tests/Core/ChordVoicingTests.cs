using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;
using Xunit;

namespace BassComposerAssistant.Tests.Core;

public class ChordVoicingTests
{
    [Fact]
    public void ToCloseVoicingMidiNotes_AmTriad_StacksThirdAndFifthAboveTheRoot()
    {
        var am = new Chord
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

        var midiNotes = ChordVoicing.ToCloseVoicingMidiNotes(am, rootMidi: 45); // A2

        Assert.Equal(new[] { 45, 48, 52 }, midiNotes); // A2, C3 (+3 semitones), E3 (+7 semitones)
    }

    [Fact]
    public void ToCloseVoicingMidiNotes_RootAlwaysMapsToRootMidiExactly()
    {
        var f = new Chord
        {
            Name = "F",
            Root = new Note(5, "F"),
            Quality = ChordQuality.Major,
            Notes = new[]
            {
                new ChordTone(new Note(5, "F"), ChordDegree.Root),
                new ChordTone(new Note(9, "A"), ChordDegree.Third),
                new ChordTone(new Note(0, "C"), ChordDegree.Fifth),
            },
            SuggestedScale = new Scale { Name = "F Mayor", Root = new Note(5, "F"), Type = ScaleType.Ionian, Notes = Array.Empty<ScaleTone>() },
        };

        var midiNotes = ChordVoicing.ToCloseVoicingMidiNotes(f, rootMidi: 53); // F3

        Assert.Equal(53, midiNotes[0]);
        Assert.Equal(new[] { 53, 57, 60 }, midiNotes); // F3, A3 (+4), C4 (+7)
    }
}
