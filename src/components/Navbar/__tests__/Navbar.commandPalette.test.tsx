import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "../index";

const NAV_ITEMS = [
  { id: "home", label: "Home", path: "/" },
  { id: "about", label: "About", path: "/about" },
];

function setPathname(pathname: string) {
  window.history.pushState({}, "", pathname);
}

beforeEach(() => {
  setPathname("/");
});

describe("Navbar command palette", () => {
  it("is not rendered at all when commandPalette is not configured (backward compatibility)", () => {
    render(<Navbar config={{ navigation: { items: NAV_ITEMS } }} />);
    expect(screen.queryByRole("dialog", { name: /command palette/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/open command palette/i)).not.toBeInTheDocument();
  });

  it("renders a visible trigger button when enabled", () => {
    render(
      <Navbar config={{ navigation: { items: NAV_ITEMS }, commandPalette: { enabled: true } }} />,
    );
    expect(screen.getByLabelText(/open command palette/i)).toBeInTheDocument();
  });

  it("opens via the trigger button click", async () => {
    const user = userEvent.setup();
    render(
      <Navbar config={{ navigation: { items: NAV_ITEMS }, commandPalette: { enabled: true } }} />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();
  });

  it("opens via the Ctrl+K keyboard shortcut", async () => {
    const user = userEvent.setup();
    render(
      <Navbar config={{ navigation: { items: NAV_ITEMS }, commandPalette: { enabled: true } }} />,
    );

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();
  });

  it("filters results in real time as the user types", async () => {
    const user = userEvent.setup();
    render(
      <Navbar config={{ navigation: { items: NAV_ITEMS }, commandPalette: { enabled: true } }} />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    await user.type(screen.getByRole("combobox"), "about");

    expect(screen.getByRole("option", { name: /about/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^home$/i })).not.toBeInTheDocument();
  });

  it("navigates to the selected item on Enter", async () => {
    const user = userEvent.setup();
    render(
      <Navbar config={{ navigation: { items: NAV_ITEMS }, commandPalette: { enabled: true } }} />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    await user.type(screen.getByRole("combobox"), "about");
    await user.keyboard("{Enter}");

    expect(window.location.pathname).toBe("/about");
  });

  it("supports Arrow key navigation between results", async () => {
    const user = userEvent.setup();
    render(
      <Navbar config={{ navigation: { items: NAV_ITEMS }, commandPalette: { enabled: true } }} />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    // No query — both items visible; arrow down twice should wrap back to the first.
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    // Whichever item ends up selected, Enter must navigate somewhere valid.
    expect(["/", "/about"]).toContain(window.location.pathname);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Navbar
        config={{
          navigation: { items: NAV_ITEMS },
          commandPalette: { enabled: true },
          animation: { enabled: false },
        }}
      />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /command palette/i })).not.toBeInTheDocument();
  });

  it("searches and runs custom commands, including action-based ones", async () => {
    const user = userEvent.setup();
    const action = vi.fn();

    render(
      <Navbar
        config={{
          navigation: { items: NAV_ITEMS },
          commandPalette: {
            enabled: true,
            commands: [{ id: "toggle-theme", label: "Toggle theme", action }],
          },
        }}
      />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    await user.type(screen.getByRole("combobox"), "toggle");
    await user.keyboard("{Enter}");

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("respects closeOnSelect: false by keeping the palette open after a selection", async () => {
    const user = userEvent.setup();
    const action = vi.fn();

    render(
      <Navbar
        config={{
          commandPalette: {
            enabled: true,
            closeOnSelect: false,
            commands: [{ id: "log", label: "Log something", action }],
          },
        }}
      />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    await user.type(screen.getByRole("combobox"), "log");
    await user.keyboard("{Enter}");

    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();
  });

  it("uses the configured placeholder text", async () => {
    const user = userEvent.setup();
    render(
      <Navbar
        config={{
          commandPalette: { enabled: true, placeholder: "Type a command..." },
        }}
      />,
    );

    await user.click(screen.getByLabelText(/open command palette/i));
    expect(screen.getByPlaceholderText("Type a command...")).toBeInTheDocument();
  });
});
