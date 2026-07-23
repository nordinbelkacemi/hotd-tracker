import { useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { buildPathD } from '../utils/getPaths';
import type { CharacterPath } from '../types';

interface AnimatedPathProps {
  path: CharacterPath;
  // On-screen trail thickness (kept constant across zoom via counter-scale).
  width?: number;
}

export default function AnimatedPath({ path, width = 18 }: AnimatedPathProps) {
  const measureRef = useRef<SVGPathElement>(null);
  const prevLengthRef = useRef(0);
  const [anim, setAnim] = useState<{ d: string; length: number; startOffset: number; grew: boolean } | null>(null);

  const d = buildPathD(path.points);

  useLayoutEffect(() => {
    if (!d || !measureRef.current) {
      prevLengthRef.current = 0;
      setAnim(null);
      return;
    }
    const newLength = measureRef.current.getTotalLength();
    const grew = newLength > prevLengthRef.current;
    const startOffset = Math.max(0, newLength - prevLengthRef.current);
    prevLengthRef.current = newLength;
    setAnim({ d, length: newLength, startOffset, grew });
  }, [d]);

  if (!d) return null;

  return (
    <>
      {/* Invisible path used to measure length */}
      <path ref={measureRef} d={d} fill="none" stroke="transparent" />

      {anim && (
        <motion.path
          key={anim.d}
          d={anim.d}
          fill="none"
          stroke={path.color}
          strokeWidth={width}
          style={{ strokeWidth: `calc(${width}px * var(--counter-scale, 1))` }}
          strokeOpacity={0.38}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={anim.length}
          // Grown paths draw in the new leg; shrunken paths (trail window slid) crossfade instead.
          initial={anim.grew ? { strokeDashoffset: anim.startOffset, opacity: 1 } : { strokeDashoffset: 0, opacity: 0 }}
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={anim.grew ? { duration: 1.2, ease: 'easeInOut' } : { duration: 0.2 }}
        />
      )}
    </>
  );
}
