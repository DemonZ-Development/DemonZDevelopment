import type { CSSProperties, ReactNode, MouseEvent } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps a card with a Vercel-style radial spotlight that follows the cursor.
 * The wrapped element should declare `--mouse-x` and `--mouse-y` in its CSS.
 */
export function SpotlightCard({ children, className, style }: SpotlightCardProps) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
