using BassComposerAssistant.Core.Models;

namespace BassComposerAssistant.Core.Theory;

/// <summary>
/// Maps a Chord's pitch classes to actual MIDI note numbers for audio playback. Chord/ChordTone
/// only carry pitch class (0-11), not octave, so this picks one: every tone is placed in the
/// octave starting at <paramref name="rootMidi"/> (a close voicing — root plus each tone's
/// ascending interval above it, all within one octave), which is enough for a quick audible
/// "stab" of the chord without needing a full voice-leading engine.
/// </summary>
public static class ChordVoicing
{
    public static IReadOnlyList<int> ToCloseVoicingMidiNotes(Chord chord, int rootMidi)
    {
        var rootPitchClass = chord.Root.PitchClass;

        return chord.Notes
            .Select(tone => rootMidi + NoteCalculator.NormalizePitchClass(tone.Note.PitchClass - rootPitchClass))
            .ToList();
    }
}
