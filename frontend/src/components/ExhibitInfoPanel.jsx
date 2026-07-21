import { useEffect, useState } from 'react';

export default function ExhibitInfoPanel({ exhibit, onGameLaunch, onToggleMute, isMuted }) {
  const [imgError, setImgError] = useState(false);
  const isSpeakerGuide = exhibit?.type === 'speaker-guide' || exhibit?.type === 'speaker-youtube';
  const canToggleVideoAudio = isSpeakerGuide || exhibit?.type === 'youtube' || exhibit?.type === 'video';

  useEffect(() => {
    setImgError(false);
  }, [exhibit?.id, exhibit?.thumbnailUrl]);

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
          className={`exhibit-thumb${isSpeakerGuide ? ' exhibit-thumb--easter-egg' : ''}`}
          onError={() => setImgError(true)}
        />
      )}

      {isSpeakerGuide && <span className="badge badge--speaker">전시관 영상 안내</span>}

      {(exhibit.type === 'youtube' || exhibit.type === 'video') && <span className="badge">동영상</span>}
      {canToggleVideoAudio && (
        <button className="play-btn" onClick={() => onToggleMute?.()}>
          {isMuted ? '소리 켜기' : '소리 끄기'}
        </button>
      )}
      {exhibit.type === 'portal' && <span className="badge badge--portal">포탈</span>}
      {exhibit.type === 'game' && <span className="badge badge--game">레트로 게임</span>}
      <h2>{isSpeakerGuide ? '전시관 설명 영상' : exhibit.title}</h2>
      <p>
        {isSpeakerGuide
          ? '두 스피커 사이의 중앙 화면에서 전시관 설명 영상을 감상할 수 있습니다. 영상의 소리는 설명 영상 정보 패널에서 켜거나 끌 수 있습니다.'
          : exhibit.description}
      </p>
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
