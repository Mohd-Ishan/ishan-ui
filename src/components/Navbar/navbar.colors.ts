import type { CSSProperties } from "react";
import type { NavbarConfig } from "./navbar.config";

/**
 * components/Navbar/navbar.colors.ts
 *
 * "Automatic fallback values" (Feature 1 requirement) is implemented once,
 * in Navbar.module.css, as a var()-fallback chain per property — NOT
 * duplicated here in JS. This file's only job is translating whichever
 * color keys a consumer actually set into the matching CSS custom property
 * names; keys left unset emit no inline var at all, so the CSS fallback
 * chain (usually derived from the existing --ishan-navbar-accent /
 * -fg-muted / -bg vars) takes over exactly as if Feature 1 didn't exist —
 * this is what keeps every pre-existing config working unchanged.
 */
type NavbarColors = NonNullable<NavbarConfig["appearance"]["colors"]>;

const COLOR_VAR_NAME: Record<keyof NavbarColors, string> = {
  text: "--ishan-navbar-color-text",
  hoverText: "--ishan-navbar-color-hover-text",
  activeText: "--ishan-navbar-color-active-text",
  activeBackground: "--ishan-navbar-color-active-bg",
  hoverBackground: "--ishan-navbar-color-hover-bg",
  border: "--ishan-navbar-color-border",
  logo: "--ishan-navbar-color-logo",
  icons: "--ishan-navbar-color-icons",
  profileIcon: "--ishan-navbar-color-profile-icon",
  profileBackground: "--ishan-navbar-color-profile-bg",
  profileBorder: "--ishan-navbar-color-profile-border",
  ctaText: "--ishan-navbar-color-cta-text",
  ctaBackground: "--ishan-navbar-color-cta-bg",
  ctaBorder: "--ishan-navbar-color-cta-border",
  ctaHoverText: "--ishan-navbar-color-cta-hover-text",
  ctaHoverBackground: "--ishan-navbar-color-cta-hover-bg",
  ctaHoverBorder: "--ishan-navbar-color-cta-hover-border",
};

export function buildColorCssVars(colors: NavbarConfig["appearance"]["colors"]): CSSProperties {
  if (!colors) return {} as CSSProperties;

  const vars: Record<string, string> = {};
  for (const key of Object.keys(colors) as (keyof NavbarColors)[]) {
    const value = colors[key];
    if (value) vars[COLOR_VAR_NAME[key]] = value;
  }
  return vars as CSSProperties;
}
