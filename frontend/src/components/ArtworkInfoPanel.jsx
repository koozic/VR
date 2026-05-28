export default function ArtworkInfoPanel({ artwork }) {
  if (!artwork) {
    return (
      <section className="panel">
        <h2>작품 정보</h2>
        <p>전시 작품을 불러오는 중입니다.</p>
      </section>
    );
  }

  if (artwork.isYoutube) {
    return (
      <section className="panel panel--youtube">
        <h2>{artwork.title}</h2>
        <span className="badge">동영상</span>
        <p>{artwork.description}</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{artwork.title}</h2>
      <p>{artwork.description}</p>
      <div className="metadata">
        <span>작가: {artwork.artistName || 'Unknown'}</span>
        <span>연도: {artwork.year || 'N/A'}</span>
      </div>
    </section>
  );
}

