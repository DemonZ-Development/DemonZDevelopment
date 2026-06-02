import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Direction the element slides from. Default: 'up' */
  direction?: 'up' | 'left' | 'right';
  /** Delay in milliseconds before the animation starts. Default: 0 */
  delay?: number;
  /** Duration of the animation in milliseconds. Default: 600 */
  duration?: number;
  /** Distance in pixels the element travels. Default: 24 */
  distance?: number;
  /** IntersectionObserver threshold (0-1). Default: 0.15 */
  threshold?: number;
  /** Whether the animation should replay on re-entry. Default: false */
  once?: boolean;
  /** Optional className to apply to the wrapper */
  className?: string;
  /** Optional inline styles for the wrapper */
  style?: CSSProperties;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  distance = 24,
  threshold = 0.15,
  once = true,
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getTransform = (): string => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':    return `translate3d(0, ${distance}px, 0)`;
      case 'left':  return `translate3d(${distance}px, 0, 0)`;
      case 'right': return `translate3d(-${distance}px, 0, 0)`;
      default:      return `translate3d(0, ${distance}px, 0)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
