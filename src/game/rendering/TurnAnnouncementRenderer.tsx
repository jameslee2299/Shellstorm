import React from 'react';
import { Group, RoundedRect, Text, useFont } from '@shopify/react-native-skia';
import { WORLD_WIDTH } from '../constants';

interface Props {
  playerName: string;
  playerColor: string;
  age: number;
  duration: number;
}

export const TurnAnnouncementRenderer: React.FC<Props> = ({
  playerName,
  playerColor,
  age,
  duration,
}) => {
  const font = useFont(null, 20);
  if (!font) return null;

  const progress = age / duration;
  // Fade in for first 20%, hold, fade out last 20%
  let alpha: number;
  if (progress < 0.2) {
    alpha = progress / 0.2;
  } else if (progress > 0.8) {
    alpha = (1 - progress) / 0.2;
  } else {
    alpha = 1;
  }
  alpha = Math.max(0, Math.min(1, alpha));

  const bannerWidth = 200;
  const bannerHeight = 36;
  const bannerX = WORLD_WIDTH / 2 - bannerWidth / 2;
  const bannerY = 40;

  const text = `${playerName}'s Turn`;
  const textWidth = font.measureText(text).width;

  return (
    <Group opacity={alpha}>
      <RoundedRect
        x={bannerX}
        y={bannerY}
        width={bannerWidth}
        height={bannerHeight}
        r={8}
        color="rgba(0, 0, 0, 0.7)"
      />
      <RoundedRect
        x={bannerX}
        y={bannerY}
        width={bannerWidth}
        height={bannerHeight}
        r={8}
        color={playerColor}
        style="stroke"
        strokeWidth={2}
      />
      <Text
        x={WORLD_WIDTH / 2 - textWidth / 2}
        y={bannerY + bannerHeight / 2 + 7}
        text={text}
        font={font}
        color="white"
      />
    </Group>
  );
};
