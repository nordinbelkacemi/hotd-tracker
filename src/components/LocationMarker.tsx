import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

interface LocationMarkerProps {
  id: string;
  name: string;
  x: number;
  y: number;
  labelDx: number;
  labelDy: number;
  importance: number;
  wikiUrl?: string;
  onHoverChange?: (hovered: boolean) => void;
  // 'hover' = desktop (wiki link + hover image); 'tap' = touch (tap opens the info card).
  mode?: 'hover' | 'tap';
  // True when this location is the tapped/focused entity on mobile.
  focused?: boolean;
}

const IMAGE_SIZE = 480;
// Markers/labels are enlarged on mobile so they read on a ~390px-wide full map, and
// counter-scaling keeps them a constant on-screen size while pinching. Keep in sync
// with MOBILE_SCALE in CharacterDot.
const MOBILE_MARKER_SCALE = 4.6;

// Sea/region labels rendered as text only — no castle marker.
const LABEL_ONLY_LOCATIONS = new Set(['stepstones', 'the-gullet']);

export default function LocationMarker({ id, name, x, y, labelDx, labelDy, importance, wikiUrl, onHoverChange, mode = 'hover', focused = false }: LocationMarkerProps) {
  const setFocusedEntity = useStore((s) => s.setFocusedEntity);
  const isTap = mode === 'tap';
  const m = isTap ? MOBILE_MARKER_SCALE : 1;
  const [hovered, setHovered] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const fillTextRef = useRef<SVGTextElement>(null);
  // Label emphasis: hover on desktop, focus (tapped) on mobile.
  const active = hovered || (isTap && focused);

  useEffect(() => {
    const measure = () => {
      if (fillTextRef.current) {
        const len = fillTextRef.current.getComputedTextLength();
        if (len > 0) setTextWidth(len);
      }
    };
    // Wait for fonts so Cinzel is used, not the fallback
    document.fonts.ready.then(measure);
  }, [name]);

  const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a1f0e&color=ffd700&size=400&font-size=0.25`;

  const focusLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocusedEntity({ type: 'location', id });
  };

  const markerCore = (
    <>
      <polygon
        points={`${x},${y - 30 * m} ${x + 25 * m},${y} ${x},${y + 30 * m} ${x - 25 * m},${y}`}
        fill="rgba(0,0,0,0.75)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={6 * m}
      />
      <circle cx={x} cy={y} r={30 * m} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth={6 * m} />
    </>
  );

  return (
    <g
      onMouseEnter={isTap ? undefined : () => { setHovered(true); onHoverChange?.(true); }}
      onMouseLeave={isTap ? undefined : () => { setHovered(false); onHoverChange?.(false); }}
      onClick={isTap ? focusLocation : undefined}
    >
      {/* Static marker */}
      {!LABEL_ONLY_LOCATIONS.has(id) && (
        <g style={{ transform: 'scale(var(--counter-scale, 1))', transformOrigin: `${x}px ${y}px`, cursor: wikiUrl || isTap ? 'pointer' : 'default' }}>
          {!isTap && wikiUrl ? (
            <a href={wikiUrl} target="_blank" rel="noopener noreferrer">
              {markerCore}
            </a>
          ) : (
            markerCore
          )}
        </g>
      )}

      {/* Interactive label */}
      <g
        className="location-label-group"
        data-importance={importance}
        data-hovered={hovered}
        style={{
          transform: 'scale(var(--counter-scale, 1))',
          transformOrigin: `${x}px ${y}px`,
          transition: 'opacity 0.2s ease-in-out',
          cursor: wikiUrl || isTap ? 'pointer' : 'default',
        }}
        onClick={isTap ? undefined : () => wikiUrl && window.open(wikiUrl, '_blank', 'noopener,noreferrer')}
      >
        <g transform={`translate(${x + labelDx * m}, ${y + labelDy * m})`}>
          {/* Text — CSS transform is more reliable than Framer Motion scale in SVG */}
          <g
            style={{
              transform: active ? 'scale(1.12)' : 'scale(1)',
              transformOrigin: '0px 0px',
              transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <text
              x={0} y={0}
              fontSize={100 * m}
              fill="none"
              stroke="#000"
              strokeWidth={15 * m}
              fontFamily="Cinzel, serif"
              fontWeight={600}
              style={{ pointerEvents: 'none' }}
              paintOrder="stroke"
            >
              {name}
            </text>
            <text
              ref={fillTextRef}
              x={0} y={0}
              fontSize={100 * m}
              fill="rgba(255,240,180,0.95)"
              fontFamily="Cinzel, serif"
              fontWeight={600}
            >
              {name}
            </text>
          </g>

          {/* Image anchored to the right end of the text — hover only */}
          <AnimatePresence>
            {!isTap && hovered && (
              <g transform={`translate(${textWidth + 40}, ${-(IMAGE_SIZE / 2) - 36})`}>
                <motion.g
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.12 }}
                >
                  <clipPath id={`clip-loc-${id}`}>
                    <rect x={100} y={0} width={IMAGE_SIZE} height={IMAGE_SIZE} rx={50} />
                  </clipPath>
                  {wikiUrl ? (
                    <a href={wikiUrl} target="_blank" rel="noopener noreferrer">
                      <image
                        href={`${import.meta.env.BASE_URL}locations/${id}.png`}
                        x={100} y={0}
                        width={IMAGE_SIZE} height={IMAGE_SIZE}
                        clipPath={`url(#clip-loc-${id})`}
                        preserveAspectRatio="xMidYMid slice"
                        onError={(e) => {
                          e.currentTarget.setAttribute('href', placeholderUrl);
                        }}
                      />
                    </a>
                  ) : (
                    <image
                      href={`${import.meta.env.BASE_URL}locations/${id}.png`}
                      x={100} y={0}
                      width={IMAGE_SIZE} height={IMAGE_SIZE}
                      clipPath={`url(#clip-loc-${id})`}
                      preserveAspectRatio="xMidYMid slice"
                      onError={(e) => {
                        e.currentTarget.setAttribute('href', placeholderUrl);
                      }}
                    />
                  )}
                </motion.g>
              </g>
            )}
          </AnimatePresence>
        </g>
      </g>
    </g>
  );
}
