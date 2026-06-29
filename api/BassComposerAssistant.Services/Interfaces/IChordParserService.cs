using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Services.Models;

namespace BassComposerAssistant.Services.Interfaces;

/// <summary>Parses chord symbols (e.g. "Am7", "F#m", "Ebmaj7") into Chord models.</summary>
public interface IChordParserService
{
    /// <summary>Tries to parse a single chord symbol. Returns false (never throws) if invalid.</summary>
    bool TryParseChord(string symbol, out Chord? chord);

    /// <summary>Parses a whitespace-separated progression, collecting any unparseable tokens.</summary>
    ChordParseResult ParseProgression(string text);
}
