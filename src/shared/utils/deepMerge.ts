/**
 * shared/utils/deepMerge.ts
 *
 * Recursively merges `source` onto `target` without mutating either argument.
 * Arrays are replaced wholesale (not concatenated/merged by index) — this is the
 * correct default for config shapes like `navigation.items`, where a caller
 * providing a partial `items` array means "use exactly this array", not "splice
 * this into the defaults".
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor === Object
  );
}

export function deepMerge<T extends object>(target: T, source?: Partial<T>): T {
  if (!source) return target;

  const output = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const sourceValue = (source as Record<string, unknown>)[key];
    const targetValue = (target as Record<string, unknown>)[key];

    if (sourceValue === undefined) continue;

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      output[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else {
      output[key] = sourceValue;
    }
  }

  return output as T;
}
