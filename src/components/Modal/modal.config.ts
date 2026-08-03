/**
 * modal.config.ts
 *
 * The single source of truth for Modal's default visual config, plus
 * the built-in preset library. Nothing here reads from or writes to
 * React state — this file is pure data.
 */

import type { ModalConfig, ModalConfigInput } from './Modal.types';

export const defaultModalConfig: ModalConfig = {
  appearance: 'solid',
  size: {
    preset: 'md',
  },
  position: 'center',
  background: {
    color: '#ffffff',
  },
  border: {
    width: 0,
    style: 'solid',
    color: 'transparent',
  },
  radius: {
    token: 'md',
  },
  shadow: {
    token: 'lg',
  },
  overlay: {
    color: '#000000',
    opacity: 0.5,
    blur: 0,
  },
  animation: {
    type: 'scale',
    duration: 200,
    easing: 'ease-out',
  },
  header: {
    visible: true,
    divider: true,
    align: 'left',
    padding: '20px 24px',
  },
  body: {
    padding: '20px 24px',
    spacing: 12,
    scrollable: true,
  },
  footer: {
    visible: true,
    divider: true,
    align: 'right',
    sticky: false,
    padding: '16px 24px',
  },
  closeButton: {
    visible: true,
    position: 'top-right',
    size: 'md',
    animation: 'none',
  },
  responsive: {
    breakpoints: { base: 0, sm: 480, md: 768, lg: 1024, xl: 1280 },
  },
  theme: {
    colorScheme: 'light',
    textColor: '#111827',
    mutedTextColor: '#6b7280',
    accentColor: '#6366f1',
  },
};

/**
 * Built-in presets. Each is a *partial* config, merged on top of
 * defaultModalConfig. Developers can add their own by passing a
 * `presets` map into resolveModalConfig, or simply passing a full
 * config object via the `config` prop instead of a preset name.
 */
export const modalPresets: Record<string, ModalConfigInput> = {
  default: {},

  minimal: {
    appearance: 'transparent',
    background: { color: '#ffffff' },
    shadow: { token: 'sm' },
    border: { width: 1, style: 'solid', color: '#e5e7eb' },
    radius: { token: 'sm' },
    header: { divider: false },
    footer: { divider: false, visible: false },
    animation: { type: 'fade', duration: 150 },
  },

  modern: {
    appearance: 'solid',
    radius: { token: 'lg' },
    shadow: { token: 'xl' },
    animation: { type: 'spring', duration: 320 },
    closeButton: { animation: 'scale' },
  },

  glass: {
    appearance: 'glass',
    background: { color: 'rgba(255,255,255,0.6)' },
    overlay: { blur: 8, opacity: 0.35 },
    border: { width: 1, style: 'solid', color: 'rgba(255,255,255,0.4)' },
    radius: { token: 'lg' },
    shadow: { token: 'lg' },
  },

  apple: {
    appearance: 'solid',
    radius: { token: 'lg' },
    shadow: { token: 'xl' },
    animation: { type: 'spring', duration: 380, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    overlay: { blur: 12, opacity: 0.25 },
  },

  material: {
    appearance: 'solid',
    radius: { token: 'sm' },
    shadow: { token: 'md' },
    animation: { type: 'scale', duration: 225, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  },

  dashboard: {
    size: { preset: 'lg' },
    header: { align: 'left', divider: true },
    footer: { align: 'space-between', sticky: true },
    radius: { token: 'md' },
  },

  gaming: {
    appearance: 'gradient',
    background: { gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' },
    theme: {
      colorScheme: 'dark',
      textColor: '#f8fafc',
      mutedTextColor: '#94a3b8',
      accentColor: '#8b5cf6',
    },
    border: { width: 1, style: 'solid', color: 'rgba(139,92,246,0.4)' },
    shadow: { token: 'xl' },
    animation: { type: 'zoom', duration: 250 },
  },

  enterprise: {
    appearance: 'solid',
    radius: { token: 'sm' },
    shadow: { token: 'sm' },
    border: { width: 1, style: 'solid', color: '#d1d5db' },
    animation: { type: 'fade', duration: 150 },
    header: { padding: '16px 20px' },
    footer: { padding: '12px 20px' },
  },
};
