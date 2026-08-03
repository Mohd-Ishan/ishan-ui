/**
 * shared/utils/cx.ts
 *
 * Minimal, dependency-free className joiner (clsx-compatible subset). Kept
 * in-house rather than pulling in `clsx`/`classnames` as a dependency, to
 * keep the library's own footprint predictable for consumers.
 */
type ClassValue = string | number | false | null | undefined | Record<string, boolean>;

export function cx(...values: ClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      continue;
    }

    for (const key of Object.keys(value)) {
      if (value[key]) classes.push(key);
    }
  }

  return classes.join(" ");
}
