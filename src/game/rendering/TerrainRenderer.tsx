import React, { useMemo } from 'react';
import { Path, Skia, LinearGradient, vec } from '@shopify/react-native-skia';
import { WORLD_WIDTH, WORLD_HEIGHT, COLORS } from '../constants';

interface Props {
  terrain: number[];
}

export const TerrainRenderer: React.FC<Props> = ({ terrain }) => {
  const path = useMemo(() => {
    if (terrain.length === 0) return null;

    const p = Skia.Path.Make();
    const step = WORLD_WIDTH / terrain.length;

    p.moveTo(0, WORLD_HEIGHT);
    for (let i = 0; i < terrain.length; i++) {
      const x = i * step;
      const y = WORLD_HEIGHT - terrain[i];
      if (i === 0) {
        p.lineTo(x, y);
      } else {
        // Smooth curve between points
        const prevX = (i - 1) * step;
        const prevY = WORLD_HEIGHT - terrain[i - 1];
        const cpX = (prevX + x) / 2;
        p.cubicTo(cpX, prevY, cpX, y, x, y);
      }
    }
    p.lineTo(WORLD_WIDTH, WORLD_HEIGHT);
    p.close();

    return p;
  }, [terrain]);

  if (!path) return null;

  return (
    <Path path={path} style="fill">
      <LinearGradient
        start={vec(0, WORLD_HEIGHT - 350)}
        end={vec(0, WORLD_HEIGHT)}
        colors={[COLORS.terrain, COLORS.terrainDark, COLORS.ground]}
      />
    </Path>
  );
};
