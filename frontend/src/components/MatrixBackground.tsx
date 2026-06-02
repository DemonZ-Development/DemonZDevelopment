import { useRef, useEffect } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

/**
 * Premium, high-performance minimal space background.
 * Uses a deep space background gradient and subtle click ripple waves.
 */
export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);

  useEffect(() => {
    const handleCanvasClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 160,
        alpha: 0.5,
        speed: 4,
      });
      if (ripplesRef.current.length > 4) {
        ripplesRef.current.shift();
      }
    };

    window.addEventListener('click', handleCanvasClick);
    return () => {
      window.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Click Ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;
        ripple.alpha -= 0.015;

        if (ripple.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(59, 130, 246, ${ripple.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (ripple.radius > 14) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${ripple.alpha * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius - 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animFrame = requestAnimationFrame(draw);
    };

    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 30% 30%, #0c0b1e 0%, #040407 60%, #010103 100%)',
      }}
    />
  );
}
