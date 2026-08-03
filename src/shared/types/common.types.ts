import type { ReactNode } from "react";

/** shared/types/common.types.ts — cross-component prop-shape fragments. */

export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children?: ReactNode;
}
