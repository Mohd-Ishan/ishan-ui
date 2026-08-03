# ishan-ui

A production-grade, **config-driven** React component library. No hardcoded
values, no prop-drilling sprawl — every component is fully controlled through
a typed `config` object with sensible, production-ready defaults.

Available today:
- **[Navbar](#quick-start)** — responsive, accessible, animated with Framer
  Motion, and compatible with or without React Router.
- **[Button](#button)** — six variants, three sizes, full color/typography/
  radius control, loading/disabled states, and polymorphic `href` rendering.
  will be built from, so page structure never needs hand-written CSS either.

Most of this README covers Navbar in depth (it has by far the larger surface
area); jump to [Button](#button) or [Layout Engine](#layout-engine) for those.

[![npm version](https://img.shields.io/npm/v/ishan-ui.svg)](https://www.npmjs.com/package/ishan-ui)
[![license](https://img.shields.io/npm/l/ishan-ui.svg)](./LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ishan-ui)](https://bundlephobia.com/package/ishan-ui)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Themes](#themes)
- [Layout System](#layout-system)
- [Navigation](#navigation)
- [CTA](#cta)
- [Profile](#profile)
- [Hide Routes](#hide-routes)
- [Border Radius](#border-radius)
- [Typography](#typography)
- [Animations](#animations)
- [Responsive Modes](#responsive-modes)
- [Scroll Spy](#scroll-spy)
- [Scroll Appearance Transition](#scroll-appearance-transition)
- [Command Palette](#command-palette)
- [React Router](#react-router)
- [Recipes](#recipes)
- [Examples](#examples)
- [Button](#button)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install ishan-ui
# or
pnpm add ishan-ui
# or
yarn add ishan-ui
```

`react` and `react-dom` (^18.2.0 or ^19.0.0) are required peer dependencies.
`react-router` is an **optional** peer dependency — Navbar works correctly
with or without it (see [React Router](#react-router)).

Import the stylesheet once, anywhere near your app's entry point:

```ts
import "ishan-ui/style.css";
```

---

## Quick Start

```tsx
import { Navbar } from "ishan-ui";
import "ishan-ui/style.css";

export default function App() {
  return <Navbar />;
}
```

That's it — this renders a fully functional, accessible, responsive navbar
with the library's defaults (glass theme, sticky position, no nav items, no
CTA, no profile). Everything below is about turning those defaults into
*your* navbar.

---

## Usage

Both import styles work identically:

```tsx
import { Navbar } from "ishan-ui"; // named export (preferred, tree-shakeable)
import Navbar from "ishan-ui"; // default export — same component, just an alias
```

For consumers who want the smallest possible import graph (skipping the root
barrel's type surface entirely), a deep import is also available:

```tsx
import { Navbar } from "ishan-ui/navbar";
```

Pass a full or **partial** config — it's deep-merged over the library
defaults, so you only ever specify what you want to change:

```tsx
<Navbar
  config={{
    appearance: { variant: "dark", accentColor: "#7C3AED" },
    navigation: {
      items: [
        { id: "home", label: "Home", path: "/" },
        { id: "pricing", label: "Pricing", path: "/pricing" },
      ],
    },
  }}
/>
```

For custom CTA content beyond a plain text label, use the compound
sub-component instead of prop-drilling:

```tsx
<Navbar config={config}>
  <Navbar.Cta>
    <StarIcon /> Upgrade to Pro
  </Navbar.Cta>
</Navbar>
```

`config.cta.href` and `config.cta.variant` still control the link target and
styling — `<Navbar.Cta>` only replaces the rendered content.

---

## Configuration

Every visual and behavioral value lives in `NavbarConfig`, grouped by concern.
Anything you omit falls back to the default shown.

```ts
import { defineConfig } from "ishan-ui";

const navbarConfig = defineConfig.navbar({
  layout: {
    position: "sticky", // "sticky" | "floating" | "static"
    containerWidth: "1200px",
    heightDesktop: 72,
    heightMobile: 64,
    alignment: "space-between", // "start" | "center" | "space-between" — used when brand/navigation/actions below are all unset
    // Optional independent section layout — see "Layout System" below
    brand: undefined, // "start" | "center" | "end"
    navigation: undefined,
    actions: undefined,
    sectionGap: undefined, // px
    navigationActionsGap: undefined,
    brandWidth: undefined, // "20%" | "240px" | "auto"
    navigationWidth: undefined,
    actionsWidth: undefined,
  },
  appearance: {
    variant: "glass", // "light" | "dark" | "glass" | "transparent"
    glassOpacity: 0.72,
    blur: 16,
    borderRadius: 16,
    shadow: "sm", // "none" | "sm" | "md" | "lg"
    spacing: 8,
    accentColor: "#6C5CE7",
    fontFamily: "inherit",
    colors: undefined, // optional per-key overrides — see "Themes" below
  },
  brand: {
    logoSrc: "/logo.svg",
    logoAlt: "Acme",
    name: "Acme",
    href: "/",
    logoSize: undefined, // px — see "Logo" under Themes; auto-scales with height when unset
    textSize: undefined,
    fontWeight: undefined,
    gap: undefined,
  },
  navigation: {
    items: [],
    smoothScrollOffset: 96,
    gap: undefined, // px — see "Navigation" > "Spacing"; auto-scales with height when unset
    paddingX: undefined,
    paddingY: undefined,
  },
  profile: {
    enabled: false,
    menuItems: [],
  },
  cta: {
    enabled: false,
    label: "Get Started",
    href: "#",
    variant: "solid", // "solid" | "glass" | "outline" | "gradient"
  },
  behavior: {
    hideOnRoutes: [],
    hideOnScroll: false,
    autoCollapseOnNavigate: true,
  },
  router: {
    // Optional — see "React Router" below. Omit entirely for standalone use.
    onNavigate: undefined,
    currentPath: undefined,
  },
  mobile: {
    breakpoint: 768,
    dockPosition: "top", // "top" | "bottom"
    closeOnOutsideClick: true,
    closeOnEscape: true,
  },
  animation: {
    enabled: true,
    preset: "slide", // "slide" | "fade" | "scale" | "blur" | "spring" — see "Animations" below
    duration: 0.5,
    delay: 0,
    staggerDelay: 0.05, // alias: "stagger"
    easing: "easeOut", // "easeOut" | "easeIn" | "easeInOut" | "linear"
  },
  scrollSpy: {
    // Optional — see "Scroll Spy" below. Off by default.
    enabled: false,
    offset: 100,
  },
  scrollAppearance: {
    // Optional — see "Scroll Appearance Transition" below. Off by default.
    enabled: false,
    trigger: 80,
    from: "transparent",
    to: "glass",
    animation: "smooth",
  },
  commandPalette: {
    // Optional — see "Command Palette" below. Off by default.
    enabled: false,
    shortcut: "Ctrl+K",
    placeholder: "Search...",
    closeOnSelect: true,
    commands: [],
  },
  radius: undefined, // optional per-element overrides — see "Border Radius" below
  typography: undefined, // optional per-section overrides — see "Typography" below
  accessibility: {
    ariaLabel: "Main navigation",
    reduceMotion: "auto", // "auto" | "always" | "never"
  },
});
```

`defineConfig.navbar` is purely a type-checking/autocomplete helper — it
returns your object unchanged. The actual merge against defaults happens
inside `<Navbar config={...} />` at render time via a component-agnostic
`createConfig` factory shared by every current and future component in the
library.

---

## Themes

Four built-in `appearance.variant` values:

| Variant | Behavior |
|---|---|
| `light` | Solid light background |
| `dark` | Solid dark background |
| `glass` | Translucent background + backdrop blur (`glassOpacity`, `blur`) |
| `transparent` | No background; blurs only what scrolls beneath it |

```tsx
<Navbar config={{ appearance: { variant: "dark", accentColor: "#00D9FF" } }} />
```

`accentColor` drives the active-link indicator, CTA (`solid`/`gradient`
variants), focus rings, and the profile avatar fallback — set it once and it
propagates everywhere.

### Custom colors

Every visible color can be overridden individually via
`appearance.colors` — all keys are optional, and any key you don't set
falls back automatically (derived from `accentColor` and the current
`variant`), so you never have to override every color just to change one:

```tsx
<Navbar
  config={{
    appearance: {
      variant: "dark",
      colors: {
        text: "#e5e5ea",
        hoverText: "#ffffff",
        activeText: "#0a0a0c",
        activeBackground: "#FFD166",
        hoverBackground: "rgba(255, 209, 102, 0.12)",
        border: "rgba(255, 255, 255, 0.08)",
        logo: "#ffffff",
        icons: "#ffffff",
        profileIcon: "#0a0a0c",
        profileBackground: "#FFD166",
        profileBorder: "transparent",
        ctaText: "#0a0a0c",
        ctaBackground: "#FFD166",
        ctaBorder: "transparent",
        ctaHoverText: "#0a0a0c",
        ctaHoverBackground: "#ffdb85",
        ctaHoverBorder: "transparent",
      },
    },
  }}
/>
```

Internally, each key you set becomes a scoped CSS custom property; keys you
don't set emit no override at all, so the existing per-variant defaults
render exactly as before — this is why adding `colors` to your config is
always backward compatible with a Navbar you already have working.

### Logo

```ts
brand: {
  logoSrc: "/logo.svg",
  logoAlt: "Acme",
  name: "Acme",
  href: "/",

  logoSize: 28,     // px, image height/width
  textSize: 15,      // px, brand name font-size
  fontWeight: 600,
  gap: 10,            // px, between the logo image and the name text
}
```

`logoSize`/`textSize`/`gap` all scale automatically with `layout.heightDesktop`
when left unset (see [Border Radius](#border-radius) below for the full
height-scaling note) — set them explicitly to pin an exact size regardless of
navbar height.

---

## Layout System

By default, Navbar uses a single `layout.alignment` value
(`"start" | "center" | "space-between"`) to position brand/navigation/actions
as one flex row — this still works exactly as before.

For independent control over each section, set any of `layout.brand`,
`layout.navigation`, or `layout.actions`. Setting **any one** of these
switches Navbar into a 3-column layout where navigation and actions are
always kept visually separated — they can never collapse into one group,
unlike plain flexbox justification:

```ts
layout: {
  brand: "start",       // "start" | "center" | "end"
  navigation: "center",
  actions: "end",

  sectionGap: 48,             // px, between brand and navigation
  navigationActionsGap: 56,   // px, between navigation and actions

  brandWidth: "20%",           // "20%" | "240px" | "auto"
  navigationWidth: "60%",
  actionsWidth: "20%",
}
```

Width values accept percentages, pixels, or `"auto"` (the default — each
section sizes to its content, with navigation growing to fill remaining
space). This works correctly at every breakpoint; the mobile layout collapses
to the hamburger toggle regardless of which alignment mode you're using.

---

## Navigation

Navigation is entirely data-driven. Add, remove, or reorder items by editing
the `navigation.items` array — nothing else needs to change:

```ts
navigation: {
  items: [
    { id: "home", label: "Home", path: "/" },
    { id: "about", label: "About", path: "#about" },      // "#" → smooth scroll
    { id: "contact", label: "Contact", path: "/contact" },
    { id: "docs", label: "Docs", path: "https://docs.acme.com", external: true },
  ];
}
```

There's no hard limit on item count. Paths starting with `#` smooth-scroll to
the matching element id (offset by `navigation.smoothScrollOffset`, useful for
clearing a sticky navbar); external URLs (or items marked `external: true`)
open in a new tab with `rel="noreferrer"`; everything else is treated as an
internal route and highlighted as active when it matches the current path,
including dynamic segments (`/blog/:slug`) and wildcards (`/dashboard/*`).

### Dropdown navigation

Give any item a `dropdown` array to turn it into a dropdown trigger instead
of a plain link:

```ts
navigation: {
  items: [
    { id: "home", label: "Home", path: "/" },
    {
      id: "components",
      label: "Components",
      path: "/components",
      dropdown: [
        { id: "navbar", label: "Navbar", path: "/components/navbar" },
        { id: "button", label: "Button", path: "/components/button" },
        { id: "modal", label: "Modal", path: "/components/modal" },
      ],
    },
  ];
}
```

- **Desktop**: hover opens the panel, moving off it closes it; the trigger
  highlights as active whenever any of its children match the current route.
- **Mobile**: tap opens an inline accordion, a second tap closes it, and it
  collapses automatically when the whole mobile menu closes after navigating.
- **Keyboard**: `ArrowDown`/`Enter`/`Space` on the trigger opens the panel and
  focuses the first item; `ArrowDown`/`ArrowUp` move between items; `Escape`
  or clicking outside closes it.
- The panel inherits the navbar's current `appearance.variant` (glass/dark/
  light/transparent) and any `appearance.colors` overrides automatically —
  there's no separate theme to configure.
- Animates via whatever `animation.preset` is configured (see below).

### Spacing

```ts
navigation: {
  gap: 4,        // px between nav items
  paddingX: 14,   // px horizontal padding inside each link
  paddingY: 8,    // px vertical padding inside each link
}
```

These three defaults also scale automatically with `layout.heightDesktop`
(see the height-scaling note under [Border Radius](#border-radius) below) —
set them explicitly here to opt out of that scaling for navigation
specifically.

---

## CTA

```ts
cta: {
  enabled: true,
  label: "Book a demo",
  href: "/demo",
  variant: "gradient", // "solid" | "glass" | "outline" | "gradient"
  onClick: () => trackEvent("cta_click"),
}
```

`onClick` fires alongside (not instead of) navigation — use it for analytics,
not to replace `href`.

---

## Profile

An optional account menu with avatar, name/email header, unlimited menu
items, and a dedicated logout callback:

```ts
profile: {
  enabled: true,
  name: "Ishan Mehta",
  email: "ishan@acme.com",
  avatarUrl: "/avatar.jpg", // omit to fall back to initials
  menuItems: [
    { id: "settings", label: "Settings", path: "/settings" },
    { id: "billing", label: "Billing", path: "/billing", divider: true },
  ],
  onLogout: () => signOut(),
}
```

The menu is keyboard-navigable (Tab-trapped while open, closes on Escape or
an outside click) and exposes `role="menu"` / `role="menuitem"` for screen
readers.

---

## Hide Routes

Navbar can disappear entirely on specific routes — login/auth flows being the
common case:

```ts
behavior: {
  hideOnRoutes: ["/login", "/register", "/reset-password/:token"];
}
```

Patterns support `:param` segments and `*` wildcards, matched against the
current pathname. When a match is found, `<Navbar />` renders `null` — no
empty wrapper left in the DOM.

---

## Border Radius

Every rounded shape in Navbar — the outer pill, nav links, dropdown panels,
the CTA, the profile avatar, the mobile menu sheet — can be set
independently:

```ts
radius: {
  navbar: 28,       // the outer container/pill
  links: 10,          // nav links, mobile menu links, dropdown/accordion rows
  dropdown: 14,        // dropdown panels, the profile menu, the command palette
  cta: 14,
  profile: 999,          // the avatar and its trigger button (999 = fully round)
  mobileMenu: 18,          // the mobile menu sheet's outer corners
}
```

All optional, and independently overridable — leave any key out to keep its
existing default shape. This is what lets you build anything from fully
rounded pills (the default) to boxy, minimal, or dashboard-style rectangular
navbars without writing any CSS — see [Recipes](#recipes) below.

**A note on automatic height scaling:** several defaults (logo size, avatar
size, CTA padding, the mobile toggle button, nav link padding) scale
proportionally with `layout.heightDesktop`/`heightMobile` rather than staying
pinned to a fixed pixel value. At the library's original default height
(72px), every one of these evaluates to exactly its original value — so this
is purely additive: existing configs render pixel-identical, and a taller or
shorter navbar now looks proportioned instead of having oversized/undersized
elements crammed into it. Any explicit override (`brand.logoSize`,
`navigation.paddingY`, etc.) always wins over the automatic scale.

---

## Typography

Independent font control for five sections — logo, navigation, CTA, dropdown,
and profile — without touching CSS:

```ts
typography: {
  logo: {
    fontFamily: "Georgia, serif",
    fontWeight: 700,
  },
  navigation: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cta: {
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  dropdown: {
    fontSize: 13,
  },
  profile: {
    fontSize: 13,
  },
}
```

Every field on every section is optional; anything unset keeps its existing
default. `textTransform` accepts `"none" | "uppercase" | "lowercase" |
"capitalize"`. Mobile menu links follow the same `navigation` typography as
their desktop counterparts, for consistency across breakpoints.

---

## Animations

Framer Motion powers every transition — a restrained, "premium" ease-out
curve throughout (not spring-happy or bouncy).

### Presets

One config knob changes the "feel" of every animated surface consistently
— the root reveal, dropdown panels, the mobile menu, and the profile menu
all read from the same preset:

```ts
animation: {
  enabled: true,
  preset: "spring",       // "slide" | "fade" | "scale" | "blur" | "spring"
  duration: 0.4,           // seconds — ignored by "spring" (uses spring physics instead)
  delay: 0,                 // seconds, before the animation starts
  stagger: 0.08,            // seconds between each mobile menu item's reveal
  easing: "easeOut",        // "easeOut" | "easeIn" | "easeInOut" | "linear"
}
```

`preset` defaults to `"slide"` — the library's original built-in animation —
so a config that never sets it renders identically to before this option
existed. `stagger` is an alias for the pre-existing `staggerDelay` field;
both work, `stagger` wins if both are set.

Every animated surface built on this engine:

- Initial page-load reveal
- Active-link indicator glides between items via `layoutId` (shared layout
  animation, not a manual position calculation)
- Dropdown panel open/close (desktop) and accordion expand/collapse (mobile)
- Profile dropdown open/close
- Mobile menu backdrop fade + staggered item reveal
- Hamburger ↔ close icon morph
- CTA keeps its own hover/tap micro-interaction regardless of `preset`, since
  that's a continuous interaction rather than an enter/exit transition
- Optional hide-on-scroll-down / reveal-on-scroll-up

All of it is gated by `animation.enabled` and `accessibility.reduceMotion`.
With `reduceMotion: "auto"` (the default), the OS-level
`prefers-reduced-motion` setting is respected automatically — animated
components fall back to instant state changes, not just shorter durations.

---

## Responsive Modes

Navbar switches to a mobile layout below `mobile.breakpoint` (default
`768px`), independent of any CSS media query — this is what allows the
breakpoint to be a runtime config value rather than a build-time constant.

```ts
mobile: {
  breakpoint: 900,
  dockPosition: "bottom", // "top" (drawer from the top) | "bottom" (dock from the bottom)
  closeOnOutsideClick: true,
  closeOnEscape: true,
}
```

The mobile menu locks background scroll while open, traps focus, and closes
automatically after navigation when `behavior.autoCollapseOnNavigate` is true
(the default). Dropdown items become a tap-to-expand accordion in this mode.

---

## Scroll Spy

For landing pages (single scrollable page, sections instead of routes),
Navbar can highlight the current nav item automatically as the page scrolls,
with no router involved:

```ts
navigation: {
  items: [
    { id: "home", label: "Home", path: "#home" },
    { id: "about", label: "About", path: "#about" },
    { id: "services", label: "Services", path: "#services" },
    { id: "pricing", label: "Pricing", path: "#pricing" },
    { id: "contact", label: "Contact", path: "#contact" },
  ];
},
scrollSpy: {
  enabled: true,
  offset: 100, // px — tune to clear a sticky navbar so a section counts as "current" right as it reaches the top
}
```

Scroll spy uses `IntersectionObserver` (not a scroll listener), and only
ever affects nav items whose `path` starts with `"#"` — it never touches
routed items, so you can mix a scroll-spied landing-page section with
router-based items (e.g. a "Blog" link to `/blog`) in the same Navbar
without the two mechanisms conflicting. Disabled by default.

---

## Scroll Appearance Transition

Automatically switch the navbar's appearance as the user scrolls — the
classic "transparent over a hero image, glass once you scroll past it"
pattern:

```ts
scrollAppearance: {
  enabled: true,
  trigger: 80,           // px scrolled before switching
  from: "transparent",
  to: "glass",
  animation: "smooth",    // "smooth" (default) | "instant"
  duration: 0.4,           // optional — defaults to animation.duration
  easing: "easeOut",       // optional — defaults to animation.easing
}
```

This reuses the existing appearance/color system entirely — `from`/`to` are
just `appearance.variant` values, so any `appearance.colors` overrides you've
set still apply to both states automatically. The transition animates via
the same CSS transition already driving background/border/shadow changes on
scroll elevation, just with its own configurable duration/easing so it can
move independently of other animations. Scrolling back above `trigger`
restores `from`. Coexists cleanly with `hideOnScroll`, Scroll Spy, and every
`layout.position` mode (`sticky`/`floating`/`static`) — they answer
different questions (position, direction, and appearance are three separate
concerns) and don't share state. Off by default.

---

## Command Palette

An optional Cmd/Ctrl+K search modal, in the spirit of VS Code, Linear,
Vercel, and Raycast — searches your navigation items (including dropdown
children) plus any custom commands you provide:

```ts
commandPalette: {
  enabled: true,
  shortcut: "Ctrl+K",       // Cmd is used automatically on macOS regardless of what's written here
  placeholder: "Search...",
  closeOnSelect: true,
  commands: [
    { id: "docs", label: "Documentation", path: "/docs" },
    { id: "gh", label: "GitHub", action: () => window.open("https://github.com/your/repo") },
  ],
}
```

Enabling it adds a small search trigger button to the navbar (visible at
every screen size) in addition to the global keyboard shortcut — either
opens the same palette. Typing filters in real time (case-insensitive,
matching against a command's label and optional `keywords`), with the
matched substring highlighted. `ArrowUp`/`ArrowDown` move the selection,
`Enter` activates it, `Escape` or an outside click closes it. Selecting a
navigation item goes through the exact same `onNavigate` path as clicking it
directly in the navbar — including your `router.onNavigate` adapter if
you've wired one up (see [React Router](#react-router)) — so palette
navigation and Navbar-link navigation are never two different code paths.
Off by default.

---

## React Router

Navbar does **not** take a hard dependency on `react-router` — it's listed as
an optional peer dependency. Out of the box (no setup required), active-route
detection and navigation read/write the browser's own History API directly,
which is enough for apps that don't use a client-side router at all, or that
only need the URL bar and active-link highlighting to stay correct.

**If your app renders pages through React Router's `<Routes>`/`<Route>`**,
wire Navbar to your router's own `navigate()` and current location instead —
otherwise Navbar's internal `history.pushState` call updates the URL but
doesn't notify React Router's own internal state, so `<Routes>` won't
re-render:

```tsx
import { useLocation, useNavigate } from "react-router";
import { Navbar } from "ishan-ui";

function AppNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Navbar
      config={{
        navigation: { items: [...] },
        router: {
          onNavigate: navigate,
          currentPath: pathname,
        },
      }}
    />
  );
}
```

With `router.onNavigate` provided, Navbar calls it instead of its own
internal navigation for every link, the CTA, and profile menu items — so
React Router's own state (and therefore what it renders) updates correctly.
`router.currentPath` similarly takes over active-link highlighting and
`hideOnRoutes` matching from Navbar's internal tracking.

Without `config.router` set, Navbar still works standalone:

- Works with **zero router installed** — Navbar's own links call
  `history.pushState` directly, and `hideOnRoutes`/active-link highlighting
  read `window.location` directly.
- Works **alongside `<BrowserRouter>`** for URL/highlighting purposes even
  without the adapter, since React Router's own navigation also goes through
  the real `history.pushState` — but page content only switches correctly
  once `config.router` is wired in as shown above.
- Supports nested and dynamic routes (`/blog/:slug`, `/dashboard/*`) via the
  same pattern matcher used for `hideOnRoutes`, in both modes.

---

## Recipes

Complete configs for common navbar styles — copy one as a starting point.

### Minimal

```ts
{
  appearance: { variant: "transparent", shadow: "none" },
  radius: { navbar: 0, links: 6, cta: 6 },
  cta: { enabled: false },
  profile: { enabled: false },
}
```

### Rounded

```ts
{
  appearance: { variant: "glass" },
  radius: { navbar: 999, links: 999, dropdown: 20, cta: 999, profile: 999, mobileMenu: 28 },
}
```

### Dashboard

```ts
{
  layout: { position: "static", brand: "start", navigation: "start", actions: "end", navigationActionsGap: 32 },
  appearance: { variant: "light", shadow: "sm" },
  radius: { navbar: 0, links: 8, cta: 8 },
  typography: { navigation: { fontSize: 13, fontWeight: 500 } },
}
```

### Enterprise

```ts
{
  appearance: { variant: "light", shadow: "sm", accentColor: "#1B4B91" },
  radius: { navbar: 4, links: 4, dropdown: 6, cta: 4, profile: 4, mobileMenu: 8 },
  typography: {
    navigation: { fontSize: 13, letterSpacing: 0.2, textTransform: "uppercase" },
    logo: { fontWeight: 700, letterSpacing: 0.5 },
  },
}
```

### Centered Navigation

```ts
{
  layout: { brand: "start", navigation: "center", actions: "end" },
}
```

### Boxy

```ts
{
  appearance: { variant: "light", borderRadius: 0 },
  radius: { navbar: 0, links: 0, dropdown: 0, cta: 0, profile: 8, mobileMenu: 0 },
}
```

### Floating

```ts
{
  layout: { position: "floating", containerWidth: "900px" },
  appearance: { variant: "glass", shadow: "md" },
  radius: { navbar: 999 },
}
```

---

## Examples

A full working example (Vite + React + TypeScript) covering all four themes,
dynamic navigation, profile menu, CTA, and the mobile menu lives in
[`examples/vite-react-ts`](./examples/vite-react-ts):

```bash
cd examples/vite-react-ts
npm install
npm run dev
```

---

## Button

```tsx
import { Button } from "ishan-ui";

<Button variant="solid" size="md" onClick={() => console.log("clicked")}>
  Get Started
</Button>;
```

Zero required props — a bare `<Button>Label</Button>` renders with
production-usable defaults (solid variant, medium size).

### API shape: props vs. `config`

Button splits its API differently than Navbar, deliberately. Navbar is
rendered once per app, so putting everything in one `config` object makes
sense. Button is rendered many times per screen, and things like `variant`,
`size`, `disabled`, and `loading` change constantly with app state — forcing
those into a config object you'd have to reconstruct on every render would
hurt more than it'd help. So:

- **Direct props** (frequently dynamic, per-instance): `variant`, `size`,
  `fullWidth`, `disabled`, `loading`, `leftIcon`, `rightIcon`, `href`,
  `external`, `type`, `onClick`, `children`.
- **`config` prop** (the visual *system*, usually set once): `colors`,
  `radius`, `typography`, `animation`, `accentColor`.

If a value is set in both places, **the direct prop always wins** — `config`
is for defaults, props are for the specific instance.

### Variants

```tsx
<Button variant="solid">Solid</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="glass">Glass</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="link">Link</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Icons, loading, disabled, full width

```tsx
<Button leftIcon={<PlusIcon />}>Add item</Button>
<Button rightIcon={<ArrowIcon />}>Continue</Button>
<Button loading>Saving...</Button>       {/* spinner replaces leftIcon, implicitly disabled */}
<Button disabled>Unavailable</Button>
<Button fullWidth>Full width</Button>
```

### Polymorphic rendering (`href`)

```tsx
<Button href="/pricing">Pricing</Button>            {/* renders <a href="/pricing"> */}
<Button href="https://example.com" external>Docs</Button>  {/* target="_blank" rel="noreferrer" */}
```

If `disabled` is also true, Button renders a real disabled `<button>`
instead of an anchor — disabled links aren't natively focusable/announced
consistently across browsers, so this avoids that inconsistency entirely.

### Colors

Every color is independently overridable, same pattern as Navbar — every
key optional, unset keys fall back automatically per variant:

```tsx
<Button
  config={{
    accentColor: "#111111",
    colors: {
      text: "#ffffff",
      background: "#111111",
      border: "transparent",
      hoverText: "#ffffff",
      hoverBackground: "#333333",
      hoverBorder: "transparent",
      activeText: "#ffffff",
      activeBackground: "#000000",
      activeBorder: "transparent",
    },
  }}
>
  Custom
</Button>
```

### Typography

```tsx
<Button
  config={{
    typography: {
      fontFamily: "Georgia, serif",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
  }}
>
  Styled
</Button>
```

### Radius and animation

```tsx
<Button config={{ radius: 999 }}>Pill</Button>
<Button config={{ radius: 0 }}>Square</Button>

<Button
  config={{
    animation: {
      enabled: true,
      duration: 0.2,       // seconds, hover/tap micro-interaction speed
      reduceMotion: "auto", // "auto" | "always" | "never"
    },
  }}
>
  Animated
</Button>
```

### Ref forwarding

```tsx
const ref = useRef<HTMLButtonElement>(null);
<Button ref={ref}>Focus me</Button>;
```

`ref` resolves to `HTMLAnchorElement` instead when `href` is set.

### Deep import

```tsx
import { Button } from "ishan-ui/button";
```

Same tree-shaking benefit as `ishan-ui/navbar` — pulls in only Button's own
code, not the rest of the library. If your bundle uses both `Navbar` and
`Button`, their shared dependencies (Framer Motion, the config engine) are
automatically deduplicated into one chunk rather than bundled twice — this
happens for free via standard Rollup code-splitting, no configuration needed
on your end.

---

## FAQ

**Does this work with React 18?**
Yes — the peer dependency range is `^18.2.0 || ^19.0.0`.

**Can I use Tailwind alongside this?**
Yes. Navbar's styles are scoped CSS Modules and won't leak into or collide
with your utility classes.

**Does importing `Navbar` pull in the rest of the library?**
No. `ishan-ui/navbar` is built as its own entry point, and the root
`ishan-ui` barrel is tree-shakeable — unused exports are eliminated by any
modern bundler (Vite, webpack 5+, esbuild, Rollup).

**How do I add a second CTA or a search box?**
Compose it: render your own elements alongside `<Navbar />`, or use the
`<Navbar.Cta>` slot for custom content within the existing CTA position.
Multiple independent slots are planned as the library adds more components.

**Is SSR supported?**
Navbar's browser-only reads (`window.matchMedia`, `window.scrollY`, history)
are all guarded and default to sensible values during server rendering; it
hydrates into its interactive state on mount.

**Why is `react-router` marked optional if there's no explicit integration
code for it?**
Because Navbar reads/writes the same History API React Router itself uses in
browser history mode — see [React Router](#react-router) above.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow, coding
standards, and how to open a changeset for your PR.

---

## License

[MIT](./LICENSE)
