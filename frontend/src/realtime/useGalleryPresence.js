/* WebSocket 기반 실시간 접속 관리 훅. 유저 위치 전송 + 다른 방문자 수신 + WebRTC 시그널링 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getWebSocketReconnectDelay } from './webSocketReconnect.js';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || defaultWebSocketUrl();
const WS_CONNECT_TIMEOUT_MS = 10000;

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
    let disposed = false;
    let reconnectAttempt = 0;
    let reconnectTimerId = null;
    let connectionTimeoutId = null;

    const clearConnectionTimeout = () => {
      if (connectionTimeoutId !== null) {
        clearTimeout(connectionTimeoutId);
        connectionTimeoutId = null;
      }
    };

    const clearPresence = () => {
      setConnected(false);
      setLocalUserId(null);
      setRemoteUsers([]);
      setVoiceReadyUserIds([]);
    };

    const scheduleReconnect = () => {
      if (disposed || reconnectTimerId !== null) {
        return;
      }

      const delay = getWebSocketReconnectDelay(reconnectAttempt);
      reconnectAttempt += 1;
      reconnectTimerId = setTimeout(() => {
        reconnectTimerId = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (disposed) {
        return;
      }

      let socket;
      try {
        socket = new WebSocket(WS_BASE_URL);
      } catch {
        clearPresence();
        scheduleReconnect();
        return;
      }

      socketRef.current = socket;
      connectionTimeoutId = setTimeout(() => {
        if (socketRef.current === socket && socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }, WS_CONNECT_TIMEOUT_MS);

      socket.addEventListener('open', () => {
        clearConnectionTimeout();
        if (disposed || socketRef.current !== socket) {
          socket.close();
          return;
        }

        reconnectAttempt = 0;
        setConnected(true);
        socket.send(JSON.stringify({ type: 'JOIN', hallId }));
      });

      socket.addEventListener('message', (event) => {
        if (disposed || socketRef.current !== socket) {
          return;
        }

        let payload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }

        if (payload.type === 'WELCOME') {
          const users = payload.users || [];
          setLocalUserId(payload.userId);
          setRemoteUsers(users);
          setVoiceReadyUserIds(
            users.filter((user) => user.voiceReady).map((user) => user.userId),
          );
          return;
        }

        if (payload.type === 'USER_JOINED' || payload.type === 'USER_MOVED') {
          setRemoteUsers((users) => {
            const next = new Map(users.map((user) => [user.userId, user]));
            next.set(payload.user.userId, payload.user);
            return Array.from(next.values());
          });
          setVoiceReadyUserIds((userIds) => {
            if (payload.user.voiceReady && !userIds.includes(payload.user.userId)) {
              return [...userIds, payload.user.userId];
            }
            if (!payload.user.voiceReady) {
              return userIds.filter((userId) => userId !== payload.user.userId);
            }
            return userIds;
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
          return;
        }

        if (payload.type === 'VOICE_NOT_READY') {
          setVoiceReadyUserIds((userIds) => (
            userIds.filter((userId) => userId !== payload.fromUserId)
          ));
        }
      });

      socket.addEventListener('close', () => {
        clearConnectionTimeout();
        if (socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;
        clearPresence();
        scheduleReconnect();
      });

      socket.addEventListener('error', () => {
        if (socketRef.current !== socket) {
          return;
        }

        setConnected(false);
        if (socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
          socket.close();
        }
      });
    };

    connect();

    return () => {
      disposed = true;
      clearConnectionTimeout();
      if (reconnectTimerId !== null) {
        clearTimeout(reconnectTimerId);
      }

      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
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

  const sendVoiceState = useCallback((ready) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({
      type: ready ? 'VOICE_READY' : 'VOICE_NOT_READY',
    }));
  }, []);

  return {
    connected,
    localUserId,
    remoteUsers,
    voiceReadyUserIds,
    sendLocalPose,
    sendSignal,
    sendVoiceState,
    lastSignal,
    lastVoiceReady,
  };
}
