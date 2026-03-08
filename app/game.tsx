import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ControlPanel } from '../src/game/controls/ControlPanel';
import { useGameStore } from '../src/game/GameState';
import { GameOverOverlay } from '../src/game/GameOverOverlay';
import type { TankClassId } from '../shared/types';

// Conditionally load Skia canvas - on web, needs CanvasKit WASM init first
let CanvasComponent: React.ComponentType;
if (Platform.OS === 'web') {
  const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
  CanvasComponent = () => (
    <WithSkiaWeb
      opts={{
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.40.0/bin/full/${file}`,
      }}
      getComponent={() =>
        import('../src/game/GameCanvas').then((m) => ({ default: m.GameCanvas }))
      }
      fallback={
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={styles.loadingText}>Loading game engine...</Text>
        </View>
      }
    />
  );
} else {
  const { GameCanvas } = require('../src/game/GameCanvas');
  CanvasComponent = GameCanvas;
}

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    roomId?: string;
    p1Class?: string;
    p2Class?: string;
  }>();
  const { phase, winner, initGame } = useGameStore();

  const p1Class = (params.p1Class as TankClassId) || 'soldier';
  const p2Class = (params.p2Class as TankClassId) || 'soldier';

  useEffect(() => {
    initGame(undefined, p1Class, p2Class);
  }, []);

  const handlePlayAgain = () => {
    initGame(undefined, p1Class, p2Class);
  };

  const handleExit = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <CanvasComponent />
      <ControlPanel />
      {phase === 'GAME_OVER' && winner !== null && (
        <GameOverOverlay
          winner={winner}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
  },
  loadingText: {
    color: '#4FC3F7',
    marginTop: 12,
    fontSize: 14,
  },
});
