import type { CSSProperties } from "react";
import type { NavbarConfig, TypographyTokens } from "./navbar.config";

/**
 * components/Navbar/navbar.typography.ts
 *
 * Same pattern as navbar.colors.ts / navbar.radius.ts: only emits CSS vars
 * for fields the consumer actually set, for each of the five typography
 * sections (logo/navigation/cta/dropdown/profile). Unset fields emit
 * nothing, so Navbar.module.css's existing hardcoded typography values
 * (now expressed as var() fallbacks) keep rendering exactly as before.
 */
type TypographySection = keyof NonNullable<NavbarConfig["typography"]>;

const FIELD_SUFFIX: Record<keyof TypographyTokens, string> = {
  fontFamily: "family",
  fontSize: "size",
  fontWeight: "weight",
  letterSpacing: "spacing",
  textTransform: "transform",
};

function formatValue(field: keyof TypographyTokens, value: string | number): string {
  if (field === "fontSize" || field === "letterSpacing") return `${value}px`;
  return String(value);
}

export function buildTypographyCssVars(typography: NavbarConfig["typography"]): CSSProperties {
  if (!typography) return {} as CSSProperties;

  const vars: Record<string, string> = {};

  for (const section of Object.keys(typography) as TypographySection[]) {
    const tokens = typography[section];
    if (!tokens) continue;

    for (const field of Object.keys(tokens) as (keyof TypographyTokens)[]) {
      const value = tokens[field];
      if (value === undefined) continue;
      vars[`--ishan-navbar-typo-${section}-${FIELD_SUFFIX[field]}`] = formatValue(field, value);
    }
  }

  return vars as CSSProperties;
}
