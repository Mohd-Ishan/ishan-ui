import type { ButtonConfig } from "./button.config";

/**
 * components/Button/button.constants.ts
 *
 * Internal-only lookup tables driven by `size` — not meant to be tuned by
 * consumers directly (use `radius`/`typography` in config for that), just
 * the concrete pixel values each discrete size resolves to.
 */
type Size = ButtonConfig["size"];

export const BUTTON_SIZE_PADDING: Record<Size, { x: number; y: number }> = {
  sm: { x: 12, y: 6 },
  md: { x: 18, y: 9 },
  lg: { x: 24, y: 13 },
};

export const BUTTON_SIZE_FONT_SIZE: Record<Size, number> = {
  sm: 13,
  md: 14,
  lg: 16,
};

export const BUTTON_SIZE_GAP: Record<Size, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

export const BUTTON_SIZE_SPINNER: Record<Size, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const BUTTON_ARIA_LABELS = {
  loading: "Loading",
} as const;
