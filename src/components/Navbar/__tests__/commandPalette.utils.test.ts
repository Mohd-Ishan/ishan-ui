import { describe, expect, it, vi } from "vitest";
import { buildSearchableItems, filterCommandItems } from "../commandPalette.utils";

const NAV_ITEMS = [
  { id: "home", label: "Home", path: "/" },
  {
    id: "components",
    label: "Components",
    path: "/components",
    dropdown: [
      { id: "navbar", label: "Navbar", path: "/components/navbar" },
      { id: "button", label: "Button", path: "/components/button" },
    ],
  },
];

const COMMANDS = [
  { id: "docs", label: "Documentation", path: "/docs" },
  { id: "gh", label: "GitHub", action: vi.fn(), keywords: ["repository", "source"] },
];

describe("buildSearchableItems", () => {
  it("flattens nav items, their dropdown children, and custom commands into one list", () => {
    const items = buildSearchableItems(NAV_ITEMS, COMMANDS);
    // Home, Components, Components/Navbar, Components/Button, Documentation, GitHub
    expect(items).toHaveLength(6);
  });

  it("labels dropdown children with their parent for context", () => {
    const items = buildSearchableItems(NAV_ITEMS, []);
    const navbarChild = items.find((i) => i.label.includes("Navbar"));
    expect(navbarChild?.label).toBe("Components / Navbar");
  });

  it("tags navigation items and commands with the correct group", () => {
    const items = buildSearchableItems(NAV_ITEMS, COMMANDS);
    expect(items.find((i) => i.label === "Home")?.group).toBe("Navigation");
    expect(items.find((i) => i.label === "GitHub")?.group).toBe("Commands");
  });
});

describe("filterCommandItems", () => {
  const items = buildSearchableItems(NAV_ITEMS, COMMANDS);

  it("returns everything, unranked, for an empty query", () => {
    const results = filterCommandItems("", items);
    expect(results).toHaveLength(items.length);
    expect(results.every((r) => r.matchStart === -1)).toBe(true);
  });

  it("matches case-insensitively against the label", () => {
    const results = filterCommandItems("HOME", items);
    expect(results.map((r) => r.label)).toContain("Home");
  });

  it("computes the correct highlight range for a label match", () => {
    const results = filterCommandItems("comp", items);
    const match = results.find((r) => r.label === "Components");
    expect(match?.matchStart).toBe(0);
    expect(match?.matchEnd).toBe(4);
  });

  it("matches via keywords when the label itself doesn't match", () => {
    const results = filterCommandItems("repository", items);
    expect(results.map((r) => r.label)).toContain("GitHub");
  });

  it("excludes items that match neither label nor keywords", () => {
    const results = filterCommandItems("zzz-no-match", items);
    expect(results).toHaveLength(0);
  });

  it("matches dropdown children by their combined label", () => {
    const results = filterCommandItems("navbar", items);
    expect(results.map((r) => r.label)).toContain("Components / Navbar");
  });
});
