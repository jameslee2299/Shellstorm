import React, { useCallback, useMemo } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { BackgroundRenderer } from './rendering/BackgroundRenderer';
import { TerrainRenderer } from './rendering/TerrainRenderer';
import { TankRenderer } from './rendering/TankRenderer';
import { ProjectileRenderer } from './rendering/ProjectileRenderer';
import { ExplosionRenderer } from './rendering/ExplosionRenderer';
import { AimRenderer } from './rendering/AimRenderer';
import { HUDRenderer } from './rendering/HUDRenderer';
import { DamageNumberRenderer } from './rendering/DamageNumberRenderer';
import { TurnAnnouncementRenderer } from './rendering/TurnAnnouncementRenderer';
import { useGameStore } from './GameState';
import { useGameLoop } from './GameLoop';
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { TANK_CLASSES } from '../../shared/tankClasses';
import { TURN_ANNOUNCEMENT_DURATION } from '../../shared/constants';

export const GameCanvas: React.FC = () => {
  useGameLoop();
  const { width, height } = useWindowDimensions();
  const state = useGameStore();

  const scaleX = width / WORLD_WIDTH;
  const scaleY = height / WORLD_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (width - WORLD_WIDTH * scale) / 2;
  const offsetY = (height - WORLD_HEIGHT * scale) / 2;

  const p1 = state.players[0];
  const p2 = state.players[1];
  const activePlayer = state.players[state.activePlayerIndex];
  const p1Class = TANK_CLASSES[p1.tankClass];
  const p2Class = TANK_CLASSES[p2.tankClass];

  const getTankY = useCallback(
    (playerIndex: number) => {
      const tank = state.players[playerIndex];
      if (state.terrain.length === 0) return WORLD_HEIGHT;
      const idx = Math.floor((tank.tankX / WORLD_WIDTH) * state.terrain.length);
      const ci = Math.max(0, Math.min(state.terrain.length - 1, idx));
      return WORLD_HEIGHT - state.terrain[ci];
    },
    [state.players, state.terrain]
  );

  const showAim = state.phase === 'AIM' || state.phase === 'MOVE';

  // Screen shake offset
  const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;

  // Camera follow: subtle offset towards projectile during FIRING
  let cameraOffsetX = 0;
  let cameraOffsetY = 0;
  if (state.phase === 'FIRING' && state.projectile?.active) {
    const targetX = state.projectile.x - WORLD_WIDTH / 2;
    const targetY = state.projectile.y - WORLD_HEIGHT / 2;
    cameraOffsetX = Math.max(-80, Math.min(80, -targetX * 0.1));
    cameraOffsetY = Math.max(-40, Math.min(40, -targetY * 0.1));
  }

  const activeClassDef = TANK_CLASSES[activePlayer.tankClass];

  return (
    <Canvas style={{ width, height }}>
      <Group transform={[
        { translateX: offsetX + shakeX + cameraOffsetX },
        { translateY: offsetY + shakeY + cameraOffsetY },
        { scale },
      ]}>
        <BackgroundRenderer />
        <TerrainRenderer terrain={state.terrain} />

        {/* Player 1 Tank */}
        <TankRenderer
          tankClass={p1.tankClass}
          x={p1.tankX}
          y={getTankY(0)}
          angle={p1.angle}
          hp={p1.hp}
          maxHp={p1Class.maxHp}
          isActive={state.activePlayerIndex === 0}
          facingRight={true}
        />

        {/* Player 2 Tank */}
        <TankRenderer
          tankClass={p2.tankClass}
          x={p2.tankX}
          y={getTankY(1)}
          angle={p2.angle}
          hp={p2.hp}
          maxHp={p2Class.maxHp}
          isActive={state.activePlayerIndex === 1}
          facingRight={false}
        />

        {/* Aim preview */}
        {showAim && (
          <AimRenderer
            tankX={activePlayer.tankX}
            tankY={getTankY(state.activePlayerIndex) - activeClassDef.bodyHeight}
            angle={activePlayer.angle}
            power={state.aimPower}
            wind={state.wind}
            terrain={state.terrain}
            visible={state.phase === 'AIM'}
          />
        )}

        {/* Projectile */}
        {state.projectile && <ProjectileRenderer projectile={state.projectile} />}

        {/* Sub-projectiles (Jackal split) */}
        {state.subProjectiles.map((sub, i) => (
          <ProjectileRenderer key={`sub-${i}`} projectile={sub} />
        ))}

        {/* Explosion */}
        {state.explosion && <ExplosionRenderer explosion={state.explosion} />}

        {/* Damage Numbers */}
        {state.damageNumbers.length > 0 && (
          <DamageNumberRenderer damageNumbers={state.damageNumbers} />
        )}

        {/* Turn Announcement */}
        {state.turnAnnouncement && (
          <TurnAnnouncementRenderer
            playerName={state.turnAnnouncement.playerName}
            playerColor={state.turnAnnouncement.playerColor}
            age={state.turnAnnouncement.age}
            duration={TURN_ANNOUNCEMENT_DURATION}
          />
        )}

        {/* HUD */}
        <HUDRenderer
          player1={p1}
          player2={p2}
          activePlayerIndex={state.activePlayerIndex}
          wind={state.wind}
          turnTimeLeft={state.turnTimeLeft}
          phase={state.phase}
        />
      </Group>
    </Canvas>
  );
};
