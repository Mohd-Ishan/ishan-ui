import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";

export interface UseDropdownOptions {
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

export interface DropdownState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * hooks/useDropdown.ts
 *
 * The open/close mechanics every dropdown surface shares (outside click,
 * Escape) — reused by NavbarDropdown (desktop hover) and the mobile
 * accordion in MobileMenu, so this logic exists exactly once.
 */
export function useDropdown(options: UseDropdownOptions = {}): DropdownState {
  const { closeOnOutsideClick = true, closeOnEscape = true } = options;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen && closeOnOutsideClick);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape]);

  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen((open) => !open), []),
    containerRef,
  };
}
