import { useCallback, useEffect, useRef, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || defaultWebSocketUrl();

function defaultWebSocketUrl() {
  if (typeof window === 'undefined') {
    return 'ws://localhost:5173/ws/gallery';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/gallery`;
}

export function useGalleryPresence(hallId) {
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [localUserId, setLocalUserId] = useState(null);
  const [lastSignal, setLastSignal] = useState(null);
  const [lastVoiceReady, setLastVoiceReady] = useState(null);
  const socketRef = useRef(null);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    const socket = new WebSocket(WS_BASE_URL);
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: 'JOIN', hallId }));
    });

    socket.addEventListener('message', (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      if (payload.type === 'WELCOME') {
        setLocalUserId(payload.userId);
        setRemoteUsers(payload.users || []);
        return;
      }

      if (payload.type === 'USER_JOINED' || payload.type === 'USER_MOVED') {
        setRemoteUsers((users) => {
          const next = new Map(users.map((user) => [user.userId, user]));
          next.set(payload.user.userId, payload.user);
          return Array.from(next.values());
        });
        return;
      }

      if (payload.type === 'USER_LEFT') {
        setRemoteUsers((users) => users.filter((user) => user.userId !== payload.userId));
        return;
      }

      if (payload.type === 'SIGNAL') {
        setLastSignal({
          fromUserId: payload.fromUserId,
          signal: payload.signal,
          receivedAt: performance.now(),
        });
        return;
      }

      if (payload.type === 'VOICE_READY') {
        setLastVoiceReady({
          fromUserId: payload.fromUserId,
          receivedAt: performance.now(),
        });
      }
    });

    socket.addEventListener('close', () => {
      setConnected(false);
      setLocalUserId(null);
      setRemoteUsers([]);
    });

    socket.addEventListener('error', () => {
      setConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [hallId]);

  const sendLocalPose = useCallback((pose) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = performance.now();
    if (now - lastSentAtRef.current < 80) {
      return;
    }

    lastSentAtRef.current = now;
    socket.send(JSON.stringify({
      type: 'MOVE',
      hallId,
      x: pose.x,
      y: pose.y,
      z: pose.z,
      yaw: pose.yaw,
    }));
  }, [hallId]);

  const sendSignal = useCallback((targetUserId, signal) => {
    const socket = socketRef.current;
    if (!targetUserId || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({
      type: 'SIGNAL',
      targetUserId,
      signal,
    }));
  }, []);

  const sendVoiceReady = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({ type: 'VOICE_READY' }));
  }, []);

  return {
    connected,
    localUserId,
    remoteUsers,
    sendLocalPose,
    sendSignal,
    sendVoiceReady,
    lastSignal,
    lastVoiceReady,
  };
}
