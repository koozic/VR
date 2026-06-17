/* WebRTC 음성 채팅: 마이크, 사용자 간 연결, offer/answer/ICE 신호를 관리한다. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildWebRtcIceServers } from './webRtcIceServers.js';
import { calculateAudioRms, nextVoiceActivity } from './voiceActivity.js';
import { shouldInitiateVoiceOffer } from './voicePeerPolicy.js';

const ICE_SERVERS = buildWebRtcIceServers(import.meta.env);
const DISCONNECTED_GRACE_MS = 5000;
const GATE_ATTACK_TIME = 0.015;
const GATE_RELEASE_TIME = 0.07;

function buildMicrophoneConstraints() {
  const supported = navigator.mediaDevices?.getSupportedConstraints?.() || {};
  const audio = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (supported.channelCount) audio.channelCount = { ideal: 1 };
  if (supported.sampleRate) audio.sampleRate = { ideal: 48000 };
  if (supported.sampleSize) audio.sampleSize = { ideal: 16 };

  return { audio, video: false };
}

function createOutgoingVoiceProcessor(stream) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  const gate = audioContext.createGain();
  const destination = audioContext.createMediaStreamDestination();

  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.55;
  gate.gain.value = 0;

  source.connect(analyser);
  source.connect(gate);
  gate.connect(destination);
  audioContext.resume().catch(() => {});

  return {
    stream: destination.stream,
    audioContext,
    source,
    analyser,
    gate,
    destination,
  };
}

function closeOutgoingVoiceProcessor(processor) {
  if (!processor) return;
  processor.source?.disconnect();
  processor.analyser?.disconnect();
  processor.gate?.disconnect();
  processor.destination?.disconnect?.();
  processor.stream?.getTracks().forEach((track) => track.stop());
  processor.audioContext?.close?.().catch(() => {});
}

function setGateOpen(processor, open) {
  if (!processor?.gate || !processor?.audioContext) return;

  const { audioContext, gate } = processor;
  const target = open ? 1 : 0;
  const timeConstant = open ? GATE_ATTACK_TIME : GATE_RELEASE_TIME;
  gate.gain.cancelScheduledValues(audioContext.currentTime);
  gate.gain.setTargetAtTime(target, audioContext.currentTime, timeConstant);
}

function describeMicrophoneError(error) {
  const errorName = error?.name || 'UnknownError';

  if (!window.isSecureContext) {
    return `마이크는 HTTPS 또는 localhost에서만 사용할 수 있습니다. 현재 주소: ${location.href}`;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return '이 브라우저는 마이크 기능을 지원하지 않습니다. 최신 Chrome 또는 Edge를 사용해 주세요.';
  }

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return '마이크 권한이 차단되었습니다. 주소창 옆 권한 설정에서 마이크를 허용한 뒤 다시 입장해 주세요.';
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return '사용 가능한 마이크를 찾지 못했습니다. Windows와 브라우저의 입력 장치를 확인해 주세요.';
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return '마이크를 시작할 수 없습니다. 다른 프로그램이 마이크를 사용 중인지 확인해 주세요.';
  }

  if (errorName === 'OverconstrainedError') {
    return '현재 마이크가 요청한 음성 조건을 지원하지 않습니다. 다른 입력 장치를 선택해 주세요.';
  }

  return `마이크 시작 실패: ${errorName}${error?.message ? ` - ${error.message}` : ''}`;
}

function describeConnectionError(error) {
  return `음성 연결 실패: ${error?.name || 'UnknownError'}${error?.message ? ` - ${error.message}` : ''}`;
}

function getSecureVoiceUrl() {
  if (window.isSecureContext || location.protocol !== 'http:') {
    return '';
  }
  return `https://${location.host}${location.pathname}${location.search}${location.hash}`;
}

export function useGalleryVoiceChat({
  enabled,
  localUserId,
  remoteUsers,
  voiceReadyUserIds = [],
  sendSignal,
  sendVoiceState,
  sendVoiceActivity,
  subscribeToSignals,
}) {
  const [muted, setMuted] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [peerStates, setPeerStates] = useState({});
  const [error, setError] = useState('');
  const [localReady, setLocalReady] = useState(false);
  const [negotiationVersion, setNegotiationVersion] = useState(0);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const rawStreamRef = useRef(null);
  const voiceProcessorRef = useRef(null);
  const readyAnnouncedRef = useRef(false);
  const pendingIceRef = useRef(new Map());
  const makingOffersRef = useRef(new Set());
  const disconnectTimersRef = useRef(new Map());
  const signalQueueRef = useRef(Promise.resolve());
  const voiceSessionRef = useRef(0);
  const localSpeakingRef = useRef(false);

  const publishVoiceActivity = useCallback((speaking) => {
    if (localSpeakingRef.current === speaking) return;
    localSpeakingRef.current = speaking;
    sendVoiceActivity(speaking);
  }, [sendVoiceActivity]);

  const updatePeerState = useCallback((userId, state) => {
    setPeerStates((states) => ({ ...states, [userId]: state }));
  }, []);

  const closePeer = useCallback((userId) => {
    const disconnectTimer = disconnectTimersRef.current.get(userId);
    if (disconnectTimer !== undefined) {
      clearTimeout(disconnectTimer);
      disconnectTimersRef.current.delete(userId);
    }

    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peersRef.current.delete(userId);
    }

    pendingIceRef.current.delete(userId);
    makingOffersRef.current.delete(userId);
    setRemoteStreams((streams) => streams.filter((stream) => stream.userId !== userId));
    setPeerStates((states) => {
      if (!(userId in states)) return states;
      const next = { ...states };
      delete next[userId];
      return next;
    });
  }, []);

  const closeAllPeers = useCallback(() => {
    Array.from(peersRef.current.keys()).forEach(closePeer);
    pendingIceRef.current.clear();
    makingOffersRef.current.clear();
    setRemoteStreams([]);
    setPeerStates({});
  }, [closePeer]);

  const createPeer = useCallback((userId) => {
    const existing = peersRef.current.get(userId);
    if (existing) return existing;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(userId, peer);
    updatePeerState(userId, 'connecting');

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(userId, {
          kind: 'ice',
          candidate: event.candidate.toJSON?.() || event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;

      setRemoteStreams((streams) => {
        const next = new Map(streams.map((item) => [item.userId, item.stream]));
        next.set(userId, stream);
        return Array.from(next, ([remoteUserId, remoteStream]) => ({
          userId: remoteUserId,
          stream: remoteStream,
        }));
      });
    };

    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;
      updatePeerState(userId, state);

      if (state === 'connected') {
        const timer = disconnectTimersRef.current.get(userId);
        if (timer !== undefined) {
          clearTimeout(timer);
          disconnectTimersRef.current.delete(userId);
        }
        return;
      }

      if (state === 'failed' || state === 'closed') {
        closePeer(userId);
        setNegotiationVersion((version) => version + 1);
        return;
      }

      if (state === 'disconnected' && !disconnectTimersRef.current.has(userId)) {
        const timer = setTimeout(() => {
          disconnectTimersRef.current.delete(userId);
          if (['disconnected', 'failed'].includes(peer.connectionState)) {
            closePeer(userId);
            setNegotiationVersion((version) => version + 1);
          }
        }, DISCONNECTED_GRACE_MS);
        disconnectTimersRef.current.set(userId, timer);
      }
    };

    return peer;
  }, [closePeer, sendSignal, updatePeerState]);

  const flushPendingIce = useCallback(async (userId, peer) => {
    const candidates = pendingIceRef.current.get(userId) || [];
    pendingIceRef.current.delete(userId);
    for (const candidate of candidates) {
      await peer.addIceCandidate(candidate);
    }
  }, []);

  const sendOffer = useCallback(async (userId) => {
    if (makingOffersRef.current.has(userId)) return;

    const peer = createPeer(userId);
    if (
      peer.signalingState !== 'stable'
      || peer.localDescription
      || ['connected', 'connecting'].includes(peer.connectionState)
    ) {
      return;
    }

    makingOffersRef.current.add(userId);
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSignal(userId, {
        kind: 'offer',
        description: peer.localDescription,
      });
    } finally {
      makingOffersRef.current.delete(userId);
    }
  }, [createPeer, sendSignal]);

  const applySignal = useCallback(async ({ fromUserId, signal }) => {
    if (!fromUserId || !signal) return;

    let peer = createPeer(fromUserId);
    const { kind, description, candidate } = signal;

    if (kind === 'offer' && description?.type === 'offer') {
      if (peer.signalingState !== 'stable') {
        closePeer(fromUserId);
        peer = createPeer(fromUserId);
      }
      await peer.setRemoteDescription(description);
      await flushPendingIce(fromUserId, peer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      sendSignal(fromUserId, {
        kind: 'answer',
        description: peer.localDescription,
      });
      return;
    }

    if (kind === 'answer' && description?.type === 'answer') {
      if (peer.signalingState === 'have-local-offer') {
        await peer.setRemoteDescription(description);
        await flushPendingIce(fromUserId, peer);
      }
      return;
    }

    if (kind === 'ice' && candidate) {
      if (!peer.remoteDescription) {
        const candidates = pendingIceRef.current.get(fromUserId) || [];
        candidates.push(candidate);
        pendingIceRef.current.set(fromUserId, candidates);
        return;
      }
      await peer.addIceCandidate(candidate);
    }
  }, [closePeer, createPeer, flushPendingIce, sendSignal]);

  useEffect(() => {
    if (!enabled) {
      voiceSessionRef.current += 1;
      const rawStream = rawStreamRef.current;
      const localStream = localStreamRef.current;
      if (localStream && localStream !== rawStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      rawStream?.getTracks().forEach((track) => track.stop());
      closeOutgoingVoiceProcessor(voiceProcessorRef.current);
      rawStreamRef.current = null;
      localStreamRef.current = null;
      voiceProcessorRef.current = null;
      publishVoiceActivity(false);
      closeAllPeers();
      setMuted(true);
      setLocalReady(false);
      readyAnnouncedRef.current = false;
      setError('');
      return undefined;
    }

    let cancelled = false;
    const sessionId = voiceSessionRef.current + 1;
    voiceSessionRef.current = sessionId;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(describeMicrophoneError());
      return undefined;
    }

    setError('');
    navigator.mediaDevices.getUserMedia(buildMicrophoneConstraints())
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        let processor = null;
        try {
          processor = createOutgoingVoiceProcessor(stream);
        } catch (processorError) {
          console.warn('Voice noise gate is unavailable. Falling back to the raw microphone stream.', processorError);
        }
        const outgoingStream = processor?.stream || stream;

        rawStreamRef.current = stream;
        localStreamRef.current = outgoingStream;
        voiceProcessorRef.current = processor;
        outgoingStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          track.addEventListener('ended', () => {
            publishVoiceActivity(false);
            setGateOpen(voiceProcessorRef.current, false);
            setError('마이크 연결이 종료되었습니다. 음성 채팅에서 나간 뒤 다시 입장해 주세요.');
            setLocalReady(false);
          }, { once: true });
        });
        setMuted(true);
        setLocalReady(true);
      })
      .catch((microphoneError) => {
        if (!cancelled) {
          setError(describeMicrophoneError(microphoneError));
          setLocalReady(false);
        }
      });

    return () => {
      cancelled = true;
      if (voiceSessionRef.current === sessionId) {
        voiceSessionRef.current += 1;
      }
      const rawStream = rawStreamRef.current;
      const localStream = localStreamRef.current;
      if (localStream && localStream !== rawStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      rawStream?.getTracks().forEach((track) => track.stop());
      closeOutgoingVoiceProcessor(voiceProcessorRef.current);
      rawStreamRef.current = null;
      localStreamRef.current = null;
      voiceProcessorRef.current = null;
      publishVoiceActivity(false);
      closeAllPeers();
      setLocalReady(false);
    };
  }, [closeAllPeers, enabled, publishVoiceActivity]);

  useEffect(() => {
    rawStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
    if (muted) {
      setGateOpen(voiceProcessorRef.current, false);
    }
  }, [muted]);

  useEffect(() => {
    if (!enabled || !localReady || muted || !rawStreamRef.current) {
      publishVoiceActivity(false);
      setGateOpen(voiceProcessorRef.current, false);
      return undefined;
    }

    const processor = voiceProcessorRef.current;
    let audioContext = processor?.audioContext;
    let analyser = processor?.analyser;
    let source = null;
    let ownsAudioContext = false;

    if (!analyser) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return undefined;
      }

      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(rawStreamRef.current);
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.55;
      source.connect(analyser);
      ownsAudioContext = true;
    }

    if (!audioContext || !analyser) {
      return undefined;
    }

    let animationId = 0;
    let lastSampleAt = 0;
    let activity = { speaking: false, lastVoiceAt: 0 };

    const samples = new Uint8Array(analyser.fftSize);
    audioContext.resume().catch(() => {});

    const analyze = (now) => {
      if (now - lastSampleAt >= 80) {
        lastSampleAt = now;
        analyser.getByteTimeDomainData(samples);
        activity = nextVoiceActivity({
          ...activity,
          rms: calculateAudioRms(samples),
          now,
        });
        setGateOpen(processor, activity.speaking);
        publishVoiceActivity(activity.speaking);
      }
      animationId = requestAnimationFrame(analyze);
    };
    animationId = requestAnimationFrame(analyze);

    return () => {
      cancelAnimationFrame(animationId);
      setGateOpen(processor, false);
      if (ownsAudioContext) {
        source?.disconnect();
        analyser.disconnect();
        audioContext.close().catch(() => {});
      }
      publishVoiceActivity(false);
    };
  }, [enabled, localReady, muted, publishVoiceActivity]);

  useEffect(() => {
    if (!enabled || !localReady || typeof subscribeToSignals !== 'function') {
      return undefined;
    }

    return subscribeToSignals((signalEvent) => {
      const sessionId = voiceSessionRef.current;
      signalQueueRef.current = signalQueueRef.current
        .then(() => {
          if (voiceSessionRef.current !== sessionId || !localStreamRef.current) {
            return undefined;
          }
          return applySignal(signalEvent);
        })
        .catch((signalError) => {
          if (voiceSessionRef.current === sessionId) {
            setError(describeConnectionError(signalError));
          }
        });
    });
  }, [applySignal, enabled, localReady, subscribeToSignals]);

  useEffect(() => {
    if (!enabled || !localReady || readyAnnouncedRef.current) {
      return undefined;
    }

    readyAnnouncedRef.current = true;
    sendVoiceState(true);

    return () => {
      sendVoiceState(false);
      readyAnnouncedRef.current = false;
    };
  }, [enabled, localReady, sendVoiceState]);

  useEffect(() => {
    if (!enabled || !localReady || !localUserId || !localStreamRef.current) {
      return;
    }

    const remoteIds = new Set(remoteUsers.map((user) => user.userId));
    const readyIds = new Set(voiceReadyUserIds);

    peersRef.current.forEach((_, userId) => {
      if (!remoteIds.has(userId) || !readyIds.has(userId)) {
        closePeer(userId);
      }
    });

    remoteUsers.forEach((user) => {
      if (
        user.userId
        && readyIds.has(user.userId)
        && shouldInitiateVoiceOffer(localUserId, user.userId)
      ) {
        sendOffer(user.userId).catch((offerError) => {
          setError(describeConnectionError(offerError));
        });
      }
    });
  }, [
    closePeer,
    enabled,
    localReady,
    localUserId,
    negotiationVersion,
    remoteUsers,
    sendOffer,
    voiceReadyUserIds,
  ]);

  const toggleMuted = useCallback(() => {
    setMuted((value) => !value);
  }, []);

  const connectedPeerCount = useMemo(
    () => Object.values(peerStates).filter((state) => state === 'connected').length,
    [peerStates],
  );
  const connectingPeerCount = useMemo(
    () => Object.values(peerStates).filter((state) => (
      state === 'new' || state === 'connecting' || state === 'disconnected'
    )).length,
    [peerStates],
  );

  return {
    muted,
    localReady,
    remoteStreams,
    connectedPeerCount,
    connectingPeerCount,
    secureVoiceUrl: getSecureVoiceUrl(),
    error,
    toggleMuted,
  };
}
