// Faction display metadata, shared by the desktop character panel and the
// mobile character sheet.

export const FACTION_LABEL: Record<string, string> = {
  blacks: 'The Blacks',
  greens: 'The Greens',
  neutral: 'Neutral',
};

export const FACTION_ACCENT: Record<string, string> = {
  blacks: '#E63946',
  greens: '#2D6A4F',
  neutral: '#C4A44A',
};

export const FACTION_ORDER = ['blacks', 'greens', 'neutral'] as const;
