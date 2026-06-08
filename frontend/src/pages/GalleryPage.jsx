import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "lucide-react";
import ExhibitInfoPanel from "../components/ExhibitInfoPanel.jsx";
import DocentSpeechBubble from "../components/DocentSpeechBubble.jsx";
import GalleryVoiceChat from "../components/GalleryVoiceChat.jsx";
import RoomHUD from "../components/RoomHUD.jsx";
import VoiceDocentControl from "../components/VoiceDocentControl.jsx";
import GalleryScene from "../three/GalleryScene.jsx";
import { fetchHallDetail } from "../api/exhibitApi.js";
import { requestDocentExplanation } from "../api/aiApi.js";
import { useGalleryPresence } from "../realtime/useGalleryPresence.js";
import { useGalleryVoiceChat } from "../realtime/useGalleryVoiceChat.js";
import { spaceGalleryModels } from "../three/spaceGalleryDescriptions.js";
import { greekSculptureModels } from "../three/greekSculptureDescriptions.js";
import {
  fallbackHalls as sharedFallbackHalls,
  mainGalleryExhibits as sharedMainGalleryExhibits,
  mergeHallWithSeed,
} from "../data/gallerySeed.js";
import { getPanelState } from "../three/createYouTubePanel.js";

const solarSystemExhibit = spaceGalleryModels[0];
const firstGreekExhibit = greekSculptureModels[0];

export default function GalleryPage() {
  const [currentHall, setCurrentHall] = useState(sharedFallbackHalls[1]);
  const [exhibits, setExhibits] = useState(sharedMainGalleryExhibits);
  const [selectedExhibit, setSelectedExhibit] = useState(
    sharedMainGalleryExhibits[0],
  );
  const [docentMessage, setDocentMessage] = useState(
    "작품 가까이 이동하면 AI 도슨트가 해설을 시작합니다.",
  );
  const [docentSource, setDocentSource] = useState("idle");
  const [proximity, setProximity] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [youtubeMuted, setYoutubeMuted] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const requestedExhibitIdRef = useRef(null);
  const {
    connected,
    localUserId,
    remoteUsers,
    sendLocalPose,
    sendSignal,
    sendVoiceReady,
    lastSignal,
    lastVoiceReady,
  } = useGalleryPresence(currentHall.id);
  const {
    muted,
    localReady,
    remoteStreams,
    error: voiceError,
    toggleMuted,
  } = useGalleryVoiceChat({
    enabled: voiceEnabled && connected,
    localUserId,
    remoteUsers,
    sendSignal,
    sendVoiceReady,
    lastSignal,
    lastVoiceReady,
  });

  const applyHall = (hall) => {
    const mergedHall = mergeHallWithSeed(hall);
    const visibleExhibits = mergedHall.exhibits || [];
    setCurrentHall(mergedHall);
    setExhibits(visibleExhibits);
    setYoutubeMuted(true);
    setSelectedExhibit(
      Number(hall.id) === 2
        ? solarSystemExhibit
        : Number(hall.id) === 3
          ? firstGreekExhibit
          : Number(hall.id) === 4
            ? null
            : visibleExhibits.find((exhibit) => exhibit.type !== "portal") || null,
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
    setYoutubeMuted(true);
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

  const handleToggleMute = () => {
    const state = getPanelState(selectedExhibit?.contentUrl);
    state?.toggleMute();
    setYoutubeMuted((v) => !v);
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
    const fallback = sharedFallbackHalls[Number(roomId)] || sharedFallbackHalls[1];
    try {
      applyHall(await fetchHallDetail(roomId));
    } catch {
      applyHall(fallback);
    }
    setCameraTarget({ x, z, yaw });
    setProximity(null);
  };

  const handleDocentQuestion = async (userQuestion) => {
    if (!selectedExhibit) {
      return;
    }

    setDocentMessage("질문을 바탕으로 AI 도슨트가 답변을 준비하고 있습니다.");
    setDocentSource("loading");

    try {
      const explanation = await requestDocentExplanation(selectedExhibit, { userQuestion });
      if (explanation.generated === false) {
        setDocentMessage(selectedExhibit.description || explanation.message);
        setDocentSource("stored");
      } else {
        setDocentMessage(explanation.message);
        setDocentSource("generated");
      }
    } catch {
      setDocentMessage(selectedExhibit.description || "질문에 대한 답변을 가져오지 못했습니다.");
      setDocentSource("stored");
    }
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
          remoteUsers={remoteUsers}
          onLocalPoseChange={sendLocalPose}
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
        <div className="side-panel__header">
          <span className="side-panel__eyebrow">LIVE GALLERY</span>
          <span className={connected ? "side-panel__status" : "side-panel__status side-panel__status--offline"}>
            {remoteUsers.length + 1}명 접속
          </span>
        </div>
        <ExhibitInfoPanel exhibit={selectedExhibit} onGameLaunch={handleGameLaunch} onToggleMute={handleToggleMute} isMuted={youtubeMuted} />
        <GalleryVoiceChat
          enabled={voiceEnabled && connected}
          connected={connected}
          muted={muted}
          localReady={localReady}
          remoteStreams={remoteStreams}
          error={voiceError}
          onToggleEnabled={() => setVoiceEnabled((value) => !value)}
          onToggleMuted={toggleMuted}
        />
        <DocentSpeechBubble message={docentMessage} source={docentSource} />
        <VoiceDocentControl
          disabled={!selectedExhibit || docentSource === "loading"}
          onQuestion={handleDocentQuestion}
        />
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
