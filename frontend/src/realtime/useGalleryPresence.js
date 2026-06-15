/* WebSocket 기반 실시간 접속 관리 훅. 유저 위치 전송 + 다른 방문자 수신 + WebRTC 시그널링 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getWebSocketReconnectDelay } from './webSocketReconnect.js';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || defaultWebSocketUrl();
const WS_CONNECT_TIMEOUT_MS = 10000;
const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_TIMEOUT_MS = 15000;
const CLIENT_ID_STORAGE_KEY = 'gallery-websocket-client-id';
const MAX_SOCIAL_MESSAGES = 30;

function defaultWebSocketUrl() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${location.host}/ws/gallery`;
}

function createClientId() {
  const randomId = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `tab-${randomId}`;
}

function getOrCreateClientId() {
  try {
    const stored = sessionStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const created = createClientId();
    sessionStorage.setItem(CLIENT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return createClientId();
  }
}

export function useGalleryPresence(hallId) {
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [localUserId, setLocalUserId] = useState(null);
  const [socialMessages, setSocialMessages] = useState([]);
  const [restoredPose, setRestoredPose] = useState(null);
  const [latestEmote, setLatestEmote] = useState(null);
  const [voiceReadyUserIds, setVoiceReadyUserIds] = useState([]);
  const socketRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const clientIdRef = useRef(null);
  const lastPoseRef = useRef(null);
  const signalSubscribersRef = useRef(new Set());

  if (clientIdRef.current === null) {
    clientIdRef.current = getOrCreateClientId();
  }

  const subscribeToSignals = useCallback((subscriber) => {
    if (typeof subscriber !== 'function') {
      return () => {};
    }

    signalSubscribersRef.current.add(subscriber);
    return () => {
      signalSubscribersRef.current.delete(subscriber);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let reconnectAttempt = 0;
    let reconnectTimerId = null;
    let connectionTimeoutId = null;
    let heartbeatIntervalId = null;
    let heartbeatTimeoutId = null;
    let emoteTimeoutId = null;
    setSocialMessages([]);
    setRestoredPose(null);
    setLatestEmote(null);

    const appendSocialMessage = (item) => {
      setSocialMessages((messages) => [...messages, item].slice(-MAX_SOCIAL_MESSAGES));
    };

    const clearConnectionTimeout = () => {
      if (connectionTimeoutId !== null) {
        clearTimeout(connectionTimeoutId);
        connectionTimeoutId = null;
      }
    };

    const clearHeartbeat = () => {
      if (heartbeatIntervalId !== null) {
        clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = null;
      }
      if (heartbeatTimeoutId !== null) {
        clearTimeout(heartbeatTimeoutId);
        heartbeatTimeoutId = null;
      }
    };

    const clearEmoteTimeout = () => {
      if (emoteTimeoutId !== null) {
        clearTimeout(emoteTimeoutId);
        emoteTimeoutId = null;
      }
    };

    const clearPresence = (nextStatus = 'reconnecting') => {
      setConnectionStatus(nextStatus);
      setLocalUserId(null);
      setRemoteUsers([]);
      setVoiceReadyUserIds([]);
    };

    const startHeartbeat = (socket) => {
      clearHeartbeat();

      const sendPing = () => {
        if (disposed || socketRef.current !== socket || socket.readyState !== WebSocket.OPEN) {
          return;
        }

        socket.send(JSON.stringify({ type: 'PING' }));
        if (heartbeatTimeoutId !== null) {
          clearTimeout(heartbeatTimeoutId);
        }
        heartbeatTimeoutId = setTimeout(() => {
          if (socketRef.current === socket && socket.readyState === WebSocket.OPEN) {
            socket.close(4000, 'Heartbeat timeout');
          }
        }, HEARTBEAT_TIMEOUT_MS);
      };

      heartbeatIntervalId = setInterval(sendPing, HEARTBEAT_INTERVAL_MS);
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
      setConnectionStatus(reconnectAttempt === 0 ? 'connecting' : 'reconnecting');

      let socket;
      try {
        socket = new WebSocket(WS_BASE_URL);
      } catch {
        clearPresence('reconnecting');
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

        socket.send(JSON.stringify({
          type: 'JOIN',
          hallId,
          clientId: clientIdRef.current,
          ...(lastPoseRef.current || {}),
        }));
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

        if (payload.type === 'PONG') {
          if (heartbeatTimeoutId !== null) {
            clearTimeout(heartbeatTimeoutId);
            heartbeatTimeoutId = null;
          }
          return;
        }

        if (payload.type === 'WELCOME') {
          const users = payload.users || [];
          reconnectAttempt = 0;
          setConnectionStatus('connected');
          setLocalUserId(payload.userId);
          setRemoteUsers(users);
          setVoiceReadyUserIds(
            users.filter((user) => user.voiceReady).map((user) => user.userId),
          );
          if (payload.resumed && payload.self) {
            setRestoredPose({
              hallId: payload.self.hallId,
              x: payload.self.x,
              y: payload.self.y,
              z: payload.self.z,
              yaw: payload.self.yaw,
              restoredAt: Date.now(),
            });
          }
          startHeartbeat(socket);
          return;
        }

        if (payload.type === 'USER_JOINED' || payload.type === 'USER_MOVED') {
          setRemoteUsers((users) => {
            const next = new Map(users.map((user) => [user.userId, user]));
            const current = next.get(payload.user.userId);
            next.set(payload.user.userId, { ...current, ...payload.user });
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

        if (payload.type === 'CHAT_MESSAGE') {
          appendSocialMessage({
            id: payload.messageId,
            kind: 'chat',
            userId: payload.userId,
            message: payload.message,
            timestamp: payload.timestamp,
          });
          return;
        }

        if (payload.type === 'EMOTE_RECEIVED') {
          const receivedAt = Date.now();
          appendSocialMessage({
            id: `${payload.userId}-${payload.timestamp}-${payload.emote}`,
            kind: 'emote',
            userId: payload.userId,
            emote: payload.emote,
            timestamp: payload.timestamp,
          });
          setRemoteUsers((users) => users.map((user) => (
            user.userId === payload.userId
              ? { ...user, emote: payload.emote, emoteReceivedAt: receivedAt }
              : user
          )));
          setLatestEmote({
            userId: payload.userId,
            emote: payload.emote,
            receivedAt,
          });
          clearEmoteTimeout();
          emoteTimeoutId = setTimeout(() => {
            setLatestEmote(null);
            emoteTimeoutId = null;
          }, 8000);
          return;
        }

        if (payload.type === 'USER_LEFT') {
          setRemoteUsers((users) => users.filter((user) => user.userId !== payload.userId));
          setVoiceReadyUserIds((userIds) => userIds.filter((userId) => userId !== payload.userId));
          return;
        }

        if (payload.type === 'SIGNAL') {
          const signalEvent = {
            fromUserId: payload.fromUserId,
            signal: payload.signal,
            receivedAt: performance.now(),
          };
          signalSubscribersRef.current.forEach((subscriber) => {
            try {
              subscriber(signalEvent);
            } catch {
              // One broken voice subscriber must not stop WebSocket message handling.
            }
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
          return;
        }

        if (payload.type === 'VOICE_ACTIVITY') {
          setRemoteUsers((users) => users.map((user) => (
            user.userId === payload.fromUserId
              ? { ...user, voiceSpeaking: payload.speaking === true }
              : user
          )));
          return;
        }

        if (payload.type === 'VOICE_NOT_READY') {
          setVoiceReadyUserIds((userIds) => (
            userIds.filter((userId) => userId !== payload.fromUserId)
          ));
          setRemoteUsers((users) => users.map((user) => (
            user.userId === payload.fromUserId
              ? { ...user, voiceReady: false, voiceSpeaking: false }
              : user
          )));
        }
      });

      socket.addEventListener('close', () => {
        clearConnectionTimeout();
        clearHeartbeat();
        if (socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;
        clearPresence('reconnecting');
        scheduleReconnect();
      });

      socket.addEventListener('error', () => {
        if (socketRef.current !== socket) {
          return;
        }

        setConnectionStatus('reconnecting');
        if (socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
          socket.close();
        }
      });
    };

    connect();

    return () => {
      disposed = true;
      clearConnectionTimeout();
      clearHeartbeat();
      clearEmoteTimeout();
      if (reconnectTimerId !== null) {
        clearTimeout(reconnectTimerId);
      }

      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [hallId]);

  const connected = connectionStatus === 'connected';

  const sendLocalPose = useCallback((pose) => {
    lastPoseRef.current = {
      x: pose.x,
      y: pose.y,
      z: pose.z,
      yaw: pose.yaw,
    };

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

  const sendChatMessage = useCallback((message) => {
    const socket = socketRef.current;
    const trimmed = String(message || '').trim();
    if (!trimmed || !socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      type: 'CHAT',
      message: trimmed,
    }));
    return true;
  }, []);

  const sendEmote = useCallback((emote) => {
    const socket = socketRef.current;
    if (!emote || !socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      type: 'EMOTE',
      emote,
    }));
    return true;
  }, []);

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

  const sendVoiceActivity = useCallback((speaking) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({
      type: 'VOICE_ACTIVITY',
      speaking: speaking === true,
    }));
  }, []);

  return {
    connected,
    connectionStatus,
    localUserId,
    remoteUsers,
    socialMessages,
    restoredPose,
    latestEmote,
    voiceReadyUserIds,
    sendLocalPose,
    sendChatMessage,
    sendEmote,
    sendSignal,
    sendVoiceState,
    sendVoiceActivity,
    subscribeToSignals,
  };
}
