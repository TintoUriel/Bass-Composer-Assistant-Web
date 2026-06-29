import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChordPalette } from "./ChordPalette";
import { PlaybackProvider } from "@/context/PlaybackContext";

// La paleta solo necesita progressionText/invalidTokens del contexto, que dependen del backend
// real vía parseProgression — se mockea para que el test sea de la lógica de clicks, no de red.
vi.mock("@/lib/api", () => ({
  parseProgression: vi.fn().mockResolvedValue({ chords: [], invalidTokens: [] }),
  fetchFretboard: vi.fn().mockResolvedValue({ positions: [] }),
  fetchChordHighlights: vi.fn().mockResolvedValue({}),
  fetchScaleHighlights: vi.fn().mockResolvedValue({}),
  fetchCommonTonesHighlights: vi.fn().mockResolvedValue({}),
}));

function renderPalette() {
  return render(
    <PlaybackProvider>
      <ChordPalette />
    </PlaybackProvider>,
  );
}

describe("ChordPalette", () => {
  it("clicking a root then a quality appends the right token", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.click(screen.getByRole("button", { name: "A", exact: true }));
    await user.click(screen.getByRole("button", { name: "Menor", exact: true }));

    await waitFor(() => expect(screen.getByText("Am")).toBeInTheDocument());
  });

  it("appends successive tokens separated by a space", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.click(screen.getByRole("button", { name: "A", exact: true }));
    await user.click(screen.getByRole("button", { name: "Menor", exact: true }));
    await user.click(screen.getByRole("button", { name: "C", exact: true }));
    await user.click(screen.getByRole("button", { name: "Mayor", exact: true }));

    await waitFor(() => expect(screen.getByText("Am C")).toBeInTheDocument());
  });

  it("Quitar último removes only the last token", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.click(screen.getByRole("button", { name: "A", exact: true }));
    await user.click(screen.getByRole("button", { name: "Menor", exact: true }));
    await user.click(screen.getByRole("button", { name: "C", exact: true }));
    await user.click(screen.getByRole("button", { name: "Mayor", exact: true }));
    await waitFor(() => expect(screen.getByText("Am C")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Quitar último/ }));

    await waitFor(() => expect(screen.getByText("Am")).toBeInTheDocument());
  });

  it("Limpiar resets the progression to the empty placeholder", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.click(screen.getByRole("button", { name: "A", exact: true }));
    await user.click(screen.getByRole("button", { name: "Menor", exact: true }));
    await waitFor(() => expect(screen.getByText("Am")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Limpiar/ }));

    await waitFor(() => expect(screen.getByText("— SIN ACORDES —")).toBeInTheDocument());
  });
});
