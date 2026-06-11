/* WebSocket 기반 실시간 접속 관리 훅. 유저 위치 전송 + 다른 방문자 수신 + WebRTC 시그널링 */
import { useCallback, useEffect, useRef, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || defaultWebSocketUrl();

function defaultWebSocketUrl() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${location.host}/ws/gallery`;
}

export function useGalleryPresence(hallId) {
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [localUserId, setLocalUserId] = useState(null);
  const [lastSignal, setLastSignal] = useState(null);
  const [lastVoiceReady, setLastVoiceReady] = useState(null);
  const [voiceReadyUserIds, setVoiceReadyUserIds] = useState([]);
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
        setVoiceReadyUserIds([]);
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
        setVoiceReadyUserIds((userIds) => userIds.filter((userId) => userId !== payload.userId));
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
        setVoiceReadyUserIds((userIds) => {
          if (!payload.fromUserId || userIds.includes(payload.fromUserId)) {
            return userIds;
          }
          return [...userIds, payload.fromUserId];
        });
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
      setVoiceReadyUserIds([]);
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
    voiceReadyUserIds,
    sendLocalPose,
    sendSignal,
    sendVoiceReady,
    lastSignal,
    lastVoiceReady,
  };
}
