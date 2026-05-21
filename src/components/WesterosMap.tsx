import { useMemo, useRef, useEffect, useState } from 'react';
import type { CharacterPosition, CharacterPath } from '../types';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import CharacterDot from './CharacterDot';
import AnimatedPath from './AnimatedPath';
import LocationMarker from './LocationMarker';
import westerosRaw from '../assets/westeros.svg?raw';
import locationsData from '../data/locations.json';

const VIEWBOX = '0 0 10000 6667';

const processedSvg = westerosRaw
  .replace(/width="[^"]*"/, 'width="100%"')
  .replace(/height="[^"]*"/, 'height="100%"')
  .replace(/<svg([^>]*)>/, (_match: string, attrs: string) => {
    if (!attrs.includes('preserveAspectRatio')) {
      return `<svg${attrs} preserveAspectRatio="xMaxYMid meet">`;
    }
    return `<svg${attrs}>`;
  });

interface WesterosMapProps {
  characterPositions: CharacterPosition[];
  paths: CharacterPath[];
}

export default function WesterosMap({ characterPositions, paths }: WesterosMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const [hoveredCharId, setHoveredCharId] = useState<string | null>(null);
  const [hoveredLocId, setHoveredLocId] = useState<string | null>(null);

  // We combine locations and character dots into a single flat list, sorted so that:
  // 1. Unhovered locations come first
  // 2. Unhovered characters come next
  // 3. The hovered item (character or location) is placed at the absolute end,
  //    so it is drawn on top of all other elements in the SVG.
  const sortedInteractiveItems = useMemo(() => {
    const items = [
      ...locationsData.map((loc) => ({ type: 'location' as const, id: loc.id, data: loc })),
      ...characterPositions.map((pos) => ({ type: 'character' as const, id: pos.characterId, data: pos })),
    ];

    return items.sort((a, b) => {
      const isAHovered = (a.type === 'character' && a.id === hoveredCharId) || (a.type === 'location' && a.id === hoveredLocId);
      const isBHovered = (b.type === 'character' && b.id === hoveredCharId) || (b.type === 'location' && b.id === hoveredLocId);

      if (isAHovered && !isBHovered) return 1;
      if (isBHovered && !isAHovered) return -1;

      // Keep location items before character items if neither is hovered
      if (a.type !== b.type) {
        return a.type === 'location' ? -1 : 1;
      }

      return 0;
    });
  }, [characterPositions, hoveredCharId, hoveredLocId]);

  // Stable collision-detection function — stored in a ref so effects can call it safely
  const runCollisionDetection = useRef((wrapper: HTMLDivElement) => {
    const labels = Array.from(
      wrapper.querySelectorAll('.location-label-group')
    ) as HTMLElement[];

    labels.sort((a, b) => {
      const impA = parseInt(a.dataset.importance || '0', 10);
      const impB = parseInt(b.dataset.importance || '0', 10);
      return impB - impA;
    });

    const occupied: DOMRect[] = [];
    for (const label of labels) {
      const rect = label.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      let collision = false;
      const padding = 10;

      for (const occ of occupied) {
        if (
          rect.left - padding < occ.right + padding &&
          rect.right + padding > occ.left - padding &&
          rect.top - padding < occ.bottom + padding &&
          rect.bottom + padding > occ.top - padding
        ) {
          collision = true;
          break;
        }
      }

      label.style.opacity = collision ? '0' : '1';
      if (!collision) occupied.push(rect);
    }
  }).current;

  // Google Maps zoom model — log2 space, deltaY normalized, CSS var set inline
  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const ZOOM_SPEED = 1 / 100;
    const MIN_SCALE = 1;
    const MAX_SCALE = 20;
    const MIN_ZOOM = Math.log2(MIN_SCALE);
    const MAX_ZOOM = Math.log2(MAX_SCALE);

    let collisionTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const ref = transformRef.current;
      if (!ref) return;

      const { scale, positionX, positionY } = ref.state;

      // Normalize deltaY across deltaMode variants (pixels / lines / pages)
      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= 16;
      if (e.deltaMode === 2) deltaY *= 400;

      // Move in log2 space — equal steps feel equal at every zoom level
      const currentZoom = Math.log2(scale);
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom - deltaY * ZOOM_SPEED));
      const newScale = Math.pow(2, newZoom);

      // Zoom toward the cursor position
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const ratio = newScale / scale;
      const newPositionX = mouseX - (mouseX - positionX) * ratio;
      const newPositionY = mouseY - (mouseY - positionY) * ratio;

      ref.setTransform(newPositionX, newPositionY, newScale, 0);

      // Update CSS counter-scale synchronously — no MutationObserver needed
      container.style.setProperty('--counter-scale', (1 / newScale).toString());

      // Debounce collision detection — only runs after scroll settles
      if (collisionTimer) clearTimeout(collisionTimer);
      collisionTimer = setTimeout(() => runCollisionDetection(container), 150);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
      if (collisionTimer) clearTimeout(collisionTimer);
    };
  }, [runCollisionDetection]);

  // Initial collision detection on mount
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const timer = setTimeout(() => runCollisionDetection(wrapper), 200);
    return () => clearTimeout(timer);
  }, [runCollisionDetection]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={20}
        centerOnInit={true}
        smooth={false}
        wheel={{ disabled: true }}
      >
        {(utils) => {
          transformRef.current = utils;
          return (
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', position: 'relative' }}
            >
              {/* Base map — inlined SVG */}
              <div
                className="absolute inset-0 w-full h-full"
                dangerouslySetInnerHTML={{ __html: processedSvg }}
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
                {/* Path layer */}
                <g id="path-layer">
                  {paths.map((path) => (
                    <AnimatedPath key={path.characterId} path={path} />
                  ))}
                </g>

                {/* Interactive layer - keeps locations and characters together, allowing the hovered item to be drawn on top of everything */}
                <g id="interactive-layer">
                  {sortedInteractiveItems.map((item) => {
                    if (item.type === 'location') {
                      const loc = item.data;
                      return (
                        <LocationMarker
                          key={loc.id}
                          id={loc.id}
                          name={loc.name}
                          x={loc.x}
                          y={loc.y}
                          labelDx={(loc as any).labelOffsetX ?? 45}
                          labelDy={(loc as any).labelOffsetY ?? 15}
                          importance={(loc as any).importance ?? 0}
                          wikiUrl={(loc as any).wikiUrl}
                          onHoverChange={(isHovered) => setHoveredLocId(isHovered ? loc.id : null)}
                        />
                      );
                    } else {
                      const pos = item.data;
                      return (
                        <CharacterDot
                          key={pos.characterId}
                          position={pos}
                          onHoverChange={(isHovered) => setHoveredCharId(isHovered ? pos.characterId : null)}
                        />
                      );
                    }
                  })}
                </g>
              </svg>
            </TransformComponent>
          );
        }}
      </TransformWrapper>
    </div>
  );
}