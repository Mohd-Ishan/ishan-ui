import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createFocusTrap, focusFirstElement } from "../../../core/a11y/focusTrap";
import { createPresetVariants, createStaggerContainerVariants } from "../../../core/motion/presets";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { useLockBodyScroll } from "../../../shared/hooks/useLockBodyScroll";
import styles from "../Navbar.module.css";
import { NAVBAR_IDS } from "../navbar.constants";
import type { NavbarConfig, NavItemConfig } from "../navbar.config";

export interface MobileMenuProps {
  isOpen: boolean;
  items: NavItemConfig[];
  cta: NavbarConfig["cta"];
  mobile: NavbarConfig["mobile"];
  animation: NavbarConfig["animation"];
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
  onClose: () => void;
  shouldAnimate: boolean;
  ctaSlot?: ReactNode;
}

/**
 * parts/MobileMenu.tsx
 *
 * Rendered unconditionally by Navbar.tsx; AnimatePresence handles mount/unmount
 * so exit animations run. Backdrop + panel are two separate motion elements so
 * they can have independent timing (backdrop fades, panel slides + staggers).
 * Items with a `dropdown` array render as a tap-to-expand accordion row
 * instead of a plain link — same underlying "outside click / Escape" close
 * mechanics as the desktop dropdown (see hooks/useDropdown.ts), but expressed
 * here as simple local open-state since accordion rows live inside an
 * already-modal, already-escape-handled panel.
 */
export function MobileMenu({
  isOpen,
  items,
  cta,
  mobile,
  animation,
  isActive,
  onNavigate,
  onClose,
  shouldAnimate,
  ctaSlot,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  useLockBodyScroll(isOpen);
  useClickOutside(panelRef, onClose, isOpen && mobile.closeOnOutsideClick);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && mobile.closeOnEscape) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    let releaseFocusTrap: (() => void) | undefined;
    if (panelRef.current) {
      focusFirstElement(panelRef.current);
      releaseFocusTrap = createFocusTrap(panelRef.current);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      releaseFocusTrap?.();
    };
  }, [isOpen, onClose, mobile.closeOnEscape]);

  // Collapse any open accordion whenever the whole menu closes, so it
  // doesn't reopen already-expanded next time it's shown.
  useEffect(() => {
    if (!isOpen) setOpenAccordionId(null);
  }, [isOpen]);

  const preset = animation.preset ?? "slide";
  const duration = shouldAnimate ? animation.duration : 0;
  const stagger = animation.stagger ?? animation.staggerDelay;

  const panelBase = createPresetVariants(preset, {
    duration: duration * 0.6,
    delay: animation.delay,
    easing: animation.easing,
  });
  const panelVariants = {
    hidden: panelBase.hidden,
    visible: {
      ...(panelBase.visible as object),
      transition: {
        ...((panelBase.visible as { transition?: object }).transition ?? {}),
        staggerChildren: shouldAnimate ? stagger : 0,
        delayChildren: 0.04,
      },
    },
    exit: panelBase.exit,
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const accordionVariants = createStaggerContainerVariants(0);

  function handleAccordionToggle(itemId: string) {
    setOpenAccordionId((current) => (current === itemId ? null : itemId));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.mobileBackdrop}
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={shouldAnimate ? { opacity: 0 } : undefined}
            transition={{ duration: shouldAnimate ? animation.duration * 0.4 : 0 }}
            onClick={mobile.closeOnOutsideClick ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            id={NAVBAR_IDS.mobileMenu}
            role="dialog"
            aria-modal="true"
            className={styles.mobileMenu}
            data-dock={mobile.dockPosition}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari
                VoiceOver drops the implicit "list" role once list-style:none
                is applied (see Navbar.module.css .mobileMenuList); role="list"
                is the documented workaround. */}
            <ul className={styles.mobileMenuList} role="list">
              {items.map((item) => {
                const hasDropdown = !!item.dropdown && item.dropdown.length > 0;
                const isAccordionOpen = openAccordionId === item.id;
                const active = !hasDropdown && isActive(item.path);
                const hasActiveChild = hasDropdown && item.dropdown!.some((c) => isActive(c.path));
                const isExternal = item.external ?? /^https?:\/\//.test(item.path);

                if (hasDropdown) {
                  return (
                    <motion.li key={item.id} variants={itemVariants}>
                      <button
                        type="button"
                        className={styles.mobileMenuLink}
                        data-active={hasActiveChild}
                        aria-expanded={isAccordionOpen}
                        onClick={() => handleAccordionToggle(item.id)}
                        style={{ width: "100%", justifyContent: "space-between" }}
                      >
                        {item.label}
                        <svg
                          className={styles.dropdownChevron}
                          data-open={isAccordionOpen}
                          width="12"
                          height="12"
                          viewBox="0 0 10 10"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 3.5L5 7l3.5-3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                      </button>

                      <AnimatePresence initial={false}>
                        {isAccordionOpen && (
                          <motion.ul
                            className={styles.accordionList}
                            variants={accordionVariants}
                            initial={shouldAnimate ? "hidden" : false}
                            animate="visible"
                            exit={shouldAnimate ? "hidden" : undefined}
                          >
                            {item.dropdown!.map((child) => {
                              const childActive = isActive(child.path);
                              const childExternal =
                                child.external ?? /^https?:\/\//.test(child.path);

                              return (
                                <li key={child.id}>
                                  <a
                                    href={child.path}
                                    className={styles.accordionLink}
                                    data-active={childActive}
                                    aria-current={childActive ? "page" : undefined}
                                    onClick={(event) => {
                                      if (childExternal) return;
                                      event.preventDefault();
                                      if (child.path.startsWith("#")) {
                                        onClose();
                                        requestAnimationFrame(() => {
                                          document
                                            .getElementById(child.path.replace("#", ""))
                                            ?.scrollIntoView({ behavior: "smooth" });
                                        });
                                        return;
                                      }
                                      onNavigate(child.path);
                                    }}
                                    {...(childExternal
                                      ? { target: "_blank", rel: "noreferrer" }
                                      : {})}
                                  >
                                    {child.label}
                                  </a>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                }

                return (
                  <motion.li key={item.id} variants={itemVariants}>
                    <a
                      href={item.path}
                      className={styles.mobileMenuLink}
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                      onClick={(event) => {
                        if (isExternal) return;
                        event.preventDefault();
                        if (item.path.startsWith("#")) {
                          onClose();
                          requestAnimationFrame(() => {
                            document
                              .getElementById(item.path.replace("#", ""))
                              ?.scrollIntoView({ behavior: "smooth" });
                          });
                          return;
                        }
                        onNavigate(item.path);
                      }}
                      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                );
              })}
            </ul>

            {cta.enabled && (
              <motion.div variants={itemVariants} className={styles.mobileCtaWrapper}>
                {ctaSlot}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
