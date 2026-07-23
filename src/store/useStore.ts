import { create } from 'zustand';
import type { AppState } from '../types';
import characters from '../data/characters.json';
import episodes from '../data/episodes.json';

const ALL_CHARACTER_IDS = new Set(characters.map((c) => c.id));
const TOTAL_EPISODES = episodes.length;

const useStore = create<AppState>((set) => ({
  selectedCharacters: ALL_CHARACTER_IDS,
  currentStepIndex: 0,
  isPlaying: false,
  spoilersRevealed: false,
  trailsEnabled: true,
  trailMode: 'all',
  trailEpisodes: 3,

  toggleCharacter: (id) =>
    set((state) => {
      const next = new Set(state.selectedCharacters);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedCharacters: next };
    }),

  selectAll: () => set({ selectedCharacters: new Set(ALL_CHARACTER_IDS) }),
  deselectAll: () => set({ selectedCharacters: new Set() }),

  setStep: (n) => set({ currentStepIndex: n }),

  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setSpoilersRevealed: (revealed) => {
    set({ spoilersRevealed: revealed });
  },

  setTrailsEnabled: (enabled) => set({ trailsEnabled: enabled }),

  setTrailMode: (mode) => set({ trailMode: mode }),

  adjustTrailEpisodes: (delta) =>
    set((state) => ({
      trailEpisodes: Math.min(TOTAL_EPISODES, Math.max(1, state.trailEpisodes + delta)),
    })),
}));

export default useStore;
