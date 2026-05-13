import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import WesterosMap from './components/WesterosMap';
import CharacterPanel from './components/CharacterPanel';
import EpisodeSlider from './components/EpisodeSlider';
import useStore from './store/useStore';
import { getPositions } from './utils/getPositions';
import { getPaths } from './utils/getPaths';

export default function App() {
  const { currentEpisode, selectedCharacters, setEpisode, togglePlaying } = useStore();

  const characterPositions = useMemo(
    () => getPositions(currentEpisode, selectedCharacters),
    [currentEpisode, selectedCharacters]
  );

  const paths = useMemo(
    () => getPaths(currentEpisode, selectedCharacters),
    [currentEpisode, selectedCharacters]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') setEpisode(Math.max(1, currentEpisode - 1));
      if (e.key === 'ArrowRight') setEpisode(Math.min(10, currentEpisode + 1));
      if (e.key === ' ') { e.preventDefault(); togglePlaying(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentEpisode, setEpisode, togglePlaying]);

  return (
    <motion.div
      className="w-screen h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: '#0d1117' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <header className="h-12 flex items-center px-6 shrink-0 border-b border-white/8">
        <div>
          <span
            className="text-base font-bold tracking-widest text-white/90"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            House of the Dragon
          </span>
          <span className="ml-3 text-xs text-white/35 tracking-wider uppercase">
            Season 1 · Character Tracker
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Map area */}
        <div className="flex-1 overflow-hidden relative">
          <WesterosMap characterPositions={characterPositions} paths={paths} />
        </div>

        {/* Right panel */}
        <div
          className="w-full md:w-[360px] flex flex-col shrink-0 overflow-hidden"
          style={{ backgroundColor: '#161b22', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex-1 overflow-hidden">
            <CharacterPanel />
          </div>
          <EpisodeSlider />
        </div>
      </div>
    </motion.div>
  );
}
