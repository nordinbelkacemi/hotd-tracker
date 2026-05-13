import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { timelineSteps } from '../utils/timeline';

export default function EpisodeSlider() {
  const { currentStepIndex, isPlaying, setStep, togglePlaying } = useStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = timelineSteps[currentStepIndex] || timelineSteps[0];

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
                  i <= currentStepIndex
                    ? i === currentStepIndex
                      ? '#C4A44A'
                      : 'rgba(196,164,74,0.45)'
                    : 'rgba(255,255,255,0.12)',
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
    </div>
  );
}
