/* WebRTC 음성 채팅 UI와 상대방 음성 스트림 재생을 담당한다. */
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function RemoteAudio({ stream, userId }) {
  const audioRef = useRef(null);
  const [playError, setPlayError] = useState('');

  const playRemoteAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = false;
      audio.volume = 1;
      await audio.play();
      setPlayError('');
    } catch (error) {
      setPlayError(`브라우저가 자동 재생을 막았습니다. 소리 재생을 눌러 주세요. (${error?.name || 'play failed'})`);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.srcObject = stream;
    playRemoteAudio();

    return () => {
      audio.pause();
      audio.srcObject = null;
    };
  }, [stream]);

  return (
    <div className="gallery-voice__remote">
      <p className="gallery-voice__meta">상대방 음성: {userId}</p>
      <audio ref={audioRef} autoPlay controls playsInline />
      {playError && (
        <>
          <button type="button" className="gallery-voice__button" onClick={playRemoteAudio}>
            <Volume2 size={16} aria-hidden="true" />
            <span>소리 재생</span>
          </button>
          <p className="gallery-voice__error">{playError}</p>
        </>
      )}
    </div>
  );
}

function statusLabel({ connected, enabled, localReady, muted, error }) {
  if (!connected) return '서버 연결 중';
  if (enabled && error) return '마이크 사용 불가';
  if (enabled && localReady && muted) return '연결됨 · 마이크 꺼짐';
  if (enabled && localReady) return '연결됨 · 말하는 중';
  if (enabled) return '마이크 준비 중';
  return '참여하지 않음';
}

function remoteLabel({ connectedPeerCount, connectingPeerCount }) {
  if (connectedPeerCount > 0) {
    return `${connectedPeerCount}명과 음성 연결됨`;
  }
  if (connectingPeerCount > 0) {
    return `${connectingPeerCount}명과 음성 연결 중`;
  }
  return '다른 사용자가 음성 채팅에 들어오기를 기다리고 있습니다.';
}

export default function GalleryVoiceChat({
  enabled,
  connected,
  muted,
  localReady,
  remoteStreams,
  connectedPeerCount,
  connectingPeerCount,
  secureVoiceUrl,
  error,
  onToggleEnabled,
  onToggleMuted,
}) {
  return (
    <section className="panel gallery-voice">
      <div className="gallery-voice__header">
        <h3>사용자 음성 채팅</h3>
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
          title={enabled ? '음성 채팅 나가기' : '음성 채팅 참여'}
        >
          {enabled ? <PhoneOff size={16} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
          <span>{enabled ? '나가기' : '참여하기'}</span>
        </button>

        <button
          type="button"
          className={!muted ? 'gallery-voice__button gallery-voice__button--talking' : 'gallery-voice__button'}
          onClick={onToggleMuted}
          disabled={!enabled || !localReady}
          title={muted ? '마이크 켜기' : '마이크 끄기'}
        >
          {muted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
          <span>{muted ? '마이크 켜기' : '말하는 중'}</span>
        </button>
      </div>

      <p className="gallery-voice__meta">
        상태: {statusLabel({ connected, enabled, localReady, muted, error })}
      </p>
      <p className="gallery-voice__meta">
        {remoteLabel({ connectedPeerCount, connectingPeerCount })}
      </p>
      {error && <p className="gallery-voice__error">{error}</p>}
      {secureVoiceUrl && (
        <a className="gallery-voice__secure-link" href={secureVoiceUrl}>
          HTTPS 주소로 다시 접속
        </a>
      )}

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
