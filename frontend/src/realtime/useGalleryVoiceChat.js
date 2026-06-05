import { useCallback, useEffect, useRef, useState } from 'react';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export function useGalleryVoiceChat({
  enabled,
  localUserId,
  remoteUsers,
  sendSignal,
  sendVoiceReady,
  lastSignal,
  lastVoiceReady,
}) {
  const [muted, setMuted] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [error, setError] = useState('');
  const [localReady, setLocalReady] = useState(false);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const readyAnnouncedRef = useRef(false);
  const pendingIceRef = useRef(new Map());

  const closePeer = useCallback((userId) => {
    const peer = peersRef.current.get(userId);
    if (!peer) return;
    peer.close();
    peersRef.current.delete(userId);
    pendingIceRef.current.delete(userId);
    setRemoteStreams((streams) => streams.filter((stream) => stream.userId !== userId));
  }, []);

  const createPeer = useCallback((userId) => {
    const existing = peersRef.current.get(userId);
    if (existing) return existing;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(userId, peer);

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(userId, { kind: 'ice', candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      setRemoteStreams((streams) => {
        const next = new Map(streams.map((item) => [item.userId, item.stream]));
        next.set(userId, stream);
        return Array.from(next.entries()).map(([remoteUserId, remoteStream]) => ({
          userId: remoteUserId,
          stream: remoteStream,
        }));
      });
    };

    peer.onconnectionstatechange = () => {
      if (['closed', 'failed', 'disconnected'].includes(peer.connectionState)) {
        closePeer(userId);
      }
    };

    return peer;
  }, [closePeer, sendSignal]);

  useEffect(() => {
    if (!enabled) {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      pendingIceRef.current.clear();
      setRemoteStreams([]);
      setLocalReady(false);
      readyAnnouncedRef.current = false;
      setError('');
      return;
    }

    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !muted;
        });
        setLocalReady(true);
        setError('');
      })
      .catch(() => {
        if (!cancelled) {
          setError('마이크 권한을 확인해 주세요.');
        }
      });

    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalReady(false);
    };
  }, [enabled]);

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, [muted]);

  const sendOffer = useCallback(async (userId) => {
    const peer = createPeer(userId);
    if (peer.signalingState !== 'stable' || peer.localDescription) {
      return;
    }

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    sendSignal(userId, { kind: 'offer', description: peer.localDescription });
  }, [createPeer, sendSignal]);

  const flushPendingIce = useCallback(async (userId, peer) => {
    const candidates = pendingIceRef.current.get(userId) || [];
    pendingIceRef.current.delete(userId);
    for (const candidate of candidates) {
      await peer.addIceCandidate(candidate);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !localReady || readyAnnouncedRef.current) {
      return;
    }
    readyAnnouncedRef.current = true;
    sendVoiceReady();
  }, [enabled, localReady, sendVoiceReady]);

  useEffect(() => {
    if (!enabled || !localReady || !localUserId || !localStreamRef.current) {
      return;
    }

    const remoteIds = new Set(remoteUsers.map((user) => user.userId));
    peersRef.current.forEach((_, userId) => {
      if (!remoteIds.has(userId)) {
        closePeer(userId);
      }
    });

    remoteUsers.forEach(async (user) => {
      if (!user.userId || user.userId === localUserId || localUserId > user.userId) {
        return;
      }
      await sendOffer(user.userId);
    });
  }, [closePeer, enabled, localReady, localUserId, remoteUsers, sendOffer]);

  useEffect(() => {
    if (
      !enabled
      || !localReady
      || !localUserId
      || !lastVoiceReady?.fromUserId
      || localUserId > lastVoiceReady.fromUserId
    ) {
      return;
    }
    sendOffer(lastVoiceReady.fromUserId).catch(() => {
      setError('음성 연결을 다시 시도해 주세요.');
    });
  }, [enabled, localReady, localUserId, lastVoiceReady, sendOffer]);

  useEffect(() => {
    if (!enabled || !localReady || !lastSignal?.fromUserId || !lastSignal.signal) {
      return;
    }

    const applySignal = async () => {
      const peer = createPeer(lastSignal.fromUserId);
      const { kind, description, candidate } = lastSignal.signal;

      if (kind === 'offer') {
        await peer.setRemoteDescription(description);
        await flushPendingIce(lastSignal.fromUserId, peer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendSignal(lastSignal.fromUserId, { kind: 'answer', description: peer.localDescription });
        return;
      }

      if (kind === 'answer') {
        if (peer.signalingState !== 'stable') {
          await peer.setRemoteDescription(description);
          await flushPendingIce(lastSignal.fromUserId, peer);
        }
        return;
      }

      if (kind === 'ice' && candidate) {
        if (!peer.remoteDescription) {
          const candidates = pendingIceRef.current.get(lastSignal.fromUserId) || [];
          candidates.push(candidate);
          pendingIceRef.current.set(lastSignal.fromUserId, candidates);
          return;
        }
        await peer.addIceCandidate(candidate);
      }
    };

    applySignal().catch(() => {
      setError('음성 연결을 다시 시도해 주세요.');
    });
  }, [createPeer, enabled, flushPendingIce, localReady, lastSignal, sendSignal]);

  const toggleMuted = useCallback(() => {
    setMuted((value) => !value);
  }, []);

  return {
    muted,
    localReady,
    remoteStreams,
    error,
    toggleMuted,
  };
}
