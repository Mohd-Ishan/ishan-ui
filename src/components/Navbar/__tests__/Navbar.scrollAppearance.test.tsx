import "@testing-library/jest-dom/vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Navbar } from "../index";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", { value, configurable: true, writable: true });
}

function fireScroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

afterEach(() => {
  setScrollY(0);
});

describe("Navbar scroll appearance transition", () => {
  it("uses the static appearance.variant when scrollAppearance is not set (backward compatibility)", () => {
    render(<Navbar config={{ appearance: { variant: "dark" } }} />);
    const header = screen.getByRole("navigation").closest("header");
    expect(header).toHaveAttribute("data-variant", "dark");
  });

  it('starts at the "from" variant before the trigger is reached', () => {
    setScrollY(0);
    render(
      <Navbar
        config={{
          scrollAppearance: { enabled: true, trigger: 80, from: "transparent", to: "glass" },
        }}
      />,
    );
    const header = screen.getByRole("navigation").closest("header");
    expect(header).toHaveAttribute("data-variant", "transparent");
  });

  it('switches to the "to" variant once scroll position passes the trigger', async () => {
    setScrollY(0);
    render(
      <Navbar
        config={{
          scrollAppearance: { enabled: true, trigger: 80, from: "transparent", to: "glass" },
        }}
      />,
    );

    setScrollY(150);
    fireScroll();

    const header = screen.getByRole("navigation").closest("header");
    await waitFor(() => expect(header).toHaveAttribute("data-variant", "glass"));
  });

  it('restores the "from" variant when scrolling back above the trigger', async () => {
    setScrollY(150);
    render(
      <Navbar
        config={{
          scrollAppearance: { enabled: true, trigger: 80, from: "light", to: "dark" },
        }}
      />,
    );
    fireScroll();

    let header = screen.getByRole("navigation").closest("header");
    await waitFor(() => expect(header).toHaveAttribute("data-variant", "dark"));

    setScrollY(0);
    fireScroll();

    header = screen.getByRole("navigation").closest("header");
    await waitFor(() => expect(header).toHaveAttribute("data-variant", "light"));
  });

  it("does not interfere with hideOnScroll running at the same time", () => {
    render(
      <Navbar
        config={{
          scrollAppearance: { enabled: true, trigger: 80, from: "transparent", to: "glass" },
          behavior: { hideOnScroll: true },
        }}
      />,
    );
    // Renders without throwing — the two scroll-driven mechanisms coexist.
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("does not interfere with scrollSpy running at the same time", () => {
    render(
      <Navbar
        config={{
          scrollAppearance: { enabled: true, trigger: 80, from: "transparent", to: "glass" },
          scrollSpy: { enabled: true },
          navigation: { items: [{ id: "home", label: "Home", path: "#home" }] },
        }}
      />,
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("respects position=sticky/floating/static alongside scroll appearance without interference", () => {
    for (const position of ["sticky", "floating", "static"] as const) {
      const { unmount } = render(
        <Navbar
          config={{
            layout: { position },
            scrollAppearance: { enabled: true, trigger: 80, from: "transparent", to: "glass" },
          }}
        />,
      );
      const header = screen.getByRole("navigation").closest("header");
      expect(header).toHaveAttribute("data-position", position);
      unmount();
    }
  });
});
