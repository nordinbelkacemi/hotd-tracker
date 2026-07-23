import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import useStore from '../../store/useStore';
import charactersData from '../../data/characters.json';
import { FACTION_LABEL, FACTION_ACCENT, FACTION_ORDER } from '../factions';

interface CharacterSheetProps {
  open: boolean;
  onClose: () => void;
}

const byFaction = FACTION_ORDER.map((faction) => ({
  faction,
  chars: charactersData.filter((c) => c.faction === faction),
}));

export default function CharacterSheet({ open, onClose }: CharacterSheetProps) {
  const selectedCharacters = useStore((s) => s.selectedCharacters);
  const toggleCharacter = useStore((s) => s.toggleCharacter);
  const selectAll = useStore((s) => s.selectAll);
  const deselectAll = useStore((s) => s.deselectAll);
  const dragControls = useDragControls();

  const onDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragSnapToOrigin
            onDragEnd={onDragEnd}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-white/12"
            style={{ backgroundColor: '#161b22', maxHeight: '75vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag handle — the only region that initiates the drag-to-dismiss */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center pt-2.5 pb-1.5 shrink-0 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div className="h-1.5 w-10 rounded-full bg-white/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
              <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
                Characters · {selectedCharacters.size}/{charactersData.length}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={selectAll} className="text-xs text-white/50 active:text-white/90">All</button>
                <span className="text-white/20">·</span>
                <button onClick={deselectAll} className="text-xs text-white/50 active:text-white/90">None</button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 space-y-4">
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
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg active:bg-white/10 transition-colors"
                      >
                        {/* Color dot */}
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: char.color,
                            opacity: selected ? 1 : 0.25,
                            boxShadow: selected ? `0 0 6px ${char.color}88` : 'none',
                          }}
                        />
                        {/* Checkbox */}
                        <span
                          className="w-4 h-4 rounded border shrink-0 flex items-center justify-center"
                          style={{
                            borderColor: selected ? char.color : 'rgba(255,255,255,0.2)',
                            backgroundColor: selected ? char.color + '33' : 'transparent',
                          }}
                        >
                          {selected && (
                            <svg width="9" height="9" viewBox="0 0 8 8">
                              <path d="M1 4l2 2 4-4" stroke={char.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </svg>
                          )}
                        </span>
                        {/* Name */}
                        <span
                          className="text-[15px] font-medium text-left"
                          style={{ color: selected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.35)' }}
                        >
                          {char.shortName}
                        </span>
                        {/* House */}
                        <span className="text-xs text-white/25 ml-auto">{char.house !== '—' ? char.house : ''}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
