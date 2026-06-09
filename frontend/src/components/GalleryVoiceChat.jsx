/* WebRTC 기반 음성 채팅 UI 컴포넌트. RemoteAudio는 상대방 음성 스트림 재생 */
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function RemoteAudio({ stream, userId }) {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const [playError, setPlayError] = useState('');

  const playRemoteAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = false;
      audio.volume = 1;
      await audio.play();

      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
          sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
          sourceRef.current.connect(audioContextRef.current.destination);
        }
      }

      await audioContextRef.current?.resume?.();
      setPlayError('');
    } catch (error) {
      setPlayError(`Browser blocked audio playback. Click Play sound. (${error?.name || 'play failed'})`);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.srcObject = stream;
    audio.volume = 1;
    playRemoteAudio();

    return () => {
      sourceRef.current?.disconnect?.();
      sourceRef.current = null;
      audioContextRef.current?.close?.();
      audioContextRef.current = null;
      audio.srcObject = null;
    };
  }, [stream]);

  return (
    <div className="gallery-voice__remote">
      <p className="gallery-voice__meta">Remote voice: {userId}</p>
      <button type="button" className="gallery-voice__button" onClick={playRemoteAudio}>
        <Volume2 size={16} aria-hidden="true" />
        <span>Play sound</span>
      </button>
      <audio ref={audioRef} controls playsInline />
      {playError && <p className="gallery-voice__error">{playError}</p>}
    </div>
  );
}

function statusLabel({ connected, enabled, localReady }) {
  if (!connected) return 'Server connecting';
  if (enabled && localReady) return 'Mic ready';
  if (enabled) return 'Mic preparing';
  return 'Off';
}

function remoteLabel(count) {
  if (count > 0) {
    return `${count} remote audio stream(s). If you hear nothing, click Play sound.`;
  }
  return 'Waiting for another user to join voice.';
}

/* 참가/나가기, 음소거, 원격 음성 스트림 목록을 표시하는 음성 채팅 패널 */
export default function GalleryVoiceChat({
  enabled,
  connected,
  muted,
  localReady,
  remoteStreams,
  error,
  onToggleEnabled,
  onToggleMuted,
}) {
  return (
    <section className="panel gallery-voice">
      <div className="gallery-voice__header">
        <h3>User voice</h3>
        <span className={enabled && localReady ? 'gallery-voice__state' : 'gallery-voice__state gallery-voice__state--off'}>
          {enabled && localReady ? 'ON' : 'OFF'}
        </span>
      </div>

      <div className="gallery-voice__controls">
        <button
          type="button"
          className={enabled ? 'gallery-voice__button gallery-voice__button--danger' : 'gallery-voice__button'}
          onClick={onToggleEnabled}
          disabled={!connected}
          title={enabled ? 'Leave voice chat' : 'Join voice chat'}
        >
          {enabled ? <PhoneOff size={16} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
          <span>{enabled ? 'Leave' : 'Join'}</span>
        </button>

        <button
          type="button"
          className={muted ? 'gallery-voice__button gallery-voice__button--active' : 'gallery-voice__button'}
          onClick={onToggleMuted}
          disabled={!enabled || !localReady}
          title={muted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {muted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
          <span>{muted ? 'Muted' : 'Talk'}</span>
        </button>
      </div>

      <p className="gallery-voice__meta">
        Status: {statusLabel({ connected, enabled, localReady })}
      </p>
      <p className="gallery-voice__meta">{remoteLabel(remoteStreams.length)}</p>
      {error && <p className="gallery-voice__error">{error}</p>}

      {remoteStreams.length > 0 && (
        <div className="gallery-voice__audio">
          {remoteStreams.map(({ userId, stream }) => (
            <RemoteAudio key={userId} userId={userId} stream={stream} />
          ))}
        </div>
      )}
    </section>
  );
}
