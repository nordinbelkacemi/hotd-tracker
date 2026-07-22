# HOTD Tracker

Interactive map of House of the Dragon character locations per episode, covering Seasons 1-3 (S1 = episodes 1-10, S2 = 11-18, S3 = 19+).

## Stack
React 18 + TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion

## Structure
```
public/
├── characters/                      # one portrait PNG per character id
└── locations/                       # one image PNG per location id
src/
├── assets/westeros.svg              # PROVIDED — do not regenerate
├── assets/westeros-world.svg        # PROVIDED — do not regenerate
├── components/{WesterosMap,CharacterPanel,EpisodeSlider,CharacterDot,LocationMarker,AnimatedPath,SpoilerOverlay}.tsx
├── data/{locations,characters,episodes}.json
├── store/useStore.ts
├── types/index.ts
├── utils/{getPositions,getPaths,timeline}.ts
├── App.tsx
└── main.tsx
```

## Rules
- Do NOT regenerate or modify the SVG files in assets/
- Inline westeros.svg markup into WesterosMap.tsx for overlay capability
- Location x,y positions live in src/data/locations.json (same coordinate space as westeros.svg)
- All state through Zustand. All animation through Framer Motion.
- Tailwind only — no CSS files. TypeScript strict.
- Commit after each major milestone.
