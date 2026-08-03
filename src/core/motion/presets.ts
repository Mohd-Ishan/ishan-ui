import type { Transition, Variants } from "framer-motion";

/**
 * core/motion/presets.ts
 *
 * Library-wide animation preset engine. Every animated element in Navbar
 * (root reveal, mobile menu, dropdown, profile menu, active indicator) reads
 * its Framer Motion variants from here instead of hand-rolling its own
 * initial/animate/exit objects — this is what "Feature 3: Animation Presets"
 * means in practice: one config knob (`animation.preset`) changes every
 * animated surface consistently, and future components reuse the same
 * engine rather than duplicating motion logic per component.
 *
 * Consumers of this module (Navbar.tsx, NavbarProfile.tsx, etc.) should
 * always apply the returned variants via Framer Motion's named-variant
 * pattern (`variants={...} initial="hidden" animate="visible" exit="exit"`)
 * rather than reading `.hidden`/`.visible` directly as `initial`/`animate`
 * target objects — Framer Motion's `Variant` type is a union that also
 * includes resolver functions, which TypeScript can't narrow when read out
 * of a `Variants` map directly.
 */

export type AnimationPresetName = "slide" | "fade" | "scale" | "blur" | "spring";

export type AnimationEasingName = "easeOut" | "easeIn" | "easeInOut" | "linear";

export interface AnimationPresetOptions {
  /** Seconds. Ignored for the "spring" preset (spring physics owns timing instead). */
  duration?: number;
  /** Seconds, applied before the animation starts. */
  delay?: number;
  easing?: AnimationEasingName;
}

/**
 * Framer Motion's own `Transition["ease"]` can't be indexed directly here —
 * `Transition` is a union of many transition-type-specific shapes and not
 * all of them declare `ease`, which blows up TypeScript's union resolution.
 * Cubic-bezier arrays and the "linear" keyword are both valid easing values
 * Framer Motion accepts at runtime regardless.
 */
const EASING_CURVES: Record<AnimationEasingName, number[] | "linear"> = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeInOut: [0.65, 0, 0.35, 1],
  linear: "linear",
};

/** Converts a named easing to a CSS-usable `transition-timing-function` value. Reused wherever a plain CSS transition (not a Framer Motion one) needs the same easing curve, e.g. Feature 1's scroll appearance transition. */
export function easingToCssString(easing: AnimationEasingName): string {
  const curve = EASING_CURVES[easing];
  return curve === "linear" ? "linear" : `cubic-bezier(${curve.join(",")})`;
}

function resolveTransition(preset: AnimationPresetName, options: AnimationPresetOptions): Transition {
  const delay = options.delay ?? 0;

  if (preset === "spring") {
    return { type: "spring", stiffness: 380, damping: 32, mass: 0.9, delay };
  }

  return {
    duration: options.duration ?? 0.4,
    delay,
    ease: EASING_CURVES[options.easing ?? "easeOut"],
  } as Transition;
}

/**
 * Builds the `{ hidden, visible, exit }` variants for one animated surface
 * (the navbar root, a dropdown panel, the mobile menu, the profile menu).
 * `exit` reuses `hidden`'s displacement but runs faster, matching the
 * "quick out, considered in" feel most premium UI libraries use.
 */
export function createPresetVariants(
  preset: AnimationPresetName,
  options: AnimationPresetOptions = {},
): Variants {
  const transition = resolveTransition(preset, options);
  const exitTransition: Transition =
    preset === "spring"
      ? { ...transition, stiffness: 420, damping: 34 }
      : { ...transition, duration: (options.duration ?? 0.4) * 0.6, delay: 0 };

  switch (preset) {
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.94 },
        visible: { opacity: 1, scale: 1, transition },
        exit: { opacity: 0, scale: 0.94, transition: exitTransition },
      };
    case "blur":
      return {
        hidden: { opacity: 0, filter: "blur(6px)" },
        visible: { opacity: 1, filter: "blur(0px)", transition },
        exit: { opacity: 0, filter: "blur(6px)", transition: exitTransition },
      };
    case "spring":
      return {
        hidden: { opacity: 0, y: -10, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition },
        exit: { opacity: 0, y: -10, scale: 0.96, transition: exitTransition },
      };
    case "fade":
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition },
        exit: { opacity: 0, transition: exitTransition },
      };
    case "slide":
    default:
      return {
        hidden: { opacity: 0, y: -16 },
        visible: { opacity: 1, y: 0, transition },
        exit: { opacity: 0, y: -16, transition: exitTransition },
      };
  }
}

/** Container variants for staggered children (mobile menu items, dropdown items). */
export function createStaggerContainerVariants(stagger: number, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
    exit: {},
  };
}
