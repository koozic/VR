import { useEffect, useMemo, useState } from "react";
import { Compass } from "lucide-react";
import ArtworkInfoPanel from "../components/ArtworkInfoPanel.jsx";
import DocentSpeechBubble from "../components/DocentSpeechBubble.jsx";
import GalleryScene from "../three/GalleryScene.jsx";
import { fetchArtworks } from "../api/artworkApi.js";
import { requestDocentExplanation } from "../api/aiApi.js";

const YOUTUBE_INFO = {
  id: -1,
  title: "ダイダイダイダイダイキライ / 雨良 feat.初音ミク VS 重音テト",
  description: "전시 공간에서 함께 감상할 수 있는 영상입니다.",
  isYoutube: true,
};

const fallbackArtworks = [
  {
    id: 1,
    title: "Silent Horizon",
    artistName: "AI Exhibition Studio",
    year: 2026,
    description:
      "A calm study of light, depth, and stillness inside a virtual room.",
    imageUrl:
      "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-qtie.gif",
  },
  {
    id: 2,
    title: "Signal Garden",
    artistName: "AI Exhibition Studio",
    year: 2026,
    description:
      "Layered color fields that respond to the visitor path through the gallery.",
    imageUrl:
      "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-yunyun-syndrome.gif",
  },
];

export default function GalleryPage() {
  const [artworks, setArtworks] = useState(fallbackArtworks);
  const [selectedArtwork, setSelectedArtwork] = useState(fallbackArtworks[0]);
  const [docentMessage, setDocentMessage] = useState(
    "작품 가까이 이동하면 AI 도슨트 해설이 표시됩니다.",
  );

  useEffect(() => {
    fetchArtworks()
      .then((data) => {
        if (data.length > 0) {
          setArtworks(data);
          setSelectedArtwork(data[0]);
        }
      })
      .catch(() => {
        setArtworks(fallbackArtworks);
      });
  }, []);

  const artworkMap = useMemo(
    () => new Map(artworks.map((artwork) => [artwork.id, artwork])),
    [artworks],
  );

  const handleArtworkFocus = async (artworkId) => {
    if (artworkId === -1) {
      if (selectedArtwork?.id === -1) return;
      setSelectedArtwork(YOUTUBE_INFO);
      setDocentMessage("");
      return;
    }

    const artwork = artworkMap.get(artworkId);
    if (!artwork || selectedArtwork?.id === artwork.id) {
      return;
    }

    setSelectedArtwork(artwork);
    setDocentMessage("AI 도슨트가 작품 해설을 준비하고 있습니다.");

    try {
      const explanation = await requestDocentExplanation(artwork);
      setDocentMessage(explanation.message);
    } catch {
      setDocentMessage(
        artwork.description ||
          "작품의 색, 구도, 분위기를 천천히 감상해 보세요.",
      );
    }
  };

  return (
    <main className="gallery-page">
      <section
        className="scene-shell"
        aria-label="3D virtual exhibition gallery"
      >
        <GalleryScene artworks={artworks} onArtworkFocus={handleArtworkFocus} />
        <div className="hud">
          <Compass size={18} aria-hidden="true" />
          <span>WASD + 마우스로 이동</span>
        </div>
      </section>

      <aside className="side-panel">
        <ArtworkInfoPanel artwork={selectedArtwork} />
        <DocentSpeechBubble message={docentMessage} />
      </aside>
    </main>
  );
}
