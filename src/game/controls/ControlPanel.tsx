import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useGameStore } from '../GameState';
import { useAimControls } from './useAimControls';
import { useTankMovement } from './useTankMovement';
import { MAX_POWER, MIN_POWER, POWER_CHARGE_SPEED, COLORS } from '../constants';
import { TANK_CLASSES } from '../../../shared/tankClasses';

export const ControlPanel: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const state = useGameStore();
  const { startMoving, stopMoving } = useTankMovement();
  const { onTouchStart, onTouchMove, onTouchEnd } = useAimControls(width, height);

  const [power, setPower] = useState(300);
  const [isCharging, setIsCharging] = useState(false);
  const chargingRef = useRef(false);
  const powerRef = useRef(300);
  const dirRef = useRef(1);
  const animRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  const phase = state.phase;
  const activePlayer = state.players[state.activePlayerIndex];

  // Power charging animation
  const startCharging = useCallback(() => {
    if (phase !== 'AIM') return;
    chargingRef.current = true;
    setIsCharging(true);
    lastFrameRef.current = Date.now();

    const animate = () => {
      if (!chargingRef.current) return;
      const now = Date.now();
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      powerRef.current += dirRef.current * POWER_CHARGE_SPEED * dt;
      if (powerRef.current >= MAX_POWER) {
        powerRef.current = MAX_POWER;
        dirRef.current = -1;
      } else if (powerRef.current <= MIN_POWER) {
        powerRef.current = MIN_POWER;
        dirRef.current = 1;
      }
      const rounded = Math.round(powerRef.current);
      setPower(rounded);
      useGameStore.getState().setAimPower(rounded);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, [phase]);

  const stopCharging = useCallback(() => {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    setIsCharging(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);

    // Fire!
    const currentPower = powerRef.current;
    const gameState = useGameStore.getState();
    if (gameState.phase === 'AIM') {
      gameState.fire({
        angle: gameState.players[gameState.activePlayerIndex].angle,
        power: currentPower,
      });
    }

    // Reset for next turn
    powerRef.current = 300;
    dirRef.current = 1;
    setPower(300);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const canMove = phase === 'MOVE';
  const canAim = phase === 'AIM';
  const canInteract = canMove || canAim;
  const isAegis = activePlayer.tankClass === 'aegis';
  const isAltFire = state.isAltFire;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Touch area for aiming - covers the canvas */}
      {canAim && (
        <View
          style={styles.touchArea}
          onTouchStart={(e) => onTouchStart(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          onTouchMove={(e) => onTouchMove(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          onTouchEnd={onTouchEnd}
          // @ts-ignore - web mouse fallback
          onMouseDown={(e: any) => onTouchStart(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          // @ts-ignore
          onMouseMove={(e: any) => { if (e.buttons === 1) onTouchMove(e.nativeEvent.pageX, e.nativeEvent.pageY); }}
          // @ts-ignore
          onMouseUp={onTouchEnd}
        />
      )}

      {/* Bottom control bar */}
      <View style={styles.bottomBar}>
        {/* Move controls */}
        <View style={styles.moveControls}>
          <TouchableOpacity
            style={[styles.moveBtn, !canMove && styles.btnDisabled]}
            onPressIn={() => canMove && startMoving('left')}
            onPressOut={stopMoving}
            disabled={!canMove}
          >
            <Text style={styles.moveBtnText}>◀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.moveBtn, !canMove && styles.btnDisabled]}
            onPressIn={() => canMove && startMoving('right')}
            onPressOut={stopMoving}
            disabled={!canMove}
          >
            <Text style={styles.moveBtnText}>▶</Text>
          </TouchableOpacity>

          {canMove && (
            <TouchableOpacity
              style={styles.endMoveBtn}
              onPress={() => useGameStore.getState().endMove()}
            >
              <Text style={styles.endMoveBtnText}>AIM</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Power & angle display */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            Angle: {Math.round((activePlayer.angle * 180) / Math.PI)}°
          </Text>
          <View style={styles.powerBarContainer}>
            <Text style={styles.infoText}>Power: {power}</Text>
            <View style={styles.powerBarBg}>
              <View
                style={[
                  styles.powerBarFill,
                  {
                    width: `${((power - MIN_POWER) / (MAX_POWER - MIN_POWER)) * 100}%`,
                    backgroundColor: isCharging ? COLORS.buttonFireCharging : COLORS.buttonFire,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.infoTextDim}>
            Move: {Math.round(activePlayer.moveDistanceLeft)}px left
          </Text>
        </View>

        {/* Aegis alt-fire toggle */}
        {isAegis && canAim && (
          <TouchableOpacity
            style={[styles.altFireBtn, isAltFire && styles.altFireBtnActive]}
            onPress={() => useGameStore.getState().setAltFire(!isAltFire)}
          >
            <Text style={styles.altFireBtnText}>{isAltFire ? 'WALL' : 'FIRE'}</Text>
          </TouchableOpacity>
        )}

        {/* Fire button */}
        <TouchableOpacity
          style={[
            styles.fireBtn,
            !canAim && styles.btnDisabled,
            isCharging && styles.fireBtnCharging,
            isAltFire && styles.fireBtnAlt,
          ]}
          onPressIn={startCharging}
          onPressOut={stopCharging}
          disabled={!canAim}
        >
          <Text style={styles.fireBtnText}>
            {isCharging ? 'RELEASE!' : isAltFire ? 'WALL' : 'FIRE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Phase indicator */}
      {!canInteract && phase !== 'GAME_OVER' && phase !== 'WAITING' && (
        <View style={styles.phaseOverlay}>
          <Text style={styles.phaseText}>
            {phase === 'FIRING' ? 'Firing...' : phase === 'RESOLVING' ? 'Impact!' : phase === 'SWITCHING' ? 'Switching turns...' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  touchArea: {
    ...StyleSheet.absoluteFillObject,
    bottom: 70,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(13, 27, 42, 0.9)',
    height: 70,
  },
  moveControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moveBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endMoveBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endMoveBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  infoPanel: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  infoText: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '600',
  },
  infoTextDim: {
    color: '#78909C',
    fontSize: 10,
  },
  powerBarContainer: {
    alignItems: 'center',
    width: '100%',
  },
  powerBarBg: {
    width: '80%',
    height: 6,
    backgroundColor: '#424242',
    borderRadius: 3,
    marginTop: 3,
    overflow: 'hidden',
  },
  powerBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  fireBtn: {
    width: 70,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireBtnCharging: {
    backgroundColor: '#FF6F00',
  },
  fireBtnAlt: {
    backgroundColor: '#20B2AA',
  },
  altFireBtn: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#37474F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  altFireBtnActive: {
    backgroundColor: '#20B2AA',
  },
  altFireBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fireBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  phaseOverlay: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  phaseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
