import { useEffect, useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import ExhibitInfoPanel from '../components/ExhibitInfoPanel.jsx';
import DocentSpeechBubble from '../components/DocentSpeechBubble.jsx';
import GalleryScene from '../three/GalleryScene.jsx';
import { fetchExhibits } from '../api/exhibitApi.js';
import { requestDocentExplanation } from '../api/aiApi.js';

const fallbackExhibits = [
  {
    id: 1,
    title: 'Silent Horizon',
    creator: 'AI Exhibition Studio',
    hallId: 1,
    description: 'A calm study of light, depth, and stillness inside a virtual room.',
  },
  {
    id: 2,
    title: 'Signal Garden',
    creator: 'AI Exhibition Studio',
    hallId: 1,
    description: 'Layered color fields that respond to the visitor path through the gallery.',
  },
];

export default function GalleryPage() {
  const [exhibits, setExhibits] = useState(fallbackExhibits);
  const [selectedExhibit, setSelectedExhibit] = useState(fallbackExhibits[0]);
  const [docentMessage, setDocentMessage] = useState('작품 가까이 이동하면 AI 도슨트 해설이 표시됩니다.');

  useEffect(() => {
    fetchExhibits()
      .then((data) => {
        if (data.length > 0) {
          setExhibits(data);
          setSelectedExhibit(data[0]);
        }
      })
      .catch(() => {
        setExhibits(fallbackExhibits);
      });
  }, []);

  const exhibitMap = useMemo(
    () => new Map(exhibits.map((exhibit) => [exhibit.id, exhibit])),
    [exhibits],
  );

  const handleExhibitFocus = async (exhibitId) => {
    const exhibit = exhibitMap.get(exhibitId);
    if (!exhibit || selectedExhibit?.id === exhibit.id) {
      return;
    }

    setSelectedExhibit(exhibit);
    setDocentMessage('AI 도슨트가 작품 해설을 준비하고 있습니다.');

    try {
      const explanation = await requestDocentExplanation(exhibit);
      setDocentMessage(explanation.message);
    } catch {
      setDocentMessage(exhibit.description || '작품의 색, 구도, 분위기를 천천히 감상해 보세요.');
    }
  };

  return (
    <main className="gallery-page">
      <section className="scene-shell" aria-label="3D virtual exhibition gallery">
        <GalleryScene exhibits={exhibits} onExhibitFocus={handleExhibitFocus} />
        <div className="hud">
          <Compass size={18} aria-hidden="true" />
          <span>WASD 또는 방향키로 이동</span>
        </div>
      </section>

      <aside className="side-panel">
        <ExhibitInfoPanel exhibit={selectedExhibit} />
        <DocentSpeechBubble message={docentMessage} />
      </aside>
    </main>
  );
}
