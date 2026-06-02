import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../src/components/ui/Modal';

describe('Modal', () => {
  it('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Hidden">
        <p>content</p>
      </Modal>,
    );
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('renders title and children when open', () => {
    render(
      <Modal open onClose={() => {}} title="My Modal">
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>body</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>body</p>
      </Modal>,
    );
    // The backdrop is the role="presentation" element.
    const backdrop = document.querySelector('[role="presentation"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
