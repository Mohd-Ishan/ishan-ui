import { Navbar as NavbarBase } from "./Navbar";
import { NavbarCtaSlot } from "./parts/NavbarCtaSlot";

/**
 * components/Navbar/index.ts
 *
 * Local barrel — this is what the root `src/index.ts` re-exports from.
 * Attaches the compound sub-component (`Navbar.Cta`) onto the base component
 * so consumers can write `<Navbar.Cta>` without a separate import.
 */
export const Navbar = Object.assign(NavbarBase, {
  Cta: NavbarCtaSlot,
});

export type { NavbarProps } from "./Navbar.types";
export type {
  NavbarConfig,
  NavItemConfig,
  ProfileMenuItemConfig,
} from "./navbar.config";
export { defaultNavbarConfig, resolveNavbarConfig } from "./navbar.config";
