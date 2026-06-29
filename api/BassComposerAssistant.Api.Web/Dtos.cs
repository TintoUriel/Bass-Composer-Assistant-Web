using BassComposerAssistant.Core.Models;

namespace BassComposerAssistant.Api.Web;

public sealed record NoteDto(int PitchClass, string Name);

public sealed record ChordToneDto(NoteDto Note, string Degree);

public sealed record ScaleToneDto(NoteDto Note, string Degree);

public sealed record ScaleDto(string Name, NoteDto Root, string Type, IReadOnlyList<ScaleToneDto> Notes);

public sealed record ChordDto(
    string Name,
    NoteDto Root,
    string Quality,
    IReadOnlyList<ChordToneDto> Notes,
    ScaleDto SuggestedScale,
    IReadOnlyList<int> SuggestedVoicingMidiNotes);

public sealed record FretPositionDto(int StringNumber, int Fret, NoteDto Note, int Octave);

public sealed record ParseProgressionRequest(string Text);

public sealed record ParseProgressionResponse(IReadOnlyList<ChordDto> Chords, IReadOnlyList<string> InvalidTokens);

public sealed record ChordSymbolRequest(string ChordSymbol);

public sealed record ChordSymbolsRequest(IReadOnlyList<string> ChordSymbols);

public sealed record HighlightMapResponse(IReadOnlyDictionary<int, string> Highlights);

public sealed record FretboardGridResponse(IReadOnlyList<FretPositionDto> Positions);
