import type { MouseEvent } from "react";
import styles from "../Navbar.module.css";
import { NAVBAR_ARIA_LABELS } from "../navbar.constants";
import type { NavbarConfig } from "../navbar.config";

export interface NavbarLogoProps {
  brand: NavbarConfig["brand"];
  onNavigate: (path: string) => void;
}

/**
 * parts/NavbarLogo.tsx
 *
 * Renders whichever combination of image/text the config provides. Always
 * navigates to `brand.href` on click/Enter — the one non-configurable brand
 * behavior, matching universal navbar convention.
 */
export function NavbarLogo({ brand, onNavigate }: NavbarLogoProps) {
  const isHashLink = brand.href.startsWith("#");
  const isExternal = /^https?:\/\//.test(brand.href);

  function handleClick(event: MouseEvent) {
    if (isExternal || isHashLink) return;
    event.preventDefault();
    onNavigate(brand.href);
  }

  return (
    <a
      href={brand.href}
      className={styles.brand}
      aria-label={brand.name ? undefined : NAVBAR_ARIA_LABELS.brandHome}
      onClick={handleClick}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {brand.logoSrc && (
        <img src={brand.logoSrc} alt={brand.logoAlt} className={styles.brandLogoImg} />
      )}
      {brand.name && <span>{brand.name}</span>}
    </a>
  );
}
