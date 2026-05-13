import { create } from 'zustand';
import type { AppState } from '../types';
import characters from '../data/characters.json';

const ALL_CHARACTER_IDS = new Set(characters.map((c) => c.id));

const useStore = create<AppState>((set) => ({
  selectedCharacters: ALL_CHARACTER_IDS,
  currentEpisode: 1,
  isPlaying: false,

  toggleCharacter: (id) =>
    set((state) => {
      const next = new Set(state.selectedCharacters);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedCharacters: next };
    }),

  selectAll: () => set({ selectedCharacters: new Set(ALL_CHARACTER_IDS) }),
  deselectAll: () => set({ selectedCharacters: new Set() }),

  setEpisode: (n) => set({ currentEpisode: n }),

  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));

export default useStore;
