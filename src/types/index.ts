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
  characters: string[];
  from: string | null;
  to: string | null;
}

export interface Episode {
  number: number;
  title: string;
  initialLocations: Record<string, string | null>;
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
  currentStepIndex: number;
  isPlaying: boolean;
  toggleCharacter: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setStep: (index: number) => void;
  togglePlaying: () => void;
}
