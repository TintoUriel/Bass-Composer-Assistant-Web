using BassComposerAssistant.Core.Enums;

namespace BassComposerAssistant.Core.Models;

/// <summary>One note belonging to a scale, tagged with its degree (for coloring).</summary>
public sealed record ScaleTone(Note Note, ScaleDegree Degree);
