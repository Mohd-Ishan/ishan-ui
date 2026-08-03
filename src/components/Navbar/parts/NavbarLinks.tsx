import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import type { AnimationEasingName, AnimationPresetName } from "../../../core/motion/presets";
import styles from "../Navbar.module.css";
import type { NavItemConfig } from "../navbar.config";
import { NavbarDropdown } from "./NavbarDropdown";

export interface NavbarLinksProps {
  items: NavItemConfig[];
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
  smoothScrollOffset: number;
  shouldAnimate: boolean;
  preset: AnimationPresetName;
  duration: number;
  delay: number;
  easing: AnimationEasingName;
}

function scrollToHash(hash: string, offset: number): void {
  const target = document.getElementById(hash.replace("#", ""));
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * parts/NavbarLinks.tsx
 *
 * Desktop link row. Uses Framer Motion's `layoutId` so the active-state pill
 * glides between items instead of popping — the "hover/active indicator"
 * effect from the brief, driven entirely by `layout`, no manual position math.
 * Items with a `dropdown` array delegate entirely to NavbarDropdown instead
 * of rendering a plain link.
 */
export function NavbarLinks({
  items,
  isActive,
  onNavigate,
  smoothScrollOffset,
  shouldAnimate,
  preset,
  duration,
  delay,
  easing,
}: NavbarLinksProps) {
  function handleClick(event: MouseEvent, item: NavItemConfig) {
    if (item.external) return;

    if (item.path.startsWith("#")) {
      event.preventDefault();
      scrollToHash(item.path, smoothScrollOffset);
      return;
    }

    event.preventDefault();
    onNavigate(item.path);
  }

  return (
    // Safari VoiceOver drops the implicit "list" role once list-style:none is
    // applied (see Navbar.module.css .links); role="list" is the documented
    // workaround: https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ul className={styles.links} role="list">
      {items.map((item) => {
        if (item.dropdown && item.dropdown.length > 0) {
          return (
            <li key={item.id} className={styles.linkItem}>
              <NavbarDropdown
                item={item}
                isActive={isActive}
                onNavigate={onNavigate}
                smoothScrollOffset={smoothScrollOffset}
                shouldAnimate={shouldAnimate}
                preset={preset}
                duration={duration}
                delay={delay}
                easing={easing}
              />
            </li>
          );
        }

        const active = isActive(item.path);
        const isExternal = item.external ?? /^https?:\/\//.test(item.path);

        return (
          <li key={item.id} className={styles.linkItem}>
            <a
              href={item.path}
              className={styles.linkAnchor}
              data-active={active}
              aria-current={active ? "page" : undefined}
              onClick={(event) => handleClick(event, item)}
              {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {active &&
                (shouldAnimate ? (
                  <motion.span
                    layoutId="ishan-navbar-active-indicator"
                    className={styles.activeIndicator}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : (
                  <span className={styles.activeIndicator} />
                ))}
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
