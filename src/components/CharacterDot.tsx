import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterPosition } from '../types';
import useStore from '../store/useStore';
import ClusterRoster, { type RosterMember } from './ClusterRoster';

interface CharacterDotProps {
  position: CharacterPosition;
  onHoverChange?: (hovered: boolean) => void;
  // True when this dot shares its location with the currently-hovered character.
  inHoveredCluster?: boolean;
  // Everyone at this dot's location — passed only to the hovered dot, to render the roster.
  clusterMembers?: RosterMember[];
  // True when this dot shares its location with others (so it never shows the solo tooltip).
  partOfCluster?: boolean;
  // 'hover' = desktop (wiki link + hover tooltip); 'tap' = touch (tap opens the info card).
  mode?: 'hover' | 'tap';
  // True when this dot is the tapped/focused entity on mobile.
  focused?: boolean;
}

const DOT_RADIUS = 50;
const HIDE_DELAY = 100;
// On mobile the full map renders in a ~390px-wide viewport, so markers are scaled up
// (~4.6× ≈ a desktop-equivalent on-screen size) and counter-scaled to stay constant
// while pinching. Keep this in sync with MOBILE_MARKER_SCALE in LocationMarker.
const MOBILE_SCALE = 4.6;

export default function CharacterDot({ position, onHoverChange, inHoveredCluster = false, clusterMembers, partOfCluster = false, mode = 'hover', focused = false }: CharacterDotProps) {
  const setFocusedEntity = useStore((s) => s.setFocusedEntity);
  const isTap = mode === 'tap';
  const [hovered, setHovered] = useState(false);
  const highlighted = hovered || inHoveredCluster || focused;
  const isCluster = !!clusterMembers && clusterMembers.length > 1;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const handleMouseEnter = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setHovered(true);
    onHoverChange?.(true);
  };

  // Linger briefly before hiding, so the list doesn't vanish the instant the cursor leaves.
  const handleMouseLeave = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setHovered(false);
      onHoverChange?.(false);
      hideTimer.current = null;
    }, HIDE_DELAY);
  };

  const { x, y, offsetX, offsetY, color, name, house, locationName, characterId, wikiUrl } = position;

  const tx = x;
  const ty = y;

  const sizeMul = isTap ? MOBILE_SCALE : 1;
  const R = DOT_RADIUS * sizeMul;
  const glowExtra = 5 * sizeMul;
  const hitRadius = R * 3;

  const houseLocationStr = [house !== '—' ? house : null, locationName].filter(Boolean).join(' · ');

  // Dynamically calculate tooltip width based on text length
  const estimatedNameWidth = name.length * 85;
  const estimatedDescWidth = houseLocationStr.length * 55;
  const maxTextWidth = Math.max(estimatedNameWidth, estimatedDescWidth);
  const tooltipWidth = Math.max(1400, 680 + maxTextWidth + 120);

  // We use ui-avatars as a clean placeholder since the user will replace them later.
  // We can format it nicely.
  const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=222222&color=ffffff&size=300&font-size=0.33`;

  // Glow ring + main dot — identical whether wrapped in a wiki link, plain, or tappable.
  const dotCore = (
    <>
      {/* Glow ring */}
      <motion.circle
        fill={color}
        initial={{ opacity: 0.18, r: R + glowExtra }}
        animate={{ opacity: highlighted ? 0.45 : 0.18, r: R + glowExtra }}
        transition={{ duration: 0.18 }}
      />
      {/* Main dot */}
      <motion.circle
        fill={color}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={6}
        initial={{ r: R }}
        animate={{ r: highlighted ? R * 1.3 : R }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      />
    </>
  );

  return (
    <motion.g
      key={characterId}
      data-character-id={characterId}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1, x: tx, y: ty }}
      exit={{ opacity: 0, scale: 0.2 }}
      transition={{ type: 'spring', stiffness: 130, damping: 22 }}
      style={{ cursor: 'pointer' }}
      onMouseEnter={isTap ? undefined : handleMouseEnter}
      onMouseLeave={isTap ? undefined : handleMouseLeave}
      onClick={isTap ? (e) => { e.stopPropagation(); setFocusedEntity({ type: 'character', id: characterId }); } : undefined}
    >
      {/* Counter-scale group: scales around origin (0,0) which is the dot center */}
      <g style={{ transform: 'scale(var(--counter-scale, 1))' }}>
        <g style={{ transform: `translate(${offsetX * 1.8}px, ${offsetY * 1.8}px)` }}>
          {isTap ? (
            <>
              {/* Generous transparent touch target */}
              <circle r={hitRadius} fill="transparent" />
              {dotCore}
            </>
          ) : wikiUrl ? (
            <a href={wikiUrl} target="_blank" rel="noopener noreferrer">
              {dotCore}
            </a>
          ) : (
            dotCore
          )}

          {/* Single-character tooltip — hover only; anchored to this marker */}
          <AnimatePresence>
            {!isTap && hovered && !partOfCluster && (
              <g transform={`translate(${DOT_RADIUS + 124}, ${-DOT_RADIUS - 30})`}>
                <motion.g
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.12 }}
                >
                  {/* Character Image clipPath */}
                  <clipPath id={`clip-${characterId}`}>
                    <rect x={60} y={-440} width={560} height={560} rx={50} />
                  </clipPath>

                  {wikiUrl ? (
                    <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="group">
                      <rect
                        x={0}
                        y={-480}
                        width={tooltipWidth}
                        height={640}
                        rx={60}
                        fill="rgba(13,17,23,0.93)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={4}
                        className="group-hover:stroke-white/30 transition-all duration-150"
                      />
                      {/* Highlight line on top */}
                      <line x1={0} y1={-480} x2={tooltipWidth} y2={-480} stroke={color} strokeWidth={24} strokeOpacity={0.8} />

                      <image
                        href={`${import.meta.env.BASE_URL}characters/${characterId}.png`}
                        x={60}
                        y={-440}
                        width={560}
                        height={560}
                        clipPath={`url(#clip-${characterId})`}
                        preserveAspectRatio="xMidYMid slice"
                        onError={(e) => {
                          // Fallback to placeholder if the image hasn't been added yet
                          e.currentTarget.setAttribute('href', placeholderUrl);
                        }}
                      />

                      {/* Text Information */}
                      <text x={680} y={-200} fontSize={140} fill="white" fontFamily="Cinzel, serif" fontWeight={600}>
                        {name}
                      </text>
                      <text x={680} y={-20} fontSize={100} fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                        {houseLocationStr}
                      </text>
                    </a>
                  ) : (
                    <>
                      <rect
                        x={0}
                        y={-480}
                        width={tooltipWidth}
                        height={640}
                        rx={60}
                        fill="rgba(13,17,23,0.93)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={4}
                      />
                      {/* Highlight line on top */}
                      <line x1={0} y1={-480} x2={tooltipWidth} y2={-480} stroke={color} strokeWidth={24} strokeOpacity={0.8} />

                      <image
                        href={`${import.meta.env.BASE_URL}characters/${characterId}.png`}
                        x={60}
                        y={-440}
                        width={560}
                        height={560}
                        clipPath={`url(#clip-${characterId})`}
                        preserveAspectRatio="xMidYMid slice"
                        onError={(e) => {
                          // Fallback to placeholder if the image hasn't been added yet
                          e.currentTarget.setAttribute('href', placeholderUrl);
                        }}
                      />

                      {/* Text Information */}
                      <text x={680} y={-200} fontSize={140} fill="white" fontFamily="Cinzel, serif" fontWeight={600}>
                        {name}
                      </text>
                      <text x={680} y={-20} fontSize={100} fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                        {houseLocationStr}
                      </text>
                    </>
                  )}
                </motion.g>
              </g>
            )}
          </AnimatePresence>
        </g>

        {/* Co-location roster — hover only. Anchored to the cluster centre (outside
            the per-marker offset group) so it stays put when moving between markers
            in the cluster. Rendered without enter/exit animation so switching
            markers doesn't replay a fade (or an overlapping-shadow flicker). */}
        {!isTap && hovered && isCluster && (
          <g transform={`translate(${DOT_RADIUS + 124}, 0)`}>
            <ClusterRoster members={clusterMembers!} locationName={locationName} />
          </g>
        )}
      </g>
    </motion.g>
  );
}
