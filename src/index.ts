/**
 * src/index.ts
 *
 * ROOT PUBLIC API. Nothing is public unless it is explicitly re-exported here.
 * This is the "." entry in package.json#exports. Component-specific deep
 * imports (e.g. `ishan-ui/navbar`) are wired to each component's own local
 * barrel (`components/Navbar/index.ts`) and built as a separate entry point —
 * see vite.config.ts.
 */

// ---- Navbar ---------------------------------------------------------------
export { Navbar } from "./components/Navbar";
export type {
  NavbarProps,
  NavbarConfig,
  NavItemConfig,
  ProfileMenuItemConfig,
} from "./components/Navbar";

// ---- Button -----------------------------------------------------------------
export { Button } from "./components/Button";
export type { ButtonProps, ButtonConfig, ButtonColorTokens } from "./components/Button";

// ---- Layout Engine (Box, Container, Flex, Grid, Stack, Layout) --------------

// ---- Modal ---------------------------------------------------------------

export { Modal } from "./components/Modal";

export type {ModalProps,ModalConfig,} from "./components/Modal";

export type {
  ResponsiveValue,
  BoxStyleConfig,
  SizeConfig,
  SpacingConfig,
  BorderConfig,
  RadiusConfig,
  ShadowConfig,
  BackgroundConfig,
  PositionConfig,
  TransformConfig,
} from "./core/style/tokens";



// ---- Config authoring helpers ----------------------------------------------
import { defineConfig as defineConfigBase, createDefineConfigEntry } from "./core/config/defineConfig";
import type { NavbarConfig as _NavbarConfig } from "./components/Navbar";
import type { ButtonConfig as _ButtonConfig } from "./components/Button";
import type { ModalConfig as _ModalConfig } from "./components/Modal";

import type { DeepPartial } from "./core/config/config.types";

/**
 * Typed config-authoring helpers, one entry per component. The generic
 * machinery lives in core/config/defineConfig.ts (which must not know about
 * any component); this is the one file the architecture permits to cross-
 * import multiple components/* folders, so the concrete per-component entries
 * are assembled here.
 *
 * Explicitly typed (rather than left to inference) so the declaration
 * emitter has a named shape to write out instead of trying to infer and
 * serialize the full `Object.assign` result.
 */
export interface DefineConfigHelpers {
  navbar: (config: DeepPartial<_NavbarConfig>) => DeepPartial<_NavbarConfig>;
  button: (config: DeepPartial<_ButtonConfig>) => DeepPartial<_ButtonConfig>;
  modal: (config: DeepPartial<_ModalConfig>) => DeepPartial<_ModalConfig>;
}

export const defineConfig: DefineConfigHelpers = Object.assign(defineConfigBase, {
  navbar: createDefineConfigEntry<_NavbarConfig>(),
  button: createDefineConfigEntry<_ButtonConfig>(),
  modal: createDefineConfigEntry<_ModalConfig>(),
});
export type { DeepPartial } from "./core/config/config.types";

// Default export mirrors the primary named export so both import styles work:
//   import { Navbar } from "ishan-ui";
//   import Navbar from "ishan-ui";
// This is a re-pointed alias, never a second implementation.
export { Navbar as default } from "./components/Navbar";
