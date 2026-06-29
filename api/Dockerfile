FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY BassComposerAssistant.Core/*.csproj BassComposerAssistant.Core/
COPY BassComposerAssistant.Services/*.csproj BassComposerAssistant.Services/
COPY BassComposerAssistant.Api.Web/*.csproj BassComposerAssistant.Api.Web/
RUN dotnet restore BassComposerAssistant.Api.Web/BassComposerAssistant.Api.Web.csproj

COPY BassComposerAssistant.Core/ BassComposerAssistant.Core/
COPY BassComposerAssistant.Services/ BassComposerAssistant.Services/
COPY BassComposerAssistant.Api.Web/ BassComposerAssistant.Api.Web/
RUN dotnet publish BassComposerAssistant.Api.Web/BassComposerAssistant.Api.Web.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

EXPOSE 8080
ENTRYPOINT ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet BassComposerAssistant.Api.Web.dll
