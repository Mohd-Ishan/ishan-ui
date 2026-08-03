/**
 * Modal.tsx
 *
 * Self-contained, config-driven Modal component. Depends only on
 * `react` and `react-dom`. Every visual decision is delegated to
 * resolveModalConfig + Modal.module.css; this file is concerned only
 * with behavior: rendering, portaling, focus management, keyboard
 * handling, animation lifecycle, and scroll locking.
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import {
  buildResponsiveStyleSheet,
  getModalDataAttributes,
  getModalStyleVars,
  resolveModalConfig,
} from './resolveModalConfig';
import type { ModalProps } from './Modal.types';

type AnimState = 'closed' | 'entering-start' | 'entering' | 'open' | 'exiting-end' | 'exiting';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({
  isOpen,
  onClose,
  preset,
  config,
  title,
  subtitle,
  icon,
  footer,
  children,
  className,
  overlayClassName,
  id,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocusRef,
  finalFocusRef,
  ariaLabel,
  container,
  lockScroll = true,
  onOpened,
  onClosed,
}: ModalProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-body`;

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // `mounted` keeps the DOM node alive during the exit animation, even
  // after `isOpen` has already flipped to false.
  const [mounted, setMounted] = useState(isOpen);
  const [animState, setAnimState] = useState<AnimState>(isOpen ? 'open' : 'closed');

  const resolvedConfig = useMemo(
    () => resolveModalConfig({ preset, config }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preset, JSON.stringify(config)],
  );

  const dataAttributes = useMemo(() => getModalDataAttributes(resolvedConfig), [resolvedConfig]);
  const styleVars = useMemo(() => getModalStyleVars(resolvedConfig), [resolvedConfig]);

  const responsiveSelector = `[data-modal-instance="${baseId}"]`;
  const responsiveCss = useMemo(
    () =>
      buildResponsiveStyleSheet(
        responsiveSelector,
        {
          '--modal-width': resolvedConfig.size.width,
          '--modal-height': resolvedConfig.size.height,
          '--modal-min-width': resolvedConfig.size.minWidth,
          '--modal-max-width': resolvedConfig.size.maxWidth,
          '--modal-header-padding': resolvedConfig.header.padding,
          '--modal-body-padding': resolvedConfig.body.padding,
          '--modal-body-spacing': resolvedConfig.body.spacing,
          '--modal-footer-padding': resolvedConfig.footer.padding,
          '--modal-border-width': resolvedConfig.border.width,
        },
        resolvedConfig.responsive.breakpoints,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedConfig],
  );

  const duration = resolvedConfig.animation.duration ?? 200;

  // ---- open/close lifecycle -------------------------------------------------

  useLayoutEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
      setMounted(true);
      // Start off-state first, then flip to entering next frame so the
      // browser has a "from" value to transition away from.
      setAnimState('entering-start');
      const raf = requestAnimationFrame(() => setAnimState('entering'));
      return () => cancelAnimationFrame(raf);
    }

    if (mounted) {
      setAnimState('exiting-end');
      const raf = requestAnimationFrame(() => setAnimState('exiting'));
      return () => cancelAnimationFrame(raf);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (animState === 'entering') {
      const timer = setTimeout(() => {
        setAnimState('open');
        onOpened?.();
      }, duration);
      return () => clearTimeout(timer);
    }
    if (animState === 'exiting') {
      const timer = setTimeout(() => {
        setAnimState('closed');
        setMounted(false);
        onClosed?.();
      }, duration);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animState, duration]);

  // ---- focus management -------------------------------------------------

  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusTarget =
      initialFocusRef?.current ?? panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? panel;
    // Defer so the element is guaranteed to be painted/focusable.
    const timer = setTimeout(() => focusTarget.focus(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (mounted) return;
    const target = finalFocusRef?.current ?? previouslyFocusedRef.current;
    target?.focus?.();
  }, [mounted, finalFocusRef]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeOnEsc, onClose],
  );

  // ---- scroll lock -------------------------------------------------

  useEffect(() => {
    if (!mounted || !lockScroll) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mounted, lockScroll]);

  const handleOverlayMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  if (!mounted) return null;

  const portalTarget = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!portalTarget) return null;

  const labelProps = title
    ? { 'aria-labelledby': titleId }
    : ariaLabel
    ? { 'aria-label': ariaLabel }
    : {};

  return createPortal(
    <div
      ref={overlayRef}
      className={[styles.overlay, overlayClassName].filter(Boolean).join(' ')}
      data-position={dataAttributes['data-position']}
      data-anim-state={animState}
      onMouseDown={handleOverlayMouseDown}
    >
      {responsiveCss && <style>{responsiveCss}</style>}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-describedby={children ? descId : undefined}
        {...labelProps}
        tabIndex={-1}
        className={[styles.panel, className].filter(Boolean).join(' ')}
        data-modal-instance={baseId}
        data-appearance={dataAttributes['data-appearance']}
        data-anim-type={dataAttributes['data-anim-type']}
        data-anim-state={animState}
        data-radius-token={dataAttributes['data-radius-token']}
        data-shadow-token={dataAttributes['data-shadow-token']}
        data-color-scheme={dataAttributes['data-color-scheme']}
        style={styleVars}
        onKeyDown={handleKeyDown}
        onMouseDown={(e: ReactMouseEvent) => e.stopPropagation()}
      >
        {resolvedConfig.closeButton.visible !== false && (
          <button
            type="button"
            aria-label="Close dialog"
            className={styles.closeButton}
            data-close-position={dataAttributes['data-close-position']}
            data-close-size={dataAttributes['data-close-size']}
            data-close-anim={resolvedConfig.closeButton.animation ?? 'none'}
            onClick={onClose}
          >
            &#10005;
          </button>
        )}

        {resolvedConfig.header.visible !== false && (title || subtitle || icon) && (
          <div
            className={styles.header}
            data-header-align={dataAttributes['data-header-align']}
            data-divider={resolvedConfig.header.divider !== false ? 'true' : 'false'}
          >
            {icon && <span className={styles.headerIcon}>{icon}</span>}
            <div className={styles.headerText}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
        )}
        {!title && ariaLabel === undefined && (
          <span className={styles.srOnly} id={titleId}>
            Dialog
          </span>
        )}

        {children && (
          <div id={descId} className={styles.body} data-body-scrollable={dataAttributes['data-body-scrollable']}>
            {children}
          </div>
        )}

        {resolvedConfig.footer.visible !== false && footer && (
          <div
            className={styles.footer}
            data-footer-align={dataAttributes['data-footer-align']}
            data-footer-sticky={dataAttributes['data-footer-sticky']}
            data-divider={resolvedConfig.footer.divider !== false ? 'true' : 'false'}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    portalTarget,
  );
}

export default Modal;
