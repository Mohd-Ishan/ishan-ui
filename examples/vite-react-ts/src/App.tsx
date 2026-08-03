import { useMemo, useState } from "react";
import { Navbar, Button, Box, Container, Flex, Grid, Stack, defineConfig } from "ishan-ui";
import type { NavItemConfig } from "ishan-ui";

type ThemeVariant = "light" | "dark" | "glass" | "transparent";
type Preset = "slide" | "fade" | "scale" | "blur" | "spring";
type RecipeId = "default" | "minimal" | "rounded" | "dashboard" | "enterprise" | "centered" | "boxy" | "floating";

const THEMES: { id: ThemeVariant; label: string; accent: string }[] = [
  { id: "light", label: "Light", accent: "#6C5CE7" },
  { id: "dark", label: "Dark", accent: "#00D9FF" },
  { id: "glass", label: "Glass", accent: "#6C5CE7" },
  { id: "transparent", label: "Transparent", accent: "#FF6B6B" },
];

const PRESETS: Preset[] = ["slide", "fade", "scale", "blur", "spring"];

/** Mirrors the README "Recipes" section — each just layers layout/radius/typography on top of whatever else is selected. */
const RECIPES: Record<RecipeId, ReturnType<typeof defineConfig.navbar>> = {
  default: {},
  minimal: {
    appearance: { shadow: "none" },
    radius: { navbar: 0, links: 6, cta: 6 },
  },
  rounded: {
    radius: { navbar: 999, links: 999, dropdown: 20, cta: 999, profile: 999, mobileMenu: 28 },
  },
  dashboard: {
    layout: { position: "static", brand: "start", navigation: "start", actions: "end", navigationActionsGap: 32 },
    radius: { navbar: 0, links: 8, cta: 8 },
    typography: { navigation: { fontSize: 13, fontWeight: 500 } },
  },
  enterprise: {
    radius: { navbar: 4, links: 4, dropdown: 6, cta: 4, profile: 4, mobileMenu: 8 },
    typography: {
      navigation: { fontSize: 13, letterSpacing: 0.2, textTransform: "uppercase" },
      logo: { fontWeight: 700, letterSpacing: 0.5 },
    },
  },
  centered: {
    layout: { brand: "start", navigation: "center", actions: "end" },
  },
  boxy: {
    appearance: { borderRadius: 0 },
    radius: { navbar: 0, links: 0, dropdown: 0, cta: 0, profile: 8, mobileMenu: 0 },
  },
  floating: {
    layout: { position: "floating", containerWidth: "900px" },
    appearance: { shadow: "md" },
    radius: { navbar: 999 },
  },
};

const SCROLL_SPY_ITEMS: NavItemConfig[] = [
  { id: "home", label: "Home", path: "#home" },
  { id: "about", label: "About", path: "#about" },
  { id: "services", label: "Services", path: "#services" },
  { id: "pricing", label: "Pricing", path: "#pricing" },
  { id: "contact", label: "Contact", path: "#contact" },
];

const ROUTED_ITEMS: NavItemConfig[] = [
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
  { id: "pricing", label: "Pricing", path: "/pricing" },
  { id: "docs", label: "Docs", path: "https://example.com/docs", external: true },
];

/**
 * Demonstrates every Navbar feature: all 4 themes, per-key color overrides,
 * dropdown navigation, animation presets, scroll spy (landing-page mode),
 * dynamic navigation, profile, CTA, the mobile menu, scroll appearance,
 * the command palette, and the independent layout/radius/typography system
 * via the "Recipe" switcher (mirrors the README's Recipes section).
 */
export default function App() {
  const [theme, setTheme] = useState<ThemeVariant>("glass");
  const [ctaEnabled, setCtaEnabled] = useState(true);
  const [profileEnabled, setProfileEnabled] = useState(true);
  const [preset, setPreset] = useState<Preset>("slide");
  const [scrollSpyMode, setScrollSpyMode] = useState(false);
  const [customColors, setCustomColors] = useState(false);
  const [scrollAppearanceMode, setScrollAppearanceMode] = useState(false);
  const [commandPaletteEnabled, setCommandPaletteEnabled] = useState(true);
  const [recipe, setRecipe] = useState<RecipeId>("default");

  const activeTheme = THEMES.find((t) => t.id === theme)!;
  const navItems = scrollSpyMode ? SCROLL_SPY_ITEMS : ROUTED_ITEMS;
  const recipeConfig = RECIPES[recipe];

  const navbarConfig = useMemo(
    () =>
      defineConfig.navbar({
        appearance: {
          variant: theme,
          accentColor: activeTheme.accent,
          colors: customColors
            ? {
                activeText: "#0a0a0c",
                activeBackground: "#FFD166",
                hoverBackground: "rgba(255, 209, 102, 0.15)",
                ctaBackground: "#FFD166",
                ctaText: "#0a0a0c",
                ctaHoverBackground: "#ffdb85",
              }
            : undefined,
          ...recipeConfig.appearance,
        },
        brand: { name: "Acme", href: "/" },
        navigation: { items: navItems, smoothScrollOffset: 96 },
        cta: { enabled: ctaEnabled, label: "Get Started", href: "/signup", variant: "gradient" },
        profile: {
          enabled: profileEnabled,
          name: "Ishan Mehta",
          email: "ishan@acme.com",
          menuItems: [
            { id: "settings", label: "Settings", path: "/settings" },
            { id: "billing", label: "Billing", path: "/billing", divider: true },
          ],
          onLogout: () => alert("Logged out (demo)"),
        },
        mobile: { breakpoint: 768, dockPosition: "top" },
        animation: { preset, duration: 0.4 },
        scrollSpy: { enabled: scrollSpyMode, offset: 100 },
        scrollAppearance: scrollAppearanceMode
          ? { enabled: true, trigger: 150, from: "transparent", to: theme, animation: "smooth" }
          : { enabled: false },
        commandPalette: {
          enabled: commandPaletteEnabled,
          shortcut: "Ctrl+K",
          placeholder: "Search pages or run a command...",
          commands: [
            {
              id: "cycle-theme",
              label: "Cycle theme",
              keywords: ["dark mode", "light mode", "appearance"],
              action: () => {
                const currentIndex = THEMES.findIndex((t) => t.id === theme);
                setTheme(THEMES[(currentIndex + 1) % THEMES.length].id);
              },
            },
            {
              id: "github",
              label: "Open GitHub",
              action: () => window.open("https://github.com", "_blank", "noreferrer"),
            },
          ],
        },
        // Layout System / Border Radius / Typography — whatever the selected
        // recipe layers on top of everything above.
        layout: {
          position: "sticky",
          heightDesktop: 72,
          heightMobile: 64,
          ...recipeConfig.layout,
        },
        radius: recipeConfig.radius,
        typography: recipeConfig.typography,
      }),
    [
      theme,
      activeTheme.accent,
      customColors,
      navItems,
      ctaEnabled,
      profileEnabled,
      preset,
      scrollSpyMode,
      scrollAppearanceMode,
      commandPaletteEnabled,
      recipeConfig,
    ],
  );

  const fg = theme === "dark" ? "#fff" : "#111";
  const fgMuted = theme === "dark" ? "#c7c7cc" : "#444";

  return (
    <div style={{ minHeight: "100vh", background: theme === "dark" ? "#0a0a0c" : "#f7f7f9" }}>
      <Navbar config={navbarConfig} />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ color: fg }}>ishan-ui — Navbar playground</h1>
        <p style={{ color: fgMuted }}>
          Try a "Recipe" below to see the layout/radius/typography system build entirely different
          navbar styles from one config. Resize below 768px for the mobile menu (dropdown becomes
          a tap accordion). Toggle "Scroll spy" for landing-page mode, "Scroll appearance" to watch
          the navbar transition from transparent as you scroll, or press{" "}
          <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>K</kbd> to open the command palette.
        </p>

        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginTop: 32,
            padding: 20,
            borderRadius: 16,
            background: theme === "dark" ? "#141416" : "#fff",
            border: "1px solid rgba(128,128,128,0.15)",
          }}
        >
          <div>
            <strong style={{ color: fg }}>Recipe</strong>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {(Object.keys(RECIPES) as RecipeId[]).map((id) => (
                <button key={id} onClick={() => setRecipe(id)} disabled={id === recipe}>
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Theme</strong>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => setTheme(t.id)} disabled={t.id === theme}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Animation preset</strong>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setPreset(p)} disabled={p === preset}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Custom colors</strong>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setCustomColors((v) => !v)}>
                {customColors ? "Use theme default" : "Apply custom accent"}
              </button>
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Scroll spy</strong>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setScrollSpyMode((v) => !v)}>
                {scrollSpyMode ? "Switch to routed nav" : "Switch to landing-page nav"}
              </button>
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Scroll appearance</strong>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setScrollAppearanceMode((v) => !v)}>
                {scrollAppearanceMode ? "Disable" : "Transparent \u2192 theme on scroll"}
              </button>
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Command palette</strong>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setCommandPaletteEnabled((v) => !v)}>
                {commandPaletteEnabled ? "Disable" : "Enable (Ctrl/Cmd+K)"}
              </button>
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>CTA</strong>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setCtaEnabled((v) => !v)}>
                {ctaEnabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>

          <div>
            <strong style={{ color: fg }}>Profile</strong>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setProfileEnabled((v) => !v)}>
                {profileEnabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </section>

        {scrollSpyMode ? (
          ["home", "about", "services", "pricing", "contact"].map((id) => (
            <section key={id} id={id} style={{ marginTop: 64, minHeight: 320 }}>
              <h2 style={{ color: fg, textTransform: "capitalize" }}>{id}</h2>
              <p style={{ color: fgMuted }}>
                Scroll through these sections — the matching nav item highlights
                automatically as each one crosses the top of the viewport, with no
                routing involved.
              </p>
            </section>
          ))
        ) : (
          <>
            <p style={{ color: fgMuted, marginTop: 32 }}>
              Hover "Components" in the navbar (or tap it on mobile) to see the dropdown —
              try arrow keys once it's open, and Escape to close it.
            </p>
            {Array.from({ length: 10 }).map((_, i) => (
              <p key={i} style={{ color: theme === "dark" ? "#8e8e93" : "#666" }}>
                Scroll filler paragraph {i + 1}.
              </p>
            ))}
          </>
        )}

        <h2 style={{ color: fg, marginTop: 64 }}>Button</h2>
        <p style={{ color: fgMuted }}>
          Every variant, every size, plus loading/disabled states and the config-driven color
          system.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
          <Button variant="solid">Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="gradient">Gradient</Button>
          <Button variant="link">Link</Button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Button loading>Saving...</Button>
          <Button disabled>Unavailable</Button>
          <Button href="https://example.com" external>
            External link
          </Button>
          <Button
            config={{
              accentColor: "#111111",
              radius: 999,
              colors: { background: "#111111", text: "#ffffff", hoverBackground: "#333333" },
            }}
          >
            Custom themed
          </Button>
        </div>

        <h2 style={{ color: fg, marginTop: 64 }}>Layout Engine</h2>
        <p style={{ color: fgMuted }}>
          Box, Container, Flex, Grid, and Stack — one style system, zero hand-written CSS.
        </p>

        <Container config={{ maxWidthPreset: "full", centered: false, spacing: { paddingX: 0 } }}>
          <Grid config={{ columns: 4, spacing: { gap: 16 } }} style={{ marginTop: 24 }}>
            <Box
              preset="card"
              style={{ gridColumn: "span 2", gridRow: "span 2" }}
              config={{
                background: { color: theme === "dark" ? "#141416" : "#fff" },
                size: { minHeight: 160 },
              }}
            >
              <Flex config={{ direction: "column", justify: "center", align: "center" }} style={{ height: "100%" }}>
                <strong style={{ color: fg }}>Featured (span 2x2)</strong>
              </Flex>
            </Box>
            {["A", "B", "C"].map((label) => (
              <Box
                key={label}
                preset="card"
                config={{ background: { color: theme === "dark" ? "#141416" : "#fff" }, size: { minHeight: 72 } }}
              >
                <span style={{ color: fgMuted }}>{label}</span>
              </Box>
            ))}
          </Grid>
        </Container>

        <Stack
          config={{ direction: "horizontal", spacing: { gap: 16 }, divider: true }}
          style={{ marginTop: 24 }}
        >
          <span style={{ color: fgMuted }}>Stack item 1</span>
          <span style={{ color: fgMuted }}>Stack item 2</span>
          <span style={{ color: fgMuted }}>Stack item 3</span>
        </Stack>
      </main>
    </div>
  );
}
