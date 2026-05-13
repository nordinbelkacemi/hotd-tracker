import { useMemo, useRef } from 'react';
import type { CharacterPosition, CharacterPath } from '../types';
import CharacterDot from './CharacterDot';
import AnimatedPath from './AnimatedPath';
import westerosRaw from '../assets/westeros.svg?raw';
import locationsData from '../data/locations.json';

const SHOW_LOCATION_LABELS = true;

const VIEWBOX = '0 0 3080 4740';

// Preprocess: set dimensions to 100%, keep viewBox + preserveAspectRatio
const processedSvg = westerosRaw
  .replace(/width="[^"]*"/, 'width="100%"')
  .replace(/height="[^"]*"/, 'height="100%"')
  .replace(/<svg([^>]*)>/, (_match: string, attrs: string) => {
    if (!attrs.includes('preserveAspectRatio')) {
      return `<svg${attrs} preserveAspectRatio="xMidYMid meet">`;
    }
    return `<svg${attrs}>`;
  });

// Strip closing </svg> so we can append overlay groups
const svgOpen = processedSvg.replace(/<\/svg>\s*$/, '');

interface WesterosMapProps {
  characterPositions: CharacterPosition[];
  paths: CharacterPath[];
}

export default function WesterosMap({ characterPositions, paths }: WesterosMapProps) {
  const overlayRef = useRef<SVGSVGElement>(null);

    const svgHtml = useMemo(() => svgOpen, []);

  // Arrow marker id per color would be expensive; use a single white marker
  const arrowId = 'hotd-arrow';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Base map — inlined SVG via dangerouslySetInnerHTML */}
      <div
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgHtml + '</svg>' }}
        style={{ lineHeight: 0 }}
      />

      {/* Overlay SVG — same viewBox, perfectly aligned */}
      <svg
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-10"
        viewBox={VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker
            id={arrowId}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.5)" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Path layer */}
        <g id="path-layer">
          {paths.map((path) => (
            <AnimatedPath key={`${path.characterId}-${path.points.length}`} path={path} arrowId={arrowId} />
          ))}
        </g>

        {/* Location labels — toggle SHOW_LOCATION_LABELS to hide */}
        <g id="location-layer">
          {SHOW_LOCATION_LABELS && locationsData.map((loc) => (
            <g key={loc.id}>
              <circle cx={loc.x} cy={loc.y} r={12} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} />
              {/* Dark stroke for readability */}
              <text
                x={loc.x + 18}
                y={loc.y + 6}
                fontSize={32}
                fill="none"
                stroke="#000"
                strokeWidth={6}
                fontFamily="Cinzel, serif"
                fontWeight={600}
                style={{ pointerEvents: 'none' }}
                paintOrder="stroke"
              >
                {loc.name}
              </text>
              <text
                x={loc.x + 18}
                y={loc.y + 6}
                fontSize={32}
                fill="rgba(255,240,180,0.95)"
                fontFamily="Cinzel, serif"
                fontWeight={600}
                style={{ pointerEvents: 'none' }}
              >
                {loc.name}
              </text>
            </g>
          ))}
        </g>

        {/* Character layer */}
        <g id="character-layer">
          {characterPositions.map((pos) => (
            <CharacterDot key={pos.characterId} position={pos} />
          ))}
        </g>
      </svg>
    </div>
  );
}
