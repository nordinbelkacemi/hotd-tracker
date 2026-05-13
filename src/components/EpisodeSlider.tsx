import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import episodes from '../data/episodes.json';

export default function EpisodeSlider() {
  const { currentEpisode, isPlaying, setEpisode, togglePlaying } = useStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ep = episodes.find((e) => e.number === currentEpisode)!;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        useStore.setState((state) => {
          if (state.currentEpisode >= 10) {
            clearInterval(intervalRef.current!);
            return { isPlaying: false };
          }
          return { currentEpisode: state.currentEpisode + 1 };
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
      {/* Episode info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Episode {currentEpisode}</div>
          <div className="text-sm font-medium text-white/90 leading-tight mt-0.5" style={{ fontFamily: 'Cinzel, serif' }}>
            {ep.title}
          </div>
        </div>
        {/* Play/Pause */}
        <button
          onClick={togglePlaying}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M3 1l10 6-10 6V1z" />
            </svg>
          )}
        </button>
      </div>

      {/* Episode dots */}
      <div className="flex gap-1.5 justify-between">
        {episodes.map((e) => (
          <button
            key={e.number}
            onClick={() => setEpisode(e.number)}
            title={`E${e.number}: ${e.title}`}
            className="flex-1 h-1.5 rounded-full transition-all cursor-pointer"
            style={{
              backgroundColor:
                e.number <= currentEpisode
                  ? e.number === currentEpisode
                    ? '#C4A44A'
                    : 'rgba(196,164,74,0.45)'
                  : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>

      {/* Range slider */}
      <input
        type="range"
        min={1}
        max={10}
        value={currentEpisode}
        onChange={(e) => setEpisode(Number(e.target.value))}
        className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #C4A44A ${(currentEpisode - 1) / 9 * 100}%, rgba(255,255,255,0.15) ${(currentEpisode - 1) / 9 * 100}%)`,
          accentColor: '#C4A44A',
        }}
      />

      {/* Episode numbers */}
      <div className="flex justify-between">
        {episodes.map((e) => (
          <button
            key={e.number}
            onClick={() => setEpisode(e.number)}
            className="text-[10px] transition-colors cursor-pointer w-5 text-center"
            style={{
              color: e.number === currentEpisode ? '#C4A44A' : 'rgba(255,255,255,0.25)',
              fontWeight: e.number === currentEpisode ? 700 : 400,
            }}
          >
            {e.number}
          </button>
        ))}
      </div>
    </div>
  );
}
