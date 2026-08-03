import type { CommandPaletteItemConfig, NavItemConfig } from "./navbar.config";

/**
 * components/Navbar/commandPalette.utils.ts
 *
 * Pure, framework-free functions — deliberately has zero React/DOM
 * dependency so search/filter behavior can be unit tested directly without
 * mounting a component, and so it can't accidentally develop a dependency
 * on component-local state.
 */

export interface CommandPaletteResultItem {
  id: string;
  label: string;
  group: "Navigation" | "Commands";
  path?: string;
  action?: () => void;
  external?: boolean;
  keywords?: string[];
}

export interface CommandPaletteMatch extends CommandPaletteResultItem {
  /** Index into `label` where the query match starts, or -1 if it only matched via `keywords` (no highlightable span). */
  matchStart: number;
  matchEnd: number;
}

/** Flattens nav items (including dropdown children) and custom commands into one searchable list. */
export function buildSearchableItems(
  navItems: NavItemConfig[],
  commands: CommandPaletteItemConfig[],
): CommandPaletteResultItem[] {
  const results: CommandPaletteResultItem[] = [];

  for (const item of navItems) {
    results.push({
      id: `nav-${item.id}`,
      label: item.label,
      group: "Navigation",
      path: item.path,
      external: item.external,
    });

    if (item.dropdown) {
      for (const child of item.dropdown) {
        results.push({
          id: `nav-${item.id}-${child.id}`,
          label: `${item.label} / ${child.label}`,
          group: "Navigation",
          path: child.path,
          external: child.external,
        });
      }
    }
  }

  for (const command of commands) {
    results.push({
      id: `cmd-${command.id}`,
      label: command.label,
      group: "Commands",
      path: command.path,
      action: command.action,
      external: command.external,
      keywords: command.keywords,
    });
  }

  return results;
}

/** Case-insensitive substring match against label first, falling back to keywords. Empty query returns everything, unranked. */
export function filterCommandItems(query: string, items: CommandPaletteResultItem[]): CommandPaletteMatch[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return items.map((item) => ({ ...item, matchStart: -1, matchEnd: -1 }));
  }

  const matches: CommandPaletteMatch[] = [];

  for (const item of items) {
    const labelIndex = item.label.toLowerCase().indexOf(trimmed);
    if (labelIndex !== -1) {
      matches.push({ ...item, matchStart: labelIndex, matchEnd: labelIndex + trimmed.length });
      continue;
    }

    const keywordHit = item.keywords?.some((keyword) => keyword.toLowerCase().includes(trimmed));
    if (keywordHit) {
      matches.push({ ...item, matchStart: -1, matchEnd: -1 });
    }
  }

  return matches;
}
