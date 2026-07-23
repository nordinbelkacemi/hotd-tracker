import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../../store/useStore';
import charactersData from '../../data/characters.json';
import locationsData from '../../data/locations.json';
import { getPositions } from '../../utils/getPositions';
import type { CharacterPosition } from '../../types';

const charMap = new Map(charactersData.map((c) => [c.id, c]));
const locMap = new Map(locationsData.map((l) => [l.id, l]));

const charImg = (id: string) => `${import.meta.env.BASE_URL}characters/${id}.png`;
const locImg = (id: string) => `${import.meta.env.BASE_URL}locations/${id}.png`;
const charFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=222222&color=ffffff&size=200&font-size=0.4`;
const locFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a1f0e&color=ffd700&size=200&font-size=0.3`;

const GOLD = '#C4A44A';

function WikiLink({ url, color }: { url?: string; color: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors"
      style={{ backgroundColor: color + '26', color: '#fff', border: `1px solid ${color}66` }}
    >
      View on wiki
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </a>
  );
}

// Small tappable member chip used for co-located rosters. Tapping re-focuses.
function MemberChip({ pos, onSelect }: { pos: CharacterPosition; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(pos.characterId); }}
      className="flex flex-col items-center gap-1 w-14 shrink-0"
    >
      <img
        src={charImg(pos.characterId)}
        alt={pos.name}
        width={48}
        height={48}
        onError={(e) => {
          const t = e.currentTarget;
          if (!t.dataset.fbk) { t.dataset.fbk = '1'; t.src = charFallback(pos.name); }
        }}
        className="w-12 h-12 rounded-full object-cover"
        style={{ border: `2px solid ${pos.color}` }}
      />
      <span className="text-[10px] leading-tight text-white/70 text-center truncate w-full">
        {pos.name.split(' ')[0]}
      </span>
    </button>
  );
}

export default function EntityInfoCard() {
  const focusedEntity = useStore((s) => s.focusedEntity);
  const setFocusedEntity = useStore((s) => s.setFocusedEntity);
  const currentStepIndex = useStore((s) => s.currentStepIndex);
  const selectedCharacters = useStore((s) => s.selectedCharacters);

  const positions = useMemo(
    () => getPositions(currentStepIndex, selectedCharacters),
    [currentStepIndex, selectedCharacters],
  );

  const content = useMemo(() => {
    if (!focusedEntity) return null;
    if (focusedEntity.type === 'character') {
      const char = charMap.get(focusedEntity.id);
      if (!char) return null;
      const pos = positions.find((p) => p.characterId === char.id);
      const others = pos
        ? positions.filter((p) => p.locationId === pos.locationId && p.characterId !== char.id)
        : [];
      return { kind: 'character' as const, char, pos, others };
    }
    const loc = locMap.get(focusedEntity.id);
    if (!loc) return null;
    const here = positions.filter((p) => p.locationId === loc.id);
    return { kind: 'location' as const, loc, here };
  }, [focusedEntity, positions]);

  const close = () => setFocusedEntity(null);
  const key = content
    ? content.kind === 'character' ? `c-${content.char.id}` : `l-${content.loc.id}`
    : 'none';

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={key}
          initial={{ y: '115%' }}
          animate={{ y: 0 }}
          exit={{ y: '115%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-x-0 bottom-0 z-40 px-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
        >
          <div
            className="relative mx-auto max-w-xl rounded-2xl border border-white/12 overflow-hidden"
            style={{ backgroundColor: '#0d1117', boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}
          >
            {/* accent bar */}
            <div style={{ height: 3, background: content.kind === 'character' ? content.char.color : GOLD }} />

            {/* close */}
            <button
              onClick={(e) => { e.stopPropagation(); close(); }}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-white/70 active:bg-white/20"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            {content.kind === 'character' ? (
              <div className="p-3.5">
                <div className="flex items-center gap-3.5 pr-8">
                  <img
                    src={charImg(content.char.id)}
                    alt={content.char.name}
                    width={64}
                    height={64}
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.dataset.fbk) { t.dataset.fbk = '1'; t.src = charFallback(content.char.name); }
                    }}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    style={{ border: `2px solid ${content.char.color}` }}
                  />
                  <div className="min-w-0">
                    <div className="text-lg text-white leading-tight" style={{ fontFamily: 'Cinzel, serif', fontWeight: 600 }}>
                      {content.char.name}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5 truncate">
                      {[content.char.house !== '—' ? content.char.house : null, content.pos?.locationName ?? 'Not on the map this episode']
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                    <div className="mt-2">
                      <WikiLink url={content.char.wikiUrl} color={content.char.color} />
                    </div>
                  </div>
                </div>

                {content.others.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/8">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 px-0.5">
                      Also here · {content.others.length}
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-1 -mx-0.5 px-0.5">
                      {content.others.map((p) => (
                        <MemberChip key={p.characterId} pos={p} onSelect={(id) => setFocusedEntity({ type: 'character', id })} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5">
                <div className="flex items-center gap-3.5 pr-8">
                  <img
                    src={locImg(content.loc.id)}
                    alt={content.loc.name}
                    width={64}
                    height={64}
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.dataset.fbk) { t.dataset.fbk = '1'; t.src = locFallback(content.loc.name); }
                    }}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    style={{ border: `2px solid ${GOLD}` }}
                  />
                  <div className="min-w-0">
                    <div className="text-lg text-white leading-tight" style={{ fontFamily: 'Cinzel, serif', fontWeight: 600 }}>
                      {content.loc.name}
                    </div>
                    {content.loc.region && (
                      <div className="text-xs text-white/50 mt-0.5 truncate">{content.loc.region}</div>
                    )}
                    <div className="mt-2">
                      <WikiLink url={content.loc.wikiUrl} color={GOLD} />
                    </div>
                  </div>
                </div>

                {content.here.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/8">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 px-0.5">
                      Here now · {content.here.length}
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-1 -mx-0.5 px-0.5">
                      {content.here.map((p) => (
                        <MemberChip key={p.characterId} pos={p} onSelect={(id) => setFocusedEntity({ type: 'character', id })} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
