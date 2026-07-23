import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WesterosMap from './components/WesterosMap';
import CharacterPanel from './components/CharacterPanel';
import EpisodeSlider from './components/EpisodeSlider';
import useStore from './store/useStore';
import { getPositions } from './utils/getPositions';
import { getPaths } from './utils/getPaths';
import { timelineSteps, getWindowStartIndex } from './utils/timeline';
import SpoilerOverlay from './components/SpoilerOverlay';

export default function App() {
  const { currentStepIndex, selectedCharacters, setStep, togglePlaying, spoilersRevealed, setSpoilersRevealed, trailMode, trailEpisodes } = useStore();

  const characterPositions = useMemo(
    () => getPositions(currentStepIndex, selectedCharacters),
    [currentStepIndex, selectedCharacters]
  );

  const windowStartIndex = useMemo(
    () => getWindowStartIndex(trailMode, trailEpisodes, currentStepIndex),
    [trailMode, trailEpisodes, currentStepIndex]
  );

  const paths = useMemo(
    () => getPaths(currentStepIndex, selectedCharacters, windowStartIndex),
    [currentStepIndex, selectedCharacters, windowStartIndex]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') setStep(Math.max(0, currentStepIndex - 1));
      if (e.key === 'ArrowRight') setStep(Math.min(timelineSteps.length - 1, currentStepIndex + 1));
      if (e.key === ' ') { e.preventDefault(); togglePlaying(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStepIndex, setStep, togglePlaying]);

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
            Character Tracker
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Map area */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: '#c6ecff' }}>
          <WesterosMap characterPositions={characterPositions} paths={paths} />

          <a
            href="https://github.com/nordinbelkacemi/hotd-tracker/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-7 left-7 z-20 flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm tracking-wider uppercase text-white/80 hover:text-white transition-colors"
            style={{ backgroundColor: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <svg viewBox="0 0 16 16" width={18} height={18} fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            Report Issues
          </a>
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

      {/* Full-screen click-to-reveal spoiler overlay */}
      <AnimatePresence>
        {!spoilersRevealed && (
          <SpoilerOverlay onReveal={() => setSpoilersRevealed(true)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
