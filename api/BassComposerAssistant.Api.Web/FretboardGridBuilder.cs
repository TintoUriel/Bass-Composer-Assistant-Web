using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;

namespace BassComposerAssistant.Api.Web;

/// <summary>
/// Builds the fretboard grid as plain DTOs. Replaces the desktop app's
/// FretboardService.BuildFretboard, which built mutable FretPosition (ObservableObject) instances
/// for WPF binding — the API has no UI to bind to, so it emits immutable FretPositionDto directly.
/// </summary>
public static class FretboardGridBuilder
{
    public static IReadOnlyList<FretPositionDto> Build(BassTuning tuning, int fretCount = 24)
    {
        var positions = new List<FretPositionDto>();

        for (var i = 0; i < tuning.StringCount; i++)
        {
            var stringNumber = i + 1;
            var openStringMidiNote = tuning.OpenStringMidiNotes[i];

            for (var fret = 0; fret <= fretCount; fret++)
            {
                var (note, octave) = NoteCalculator.MidiToNote(openStringMidiNote + fret, preferFlats: false);
                positions.Add(DtoMapper.ToDto(stringNumber, fret, note, octave));
            }
        }

        return positions;
    }
}
