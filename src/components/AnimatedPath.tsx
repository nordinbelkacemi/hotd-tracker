import { useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { buildPathD } from '../utils/getPaths';
import type { CharacterPath } from '../types';

interface AnimatedPathProps {
  path: CharacterPath;
  arrowId: string;
  strokeScale: number;
}

export default function AnimatedPath({ path, arrowId, strokeScale }: AnimatedPathProps) {
  const measureRef = useRef<SVGPathElement>(null);
  const prevLengthRef = useRef(0);
  const [anim, setAnim] = useState<{ d: string; length: number; startOffset: number } | null>(null);

  const d = buildPathD(path.points);

  useLayoutEffect(() => {
    if (!d || !measureRef.current) {
      prevLengthRef.current = 0;
      setAnim(null);
      return;
    }
    const newLength = measureRef.current.getTotalLength();
    const startOffset = Math.max(0, newLength - prevLengthRef.current);
    prevLengthRef.current = newLength;
    setAnim({ d, length: newLength, startOffset });
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
          strokeWidth={35 * strokeScale}
          strokeOpacity={0.38}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={`url(#${arrowId})`}
          strokeDasharray={anim.length}
          initial={{ strokeDashoffset: anim.startOffset }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      )}
    </>
  );
}
