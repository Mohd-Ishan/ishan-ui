import { useCallback, useEffect, useState } from "react";
import { useIsBelowBreakpoint } from "../../../shared/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import type { NavbarConfig } from "../navbar.config";
import { matchesRoute, useActiveRoute } from "./useActiveRoute";
import { useScrollDirection } from "./useScrollDirection";
import { useScrollSpy } from "./useScrollSpy";

/**
 * hooks/useNavbarState.ts
 *
 * Composes the smaller focused hooks (scroll, breakpoint, route, motion
 * preference, scroll spy) into the single state shape Navbar.tsx and its
 * parts/ need. Kept component-private (not exported from the package) —
 * this is glue, not public API.
 */
export function useNavbarState(config: NavbarConfig) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const isMobile = useIsBelowBreakpoint(config.mobile.breakpoint);
  const scroll = useScrollDirection(config.behavior.hideOnScroll);
  const systemPrefersReducedMotion = usePrefersReducedMotion();
  const internalRoute = useActiveRoute();

  const scrollSpyEnabled = config.scrollSpy?.enabled ?? false;
  const scrollSpyOffset = config.scrollSpy?.offset ?? 100;
  const activeScrollSpyHash = useScrollSpy(config.navigation.items, scrollSpyEnabled, scrollSpyOffset);

  // When config.router.currentPath is supplied (e.g. from React Router's
  // useLocation().pathname), it fully replaces Navbar's own internal pathname
  // tracking for active-link/hideOnRoutes matching — not just a fallback —
  // since the router's location is the single source of truth once wired in.
  const hasRouterOverride = config.router?.currentPath !== undefined;
  const pathname = hasRouterOverride ? config.router!.currentPath! : internalRoute.pathname;

  const isActive = (itemPath: string) => {
    // Scroll spy owns "#hash" items exclusively (and only once enabled and a
    // section is actually being observed) — it never touches routed items,
    // so routing-based highlighting keeps working unchanged alongside it.
    if (itemPath.startsWith("#")) {
      if (!scrollSpyEnabled) return false;
      return activeScrollSpyHash !== null && itemPath === `#${activeScrollSpyHash}`;
    }
    return hasRouterOverride ? matchesRoute(pathname, itemPath) : internalRoute.isActive(itemPath);
  };

  const isHidden = (hideOnRoutes: string[]) =>
    hasRouterOverride
      ? hideOnRoutes.some((pattern) => matchesRoute(pathname, pattern))
      : internalRoute.isHidden(hideOnRoutes);

  const shouldAnimate =
    config.animation.enabled &&
    config.accessibility.reduceMotion !== "always" &&
    !(config.accessibility.reduceMotion === "auto" && systemPrefersReducedMotion);

  const isHiddenByRoute = isHidden(config.behavior.hideOnRoutes);
  const isHiddenByScroll =
    config.behavior.hideOnScroll && scroll.direction === "down" && scroll.isScrolled;

  // Close the mobile menu automatically if the viewport grows past the breakpoint.
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) setMobileMenuOpen(false);
  }, [isMobile, isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((open) => !open), []);
  const closeProfileMenu = useCallback(() => setProfileMenuOpen(false), []);
  const toggleProfileMenu = useCallback(() => setProfileMenuOpen((open) => !open), []);

  const handleNavigate = useCallback(
    (path: string) => {
      // Prefer the consumer's own router navigate (React Router's useNavigate(),
      // etc.) so the router's internal state — and therefore what it renders —
      // actually updates. Falls back to Navbar's own history.pushState tracking
      // when no router is wired in, which is enough to keep the URL and
      // active-link highlighting correct for non-router apps.
      if (config.router?.onNavigate) {
        config.router.onNavigate(path);
      } else {
        internalRoute.navigate(path);
      }
      if (config.behavior.autoCollapseOnNavigate) {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
      }
    },
    [internalRoute, config.router, config.behavior.autoCollapseOnNavigate],
  );

  return {
    isMobile,
    isMobileMenuOpen,
    isProfileMenuOpen,
    isScrolled: scroll.isScrolled,
    isHiddenByRoute,
    isHiddenByScroll,
    shouldAnimate,
    pathname,
    isActive,
    toggleMobileMenu,
    closeMobileMenu,
    toggleProfileMenu,
    closeProfileMenu,
    handleNavigate,
  };
}

export type NavbarState = ReturnType<typeof useNavbarState>;
