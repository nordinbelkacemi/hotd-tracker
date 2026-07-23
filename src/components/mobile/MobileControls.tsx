import useStore from '../../store/useStore';
import usePlaybackInterval from '../../hooks/usePlaybackInterval';
import { timelineSteps } from '../../utils/timeline';
import episodesData from '../../data/episodes.json';
import charactersData from '../../data/characters.json';

const TOTAL_EPISODES = episodesData.length;
const TOTAL_CHARS = charactersData.length;

const trailChipClass = (active: boolean) =>
  `px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest transition-colors ${
    active ? 'text-[#C4A44A] bg-[#C4A44A]/15' : 'text-white/50'
  }`;

interface MobileControlsProps {
  onOpenCharacters: () => void;
}

export default function MobileControls({ onOpenCharacters }: MobileControlsProps) {
  const {
    currentStepIndex, isPlaying, setStep, togglePlaying,
    trailsEnabled, trailMode, trailEpisodes, setTrailsEnabled, setTrailMode, adjustTrailEpisodes,
    selectedCharacters,
  } = useStore();

  usePlaybackInterval();

  const step = timelineSteps[currentStepIndex] || timelineSteps[0];
  const lastIndex = timelineSteps.length - 1;
  const progress = (currentStepIndex / lastIndex) * 100;

  return (
    <div
      className="absolute bottom-0 inset-x-0 z-30 px-3 pt-2.5 space-y-2.5 border-t border-white/10"
      style={{ backgroundColor: 'rgba(22,27,34,0.96)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      {/* Episode label + characters button */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] text-[#C4A44A] uppercase tracking-widest font-bold truncate">
            Season {step.seasonNumber} • Episode {step.relativeEpisodeNumber}
          </div>
          <div className="text-[13px] font-medium text-white/90 leading-tight truncate" style={{ fontFamily: 'Cinzel, serif' }}>
            {step.title}
          </div>
        </div>
        <button
          onClick={onOpenCharacters}
          className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 bg-white/8 border border-white/12 text-xs text-white/85 active:bg-white/15"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="tabular-nums">{selectedCharacters.size}/{TOTAL_CHARS}</span>
        </button>
      </div>

      {/* Transport + scrubber */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => currentStepIndex > 0 && setStep(currentStepIndex - 1)}
          disabled={currentStepIndex === 0}
          aria-label="Previous"
          className="w-9 h-9 shrink-0 rounded-full bg-white/5 active:bg-white/15 flex items-center justify-center disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={togglePlaying}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-11 h-11 shrink-0 rounded-full bg-white/12 active:bg-white/25 flex items-center justify-center"
        >
          {isPlaying ? (
            <svg width="15" height="15" viewBox="0 0 14 14" fill="white">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 14 14" fill="white" className="ml-0.5">
              <path d="M3 1l10 6-10 6V1z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => currentStepIndex < lastIndex && setStep(currentStepIndex + 1)}
          disabled={currentStepIndex === lastIndex}
          aria-label="Next"
          className="w-9 h-9 shrink-0 rounded-full bg-white/5 active:bg-white/15 flex items-center justify-center disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <input
          type="range"
          min={0}
          max={lastIndex}
          value={currentStepIndex}
          onChange={(e) => setStep(Number(e.target.value))}
          aria-label="Timeline"
          className="range-touch flex-1 h-1.5 appearance-none rounded-full outline-none"
          style={{
            background: `linear-gradient(to right, #C4A44A ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
            accentColor: '#C4A44A',
          }}
        />
      </div>

      {/* Trails */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-white/40">Trails</span>
          <button
            role="switch"
            aria-checked={trailsEnabled}
            aria-label="Toggle trails"
            onClick={() => setTrailsEnabled(!trailsEnabled)}
            className="relative w-9 h-5 rounded-full transition-colors shrink-0"
            style={{ backgroundColor: trailsEnabled ? '#C4A44A' : 'rgba(255,255,255,0.15)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: trailsEnabled ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Trail window"
          aria-disabled={!trailsEnabled}
          className={`flex items-center gap-0.5 p-0.5 rounded-full bg-white/5 border border-white/10 transition-opacity ${
            trailsEnabled ? '' : 'opacity-40 pointer-events-none'
          }`}
        >
          {trailMode === 'episodes' && (
            <button
              aria-label="Shorter trail"
              disabled={trailEpisodes <= 1}
              onClick={() => adjustTrailEpisodes(-1)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-white/50 active:bg-white/10 disabled:opacity-30"
            >
              −
            </button>
          )}
          <button
            role="radio"
            aria-checked={trailMode === 'episodes'}
            onClick={() => setTrailMode('episodes')}
            className={trailChipClass(trailMode === 'episodes')}
          >
            {trailEpisodes} ep
          </button>
          {trailMode === 'episodes' && (
            <button
              aria-label="Longer trail"
              disabled={trailEpisodes >= TOTAL_EPISODES}
              onClick={() => adjustTrailEpisodes(1)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-white/50 active:bg-white/10 disabled:opacity-30"
            >
              +
            </button>
          )}
          <button
            role="radio"
            aria-checked={trailMode === 'season'}
            onClick={() => setTrailMode('season')}
            className={trailChipClass(trailMode === 'season')}
          >
            Season
          </button>
          <button
            role="radio"
            aria-checked={trailMode === 'all'}
            onClick={() => setTrailMode('all')}
            className={trailChipClass(trailMode === 'all')}
          >
            All
          </button>
        </div>
      </div>
    </div>
  );
}
