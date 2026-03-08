import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/ui/Button';
import { LoadingSpinner } from '../src/ui/LoadingSpinner';
import { getSocket, connectSocket, disconnectSocket } from '../src/multiplayer/socket';

type LobbyState = 'idle' | 'connecting' | 'searching' | 'found';

export default function LobbyScreen() {
  const router = useRouter();
  const [lobbyState, setLobbyState] = useState<LobbyState>('idle');
  const [statusText, setStatusText] = useState('');

  const handleFindMatch = useCallback(() => {
    setLobbyState('connecting');
    setStatusText('Connecting to server...');

    try {
      connectSocket();
      const socket = getSocket();

      socket.on('connect', () => {
        setLobbyState('searching');
        setStatusText('Searching for opponent...');
        socket.emit('match:find', { name: `Player_${Math.floor(Math.random() * 1000)}` });
      });

      socket.on('match:waiting', () => {
        setStatusText('Waiting for opponent...');
      });

      socket.on('match:found', (data) => {
        setLobbyState('found');
        setStatusText('Match found!');
        setTimeout(() => {
          router.replace(`/game?mode=online&roomId=${data.roomId}&playerIndex=${data.playerIndex}`);
        }, 500);
      });

      socket.on('connect_error', () => {
        setStatusText('Connection failed. Is the server running?');
        setLobbyState('idle');
      });
    } catch {
      setStatusText('Failed to connect');
      setLobbyState('idle');
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    const socket = getSocket();
    socket.emit('match:cancel');
    disconnectSocket();
    setLobbyState('idle');
    setStatusText('');
  }, []);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ONLINE MATCH</Text>

      {lobbyState === 'idle' && (
        <View style={styles.content}>
          <Button title="Find Match" onPress={handleFindMatch} variant="primary" />
          <Button
            title="Back"
            onPress={() => router.back()}
            variant="secondary"
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      {(lobbyState === 'connecting' || lobbyState === 'searching') && (
        <View style={styles.content}>
          <LoadingSpinner message={statusText} />
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="danger"
            style={{ marginTop: 24 }}
          />
        </View>
      )}

      {lobbyState === 'found' && (
        <View style={styles.content}>
          <Text style={styles.foundText}>Match Found!</Text>
          <Text style={styles.subText}>Starting game...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ECEFF1',
    letterSpacing: 4,
    marginBottom: 40,
  },
  content: {
    alignItems: 'center',
  },
  foundText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  subText: {
    color: '#78909C',
    fontSize: 14,
    marginTop: 8,
  },
});
