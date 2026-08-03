import { forwardRef, useMemo, type CSSProperties, type MouseEvent, type Ref } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import { cx } from "../../shared/utils/cx";
import styles from "./Button.module.css";
import { buildButtonColorCssVars } from "./button.colors";
import { BUTTON_SIZE_FONT_SIZE, BUTTON_SIZE_GAP, BUTTON_SIZE_PADDING } from "./button.constants";
import { resolveButtonConfig } from "./button.config";
import { buildButtonTypographyCssVars } from "./button.typography";
import { ButtonSpinner } from "./parts/ButtonSpinner";
import type { ButtonProps } from "./Button.types";

/**
 * components/Button/Button.tsx
 *
 * Renders an `<a>` when `href` is provided (and the button isn't disabled),
 * a `<button>` otherwise. Every visual value is either a resolved config
 * field or a size-driven constant — no hardcoded literals here.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      children,
      variant,
      size,
      fullWidth,
      disabled,
      loading,
      leftIcon,
      rightIcon,
      href,
      external,
      type = "button",
      onClick,
      config: configOverrides,
      className,
      style,
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    const config = useMemo(() => resolveButtonConfig(configOverrides), [configOverrides]);

    // A prop always wins over the matching config default when both are set.
    const effectiveVariant = variant ?? config.variant;
    const effectiveSize = size ?? config.size;
    const effectiveFullWidth = fullWidth ?? config.fullWidth;
    const effectiveLoading = loading ?? config.loading;
    const effectiveDisabled = (disabled ?? config.disabled) || effectiveLoading;

    const systemPrefersReducedMotion = usePrefersReducedMotion();
    const shouldAnimate =
      config.animation.enabled &&
      config.animation.reduceMotion !== "always" &&
      !(config.animation.reduceMotion === "auto" && systemPrefersReducedMotion);

    const cssVars = useMemo<CSSProperties>(() => {
      const padding = BUTTON_SIZE_PADDING[effectiveSize];
      return {
        "--ishan-button-accent": config.accentColor,
        "--ishan-button-radius": `${config.radius}px`,
        "--ishan-button-padding-x": `${padding.x}px`,
        "--ishan-button-padding-y": `${padding.y}px`,
        "--ishan-button-font-size": `${BUTTON_SIZE_FONT_SIZE[effectiveSize]}px`,
        "--ishan-button-gap": `${BUTTON_SIZE_GAP[effectiveSize]}px`,
        ...buildButtonColorCssVars(config.colors),
        ...buildButtonTypographyCssVars(config.typography),
        ...config.style,
        ...style,
      } as CSSProperties;
    }, [config, effectiveSize, style]);

    function handleClick(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
      if (effectiveDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    }

    const content = (
      <>
        {effectiveLoading ? (
          <ButtonSpinner size={effectiveSize} />
        ) : (
          leftIcon && (
            <span className={styles.icon} aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        {children !== undefined && <span className={styles.label}>{children}</span>}
        {!effectiveLoading && rightIcon && (
          <span className={styles.icon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </>
    );

    const motionProps = shouldAnimate
      ? {
          whileHover: effectiveDisabled ? undefined : { scale: 1.02 },
          whileTap: effectiveDisabled ? undefined : { scale: 0.97 },
          transition: { duration: config.animation.duration },
        }
      : {};

    const sharedClassName = cx(styles.button, className, config.className);

    if (href && !effectiveDisabled) {
      return (
        <motion.a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={sharedClassName}
          style={cssVars}
          data-variant={effectiveVariant}
          data-size={effectiveSize}
          data-full-width={effectiveFullWidth}
          data-loading={effectiveLoading}
          aria-label={ariaLabel}
          aria-busy={effectiveLoading || undefined}
          onClick={handleClick}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          {...motionProps}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        disabled={effectiveDisabled}
        className={sharedClassName}
        style={cssVars}
        data-variant={effectiveVariant}
        data-size={effectiveSize}
        data-full-width={effectiveFullWidth}
        data-loading={effectiveLoading}
        aria-label={ariaLabel}
        aria-busy={effectiveLoading || undefined}
        onClick={handleClick}
        {...motionProps}
      >
        {content}
      </motion.button>
    );
  },
);
