import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { timelineSteps, getWindowStartIndex } from '../utils/timeline';
import episodesData from '../data/episodes.json';

const TOTAL_EPISODES = episodesData.length;

const trailChipClass = (active: boolean) =>
  `px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
    active ? 'text-[#C4A44A] bg-[#C4A44A]/15' : 'text-white/50 hover:text-white/80'
  }`;

export default function EpisodeSlider() {
  const { currentStepIndex, isPlaying, setStep, togglePlaying, trailMode, trailEpisodes, setTrailMode, adjustTrailEpisodes } = useStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = timelineSteps[currentStepIndex] || timelineSteps[0];
  const windowStartIndex = getWindowStartIndex(trailMode, trailEpisodes, currentStepIndex);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        useStore.setState((state) => {
          if (state.currentStepIndex >= timelineSteps.length - 1) {
            clearInterval(intervalRef.current!);
            return { isPlaying: false };
          }
          return { currentStepIndex: state.currentStepIndex + 1 };
        });
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="px-4 py-4 border-t border-white/10 space-y-3 shrink-0">
      {/* Step info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#C4A44A] uppercase tracking-widest font-bold">
            Season {step.seasonNumber} • Episode {step.relativeEpisodeNumber}
          </div>
          <div className="text-sm font-medium text-white/90 leading-tight mt-0.5" style={{ fontFamily: 'Cinzel, serif' }}>
            {step.title}
          </div>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => currentStepIndex > 0 && setStep(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlaying}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                <rect x="2" y="1" width="4" height="12" rx="1" />
                <rect x="8" y="1" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white" className="ml-1">
                <path d="M3 1l10 6-10 6V1z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => currentStepIndex < timelineSteps.length - 1 && setStep(currentStepIndex + 1)}
            disabled={currentStepIndex === timelineSteps.length - 1}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Subticks / Step dots */}
      <div className="flex gap-[2px] justify-between h-2 items-center">
        {timelineSteps.map((s, i) => {
          const isEpisodeStart = s.activeMovements.length === 0;
          return (
            <button
              key={i}
              onClick={() => setStep(i)}
              title={s.title}
              className={`rounded-full transition-all cursor-pointer ${isEpisodeStart ? 'h-2 w-2' : 'h-1 flex-1'}`}
              style={{
                backgroundColor:
                  i === currentStepIndex
                    ? '#C4A44A'
                    : i > currentStepIndex
                      ? 'rgba(255,255,255,0.12)'
                      : i < windowStartIndex
                        ? 'rgba(255,255,255,0.20)'
                        : 'rgba(196,164,74,0.45)',
              }}
            />
          );
        })}
      </div>

      {/* Range slider */}
      <input
        type="range"
        min={0}
        max={timelineSteps.length - 1}
        value={currentStepIndex}
        onChange={(e) => setStep(Number(e.target.value))}
        className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer mt-2"
        style={{
          background: `linear-gradient(to right, #C4A44A ${(currentStepIndex) / (timelineSteps.length - 1) * 100}%, rgba(255,255,255,0.15) ${(currentStepIndex) / (timelineSteps.length - 1) * 100}%)`,
          accentColor: '#C4A44A',
        }}
      />

      {/* Trail window control */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/40">Trails</span>
        <div
          role="radiogroup"
          aria-label="Trail window"
          className="flex items-center gap-0.5 p-0.5 rounded-full bg-white/5 border border-white/10"
        >
          {trailMode === 'episodes' && (
            <button
              aria-label="Shorter trail"
              disabled={trailEpisodes <= 1}
              onClick={() => adjustTrailEpisodes(-1)}
              className="w-5 h-5 flex items-center justify-center rounded-full text-white/50 hover:text-white/90 hover:bg-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
          )}
          <button
            role="radio"
            aria-checked={trailMode === 'episodes'}
            onClick={() => setTrailMode('episodes')}
            title={`Trails cover the last ${trailEpisodes} episode${trailEpisodes === 1 ? '' : 's'}, ending at the current step`}
            className={trailChipClass(trailMode === 'episodes')}
          >
            {trailEpisodes} ep
          </button>
          {trailMode === 'episodes' && (
            <button
              aria-label="Longer trail"
              disabled={trailEpisodes >= TOTAL_EPISODES}
              onClick={() => adjustTrailEpisodes(1)}
              className="w-5 h-5 flex items-center justify-center rounded-full text-white/50 hover:text-white/90 hover:bg-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          )}
          <button
            role="radio"
            aria-checked={trailMode === 'season'}
            onClick={() => setTrailMode('season')}
            title="Trails since the start of the current season"
            className={trailChipClass(trailMode === 'season')}
          >
            Season
          </button>
          <button
            role="radio"
            aria-checked={trailMode === 'all'}
            onClick={() => setTrailMode('all')}
            title="Entire history"
            className={trailChipClass(trailMode === 'all')}
          >
            All
          </button>
        </div>
      </div>
    </div>
  );
}
