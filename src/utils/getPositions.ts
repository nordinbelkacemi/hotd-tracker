import type { CharacterPosition } from '../types';
import locationsData from '../data/locations.json';
import charactersData from '../data/characters.json';
import { timelineSteps } from './timeline';

const locationMap = new Map(locationsData.map((l) => [l.id, l]));
const characterMap = new Map(charactersData.map((c) => [c.id, c]));

const CLUSTER_RADIUS = 28;
const CLUSTER_INNER_RADIUS = 14;

export function getPositions(
  currentStepIndex: number,
  selectedCharacters: Set<string>
): CharacterPosition[] {
  const step = timelineSteps[currentStepIndex];
  if (!step) return [];

  // Group visible characters by location
  const byLocation = new Map<string, string[]>();
  for (const [charId, locId] of Object.entries(step.locations)) {
    if (!locId) continue;
    if (!selectedCharacters.has(charId)) continue;
    const existing = byLocation.get(locId) ?? [];
    existing.push(charId);
    byLocation.set(locId, existing);
  }

  const positions: CharacterPosition[] = [];

  for (const [locId, charIds] of byLocation.entries()) {
    const loc = locationMap.get(locId);
    if (!loc) continue;

    charIds.forEach((charId, i) => {
      const char = characterMap.get(charId);
      if (!char) return;

      let offsetX = 0;
      let offsetY = 0;

      if (charIds.length > 1) {
        const angle = (2 * Math.PI * i) / charIds.length - Math.PI / 2;
        const r = charIds.length <= 3 ? CLUSTER_INNER_RADIUS : CLUSTER_RADIUS;
        offsetX = Math.cos(angle) * r;
        offsetY = Math.sin(angle) * r;
      }

      positions.push({
        characterId: charId,
        locationId: locId,
        x: loc.x,
        y: loc.y,
        color: char.color,
        name: char.name,
        house: char.house,
        locationName: loc.name,
        offsetX,
        offsetY,
        wikiUrl: char.wikiUrl,
      });
    });
  }

  return positions;
}
