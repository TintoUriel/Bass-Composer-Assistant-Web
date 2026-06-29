using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;

namespace BassComposerAssistant.Api.Web;

public static class DtoMapper
{
    private const int ChordStabRootMidi = 45; // A2, same comfortable bass register as the desktop app

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
        ChordVoicing.ToCloseVoicingMidiNotes(chord, ChordStabRootMidi).ToList());

    public static FretPositionDto ToDto(int stringNumber, int fret, Note note, int octave) =>
        new(stringNumber, fret, note.ToDto(), octave);
}
