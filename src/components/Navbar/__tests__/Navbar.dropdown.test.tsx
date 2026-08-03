import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "../index";

const ITEMS_WITH_DROPDOWN = [
  { id: "home", label: "Home", path: "/" },
  {
    id: "components",
    label: "Components",
    path: "/components",
    dropdown: [
      { id: "navbar", label: "Navbar", path: "/navbar" },
      { id: "button", label: "Button", path: "/button" },
      { id: "modal", label: "Modal", path: "/modal" },
    ],
  },
];

function mockViewport(isBelowBreakpoint: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isBelowBreakpoint,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Navbar dropdown navigation — desktop", () => {
  it("renders a dropdown trigger instead of a plain link for items with a dropdown array", () => {
    mockViewport(false);
    render(<Navbar config={{ navigation: { items: ITEMS_WITH_DROPDOWN } }} />);

    expect(screen.getByRole("button", { name: /components/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Navbar" })).not.toBeInTheDocument();
  });

  it("opens the dropdown panel on hover and closes on mouse leave", async () => {
    mockViewport(false);
    const user = userEvent.setup();

    render(
      <Navbar
        config={{ navigation: { items: ITEMS_WITH_DROPDOWN }, animation: { enabled: false } }}
      />,
    );

    const trigger = screen.getByRole("button", { name: /components/i });
    await user.hover(trigger.parentElement!);
    expect(await screen.findByRole("menuitem", { name: "Navbar" })).toBeInTheDocument();

    await user.unhover(trigger.parentElement!);
    expect(screen.queryByRole("menuitem", { name: "Navbar" })).not.toBeInTheDocument();
  });

  it("supports arrow-key navigation between dropdown items", async () => {
    mockViewport(false);
    const user = userEvent.setup();

    render(<Navbar config={{ navigation: { items: ITEMS_WITH_DROPDOWN } }} />);

    const trigger = screen.getByRole("button", { name: /components/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    const first = await screen.findByRole("menuitem", { name: "Navbar" });
    expect(first).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Button" })).toHaveFocus();
  });

  it("closes the dropdown on Escape", async () => {
    mockViewport(false);
    const user = userEvent.setup();

    render(
      <Navbar
        config={{ navigation: { items: ITEMS_WITH_DROPDOWN }, animation: { enabled: false } }}
      />,
    );

    const trigger = screen.getByRole("button", { name: /components/i });
    await user.hover(trigger.parentElement!);
    expect(await screen.findByRole("menuitem", { name: "Navbar" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menuitem", { name: "Navbar" })).not.toBeInTheDocument();
  });
});

describe("Navbar dropdown navigation — mobile accordion", () => {
  it("tap opens the accordion, second tap closes it", async () => {
    mockViewport(true);
    const user = userEvent.setup();

    render(<Navbar config={{ navigation: { items: ITEMS_WITH_DROPDOWN } }} />);

    await user.click(screen.getByLabelText(/open menu/i));
    const trigger = screen.getByRole("button", { name: /components/i });

    await user.click(trigger);
    expect(screen.getByRole("link", { name: "Navbar" })).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole("link", { name: "Navbar" })).not.toBeInTheDocument();
  });

  it("collapses the whole mobile menu (and its accordion) after navigating to a dropdown item", async () => {
    mockViewport(true);
    const user = userEvent.setup();

    render(<Navbar config={{ navigation: { items: ITEMS_WITH_DROPDOWN } }} />);

    await user.click(screen.getByLabelText(/open menu/i));
    await user.click(screen.getByRole("button", { name: /components/i }));
    await user.click(screen.getByRole("link", { name: "Navbar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
