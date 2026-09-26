import { useEffect, useRef, type RefObject } from 'react';


export function useRestoreFocus<T extends HTMLElement>(
  isOpen: boolean,
  triggerRef: RefObject<T | null>,
): void {
  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      triggerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen, triggerRef]);
}
