import { motion } from "framer-motion";
import styles from "../Button.module.css";
import { BUTTON_SIZE_SPINNER } from "../button.constants";
import type { ButtonConfig } from "../button.config";

export interface ButtonSpinnerProps {
  size: ButtonConfig["size"];
}

/**
 * parts/ButtonSpinner.tsx
 *
 * A continuously rotating ring — deliberately not gated by
 * `accessibility`/`animation.enabled`-style reduced-motion logic the way
 * entrance/exit animations elsewhere in the library are: a loading
 * indicator's motion communicates state (work in progress), not decoration,
 * so it keeps spinning even when other animations are turned off.
 */
export function ButtonSpinner({ size }: ButtonSpinnerProps) {
  const px = BUTTON_SIZE_SPINNER[size];

  return (
    <motion.svg
      className={styles.spinner}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
