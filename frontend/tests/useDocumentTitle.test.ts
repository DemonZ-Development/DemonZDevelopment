import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '../src/hooks/useDocumentTitle';

describe('useDocumentTitle', () => {
  it('sets the document title to the given value', () => {
    renderHook(() => useDocumentTitle('My Page'));
    expect(document.title).toBe('My Page');
  });

  it('restores the previous title on unmount', () => {
    document.title = 'Initial';
    const { unmount } = renderHook(() => useDocumentTitle('Temporary'));
    expect(document.title).toBe('Temporary');
    unmount();
    expect(document.title).toBe('Initial');
  });

  it('updates the title when the value changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'A' },
    });
    expect(document.title).toBe('A');
    rerender({ title: 'B' });
    expect(document.title).toBe('B');
  });

  it('does not restore on unmount when restoreOnUnmount=false', () => {
    document.title = 'Before';
    const { unmount } = renderHook(() =>
      useDocumentTitle('Pinned', false),
    );
    expect(document.title).toBe('Pinned');
    unmount();
    expect(document.title).toBe('Pinned');
  });
});
