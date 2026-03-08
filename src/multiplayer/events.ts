// Socket.io event constants
export const EVENTS = {
  // Client → Server
  MATCH_FIND: 'match:find',
  MATCH_CANCEL: 'match:cancel',
  GAME_FIRE: 'game:fire',
  GAME_MOVE: 'game:move',
  GAME_END_MOVE: 'game:end_move',
  GAME_RECONNECT: 'game:reconnect',

  // Server → Client
  MATCH_WAITING: 'match:waiting',
  MATCH_FOUND: 'match:found',
  GAME_STATE: 'game:state',
  GAME_START: 'game:start',
  GAME_FIRE_RESULT: 'game:fire_result',
  GAME_TURN_SWITCH: 'game:turn_switch',
  GAME_OVER: 'game:over',
  OPPONENT_DISCONNECTED: 'opponent:disconnected',
  OPPONENT_RECONNECTED: 'opponent:reconnected',
} as const;
