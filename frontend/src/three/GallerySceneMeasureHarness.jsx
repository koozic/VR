import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { fallbackHalls } from "../data/gallerySeed.js";
import GalleryScene from "./GalleryScene.jsx";

function GallerySceneHarness({ events, registerSetHallId }) {
  const [hallId, setHallId] = useState(1);
  const hall = fallbackHalls[Number(hallId)] || fallbackHalls[1];

  registerSetHallId((nextHallId) => {
    setHallId(Number(nextHallId));
  });

  return (
    <GalleryScene
      exhibits={hall.exhibits}
      roomConfig={hall}
      onExhibitFocus={() => {}}
      onProximityUpdate={() => {}}
      onRoomChange={() => {}}
      onLocalPoseChange={() => {}}
      onLoadingChange={(loading) => {
        events.push({
          type: "loading",
          hallId: Number(hall.id),
          loading,
          at: performance.now(),
        });
      }}
      cameraTarget={null}
      remoteUsers={[]}
    />
  );
}

export function mountGallerySceneMeasureHarness(container) {
  const root = createRoot(container);
  const events = [];
  let setHallId = () => {};

  root.render(
    <GallerySceneHarness
      events={events}
      registerSetHallId={(handler) => {
        setHallId = handler;
      }}
    />,
  );

  return {
    setHallId(nextHallId) {
      setHallId(nextHallId);
    },
    getEvents() {
      return [...events];
    },
    unmount() {
      root.unmount();
    },
  };
}
