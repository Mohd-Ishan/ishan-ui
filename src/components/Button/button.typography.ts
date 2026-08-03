import type { CSSProperties } from "react";
import type { TypographyTokens } from "../../core/typography/tokens";

/**
 * components/Button/button.typography.ts
 *
 * Same reasoning as button.colors.ts, applied to typography — Button only
 * ever has one text target (its own label), so this is a flat mapping
 * rather than Navbar's per-section (logo/navigation/cta/...) structure.
 */
const FIELD_VAR_NAME: Record<keyof TypographyTokens, string> = {
  fontFamily: "--ishan-button-typo-family",
  fontSize: "--ishan-button-typo-size",
  fontWeight: "--ishan-button-typo-weight",
  letterSpacing: "--ishan-button-typo-spacing",
  textTransform: "--ishan-button-typo-transform",
};

function formatValue(field: keyof TypographyTokens, value: string | number): string {
  if (field === "fontSize" || field === "letterSpacing") return `${value}px`;
  return String(value);
}

export function buildButtonTypographyCssVars(typography?: Partial<TypographyTokens>): CSSProperties {
  if (!typography) return {} as CSSProperties;

  const vars: Record<string, string> = {};
  for (const field of Object.keys(typography) as (keyof TypographyTokens)[]) {
    const value = typography[field];
    if (value === undefined) continue;
    vars[FIELD_VAR_NAME[field]] = formatValue(field, value);
  }
  return vars as CSSProperties;
}
