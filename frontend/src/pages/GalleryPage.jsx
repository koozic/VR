import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "lucide-react";
import ExhibitInfoPanel from "../components/ExhibitInfoPanel.jsx";
import DocentSpeechBubble from "../components/DocentSpeechBubble.jsx";
import RoomHUD from "../components/RoomHUD.jsx";
import GalleryScene from "../three/GalleryScene.jsx";
import { fetchHallDetail } from "../api/exhibitApi.js";
import { requestDocentExplanation } from "../api/aiApi.js";
import { spaceGalleryModels } from "../three/spaceGalleryDescriptions.js";
import { greekSculptureModels } from "../three/greekSculptureDescriptions.js";
import { retroGameModels } from "../three/retroGameDescriptions.js";

const mainGalleryExhibits = [
  {
    id: 1,
    title: "Silent Horizon",
    creator: "AI Exhibition Studio",
    description: "A quiet landscape that balances empty space and soft light.",
    thumbnailUrl:
      "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-qtie.gif",
    type: "image",
    positionX: -4.8,
    positionY: 2.18,
    positionZ: -10.82,
    rotationY: 0,
    wide: false,
  },
  {
    id: 8,
    title: "Gallery Video",
    description: "전시 소개 영상을 감상할 수 있습니다.",
    type: "youtube",
    contentUrl: "T24rF_x0TmQ",
    positionX: -1.8,
    positionY: 2.18,
    positionZ: -10.82,
    rotationY: 0,
  },
  {
    id: 2,
    title: "Signal Garden",
    creator: "AI Exhibition Studio",
    description: "Digital signals bloom into a shifting garden of color.",
    thumbnailUrl:
      "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/yunyun-yunyun-syndrome.gif",
    type: "image",
    positionX: 3.3,
    positionY: 2.18,
    positionZ: -10.82,
    rotationY: 0,
    wide: true,
  },
  {
    id: 3,
    title: "Green Hour",
    creator: "AI Exhibition Studio",
    description: "A study in calm green light and layered atmosphere.",
    type: "image",
    positionX: -8.82,
    positionY: 2.18,
    positionZ: -4.5,
    rotationY: Math.PI / 2,
    wide: false,
  },
  {
    id: 4,
    title: "Quiet Street",
    creator: "AI Exhibition Studio",
    description: "An empty street holds the stillness of a paused afternoon.",
    type: "image",
    positionX: -8.82,
    positionY: 2.18,
    positionZ: 3.1,
    rotationY: Math.PI / 2,
    wide: true,
  },
  {
    id: 7,
    title: "별이 빛나는 밤에 (The Starry Night)",
    creator: "빈센트 반 고흐 (Vincent van Gogh)",
    description:
      "1889년 작품으로, 요동치는 붓놀림과 강렬한 푸른색, 소용돌이치는 노란 별빛이 특징인 후기 인상주의의 대표작입니다.",
    thumbnailUrl:
      "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/The%20Starry%20Night.jpg",
    type: "image",
    positionX: 0,
    positionY: 2.18,
    positionZ: 10.82,
    rotationY: Math.PI,
    wide: true,
  },
  {
    id: 101,
    title: "우주관 입구",
    description: "다음 전시실로 이동합니다.",
    type: "portal",
    contentUrl: "2",
    positionX: 8.72,
    positionY: 1.82,
    positionZ: -6.6,
    rotationY: -Math.PI / 2,
    portalTargetX: -6.5,
    portalTargetZ: 6.4,
    portalTargetYaw: -Math.PI / 2,
  },
  {
    id: 103,
    title: "역사/예술관 입구",
    description: "역사/예술관으로 이동합니다.",
    type: "portal",
    contentUrl: "3",
    positionX: 8.72,
    positionY: 1.82,
    positionZ: -2.6,
    rotationY: -Math.PI / 2,
    portalTargetX: -6.5,
    portalTargetZ: 0,
    portalTargetYaw: -Math.PI / 2,
    portalColor: 0xf5d4a0,
    ringColor: 0xd4a050,
    ringEmissive: 0x6a4020,
    glowColor: 0xe8b860,
  },
  {
    id: 105,
    title: "레트로 게임관 입구",
    description: "레트로 게임관으로 이동합니다.",
    type: "portal",
    contentUrl: "4",
    positionX: 8.72,
    positionY: 1.82,
    positionZ: 1.4,
    rotationY: -Math.PI / 2,
    portalTargetX: 0,
    portalTargetZ: -7,
    portalTargetYaw: Math.PI,
    portalColor: 0xff6ec7,
    ringColor: 0xd040a0,
    ringEmissive: 0x6a1040,
    glowColor: 0xff40c0,
  },
];

const fallbackHalls = {
  1: {
    id: 1,
    name: "Main Gallery",
    cameraY: 1.6,
    wallColor: "#e8e0d2",
    floorColor: "#9a9488",
    ceilingColor: "#ded8cb",
    ambientLightColor: "#ffffff",
    lightIntensity: 1.18,
    exhibits: mainGalleryExhibits,
  },
  2: {
    id: 2,
    name: "Space Gallery",
    cameraY: 1.6,
    wallColor: "#d4cec4",
    floorColor: "#a09888",
    ceilingColor: "#cac4b8",
    ambientLightColor: "#ffffff",
    lightIntensity: 1,
    exhibits: [
      {
        id: 31,
        title: "Nebula Dream",
        creator: "AI Exhibition Studio",
        description: "A violet cloud of starlight drifts through deep space.",
        type: "image",
        positionX: -4.9,
        positionY: 2.18,
        positionZ: -10.82,
        rotationY: 0,
      },
      {
        id: 32,
        title: "Stellar Drift",
        creator: "AI Exhibition Studio",
        description:
          "Stars stretch across the dark in a slow celestial current.",
        type: "image",
        positionX: 0.2,
        positionY: 2.14,
        positionZ: -10.82,
        rotationY: 0,
        wide: true,
      },
      {
        id: 33,
        title: "Cosmic Dust",
        creator: "AI Exhibition Studio",
        description: "Fine particles glow at the edge of an imagined galaxy.",
        type: "image",
        positionX: 5.2,
        positionY: 2.18,
        positionZ: -10.82,
        rotationY: 0,
      },
      {
        id: 34,
        title: "Star Field",
        creator: "AI Exhibition Studio",
        description: "A dense field of stars opens beyond the gallery wall.",
        type: "image",
        positionX: 8.82,
        positionY: 2.18,
        positionZ: 2.2,
        rotationY: -Math.PI / 2,
        wide: true,
      },
      {
        id: 35,
        title: "Deep Space Signal",
        creator: "AI Exhibition Studio",
        description: "A distant transmission flickers against a dark horizon.",
        type: "image",
        positionX: -8.82,
        positionY: 2.18,
        positionZ: -3.2,
        rotationY: Math.PI / 2,
      },
      {
        id: 102,
        title: "Return to Main Gallery",
        description: "메인 전시실로 돌아갑니다.",
        type: "portal",
        contentUrl: "1",
        positionX: -8.72,
        positionY: 1.82,
        positionZ: 6.4,
        rotationY: Math.PI / 2,
        portalTargetX: 6.5,
        portalTargetZ: -6.6,
        portalTargetYaw: Math.PI / 2,
      },
    ],
  },
  3: {
    id: 3,
    name: "History & Art Gallery",
    cameraY: 1.6,
    wallColor: "#d4c9b8",
    floorColor: "#a89880",
    ceilingColor: "#c4b8a8",
    ambientLightColor: "#f5e6d0",
    lightIntensity: 0.9,
    exhibits: [
      {
        id: 104,
        title: "Return to Main Gallery",
        description: "메인 전시실로 돌아갑니다.",
        type: "portal",
        contentUrl: "1",
        positionX: -8.72,
        positionY: 1.82,
        positionZ: 0,
        rotationY: Math.PI / 2,
        portalTargetX: 6.5,
        portalTargetZ: 0,
        portalTargetYaw: Math.PI / 2,
        portalColor: 0xf5d4a0,
        ringColor: 0xd4a050,
        ringEmissive: 0x6a4020,
        glowColor: 0xe8b860,
      },
    ],
  },
  4: {
    id: 4,
    name: "Retro Game Hall",
    cameraY: 1.6,
    wallColor: "#1a0a1e",
    floorColor: "#0d0810",
    ceilingColor: "#08040a",
    ambientLightColor: "#604080",
    lightIntensity: 0.5,
    exhibits: [
      {
        id: 41,
        title: retroGameModels[0].title,
        creator: retroGameModels[0].creator,
        description: retroGameModels[0].description,
        type: "game",
        contentUrl: retroGameModels[0].gameUrl,
        positionX: 8.82,
        positionY: 2.0,
        positionZ: 0,
        rotationY: -Math.PI / 2,
      },
      {
        id: 42,
        title: retroGameModels[1].title,
        creator: retroGameModels[1].creator,
        description: retroGameModels[1].description,
        type: "game",
        contentUrl: retroGameModels[1].gameUrl,
        popup: retroGameModels[1].popup,
        positionX: 0,
        positionY: 2.0,
        positionZ: 10.82,
        rotationY: Math.PI,
      },
      {
        id: 43,
        title: retroGameModels[2].title,
        creator: retroGameModels[2].creator,
        description: retroGameModels[2].description,
        type: "game",
        contentUrl: retroGameModels[2].gameUrl,
        positionX: -8.82,
        positionY: 2.0,
        positionZ: 0,
        rotationY: Math.PI / 2,
      },
      {
        id: 106,
        title: "Return to Main Gallery",
        description: "메인 전시실로 돌아갑니다.",
        type: "portal",
        contentUrl: "1",
        positionX: 0,
        positionY: 1.82,
        positionZ: -10.82,
        rotationY: 0,
        portalTargetX: 6.5,
        portalTargetZ: 1.4,
        portalTargetYaw: Math.PI / 2,
        portalColor: 0xff6ec7,
        ringColor: 0xd040a0,
        ringEmissive: 0x6a1040,
        glowColor: 0xff40c0,
      },
    ],
  },
};

const solarSystemExhibit = spaceGalleryModels[0];
const firstGreekExhibit = greekSculptureModels[0];

export default function GalleryPage() {
  const [currentHall, setCurrentHall] = useState(fallbackHalls[1]);
  const [exhibits, setExhibits] = useState(mainGalleryExhibits);
  const [selectedExhibit, setSelectedExhibit] = useState(
    mainGalleryExhibits[0],
  );
  const [docentMessage, setDocentMessage] = useState(
    "작품 가까이 이동하면 AI 도슨트가 해설을 시작합니다.",
  );
  const [docentSource, setDocentSource] = useState("idle");
  const [proximity, setProximity] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const requestedExhibitIdRef = useRef(null);

  const applyHall = (hall) => {
    const mergedExhibits = hall.exhibits.map((ex) => {
      if (ex.thumbnailUrl && ex.title && !ex.title.includes("Starry Night"))
        return ex;
      if (ex.title && ex.title.includes("Starry Night")) {
        return {
          ...ex,
          thumbnailUrl:
            "https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/The%20Starry%20Night.jpg",
        };
      }
      return ex;
    });
    setCurrentHall(hall);
    setExhibits(mergedExhibits);
    setSelectedExhibit(
      Number(hall.id) === 2
        ? solarSystemExhibit
        : Number(hall.id) === 3
          ? firstGreekExhibit
          : Number(hall.id) === 4
            ? null
            : mergedExhibits.find((exhibit) => exhibit.type !== "portal") || null,
    );
    if (Number(hall.id) === 2) {
      setDocentMessage(solarSystemExhibit.description);
      setDocentSource("stored");
    } else if (Number(hall.id) === 3) {
      setDocentMessage(firstGreekExhibit.description);
      setDocentSource("stored");
    } else if (Number(hall.id) === 4) {
      setDocentMessage("🕹️ 레트로 게임관에 오신 것을 환영합니다! 전시된 게임에 가까이 다가가면 상세 정보와 함께 플레이할 수 있습니다.");
      setDocentSource("stored");
    }
    requestedExhibitIdRef.current = null;
  };

  useEffect(() => {
    fetchHallDetail(1)
      .then(applyHall)
      .catch(() => {});
  }, []);

  const exhibitMap = useMemo(
    () => new Map(exhibits.map((exhibit) => [exhibit.id, exhibit])),
    [exhibits],
  );

  const handleExhibitFocus = async (exhibitId) => {
    let exhibit = exhibitMap.get(exhibitId);
    if (!exhibit && Number.isNaN(Number(exhibitId))) {
      exhibit = spaceGalleryModels.find((m) => `model-${m.id}` === exhibitId)
        || greekSculptureModels.find((m) => `model-${m.id}` === exhibitId)
        || null;
    }
    if (!exhibit || requestedExhibitIdRef.current === exhibit.id) return;

    requestedExhibitIdRef.current = exhibit.id;
    setSelectedExhibit(exhibit);
    setDocentMessage("AI 도슨트가 작품 해설을 준비하고 있습니다.");
    setDocentSource("loading");

    try {
      const explanation = await requestDocentExplanation(exhibit);
      if (explanation.generated === false) {
        setDocentMessage(exhibit.description || explanation.message);
        setDocentSource("stored");
      } else {
        setDocentMessage(explanation.message);
        setDocentSource("generated");
      }
    } catch {
      requestedExhibitIdRef.current = null;
      setDocentMessage(exhibit.description || "저장된 작품 소개문이 없습니다.");
      setDocentSource("stored");
    }
  };

  const handleGameLaunch = (exhibit) => {
    if (exhibit.popup) {
      window.open(exhibit.contentUrl, 'tetrio', 'width=960,height=720,scrollbars=no');
    } else {
      setActiveGame(exhibit);
    }
  };
  const handleGameClose = () => setActiveGame(null);

  const handleRoomChange = async (roomId, x, z, yaw) => {
    const fallback = fallbackHalls[Number(roomId)] || fallbackHalls[1];
    try {
      applyHall(await fetchHallDetail(roomId));
    } catch {
      applyHall(fallback);
    }
    setCameraTarget({ x, z, yaw });
    setProximity(null);
  };

  return (
    <main className="gallery-page">
      <section
        className="scene-shell"
        aria-label="3D virtual exhibition gallery"
      >
        <GalleryScene
          exhibits={exhibits}
          roomConfig={currentHall}
          onExhibitFocus={handleExhibitFocus}
          onProximityUpdate={setProximity}
          onRoomChange={handleRoomChange}
          cameraTarget={cameraTarget}
        />
        <RoomHUD
          roomName={currentHall.name}
          exhibit={proximity?.exhibit}
          distance={proximity?.distance}
        />
        <div className="hud">
          <Compass size={18} aria-hidden="true" />
          <span>WASD 또는 방향키로 이동</span>
        </div>
      </section>

      <aside className="side-panel">
        <ExhibitInfoPanel exhibit={selectedExhibit} onGameLaunch={handleGameLaunch} />
        <DocentSpeechBubble message={docentMessage} source={docentSource} />
      </aside>

      {activeGame && (
        <div className="game-modal" onClick={handleGameClose}>
          <div className="game-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="game-modal__header">
              <span className="game-modal__title">{activeGame.title}</span>
              <button className="game-modal__close" onClick={handleGameClose}>✕</button>
            </div>
            <iframe
              className="game-modal__iframe"
              src={activeGame.contentUrl}
              title={activeGame.title}
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      )}
    </main>
  );
}
