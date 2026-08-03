import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Navbar } from "../index";

function getHeader() {
  return screen.getByRole("navigation").closest("header") as HTMLElement;
}

describe("Navbar border radius system (Feature 4)", () => {
  it("does not set any radius override vars by default (backward compatibility)", () => {
    render(<Navbar config={{}} />);
    const header = getHeader();
    expect(header.style.getPropertyValue("--ishan-navbar-radius-links")).toBe("");
    expect(header.style.getPropertyValue("--ishan-navbar-radius-cta")).toBe("");
  });

  it("applies explicit per-element radius overrides", () => {
    render(
      <Navbar
        config={{
          radius: { navbar: 4, links: 4, dropdown: 8, cta: 8, profile: 4, mobileMenu: 8 },
        }}
      />,
    );
    const header = getHeader();
    expect(header).toHaveStyle({
      "--ishan-navbar-radius-navbar": "4px",
      "--ishan-navbar-radius-links": "4px",
      "--ishan-navbar-radius-dropdown": "8px",
      "--ishan-navbar-radius-cta": "8px",
      "--ishan-navbar-radius-profile": "4px",
      "--ishan-navbar-radius-mobile-menu": "8px",
    });
  });

  it("supports a partial radius override without requiring every key", () => {
    render(<Navbar config={{ radius: { cta: 6 } }} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-radius-cta": "6px" });
    expect(header.style.getPropertyValue("--ishan-navbar-radius-links")).toBe("");
  });
});

describe("Navbar typography system (Feature 5)", () => {
  it("does not set any typography override vars by default", () => {
    render(<Navbar config={{}} />);
    const header = getHeader();
    expect(header.style.getPropertyValue("--ishan-navbar-typo-navigation-size")).toBe("");
  });

  it("applies independent typography per section", () => {
    render(
      <Navbar
        config={{
          typography: {
            logo: { fontWeight: 800 },
            navigation: { fontSize: 13, textTransform: "uppercase" },
            cta: { letterSpacing: 1 },
          },
        }}
      />,
    );
    const header = getHeader();
    expect(header).toHaveStyle({
      "--ishan-navbar-typo-logo-weight": "800",
      "--ishan-navbar-typo-navigation-size": "13px",
      "--ishan-navbar-typo-navigation-transform": "uppercase",
      "--ishan-navbar-typo-cta-spacing": "1px",
    });
  });
});

describe("Navbar logo customization (Feature 7)", () => {
  it("uses the auto-scaled default logo size when not explicitly set", () => {
    render(<Navbar config={{}} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-logo-size": "28px" });
  });

  it("respects an explicit brand.logoSize override", () => {
    render(<Navbar config={{ brand: { logoSize: 40 } }} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-logo-size": "40px" });
  });
});

describe("Navbar navigation spacing (Feature 6)", () => {
  it("uses the original defaults when unset", () => {
    render(<Navbar config={{}} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-nav-gap": "4px" });
  });

  it("respects explicit gap/padding overrides", () => {
    render(<Navbar config={{ navigation: { gap: 20, paddingX: 24, paddingY: 12 } }} />);
    const header = getHeader();
    expect(header).toHaveStyle({
      "--ishan-navbar-nav-gap": "20px",
      "--ishan-navbar-nav-padding-x": "24px",
      "--ishan-navbar-nav-padding-y": "12px",
    });
  });
});

describe("Navbar height scaling (Feature 8)", () => {
  it("computes a scale of exactly 1 at the original default height (72px)", () => {
    render(<Navbar config={{}} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-height-scale": "1" });
  });

  it("scales derived defaults (logo size) proportionally with a taller navbar", () => {
    render(<Navbar config={{ layout: { heightDesktop: 144 } }} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-height-scale": "2", "--ishan-navbar-logo-size": "56px" });
  });

  it("still respects an explicit logoSize override even when height scaling is active", () => {
    render(<Navbar config={{ layout: { heightDesktop: 144 }, brand: { logoSize: 30 } }} />);
    const header = getHeader();
    expect(header).toHaveStyle({ "--ishan-navbar-logo-size": "30px" });
  });
});

describe("Navbar floating background fix (Feature 9)", () => {
  it("renders correctly in floating position across every appearance variant", () => {
    const variants = ["light", "dark", "glass", "transparent"] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Navbar config={{ layout: { position: "floating" }, appearance: { variant } }} />,
      );
      const header = getHeader();
      expect(header).toHaveAttribute("data-position", "floating");
      unmount();
    }
  });

  it("root has a transparent background, not an opaque one that could show as a strip", () => {
    render(<Navbar config={{ layout: { position: "floating" } }} />);
    const header = getHeader();
    expect(getComputedStyle(header).background).toContain("rgba(0, 0, 0, 0)");
  });

  it("root's transition list contains only transform — background/shadow/border-color transitions belong to .container, not root", () => {
    render(<Navbar config={{ layout: { position: "floating" } }} />);
    const header = getHeader();
    const transition = getComputedStyle(header).transition;
    expect(transition).toContain("transform");
    expect(transition).not.toContain("background-color");
    expect(transition).not.toContain("box-shadow");
  });
});
