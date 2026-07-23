import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import characters from '../data/characters.json';
import type { Character } from '../types';

const FACTION_LABEL: Record<string, string> = {
  blacks: 'The Blacks',
  greens: 'The Greens',
  neutral: 'Neutral',
};

const FACTION_ACCENT: Record<string, string> = {
  blacks: '#E63946',
  greens: '#2D6A4F',
  neutral: '#C4A44A',
};

const FACTION_ORDER = ['blacks', 'greens', 'neutral'] as const;

const PREVIEW_SIZE = 200;
const PREVIEW_MARGIN = 16;
const PREVIEW_HIDE_DELAY = 100;
// Half the card's total height (portrait + colour accent + borders), to centre it on the row.
const PREVIEW_HALF = PREVIEW_SIZE / 2 + 3;

interface Preview {
  id: string;
  name: string;
  color: string;
  wikiUrl?: string;
  centerY: number;
  right: number;
}

export default function CharacterPanel() {
  const { selectedCharacters, toggleCharacter, selectAll, deselectAll } = useStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  };
  // Linger before hiding so the cursor can travel from the row onto the image.
  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => { setPreview(null); hideTimer.current = null; }, PREVIEW_HIDE_DELAY);
  };
  useEffect(() => cancelHide, []);

  const byFaction = FACTION_ORDER.map((faction) => ({
    faction,
    chars: characters.filter((c) => c.faction === faction) as Character[],
  }));

  const showPreview = (char: Character, e: ReactMouseEvent<HTMLButtonElement>) => {
    cancelHide();
    const row = e.currentTarget.getBoundingClientRect();
    const panelLeft = rootRef.current?.getBoundingClientRect().left ?? row.left;
    setPreview({
      id: char.id,
      name: char.name,
      color: char.color,
      wikiUrl: char.wikiUrl,
      centerY: row.top + row.height / 2,
      right: window.innerWidth - panelLeft + PREVIEW_MARGIN,
    });
  };

  return (
    <>
      <div ref={rootRef} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
          <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Characters</span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              All
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={deselectAll}
              className="text-xs text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              None
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {byFaction.map(({ faction, chars }) => (
            <div key={faction}>
              <div
                className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1"
                style={{ color: FACTION_ACCENT[faction] }}
              >
                {FACTION_LABEL[faction]}
              </div>
              {chars.map((char) => {
                const selected = selectedCharacters.has(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    onMouseEnter={(e) => showPreview(char, e)}
                    onMouseLeave={scheduleHide}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Color dot */}
                    <span
                      className="w-3 h-3 rounded-full shrink-0 transition-opacity"
                      style={{
                        backgroundColor: char.color,
                        opacity: selected ? 1 : 0.25,
                        boxShadow: selected ? `0 0 6px ${char.color}88` : 'none',
                      }}
                    />
                    {/* Checkbox */}
                    <span
                      className="w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-all"
                      style={{
                        borderColor: selected ? char.color : 'rgba(255,255,255,0.2)',
                        backgroundColor: selected ? char.color + '33' : 'transparent',
                      }}
                    >
                      {selected && (
                        <svg width="8" height="8" viewBox="0 0 8 8">
                          <path d="M1 4l2 2 4-4" stroke={char.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                    {/* Name */}
                    <span
                      className="text-sm font-medium transition-opacity"
                      style={{ color: selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
                    >
                      {char.shortName}
                    </span>
                    {/* House */}
                    <span className="text-[11px] text-white/25 ml-auto">{char.house !== '—' ? char.house : ''}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hover preview — portrait to the left of the panel, in line with the hovered row */}
      {createPortal(
        <AnimatePresence>
          {preview && (
            <motion.div
              key="char-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
              style={{
                position: 'fixed',
                top: preview.centerY - PREVIEW_HALF,
                right: preview.right,
                zIndex: 40,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
                background: '#0d1117',
              }}
            >
              <a
                href={preview.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', cursor: preview.wikiUrl ? 'pointer' : 'default' }}
              >
                <div style={{ height: '4px', background: preview.color }} />
                <img
                  src={`${import.meta.env.BASE_URL}characters/${preview.id}.png`}
                  alt={preview.name}
                  width={PREVIEW_SIZE}
                  height={PREVIEW_SIZE}
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.dataset.fbk) {
                      t.dataset.fbk = '1';
                      t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(preview.name)}&background=222222&color=ffffff&size=300&font-size=0.4`;
                    }
                  }}
                  style={{ display: 'block', width: `${PREVIEW_SIZE}px`, height: `${PREVIEW_SIZE}px`, objectFit: 'cover' }}
                />
              </a>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
