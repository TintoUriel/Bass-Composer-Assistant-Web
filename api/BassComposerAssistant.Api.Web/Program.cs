using System.Text.Json.Serialization;
using BassComposerAssistant.Api.Web;
using BassComposerAssistant.Core.Enums;
using BassComposerAssistant.Core.Models;
using BassComposerAssistant.Core.Theory;
using BassComposerAssistant.Services.Implementations;
using BassComposerAssistant.Services.Interfaces;

const string NextJsDevCorsPolicy = "NextJsDev";

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddCors(options => options.AddPolicy(NextJsDevCorsPolicy, policy =>
{
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:3000" };
    policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader();
}));

builder.Services.AddSingleton<IScaleService, ScaleService>();
builder.Services.AddSingleton<IChordParserService, ChordParserService>();
builder.Services.AddSingleton<IFretboardHighlightService, FretboardHighlightService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(NextJsDevCorsPolicy);

app.MapGet("/api/health", () => "ok");

app.MapPost("/api/progressions/parse", (ParseProgressionRequest request, IChordParserService parser) =>
{
    var result = parser.ParseProgression(request.Text);
    return new ParseProgressionResponse(
        result.Progression.Chords.Select(c => c.ToDto()).ToList(),
        result.InvalidTokens);
});

app.MapGet("/api/scales/build", (int root, ScaleType type, IScaleService scaleService) =>
{
    var rootNote = NoteCalculator.GetNote(root, preferFlats: false);
    return scaleService.BuildScale(rootNote, type).ToDto();
});

app.MapGet("/api/fretboard", (int? fretCount) =>
    new FretboardGridResponse(FretboardGridBuilder.Build(BassTuning.Standard4String, fretCount ?? 24)));

app.MapPost("/api/highlights/chord", (ChordSymbolRequest request, IChordParserService parser, IFretboardHighlightService highlights) =>
{
    if (!parser.TryParseChord(request.ChordSymbol, out var chord) || chord is null)
        return Results.BadRequest($"Invalid chord symbol: {request.ChordSymbol}");

    var map = highlights.BuildChordHighlightMap(chord);
    return Results.Ok(new HighlightMapResponse(ToStringKeyed(map)));
});

app.MapPost("/api/highlights/triad", (ChordSymbolRequest request, IChordParserService parser, IFretboardHighlightService highlights) =>
{
    if (!parser.TryParseChord(request.ChordSymbol, out var chord) || chord is null)
        return Results.BadRequest($"Invalid chord symbol: {request.ChordSymbol}");

    var map = highlights.BuildTriadHighlightMap(chord);
    return Results.Ok(new HighlightMapResponse(ToStringKeyed(map)));
});

app.MapPost("/api/highlights/scale", (ChordSymbolRequest request, IChordParserService parser, IFretboardHighlightService highlights) =>
{
    if (!parser.TryParseChord(request.ChordSymbol, out var chord) || chord is null)
        return Results.BadRequest($"Invalid chord symbol: {request.ChordSymbol}");

    var map = highlights.BuildScaleHighlightMap(chord.SuggestedScale);
    return Results.Ok(new HighlightMapResponse(ToStringKeyed(map)));
});

app.MapPost("/api/highlights/common-tones", (ChordSymbolsRequest request, IChordParserService parser, IFretboardHighlightService highlights) =>
{
    var chords = new List<Chord>();
    foreach (var symbol in request.ChordSymbols)
    {
        if (!parser.TryParseChord(symbol, out var chord) || chord is null)
            return Results.BadRequest($"Invalid chord symbol: {symbol}");
        chords.Add(chord);
    }

    var map = highlights.BuildCommonTonesHighlightMap(chords);
    return Results.Ok(new HighlightMapResponse(ToStringKeyed(map)));
});

app.Run();

static IReadOnlyDictionary<int, string> ToStringKeyed(IReadOnlyDictionary<int, HighlightType> map) =>
    map.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

// Expone el Program generado por los top-level statements para que WebApplicationFactory<Program>
// (tests de integración) pueda referenciarlo desde fuera del ensamblado.
public partial class Program;
