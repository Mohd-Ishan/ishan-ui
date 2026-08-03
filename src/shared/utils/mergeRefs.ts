import type { Ref, RefCallback } from "react";

/**
 * shared/utils/mergeRefs.ts
 *
 * Combines multiple refs (callback or object refs) into a single callback ref,
 * so a component can use an internal ref (e.g. for focus trapping) while still
 * forwarding the consumer's own ref to the same DOM node.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}
