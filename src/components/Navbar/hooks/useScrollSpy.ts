import { useEffect, useState } from "react";
import type { NavItemConfig } from "../navbar.config";

/**
 * hooks/useScrollSpy.ts
 *
 * Landing-page navigation (Feature 4). Only ever looks at nav items whose
 * `path` starts with "#" — routed items are completely untouched, so this
 * can be enabled in the same Navbar instance that also uses React Router
 * without the two mechanisms fighting over what counts as "active".
 *
 * Uses IntersectionObserver (not a scroll listener) so it's cheap even with
 * many sections, and `rootMargin` (derived from `offset`) does the "count as
 * active once it clears the sticky navbar" adjustment declaratively instead
 * of via manual scroll-position math.
 */
export function useScrollSpy(items: NavItemConfig[], enabled: boolean, offset: number): string | null {
  const [activeHash, setActiveHash] = useState<string | null>(null);

  const hashIds = items
    .filter((item) => item.path.startsWith("#"))
    .map((item) => item.path.slice(1));
  const hashKey = hashIds.join(",");

  useEffect(() => {
    if (!enabled || hashIds.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sections = hashIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // A section counts as "current" once it's crossed `offset`px from the top
    // and before it scrolls past the bottom — a thin observation band rather
    // than the whole viewport, so the active item changes right as a section
    // reaches the top instead of whenever any part of it is merely visible.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveHash(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${offset}px 0px -70% 0px`,
        threshold: 0,
      },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hashKey is the derived, stable representation of hashIds
  }, [enabled, hashKey, offset]);

  return enabled ? activeHash : null;
}
