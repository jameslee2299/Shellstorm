import type { GameState } from '../../shared/types';
import { useGameStore } from '../game/GameState';

/**
 * Reconcile server state with client state.
 * Server is authoritative — we always accept server values for HP, terrain, phase, etc.
 * We only keep client-side visual state (explosions, particles) that the server doesn't track.
 */
export function reconcileServerState(serverState: Partial<GameState>): void {
  const clientState = useGameStore.getState();

  useGameStore.setState({
    ...serverState,
    // Keep client-side visual state if server doesn't provide it
    explosion: serverState.explosion ?? clientState.explosion,
    projectile: serverState.projectile ?? clientState.projectile,
  });
}
