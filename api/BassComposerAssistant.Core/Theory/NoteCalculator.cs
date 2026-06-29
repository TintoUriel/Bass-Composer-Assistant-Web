using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;

namespace BassComposerAssistant.Core.Theory;

/// <summary>
/// All pitch-class and note-naming math, computed from scratch (no external music library).
/// Spelling (sharp vs flat) is chosen by the caller per root/context rather than derived from
/// a full key-signature engine — close enough for the chord/scale symbols this app accepts,
/// and isolated here so a more accurate enharmonic engine can replace it later.
/// </summary>
public static class NoteCalculator
{
    private static readonly string[] SharpNames =
        { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" };

    private static readonly string[] FlatNames =
        { "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" };

    private static readonly Dictionary<char, int> NaturalLetterPitchClass = new()
    {
        ['C'] = 0,
        ['D'] = 2,
        ['E'] = 4,
        ['F'] = 5,
        ['G'] = 7,
        ['A'] = 9,
        ['B'] = 11,
    };

    public static int NormalizePitchClass(int pitchClass)
    {
        var mod = pitchClass % 12;
        return mod < 0 ? mod + 12 : mod;
    }

    public static Note GetNote(int pitchClass, bool preferFlats)
    {
        var pc = NormalizePitchClass(pitchClass);
        var name = (preferFlats ? FlatNames : SharpNames)[pc];
        return new Note(pc, name);
    }

    /// <summary>
    /// Reads a note letter (A-G) with an optional trailing '#' or 'b' from the start of
    /// <paramref name="text"/>. Returns false (instead of throwing) if it doesn't start
    /// with a valid letter, so callers can report an invalid chord symbol.
    /// </summary>
    public static bool TryParseRootLetter(
        string text,
        out int pitchClass,
        out Accidental accidental,
        out int charactersConsumed)
    {
        pitchClass = 0;
        accidental = Accidental.Natural;
        charactersConsumed = 0;

        if (string.IsNullOrEmpty(text))
            return false;

        var letter = char.ToUpperInvariant(text[0]);
        if (!NaturalLetterPitchClass.TryGetValue(letter, out var basePitchClass))
            return false;

        charactersConsumed = 1;
        var accidentalOffset = 0;

        if (text.Length > 1 && text[1] == '#')
        {
            accidentalOffset = 1;
            accidental = Accidental.Sharp;
            charactersConsumed = 2;
        }
        else if (text.Length > 1 && text[1] == 'b')
        {
            accidentalOffset = -1;
            accidental = Accidental.Flat;
            charactersConsumed = 2;
        }

        pitchClass = NormalizePitchClass(basePitchClass + accidentalOffset);
        return true;
    }

    /// <summary>
    /// Decides whether the rest of a chord/scale's notes should be spelled with flats. An
    /// explicit root accidental always wins (an F#-rooted chord stays sharp throughout); a
    /// natural root falls back to the quality/scale's own flat-leaning convention (e.g. minor
    /// chords spell their third as a flat even when the root itself needs no accidental).
    /// </summary>
    public static bool ResolvePreferFlats(Accidental rootAccidental, bool isFlatLeaningByDefault) =>
        rootAccidental switch
        {
            Accidental.Flat => true,
            Accidental.Sharp => false,
            _ => isFlatLeaningByDefault,
        };

    /// <summary>Converts an absolute MIDI note number into a Note + octave (C4 = MIDI 60).</summary>
    public static (Note Note, int Octave) MidiToNote(int midiNumber, bool preferFlats)
    {
        var pitchClass = NormalizePitchClass(midiNumber);
        var octave = (midiNumber / 12) - 1;
        return (GetNote(pitchClass, preferFlats), octave);
    }
}
