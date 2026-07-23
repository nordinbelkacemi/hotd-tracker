export interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  region: string;
  importance: number;
  wikiUrl?: string;
}

export interface Character {
  id: string;
  name: string;
  shortName: string;
  house: string;
  faction: 'blacks' | 'greens' | 'neutral';
  color: string;
  wikiUrl?: string;
}

export interface Movement {
  characters: string[];
  from: string | null;
  to: string | null;
  note?: string;
}

export interface Episode {
  number: number;
  title: string;
  initialLocations: Record<
    string,
    | {
        location: string | null;
        status: string;
        note?: string;
      }
    | string
    | null
  >;
  movements: Movement[];
}

export interface CharacterPosition {
  characterId: string;
  locationId: string;
  x: number;
  y: number;
  color: string;
  name: string;
  house: string;
  locationName: string;
  offsetX: number;
  offsetY: number;
  wikiUrl?: string;
}

export interface CharacterPath {
  characterId: string;
  color: string;
  points: { x: number; y: number }[];
}

export type TrailMode = 'episodes' | 'season' | 'all';

// The dot/marker the user tapped on touch — drives the mobile info card.
export interface FocusedEntity {
  type: 'character' | 'location';
  id: string;
}

export interface AppState {
  selectedCharacters: Set<string>;
  currentStepIndex: number;
  isPlaying: boolean;
  spoilersRevealed: boolean;
  trailsEnabled: boolean;
  trailMode: TrailMode;
  trailEpisodes: number;
  focusedEntity: FocusedEntity | null;
  toggleCharacter: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setStep: (index: number) => void;
  togglePlaying: () => void;
  setSpoilersRevealed: (revealed: boolean) => void;
  setTrailsEnabled: (enabled: boolean) => void;
  setTrailMode: (mode: TrailMode) => void;
  adjustTrailEpisodes: (delta: 1 | -1) => void;
  setFocusedEntity: (entity: FocusedEntity | null) => void;
}
