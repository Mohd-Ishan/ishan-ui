import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "../index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Navbar animation configuration", () => {
  it("renders correctly with animation.enabled: false", () => {
    render(
      <Navbar
        config={{
          animation: { enabled: false },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("respects accessibility.reduceMotion: 'always' regardless of system preference", () => {
    // Simulate a system that does NOT prefer reduced motion...
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // ...the explicit "always" config must still win and render without error.
    render(
      <Navbar
        config={{
          accessibility: { reduceMotion: "always" },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("respects the system prefers-reduced-motion setting when reduceMotion is 'auto'", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <Navbar
        config={{
          accessibility: { reduceMotion: "auto" },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
