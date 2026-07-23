import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { timelineSteps } from '../utils/timeline';

// Advances the timeline one step every few seconds while `isPlaying`, stopping
// at the end. Shared by the desktop slider and the mobile control bar (only one
// is mounted at a time, so a single interval runs).
const STEP_MS = 3000;

export default function usePlaybackInterval() {
  const isPlaying = useStore((s) => s.isPlaying);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        useStore.setState((state) => {
          if (state.currentStepIndex >= timelineSteps.length - 1) {
            clearInterval(intervalRef.current!);
            return { isPlaying: false };
          }
          return { currentStepIndex: state.currentStepIndex + 1 };
        });
      }, STEP_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);
}
