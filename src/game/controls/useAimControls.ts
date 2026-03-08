import { useCallback, useRef } from 'react';
import { useGameStore } from '../GameState';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../constants';

export function useAimControls(screenWidth: number, screenHeight: number) {
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const scaleX = screenWidth / WORLD_WIDTH;
  const scaleY = screenHeight / WORLD_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  const onTouchStart = useCallback(
    (x: number, y: number) => {
      lastTouchRef.current = { x, y };
    },
    []
  );

  const onTouchMove = useCallback(
    (x: number, y: number) => {
      const state = useGameStore.getState();
      if (state.phase !== 'AIM') return;
      if (!lastTouchRef.current) return;

      const dx = (x - lastTouchRef.current.x) / scale;
      const dy = (y - lastTouchRef.current.y) / scale;

      const player = state.players[state.activePlayerIndex];
      const sensitivity = 0.005;

      // Determine angle adjustment based on drag direction
      let newAngle = player.angle - dx * sensitivity + dy * sensitivity;

      // Clamp angle between 0 and PI (can't shoot below horizon)
      newAngle = Math.max(0.05, Math.min(Math.PI - 0.05, newAngle));

      useGameStore.getState().setAngle(state.activePlayerIndex, newAngle);
      lastTouchRef.current = { x, y };
    },
    [scale]
  );

  const onTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
