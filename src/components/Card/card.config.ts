import type { CardConfig, CardPresetName, PartialCardConfig } from './Card.types';

/* ============================================================================
 * BASE / DEFAULT CONFIG
 *
 * This is the floor every card resolves against. Presets and user config
 * layer on top of this — see resolveCardConfig.ts for the merge order.
 * ==========================================================================*/

export const defaultCardConfig: CardConfig = {
  as: 'div',
  preset: 'default',

  appearance: {
    variant: 'solid',
    opacity: 1,
  },

  layout: {
    direction: 'vertical',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    width: '100%',
  },

  media: {
    type: 'image',
    position: 'top',
    fit: 'cover',
    aspectRatio: '16 / 9',
    lazy: true,
    rounded: 'none',
  },

  header: {
    divider: false,
    align: 'start',
    padding: 'md',
    sticky: false,
  },

  body: {
    padding: 'md',
    spacing: 'sm',
    scrollable: false,
    align: 'start',
  },

  footer: {
    divider: false,
    sticky: false,
    align: 'between',
    padding: 'md',
  },

  badge: {
    position: 'top-right',
    kind: 'custom',
    pulse: false,
    rounded: 'pill',
  },

  actions: {
    align: 'end',
    gap: 'sm',
    direction: 'horizontal',
    wrap: true,
  },

  background: {
    kind: 'solid',
    color: 'var(--card-bg, #ffffff)',
    opacity: 1,
    blur: 0,
    position: 'center',
    size: 'cover',
    repeat: 'no-repeat',
    attachment: 'scroll',
  },

  border: {
    width: 1,
    color: 'var(--card-border, rgba(0,0,0,0.08))',
    style: 'solid',
  },

  radius: {
    all: 'md',
  },

  shadow: {
    base: 'sm',
    hover: 'md',
  },

  hover: {
    effects: ['lift'],
    intensity: 1,
    duration: 0.25,
  },

  interaction: {
    clickable: false,
    selectable: false,
    selected: false,
    disabled: false,
    loading: false,
  },

  animation: {
    preset: 'fade',
    duration: 0.4,
    delay: 0,
    easing: [0.16, 1, 0.3, 1],
    once: true,
    viewportAmount: 0.3,
  },

  loading: {
    kind: 'skeleton',
    label: 'Loading…',
  },

  responsive: {
    breakpoints: {
      mobile: 480,
      tablet: 768,
      laptop: 1024,
      desktop: 1280,
    },
  },

  typography: {
    title: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3 },
    subtitle: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.4 },
    description: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.55 },
    body: { fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.5 },
    footer: { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4 },
    badge: { fontSize: '0.75rem', fontWeight: 600, lineHeight: 1 },
  },

  theme: {
    mode: 'light',
    variables: {},
  },

  accessibility: {
    role: 'group',
    keyboardNavigable: true,
    focusRing: true,
    respectReducedMotion: true,
  },
};

/* ============================================================================
 * PRESETS
 *
 * Each preset is a partial config layered between the default and the
 * developer's own config. Presets should only set what differs from the
 * default — resolveCardConfig deep-merges the rest.
 * ==========================================================================*/

export const cardPresets: Record<CardPresetName, PartialCardConfig> = {
  default: {},

  minimal: {
    appearance: { variant: 'transparent' },
    border: { width: 1, color: 'rgba(0,0,0,0.06)' },
    shadow: { base: 'none', hover: 'none' },
    radius: { all: 'sm' },
    hover: { effects: ['none'] },
  },

  modern: {
    appearance: { variant: 'elevated' },
    radius: { all: 'lg' },
    shadow: { base: 'md', hover: 'lg' },
    hover: { effects: ['lift', 'shadow'], intensity: 1.1 },
    animation: { preset: 'slide', duration: 0.35 },
  },

  glass: {
    appearance: { variant: 'glass' },
    background: {
      kind: 'glass',
      color: 'rgba(255,255,255,0.08)',
      blur: 16,
    },
    border: { width: 1, color: 'rgba(255,255,255,0.18)' },
    shadow: { base: 'glass', hover: 'lg' },
    radius: { all: 'lg' },
    theme: { mode: 'dark' },
  },

  product: {
    layout: { direction: 'vertical', gap: 'sm' },
    media: { position: 'top', aspectRatio: '1 / 1', fit: 'cover' },
    footer: { align: 'between', divider: true },
    hover: { effects: ['lift', 'shadow'] },
    radius: { all: 'md' },
  },

  pricing: {
    layout: { direction: 'vertical', align: 'center', gap: 'md' },
    appearance: { variant: 'outline' },
    header: { align: 'center' },
    footer: { align: 'center' },
    radius: { all: 'lg' },
    hover: { effects: ['lift', 'border-animation'] },
  },

  blog: {
    layout: { direction: 'image-top', gap: 'sm' },
    media: { aspectRatio: '16 / 9', fit: 'cover' },
    header: { align: 'start' },
    body: { spacing: 'xs' },
    typography: {
      title: { fontSize: '1.25rem', fontWeight: 700 },
      description: { fontSize: '0.875rem', lineHeight: 1.6 },
    },
  },

  dashboard: {
    appearance: { variant: 'solid' },
    layout: { direction: 'vertical', gap: 'sm' },
    body: { padding: 'sm', spacing: 'xs' },
    shadow: { base: 'sm', hover: 'sm' },
    hover: { effects: ['none'] },
    radius: { all: 'md' },
  },

  analytics: {
    appearance: { variant: 'soft' },
    layout: { direction: 'vertical', gap: 'xs' },
    typography: {
      title: { fontSize: '0.875rem', fontWeight: 500 },
      body: { fontSize: '1.75rem', fontWeight: 700 },
    },
    hover: { effects: ['none'] },
  },

  team: {
    layout: { direction: 'vertical', align: 'center' },
    media: { type: 'avatar', position: 'top', fit: 'cover' },
    header: { align: 'center' },
    body: { align: 'center' },
    radius: { all: 'lg' },
  },

  portfolio: {
    layout: { direction: 'overlay' },
    media: { position: 'background', fit: 'cover' },
    background: {
      overlay: { gradient: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)' },
    },
    theme: { mode: 'dark' },
    hover: { effects: ['scale', 'shadow'], intensity: 1.05 },
    radius: { all: 'lg' },
  },

  gaming: {
    appearance: { variant: 'gradient' },
    background: {
      kind: 'gradient',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    border: { width: 1, color: 'rgba(120,120,255,0.35)' },
    hover: { effects: ['glow', 'border-animation', 'scale'], intensity: 1.15 },
    theme: { mode: 'dark' },
    radius: { all: 'lg' },
  },

  enterprise: {
    appearance: { variant: 'outline' },
    border: { width: 1, color: 'rgba(15,23,42,0.12)' },
    shadow: { base: 'none', hover: 'sm' },
    radius: { all: 'sm' },
    hover: { effects: ['border-animation'] },
    typography: {
      title: { fontSize: '1rem', fontWeight: 600 },
    },
  },

  apple: {
    appearance: { variant: 'elevated' },
    radius: { all: 'xl' },
    shadow: { base: 'lg', hover: 'xl' },
    animation: { preset: 'spring', duration: 0.6, easing: [0.22, 1, 0.36, 1] },
    hover: { effects: ['lift', 'scale'], intensity: 1.03, duration: 0.4 },
    typography: {
      title: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em' },
      description: { fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--card-text-muted)' },
    },
  },
};
