import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "lucide-react";
import CuratorChatHistory from "../components/CuratorChatHistory.jsx";
import CuratorConversationOptions from "../components/CuratorConversationOptions.jsx";
import ExhibitInfoPanel from "../components/ExhibitInfoPanel.jsx";
import DocentSpeechBubble from "../components/DocentSpeechBubble.jsx";
import GallerySocialPanel from "../components/GallerySocialPanel.jsx";
import GalleryVoiceChat from "../components/GalleryVoiceChat.jsx";
import RoomHUD from "../components/RoomHUD.jsx";
import VoiceDocentControl from "../components/VoiceDocentControl.jsx";
import GalleryScene from "../three/GalleryScene.jsx";
import { fetchHallDetail } from "../api/exhibitApi.js";
import {
  requestDocentExplanation,
  submitWebLlmDocentExplanation,
} from "../api/aiApi.js";
import {
  generateWebLlmDocentResponse,
  getWebLlmModelId,
} from "../api/webLlmApi.js";
import { galleryEmoteLabel } from "../realtime/galleryEmotes.js";
import { useGalleryPresence } from "../realtime/useGalleryPresence.js";
import { useGalleryVoiceChat } from "../realtime/useGalleryVoiceChat.js";
import { spaceGalleryModels } from "../three/spaceGalleryDescriptions.js";
import { greekSculptureModels } from "../three/greekSculptureDescriptions.js";
import { retroGameModels } from "../three/retroGameDescriptions.js";
import {
  fallbackHalls as sharedFallbackHalls,
  mainGalleryExhibits as sharedMainGalleryExhibits,
  mergeHallWithSeed,
} from "../data/gallerySeed.js";
import { getPanelState } from "../three/createYouTubePanel.js";
import { useCuratorSession } from "../curator/CuratorSessionContext.jsx";

const solarSystemExhibit = spaceGalleryModels[0];
const firstGreekExhibit = greekSculptureModels[0];
const firstRetroExhibit = retroGameModels[0];

function hasDatabaseExhibitId(exhibit) {
  const id = Number(exhibit?.id);
  return Number.isSafeInteger(id) && id > 0;
}

function createMessageContext(hall, exhibit) {
  return {
    hallId: hall?.id,
    hallName: hall?.name,
    exhibitId: exhibit?.id,
    exhibitTitle: exhibit?.title,
    exhibitType: exhibit?.type,
  };
}

export default function GalleryPage() {
  const [currentHall, setCurrentHall] = useState(sharedFallbackHalls[1]);
  const [exhibits, setExhibits] = useState(sharedMainGalleryExhibits);
  const [selectedExhibit, setSelectedExhibit] = useState(
    sharedMainGalleryExhibits[0],
  );
  const [docentMessage, setDocentMessage] = useState(
    "작품 가까이 이동하면 저장된 소개문과 질문 선택지를 보여드립니다.",
  );
  const [docentSource, setDocentSource] = useState("idle");
  const [proximity, setProximity] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [youtubeMuted, setYoutubeMuted] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [lastDocentRequest, setLastDocentRequest] = useState(null);
  const [isLoadingGalleryRuntime, setIsLoadingGalleryRuntime] = useState(false);
  const requestedExhibitIdRef = useRef(null);
  const docentRequestControllerRef = useRef(null);
  const latestUserPositionRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const { messages, addMessage, clearMessages } = useCuratorSession();
  const {
    connected,
    connectionStatus,
    localUserId,
    remoteUsers,
    socialMessages,
    restoredPose,
    latestEmote,
    voiceReadyUserIds,
    sendLocalPose,
    sendChatMessage,
    sendEmote,
    sendSignal,
    sendVoiceState,
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
    voiceReadyUserIds,
    sendSignal,
    sendVoiceState,
    lastSignal,
    lastVoiceReady,
  });

  useEffect(() => {
    if (!restoredPose || Number(restoredPose.hallId) !== Number(currentHall.id)) {
      return;
    }
    setCameraTarget({
      x: restoredPose.x,
      z: restoredPose.z,
      yaw: restoredPose.yaw,
    });
  }, [currentHall.id, restoredPose]);

  const abortPendingDocentRequest = () => {
    requestSequenceRef.current += 1;
    docentRequestControllerRef.current?.abort();
    docentRequestControllerRef.current = null;
  };

  const handleCancelDocentRequest = () => {
    abortPendingDocentRequest();
    setDocentMessage(
      "요청을 중단했습니다. 다른 질문을 선택하거나 직접 입력할 수 있습니다.",
    );
    setDocentSource("idle");
  };

  const createLocalContext = (exhibit, userQuestion) => ({
    exhibitId: hasDatabaseExhibitId(exhibit) ? Number(exhibit.id) : undefined,
    title: exhibit?.title,
    creator: exhibit?.creator,
    description: exhibit?.description,
    keywords:
      exhibit?.keywords ||
      [exhibit?.period, exhibit?.material, exhibit?.location].filter(Boolean),
    exampleText: exhibit?.exampleText,
    userQuestion,
  });

  const generateLocalExplanation = async (
    localContext,
    { conversationMessages, signal } = {},
  ) => {
    const localMessage = await generateWebLlmDocentResponse(localContext, {
      conversationMessages,
      onProgress: (message) => {
        setDocentMessage(message || "브라우저 AI 모델을 준비하고 있습니다.");
      },
    });

    try {
      return await submitWebLlmDocentExplanation({
        message: localMessage,
        modelId: getWebLlmModelId(),
        localContext,
        signal,
      });
    } catch (error) {
      if (error.name === "AbortError") throw error;
      return {
        message: localMessage,
        generated: true,
        status: "GENERATED",
        provider: "WEB_LLM",
      };
    }
  };

  const requestInitialExplanation = async (
    exhibit,
    options = {},
    conversationMessages = [],
  ) => {
    const explanation = await requestDocentExplanation(exhibit, options);
    if (explanation.generated !== false) {
      return explanation;
    }

    const localContext =
      explanation.localContext ||
      createLocalContext(exhibit, options.userQuestion);
    setDocentMessage("외부 AI를 사용할 수 없어 브라우저 AI로 전환합니다.");
    setDocentSource("loading");
    return generateLocalExplanation(localContext, {
      conversationMessages,
      signal: options.signal,
    });
  };

  const applyHall = (hall) => {
    const mergedHall = mergeHallWithSeed(hall);
    const visibleExhibits = mergedHall.exhibits || [];
    const defaultExhibit =
      Number(hall.id) === 2
        ? solarSystemExhibit
        : Number(hall.id) === 3
          ? firstGreekExhibit
          : Number(hall.id) === 4
            ? null
            : visibleExhibits.find((exhibit) => exhibit.type !== "portal") ||
              null;
    setCurrentHall(mergedHall);
    setExhibits(visibleExhibits);
    setYoutubeMuted(true);
    setSelectedExhibit(defaultExhibit);
    if (defaultExhibit) {
      setDocentMessage(
        defaultExhibit.description ||
          "이 전시물에는 아직 저장된 설명문이 없습니다.",
      );
      setDocentSource("stored");
    } else {
      setDocentMessage(
        "🕹️ 레트로 게임관에 오신 것을 환영합니다! 전시된 게임에 가까이 다가가면 상세 정보와 함께 플레이할 수 있습니다.",
      );
      setDocentSource("stored");
    }
    requestedExhibitIdRef.current = null;
  };

  useEffect(() => {
    fetchHallDetail(1)
      .then(applyHall)
      .catch(() => {});

    return () => {
      abortPendingDocentRequest();
    };
  }, []);

  const exhibitMap = useMemo(
    () => new Map(exhibits.map((exhibit) => [exhibit.id, exhibit])),
    [exhibits],
  );

  /* 작품 접근 시 저장 설명문만 표시하고 AI 요청은 사용자 선택 이후에 수행 */
  const handleExhibitFocus = (exhibitId, focusContext = {}) => {
    let exhibit = exhibitMap.get(exhibitId);
    if (!exhibit && Number.isNaN(Number(exhibitId))) {
      exhibit =
        spaceGalleryModels.find((m) => `model-${m.id}` === exhibitId) ||
        greekSculptureModels.find((m) => `model-${m.id}` === exhibitId) ||
        retroGameModels.find((m) => `model-${m.id}` === exhibitId) ||
        null;
    }
    if (!exhibit || requestedExhibitIdRef.current === exhibit.id) return;

    requestedExhibitIdRef.current = exhibit.id;
    abortPendingDocentRequest();
    if (focusContext.userPosition) {
      latestUserPositionRef.current = focusContext.userPosition;
    }
    setSelectedExhibit(exhibit);
    setYoutubeMuted(true);
    const storedDescription =
      exhibit.description || "이 전시물에는 아직 저장된 설명문이 없습니다.";
    setDocentMessage(storedDescription);
    setDocentSource("stored");
  };

  const handleToggleMute = () => {
    const state = getPanelState(selectedExhibit?.contentUrl);
    state?.toggleMute();
    setYoutubeMuted((v) => !v);
  };

  const handleGameLaunch = (exhibit) => {
    if (exhibit.popup) {
      window.open(
        exhibit.contentUrl,
        "tetrio",
        "width=960,height=720,scrollbars=no",
      );
    } else {
      setActiveGame(exhibit);
    }
  };
  const handleGameClose = () => setActiveGame(null);

  const handleRoomChange = async (roomId, x, z, yaw) => {
    abortPendingDocentRequest();
    const fallback =
      sharedFallbackHalls[Number(roomId)] || sharedFallbackHalls[1];
    try {
      applyHall(await fetchHallDetail(roomId));
    } catch {
      applyHall(fallback);
    }
    setCameraTarget({ x, z, yaw });
    setProximity(null);
  };

  /* 유저가 텍스트/음성으로 질문 → AI 도슨트에 전달 */
  const handleDocentQuestion = async (
    userQuestion,
    {
      source = "text",
      displayQuestion = userQuestion,
      route = source === "option" ? "external" : "local",
    } = {},
  ) => {
    if (!selectedExhibit) {
      return;
    }

    const messageContext = createMessageContext(currentHall, selectedExhibit);
    setLastDocentRequest({ userQuestion, displayQuestion, source, route });
    addMessage({
      role: "user",
      source,
      content: displayQuestion,
      context: messageContext,
    });
    abortPendingDocentRequest();
    const requestSequence = requestSequenceRef.current;
    setDocentMessage("질문을 바탕으로 AI 도슨트가 답변을 준비하고 있습니다.");
    setDocentSource("loading");

    const controller = new AbortController();
    docentRequestControllerRef.current = controller;

    try {
      const explanation =
        route === "external"
          ? await requestInitialExplanation(
              selectedExhibit,
              {
                userQuestion,
                hallId: currentHall.id,
                maxDistance: 4.5,
                signal: controller.signal,
              },
              messages,
            )
          : await generateLocalExplanation(
              createLocalContext(selectedExhibit, userQuestion),
              {
                conversationMessages: messages,
                signal: controller.signal,
              },
            );

      if (requestSequence !== requestSequenceRef.current) return;
      docentRequestControllerRef.current = null;
      if (explanation.generated === false) {
        const responseMessage =
          explanation.message ||
          "AI 도슨트 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";
        setDocentMessage(responseMessage);
        setDocentSource("error");
        addMessage({
          role: "assistant",
          source: "error",
          content: responseMessage,
          context: messageContext,
        });
      } else {
        setDocentMessage(explanation.message);
        setDocentSource("generated");
        addMessage({
          role: "assistant",
          source:
            explanation.provider === "WEB_LLM" ? "web-llm" : "external-api",
          content: explanation.message,
          context: messageContext,
        });
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      if (requestSequence !== requestSequenceRef.current) return;

      docentRequestControllerRef.current = null;
      requestedExhibitIdRef.current = null;
      setDocentMessage(
        error.message ||
          "AI 도슨트 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setDocentSource("error");
      addMessage({
        role: "assistant",
        source: "error",
        content:
          error.message ||
          "AI 응답을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        context: messageContext,
      });
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
          onLoadingChange={setIsLoadingGalleryRuntime}
          onLocalPoseChange={(pose) => {
            latestUserPositionRef.current = {
              x: pose.x,
              y: pose.y,
              z: pose.z,
            };
            sendLocalPose(pose);
          }}
        />
        {isLoadingGalleryRuntime && (
          <div className="gallery-loading-overlay">
            <div className="gallery-loading-spinner">
              <div className="spinner"></div>
              <p>전시관 로딩 중...</p>
            </div>
          </div>
        )}
        <RoomHUD
          roomName={currentHall.name}
          exhibit={proximity?.exhibit}
          distance={proximity?.distance}
        />
        <div className="hud">
          <Compass size={18} aria-hidden="true" />
          <span>WASD 또는 방향키로 이동</span>
        </div>
        {latestEmote && (
          <div className="gallery-emote-toast" role="status" aria-live="polite">
            <strong>
              {latestEmote.userId === localUserId ? "나" : "다른 관람객"}
            </strong>
            <span>{galleryEmoteLabel(latestEmote.emote)}</span>
          </div>
        )}
      </section>

      <aside className="side-panel">
        <div className="side-panel__header">
          <span className="side-panel__eyebrow">LIVE GALLERY</span>
          <span
            className={`side-panel__status side-panel__status--${connectionStatus}`}
          >
            {connectionStatus === "connected"
              ? `${remoteUsers.length + 1}명 접속`
              : connectionStatus === "reconnecting"
                ? "재연결 중"
                : "연결 중"}
          </span>
        </div>
        <ExhibitInfoPanel
          exhibit={selectedExhibit}
          onGameLaunch={handleGameLaunch}
          onToggleMute={handleToggleMute}
          isMuted={youtubeMuted}
        />
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
        <GallerySocialPanel
          connected={connected}
          localUserId={localUserId}
          messages={socialMessages}
          onSendMessage={sendChatMessage}
          onSendEmote={sendEmote}
        />
        <DocentSpeechBubble
          message={docentMessage}
          source={docentSource}
          onCancel={handleCancelDocentRequest}
          onRetry={
            lastDocentRequest
              ? () =>
                  handleDocentQuestion(lastDocentRequest.userQuestion, {
                    source: "retry",
                    displayQuestion: lastDocentRequest.displayQuestion,
                    route: lastDocentRequest.route,
                  })
              : undefined
          }
        />
        <CuratorConversationOptions
          exhibit={selectedExhibit}
          disabled={!selectedExhibit || docentSource === "loading"}
          onSelect={(option) =>
            handleDocentQuestion(option.prompt, {
              source: "option",
              displayQuestion: option.label,
            })
          }
        />
        <CuratorChatHistory messages={messages} onClear={clearMessages} />
        <VoiceDocentControl
          disabled={!selectedExhibit || docentSource === "loading"}
          onQuestion={handleDocentQuestion}
        />
      </aside>

      {activeGame && (
        <div className="game-modal" onClick={handleGameClose}>
          <div
            className="game-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="game-modal__header">
              <span className="game-modal__title">{activeGame.title}</span>
              <button className="game-modal__close" onClick={handleGameClose}>
                ✕
              </button>
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
