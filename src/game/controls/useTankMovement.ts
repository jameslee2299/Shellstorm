import { useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '../GameState';
import { TANK_MOVE_SPEED } from '../constants';

export function useTankMovement() {
  const movingRef = useRef<'left' | 'right' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMoving = useCallback((direction: 'left' | 'right') => {
    movingRef.current = direction;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const move = () => {
      const state = useGameStore.getState();
      if (state.phase !== 'MOVE') return;
      const dx = direction === 'left' ? -3 : 3;
      state.moveTank(state.activePlayerIndex, dx);
    };

    move(); // immediate
    intervalRef.current = setInterval(move, 1000 / 60);
  }, []);

  const stopMoving = useCallback(() => {
    movingRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { startMoving, stopMoving };
}
