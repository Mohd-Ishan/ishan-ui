import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "../index";

const SCROLL_SPY_ITEMS = [
  { id: "home", label: "Home", path: "#home" },
  { id: "about", label: "About", path: "#about" },
  { id: "pricing", label: "Pricing", path: "#pricing" },
];

let observedCallback: IntersectionObserverCallback | null = null;
let observedElements: Element[] = [];

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observedCallback = callback;
  }
  observe(el: Element) {
    observedElements.push(el);
  }
  unobserve() {}
  disconnect() {
    observedElements = [];
  }
}

function fireIntersection(id: string, isIntersecting: boolean, top = 0) {
  const target = document.getElementById(id)!;
  act(() => {
    observedCallback?.(
      [
        {
          target,
          isIntersecting,
          boundingClientRect: { top } as DOMRectReadOnly,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  });
}

function renderSections() {
  const container = document.createElement("div");
  container.innerHTML = `
    <section id="home"></section>
    <section id="about"></section>
    <section id="pricing"></section>
  `;
  document.body.appendChild(container);
  return () => document.body.removeChild(container);
}

beforeEach(() => {
  observedCallback = null;
  observedElements = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Navbar scroll spy", () => {
  it("does not observe any sections when scrollSpy is disabled (default)", () => {
    const cleanup = renderSections();
    render(<Navbar config={{ navigation: { items: SCROLL_SPY_ITEMS } }} />);
    expect(observedElements).toHaveLength(0);
    cleanup();
  });

  it("observes every #hash section when scrollSpy.enabled is true", () => {
    const cleanup = renderSections();
    render(
      <Navbar
        config={{
          navigation: { items: SCROLL_SPY_ITEMS },
          scrollSpy: { enabled: true, offset: 80 },
        }}
      />,
    );
    expect(observedElements).toHaveLength(3);
    cleanup();
  });

  it("highlights the nav item whose section is currently intersecting", async () => {
    const cleanup = renderSections();
    render(
      <Navbar
        config={{
          navigation: { items: SCROLL_SPY_ITEMS },
          scrollSpy: { enabled: true },
        }}
      />,
    );

    fireIntersection("about", true);

    expect(await screen.findByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    cleanup();
  });

  it("never marks a routed (non-hash) item active via scroll spy", () => {
    const cleanup = renderSections();
    render(
      <Navbar
        config={{
          navigation: {
            items: [...SCROLL_SPY_ITEMS, { id: "docs", label: "Docs", path: "/docs" }],
          },
          scrollSpy: { enabled: true },
        }}
      />,
    );

    fireIntersection("home", true);
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("aria-current");
    cleanup();
  });
});
