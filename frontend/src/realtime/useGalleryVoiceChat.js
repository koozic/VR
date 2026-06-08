import { useCallback, useEffect, useRef, useState } from 'react';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

function describeMicrophoneError(error) {
  const errorName = error?.name || 'UnknownError';

  if (!window.isSecureContext) {
    return `마이크를 사용할 수 없는 주소입니다. HTTPS 또는 localhost로 접속해야 합니다. 현재: ${location.href}`;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return '이 브라우저에서 마이크 API를 사용할 수 없습니다. Chrome 최신 버전으로 접속하세요.';
  }

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return '마이크 권한이 차단되었습니다. 주소창 왼쪽 아이콘에서 마이크를 허용한 뒤 새로고침하세요.';
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return '사용 가능한 마이크 장치를 찾지 못했습니다. Windows 입력 장치와 Chrome 마이크 설정을 확인하세요.';
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return '마이크 장치를 열 수 없습니다. 다른 프로그램이 마이크를 사용 중이면 종료하고 다시 시도하세요.';
  }

  if (errorName === 'OverconstrainedError') {
    return '현재 마이크가 요청한 오디오 조건을 만족하지 못했습니다. 다른 입력 장치를 선택해 보세요.';
  }

  return `마이크 시작 실패: ${errorName}${error?.message ? ` - ${error.message}` : ''}`;
}

export function useGalleryVoiceChat({
  enabled,
  localUserId,
  remoteUsers,
  voiceReadyUserIds = [],
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
  const makingOffersRef = useRef(new Set());

  const closePeer = useCallback((userId) => {
    const peer = peersRef.current.get(userId);
    if (!peer) return;
    peer.close();
    peersRef.current.delete(userId);
    pendingIceRef.current.delete(userId);
    makingOffersRef.current.delete(userId);
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
      makingOffersRef.current.clear();
      setRemoteStreams([]);
      setLocalReady(false);
      readyAnnouncedRef.current = false;
      setError('');
      return undefined;
    }

    let cancelled = false;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(describeMicrophoneError());
      return () => {
        cancelled = true;
      };
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        setLocalReady(true);
        setError('');
      })
      .catch((microphoneError) => {
        if (!cancelled) {
          setError(describeMicrophoneError(microphoneError));
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

  const sendOffer = useCallback(async (userId, { resetStalePeer = false } = {}) => {
    if (makingOffersRef.current.has(userId)) {
      return;
    }

    if (resetStalePeer) {
      const existing = peersRef.current.get(userId);
      const hasRemoteAudio = remoteStreams.some((stream) => stream.userId === userId);
      if (
        existing
        && !hasRemoteAudio
        && !['connected', 'completed'].includes(existing.iceConnectionState)
      ) {
        closePeer(userId);
      }
    }

    const peer = createPeer(userId);
    if (peer.signalingState !== 'stable' || peer.localDescription) {
      return;
    }

    makingOffersRef.current.add(userId);
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSignal(userId, { kind: 'offer', description: peer.localDescription });
    } finally {
      makingOffersRef.current.delete(userId);
    }
  }, [closePeer, createPeer, remoteStreams, sendSignal]);

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

    const voiceReadyIds = new Set(voiceReadyUserIds);

    remoteUsers.forEach(async (user) => {
      if (
        !user.userId
        || user.userId === localUserId
        || localUserId > user.userId
        || !voiceReadyIds.has(user.userId)
      ) {
        return;
      }
      await sendOffer(user.userId);
    });
  }, [closePeer, enabled, localReady, localUserId, remoteUsers, sendOffer, voiceReadyUserIds]);

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
    sendOffer(lastVoiceReady.fromUserId, { resetStalePeer: true }).catch((offerError) => {
      setError(`음성 연결 제안 실패: ${offerError?.name || 'UnknownError'}${offerError?.message ? ` - ${offerError.message}` : ''}`);
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

    applySignal().catch((signalError) => {
      setError(`음성 연결 실패: ${signalError?.name || 'UnknownError'}`);
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
