/**
 * components/Navbar/navbar.constants.ts
 *
 * Internal-only constants. Unlike `navbar.config.ts`, nothing here is meant to
 * be tuned per-consumer — these are implementation details (z-index stacking,
 * motion curves, aria label fallbacks) that stay constant across every Navbar
 * instance regardless of config.
 */

/** Local z-index scale, namespaced so it can't collide with a consumer's own stacking context. */
export const NAVBAR_Z_INDEX = {
  root: 100,
  backdrop: 110,
  mobileMenu: 120,
  profileMenu: 130,
} as const;

/** Framer Motion easing curve — a restrained "premium" ease-out, not a stock linear/ease. */
export const NAVBAR_EASING = [0.16, 1, 0.3, 1] as const;

export const NAVBAR_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

/** Scroll delta (px) required before a hide/show-on-scroll decision is made — avoids jitter. */
export const SCROLL_DIRECTION_THRESHOLD = 8;

/** Scroll position (px) after which the navbar is considered "scrolled" for elevation/blur states. */
export const SCROLLED_THRESHOLD = 12;

export const NAVBAR_ARIA_LABELS = {
  nav: "Main navigation",
  mobileToggleOpen: "Open menu",
  mobileToggleClose: "Close menu",
  profileMenu: "Account menu",
  brandHome: "Go to homepage",
} as const;

export const NAVBAR_IDS = {
  mobileMenu: "ishan-ui-navbar-mobile-menu",
  profileMenu: "ishan-ui-navbar-profile-menu",
} as const;
