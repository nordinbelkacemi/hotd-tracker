import { useMemo, useRef, useEffect } from 'react';
import type { CharacterPosition, CharacterPath } from '../types';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import CharacterDot from './CharacterDot';
import AnimatedPath from './AnimatedPath';
import westerosRaw from '../assets/westeros.svg?raw';
import locationsData from '../data/locations.json';

const SHOW_LOCATION_LABELS = true;

const VIEWBOX = '0 0 10000 6667';

// Preprocess: set dimensions to 100%, keep viewBox + preserveAspectRatio
const processedSvg = westerosRaw
  .replace(/width="[^"]*"/, 'width="100%"')
  .replace(/height="[^"]*"/, 'height="100%"')
  .replace(/<svg([^>]*)>/, (_match: string, attrs: string) => {
    if (!attrs.includes('preserveAspectRatio')) {
      return `<svg${attrs} preserveAspectRatio="xMaxYMid meet">`;
    }
    return `<svg${attrs}>`;
  });

const svgOpen = processedSvg.replace(/<\/svg>\s*$/, '');

interface WesterosMapProps {
  characterPositions: CharacterPosition[];
  paths: CharacterPath[];
}

export default function WesterosMap({ characterPositions, paths }: WesterosMapProps) {
  const svgHtml = useMemo(() => svgOpen, []);
  const arrowId = 'hotd-arrow';
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Track the zoom scale by observing the CSS transform on TransformComponent's content div.
  // Using a CSS variable avoids expensive React re-renders during zoom/pan.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // TransformComponent renders: wrapper > content div (with CSS transform)
    const findContentDiv = () => {
      const transformWrapperEl = wrapper.querySelector('.react-transform-wrapper');
      if (!transformWrapperEl) return null;
      const contentEl = transformWrapperEl.querySelector('.react-transform-component');
      return contentEl as HTMLElement | null;
    };

    let contentDiv: HTMLElement | null = null;

    const extractScale = () => {
      if (!contentDiv) contentDiv = findContentDiv();
      if (!contentDiv) return;

      const style = contentDiv.style.transform;
      // Parse "translate(-123px, -456px) scale(2.5)"
      const scaleMatch = style.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        const scale = parseFloat(scaleMatch[1]);
        if (scale > 0 && isFinite(scale)) {
          wrapper.style.setProperty('--counter-scale', (1 / scale).toString());
        }
      }
    };

    // Use MutationObserver to watch for style changes on the content div
    const observer = new MutationObserver(() => {
      extractScale();
    });

    // We need to wait a tick for TransformComponent to mount its internal divs
    const timer = setTimeout(() => {
      contentDiv = findContentDiv();
      if (contentDiv) {
        observer.observe(contentDiv, {
          attributes: true,
          attributeFilter: ['style'],
        });
        extractScale(); // Initial read
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={20}
        centerOnInit={true}
        wheel={{ step: 0.05 }}
        smooth={false}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%', position: 'relative' }}
        >
          {/* Base map — inlined SVG */}
          <div
            className="absolute inset-0 w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgHtml + '</svg>' }}
            style={{ lineHeight: 0 }}
          />

          {/* Overlay SVG — inside TransformComponent for position tracking */}
          <svg
            className="absolute inset-0 w-full h-full z-10"
            viewBox={VIEWBOX}
            preserveAspectRatio="xMaxYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker
                id={arrowId}
                markerWidth={3}
                markerHeight={3}
                refX={2.7}
                refY={1.5}
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,3 L3,1.5 z" fill="rgba(255,255,255,0.5)" />
              </marker>
            </defs>

            {/* Path layer */}
            <g id="path-layer">
              {paths.map((path) => (
                <AnimatedPath key={path.characterId} path={path} arrowId={arrowId} />
              ))}
            </g>

            {/* Location labels */}
            <g id="location-layer">
              {SHOW_LOCATION_LABELS && locationsData.map((loc) => {
                const labelDx = (loc as any).labelOffsetX ?? 45;
                const labelDy = (loc as any).labelOffsetY ?? 15;

                return (
                  <g key={loc.id}>
                    {/* City marker — counter-scale around city center */}
                    {loc.id !== 'stepstones' && (
                      <g style={{ transform: 'scale(var(--counter-scale, 1))', transformOrigin: `${loc.x}px ${loc.y}px` }}>
                        <polygon
                          points={`${loc.x},${loc.y - 30} ${loc.x + 25},${loc.y} ${loc.x},${loc.y + 30} ${loc.x - 25},${loc.y}`}
                          fill="rgba(0,0,0,0.75)"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth={6}
                        />
                        <circle cx={loc.x} cy={loc.y} r={30} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth={6} />
                      </g>
                    )}
                    {/* Label — counter-scale around city position */}
                    <g style={{ transform: 'scale(var(--counter-scale, 1))', transformOrigin: `${loc.x}px ${loc.y}px` }}>
                      <text
                        x={loc.x + labelDx}
                        y={loc.y + labelDy}
                        fontSize={100}
                        fill="none"
                        stroke="#000"
                        strokeWidth={15}
                        fontFamily="Cinzel, serif"
                        fontWeight={600}
                        style={{ pointerEvents: 'none' }}
                        paintOrder="stroke"
                      >
                        {loc.name}
                      </text>
                      <text
                        x={loc.x + labelDx}
                        y={loc.y + labelDy}
                        fontSize={100}
                        fill="rgba(255,240,180,0.95)"
                        fontFamily="Cinzel, serif"
                        fontWeight={600}
                        style={{ pointerEvents: 'none' }}
                      >
                        {loc.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Character layer */}
            <g id="character-layer">
              {characterPositions.map((pos) => (
                <CharacterDot key={pos.characterId} position={pos} />
              ))}
            </g>
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
