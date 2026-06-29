using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Models;

/// <summary>One note belonging to a chord, tagged with the degree it plays (for coloring).</summary>
public sealed record ChordTone(Note Note, ChordDegree Degree);
