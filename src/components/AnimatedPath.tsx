import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { buildPathD } from '../utils/getPaths';
import type { CharacterPath } from '../types';

interface AnimatedPathProps {
  path: CharacterPath;
  arrowId: string;
}

export default function AnimatedPath({ path, arrowId }: AnimatedPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState<number | null>(null);

  const d = buildPathD(path.points);
  if (!d) return null;

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  return (
    <>
      {/* Invisible path used to measure length */}
      <path ref={pathRef} d={d} fill="none" stroke="transparent" />

      {length !== null && (
        <motion.path
          d={d}
          fill="none"
          stroke={path.color}
          strokeWidth={14}
          strokeOpacity={0.38}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={`url(#${arrowId})`}
          initial={{ strokeDashoffset: length, strokeDasharray: length }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      )}
    </>
  );
}
