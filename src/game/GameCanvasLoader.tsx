import React from 'react';
import { Platform } from 'react-native';
import { GameCanvas } from './GameCanvas';

// On web, we need to use WithSkiaWeb to load CanvasKit WASM first.
// On native, render directly.
let GameCanvasWeb: React.ComponentType | null = null;

if (Platform.OS === 'web') {
  // Lazy import to avoid loading CanvasKit on native
  const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
  GameCanvasWeb = () => (
    <WithSkiaWeb
      getComponent={() => import('./GameCanvas').then((m) => ({ default: m.GameCanvas }))}
      fallback={null}
    />
  );
}

export const GameCanvasLoaded: React.FC = Platform.OS === 'web'
  ? GameCanvasWeb!
  : GameCanvas;
