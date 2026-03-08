import React from 'react';
import { Group, Text, useFont, Rect, Line, vec, RoundedRect } from '@shopify/react-native-skia';
import { WORLD_WIDTH, MAX_WIND, COLORS } from '../constants';
import type { PlayerState } from '../../../shared/types';

interface Props {
  player1: PlayerState;
  player2: PlayerState;
  activePlayerIndex: number;
  wind: number;
  turnTimeLeft: number;
  phase: string;
}

export const HUDRenderer: React.FC<Props> = ({
  player1,
  player2,
  activePlayerIndex,
  wind,
  turnTimeLeft,
  phase,
}) => {
  const font = useFont(null, 14);
  const smallFont = useFont(null, 11);
  const bigFont = useFont(null, 18);

  // Wind indicator
  const windBarWidth = 100;
  const windBarX = WORLD_WIDTH / 2 - windBarWidth / 2;
  const windBarY = 15;
  const windOffset = (wind / MAX_WIND) * (windBarWidth / 2);

  // Turn timer
  const timerText = phase === 'MOVE' || phase === 'AIM' ? `${Math.ceil(turnTimeLeft)}s` : '';

  return (
    <Group>
      {/* Player 1 info - top left */}
      <RoundedRect x={8} y={8} width={120} height={32} r={6} color="rgba(13,27,42,0.85)" />
      {font && (
        <Text x={14} y={24} text={player1.name} font={font} color={player1.color} />
      )}
      {smallFont && (
        <Text x={14} y={36} text={`HP: ${player1.hp}`} font={smallFont} color={player1.hp > 30 ? '#4CAF50' : '#F44336'} />
      )}
      {activePlayerIndex === 0 && (
        <Rect x={8} y={8} width={3} height={32} color={player1.color} />
      )}

      {/* Player 2 info - top right */}
      <RoundedRect x={WORLD_WIDTH - 128} y={8} width={120} height={32} r={6} color="rgba(13,27,42,0.85)" />
      {font && (
        <Text x={WORLD_WIDTH - 122} y={24} text={player2.name} font={font} color={player2.color} />
      )}
      {smallFont && (
        <Text x={WORLD_WIDTH - 122} y={36} text={`HP: ${player2.hp}`} font={smallFont} color={player2.hp > 30 ? '#4CAF50' : '#F44336'} />
      )}
      {activePlayerIndex === 1 && (
        <Rect x={WORLD_WIDTH - 128} y={8} width={3} height={32} color={player2.color} />
      )}

      {/* Wind indicator - top center */}
      <RoundedRect x={windBarX - 10} y={6} width={windBarWidth + 20} height={28} r={6} color="rgba(13,27,42,0.85)" />
      {smallFont && (
        <Text x={windBarX + windBarWidth / 2 - 12} y={17} text="WIND" font={smallFont} color={COLORS.textDim} />
      )}
      {/* Wind bar background */}
      <Rect x={windBarX} y={22} width={windBarWidth} height={4} color="#424242" />
      {/* Wind center mark */}
      <Rect x={windBarX + windBarWidth / 2 - 1} y={20} width={2} height={8} color="#666" />
      {/* Wind indicator */}
      {Math.abs(windOffset) > 1 && (
        <Line
          p1={vec(windBarX + windBarWidth / 2, 24)}
          p2={vec(windBarX + windBarWidth / 2 + windOffset, 24)}
          color={wind > 0 ? '#4FC3F7' : '#EF5350'}
          style="stroke"
          strokeWidth={4}
          strokeCap="round"
        />
      )}

      {/* Turn timer */}
      {bigFont && timerText && (
        <Text
          x={WORLD_WIDTH / 2 - 12}
          y={54}
          text={timerText}
          font={bigFont}
          color={turnTimeLeft < 10 ? '#F44336' : COLORS.text}
        />
      )}
    </Group>
  );
};
