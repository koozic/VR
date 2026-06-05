import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

function RemoteAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

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
        <h3>유저 음성</h3>
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
          title={enabled ? '음성 채팅 나가기' : '음성 채팅 참가'}
        >
          {enabled ? <PhoneOff size={16} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
          <span>{enabled ? '나가기' : '참가'}</span>
        </button>
        <button
          type="button"
          className={muted ? 'gallery-voice__button gallery-voice__button--active' : 'gallery-voice__button'}
          onClick={onToggleMuted}
          disabled={!enabled || !localReady}
          title={muted ? '마이크 켜기' : '마이크 끄기'}
        >
          {muted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
          <span>{muted ? '뮤트 중' : '말하기'}</span>
        </button>
      </div>
      <p className="gallery-voice__meta">
        {remoteStreams.length > 0 ? `${remoteStreams.length}명과 연결됨` : '같은 전시관 유저와 자동 연결'}
      </p>
      {error && <p className="gallery-voice__error">{error}</p>}
      <div className="gallery-voice__audio" aria-hidden="true">
        {remoteStreams.map(({ userId, stream }) => (
          <RemoteAudio key={userId} stream={stream} />
        ))}
      </div>
    </section>
  );
}
