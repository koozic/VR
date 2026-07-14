import { useEffect, useRef, useState } from 'react';

export default function ExhibitInfoPanel({ exhibit, onGameLaunch, onToggleMute, isMuted }) {
  const [imgError, setImgError] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(true);
  const [speakerPlaying, setSpeakerPlaying] = useState(false);
  const speakerPlayerRef = useRef(null);

  const isSpeakerYouTube = exhibit?.type === 'speaker-youtube';
  const speakerVideoId = isSpeakerYouTube ? getYouTubeVideoId(exhibit.contentUrl) : null;

  useEffect(() => {
    setImgError(false);
    setSpeakerMuted(true);
    setSpeakerPlaying(false);
  }, [exhibit?.id, exhibit?.thumbnailUrl]);

  const sendSpeakerCommand = (command, args = '') => {
    const playerWindow = speakerPlayerRef.current?.contentWindow;
    if (!playerWindow) return;
    playerWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args }),
      '*',
    );
  };

  const playSpeaker = () => {
    sendSpeakerCommand(speakerMuted ? 'mute' : 'unMute');
    sendSpeakerCommand('playVideo');
    setSpeakerPlaying(true);
  };

  const pauseSpeaker = () => {
    sendSpeakerCommand('pauseVideo');
    setSpeakerPlaying(false);
  };

  const restartSpeaker = () => {
    sendSpeakerCommand('seekTo', [0, true]);
    sendSpeakerCommand(speakerMuted ? 'mute' : 'unMute');
    sendSpeakerCommand('playVideo');
    setSpeakerPlaying(true);
  };

  const toggleSpeakerMute = () => {
    const nextMuted = !speakerMuted;
    sendSpeakerCommand(nextMuted ? 'mute' : 'unMute');
    setSpeakerMuted(nextMuted);
    if (!speakerPlaying) {
      sendSpeakerCommand('playVideo');
      setSpeakerPlaying(true);
    }
  };

  if (!exhibit) {
    return (
      <section className="panel">
        <h2>전시 정보</h2>
        <p>전시 작품을 불러오는 중입니다.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      {exhibit.thumbnailUrl && !imgError && (
        <img
          src={exhibit.thumbnailUrl}
          alt={exhibit.title}
          className={`exhibit-thumb${isSpeakerYouTube ? ' exhibit-thumb--easter-egg' : ''}`}
          onError={() => setImgError(true)}
        />
      )}

      {isSpeakerYouTube && <span className="badge badge--speaker">YouTube Speaker</span>}
      {isSpeakerYouTube && speakerVideoId && (
        <div className="youtube-speaker-control">
          <iframe
            ref={speakerPlayerRef}
            className="youtube-speaker-control__player"
            src={`https://www.youtube.com/embed/${speakerVideoId}?enablejsapi=1&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0`}
            title={`${exhibit.title} hidden YouTube player`}
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="youtube-speaker-control__buttons" aria-label="YouTube audio controls">
            <button type="button" onClick={speakerPlaying ? pauseSpeaker : playSpeaker}>
              {speakerPlaying ? '일시정지' : '재생'}
            </button>
            <button type="button" onClick={toggleSpeakerMute}>
              {speakerMuted ? '소리 켜기' : '음소거'}
            </button>
            <button type="button" onClick={restartSpeaker}>
              처음부터
            </button>
          </div>
        </div>
      )}

      {(exhibit.type === 'youtube' || exhibit.type === 'video') && <span className="badge">동영상</span>}
      {(exhibit.type === 'youtube' || exhibit.type === 'video') && (
        <button className="play-btn" onClick={() => onToggleMute?.()}>
          {isMuted ? '소리 켜기' : '소리 끄기'}
        </button>
      )}
      {exhibit.type === 'portal' && <span className="badge badge--portal">포탈</span>}
      {exhibit.type === 'game' && <span className="badge badge--game">레트로 게임</span>}
      <h2>{exhibit.title}</h2>
      <p>{exhibit.description}</p>
      {exhibit.type === 'game' && exhibit.contentUrl && (
        <button className="play-btn" onClick={() => onGameLaunch?.(exhibit)}>
          플레이하기
        </button>
      )}
      <div className="metadata">
        <span>작가: {exhibit.creator || 'Unknown'}</span>
        <span>전시관: {exhibit.hallId || 'N/A'}</span>
      </div>
    </section>
  );
}

function getYouTubeVideoId(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (url.searchParams.get('v')) {
      return url.searchParams.get('v');
    }
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIndex = parts.indexOf('embed');
    if (embedIndex >= 0) {
      return parts[embedIndex + 1] || null;
    }
  } catch {
    // Raw video ids are also supported.
  }

  return /^[\w-]{6,}$/.test(text) ? text : null;
}
