import React from 'react';
import { Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { COLORS } from '../constants';

export const BackgroundRenderer: React.FC = () => {
  return (
    <Rect x={0} y={0} width={WORLD_WIDTH} height={WORLD_HEIGHT}>
      <LinearGradient
        start={vec(0, 0)}
        end={vec(0, WORLD_HEIGHT)}
        colors={[COLORS.skyTop, COLORS.skyBottom]}
      />
    </Rect>
  );
};
