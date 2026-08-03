import type { CSSProperties } from "react";
import type { NavbarConfig, NavbarRadiusTokens } from "./navbar.config";

/**
 * components/Navbar/navbar.radius.ts
 *
 * Same pattern as navbar.colors.ts: only emits a CSS var for radius keys the
 * consumer actually set. Unset keys emit nothing, so Navbar.module.css's
 * var()-fallback chain (which reproduces the exact pre-1.3 hardcoded radii)
 * takes over — this is what keeps every existing config's shape unchanged.
 */
const RADIUS_VAR_NAME: Record<keyof NavbarRadiusTokens, string> = {
  navbar: "--ishan-navbar-radius-navbar",
  links: "--ishan-navbar-radius-links",
  dropdown: "--ishan-navbar-radius-dropdown",
  cta: "--ishan-navbar-radius-cta",
  profile: "--ishan-navbar-radius-profile",
  mobileMenu: "--ishan-navbar-radius-mobile-menu",
};

export function buildRadiusCssVars(radius: NavbarConfig["radius"]): CSSProperties {
  if (!radius) return {} as CSSProperties;

  const vars: Record<string, string> = {};
  for (const key of Object.keys(radius) as (keyof NavbarRadiusTokens)[]) {
    const value = radius[key];
    if (value !== undefined) vars[RADIUS_VAR_NAME[key]] = `${value}px`;
  }
  return vars as CSSProperties;
}
