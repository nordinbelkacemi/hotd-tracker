import type { Episode, Movement } from '../types';
import episodesData from '../data/episodes.json';
import locationsData from '../data/locations.json';
import charactersData from '../data/characters.json';

const locMap = new Map(locationsData.map((l) => [l.id, l.name]));
const charMap = new Map(charactersData.map((c) => [c.id, c.shortName]));

export interface TimelineStep {
  index: number;
  episodeNumber: number; // Absolute episode number (S1: 1-10, S2: 11-18, S3: 19+)
  seasonNumber: number;
  relativeEpisodeNumber: number; // Episode number within the season (S1: 1-10, S2/S3: 1-8)
  title: string; // The UI label for this step
  locations: Record<string, string | null>;
  activeMovements: Movement[];
}

export function computeTimeline(episodes: Episode[]): TimelineStep[] {
  const timeline: TimelineStep[] = [];
  let index = 0;

  for (const ep of episodes) {
    // Convert initialLocations (which may contain status objects) to a simple character -> location map
    const currentLocationState: Record<string, string | null> = {};
    for (const [charId, info] of Object.entries(ep.initialLocations)) {
      if (info && typeof info === 'object') {
        currentLocationState[charId] = info.location;
      } else {
        currentLocationState[charId] = info;
      }
    }

    // S1 = eps 1-10, S2 = eps 11-18, S3 = eps 19-26
    const seasonNumber = ep.number <= 10 ? 1 : ep.number <= 18 ? 2 : 3;
    const relativeEpisodeNumber =
      ep.number <= 10 ? ep.number : ep.number <= 18 ? ep.number - 10 : ep.number - 18;

    // 1. Add the initial step for the episode
    timeline.push({
      index: index++,
      episodeNumber: ep.number,
      seasonNumber,
      relativeEpisodeNumber,
      title: `${ep.title} - Start`,
      locations: { ...currentLocationState },
      activeMovements: [],
    });

    // 2. Process each movement chronologically
    for (const mov of ep.movements) {
      for (const char of mov.characters) {
        currentLocationState[char] = mov.to;
      }
      
      const charNames = mov.characters.map(id => charMap.get(id) || id);
      const charsText = charNames.length > 2 
        ? `${charNames[0]} & others` 
        : charNames.join(' & ');
        
      const locName = mov.to ? (locMap.get(mov.to) || mov.to) : '';
      const title = mov.to 
        ? `${charsText} to ${locName}` 
        : `${charsText} leaves the board`;

      timeline.push({
        index: index++,
        episodeNumber: ep.number,
        seasonNumber,
        relativeEpisodeNumber,
        title,
        locations: { ...currentLocationState },
        activeMovements: [mov],
      });
    }
  }

  return timeline;
}

export const timelineSteps = computeTimeline(episodesData as Episode[]);
