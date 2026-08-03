import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "../index";

function setPathname(pathname: string) {
  act(() => {
    window.history.pushState({}, "", pathname);
  });
}

beforeEach(() => {
  setPathname("/");
});

describe("Navbar navigation", () => {
  it("navigates via history.pushState when an internal link is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Navbar
        config={{
          navigation: {
            items: [
              { id: "home", label: "Home", path: "/" },
              { id: "about", label: "About", path: "/about" },
            ],
          },
        }}
      />,
    );

    await user.click(screen.getByRole("link", { name: "About" }));
    expect(window.location.pathname).toBe("/about");
  });

  it("does not intercept external links", async () => {
    render(
      <Navbar
        config={{
          navigation: {
            items: [{ id: "docs", label: "Docs", path: "https://example.com", external: true }],
          },
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("calls cta.onClick when the CTA is activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Navbar
        config={{
          cta: { enabled: true, label: "Book a demo", href: "/demo", onClick },
        }}
      />,
    );

    await user.click(screen.getByRole("link", { name: "Book a demo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe("/demo");
  });

  it("renders nothing (hideOnRoutes) yet does not throw when navigating away from a hidden route", async () => {
    setPathname("/login");
    const { container, rerender } = render(
      <Navbar config={{ behavior: { hideOnRoutes: ["/login"] } }} />,
    );
    expect(container).toBeEmptyDOMElement();

    setPathname("/dashboard");
    rerender(<Navbar config={{ behavior: { hideOnRoutes: ["/login"] } }} />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("delegates navigation to config.router.onNavigate when provided, instead of internal history.pushState", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <Navbar
        config={{
          navigation: {
            items: [{ id: "about", label: "About", path: "/about" }],
          },
          router: { onNavigate, currentPath: "/dashboard" },
        }}
      />,
    );

    await user.click(screen.getByRole("link", { name: "About" }));
    expect(onNavigate).toHaveBeenCalledWith("/about");
    // The router owns navigation now — Navbar must not also push its own history entry.
    expect(window.location.pathname).not.toBe("/about");
  });

  it("uses config.router.currentPath (not internal tracking) for active-link highlighting", () => {
    render(
      <Navbar
        config={{
          navigation: {
            items: [
              { id: "home", label: "Home", path: "/" },
              { id: "about", label: "About", path: "/about" },
            ],
          },
          router: { currentPath: "/about", onNavigate: vi.fn() },
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
});
