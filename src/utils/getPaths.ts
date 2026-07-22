import type { CharacterPath } from '../types';
import locationsData from '../data/locations.json';
import charactersData from '../data/characters.json';
import { timelineSteps } from './timeline';

const locationMap = new Map(locationsData.map((l) => [l.id, l]));
const characterMap = new Map(charactersData.map((c) => [c.id, c]));

export function getPaths(
  currentStepIndex: number,
  selectedCharacters: Set<string>,
  windowStartIndex = 0
): CharacterPath[] {
  const paths: CharacterPath[] = [];

  for (const char of charactersData) {
    if (!selectedCharacters.has(char.id)) continue;

    // No dot at the playhead (dead/off-board) → no trail.
    if ((timelineSteps[currentStepIndex]?.locations[char.id] ?? null) === null) continue;

    const points: { x: number; y: number }[] = [];
    let lastLocId: string | null = null;

    for (let stepIdx = windowStartIndex; stepIdx <= currentStepIndex; stepIdx++) {
      const step = timelineSteps[stepIdx];
      if (!step) continue;

      const locId = step.locations[char.id] ?? null;
      if (!locId) continue;
      if (locId === lastLocId) continue;

      const loc = locationMap.get(locId);
      if (!loc) continue;

      points.push({ x: loc.x, y: loc.y });
      lastLocId = locId;
    }

    if (points.length >= 2) {
      paths.push({ characterId: char.id, color: characterMap.get(char.id)?.color ?? '#fff', points });
    }
  }

  return paths;
}

export function buildPathD(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    // Slight quadratic bezier curve
    const cpX = midX + (curr.y - prev.y) * 0.15;
    const cpY = midY - (curr.x - prev.x) * 0.15;
    d += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
  }

  return d;
}
