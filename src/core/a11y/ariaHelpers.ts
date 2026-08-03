/**
 * core/a11y/ariaHelpers.ts
 *
 * Small pure helpers so ARIA attribute logic (and its edge cases) is written
 * once and reused by every component, rather than re-derived inline per file.
 */

/** Returns "true"/"false" (string) or undefined — the shape `aria-*` props expect. */
export function ariaBool(value: boolean | undefined): "true" | "false" | undefined {
  if (value === undefined) return undefined;
  return value ? "true" : "false";
}

/** Builds a stable id for an element that another element's aria-controls/aria-labelledby references. */
export function makeAriaId(namespace: string, suffix: string): string {
  return `ishan-ui-${namespace}-${suffix}`;
}
