# HOTD Tracker

Interactive map of House of the Dragon S1 character locations per episode.

## Stack
React 18 + TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion

## Structure
```
src/
├── assets/westeros.svg              # PROVIDED — do not regenerate
├── assets/westeros-coordinates.svg  # PROVIDED — coordinate reference
├── components/{WesterosMap,CharacterPanel,EpisodeSlider,CharacterDot}.tsx
├── data/{locations,characters,episodes}.json
├── store/useStore.ts
├── types/index.ts
├── utils/{getPositions,getPaths}.ts
├── App.tsx
└── main.tsx
```

## Rules
- Do NOT regenerate or modify the SVG files in assets/
- Inline westeros.svg markup into WesterosMap.tsx for overlay capability
- Read westeros-coordinates.svg to extract x,y positions for locations.json
- All state through Zustand. All animation through Framer Motion.
- Tailwind only — no CSS files. TypeScript strict.
- Commit after each major milestone.
