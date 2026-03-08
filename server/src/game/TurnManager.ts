import { ServerGameState } from './ServerGameState';
import { TURN_TIME_LIMIT } from '../../../shared/constants';

export class TurnManager {
  private gameState: ServerGameState;
  private onTimeout: () => void;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  constructor(gameState: ServerGameState, onTimeout: () => void) {
    this.gameState = gameState;
    this.onTimeout = onTimeout;
  }

  startTurn(): void {
    this.stop();
    this.gameState.turnTimeLeft = TURN_TIME_LIMIT;

    // Tick every second to update remaining time
    this.tickInterval = setInterval(() => {
      this.gameState.turnTimeLeft = Math.max(0, this.gameState.turnTimeLeft - 1);
    }, 1000);

    // Timeout after turn time limit
    this.timer = setTimeout(() => {
      this.stop();
      this.onTimeout();
    }, TURN_TIME_LIMIT * 1000);
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}
