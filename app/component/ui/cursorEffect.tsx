'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

const trailCount = 8;

export default function CursorEffect() {
  const [enabled, setEnabled] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const smoothX = useSpring(pointerX, { stiffness: 500, damping: 35, mass: 0.25 });
  const smoothY = useSpring(pointerY, { stiffness: 500, damping: 35, mass: 0.25 });

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(hasFinePointer);
    if (!hasFinePointer) return;

    let animationFrame = 0;
    let targetX = -100;
    let targetY = -100;
    let currentTrail = Array.from({ length: trailCount }, () => ({ x: -100, y: -100 }));

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      pointerX.set(targetX);
      pointerY.set(targetY);
    };

    const animateTrail = () => {
      currentTrail = currentTrail.map((point, index) => {
        const source = index === 0 ? { x: targetX, y: targetY } : currentTrail[index - 1];
        return {
          x: point.x + (source.x - point.x) * 0.28,
          y: point.y + (source.y - point.y) * 0.28,
        };
      });
      setTrail([...currentTrail]);
      animationFrame = window.requestAnimationFrame(animateTrail);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    animationFrame = window.requestAnimationFrame(animateTrail);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [pointerX, pointerY]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-100 overflow-hidden">
      {trail.map((point, index) => {
        const size = Math.max(4, 14 - index * 1.25);
        const opacity = Math.max(0.08, 0.42 - index * 0.045);

        return (
          <motion.span
            key={index}
            className="absolute rounded-full bg-primary-400 blur-[1px]"
            animate={{ x: point.x - size / 2, y: point.y - size / 2 }}
            style={{ width: size, height: size, opacity }}
            transition={{ duration: 0.08, ease: 'linear' }}
          />
        );
      })}
      <motion.span
        className="absolute h-4 w-4 rounded-full border border-primary-300 bg-primary-300/20 shadow-[0_0_18px_rgba(255,194,29,0.9)]"
        style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
      />
    </div>
  );
}
