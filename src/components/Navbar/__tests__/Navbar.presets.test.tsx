import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Navbar } from "../index";

const PRESETS = ["slide", "fade", "scale", "blur", "spring"] as const;

describe("Navbar animation presets", () => {
  it.each(PRESETS)("renders correctly with preset=\"%s\"", (preset) => {
    render(
      <Navbar
        config={{
          animation: { preset, duration: 0.3, delay: 0.05, easing: "easeInOut" },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
          cta: { enabled: true },
          profile: { enabled: true, name: "Test User" },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it.each(PRESETS)("applies preset=\"%s\" to the profile dropdown without crashing", async (preset) => {
    const user = userEvent.setup();
    render(
      <Navbar
        config={{
          animation: { preset },
          profile: { enabled: true, name: "Test User" },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("supports the stagger alias as an equivalent to staggerDelay", () => {
    render(
      <Navbar
        config={{
          animation: { stagger: 0.12 },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
