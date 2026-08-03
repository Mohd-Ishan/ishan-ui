import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "../index";

/**
 * jsdom's `matchMedia` polyfill (tests/setup.ts) always reports `matches: false`
 * unless overridden per-test, so these tests stub `window.matchMedia` directly
 * to simulate a narrow viewport matching `mobile.breakpoint`.
 */
function mockViewport(isBelowBreakpoint: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isBelowBreakpoint,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Navbar responsive behavior", () => {
  it("renders desktop links and no hamburger toggle above the breakpoint", () => {
    mockViewport(false);
    render(
      <Navbar
        config={{ navigation: { items: [{ id: "home", label: "Home", path: "/" }] } }}
      />,
    );

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
  });

  it("renders the mobile toggle instead of inline links below the breakpoint", () => {
    mockViewport(true);
    render(
      <Navbar
        config={{ navigation: { items: [{ id: "home", label: "Home", path: "/" }] } }}
      />,
    );

    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });

  it("opens the mobile menu on toggle click and closes it on Escape", async () => {
    mockViewport(true);
    const user = userEvent.setup();

    render(
      <Navbar
        config={{
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
          mobile: { closeOnEscape: true },
        }}
      />,
    );

    await user.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("respects a custom mobile.breakpoint / dockPosition combination without crashing", () => {
    mockViewport(true);
    render(
      <Navbar
        config={{
          mobile: { breakpoint: 1024, dockPosition: "bottom" },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });
});
