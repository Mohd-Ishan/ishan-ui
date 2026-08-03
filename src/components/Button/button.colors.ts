import type { CSSProperties } from "react";
import type { ButtonColorTokens, ButtonConfig } from "./button.config";

/**
 * components/Button/button.colors.ts
 *
 * Same pattern as navbar.colors.ts: only emits a CSS var for color keys the
 * consumer actually set. Button.module.css owns the fallback chain per
 * variant, so an unset key renders exactly as if `colors` wasn't provided.
 */
const COLOR_VAR_NAME: Record<keyof ButtonColorTokens, string> = {
  text: "--ishan-button-color-text",
  background: "--ishan-button-color-bg",
  border: "--ishan-button-color-border",
  hoverText: "--ishan-button-color-hover-text",
  hoverBackground: "--ishan-button-color-hover-bg",
  hoverBorder: "--ishan-button-color-hover-border",
  activeText: "--ishan-button-color-active-text",
  activeBackground: "--ishan-button-color-active-bg",
  activeBorder: "--ishan-button-color-active-border",
};

export function buildButtonColorCssVars(colors: ButtonConfig["colors"]): CSSProperties {
  if (!colors) return {} as CSSProperties;

  const vars: Record<string, string> = {};
  for (const key of Object.keys(colors) as (keyof ButtonColorTokens)[]) {
    const value = colors[key];
    if (value) vars[COLOR_VAR_NAME[key]] = value;
  }
  return vars as CSSProperties;
}
