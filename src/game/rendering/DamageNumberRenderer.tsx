import React from 'react';
import { Group, Text, useFont } from '@shopify/react-native-skia';
import type { DamageNumber } from '../../../shared/types';

interface Props {
  damageNumbers: DamageNumber[];
}

export const DamageNumberRenderer: React.FC<Props> = ({ damageNumbers }) => {
  const font = useFont(null, 16);

  if (!font) return null;

  return (
    <Group>
      {damageNumbers.map((dn, i) => {
        const progress = dn.age / dn.maxAge;
        const alpha = Math.max(0, 1 - progress);
        const offsetY = -30 * progress;

        return (
          <Text
            key={i}
            x={dn.x - 10}
            y={dn.y + offsetY}
            text={`-${dn.damage}`}
            font={font}
            color={`rgba(${dn.color === '#F44336' ? '244,67,54' : '255,111,0'}, ${alpha})`}
          />
        );
      })}
    </Group>
  );
};
