import { motion } from 'framer-motion';
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
