import { useEffect } from 'react';

export function useDocumentTitle(title: string, restoreOnUnmount = true): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      if (restoreOnUnmount) document.title = previous;
    };
  }, [title, restoreOnUnmount]);
}
