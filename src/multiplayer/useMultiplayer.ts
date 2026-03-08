import { useEffect, useRef, useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket } from './socket';
import { EVENTS } from './events';
import { useGameStore } from '../game/GameState';
import type { GameState, FireAction, FireResult } from '../../shared/types';

interface UseMultiplayerOptions {
  roomId: string;
  playerIndex: number;
  enabled: boolean;
}

export function useMultiplayer({ roomId, playerIndex, enabled }: UseMultiplayerOptions) {
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    connectSocket();
    const socket = getSocket();

    socket.on(EVENTS.GAME_START, (state: GameState) => {
      useGameStore.getState().applyServerState(state);
    });

    socket.on(EVENTS.GAME_STATE, (state: GameState) => {
      useGameStore.getState().applyServerState(state);
    });

    socket.on(EVENTS.GAME_FIRE_RESULT, (result: FireResult) => {
      const state = useGameStore.getState();
      // Server computed the result — apply trajectory animation then resolve
      // For now, directly apply the result
      const newPlayers = [...state.players] as [typeof state.players[0], typeof state.players[1]];
      newPlayers[0] = { ...newPlayers[0], hp: result.playerHPs[0] };
      newPlayers[1] = { ...newPlayers[1], hp: result.playerHPs[1] };

      useGameStore.setState({
        terrain: result.newTerrain,
        players: newPlayers,
        winner: result.winner,
        phase: result.gameOver ? 'GAME_OVER' : 'RESOLVING',
      });
    });

    socket.on(EVENTS.GAME_TURN_SWITCH, (data) => {
      useGameStore.setState({
        activePlayerIndex: data.activePlayerIndex,
        wind: data.wind,
        phase: 'MOVE',
      });
    });

    socket.on(EVENTS.GAME_OVER, (data) => {
      useGameStore.setState({ winner: data.winner, phase: 'GAME_OVER' });
    });

    socket.on(EVENTS.OPPONENT_DISCONNECTED, () => {
      // Could show a notification
    });

    isConnectedRef.current = true;

    return () => {
      socket.off(EVENTS.GAME_START);
      socket.off(EVENTS.GAME_STATE);
      socket.off(EVENTS.GAME_FIRE_RESULT);
      socket.off(EVENTS.GAME_TURN_SWITCH);
      socket.off(EVENTS.GAME_OVER);
      socket.off(EVENTS.OPPONENT_DISCONNECTED);
    };
  }, [enabled, roomId, playerIndex]);

  const sendFire = useCallback(
    (action: FireAction) => {
      if (!enabled) return;
      const socket = getSocket();
      socket.emit(EVENTS.GAME_FIRE, action);
    },
    [enabled]
  );

  const sendMove = useCallback(
    (dx: number) => {
      if (!enabled) return;
      const socket = getSocket();
      socket.emit(EVENTS.GAME_MOVE, { dx });
    },
    [enabled]
  );

  const sendEndMove = useCallback(() => {
    if (!enabled) return;
    const socket = getSocket();
    socket.emit(EVENTS.GAME_END_MOVE);
  }, [enabled]);

  return { sendFire, sendMove, sendEndMove };
}
