export interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  region: string;
}

export interface Character {
  id: string;
  name: string;
  shortName: string;
  house: string;
  faction: 'blacks' | 'greens' | 'neutral';
  color: string;
}

export interface Movement {
  character: string;
  from: string;
  to: string;
}

export interface Episode {
  number: number;
  title: string;
  characterLocations: Record<string, string | null>;
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
}

export interface CharacterPath {
  characterId: string;
  color: string;
  points: { x: number; y: number }[];
}

export interface AppState {
  selectedCharacters: Set<string>;
  currentEpisode: number;
  isPlaying: boolean;
  toggleCharacter: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setEpisode: (n: number) => void;
  togglePlaying: () => void;
}
