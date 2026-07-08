import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { fallbackHalls } from "../data/gallerySeed.js";
import GalleryScene from "./GalleryScene.jsx";

function GallerySceneHarness({ events, registerSetHallId, registerSetHall }) {
  const [hall, setHall] = useState(fallbackHalls[1]);

  registerSetHallId((nextHallId) => {
    setHall(fallbackHalls[Number(nextHallId)] || fallbackHalls[1]);
  });

  registerSetHall((nextHall) => {
    setHall(nextHall || fallbackHalls[1]);
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
  let setHall = () => {};

  root.render(
    <GallerySceneHarness
      events={events}
      registerSetHallId={(handler) => {
        setHallId = handler;
      }}
      registerSetHall={(handler) => {
        setHall = handler;
      }}
    />,
  );

  return {
    setHallId(nextHallId) {
      setHallId(nextHallId);
    },
    setHall(nextHall) {
      setHall(nextHall);
    },
    getEvents() {
      return [...events];
    },
    unmount() {
      root.unmount();
    },
  };
}
