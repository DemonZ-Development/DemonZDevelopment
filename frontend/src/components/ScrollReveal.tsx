import { motion } from 'framer-motion';
import { type ReactNode, type CSSProperties } from 'react';

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
  const getInitial = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: distance };
      case 'left': return { opacity: 0, x: distance };
      case 'right': return { opacity: 0, x: -distance };
      default: return { opacity: 0, y: distance };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: threshold, margin: '0px 0px -40px 0px' }}
      transition={{ duration: duration / 1000, delay: delay / 1000, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
