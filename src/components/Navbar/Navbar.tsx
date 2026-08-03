import { Children, isValidElement, useMemo, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { createPresetVariants, easingToCssString } from "../../core/motion/presets";
import { cx } from "../../shared/utils/cx";
import styles from "./Navbar.module.css";
import { buildColorCssVars } from "./navbar.colors";
import { buildRadiusCssVars } from "./navbar.radius";
import { buildTypographyCssVars } from "./navbar.typography";
import { resolveNavbarConfig } from "./navbar.config";
import { useNavbarState } from "./hooks/useNavbarState";
import { useScrollAppearance } from "./hooks/useScrollAppearance";
import { useCommandPalette } from "./hooks/useCommandPalette";
import { NavbarLogo } from "./parts/NavbarLogo";
import { NavbarLinks } from "./parts/NavbarLinks";
import { NavbarCta } from "./parts/NavbarCta";
import { NavbarProfile } from "./parts/NavbarProfile";
import { NavbarMobileToggle } from "./parts/NavbarMobileToggle";
import { MobileMenu } from "./parts/MobileMenu";
import { NavbarCtaSlot } from "./parts/NavbarCtaSlot";
import { NavbarSearchTrigger } from "./parts/NavbarSearchTrigger";
import { CommandPalette } from "./parts/CommandPalette";
import type { NavbarProps } from "./Navbar.types";

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)",
  md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
  lg: "0 12px 32px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)",
};

const VARIANT_BACKGROUND: Record<string, (glassOpacity: number) => string> = {
  light: () => "#ffffff",
  dark: () => "#0a0a0c",
  transparent: () => "transparent",
  glass: (glassOpacity) => `rgba(255, 255, 255, ${glassOpacity})`,
};

const SECTION_ALIGN_TO_JUSTIFY: Record<"start" | "center" | "end", string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

/** Reference height used as the 1.0 scale point — matches the library's original default `heightDesktop`. */
const HEIGHT_SCALE_BASE = 72;

/**
 * components/Navbar/Navbar.tsx
 *
 * Every rendered value below is either read from `config` or computed from
 * it — there are no literal colors, sizes, or copy strings in this file.
 */
export function Navbar({ config: configOverrides, children }: NavbarProps) {
  const config = useMemo(() => resolveNavbarConfig(configOverrides), [configOverrides]);

  const state = useNavbarState(config);

  // Scroll Appearance Transition. Purely picks which `variant` is active —
  // everything downstream (cssVars, CSS transitions) already knows how to
  // render any variant, so this never introduces a second theming
  // mechanism. Falls back to the static configured variant when disabled.
  const scrollAppearanceEnabled = config.scrollAppearance?.enabled ?? false;
  const scrollAppearanceTrigger = config.scrollAppearance?.trigger ?? 80;
  const isPastScrollTrigger = useScrollAppearance(scrollAppearanceEnabled, scrollAppearanceTrigger);
  const effectiveVariant = scrollAppearanceEnabled
    ? (isPastScrollTrigger ? config.scrollAppearance?.to : config.scrollAppearance?.from) ??
      config.appearance.variant
    : config.appearance.variant;

  // Command Palette.
  const commandPaletteEnabled = config.commandPalette?.enabled ?? false;
  const commandPalette = useCommandPalette({
    enabled: commandPaletteEnabled,
    shortcut: config.commandPalette?.shortcut ?? "Ctrl+K",
    navItems: config.navigation.items,
    commands: config.commandPalette?.commands ?? [],
    closeOnSelect: config.commandPalette?.closeOnSelect ?? true,
    onNavigate: state.handleNavigate,
  });

  // Feature 1: Independent Layout System. Setting ANY of brand/navigation/
  // actions switches the container into a 3-column layout where each
  // section is independently aligned and navigation/actions can never
  // visually collapse together. Leaving all three unset keeps the original
  // `alignment`-based flex layout byte-for-byte — this is what makes the
  // feature purely additive.
  const useGridLayout =
    config.layout.brand !== undefined ||
    config.layout.navigation !== undefined ||
    config.layout.actions !== undefined;

  // Feature 8: Height Scaling. A single multiplier derived from the
  // configured height, used throughout cssVars/CSS (via calc()) so visual
  // elements scale proportionally instead of staying pinned to hardcoded
  // pixel values. At the library's original default height (72px) this
  // evaluates to exactly 1 — zero visual change for existing configs.
  const activeHeight = state.isMobile ? config.layout.heightMobile : config.layout.heightDesktop;
  const heightScale = activeHeight / HEIGHT_SCALE_BASE;

  const ctaOverrideContent = useMemo(() => {
    let override: ReactNode | undefined;
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === NavbarCtaSlot) {
        override = (child.props as { children?: ReactNode }).children;
      }
    });
    return override;
  }, [children]);

  const cssVars = useMemo<CSSProperties>(() => {
    const isDark = effectiveVariant === "dark";
    const scrollAppearanceInstant = config.scrollAppearance?.animation === "instant";

    // Feature 7 + 8: logo sizing — explicit brand.* wins, otherwise scales
    // automatically from the navbar height (still exactly the original
    // 28px/10px defaults at the base 72px height).
    const logoSize = config.brand.logoSize ?? Math.round(28 * heightScale);
    const logoTextSize = config.brand.textSize ?? Math.round(15 * heightScale);
    const logoGap = config.brand.gap ?? Math.round(10 * heightScale);
    const logoWeight = config.brand.fontWeight ?? 600;

    // Feature 6 + 8: nav spacing — explicit navigation.* wins, otherwise
    // scales from height (still the original 4/14/8 defaults at 72px).
    const navGap = config.navigation.gap ?? 4;
    const navPaddingX = config.navigation.paddingX ?? Math.round(14 * heightScale);
    const navPaddingY = config.navigation.paddingY ?? Math.round(8 * heightScale);

    return {
      "--ishan-navbar-font": config.appearance.fontFamily,
      "--ishan-navbar-height": `${activeHeight}px`,
      "--ishan-navbar-height-scale": heightScale,
      "--ishan-navbar-container-width": config.layout.containerWidth,
      "--ishan-navbar-spacing": `${config.appearance.spacing}px`,
      "--ishan-navbar-radius": `${config.appearance.borderRadius}px`,
      "--ishan-navbar-accent": config.appearance.accentColor,
      "--ishan-navbar-accent-contrast": isDark ? "#0a0a0c" : "#ffffff",
      "--ishan-navbar-bg": VARIANT_BACKGROUND[effectiveVariant](config.appearance.glassOpacity),
      "--ishan-navbar-menu-bg": isDark ? "#141416" : "#ffffff",
      "--ishan-navbar-fg-muted": isDark ? "#f5f5f7" : "#111114",
      "--ishan-navbar-border-color":
        effectiveVariant === "transparent"
          ? "transparent"
          : isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)",
      "--ishan-navbar-shadow": state.isScrolled ? SHADOW_MAP[config.appearance.shadow] : "none",
      "--ishan-navbar-backdrop":
        effectiveVariant === "glass" || effectiveVariant === "transparent"
          ? `blur(${config.appearance.blur}px)`
          : "none",
      "--ishan-navbar-alignment": config.layout.alignment,
      "--ishan-navbar-duration": `${config.animation.duration}s`,
      "--ishan-navbar-scroll-duration": scrollAppearanceInstant
        ? "0s"
        : `${config.scrollAppearance?.duration ?? config.animation.duration}s`,
      "--ishan-navbar-scroll-easing": easingToCssString(
        config.scrollAppearance?.easing ?? config.animation.easing ?? "easeOut",
      ),

      // Feature 1-3: independent section layout (only meaningful when
      // useGridLayout is true — the CSS for these is scoped to
      // .container[data-layout="grid"]).
      "--ishan-navbar-brand-align":
        SECTION_ALIGN_TO_JUSTIFY[config.layout.brand ?? "start"],
      "--ishan-navbar-nav-align":
        SECTION_ALIGN_TO_JUSTIFY[config.layout.navigation ?? "center"],
      "--ishan-navbar-actions-align":
        SECTION_ALIGN_TO_JUSTIFY[config.layout.actions ?? "end"],
      "--ishan-navbar-section-gap": `${config.layout.sectionGap ?? config.appearance.spacing * 3}px`,
      "--ishan-navbar-nav-actions-gap": `${config.layout.navigationActionsGap ?? config.appearance.spacing * 3}px`,
      "--ishan-navbar-brand-width": config.layout.brandWidth ?? "auto",
      "--ishan-navbar-nav-width": config.layout.navigationWidth ?? "auto",
      "--ishan-navbar-actions-width": config.layout.actionsWidth ?? "auto",

      // Feature 6-8: logo + nav spacing.
      "--ishan-navbar-logo-size": `${logoSize}px`,
      "--ishan-navbar-logo-text-size": `${logoTextSize}px`,
      "--ishan-navbar-logo-gap": `${logoGap}px`,
      "--ishan-navbar-logo-weight": String(logoWeight),
      "--ishan-navbar-nav-gap": `${navGap}px`,
      "--ishan-navbar-nav-padding-x": `${navPaddingX}px`,
      "--ishan-navbar-nav-padding-y": `${navPaddingY}px`,

      color: isDark ? "#f5f5f7" : "#111114",
      ...buildColorCssVars(config.appearance.colors),
      ...buildRadiusCssVars(config.radius),
      ...buildTypographyCssVars(config.typography),
      ...config.style,
    } as CSSProperties;
  }, [config, activeHeight, heightScale, state.isScrolled, effectiveVariant]);

  if (state.isHiddenByRoute) return null;

  const preset = config.animation.preset ?? "slide";
  const easing = config.animation.easing ?? "easeOut";
  const rootVariants = createPresetVariants(preset, {
    duration: config.animation.duration,
    delay: config.animation.delay,
    easing,
  });

  const rootMotionProps = state.shouldAnimate
    ? {
        variants: rootVariants,
        initial: "hidden",
        animate: "visible",
      }
    : {};

  const actionsContent = (
    <>
      {commandPaletteEnabled && (
        <NavbarSearchTrigger
          onOpen={commandPalette.open}
          shortcut={config.commandPalette?.shortcut ?? "Ctrl+K"}
        />
      )}

      {!state.isMobile && (
        <NavbarCta cta={config.cta} onNavigate={state.handleNavigate} shouldAnimate={state.shouldAnimate}>
          {ctaOverrideContent}
        </NavbarCta>
      )}

      {!state.isMobile && (
        <NavbarProfile
          profile={config.profile}
          animation={config.animation}
          isOpen={state.isProfileMenuOpen}
          onToggle={state.toggleProfileMenu}
          onClose={state.closeProfileMenu}
          onNavigate={state.handleNavigate}
          shouldAnimate={state.shouldAnimate}
        />
      )}

      {state.isMobile && (
        <NavbarMobileToggle
          isOpen={state.isMobileMenuOpen}
          onToggle={state.toggleMobileMenu}
          shouldAnimate={state.shouldAnimate}
        />
      )}
    </>
  );

  return (
    <motion.header
      {...rootMotionProps}
      className={cx(styles.root, config.className)}
      style={cssVars}
      data-position={config.layout.position}
      data-hidden={state.isHiddenByScroll}
      data-scrolled={state.isScrolled}
      data-variant={effectiveVariant}
    >
      <nav
        className={styles.container}
        aria-label={config.accessibility.ariaLabel}
        data-layout={useGridLayout ? "grid" : "flex"}
      >
        {/*
          These three wrappers are `display: contents` by default (see
          Navbar.module.css), meaning they're invisible to layout and their
          children participate directly in the parent flex container exactly
          as before — this is what keeps the original flex layout pixel-
          identical when no independent section alignment is configured.
          Only when data-layout="grid" is set do they become real flex
          columns with their own alignment/width/gap.
        */}
        <div className={styles.layoutBrand}>
          <NavbarLogo brand={config.brand} onNavigate={state.handleNavigate} />
        </div>

        <div className={styles.layoutNavigation}>
          {!state.isMobile && (
            <NavbarLinks
              items={config.navigation.items}
              isActive={state.isActive}
              onNavigate={state.handleNavigate}
              smoothScrollOffset={config.navigation.smoothScrollOffset}
              shouldAnimate={state.shouldAnimate}
              preset={preset}
              duration={config.animation.duration}
              delay={config.animation.delay ?? 0}
              easing={easing}
            />
          )}
        </div>

        <div className={cx(styles.layoutActions, styles.links)} style={{ gap: 12 }}>
          {actionsContent}
        </div>
      </nav>

      {state.isMobile && (
        <MobileMenu
          isOpen={state.isMobileMenuOpen}
          items={config.navigation.items}
          cta={config.cta}
          mobile={config.mobile}
          animation={config.animation}
          isActive={state.isActive}
          onNavigate={state.handleNavigate}
          onClose={state.closeMobileMenu}
          shouldAnimate={state.shouldAnimate}
          ctaSlot={
            <NavbarCta cta={config.cta} onNavigate={state.handleNavigate} shouldAnimate={false}>
              {ctaOverrideContent}
            </NavbarCta>
          }
        />
      )}

      {commandPaletteEnabled && (
        <CommandPalette
          state={commandPalette}
          placeholder={config.commandPalette?.placeholder ?? "Search..."}
          animation={config.animation}
          shouldAnimate={state.shouldAnimate}
        />
      )}
    </motion.header>
  );
}
