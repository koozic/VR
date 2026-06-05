export default function ExhibitInfoPanel({ exhibit, onGameLaunch }) {
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
      {exhibit.thumbnailUrl && (
        <img src={exhibit.thumbnailUrl} alt={exhibit.title} className="exhibit-thumb" />
      )}
      {exhibit.type === 'youtube' && <span className="badge">동영상</span>}
      {exhibit.type === 'portal' && <span className="badge badge--portal">포털</span>}
      {exhibit.type === 'game' && <span className="badge badge--game">레트로 게임</span>}
      <h2>{exhibit.title}</h2>
      <p>{exhibit.description}</p>
      {exhibit.type === 'game' && exhibit.contentUrl && (
        <button className="play-btn" onClick={() => onGameLaunch?.(exhibit)}>
          🎮 플레이하기
        </button>
      )}
      <div className="metadata">
        <span>작가: {exhibit.creator || 'Unknown'}</span>
        <span>전시관: {exhibit.hallId || 'N/A'}</span>
      </div>
    </section>
  );
}
