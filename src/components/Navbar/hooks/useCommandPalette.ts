import { useCallback, useEffect, useMemo, useState } from "react";
import { buildSearchableItems, filterCommandItems, type CommandPaletteMatch } from "../commandPalette.utils";
import type { CommandPaletteItemConfig, NavItemConfig } from "../navbar.config";

export interface UseCommandPaletteOptions {
  enabled: boolean;
  shortcut: string;
  navItems: NavItemConfig[];
  commands: CommandPaletteItemConfig[];
  closeOnSelect: boolean;
  onNavigate: (path: string) => void;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  setQuery: (query: string) => void;
  results: CommandPaletteMatch[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  open: () => void;
  close: () => void;
  selectIndex: (index: number) => void;
  moveSelection: (delta: number) => void;
}

/** Extracts the letter to match from a shortcut string like "Ctrl+K" or "Cmd+K" — case-insensitive, defaults to "k". */
function extractShortcutKey(shortcut: string): string {
  const parts = shortcut.split("+");
  return (parts[parts.length - 1] ?? "k").trim().toLowerCase();
}

/**
 * hooks/useCommandPalette.ts
 *
 * Feature 2. The keyboard shortcut listener is always attached whenever
 * `enabled` is true — regardless of whether the palette is currently open —
 * since Cmd/Ctrl+K needs to work as a global "open" trigger, not just a
 * close-while-open one (Escape handles the close side, wired in
 * CommandPalette.tsx alongside its own focus trap and outside-click, the
 * same pattern used by the mobile menu and dropdowns).
 */
export function useCommandPalette({
  enabled,
  shortcut,
  navItems,
  commands,
  closeOnSelect,
  onNavigate,
}: UseCommandPaletteOptions): CommandPaletteState {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchableItems = useMemo(
    () => buildSearchableItems(navItems, commands),
    [navItems, commands],
  );
  const results = useMemo(() => filterCommandItems(query, searchableItems), [query, searchableItems]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Reset selection to the top whenever the result set changes, so an
  // out-of-range index from a previous, longer result list can't linger.
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  useEffect(() => {
    if (!enabled) return;

    const key = extractShortcutKey(shortcut);

    function handleKeyDown(event: KeyboardEvent) {
      const modifierPressed = event.metaKey || event.ctrlKey;
      if (modifierPressed && event.key.toLowerCase() === key) {
        event.preventDefault();
        setIsOpen((wasOpen) => {
          if (!wasOpen) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !wasOpen;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, shortcut]);

  const selectIndex = useCallback(
    (index: number) => {
      const item = results[index];
      if (!item) return;

      if (item.action) {
        item.action();
      } else if (item.path) {
        if (item.external) {
          window.open(item.path, "_blank", "noreferrer");
        } else if (item.path.startsWith("#")) {
          close();
          requestAnimationFrame(() => {
            document.getElementById(item.path!.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
          });
          return;
        } else {
          onNavigate(item.path);
        }
      }

      if (closeOnSelect) close();
    },
    [results, onNavigate, closeOnSelect, close],
  );

  const moveSelection = useCallback(
    (delta: number) => {
      setSelectedIndex((current) => {
        if (results.length === 0) return 0;
        const next = (current + delta + results.length) % results.length;
        return next;
      });
    },
    [results.length],
  );

  return {
    isOpen,
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    open,
    close,
    selectIndex,
    moveSelection,
  };
}
