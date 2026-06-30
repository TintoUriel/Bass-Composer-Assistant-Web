using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;

namespace BassComposerAssistant.Api.Web;

public static class DtoMapper
{
    // C2 (MIDI 36) is the start of the octave containing A2 (45) — anchors each chord's actual
    // root pitch class to that same bass register instead of always playing at a fixed pitch.
    private const int ChordStabRegisterBaseMidi = 36;

    public static NoteDto ToDto(this Note note) => new(note.PitchClass, note.Name);

    public static ScaleDto ToDto(this Scale scale) => new(
        scale.Name,
        scale.Root.ToDto(),
        scale.Type.ToString(),
        scale.Notes.Select(tone => new ScaleToneDto(tone.Note.ToDto(), tone.Degree.ToString())).ToList());

    public static ChordDto ToDto(this Chord chord) => new(
        chord.Name,
        chord.Root.ToDto(),
        chord.Quality.ToString(),
        chord.Notes.Select(tone => new ChordToneDto(tone.Note.ToDto(), tone.Degree.ToString())).ToList(),
        chord.SuggestedScale.ToDto(),
        ChordVoicing.ToCloseVoicingMidiNotes(chord, ChordStabRegisterBaseMidi + chord.Root.PitchClass).ToList());

    public static FretPositionDto ToDto(int stringNumber, int fret, Note note, int octave) =>
        new(stringNumber, fret, note.ToDto(), octave);
}
