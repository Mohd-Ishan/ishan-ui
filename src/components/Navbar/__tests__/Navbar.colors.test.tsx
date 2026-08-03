import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Navbar } from "../index";

describe("Navbar advanced color system", () => {
  it("renders without crashing when no colors are provided (backward compatibility)", () => {
    render(<Navbar config={{ navigation: { items: [{ id: "home", label: "Home", path: "/" }] } }} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("applies an explicit text color override as a CSS custom property", () => {
    render(
      <Navbar
        config={{
          appearance: { colors: { text: "rgb(10, 20, 30)" } },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );

    const header = screen.getByRole("navigation").closest("header");
    expect(header).toHaveStyle({ "--ishan-navbar-color-text": "rgb(10, 20, 30)" });
  });

  it("does not set a CSS var for color keys that were never provided", () => {
    render(
      <Navbar
        config={{
          appearance: { colors: { text: "rgb(10, 20, 30)" } },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
        }}
      />,
    );

    const header = screen.getByRole("navigation").closest("header") as HTMLElement;
    expect(header.style.getPropertyValue("--ishan-navbar-color-cta-bg")).toBe("");
  });

  it("applies CTA color overrides", () => {
    render(
      <Navbar
        config={{
          cta: { enabled: true, label: "Buy now" },
          appearance: {
            colors: { ctaBackground: "rgb(1, 2, 3)", ctaText: "rgb(4, 5, 6)" },
          },
        }}
      />,
    );

    const header = screen.getByRole("navigation").closest("header");
    expect(header).toHaveStyle({
      "--ishan-navbar-color-cta-bg": "rgb(1, 2, 3)",
      "--ishan-navbar-color-cta-text": "rgb(4, 5, 6)",
    });
  });

  it("respects every appearance variant alongside custom colors without crashing", () => {
    const variants = ["light", "dark", "glass", "transparent"] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Navbar
          config={{
            appearance: { variant, colors: { activeText: "rgb(9, 9, 9)" } },
            navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
          }}
        />,
      );
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
      unmount();
    }
  });
});
