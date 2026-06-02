import { useEffect, useRef, type RefObject } from 'react';

/**
 * Trap focus inside a container while `active` is true.
 * Restores focus to the previously-focused element when deactivated.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const focusable = node.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      node.setAttribute('tabindex', '-1');
      node.focus();
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const items = node!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active]);

  return ref;
}
