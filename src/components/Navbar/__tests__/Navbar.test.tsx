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

describe("Navbar", () => {
  it("renders with zero config props (production-usable defaults)", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders every configured navigation item with no upper bound", () => {
    render(<Navbar config={{ navigation: { items: NAV_ITEMS } }} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("marks the link matching the current route as active via aria-current", () => {
    setPathname("/about");
    render(<Navbar config={{ navigation: { items: NAV_ITEMS } }} />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("renders nothing when the current route matches hideOnRoutes", () => {
    setPathname("/login");
    const { container } = render(
      <Navbar config={{ behavior: { hideOnRoutes: ["/login"] } }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("matches dynamic hideOnRoutes patterns", () => {
    setPathname("/reset-password/abc123");
    const { container } = render(
      <Navbar config={{ behavior: { hideOnRoutes: ["/reset-password/:token"] } }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render the CTA button when cta.enabled is false", () => {
    render(<Navbar config={{ cta: { enabled: false } }} />);
    expect(screen.queryByRole("link", { name: "Get Started" })).not.toBeInTheDocument();
  });

  it("renders the CTA with the configured label when enabled", () => {
    render(<Navbar config={{ cta: { enabled: true, label: "Book a demo" } }} />);
    expect(screen.getByRole("link", { name: "Book a demo" })).toBeInTheDocument();
  });

  it("applies the accessible nav label from config", () => {
    render(<Navbar config={{ accessibility: { ariaLabel: "Primary" } }} />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });

  it("opens the profile menu and calls onLogout when Log out is clicked", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    render(
      <Navbar
        config={{
          profile: { enabled: true, name: "Ishan", onLogout },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
