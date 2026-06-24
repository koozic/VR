import * as THREE from "three";
import { syncRemoteVisitors } from "./syncRemoteVisitors.js";

export async function measureRemoteVisitorBatches(visitorCount) {
  const localPosition = new THREE.Vector3(0, 1.6, 0);
  const makeUsers = (prefix) =>
    Array.from({ length: visitorCount }, (_, index) => ({
      userId: `${prefix}-${index}`,
      nickname: `Visitor ${index + 1}`,
      x: (index % 6) * 1.2 - 3,
      y: 1.6,
      z: Math.floor(index / 6) * 1.2 - 2,
      yaw: (index % 8) * 0.25,
      voiceSpeaking: index % 4 === 0,
      emote: index % 5 === 0 ? "WAVE" : null,
      emoteReceivedAt: index % 5 === 0 ? Date.now() : 0,
    }));

  const waitForLoaded = async (objectMap, expectedCount) => {
    const startedAt = performance.now();
    while (performance.now() - startedAt < 30_000) {
      const loaded = [...objectMap.values()].filter((group) => group.userData.modelLoaded).length;
      if (loaded >= expectedCount) {
        return {
          loaded,
          timedOut: false,
          waitMs: performance.now() - startedAt,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return {
      loaded: [...objectMap.values()].filter((group) => group.userData.modelLoaded).length,
      timedOut: true,
      waitMs: performance.now() - startedAt,
    };
  };

  const measuredResources = () =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => /\.(glb|gltf|bin)(\?|$)/i.test(entry.name) || /\/assets\/draco\//i.test(entry.name))
      .map((entry) => entry.name);

  const runBatch = async (label, users) => {
    const scene = new THREE.Scene();
    const objectMap = new Map();
    performance.clearResourceTimings();
    const startedAt = performance.now();
    syncRemoteVisitors(scene, objectMap, users, localPosition);
    const loadState = await waitForLoaded(objectMap, users.length);
    const totalMs = performance.now() - startedAt;
    const mixerCount = [...objectMap.values()].filter((group) => group.userData.animMixer).length;
    const modelLoadedCount = [...objectMap.values()].filter((group) => group.userData.modelLoaded).length;
    const sceneChildrenBeforeCleanup = scene.children.length;
    const resourceUrls = measuredResources();

    const cleanupStartedAt = performance.now();
    syncRemoteVisitors(scene, objectMap, [], localPosition);

    return {
      label,
      totalMs,
      loadWaitMs: loadState.waitMs,
      timedOut: loadState.timedOut,
      loaded: loadState.loaded,
      modelLoadedCount,
      mixerCount,
      sceneChildrenBeforeCleanup,
      sceneChildrenAfterCleanup: scene.children.length,
      objectMapSizeAfterCleanup: objectMap.size,
      cleanupMs: performance.now() - cleanupStartedAt,
      resourceUrls,
    };
  };

  const primaryUsers = makeUsers("primary-character");
  const secondaryUsers = makeUsers("secondary-character");
  const coldPrimary = await runBatch("primary ids cold", primaryUsers);
  const warmPrimary = await runBatch("primary ids warm", primaryUsers);
  const coldSecondary = await runBatch("secondary ids cold", secondaryUsers);
  const warmSecondary = await runBatch("secondary ids warm", secondaryUsers);

  return {
    visitorCount,
    phases: [coldPrimary, warmPrimary, coldSecondary, warmSecondary],
  };
}
