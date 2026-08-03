import type { ReactNode } from "react";
import type { DeepPartial } from "../../core/config/config.types";
import type { NavbarConfig } from "./navbar.config";

/**
 * components/Navbar/Navbar.types.ts
 *
 * Public prop contract. This is the only file (besides navbar.config.ts) a
 * consumer's editor will surface — internal parts/hooks types are never
 * exported from the package root.
 */
export interface NavbarProps {
  /** Full or partial config, deep-merged over library defaults. Omit entirely for a zero-config Navbar. */
  config?: DeepPartial<NavbarConfig>;
  /**
   * Compound-component overrides (e.g. `<Navbar.Cta>`). This is the only
   * supported way to inject custom markup into a slot — never arbitrary
   * prop-drilling — so the prop surface stays stable as the component grows.
   */
  children?: ReactNode;
}
