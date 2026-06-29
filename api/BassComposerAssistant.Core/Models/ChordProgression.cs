namespace BassComposerAssistant.Core.Models;

/// <summary>An ordered list of chords that loops, with timing rules for advancing through it.</summary>
public sealed class ChordProgression
{
    public required IReadOnlyList<Chord> Chords { get; init; }
    public int BeatsPerMeasure { get; init; } = 4;
    public int MeasuresPerChord { get; init; } = 1;

    public int TotalMeasures => Chords.Count * MeasuresPerChord;
}
