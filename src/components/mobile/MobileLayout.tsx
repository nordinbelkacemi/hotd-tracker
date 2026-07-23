import { useState } from 'react';
import type { CharacterPosition, CharacterPath } from '../../types';
import WesterosMap from '../WesterosMap';
import MobileControls from './MobileControls';
import CharacterSheet from './CharacterSheet';
import EntityInfoCard from './EntityInfoCard';

interface MobileLayoutProps {
  characterPositions: CharacterPosition[];
  paths: CharacterPath[];
}

export default function MobileLayout({ characterPositions, paths }: MobileLayoutProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: '#c6ecff' }}>
      {/* Slim title overlay — non-interactive so it never blocks the map */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center h-9 pointer-events-none">
        <span
          className="text-[13px] font-bold tracking-[0.2em] text-white/90"
          style={{ fontFamily: 'Cinzel, serif', textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
        >
          House of the Dragon
        </span>
      </div>

      <WesterosMap characterPositions={characterPositions} paths={paths} mode="tap" />

      <MobileControls onOpenCharacters={() => setSheetOpen(true)} />
      <EntityInfoCard />
      <CharacterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
