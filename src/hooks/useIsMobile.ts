import { useSyncExternalStore } from 'react';

// Mobile = narrower than Tailwind's `md` breakpoint (768px). Drives both the
// layout switch and the hover-vs-tap interaction mode.
const QUERY = '(max-width: 767px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

export default function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
