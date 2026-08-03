import { useCallback, useEffect, useState } from "react";

/**
 * core/routing/useOptionalRouter.ts
 *
 * ishan-ui does NOT statically import "react-router". Doing so would force it
 * as a hard dependency at bundle time even though it's declared as an optional
 * peer dependency. Instead this hook tracks the browser's own history state
 * directly, which is the same source of truth React Router (v6/v7, browser
 * history mode) reads and writes to.
 *
 * `history.pushState`/`replaceState` do NOT fire a `popstate` event on their
 * own (only back/forward navigation does), so this module patches them exactly
 * once per page to also dispatch a custom event. This makes Navbar's active-
 * route highlighting update correctly whether navigation was triggered by:
 *   - Navbar's own internal link handling
 *   - A React Router <Link>/navigate() call elsewhere on the page
 *   - Native browser back/forward
 *
 * The patch is additive (calls through to the original method) and idempotent,
 * so it is safe to coexist with React Router's own history instance.
 */
const LOCATION_CHANGE_EVENT = "ishan-ui:locationchange";

let isPatched = false;

function patchHistoryOnce(): void {
  if (isPatched || typeof window === "undefined") return;
  isPatched = true;

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function patchedPushState(...args) {
    originalPushState(...args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  };

  window.history.replaceState = function patchedReplaceState(...args) {
    originalReplaceState(...args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  });
}

export interface OptionalRouter {
  /** Current pathname, e.g. "/dashboard/settings". */
  pathname: string;
  /**
   * Navigate to an internal path. Uses `history.pushState` so it participates
   * in whatever router (or lack of one) is already listening on the page.
   */
  navigate: (path: string) => void;
}

export function useOptionalRouter(): OptionalRouter {
  const getPathname = () =>
    typeof window === "undefined" ? "/" : window.location.pathname;

  const [pathname, setPathname] = useState(getPathname);

  useEffect(() => {
    patchHistoryOnce();
    const handleChange = () => setPathname(getPathname());
    window.addEventListener(LOCATION_CHANGE_EVENT, handleChange);
    window.addEventListener("popstate", handleChange);
    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleChange);
      window.removeEventListener("popstate", handleChange);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window === "undefined") return;
    window.history.pushState({}, "", path);
  }, []);

  return { pathname, navigate };
}
