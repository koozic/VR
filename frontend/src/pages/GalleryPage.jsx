import { useEffect, useMemo, useState } from "react";
import { Compass } from "lucide-react";
import ArtworkInfoPanel from "../components/ArtworkInfoPanel.jsx";
import DocentSpeechBubble from "../components/DocentSpeechBubble.jsx";
import RoomHUD from "../components/RoomHUD.jsx";
import GalleryScene from "../three/GalleryScene.jsx";
import { fetchRoomDetail } from "../api/artworkApi.js";
import { requestDocentExplanation } from "../api/aiApi.js";

const fallbackRoom = {
  id: 1,
  name: "Main Gallery",
  cameraY: 1.6,
  wallColor: "#e8e0d2",
  floorColor: "#9a9488",
  ceilingColor: "#ded8cb",
  ambientLightColor: "#ffffff",
  lightIntensity: 1.18,
  exhibits: [
    {
      id: 1, title: "Silent Horizon", artistName: "AI Exhibition Studio",
      year: 2026, description: "A calm study of light, depth, and stillness inside a virtual room.",
      imageUrl: "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-qtie.gif",
      type: "image", wallIndex: 0, posX: -4.8, posY: 2.18, posZ: -10.82, rotationY: 0, wide: false,
    },
    {
      id: 8, title: "Gallery Video", artistName: null,
      year: null, description: "전시와 함께 감상할 수 있는 영상입니다.",
      imageUrl: null, type: "youtube", contentUrl: "klIxS5o65C4",
      wallIndex: 0, posX: -1.8, posY: 2.18, posZ: -10.82, rotationY: 0, wide: null,
    },
    {
      id: 2, title: "Signal Garden", artistName: "AI Exhibition Studio",
      year: 2026, description: "Layered color fields that respond to the visitor path through the gallery.",
      imageUrl: "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-yunyun-syndrome.gif",
      type: "image", wallIndex: 0, posX: 3.3, posY: 2.18, posZ: -10.82, rotationY: 0, wide: true,
    },
    {
      id: 3, title: "Green Hour", artistName: "AI Exhibition Studio",
      year: 2026, description: "A tranquil green landscape at dusk.",
      type: "image", wallIndex: 1, posX: -8.82, posY: 2.18, posZ: -4.5, rotationY: Math.PI / 2, wide: false,
    },
    {
      id: 4, title: "Quiet Street", artistName: "AI Exhibition Studio",
      year: 2026, description: "An empty street bathed in amber light.",
      type: "image", wallIndex: 1, posX: -8.82, posY: 2.18, posZ: 3.1, rotationY: Math.PI / 2, wide: true,
    },
    {
      id: 5, title: "Blue Room", artistName: "AI Exhibition Studio",
      year: 2026, description: "A deep blue interior with soft shadows.",
      type: "image", wallIndex: 2, posX: 8.82, posY: 2.18, posZ: -3.8, rotationY: -Math.PI / 2, wide: true,
    },
    {
      id: 6, title: "Stone Light", artistName: "AI Exhibition Studio",
      year: 2026, description: "Light playing across rough stone surfaces.",
      type: "image", wallIndex: 2, posX: 8.82, posY: 2.18, posZ: 4.5, rotationY: -Math.PI / 2, wide: false,
    },
    {
      id: 7, title: "Exit Glow", artistName: "AI Exhibition Studio",
      year: 2026, description: "A luminous exit sign in an otherwise dark corridor.",
      type: "image", wallIndex: 3, posX: 0, posY: 2.18, posZ: 10.82, rotationY: Math.PI, wide: true,
    },
    {
      id: 101, title: "Violet Room Entrance", artistName: null,
      year: null, description: "다음 전시실로 이동합니다.",
      type: "portal", imageUrl: null, contentUrl: "3",
      wallIndex: 2, posX: 8.72, posY: 1.82, posZ: -6.6, rotationY: -Math.PI / 2,
      portalTargetX: -6.5, portalTargetZ: 6.4, portalTargetYaw: -Math.PI / 2,
    },
  ],
};

const fallbackRoom3 = {
  id: 3,
  name: "Violet Gallery",
  cameraY: 5.6,
  wallColor: "#d4cec4",
  floorColor: "#a09888",
  ceilingColor: "#cac4b8",
  ambientLightColor: "#ffffff",
  lightIntensity: 1.0,
  exhibits: [
    {
      id: 31, title: "Violet Passage", artistName: "AI Exhibition Studio",
      year: 2026, description: "Swirling violet gradients and deep indigo shadows.",
      type: "image", wallIndex: 0, posX: -4.9, posY: 2.18, posZ: -10.82, rotationY: 0, wide: false,
    },
    {
      id: 32, title: "Afterimage", artistName: "AI Exhibition Studio",
      year: 2026, description: "A lingering trace of a bright moment.",
      type: "image", wallIndex: 0, posX: 0.2, posY: 2.14, posZ: -10.82, rotationY: 0, wide: true,
    },
    {
      id: 33, title: "Glass Garden", artistName: "AI Exhibition Studio",
      year: 2026, description: "Translucent forms that catch and bend the light.",
      type: "image", wallIndex: 0, posX: 5.2, posY: 2.18, posZ: -10.82, rotationY: 0, wide: false,
    },
    {
      id: 34, title: "Signal Lake", artistName: "AI Exhibition Studio",
      year: 2026, description: "Rippling data streams resolved into a still surface.",
      type: "image", wallIndex: 2, posX: 8.82, posY: 2.18, posZ: 2.2, rotationY: -Math.PI / 2, wide: true,
    },
    {
      id: 35, title: "Return Study", artistName: "AI Exhibition Studio",
      year: 2026, description: "A quiet composition that invites a second look.",
      type: "image", wallIndex: 1, posX: -8.82, posY: 2.18, posZ: -3.2, rotationY: Math.PI / 2, wide: false,
    },
    {
      id: 102, title: "Return to Main Gallery", artistName: null,
      year: null, description: "메인 갤러리로 돌아갑니다.",
      type: "portal", imageUrl: null, contentUrl: "1",
      wallIndex: 1, posX: -8.72, posY: 1.82, posZ: 6.4, rotationY: Math.PI / 2,
      portalTargetX: 6.5, portalTargetZ: -6.6, portalTargetYaw: Math.PI / 2,
    },
  ],
};

export default function GalleryPage() {
  const [currentRoom, setCurrentRoom] = useState(fallbackRoom);
  const [exhibits, setExhibits] = useState(fallbackRoom.exhibits);
  const [selectedArtwork, setSelectedArtwork] = useState(fallbackRoom.exhibits[0]);
  const [docentMessage, setDocentMessage] = useState(
    "작품 가까이 이동하면 AI 도슨트 해설이 표시됩니다.",
  );
  const [nearestExhibit, setNearestExhibit] = useState(null);
  const [nearestDistance, setNearestDistance] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);

  useEffect(() => {
    fetchRoomDetail(1)
      .then((data) => {
        if (data && data.exhibits?.length > 0) {
          setCurrentRoom(data);
          setExhibits(data.exhibits);
          setSelectedArtwork(data.exhibits[0]);
        }
      })
      .catch(() => {
        // use fallback
      });
  }, []);

  const artworkMap = useMemo(
    () => new Map(exhibits.map((exhibit) => [exhibit.id, exhibit])),
    [exhibits],
  );

  const handleArtworkFocus = async (artworkId) => {
    const artwork = artworkMap.get(artworkId);
    if (!artwork || selectedArtwork?.id === artwork.id) return;

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

  const handleProximityUpdate = (nearest) => {
    if (!nearest) {
      setNearestExhibit(null);
      setNearestDistance(null);
      return;
    }
    setNearestExhibit(nearest.exhibit);
    setNearestDistance(nearest.distance);
  };

  const handleRoomChange = async (roomId, targetX, targetZ, targetYaw) => {
    const fallback = Number(roomId) === 3 ? fallbackRoom3 : fallbackRoom;
    try {
      const data = await fetchRoomDetail(roomId);
      if (data && data.exhibits?.length > 0) {
        setCameraTarget({ x: targetX, z: targetZ, yaw: targetYaw });
        setCurrentRoom(data);
        setExhibits(data.exhibits);
        setSelectedArtwork(data.exhibits[0]);
        setDocentMessage("AI 도슨트가 작품 해설을 준비하고 있습니다.");
        setNearestExhibit(null);
        setNearestDistance(null);
        return;
      }
    } catch {
      // fall through to fallback
    }
    setCameraTarget({ x: targetX, z: targetZ, yaw: targetYaw });
    setCurrentRoom(fallback);
    setExhibits(fallback.exhibits);
    setSelectedArtwork(fallback.exhibits[0]);
    setDocentMessage("AI 도슨트가 작품 해설을 준비하고 있습니다.");
    setNearestExhibit(null);
    setNearestDistance(null);
  };

  const roomConfig = useMemo(() => ({
    cameraY: currentRoom.cameraY,
    wallColor: currentRoom.wallColor,
    floorColor: currentRoom.floorColor,
    ceilingColor: currentRoom.ceilingColor,
    ambientLightColor: currentRoom.ambientLightColor,
    lightIntensity: currentRoom.lightIntensity,
  }), [currentRoom]);

  return (
    <main className="gallery-page">
      <section
        className="scene-shell"
        aria-label="3D virtual exhibition gallery"
      >
        <GalleryScene
          exhibits={exhibits}
          roomConfig={roomConfig}
          cameraTarget={cameraTarget}
          onArtworkFocus={handleArtworkFocus}
          onProximityUpdate={handleProximityUpdate}
          onRoomChange={handleRoomChange}
        />
        <RoomHUD
          roomName={currentRoom.name}
          exhibit={nearestExhibit}
          distance={nearestDistance}
        />
        <div className="hud">
          <Compass size={18} aria-hidden="true" />
          <span>WASD + 마우스로 이동</span>
        </div>
      </section>

      <aside className="side-panel">
        <div className="side-panel__header">
          <span className="side-panel__eyebrow">CURATOR NOTE</span>
          <span className="side-panel__status">LIVE</span>
        </div>
        <ArtworkInfoPanel artwork={selectedArtwork} />
        <DocentSpeechBubble message={docentMessage} />
      </aside>
    </main>
  );
}
