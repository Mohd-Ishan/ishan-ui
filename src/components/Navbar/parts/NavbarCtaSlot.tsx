import type { ReactNode } from "react";

export interface NavbarCtaSlotProps {
  children?: ReactNode;
}

/**
 * parts/NavbarCtaSlot.tsx
 *
 * Marker component exported as `Navbar.Cta`. It never renders itself —
 * Navbar.tsx scans its own `children` for an element of this exact type and
 * lifts its children out to use as custom CTA content, while `cta` config
 * still controls href/variant/styling. This keeps the compound API additive:
 * `<Navbar config={cfg} />` and `<Navbar config={cfg}><Navbar.Cta>...</Navbar.Cta></Navbar>`
 * both work, and this component is a no-op if rendered standalone.
 */
export function NavbarCtaSlot(_props: NavbarCtaSlotProps): null {
  return null;
}
