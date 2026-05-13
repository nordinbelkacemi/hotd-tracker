import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterPosition } from '../types';

interface CharacterDotProps {
  position: CharacterPosition;
}

const DOT_RADIUS = 45;
const TOOLTIP_W = 1200;

export default function CharacterDot({ position }: CharacterDotProps) {
  const [hovered, setHovered] = useState(false);

  const { x, y, offsetX, offsetY, color, name, house, locationName } = position;

  const tx = x;
  const ty = y;

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
      {/* Counter-scale group: scales around origin (0,0) which is the dot center */}
      <g style={{ transform: 'scale(var(--counter-scale, 1))' }}>
        <g style={{ transform: `translate(${offsetX * 1.8}px, ${offsetY * 1.8}px)` }}>
          {/* Glow ring */}
          <motion.circle
            fill={color}
            initial={{ opacity: 0.18, r: DOT_RADIUS + 5 }}
            animate={{ opacity: hovered ? 0.45 : 0.18, r: DOT_RADIUS + 5 }}
            transition={{ duration: 0.18 }}
          />
          {/* Main dot */}
          <motion.circle
            fill={color}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={6}
            initial={{ r: DOT_RADIUS }}
            animate={{ r: hovered ? DOT_RADIUS * 1.3 : DOT_RADIUS }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          />

        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.g
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.12 }}
              transform={`translate(${DOT_RADIUS + 24}, ${-DOT_RADIUS - 30})`}
            >
              <rect
                x={0}
                y={-300}
                width={TOOLTIP_W}
                height={420}
                rx={45}
                fill="rgba(13,17,23,0.93)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={3}
              />
              <line x1={0} y1={-300} x2={TOOLTIP_W} y2={-300} stroke={color} strokeWidth={18} strokeOpacity={0.8} />
              <text x={75} y={-150} fontSize={105} fill="white" fontFamily="Cinzel, serif" fontWeight={600}>
                {name}
              </text>
              <text x={75} y={-30} fontSize={84} fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                {[house !== '—' ? house : null, locationName].filter(Boolean).join(' · ')}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
        </g>
      </g>
    </motion.g>
  );
}
