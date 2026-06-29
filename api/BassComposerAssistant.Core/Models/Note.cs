namespace BassComposerAssistant.Core.Models;

/// <summary>
/// A pitch class (0 = C .. 11 = B) with the display spelling chosen by whoever built it
/// (sharp or flat), independent of any specific octave.
/// </summary>
public readonly record struct Note(int PitchClass, string Name)
{
    public override string ToString() => Name;
}
