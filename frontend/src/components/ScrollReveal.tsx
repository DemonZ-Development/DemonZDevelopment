import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, type CSSProperties } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Restrained entrance animation:
 * Eliminates artificial layout jumps (distance=0 by default) and sluggish 600ms delays,
 * ensuring content feels solid, instant, and high-performance rather than a generic AI template.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 240,
  distance = 0,
  threshold = 0.05,
  once = true,
  className,
  style,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
