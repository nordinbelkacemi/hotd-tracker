import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationMarkerProps {
  id: string;
  name: string;
  x: number;
  y: number;
  labelDx: number;
  labelDy: number;
  importance: number;
}

const IMAGE_SIZE = 480;

export default function LocationMarker({ id, name, x, y, labelDx, labelDy, importance }: LocationMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const fillTextRef = useRef<SVGTextElement>(null);

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

  return (
    <g>
      {/* Static marker — no hover */}
      {id !== 'stepstones' && (
        <g style={{ transform: 'scale(var(--counter-scale, 1))', transformOrigin: `${x}px ${y}px` }}>
          <polygon
            points={`${x},${y - 30} ${x + 25},${y} ${x},${y + 30} ${x - 25},${y}`}
            fill="rgba(0,0,0,0.75)"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={6}
          />
          <circle cx={x} cy={y} r={30} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth={6} />
        </g>
      )}

      {/* Interactive label */}
      <g
        className="location-label-group"
        data-importance={importance}
        style={{
          transform: 'scale(var(--counter-scale, 1))',
          transformOrigin: `${x}px ${y}px`,
          transition: 'opacity 0.2s ease-in-out',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <g transform={`translate(${x + labelDx}, ${y + labelDy})`}>
          {/* Text — CSS transform is more reliable than Framer Motion scale in SVG */}
          <g
            style={{
              transform: hovered ? 'scale(1.12)' : 'scale(1)',
              transformOrigin: '0px 0px',
              transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <text
              x={0} y={0}
              fontSize={100}
              fill="none"
              stroke="#000"
              strokeWidth={15}
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
              fontSize={100}
              fill="rgba(255,240,180,0.95)"
              fontFamily="Cinzel, serif"
              fontWeight={600}
            >
              {name}
            </text>
          </g>

          {/* Image anchored to the right end of the text, vertically centered with it */}
          <AnimatePresence>
            {hovered && (
              <g transform={`translate(${textWidth + 40}, ${-(IMAGE_SIZE / 2) - 36})`}>
                <motion.g
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.12 }}
                >
                  <clipPath id={`clip-loc-${id}`}>
                    <rect x={20} y={0} width={IMAGE_SIZE} height={IMAGE_SIZE} rx={50} />
                  </clipPath>
                  <image
                    href={`/locations/${id}.png`}
                    x={20} y={0}
                    width={IMAGE_SIZE} height={IMAGE_SIZE}
                    clipPath={`url(#clip-loc-${id})`}
                    preserveAspectRatio="xMidYMid slice"
                    onError={(e) => {
                      e.currentTarget.setAttribute('href', placeholderUrl);
                    }}
                  />
                </motion.g>
              </g>
            )}
          </AnimatePresence>
        </g>
      </g>
    </g>
  );
}
