import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterPosition } from '../types';

interface CharacterDotProps {
  position: CharacterPosition;
}

const DOT_RADIUS = 18;
const TOOLTIP_W = 170;

export default function CharacterDot({ position }: CharacterDotProps) {
  const [hovered, setHovered] = useState(false);
  const { x, y, offsetX, offsetY, color, name, house, locationName } = position;

  const tx = x + offsetX;
  const ty = y + offsetY;

  return (
    <motion.g
      key={position.characterId}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1, x: tx, y: ty }}
      exit={{ opacity: 0, scale: 0.2 }}
      transition={{ type: 'spring', stiffness: 130, damping: 22 }}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow ring */}
      <motion.circle
        r={DOT_RADIUS + 5}
        fill={color}
        animate={{ opacity: hovered ? 0.45 : 0.18 }}
        transition={{ duration: 0.18 }}
      />
      {/* Main dot */}
      <motion.circle
        r={DOT_RADIUS}
        fill={color}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={2.5}
        animate={{ r: hovered ? DOT_RADIUS * 1.3 : DOT_RADIUS }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        filter="url(#glow)"
      />

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.g
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            transform={`translate(${DOT_RADIUS + 8}, ${-DOT_RADIUS - 10})`}
          >
            <rect
              x={0}
              y={-40}
              width={TOOLTIP_W}
              height={56}
              rx={7}
              fill="rgba(13,17,23,0.93)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
            <line x1={0} y1={-40} x2={TOOLTIP_W} y2={-40} stroke={color} strokeWidth={2} strokeOpacity={0.8} />
            <text x={10} y={-20} fontSize={15} fill="white" fontFamily="Cinzel, serif" fontWeight={600}>
              {name}
            </text>
            <text x={10} y={-3} fontSize={12} fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
              {[house !== '—' ? house : null, locationName].filter(Boolean).join(' · ')}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.g>
  );
}
