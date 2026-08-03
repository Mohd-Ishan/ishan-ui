import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Navbar } from "../index";

describe("Navbar independent layout system", () => {
  it("uses flex layout mode when brand/navigation/actions are not set (backward compatibility)", () => {
    render(<Navbar config={{ navigation: { items: [{ id: "home", label: "Home", path: "/" }] } }} />);
    const container = screen.getByRole("navigation");
    expect(container).toHaveAttribute("data-layout", "flex");
  });

  it("switches to grid layout mode when any of brand/navigation/actions is set", () => {
    render(<Navbar config={{ layout: { navigation: "center" } }} />);
    const container = screen.getByRole("navigation");
    expect(container).toHaveAttribute("data-layout", "grid");
  });

  it("renders brand, nav items, and actions regardless of layout mode", () => {
    render(
      <Navbar
        config={{
          layout: { brand: "start", navigation: "center", actions: "end" },
          navigation: { items: [{ id: "home", label: "Home", path: "/" }] },
          cta: { enabled: true, label: "Go" },
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
  });

  it("applies configured section gaps and widths as CSS custom properties", () => {
    render(
      <Navbar
        config={{
          layout: {
            navigation: "center",
            sectionGap: 48,
            navigationActionsGap: 56,
            brandWidth: "20%",
            navigationWidth: "60%",
            actionsWidth: "20%",
          },
        }}
      />,
    );
    const header = screen.getByRole("navigation").closest("header");
    expect(header).toHaveStyle({
      "--ishan-navbar-section-gap": "48px",
      "--ishan-navbar-nav-actions-gap": "56px",
      "--ishan-navbar-brand-width": "20%",
      "--ishan-navbar-nav-width": "60%",
      "--ishan-navbar-actions-width": "20%",
    });
  });

  it("defaults section gaps to a multiple of appearance.spacing when unset", () => {
    render(<Navbar config={{ layout: { brand: "center" }, appearance: { spacing: 10 } }} />);
    const header = screen.getByRole("navigation").closest("header");
    expect(header).toHaveStyle({ "--ishan-navbar-section-gap": "30px" });
  });
});
