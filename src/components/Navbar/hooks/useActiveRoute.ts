import { useMemo } from "react";
import { useOptionalRouter } from "../../../core/routing/useOptionalRouter";

/**
 * hooks/useActiveRoute.ts
 *
 * Converts a route pattern like "/blog/:slug" or "/dashboard/*" into a RegExp
 * and matches it against the current pathname. Shared by active-link
 * highlighting (navigation.items) and hideOnRoutes.
 */
function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape regex specials except : and *
    .replace(/:[^/]+/g, "[^/]+") // ":param" -> one path segment
    .replace(/\*/g, ".*"); // "*" -> wildcard remainder

  return new RegExp(`^${escaped}/?$`);
}

export function matchesRoute(pathname: string, pattern: string): boolean {
  if (pattern === pathname) return true;
  if (!pattern.includes(":") && !pattern.includes("*")) return false;
  return patternToRegExp(pattern).test(pathname);
}

export interface ActiveRoute {
  pathname: string;
  navigate: (path: string) => void;
  isActive: (itemPath: string) => boolean;
  isHidden: (hideOnRoutes: string[]) => boolean;
}

export function useActiveRoute(): ActiveRoute {
  const { pathname, navigate } = useOptionalRouter();

  return useMemo<ActiveRoute>(
    () => ({
      pathname,
      navigate,
      isActive: (itemPath: string) => {
        if (itemPath.startsWith("#")) return false;
        return matchesRoute(pathname, itemPath);
      },
      isHidden: (hideOnRoutes: string[]) =>
        hideOnRoutes.some((pattern) => matchesRoute(pathname, pattern)),
    }),
    [pathname, navigate],
  );
}
