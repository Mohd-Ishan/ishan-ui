import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  forwardRef,
  memo,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { motion, type Variants, type TargetAndTransition } from 'framer-motion';
import styles from './Card.module.css';
import { resolveCardConfig } from './resolveCardConfig';
import type {
  CardConfig,
  CardProps,
  CardMediaProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardBadgeProps,
  CardActionsProps,
  Breakpoint,
  Responsive,
  RadiusToken,
  RadiusConfig,
  ShadowToken,
  ShadowConfig,
  Size,
  TypographyStyle,
  BackgroundConfig,
  LayoutDirection,
  HoverEffect,
} from './Card.types';

/* ============================================================================
 * RESPONSIVE RESOLUTION
 *
 * Mobile-first cascade: a responsive value resolves to the entry for the
 * current breakpoint, falling back to the nearest smaller breakpoint that
 * has a value defined, and finally to the static (non-responsive) shape.
 * ==========================================================================*/

const BREAKPOINT_ORDER: Breakpoint[] = ['mobile', 'tablet', 'laptop', 'desktop'];

function useBreakpoint(
  breakpoints: Partial<Record<Breakpoint, number>> = {},
): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const mobileT = breakpoints.mobile ?? 480;
  const tabletT = breakpoints.tablet ?? 768;
  const laptopT = breakpoints.laptop ?? 1024;
  const desktopT = breakpoints.desktop ?? 1280;

  useEffect(() => {
    // Buckets are computed against the upper edge of each named range:
    //   width < mobile   -> 'mobile'
    //   width < tablet    -> 'tablet'
    //   width < laptop    -> 'laptop'
    //   width >= laptop   -> 'desktop'
    const compute = (): Breakpoint => {
      const w = window.innerWidth;
      if (w < mobileT) return 'mobile';
      if (w < tabletT) return 'tablet';
      if (w < laptopT) return 'laptop';
      return 'desktop';
    };

    const update = () => setBreakpoint(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [mobileT, tabletT, laptopT, desktopT]);

  return breakpoint;
}

/**
 * Tracks `prefers-reduced-motion` reactively (rather than reading it once
 * at mount) so the card responds if the user changes the OS setting while
 * the page is open.
 */
function usePrefersReducedMotion(enabled: boolean): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, [enabled]);

  return enabled && reduced;
}

function isResponsiveObject<T>(value: Responsive<T>): value is Partial<Record<Breakpoint, T>> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    BREAKPOINT_ORDER.some((bp) => bp in (value as object))
  );
}

function pickResponsive<T>(value: Responsive<T> | undefined, current: Breakpoint): T | undefined {
  if (value === undefined) return undefined;
  if (!isResponsiveObject(value)) return value as T;

  const idx = BREAKPOINT_ORDER.indexOf(current);
  for (let i = idx; i >= 0; i -= 1) {
    const bp = BREAKPOINT_ORDER[i];
    if (value[bp] !== undefined) return value[bp];
  }
  // Nothing at or below current — fall forward to the smallest defined value.
  for (let i = idx + 1; i < BREAKPOINT_ORDER.length; i += 1) {
    const bp = BREAKPOINT_ORDER[i];
    if (value[bp] !== undefined) return value[bp];
  }
  return undefined;
}

/* ============================================================================
 * TOKEN → CSS RESOLUTION
 * ==========================================================================*/

const RADIUS_MAP: Record<Exclude<RadiusToken, number>, string> = {
  none: '0',
  sm: 'var(--card-radius-sm)',
  md: 'var(--card-radius-md)',
  lg: 'var(--card-radius-lg)',
  xl: 'var(--card-radius-xl)',
  pill: 'var(--card-radius-pill)',
  circle: '50%',
};

function radiusToCSS(token?: RadiusToken): string | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return `${token}px`;
  return RADIUS_MAP[token];
}

function isRadiusConfigObject(v: RadiusConfig | RadiusToken | undefined): v is RadiusConfig {
  return typeof v === 'object' && v !== null;
}

/**
 * Resolves the `radius` field (either a flat token or a per-corner config)
 * into a single CSS `border-radius` shorthand string covering all 4 corners.
 */
function resolveRadius(radius: RadiusConfig | RadiusToken | undefined): string | undefined {
  if (radius === undefined) return undefined;
  if (!isRadiusConfigObject(radius)) return radiusToCSS(radius);

  const { all, topLeft, topRight, bottomRight, bottomLeft } = radius;
  const hasPerCorner = topLeft !== undefined || topRight !== undefined || bottomRight !== undefined || bottomLeft !== undefined;
  if (!hasPerCorner) return radiusToCSS(all);

  const fallback = all ?? 'none';
  return [
    radiusToCSS(topLeft ?? fallback),
    radiusToCSS(topRight ?? fallback),
    radiusToCSS(bottomRight ?? fallback),
    radiusToCSS(bottomLeft ?? fallback),
  ].join(' ');
}

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: 'var(--card-shadow-sm)',
  md: 'var(--card-shadow-md)',
  lg: 'var(--card-shadow-lg)',
  xl: 'var(--card-shadow-xl)',
  glass: 'var(--card-shadow-glass)',
};

function shadowToCSS(token?: ShadowToken): string | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'object') return token.custom;
  return SHADOW_MAP[token];
}

function isShadowConfigObject(v: ShadowConfig | ShadowToken | undefined): v is ShadowConfig {
  return typeof v === 'object' && v !== null && !('custom' in v);
}

const SIZE_MAP: Record<Exclude<Size, number>, string> = {
  xs: 'var(--card-space-xs)',
  sm: 'var(--card-space-sm)',
  md: 'var(--card-space-md)',
  lg: 'var(--card-space-lg)',
  xl: 'var(--card-space-xl)',
};

function sizeToCSS(token?: Size): string | undefined {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return `${token}px`;
  return SIZE_MAP[token];
}

/** Any CSS length is accepted as-is (px, rem, %, vw, vh, fit-content(...), etc). Bare numbers become px. */
function lengthToCSS(value?: string | number): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  stretch: 'stretch',
};

function alignToCSS(align?: string): string | undefined {
  return align ? ALIGN_MAP[align] : undefined;
}

/** Converts layout.mediaSize into a flex-basis value: fractions (0–1] become %, bare numbers become px. */
function mediaSizeToCSS(value?: string | number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  return value > 0 && value <= 1 ? `${value * 100}%` : `${value}px`;
}

const HORIZONTAL_ISH_DIRECTIONS: LayoutDirection[] = ['horizontal', 'horizontal-reverse', 'image-left', 'image-right', 'split'];

/* ============================================================================
 * TYPOGRAPHY
 * ==========================================================================*/

function typographyToStyle(t: TypographyStyle | undefined, breakpoint: Breakpoint): CSSProperties {
  if (!t) return {};
  const style: CSSProperties = {
    fontFamily: t.fontFamily,
    fontSize: lengthToCSS(pickResponsive(t.fontSize, breakpoint)),
    fontWeight: pickResponsive(t.fontWeight, breakpoint) as CSSProperties['fontWeight'],
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    color: t.color,
    textTransform: t.textTransform,
  };
  if (t.clamp) {
    style.display = '-webkit-box';
    (style as CSSProperties & { WebkitLineClamp?: number }).WebkitLineClamp = t.clamp;
    style.WebkitBoxOrient = 'vertical' as CSSProperties['WebkitBoxOrient'];
    style.overflow = 'hidden';
  }
  return style;
}

/* ============================================================================
 * ANIMATION PRESETS (Framer Motion)
 * ==========================================================================*/

function buildVariants(preset: string | undefined): Variants {
  switch (preset) {
    case 'fade':
      return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    case 'scale':
      return { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } };
    case 'lift':
      return { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
    case 'slide':
      return { hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0 } };
    case 'zoom':
      return { hidden: { opacity: 0, scale: 1.15 }, visible: { opacity: 1, scale: 1 } };
    case 'spring':
      return { hidden: { opacity: 0, y: 16, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } };
    case 'flip':
      return { hidden: { opacity: 0, rotateX: -35 }, visible: { opacity: 1, rotateX: 0 } };
    case 'rotate':
      return { hidden: { opacity: 0, rotate: -6 }, visible: { opacity: 1, rotate: 0 } };
    case 'none':
    default:
      return { hidden: {}, visible: {} };
  }
}

/**
 * `lift` / `scale` / `rotate` / `tilt` all animate `transform`. Two separate
 * CSS rules that both set `transform` can't compose — the later rule in the
 * stylesheet wins outright. Framer Motion's `whileHover` target object DOES
 * compose these (it builds one transform matrix from x/y/scale/rotate/
 * rotateX/rotateY), so those four effects are combined here into a single
 * animate target instead of living in CSS.
 */
const TRANSFORM_HOVER_EFFECTS: HoverEffect[] = ['lift', 'scale', 'rotate', 'tilt'];

function buildHoverTransform(effects: HoverEffect[], intensity: number, duration: number): TargetAndTransition | undefined {
  const active = effects.filter((e) => TRANSFORM_HOVER_EFFECTS.includes(e));
  if (active.length === 0) return undefined;

  const target: TargetAndTransition = { transition: { duration } };
  if (active.includes('lift')) target.y = -4 * intensity;
  if (active.includes('scale')) target.scale = 1 + 0.02 * intensity;
  if (active.includes('rotate')) target.rotate = 1 * intensity;
  if (active.includes('tilt')) {
    target.rotateX = -3 * intensity;
    target.rotateY = 3 * intensity;
  }
  return target;
}

/* ============================================================================
 * CONTEXT
 *
 * Shared between the root <Card> and its compound sub-components so that
 * e.g. <Card.Header /> used standalone still picks up padding/typography
 * tokens resolved on the parent config.
 * ==========================================================================*/

interface CardContextValue {
  config: CardConfig;
  breakpoint: Breakpoint;
}

const CardContext = createContext<CardContextValue | null>(null);

function useCardContext(component: string): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) {
    throw new Error(`<Card.${component} /> must be rendered inside a <Card> component.`);
  }
  return ctx;
}

/* ============================================================================
 * STYLE VARIABLE BUILDER (root)
 * ==========================================================================*/

function buildRootStyle(config: CardConfig, breakpoint: Breakpoint): CSSProperties {
  const radius = config.radius;
  const shadowBase = isShadowConfigObject(config.shadow) ? config.shadow.base : config.shadow;
  const shadowHover = isShadowConfigObject(config.shadow) ? config.shadow.hover : config.shadow;
  const border = config.border;

  const vars: Record<string, string | number | undefined> = {
    '--card-width': lengthToCSS(pickResponsive(config.layout?.width, breakpoint)),
    '--card-height': lengthToCSS(pickResponsive(config.layout?.height, breakpoint)),
    '--card-min-height': lengthToCSS(pickResponsive(config.layout?.minHeight, breakpoint)),
    '--card-min-width': lengthToCSS(pickResponsive(config.layout?.minWidth, breakpoint)),
    '--card-max-width': lengthToCSS(pickResponsive(config.layout?.maxWidth, breakpoint)),
    '--card-max-height': lengthToCSS(pickResponsive(config.layout?.maxHeight, breakpoint)),
    '--card-align-items': alignToCSS(config.layout?.align),
    '--card-justify-content': alignToCSS(config.layout?.justify),
    '--card-split-columns': config.layout?.mediaSize
      ? `${mediaSizeToCSS(pickResponsive(config.layout.mediaSize, breakpoint))} 1fr`
      : undefined,
    '--card-radius': resolveRadius(radius),
    '--card-shadow': shadowToCSS(shadowBase),
    '--card-shadow-hover': shadowToCSS(shadowHover),
    '--card-border-width': border?.width !== undefined ? `${border.width}px` : undefined,
    '--card-border-style': border?.style,
    '--card-border-color': border?.color,
    '--card-bg':
      config.background?.kind === 'gradient' || config.background?.kind === 'image' || config.background?.kind === 'video'
        ? undefined
        : config.background?.color,
    '--card-gradient': config.background?.gradient,
    '--card-blur': config.background?.blur !== undefined ? `${config.background.blur}px` : undefined,
    '--card-transition-duration': config.hover?.duration !== undefined ? `${config.hover.duration}s` : undefined,
    opacity: config.appearance?.opacity !== undefined
      ? (pickResponsive(config.appearance.opacity, breakpoint) as number)
      : undefined,
  };

  Object.entries(config.theme?.variables ?? {}).forEach(([key, value]) => {
    vars[key.startsWith('--') ? key : `--${key}`] = value;
  });

  const clean = Object.fromEntries(Object.entries(vars).filter(([, v]) => v !== undefined));

  // Per-side borders are applied as real longhand properties (not custom
  // properties) since `border-top-width` etc. can't be partially driven by
  // a single shorthand var without overriding the uniform border entirely.
  const sideOverrides: CSSProperties = {};
  (['top', 'right', 'bottom', 'left'] as const).forEach((side) => {
    const sideConfig = border?.[side];
    if (!sideConfig) return;
    const prop = `border${side.charAt(0).toUpperCase()}${side.slice(1)}` as 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
    const width = sideConfig.width !== undefined ? `${sideConfig.width}px` : (border?.width !== undefined ? `${border.width}px` : '1px');
    const styleVal = sideConfig.style ?? border?.style ?? 'solid';
    const color = sideConfig.color ?? border?.color ?? 'currentColor';
    sideOverrides[prop] = `${width} ${styleVal} ${color}`;
  });

  // layout.customTemplate is an escape hatch for `direction: 'custom'` —
  // merged last so it can override anything computed above.
  const customTemplate = config.layout?.direction === 'custom' ? config.layout?.customTemplate : undefined;

  return { ...clean, ...sideOverrides, ...customTemplate, ...config.style } as CSSProperties;
}

/* ============================================================================
 * BACKGROUND LAYER
 *
 * Renders a full-bleed image or video background behind all content,
 * completely independent from the `media` section (per spec section 3).
 * Solid/gradient/glass/transparent kinds are handled entirely through CSS
 * variables on the root (see buildRootStyle) and need no extra DOM.
 * ==========================================================================*/

function BackgroundLayer({ background }: { background?: BackgroundConfig }) {
  if (!background || (background.kind !== 'image' && background.kind !== 'video')) return null;
  if (!background.image && !background.video) return null;

  const layerStyle: CSSProperties = { opacity: background.opacity };

  return (
    <div className={styles.backgroundLayer} style={layerStyle} aria-hidden="true">
      {background.kind === 'video' && background.video ? (
        <video
          className={styles.backgroundVideo}
          src={background.video}
          autoPlay
          muted
          loop
          playsInline
          style={{ '--bg-size': background.size } as CSSProperties}
        />
      ) : (
        <div
          className={styles.backgroundImage}
          style={{
            '--bg-image': background.image ? `url(${background.image})` : undefined,
            '--bg-position': background.position,
            '--bg-size': background.size,
            '--bg-repeat': background.repeat,
            '--bg-attachment': background.attachment,
          } as CSSProperties}
        />
      )}
      {background.overlay && (
        <div
          className={styles.backgroundOverlay}
          style={{
            background: background.overlay.gradient ?? background.overlay.color,
            opacity: background.overlay.opacity,
          }}
        />
      )}
    </div>
  );
}

/* ============================================================================
 * ROOT: Card
 * ==========================================================================*/

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { config: userConfig, children, className, style },
  ref,
) {
  const config = useMemo(() => resolveCardConfig(userConfig ?? {}), [userConfig]);
  const breakpoint = useBreakpoint(config.responsive?.breakpoints);

  const direction = pickResponsive(config.layout?.direction, breakpoint);
  const isDisabled = Boolean(config.interaction?.disabled);
  const isLoading = Boolean(config.interaction?.loading);
  const isInteractive = !isDisabled && !isLoading;
  const hoverEffects = useMemo(
    () => (isInteractive ? config.hover?.effects ?? [] : []),
    [isInteractive, config.hover?.effects],
  );
  // Only the non-transform effects stay attribute-driven in CSS; transform
  // effects are composed via Framer Motion (see buildHoverTransform).
  const cssHoverEffects = useMemo(
    () => hoverEffects.filter((e) => !TRANSFORM_HOVER_EFFECTS.includes(e)),
    [hoverEffects],
  );

  const variants = useMemo(() => buildVariants(config.animation?.preset), [config.animation?.preset]);
  const prefersReducedMotion = usePrefersReducedMotion(Boolean(config.accessibility?.respectReducedMotion));

  const hoverTransform = useMemo(
    () =>
      prefersReducedMotion
        ? undefined
        : buildHoverTransform(hoverEffects, config.hover?.intensity ?? 1, config.hover?.duration ?? 0.25),
    [prefersReducedMotion, hoverEffects, config.hover?.intensity, config.hover?.duration],
  );

  const MotionTag = motion[(config.as as 'div') ?? 'div'] ?? motion.div;

  const rootStyle: CSSProperties = useMemo(
    () => ({ ...buildRootStyle(config, breakpoint), ...style }),
    [config, breakpoint, style],
  );

  const contextValue = useMemo<CardContextValue>(() => ({ config, breakpoint }), [config, breakpoint]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled || isLoading) return;
      config.interaction?.onClick?.(e);
      if (config.interaction?.selectable) {
        config.interaction?.onSelect?.(!config.interaction?.selected);
      }
    },
    [isDisabled, isLoading, config.interaction],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      config.interaction?.onKeyDown?.(e);
      if ((e.key === 'Enter' || e.key === ' ') && config.interaction?.clickable && !isDisabled && !isLoading) {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).click();
      }
    },
    [config.interaction, isDisabled, isLoading],
  );

  return (
    <CardContext.Provider value={contextValue}>
      <MotionTag
        ref={ref}
        className={[styles.card, className, config.className].filter(Boolean).join(' ')}
        style={rootStyle}
        data-direction={direction}
        data-appearance={config.appearance?.variant}
        data-hover={cssHoverEffects.join(' ')}
        data-clickable={Boolean(config.interaction?.clickable)}
        data-disabled={isDisabled}
        data-loading={isLoading}
        data-selected={Boolean(config.interaction?.selected)}
        data-focus-ring={Boolean(config.accessibility?.focusRing)}
        role={config.accessibility?.role}
        aria-label={config.accessibility?.ariaLabel}
        aria-describedby={config.accessibility?.ariaDescribedBy}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        aria-pressed={config.interaction?.selectable ? Boolean(config.interaction?.selected) : undefined}
        tabIndex={
          config.accessibility?.keyboardNavigable &&
          (config.interaction?.clickable || config.interaction?.selectable) &&
          isInteractive
            ? 0
            : undefined
        }
        onClick={config.interaction?.clickable || config.interaction?.selectable ? handleClick : undefined}
        onKeyDown={handleKeyDown}
        initial={prefersReducedMotion ? undefined : 'hidden'}
        whileInView={prefersReducedMotion ? undefined : 'visible'}
        viewport={{ once: config.animation?.once, amount: config.animation?.viewportAmount }}
        variants={prefersReducedMotion ? undefined : variants}
        transition={{
          duration: config.animation?.duration,
          delay: config.animation?.delay,
          ease: config.animation?.easing as never,
        }}
        whileHover={isInteractive ? hoverTransform : undefined}
      >
        <BackgroundLayer background={config.background} />

        {children ?? <DefaultComposition config={config} />}

        {config.badge?.content && <Badge {...config.badge} />}

        {isLoading && <LoadingOverlay {...config.loading} />}
      </MotionTag>
    </CardContext.Provider>
  );
});

/* ============================================================================
 * DEFAULT COMPOSITION
 *
 * Renders Media/Header/Body/Footer/Actions purely from config when the
 * developer did not pass explicit <Card.* /> children — this is what makes
 * the "config-only, no JSX composition required" usage pattern work.
 * ==========================================================================*/

function DefaultComposition({ config }: { config: CardConfig }) {
  const hasMedia = Boolean(config.media?.src || config.media?.node);
  const hasHeader = Boolean(config.header?.title || config.header?.subtitle || config.header?.description || config.header?.icon);
  const hasBody = Boolean(config.body?.content);
  const hasActions = Boolean(config.actions?.items);
  const hasFooter = Boolean(config.footer?.buttons || config.footer?.links || config.footer?.actions);

  return (
    <>
      {hasMedia && <Media {...config.media} />}
      {hasHeader && <Header {...config.header} />}
      {hasBody && <Body {...config.body} />}
      {hasActions && <Actions {...config.actions} />}
      {hasFooter && <Footer {...config.footer} />}
    </>
  );
}

/* ============================================================================
 * SUB-COMPONENT: Media
 * ==========================================================================*/

const Media = memo(function Media(props: CardMediaProps) {
  const { config, breakpoint } = useCardContext('Media');
  const merged = { ...config.media, ...props };

  const direction = pickResponsive(config.layout?.direction, breakpoint);
  const isHorizontalish = direction ? HORIZONTAL_ISH_DIRECTIONS.includes(direction) : false;
  const flexBasis = isHorizontalish ? mediaSizeToCSS(pickResponsive(config.layout?.mediaSize, breakpoint)) : undefined;

  const style: CSSProperties = {
    '--media-width': lengthToCSS(pickResponsive(merged.width, breakpoint)),
    '--media-height': lengthToCSS(pickResponsive(merged.height, breakpoint)),
    '--media-aspect-ratio': merged.aspectRatio,
    '--media-fit': merged.fit,
    '--media-radius': radiusToCSS(merged.rounded),
    flex: flexBasis ? `0 0 ${flexBasis}` : undefined,
  } as CSSProperties;

  const content = merged.node ? (
    merged.node
  ) : merged.type === 'video' ? (
    <video
      className={styles.mediaImg}
      src={merged.src}
      autoPlay
      muted
      loop
      playsInline
      aria-label={merged.alt}
    />
  ) : merged.src ? (
    <img
      className={styles.mediaImg}
      src={merged.src}
      alt={merged.alt ?? ''}
      loading={merged.lazy === false ? 'eager' : 'lazy'}
    />
  ) : null;

  return (
    <div
      className={[styles.media, props.className].filter(Boolean).join(' ')}
      style={style}
      data-position={merged.position}
      data-type={merged.type}
    >
      {content}
      {merged.overlay && (
        <div
          className={styles.mediaOverlay}
          style={{
            background: merged.overlay.gradient ?? merged.overlay.color,
            opacity: merged.overlay.opacity,
          }}
        />
      )}
      {props.children}
    </div>
  );
});

/* ============================================================================
 * SUB-COMPONENT: Header
 * ==========================================================================*/

const Header = memo(function Header(props: CardHeaderProps) {
  const { config, breakpoint } = useCardContext('Header');
  const merged = { ...config.header, ...props };
  const typography = config.typography;

  const style: CSSProperties = {
    '--section-padding': sizeToCSS(pickResponsive(merged.padding, breakpoint)),
    // 'start' keeps the CSS default (space-between: text left, actions right).
    justifyContent: merged.align === 'center' ? 'center' : merged.align === 'end' ? 'flex-end' : undefined,
  } as CSSProperties;

  return (
    <>
      <div
        className={[styles.header, props.className].filter(Boolean).join(' ')}
        style={style}
        data-sticky={merged.sticky}
      >
        {merged.icon}
        <div className={styles.headerText} style={{ alignItems: merged.align === 'center' ? 'center' : merged.align === 'end' ? 'flex-end' : undefined }}>
          {merged.title && <h3 className={styles.title} style={typographyToStyle(typography?.title, breakpoint)}>{merged.title}</h3>}
          {merged.subtitle && <p className={styles.subtitle} style={typographyToStyle(typography?.subtitle, breakpoint)}>{merged.subtitle}</p>}
          {merged.description && <p className={styles.description} style={typographyToStyle(typography?.description, breakpoint)}>{merged.description}</p>}
          {props.children}
        </div>
        {merged.badge}
        {merged.actions}
      </div>
      {merged.divider && <hr className={styles.headerDivider} />}
    </>
  );
});

/* ============================================================================
 * SUB-COMPONENT: Body
 * ==========================================================================*/

const Body = memo(function Body(props: CardBodyProps) {
  const { config, breakpoint } = useCardContext('Body');
  const merged = { ...config.body, ...props };
  const typography = config.typography;

  const style: CSSProperties = {
    '--section-padding': sizeToCSS(pickResponsive(merged.padding, breakpoint)),
    '--section-gap': sizeToCSS(pickResponsive(merged.spacing, breakpoint)),
    '--body-max-height': lengthToCSS(pickResponsive(merged.maxHeight, breakpoint)),
    alignItems: merged.align === 'center' ? 'center' : merged.align === 'end' ? 'flex-end' : undefined,
    ...typographyToStyle(typography?.body, breakpoint),
  } as CSSProperties;

  return (
    <div
      className={[styles.body, props.className].filter(Boolean).join(' ')}
      style={style}
      data-scrollable={Boolean(merged.scrollable)}
    >
      {merged.content}
      {props.children}
    </div>
  );
});

/* ============================================================================
 * SUB-COMPONENT: Footer
 *
 * `buttons`/`links` group together on the leading edge, `actions` groups on
 * the trailing edge — this fixes the previous bug where every footer item
 * was a flat flex sibling, so `align: 'between'` spread individual buttons
 * apart instead of treating "left content" vs "right content" as groups.
 * ==========================================================================*/

const Footer = memo(function Footer(props: CardFooterProps) {
  const { config, breakpoint } = useCardContext('Footer');
  const merged = { ...config.footer, ...props };
  const typography = config.typography;

  const style: CSSProperties = {
    '--section-padding': sizeToCSS(pickResponsive(merged.padding, breakpoint)),
    '--footer-justify': alignToCSS(merged.align),
    ...typographyToStyle(typography?.footer, breakpoint),
  } as CSSProperties;

  const hasStart = Boolean(merged.buttons || merged.links);
  const hasEnd = Boolean(merged.actions);

  return (
    <>
      {merged.divider && <hr className={styles.footerDivider} />}
      <div
        className={[styles.footer, props.className].filter(Boolean).join(' ')}
        style={style}
        data-sticky={merged.sticky}
        data-align={merged.align}
      >
        {hasStart && (
          <div className={styles.footerStart}>
            {merged.buttons}
            {merged.links}
          </div>
        )}
        {hasEnd && <div className={styles.footerEnd}>{merged.actions}</div>}
        {props.children}
      </div>
    </>
  );
});

/* ============================================================================
 * SUB-COMPONENT: Badge
 * ==========================================================================*/

const Badge = memo(function Badge(props: CardBadgeProps) {
  return (
    <span
      className={[styles.badge, props.pulse && styles.badgePulse, props.className].filter(Boolean).join(' ')}
      data-position={props.position ?? 'top-right'}
      data-kind={props.kind}
      style={{
        '--badge-bg': props.background,
        '--badge-color': props.color,
        borderRadius: radiusToCSS(props.rounded) ?? undefined,
      } as CSSProperties}
    >
      {props.icon}
      {props.content}
      {props.children}
    </span>
  );
});

/* ============================================================================
 * SUB-COMPONENT: Actions
 * ==========================================================================*/

const Actions = memo(function Actions(props: CardActionsProps) {
  const { breakpoint } = useCardContext('Actions');

  const style: CSSProperties = {
    '--actions-gap': sizeToCSS(pickResponsive(props.gap, breakpoint)),
    '--actions-justify': alignToCSS(props.align),
  } as CSSProperties;

  return (
    <div
      className={[styles.actions, props.className].filter(Boolean).join(' ')}
      style={style}
      data-direction={props.direction ?? 'horizontal'}
      data-wrap={Boolean(props.wrap)}
    >
      {props.items}
      {props.children}
    </div>
  );
});

/* ============================================================================
 * LOADING OVERLAY / SKELETON
 * ==========================================================================*/

function LoadingOverlay(props: { kind?: string; node?: ReactNode; label?: string }) {
  if (props.kind === 'custom' && props.node) {
    return <>{props.node}</>;
  }

  if (props.kind === 'skeleton') {
    return (
      <div className={styles.skeleton} aria-hidden="true">
        <div className={styles.skeletonBlock} style={{ height: 120 }} />
        <div className={styles.skeletonBlock} style={{ height: 16, width: '70%' }} />
        <div className={styles.skeletonBlock} style={{ height: 12, width: '40%' }} />
      </div>
    );
  }

  return (
    <div className={styles.loadingOverlay} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span>{props.label ?? 'Loading…'}</span>
    </div>
  );
}

/* ============================================================================
 * PUBLIC COMPOUND API
 * ==========================================================================*/

export const Card = Object.assign(CardRoot, {
  Media,
  Header,
  Body,
  Footer,
  Badge,
  Actions,
});

export default Card;
