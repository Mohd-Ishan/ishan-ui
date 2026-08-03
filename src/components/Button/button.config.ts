import { createConfig } from "../../core/config/createConfig";
import type { BaseComponentConfig } from "../../core/config/config.types";
import type { TypographyTokens } from "../../core/typography/tokens";

/**
 * components/Button/button.config.ts
 *
 * Button's visual *system* (colors, radius, typography, animation) lives in
 * config, resolved the same way as every other component via createConfig —
 * but unlike Navbar (rendered once per app), Button is rendered many times
 * per screen, so the instance-specific, frequently-changing concerns
 * (variant, size, disabled, loading, icons, click handler, children) are
 * ordinary React props instead of config fields. A prop always overrides
 * the matching config default when both are provided — see Button.tsx.
 */

export interface ButtonColorTokens {
  text: string;
  background: string;
  border: string;
  hoverText: string;
  hoverBackground: string;
  hoverBorder: string;
  activeText: string;
  activeBackground: string;
  activeBorder: string;
}

export interface ButtonConfig extends BaseComponentConfig {
  variant: "solid" | "outline" | "ghost" | "glass" | "gradient" | "link";
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
  disabled: boolean;
  loading: boolean;
  /** px. */
  radius: number;
  accentColor: string;
  /** Every key optional — unset keys fall back automatically per variant. */
  colors?: Partial<ButtonColorTokens>;
  typography?: Partial<TypographyTokens>;
  animation: {
    enabled: boolean;
    /** Seconds — hover/tap micro-interaction speed. */
    duration: number;
    reduceMotion: "auto" | "always" | "never";
  };
}

export const defaultButtonConfig: ButtonConfig = {
  variant: "solid",
  size: "md",
  fullWidth: false,
  disabled: false,
  loading: false,
  radius: 10,
  accentColor: "#6C5CE7",
  animation: {
    enabled: true,
    duration: 0.15,
    reduceMotion: "auto",
  },
};

/** Deep-merges a partial ButtonConfig over the library defaults. */
export const resolveButtonConfig = createConfig(defaultButtonConfig);
