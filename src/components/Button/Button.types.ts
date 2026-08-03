import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { DeepPartial } from "../../core/config/config.types";
import type { ButtonConfig } from "./button.config";

/**
 * components/Button/Button.types.ts
 *
 * Public prop contract. `variant`/`size`/`fullWidth`/`disabled`/`loading`
 * exist both here (as ergonomic, frequently-changing per-instance props)
 * and inside `ButtonConfig` (as app-wide defaults) — a prop always wins
 * over the matching config field when both are set. See button.config.ts
 * for the reasoning.
 */
export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonConfig["variant"];
  size?: ButtonConfig["size"];
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Renders an `<a>` instead of a `<button>` when provided. */
  href?: string;
  external?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  /** The visual system: colors, radius, typography, animation. Omit entirely for production-usable defaults. */
  config?: DeepPartial<ButtonConfig>;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}
