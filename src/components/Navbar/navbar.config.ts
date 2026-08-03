import { createConfig } from "../../core/config/createConfig";
import type { BaseComponentConfig } from "../../core/config/config.types";
import type { TypographyTokens } from "../../core/typography/tokens";

export type { TypographyTokens };

/**
 * components/Navbar/navbar.config.ts
 *
 * The single source of truth for every value Navbar renders with. Nothing in
 * Navbar.tsx or its parts/ subcomponents may contain a hardcoded visual or
 * behavioral value — everything is read from a resolved NavbarConfig.
 */

export interface DropdownItemConfig {
  id: string;
  label: string;
  path: string;
  external?: boolean;
}

export interface NavItemConfig {
  /** Stable identifier, used as the React key and for programmatic lookups. */
  id: string;
  label: string;
  /** Internal route ("/about"), hash anchor ("#pricing"), or external URL. */
  path: string;
  /** Force external-link semantics (target="_blank", rel="noreferrer") regardless of path shape. */
  external?: boolean;
  /**
   * Optional nested items — when present, this item renders as a dropdown
   * trigger instead of a plain link (hover-opened on desktop, tap-toggled
   * on mobile) and `path` is not navigated to directly.
   */
  dropdown?: DropdownItemConfig[];
}

export interface ProfileMenuItemConfig {
  id: string;
  label: string;
  path?: string;
  onSelect?: () => void;
  /** Renders a visual divider above this item instead of a normal row. */
  divider?: boolean;
}

export interface CommandPaletteItemConfig {
  id: string;
  label: string;
  /** Navigates here when selected. Mutually exclusive with `action` in practice — provide one. */
  path?: string;
  /** Runs when selected, instead of navigating. */
  action?: () => void;
  external?: boolean;
  /** Extra search terms this command should also match against, beyond its label. */
  keywords?: string[];
}

/**
 * Every visible color a consumer can override without touching component
 * source. All optional — anything left unset falls back automatically
 * (see navbar.colors.ts + Navbar.module.css var() chains), so existing
 * configs that only set `accentColor`/`variant` keep rendering identically.
 */
export interface NavbarColorTokens {
  text: string;
  hoverText: string;
  activeText: string;
  activeBackground: string;
  hoverBackground: string;
  border: string;
  logo: string;
  icons: string;
  profileIcon: string;
  profileBackground: string;
  profileBorder: string;
  ctaText: string;
  ctaBackground: string;
  ctaBorder: string;
  ctaHoverText: string;
  ctaHoverBackground: string;
  ctaHoverBorder: string;
}

/**
 * Per-element border radius (px). All optional — anything unset falls back
 * to `appearance.borderRadius`-derived defaults, exactly matching pre-1.3
 * rendering (fully rounded pills for links/profile, existing panel/CTA
 * radii), so no existing config's shape changes.
 */
export interface NavbarRadiusTokens {
  navbar: number;
  links: number;
  dropdown: number;
  cta: number;
  profile: number;
  mobileMenu: number;
}

export interface NavbarConfig extends BaseComponentConfig {
  layout: {
    /** "sticky" pins to the top and stays in flow; "floating" detaches with margin; "static" scrolls with the page. */
    position: "sticky" | "floating" | "static";
    containerWidth: string;
    heightDesktop: number;
    heightMobile: number;
    /**
     * @deprecated Use `brand`/`navigation`/`actions` for independent section
     * alignment instead. Still fully supported and still the default layout
     * mode when none of those three are set — kept for backward
     * compatibility, not scheduled for removal.
     */
    alignment: "start" | "center" | "space-between";
    /**
     * Independent alignment for each of the navbar's three sections. Setting
     * ANY one of these switches the navbar into a 3-column layout (brand /
     * navigation / actions), where navigation and actions always stay
     * visually separated — they can never collapse into one group, unlike
     * plain flexbox alignment. Leaving all three unset keeps the original
     * `alignment`-based flex layout exactly as before.
     */
    brand?: "start" | "center" | "end";
    navigation?: "start" | "center" | "end";
    actions?: "start" | "center" | "end";
    /** px gap between the brand and navigation sections. Only applies in 3-column mode. */
    sectionGap?: number;
    /** px gap between the navigation and actions sections. Only applies in 3-column mode. */
    navigationActionsGap?: number;
    /** "20%" | "240px" | "auto" — width allocated to the brand section. Only applies in 3-column mode. */
    brandWidth?: string;
    /** Width allocated to the navigation section. Only applies in 3-column mode. */
    navigationWidth?: string;
    /** Width allocated to the actions section. Only applies in 3-column mode. */
    actionsWidth?: string;
  };

  appearance: {
    variant: "light" | "dark" | "glass" | "transparent";
    /** 0–1. Only applies when variant is "glass". */
    glassOpacity: number;
    /** Backdrop blur radius in px. Only applies when variant is "glass" or "transparent". */
    blur: number;
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg";
    spacing: number;
    accentColor: string;
    fontFamily: string;
    /** Per-key color overrides (Feature 1). Every key is optional and falls back automatically. */
    colors?: Partial<NavbarColorTokens>;
  };

  brand: {
    logoSrc?: string;
    logoAlt: string;
    name?: string;
    href: string;
    /** px, image height/width. Defaults to a value scaled from `layout.heightDesktop` (Feature 8) unless set. */
    logoSize?: number;
    /** px font-size for the brand name text. */
    textSize?: number;
    fontWeight?: number;
    /** px gap between the logo image and the brand name text. */
    gap?: number;
  };

  navigation: {
    items: NavItemConfig[];
    /** px offset subtracted from scroll position when smooth-scrolling to a "#hash" target (e.g. to clear a sticky navbar). */
    smoothScrollOffset: number;
    /** px gap between nav items. Defaults to 4. */
    gap?: number;
    /** px horizontal padding inside each nav link. Defaults to 14. */
    paddingX?: number;
    /** px vertical padding inside each nav link. Defaults to 8. */
    paddingY?: number;
  };

  profile: {
    enabled: boolean;
    name?: string;
    email?: string;
    avatarUrl?: string;
    menuItems: ProfileMenuItemConfig[];
    onLogout?: () => void;
  };

  cta: {
    enabled: boolean;
    label: string;
    href: string;
    variant: "solid" | "glass" | "outline" | "gradient";
    onClick?: () => void;
  };

  behavior: {
    /** Route patterns (supports trailing "/:param" segments) on which Navbar renders nothing. */
    hideOnRoutes: string[];
    /** Hide on scroll-down, reveal on scroll-up. */
    hideOnScroll: boolean;
    /** Auto-close an open mobile menu after a navigation occurs. */
    autoCollapseOnNavigate: boolean;
  };

  /**
   * Optional integration point for a router that manages its own internal
   * location state (React Router, TanStack Router, etc.). Without this,
   * Navbar navigates via `history.pushState` directly, which updates the URL
   * but does NOT notify a router's own internal state — so pages rendered by
   * that router's <Routes> won't switch. Wire `onNavigate` to that router's
   * own navigate function (e.g. React Router's `useNavigate()`) to fix that.
   * `currentPath`, if provided, is used for active-link highlighting and
   * hideOnRoutes instead of Navbar's own internal pathname tracking.
   */
  router?: {
    onNavigate?: (path: string) => void;
    currentPath?: string;
  };

  mobile: {
    /** Max viewport width (px, exclusive) at which the mobile layout activates. */
    breakpoint: number;
    /** Where the mobile navigation surface renders. */
    dockPosition: "top" | "bottom";
    closeOnOutsideClick: boolean;
    closeOnEscape: boolean;
  };

  animation: {
    enabled: boolean;
    /** Seconds. */
    duration: number;
    /** Seconds between each mobile menu item's stagger reveal. */
    staggerDelay: number;
    /**
     * Which motion "feel" every animated surface (root reveal, dropdown,
     * mobile menu, profile menu, active indicator) uses. Defaults to
     * "slide", matching the library's original built-in behavior exactly —
     * existing configs that never set `preset` render identically to before.
     */
    preset?: "slide" | "fade" | "scale" | "blur" | "spring";
    /** Seconds, applied before an animation starts. */
    delay?: number;
    easing?: "easeOut" | "easeIn" | "easeInOut" | "linear";
    /**
     * Alias for `staggerDelay` matching the field name from the animation
     * preset spec. If both are set, `stagger` wins. Prefer `staggerDelay`
     * for new code — this exists purely so config written against either
     * name works.
     */
    stagger?: number;
  };

  /**
   * Landing-page style navigation: when enabled, the nav item whose "#hash"
   * target is currently scrolled into view is highlighted automatically,
   * independent of routing. Never interferes with router-based active
   * highlighting — it only ever affects items whose `path` starts with "#".
   * Off by default; existing configs are unaffected.
   */
  scrollSpy?: {
    enabled?: boolean;
    /** px offset from the top of the viewport used when deciding a section is "current" — tune to clear a sticky navbar. */
    offset?: number;
  };

  accessibility: {
    ariaLabel: string;
    /** "auto" respects the OS prefers-reduced-motion setting; "always"/"never" force the behavior. */
    reduceMotion: "auto" | "always" | "never";
  };

  /**
   * Automatically switches the navbar's appearance variant based on scroll
   * position — e.g. transparent over a hero image, then glass once the user
   * scrolls past it. Reuses the existing appearance/color system entirely:
   * this only ever picks which `variant` is active, never introduces a
   * second theming mechanism. Off by default; existing configs unaffected.
   */
  scrollAppearance?: {
    enabled?: boolean;
    /** px scrolled before switching from `from` to `to`. */
    trigger?: number;
    from?: "transparent" | "glass" | "light" | "dark";
    to?: "transparent" | "glass" | "light" | "dark";
    /** "smooth" animates the transition (default); "instant" switches with no transition. */
    animation?: "smooth" | "instant";
    /** Seconds. Defaults to `animation.duration` if unset. */
    duration?: number;
    /** Defaults to `animation.easing` if unset. */
    easing?: "easeOut" | "easeIn" | "easeInOut" | "linear";
  };

  /**
   * Optional Cmd/Ctrl+K command palette that searches navigation items,
   * dropdown items, and any custom `commands` you provide. Off by default;
   * existing configs are unaffected. Reuses the same navigate/router
   * plumbing as every other clickable Navbar surface — selecting a nav item
   * from the palette goes through the exact same `onNavigate` path as
   * clicking it directly.
   */
  commandPalette?: {
    enabled?: boolean;
    /** e.g. "Ctrl+K" — the letter is what's matched; Cmd is used automatically on macOS regardless of what's written here. */
    shortcut?: string;
    placeholder?: string;
    /** Close the palette after a selection is made. Defaults to true. */
    closeOnSelect?: boolean;
    /** Extra searchable entries beyond navigation/dropdown items — for actions like "GitHub" or "Toggle theme". */
    commands?: CommandPaletteItemConfig[];
  };

  /**
   * Per-element border radius overrides. All optional — build anything from
   * fully rounded pills (the default) to boxy/minimal/enterprise styles
   * without touching CSS. See README "Recipes" for examples.
   */
  radius?: Partial<NavbarRadiusTokens>;

  /**
   * Per-section typography overrides — logo, navigation, CTA, dropdown, and
   * profile text can each have their own font family/size/weight/spacing/
   * transform. All optional; unset fields keep the existing default look.
   */
  typography?: {
    logo?: Partial<TypographyTokens>;
    navigation?: Partial<TypographyTokens>;
    cta?: Partial<TypographyTokens>;
    dropdown?: Partial<TypographyTokens>;
    profile?: Partial<TypographyTokens>;
  };
}

export const defaultNavbarConfig: NavbarConfig = {
  layout: {
    position: "sticky",
    containerWidth: "1200px",
    heightDesktop: 72,
    heightMobile: 64,
    alignment: "space-between",
  },

  appearance: {
    variant: "glass",
    glassOpacity: 0.72,
    blur: 16,
    borderRadius: 16,
    shadow: "sm",
    spacing: 8,
    accentColor: "#6C5CE7",
    fontFamily: "inherit",
  },

  brand: {
    logoAlt: "Brand logo",
    href: "/",
  },

  navigation: {
    items: [],
    smoothScrollOffset: 96,
  },

  profile: {
    enabled: false,
    menuItems: [],
  },

  cta: {
    enabled: false,
    label: "Get Started",
    href: "#",
    variant: "solid",
  },

  behavior: {
    hideOnRoutes: [],
    hideOnScroll: false,
    autoCollapseOnNavigate: true,
  },

  mobile: {
    breakpoint: 768,
    dockPosition: "top",
    closeOnOutsideClick: true,
    closeOnEscape: true,
  },

  animation: {
    enabled: true,
    duration: 0.5,
    staggerDelay: 0.05,
  },

  accessibility: {
    ariaLabel: "Main navigation",
    reduceMotion: "auto",
  },
};

/** Deep-merges a partial NavbarConfig over the library defaults. */
export const resolveNavbarConfig = createConfig(defaultNavbarConfig);
