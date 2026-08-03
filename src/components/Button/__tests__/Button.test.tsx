import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../index";

describe("Button rendering", () => {
  it("renders with zero props (production-usable defaults)", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders every variant without crashing", () => {
    const variants = ["solid", "outline", "ghost", "glass", "gradient", "link"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>Go</Button>);
      const button = screen.getByRole("button", { name: "Go" });
      expect(button).toHaveAttribute("data-variant", variant);
      unmount();
    }
  });

  it("renders every size without crashing", () => {
    const sizes = ["sm", "md", "lg"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>Go</Button>);
      expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-size", size);
      unmount();
    }
  });

  it("renders left and right icons", () => {
    render(
      <Button leftIcon={<span data-testid="left" />} rightIcon={<span data-testid="right" />}>
        Go
      </Button>,
    );
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });
});

describe("Button props-over-config precedence", () => {
  it("a direct prop overrides the matching config field", () => {
    render(
      <Button variant="outline" config={{ variant: "solid" }}>
        Go
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-variant", "outline");
  });

  it("falls back to the config value when the prop is not provided", () => {
    render(<Button config={{ variant: "ghost" }}>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-variant", "ghost");
  });
});

describe("Button disabled and loading states", () => {
  it("disables the native button element when disabled", () => {
    render(<Button disabled>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
  });

  it("treats loading as implicitly disabled", () => {
    render(<Button loading>Go</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sets aria-busy while loading", () => {
    render(<Button loading>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});

describe("Button polymorphic rendering (href)", () => {
  it("renders an anchor when href is provided", () => {
    render(<Button href="/pricing">Pricing</Button>);
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("href", "/pricing");
  });

  it("adds target/rel when external", () => {
    render(
      <Button href="https://example.com" external>
        Docs
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders a button, not an anchor, when disabled even if href is set", () => {
    render(
      <Button href="/pricing" disabled>
        Pricing
      </Button>,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pricing" })).toBeDisabled();
  });
});

describe("Button colors and typography", () => {
  it("applies color overrides as CSS custom properties", () => {
    render(
      <Button config={{ colors: { background: "rgb(1, 2, 3)", text: "rgb(4, 5, 6)" } }}>
        Go
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveStyle({
      "--ishan-button-color-bg": "rgb(1, 2, 3)",
      "--ishan-button-color-text": "rgb(4, 5, 6)",
    });
  });

  it("does not set color vars for unset keys", () => {
    render(<Button config={{ colors: { background: "rgb(1, 2, 3)" } }}>Go</Button>);
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.style.getPropertyValue("--ishan-button-color-text")).toBe("");
  });

  it("applies typography overrides", () => {
    render(<Button config={{ typography: { fontWeight: 800, fontSize: 18 } }}>Go</Button>);
    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveStyle({
      "--ishan-button-typo-weight": "800",
      "--ishan-button-typo-size": "18px",
    });
  });
});

describe("Button ref forwarding", () => {
  it("forwards a ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Go</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("forwards a ref to the underlying anchor element when href is set", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Button ref={ref} href="/pricing">
        Go
      </Button>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});
