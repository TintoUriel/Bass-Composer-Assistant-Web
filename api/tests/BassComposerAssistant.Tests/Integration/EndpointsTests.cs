using System.Net;
using System.Net.Http.Json;
using BassComposerAssistant.Api.Web;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace BassComposerAssistant.Tests.Integration;

/// <summary>
/// Tests de integración livianos (CLAUDE.md): levantan la API entera en memoria vía
/// WebApplicationFactory y pegan contra los endpoints reales, sin mockear nada — la lógica de
/// teoría musical ya está cubierta por los tests unitarios de Core/Services; esto solo verifica
/// que el wiring HTTP (rutas, serialización JSON, status codes) funcione.
/// </summary>
public class EndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public EndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/health");

        response.EnsureSuccessStatusCode();
        Assert.Equal("ok", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task ParseProgression_ReturnsChordsAndFlagsInvalidTokens()
    {
        var response = await _client.PostAsJsonAsync("/api/progressions/parse", new { text = "Am F Xyz C" });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<ParseProgressionResponse>();

        Assert.NotNull(body);
        Assert.Equal(3, body!.Chords.Count);
        Assert.Equal(new[] { "Xyz" }, body.InvalidTokens);
        Assert.Equal("Am", body.Chords[0].Name);
        Assert.NotEmpty(body.Chords[0].SuggestedVoicingMidiNotes);
    }

    [Fact]
    public async Task BuildScale_ReturnsRequestedScale()
    {
        var response = await _client.GetAsync("/api/scales/build?root=9&type=Aeolian");

        response.EnsureSuccessStatusCode();
        var scale = await response.Content.ReadFromJsonAsync<ScaleDto>();

        Assert.NotNull(scale);
        Assert.Equal("A Eólico", scale!.Name);
        Assert.Equal(7, scale.Notes.Count);
    }

    [Fact]
    public async Task Fretboard_StandardTuning_Returns24FretsTimes4Strings()
    {
        var response = await _client.GetAsync("/api/fretboard?fretCount=24");

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<FretboardGridResponse>();

        Assert.NotNull(body);
        Assert.Equal(4 * 25, body!.Positions.Count);
    }

    [Fact]
    public async Task ChordHighlights_KnownChord_ReturnsDegreeMap()
    {
        var response = await _client.PostAsJsonAsync("/api/highlights/chord", new { chordSymbol = "Am" });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<HighlightMapResponse>();

        Assert.NotNull(body);
        Assert.Equal("ChordRoot", body!.Highlights[9]);
        Assert.Equal("ChordThird", body.Highlights[0]);
        Assert.Equal("ChordFifth", body.Highlights[4]);
    }

    [Fact]
    public async Task ChordHighlights_InvalidSymbol_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/highlights/chord", new { chordSymbol = "Xyz" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ScaleHighlights_KnownChord_ReturnsScaleDegreeMap()
    {
        var response = await _client.PostAsJsonAsync("/api/highlights/scale", new { chordSymbol = "Am" });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<HighlightMapResponse>();

        Assert.NotNull(body);
        Assert.Equal("ScaleTonic", body!.Highlights[9]);
    }

    [Fact]
    public async Task CommonTonesHighlights_OnlyKeepsSharedPitchClasses()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/highlights/common-tones",
            new { chordSymbols = new[] { "Am", "F", "C" } });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<HighlightMapResponse>();

        Assert.NotNull(body);
        Assert.Equal(new[] { 0 }, body!.Highlights.Keys.OrderBy(k => k)); // C es la única nota común
        Assert.Equal("CommonTone", body.Highlights[0]);
    }

    [Fact]
    public async Task CommonTonesHighlights_InvalidSymbol_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/highlights/common-tones",
            new { chordSymbols = new[] { "Am", "Xyz" } });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
